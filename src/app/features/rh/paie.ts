import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface BulletinPaie {
  id?: number;
  employe_id: number;
  employe_nom?: string;
  periode: string;
  date_emission: string;
  salaire_base: number;
  primes: Prime[];
  indemnites: Indemnite[];
  cotisations: Cotisation[];
  avantages: Avantage[];
  deductions: Deduction[];
  
  salaire_brut: number;
  salaire_net: number;
  total_cotisations: number;
  net_a_payer: number;
  
  statut: 'brouillon' | 'valide' | 'paye';
  date_paiement?: string;
  mode_paiement?: string;
  reference_paiement?: string;
  notes?: string;
}

interface Prime {
  libelle: string;
  montant: number;
  type: 'fixe' | 'pourcentage';
}

interface Indemnite {
  libelle: string;
  montant: number;
}

interface Cotisation {
  libelle: string;
  taux: number;
  montant: number;
  type: 'salarial' | 'patronal';
}

interface Avantage {
  libelle: string;
  montant: number;
}

interface Deduction {
  libelle: string;
  montant: number;
}

@Component({
  selector: 'app-paie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="paie-container">
      <div class="header">
        <div>
          <h1>Paie</h1>
          <p class="subtitle">{{ bulletins.length }} bulletin(s) • Total net: {{ totalNet | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau bulletin</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} bulletin de paie</h3>
        <form (ngSubmit)="saveBulletin()" #bulletinForm="ngForm">
          <!-- Onglets -->
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'salaire'" (click)="activeTab = 'salaire'">Salaire</button>
            <button type="button" [class.active]="activeTab === 'cotisations'" (click)="activeTab = 'cotisations'">Cotisations</button>
            <button type="button" [class.active]="activeTab === 'avantages'" (click)="activeTab = 'avantages'">Avantages</button>
          </div>

          <!-- Onglet Informations -->
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Employé *</label>
                <select [(ngModel)]="currentBulletin.employe_id" name="employe_id" required (change)="onEmployeChange()">
                  <option value="">Sélectionner un employé</option>
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }} - {{ e.poste }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Période *</label>
                <input type="month" [(ngModel)]="currentBulletin.periode" name="periode" required>
              </div>
              <div class="form-group">
                <label>Date d'émission</label>
                <input type="date" [(ngModel)]="currentBulletin.date_emission" name="date_emission">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentBulletin.statut" name="statut">
                  <option value="brouillon">Brouillon</option>
                  <option value="valide">Validé</option>
                  <option value="paye">Payé</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentBulletin.statut === 'paye'">
                <label>Date de paiement</label>
                <input type="date" [(ngModel)]="currentBulletin.date_paiement" name="date_paiement">
              </div>
              <div class="form-group" *ngIf="currentBulletin.statut === 'paye'">
                <label>Mode de paiement</label>
                <select [(ngModel)]="currentBulletin.mode_paiement" name="mode_paiement">
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentBulletin.statut === 'paye'">
                <label>Référence paiement</label>
                <input type="text" [(ngModel)]="currentBulletin.reference_paiement" name="reference_paiement">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentBulletin.notes" name="notes" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Onglet Salaire -->
          <div *ngIf="activeTab === 'salaire'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Salaire de base</label>
                <input type="number" [(ngModel)]="currentBulletin.salaire_base" name="salaire_base" readonly>
              </div>
              
              <div class="full-width">
                <h4>Primes</h4>
                <div *ngFor="let prime of currentBulletin.primes; let i = index" class="ligne-form">
                  <input type="text" [(ngModel)]="prime.libelle" [name]="'prime_libelle_' + i" placeholder="Libellé">
                  <input type="number" [(ngModel)]="prime.montant" [name]="'prime_montant_' + i" placeholder="Montant" (input)="calculerSalaire()">
                  <button type="button" class="btn-remove" (click)="removePrime(i)">✕</button>
                </div>
                <button type="button" class="btn-add-ligne" (click)="addPrime()">+ Ajouter une prime</button>
              </div>

              <div class="full-width">
                <h4>Indemnités</h4>
                <div *ngFor="let indem of currentBulletin.indemnites; let i = index" class="ligne-form">
                  <input type="text" [(ngModel)]="indem.libelle" [name]="'indem_libelle_' + i" placeholder="Libellé">
                  <input type="number" [(ngModel)]="indem.montant" [name]="'indem_montant_' + i" placeholder="Montant" (input)="calculerSalaire()">
                  <button type="button" class="btn-remove" (click)="removeIndemnite(i)">✕</button>
                </div>
                <button type="button" class="btn-add-ligne" (click)="addIndemnite()">+ Ajouter une indemnité</button>
              </div>

              <div class="full-width">
                <h4>Déductions</h4>
                <div *ngFor="let ded of currentBulletin.deductions; let i = index" class="ligne-form">
                  <input type="text" [(ngModel)]="ded.libelle" [name]="'ded_libelle_' + i" placeholder="Libellé">
                  <input type="number" [(ngModel)]="ded.montant" [name]="'ded_montant_' + i" placeholder="Montant" (input)="calculerSalaire()">
                  <button type="button" class="btn-remove" (click)="removeDeduction(i)">✕</button>
                </div>
                <button type="button" class="btn-add-ligne" (click)="addDeduction()">+ Ajouter une déduction</button>
              </div>
            </div>
          </div>

          <!-- Onglet Cotisations -->
          <div *ngIf="activeTab === 'cotisations'" class="tab-content">
            <div class="form-grid">
              <div class="full-width">
                <h4>Cotisations salariales</h4>
                <div *ngFor="let cot of currentBulletin.cotisations; let i = index" class="ligne-form">
                  <input type="text" [(ngModel)]="cot.libelle" [name]="'cot_libelle_' + i" placeholder="Libellé">
                  <input type="number" [(ngModel)]="cot.taux" [name]="'cot_taux_' + i" placeholder="Taux %" (input)="calculerCotisation(i)">
                  <input type="number" [(ngModel)]="cot.montant" [name]="'cot_montant_' + i" placeholder="Montant" readonly>
                  <select [(ngModel)]="cot.type" [name]="'cot_type_' + i">
                    <option value="salarial">Salarial</option>
                    <option value="patronal">Patronal</option>
                  </select>
                  <button type="button" class="btn-remove" (click)="removeCotisation(i)">✕</button>
                </div>
                <button type="button" class="btn-add-ligne" (click)="addCotisation()">+ Ajouter une cotisation</button>
              </div>
            </div>
          </div>

          <!-- Onglet Avantages -->
          <div *ngIf="activeTab === 'avantages'" class="tab-content">
            <div class="form-grid">
              <div class="full-width">
                <h4>Avantages en nature</h4>
                <div *ngFor="let av of currentBulletin.avantages; let i = index" class="ligne-form">
                  <input type="text" [(ngModel)]="av.libelle" [name]="'av_libelle_' + i" placeholder="Libellé">
                  <input type="number" [(ngModel)]="av.montant" [name]="'av_montant_' + i" placeholder="Montant" (input)="calculerSalaire()">
                  <button type="button" class="btn-remove" (click)="removeAvantage(i)">✕</button>
                </div>
                <button type="button" class="btn-add-ligne" (click)="addAvantage()">+ Ajouter un avantage</button>
              </div>
            </div>
          </div>

          <!-- Récapitulatif -->
          <div class="recap-section">
            <h4>Récapitulatif</h4>
            <div class="recap-grid">
              <div class="recap-item">
                <span class="recap-label">Salaire brut:</span>
                <span class="recap-value">{{ currentBulletin.salaire_brut | number }} FCFA</span>
              </div>
              <div class="recap-item">
                <span class="recap-label">Total cotisations:</span>
                <span class="recap-value">{{ currentBulletin.total_cotisations | number }} FCFA</span>
              </div>
              <div class="recap-item total">
                <span class="recap-label">Net à payer:</span>
                <span class="recap-value">{{ currentBulletin.net_a_payer | number }} FCFA</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="bulletinForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="bulletins.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterBulletins()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="periodeFilter" (ngModelChange)="filterBulletins()" class="filter-select">
          <option value="">Toutes périodes</option>
          <option *ngFor="let p of periodes" [value]="p">{{ p }}</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterBulletins()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="valide">Validé</option>
          <option value="paye">Payé</option>
        </select>
      </div>

      <!-- Tableau -->
      <div class="table-container" *ngIf="bulletins.length > 0; else emptyState">
        <table class="bulletins-table">
          <thead>
            <tr>
              <th>Période</th>
              <th>Employé</th>
              <th>Salaire brut</th>
              <th>Net à payer</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of filteredBulletins">
              <td>{{ b.periode }}</td>
              <td>{{ b.employe_nom }}</td>
              <td>{{ b.salaire_brut | number }} FCFA</td>
              <td>{{ b.net_a_payer | number }} FCFA</td>
              <td><span class="badge" [class]="b.statut">{{ getStatutLabel(b.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="viewBulletin(b)" title="Voir détail">👁️</button>
                <button class="btn-icon" (click)="editBulletin(b)" title="Modifier">✏️</button>
                <button class="btn-icon" (click)="imprimerBulletin(b)" title="Imprimer">🖨️</button>
                <button class="btn-icon delete" (click)="confirmDelete(b)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💵</div>
          <h2>Aucun bulletin de paie</h2>
          <p>Générez votre premier bulletin</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau bulletin</button>
        </div>
      </ng-template>

      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Bulletin de paie - {{ selectedBulletin?.periode }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedBulletin">
            <div class="bulletin-paie">
              <div class="entete">
                <h4>{{ selectedBulletin.employe_nom }}</h4>
                <p>Période: {{ selectedBulletin.periode }}</p>
              </div>
              
              <table class="details-table">
                <tr>
                  <th colspan="2">Éléments du salaire</th>
                </tr>
                <tr>
                  <td>Salaire de base</td>
                  <td class="montant">{{ selectedBulletin.salaire_base | number }} FCFA</td>
                </tr>
                <tr *ngFor="let p of selectedBulletin.primes">
                  <td>Prime: {{ p.libelle }}</td>
                  <td class="montant">+ {{ p.montant | number }} FCFA</td>
                </tr>
                <tr *ngFor="let i of selectedBulletin.indemnites">
                  <td>Indemnité: {{ i.libelle }}</td>
                  <td class="montant">+ {{ i.montant | number }} FCFA</td>
                </tr>
                <tr *ngFor="let a of selectedBulletin.avantages">
                  <td>Avantage: {{ a.libelle }}</td>
                  <td class="montant">+ {{ a.montant | number }} FCFA</td>
                </tr>
                <tr class="total">
                  <td>Salaire brut</td>
                  <td class="montant">{{ selectedBulletin.salaire_brut | number }} FCFA</td>
                </tr>
                
                <tr *ngFor="let c of selectedBulletin.cotisations">
                  <td>Cotisation {{ c.libelle }} ({{ c.taux }}%)</td>
                  <td class="montant">- {{ c.montant | number }} FCFA</td>
                </tr>
                <tr *ngFor="let d of selectedBulletin.deductions">
                  <td>Déduction: {{ d.libelle }}</td>
                  <td class="montant">- {{ d.montant | number }} FCFA</td>
                </tr>
                
                <tr class="total final">
                  <td>Net à payer</td>
                  <td class="montant">{{ selectedBulletin.net_a_payer | number }} FCFA</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le bulletin de {{ bulletinToDelete?.employe_nom }} ({{ bulletinToDelete?.periode }}) ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteBulletin()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .paie-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .ligne-form { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
    .ligne-form input { flex: 1; }
    .btn-remove { background: #FEE2E2; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; color: #EF4444; }
    .btn-add-ligne { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 8px 16px; margin: 10px 0; cursor: pointer; color: #EC4899; }
    .recap-section { margin-top: 30px; padding: 20px; background: #FDF2F8; border-radius: 8px; }
    .recap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .recap-item { text-align: center; }
    .recap-item.total { font-weight: bold; color: #EC4899; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .bulletins-table { width: 100%; border-collapse: collapse; }
    .bulletins-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .bulletins-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.brouillon { background: #9CA3AF; color: white; }
    .badge.valide { background: #10B981; color: white; }
    .badge.paye { background: #EC4899; color: white; }
    
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    
    .bulletin-paie { font-family: 'Courier New', monospace; }
    .entete { text-align: center; margin-bottom: 30px; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table td { padding: 8px; }
    .details-table tr.total { font-weight: bold; border-top: 2px solid #FCE7F3; }
    .details-table tr.final { color: #EC4899; font-size: 1.2em; }
    .montant { text-align: right; }
    
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Paie implements OnInit {
  employes: any[] = [];
  bulletins: BulletinPaie[] = [];
  filteredBulletins: BulletinPaie[] = [];
  selectedBulletin: BulletinPaie | null = null;
  periodes: string[] = [];

  currentBulletin: any = {
    employe_id: '',
    periode: new Date().toISOString().slice(0, 7),
    date_emission: new Date().toISOString().split('T')[0],
    salaire_base: 0,
    primes: [],
    indemnites: [],
    cotisations: [
      { libelle: 'CNSS', taux: 5.4, montant: 0, type: 'salarial' },
      { libelle: 'IPM', taux: 3.6, montant: 0, type: 'salarial' }
    ],
    avantages: [],
    deductions: [],
    salaire_brut: 0,
    total_cotisations: 0,
    net_a_payer: 0,
    statut: 'brouillon'
  };

  activeTab = 'info';
  searchTerm = '';
  periodeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  bulletinToDelete: BulletinPaie | null = null;
  successMessage = '';

  totalNet = 0;

  ngOnInit() { 
    this.loadEmployes();
    this.loadBulletins();
    this.genererPeriodes();
  }

  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }

  loadBulletins() {
    const saved = localStorage.getItem('bulletins_paie');
    this.bulletins = saved ? JSON.parse(saved) : [];
    this.filteredBulletins = [...this.bulletins];
    this.calculerTotalNet();
  }

  genererPeriodes() {
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      this.periodes.push(date.toISOString().slice(0, 7));
    }
  }

  onEmployeChange() {
    const employe = this.employes.find(e => e.id === this.currentBulletin.employe_id);
    if (employe) {
      this.currentBulletin.salaire_base = employe.salaire_base || 0;
      this.calculerSalaire();
    }
  }

  addPrime() {
    this.currentBulletin.primes.push({ libelle: '', montant: 0, type: 'fixe' });
  }

  removePrime(index: number) {
    this.currentBulletin.primes.splice(index, 1);
    this.calculerSalaire();
  }

  addIndemnite() {
    this.currentBulletin.indemnites.push({ libelle: '', montant: 0 });
  }

  removeIndemnite(index: number) {
    this.currentBulletin.indemnites.splice(index, 1);
    this.calculerSalaire();
  }

  addCotisation() {
    this.currentBulletin.cotisations.push({ libelle: '', taux: 0, montant: 0, type: 'salarial' });
  }

  removeCotisation(index: number) {
    this.currentBulletin.cotisations.splice(index, 1);
    this.calculerSalaire();
  }

  calculerCotisation(index: number) {
    const cot = this.currentBulletin.cotisations[index];
    cot.montant = this.currentBulletin.salaire_brut * (cot.taux / 100);
    this.calculerSalaire();
  }

  addAvantage() {
    this.currentBulletin.avantages.push({ libelle: '', montant: 0 });
  }

  removeAvantage(index: number) {
    this.currentBulletin.avantages.splice(index, 1);
    this.calculerSalaire();
  }

  addDeduction() {
    this.currentBulletin.deductions.push({ libelle: '', montant: 0 });
  }

  removeDeduction(index: number) {
    this.currentBulletin.deductions.splice(index, 1);
    this.calculerSalaire();
  }

  calculerSalaire() {
    let salaireBrut = this.currentBulletin.salaire_base;
    
    this.currentBulletin.primes.forEach((p: Prime) => salaireBrut += p.montant || 0);
    this.currentBulletin.indemnites.forEach((i: Indemnite) => salaireBrut += i.montant || 0);
    this.currentBulletin.avantages.forEach((a: Avantage) => salaireBrut += a.montant || 0);
    
    this.currentBulletin.salaire_brut = salaireBrut;

    let totalCotisations = 0;
    this.currentBulletin.cotisations.forEach((c: Cotisation) => {
      c.montant = salaireBrut * (c.taux / 100);
      totalCotisations += c.montant;
    });
    this.currentBulletin.total_cotisations = totalCotisations;

    let totalDeductions = 0;
    this.currentBulletin.deductions.forEach((d: Deduction) => totalDeductions += d.montant || 0);

    this.currentBulletin.net_a_payer = salaireBrut - totalCotisations - totalDeductions;
  }

  saveBulletin() {
    const employe = this.employes.find(e => e.id === this.currentBulletin.employe_id);
    if (!employe) return;

    if (this.editMode) {
      const index = this.bulletins.findIndex(b => b.id === this.currentBulletin.id);
      if (index !== -1) {
        this.bulletins[index] = { 
          ...this.currentBulletin, 
          employe_nom: `${employe.nom} ${employe.prenom}` 
        };
        this.showSuccess('Bulletin modifié !');
      }
    } else {
      const newBulletin = { 
        ...this.currentBulletin, 
        id: Date.now(),
        employe_nom: `${employe.nom} ${employe.prenom}`
      };
      this.bulletins.push(newBulletin);
      this.showSuccess('Bulletin ajouté !');
    }
    
    localStorage.setItem('bulletins_paie', JSON.stringify(this.bulletins));
    this.filterBulletins();
    this.cancelForm();
  }

  editBulletin(b: BulletinPaie) {
    this.currentBulletin = { ...b };
    this.editMode = true;
    this.showForm = true;
  }

  viewBulletin(b: BulletinPaie) {
    this.selectedBulletin = b;
    this.showDetailsModal = true;
  }

  imprimerBulletin(b: BulletinPaie) {
    alert('Fonction d\'impression à venir');
  }

  confirmDelete(b: BulletinPaie) {
    this.bulletinToDelete = b;
    this.showDeleteModal = true;
  }

  deleteBulletin() {
    if (this.bulletinToDelete) {
      this.bulletins = this.bulletins.filter(b => b.id !== this.bulletinToDelete?.id);
      localStorage.setItem('bulletins_paie', JSON.stringify(this.bulletins));
      this.filterBulletins();
      this.showDeleteModal = false;
      this.bulletinToDelete = null;
      this.showSuccess('Bulletin supprimé !');
    }
  }

  cancelForm() {
    this.currentBulletin = {
      employe_id: '',
      periode: new Date().toISOString().slice(0, 7),
      date_emission: new Date().toISOString().split('T')[0],
      salaire_base: 0,
      primes: [],
      indemnites: [],
      cotisations: [
        { libelle: 'CNSS', taux: 5.4, montant: 0, type: 'salarial' },
        { libelle: 'IPM', taux: 3.6, montant: 0, type: 'salarial' }
      ],
      avantages: [],
      deductions: [],
      salaire_brut: 0,
      total_cotisations: 0,
      net_a_payer: 0,
      statut: 'brouillon'
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }

  filterBulletins() {
    let filtered = this.bulletins;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.employe_nom?.toLowerCase().includes(term)
      );
    }

    if (this.periodeFilter) {
      filtered = filtered.filter(b => b.periode === this.periodeFilter);
    }

    if (this.statutFilter) {
      filtered = filtered.filter(b => b.statut === this.statutFilter);
    }

    this.filteredBulletins = filtered;
    this.calculerTotalNet();
  }

  calculerTotalNet() {
    this.totalNet = this.filteredBulletins.reduce((s, b) => s + (b.net_a_payer || 0), 0);
  }

  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: 'Brouillon', valide: 'Validé', paye: 'Payé' };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
