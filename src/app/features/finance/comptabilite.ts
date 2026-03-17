import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface EcritureComptable {
  id?: number;
  date: string;
  libelle: string;
  compte_debit: string;
  compte_credit: string;
  montant: number;
  piece_justificative?: string;
  reference?: string;
  validation: boolean;
  date_validation?: string;
  validee_par?: string;
  notes?: string;
}

interface CompteComptable {
  numero: string;
  nom: string;
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie';
  solde: number;
}

@Component({
  selector: 'app-comptabilite',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="compta-container">
      <div class="header">
        <div>
          <h1>Comptabilité</h1>
          <p class="subtitle">{{ ecritures.length }} écriture(s) • Solde: {{ soldeGeneral | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle écriture</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} écriture</h3>
        <form (ngSubmit)="saveEcriture()" #ecritureForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentEcriture.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="currentEcriture.libelle" name="libelle" required>
            </div>
            <div class="form-group">
              <label>Compte débit</label>
              <select [(ngModel)]="currentEcriture.compte_debit" name="compte_debit" required>
                <option value="">Sélectionner</option>
                <option *ngFor="let c of comptes" [value]="c.numero">{{ c.numero }} - {{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Compte crédit</label>
              <select [(ngModel)]="currentEcriture.compte_credit" name="compte_credit" required>
                <option value="">Sélectionner</option>
                <option *ngFor="let c of comptes" [value]="c.numero">{{ c.numero }} - {{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="currentEcriture.montant" name="montant" required>
            </div>
            <div class="form-group">
              <label>Pièce justificative</label>
              <input type="text" [(ngModel)]="currentEcriture.piece_justificative" name="piece_justificative">
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="currentEcriture.reference" name="reference">
            </div>
            <div class="form-group">
              <label>Validation</label>
              <input type="checkbox" [(ngModel)]="currentEcriture.validation" name="validation">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentEcriture.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="ecritureForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="ecritures.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEcritures()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="validationFilter" (ngModelChange)="filterEcritures()" class="filter-select">
          <option value="">Toutes</option>
          <option value="true">Validées</option>
          <option value="false">Non validées</option>
        </select>
      </div>

      <!-- Balance des comptes -->
      <div class="balance-section" *ngIf="comptes.length > 0">
        <h3>Balance des comptes</h3>
        <div class="balance-grid">
          <div class="balance-card" *ngFor="let c of comptes">
            <div class="compte-numero">{{ c.numero }}</div>
            <div class="compte-nom">{{ c.nom }}</div>
            <div class="compte-solde" [class]="c.type">
              {{ c.solde | number }} FCFA
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des écritures -->
      <div class="table-container" *ngIf="ecritures.length > 0; else emptyState">
        <table class="ecritures-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Compte débit</th>
              <th>Compte crédit</th>
              <th>Montant</th>
              <th>Validation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredEcritures">
              <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ e.libelle }}</td>
              <td>{{ e.compte_debit }}</td>
              <td>{{ e.compte_credit }}</td>
              <td>{{ e.montant | number }} FCFA</td>
              <td>
                <span class="badge" [class.validee]="e.validation" [class.non-validee]="!e.validation">
                  {{ e.validation ? 'Validée' : 'En attente' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="toggleValidation(e)" title="Valider/Dévalider">✓</button>
                <button class="btn-icon" (click)="editEcriture(e)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <h2>Aucune écriture comptable</h2>
          <p>Enregistrez votre première écriture</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle écriture</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'écriture <strong>{{ ecritureToDelete?.libelle }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEcriture()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compta-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    input[type="checkbox"] { width: 20px; height: 20px; margin-top: 5px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .balance-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    h3 { color: #1F2937; margin: 0 0 15px; }
    .balance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
    .balance-card { background: #FDF2F8; border-radius: 8px; padding: 15px; }
    .compte-numero { font-size: 12px; color: #EC4899; margin-bottom: 5px; }
    .compte-nom { font-size: 14px; color: #1F2937; margin-bottom: 10px; }
    .compte-solde { font-weight: 600; font-size: 16px; }
    .compte-solde.actif { color: #10B981; }
    .compte-solde.passif { color: #EF4444; }
    .compte-solde.charge { color: #EC4899; }
    .compte-solde.produit { color: #F59E0B; }
    .compte-solde.tresorerie { color: #3B82F6; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .ecritures-table { width: 100%; border-collapse: collapse; }
    .ecritures-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .ecritures-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.validee { background: #10B981; color: white; }
    .badge.non-validee { background: #9CA3AF; color: white; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Comptabilite implements OnInit {
  comptes: CompteComptable[] = [
    { numero: '101', nom: 'Capital', type: 'passif', solde: 0 },
    { numero: '401', nom: 'Fournisseurs', type: 'passif', solde: 0 },
    { numero: '411', nom: 'Clients', type: 'actif', solde: 0 },
    { numero: '512', nom: 'Banque', type: 'tresorerie', solde: 0 },
    { numero: '53', nom: 'Caisse', type: 'tresorerie', solde: 0 },
    { numero: '601', nom: 'Achats', type: 'charge', solde: 0 },
    { numero: '701', nom: 'Ventes', type: 'produit', solde: 0 },
    { numero: '64', nom: 'Charges de personnel', type: 'charge', solde: 0 }
  ];

  ecritures: EcritureComptable[] = [];
  filteredEcritures: EcritureComptable[] = [];

  currentEcriture: any = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    compte_debit: '',
    compte_credit: '',
    montant: 0,
    piece_justificative: '',
    reference: '',
    validation: false,
    notes: ''
  };

  searchTerm = '';
  validationFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  ecritureToDelete: EcritureComptable | null = null;
  successMessage = '';

  soldeGeneral = 0;

  ngOnInit() {
    this.loadEcritures();
    this.calculerSoldes();
  }

  loadEcritures() {
    const saved = localStorage.getItem('ecritures_comptables');
    this.ecritures = saved ? JSON.parse(saved) : [];
    this.filteredEcritures = [...this.ecritures];
  }

  saveEcriture() {
    if (this.editMode) {
      const index = this.ecritures.findIndex(e => e.id === this.currentEcriture.id);
      if (index !== -1) {
        // Annuler l'ancienne écriture
        this.annulerEcriture(this.ecritures[index]);
        // Appliquer la nouvelle
        this.ecritures[index] = { ...this.currentEcriture };
        this.appliquerEcriture(this.ecritures[index]);
        this.showSuccess('Écriture modifiée !');
      }
    } else {
      const newEcriture = { ...this.currentEcriture, id: Date.now() };
      this.ecritures.push(newEcriture);
      this.appliquerEcriture(newEcriture);
      this.showSuccess('Écriture ajoutée !');
    }
    localStorage.setItem('ecritures_comptables', JSON.stringify(this.ecritures));
    this.calculerSoldes();
    this.filterEcritures();
    this.cancelForm();
  }

  appliquerEcriture(e: EcritureComptable) {
    if (e.validation) {
      const compteDebit = this.comptes.find(c => c.numero === e.compte_debit);
      const compteCredit = this.comptes.find(c => c.numero === e.compte_credit);
      
      if (compteDebit) compteDebit.solde += e.montant;
      if (compteCredit) compteCredit.solde -= e.montant;
    }
  }

  annulerEcriture(e: EcritureComptable) {
    if (e.validation) {
      const compteDebit = this.comptes.find(c => c.numero === e.compte_debit);
      const compteCredit = this.comptes.find(c => c.numero === e.compte_credit);
      
      if (compteDebit) compteDebit.solde -= e.montant;
      if (compteCredit) compteCredit.solde += e.montant;
    }
  }

  toggleValidation(e: EcritureComptable) {
    this.annulerEcriture(e);
    e.validation = !e.validation;
    this.appliquerEcriture(e);
    
    localStorage.setItem('ecritures_comptables', JSON.stringify(this.ecritures));
    this.calculerSoldes();
    this.filterEcritures();
    this.showSuccess(e.validation ? 'Écriture validée' : 'Validation retirée');
  }

  editEcriture(e: EcritureComptable) {
    this.currentEcriture = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(e: EcritureComptable) {
    this.ecritureToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEcriture() {
    if (this.ecritureToDelete) {
      this.annulerEcriture(this.ecritureToDelete);
      this.ecritures = this.ecritures.filter(e => e.id !== this.ecritureToDelete?.id);
      localStorage.setItem('ecritures_comptables', JSON.stringify(this.ecritures));
      this.calculerSoldes();
      this.filterEcritures();
      this.showDeleteModal = false;
      this.ecritureToDelete = null;
      this.showSuccess('Écriture supprimée !');
    }
  }

  cancelForm() {
    this.currentEcriture = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      compte_debit: '',
      compte_credit: '',
      montant: 0,
      piece_justificative: '',
      reference: '',
      validation: false,
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterEcritures() {
    let filtered = this.ecritures;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.libelle?.toLowerCase().includes(term) ||
        e.reference?.toLowerCase().includes(term) ||
        e.compte_debit?.includes(term) ||
        e.compte_credit?.includes(term)
      );
    }

    if (this.validationFilter) {
      const validee = this.validationFilter === 'true';
      filtered = filtered.filter(e => e.validation === validee);
    }

    this.filteredEcritures = filtered;
  }

  calculerSoldes() {
    this.soldeGeneral = this.comptes.reduce((s, c) => s + (c.solde || 0), 0);
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
