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
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📊 Comptabilité générale</h1>
          <p class="subtitle">{{ ecritures.length }} écriture(s) • Solde général: {{ soldeGeneral | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="ecritures.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="ecritures.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle écriture</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- Formulaire amélioré -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} écriture comptable</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEcriture()">
              <div class="form-row">
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="currentEcriture.date" name="date" required>
                </div>
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentEcriture.reference" name="reference" placeholder="Facture n°, etc.">
                </div>
              </div>
              <div class="form-group">
                <label>Libellé *</label>
                <input type="text" [(ngModel)]="currentEcriture.libelle" name="libelle" required placeholder="Description de l'opération">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Compte débit *</label>
                  <select [(ngModel)]="currentEcriture.compte_debit" name="compte_debit" required>
                    <option value="">Sélectionner</option>
                    <option *ngFor="let c of comptes" [value]="c.numero" [disabled]="c.numero === currentEcriture.compte_credit">
                      {{ c.numero }} - {{ c.nom }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Compte crédit *</label>
                  <select [(ngModel)]="currentEcriture.compte_credit" name="compte_credit" required>
                    <option value="">Sélectionner</option>
                    <option *ngFor="let c of comptes" [value]="c.numero" [disabled]="c.numero === currentEcriture.compte_debit">
                      {{ c.numero }} - {{ c.nom }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant *</label>
                  <input type="number" [(ngModel)]="currentEcriture.montant" name="montant" required placeholder="0">
                </div>
                <div class="form-group">
                  <label>Pièce justificative</label>
                  <input type="text" [(ngModel)]="currentEcriture.piece_justificative" name="piece_justificative" placeholder="N° pièce">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentEcriture.notes" name="notes" rows="3" placeholder="Informations complémentaires..."></textarea>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="currentEcriture.validation" name="validation">
                  Valider immédiatement cette écriture
                </label>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid" *ngIf="ecritures.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ soldeGeneral | number }} <small>FCFA</small></span>
            <span class="kpi-label">Solde général</span>
          </div>
        </div>
        <div class="kpi-card valid">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEcrituresValidees() }}</span>
            <span class="kpi-label">Écritures validées</span>
          </div>
        </div>
        <div class="kpi-card pending">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEcrituresNonValidees() }}</span>
            <span class="kpi-label">En attente</span>
          </div>
        </div>
        <div class="kpi-card month">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEcrituresMois() }}</span>
            <span class="kpi-label">Ce mois</span>
          </div>
        </div>
      </div>

      <!-- Balance des comptes améliorée -->
      <div class="balance-section" *ngIf="comptes.length > 0">
        <div class="section-header">
          <h3>📋 Balance des comptes</h3>
          <div class="balance-total">
            <span>Total actif: {{ getTotalActif() | number }} FCFA</span>
            <span>Total passif: {{ getTotalPassif() | number }} FCFA</span>
          </div>
        </div>
        <div class="balance-grid">
          <div class="balance-card" *ngFor="let c of comptes" [class]="c.type">
            <div class="compte-header">
              <span class="compte-numero">{{ c.numero }}</span>
              <span class="compte-type-badge" [class]="c.type">{{ getTypeLabel(c.type) }}</span>
            </div>
            <div class="compte-nom">{{ c.nom }}</div>
            <div class="compte-solde" [class]="c.type">
              {{ c.solde | number }} FCFA
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres améliorés -->
      <div class="filters-section" *ngIf="ecritures.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEcritures()" placeholder="Rechercher par libellé, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="validationFilter" (ngModelChange)="filterEcritures()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="true">Validées</option>
            <option value="false">En attente</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterEcritures()" class="filter-select">
            <option value="">Tous comptes</option>
            <option *ngFor="let c of comptes" [value]="c.numero">{{ c.numero }} - {{ c.nom }}</option>
          </select>
        </div>
      </div>

      <!-- Liste des écritures améliorée -->
      <div class="ecritures-section" *ngIf="ecritures.length > 0; else emptyState">
        <div class="section-header">
          <h2>📝 Journal des écritures</h2>
          <div class="header-stats">
            <span class="stat-badge total-debit">Débit: {{ getTotalDebit() | number }} FCFA</span>
            <span class="stat-badge total-credit">Crédit: {{ getTotalCredit() | number }} FCFA</span>
          </div>
        </div>
        
        <div class="ecritures-list">
          <div class="ecriture-card" *ngFor="let e of filteredEcritures" [class.validee]="e.validation">
            <div class="card-header">
              <div class="header-left">
                <span class="ecriture-date">{{ e.date | date:'dd/MM/yyyy' }}</span>
                <span class="ecriture-ref" *ngIf="e.reference">{{ e.reference }}</span>
                <span class="status-badge" [class.valid]="e.validation" [class.pending]="!e.validation">
                  {{ e.validation ? '✅ Validée' : '⏳ En attente' }}
                </span>
              </div>
              <div class="header-right">
                <span class="ecriture-montant">{{ e.montant | number }} FCFA</span>
              </div>
            </div>
            <div class="card-body">
              <div class="ecriture-libelle">{{ e.libelle }}</div>
              <div class="ecriture-comptes">
                <span class="compte-debit">Débit: {{ e.compte_debit }}</span>
                <span class="compte-credit">Crédit: {{ e.compte_credit }}</span>
              </div>
              <div class="ecriture-details" *ngIf="e.piece_justificative || e.notes">
                <span *ngIf="e.piece_justificative" class="detail">📎 Pièce: {{ e.piece_justificative }}</span>
                <span *ngIf="e.notes" class="detail">📝 {{ e.notes | slice:0:50 }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="toggleValidation(e)" title="{{ e.validation ? 'Dévalider' : 'Valider' }}">
                  {{ e.validation ? '⏳' : '✅' }}
                </button>
                <button class="action-icon" (click)="editEcriture(e)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <h2>Aucune écriture comptable</h2>
          <p>Enregistrez votre première écriture pour commencer la comptabilité</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle écriture</button>
        </div>
      </ng-template>

      <!-- Modal confirmation suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer l'écriture <strong>{{ ecritureToDelete?.libelle }}</strong> ?</p>
            <p class="warning-text" *ngIf="ecritureToDelete?.validation">⚠️ Cette écriture est validée. Sa suppression affectera les soldes des comptes.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEcriture()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compta-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 800px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #1F2937; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.valid .kpi-value { color: #10B981; }
    .kpi-card.pending .kpi-value { color: #F59E0B; }
    .balance-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .section-header h2, .section-header h3 { margin: 0; font-size: 18px; }
    .balance-total { display: flex; gap: 20px; font-size: 13px; color: #6B7280; }
    .balance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; }
    .balance-card { background: #F9FAFB; border-radius: 12px; padding: 15px; transition: all 0.2s; border-left: 4px solid transparent; }
    .balance-card.actif { border-left-color: #10B981; }
    .balance-card.passif { border-left-color: #EF4444; }
    .balance-card.charge { border-left-color: #EC4899; }
    .balance-card.produit { border-left-color: #F59E0B; }
    .balance-card.tresorerie { border-left-color: #3B82F6; }
    .compte-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .compte-numero { font-size: 12px; font-weight: 600; color: #EC4899; font-family: monospace; }
    .compte-type-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
    .compte-type-badge.actif { background: #DCFCE7; color: #16A34A; }
    .compte-type-badge.passif { background: #FEE2E2; color: #EF4444; }
    .compte-type-badge.charge { background: #FFE4E6; color: #EC4899; }
    .compte-type-badge.produit { background: #FEF3C7; color: #F59E0B; }
    .compte-type-badge.tresorerie { background: #E0E7FF; color: #3B82F6; }
    .compte-nom { font-size: 14px; font-weight: 500; color: #1F2937; margin-bottom: 8px; }
    .compte-solde { font-weight: 600; font-size: 16px; }
    .compte-solde.actif { color: #10B981; }
    .compte-solde.passif { color: #EF4444; }
    .compte-solde.charge { color: #EC4899; }
    .compte-solde.produit { color: #F59E0B; }
    .compte-solde.tresorerie { color: #3B82F6; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 1; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .ecritures-section { background: white; border-radius: 16px; padding: 20px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .stat-badge.total-debit { background: #DCFCE7; color: #16A34A; }
    .stat-badge.total-credit { background: #FEE2E2; color: #EF4444; }
    .ecritures-list { display: flex; flex-direction: column; gap: 12px; }
    .ecriture-card { background: #F9FAFB; border-radius: 12px; padding: 16px 20px; transition: all 0.2s; border-left: 4px solid #E5E7EB; }
    .ecriture-card.validee { border-left-color: #10B981; }
    .ecriture-card:hover { background: #FEF3F9; transform: translateX(4px); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .ecriture-date { font-size: 12px; color: #6B7280; font-family: monospace; }
    .ecriture-ref { font-size: 11px; color: #9CA3AF; background: #F3F4F6; padding: 2px 8px; border-radius: 4px; }
    .status-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .status-badge.valid { background: #DCFCE7; color: #16A34A; }
    .status-badge.pending { background: #FEF3C7; color: #D97706; }
    .ecriture-montant { font-size: 18px; font-weight: 700; color: #EC4899; }
    .card-body { margin-bottom: 12px; }
    .ecriture-libelle { font-weight: 600; color: #1F2937; margin-bottom: 8px; }
    .ecriture-comptes { display: flex; gap: 16px; margin-bottom: 8px; font-size: 12px; }
    .compte-debit { color: #10B981; }
    .compte-credit { color: #EF4444; }
    .ecriture-details { display: flex; gap: 16px; font-size: 11px; color: #9CA3AF; flex-wrap: wrap; }
    .card-footer { display: flex; justify-content: flex-end; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: none; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FCE7F3; }
    .action-icon.delete:hover { background: #FEE2E2; color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .warning-text { color: #EF4444; font-size: 13px; margin-top: 12px; }
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .balance-grid { grid-template-columns: 1fr; }
      .filter-group { flex-direction: column; }
    }
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
    { numero: '64', nom: 'Charges de personnel', type: 'charge', solde: 0 },
    { numero: '63', nom: 'Impôts et taxes', type: 'charge', solde: 0 },
    { numero: '75', nom: 'Autres produits', type: 'produit', solde: 0 }
  ];

  ecritures: EcritureComptable[] = [];
  filteredEcritures: EcritureComptable[] = [];

  currentEcriture: Partial<EcritureComptable> = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    compte_debit: '',
    compte_credit: '',
    montant: 0,
    validation: false,
    notes: ''
  };

  searchTerm = '';
  validationFilter = '';
  typeFilter = '';
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

  openForm() {
    this.currentEcriture = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      compte_debit: '',
      compte_credit: '',
      montant: 0,
      validation: false,
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadEcritures() {
    const saved = localStorage.getItem('ecritures_comptables');
    this.ecritures = saved ? JSON.parse(saved) : [];
    this.filteredEcritures = [...this.ecritures];
  }

  saveEcritures() {
    localStorage.setItem('ecritures_comptables', JSON.stringify(this.ecritures));
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

  saveEcriture() {
    if (this.editMode && this.currentEcriture.id) {
      const index = this.ecritures.findIndex(e => e.id === this.currentEcriture.id);
      if (index !== -1) {
        this.annulerEcriture(this.ecritures[index]);
        this.ecritures[index] = { ...this.currentEcriture } as EcritureComptable;
        this.appliquerEcriture(this.ecritures[index]);
        this.showSuccess('Écriture modifiée');
      }
    } else {
      const newEcriture = { ...this.currentEcriture, id: Date.now() } as EcritureComptable;
      this.ecritures.push(newEcriture);
      this.appliquerEcriture(newEcriture);
      this.showSuccess('Écriture ajoutée');
    }
    
    this.saveEcritures();
    this.calculerSoldes();
    this.filterEcritures();
    this.cancelForm();
  }

  toggleValidation(e: EcritureComptable) {
    this.annulerEcriture(e);
    e.validation = !e.validation;
    if (e.validation) {
      e.date_validation = new Date().toISOString();
      e.validee_par = 'Utilisateur';
    }
    this.appliquerEcriture(e);
    
    this.saveEcritures();
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
      this.saveEcritures();
      this.calculerSoldes();
      this.filterEcritures();
      this.showDeleteModal = false;
      this.ecritureToDelete = null;
      this.showSuccess('Écriture supprimée');
    }
  }

  cancelForm() {
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

    if (this.validationFilter !== '') {
      const validee = this.validationFilter === 'true';
      filtered = filtered.filter(e => e.validation === validee);
    }

    if (this.typeFilter) {
      filtered = filtered.filter(e => 
        e.compte_debit === this.typeFilter || 
        e.compte_credit === this.typeFilter
      );
    }

    this.filteredEcritures = filtered;
  }

  calculerSoldes() {
    this.soldeGeneral = this.comptes.reduce((s, c) => s + (c.solde || 0), 0);
  }

  getEcrituresValidees(): number {
    return this.ecritures.filter(e => e.validation).length;
  }

  getEcrituresNonValidees(): number {
    return this.ecritures.filter(e => !e.validation).length;
  }

  getEcrituresMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    return this.ecritures.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }

  getTotalDebit(): number {
    return this.ecritures
      .filter(e => e.validation)
      .reduce((sum, e) => sum + e.montant, 0);
  }

  getTotalCredit(): number {
    return this.getTotalDebit();
  }

  getTotalActif(): number {
    return this.comptes
      .filter(c => c.type === 'actif' || c.type === 'tresorerie')
      .reduce((sum, c) => sum + c.solde, 0);
  }

  getTotalPassif(): number {
    return this.comptes
      .filter(c => c.type === 'passif')
      .reduce((sum, c) => sum + c.solde, 0);
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      actif: 'Actif',
      passif: 'Passif',
      charge: 'Charge',
      produit: 'Produit',
      tresorerie: 'Trésorerie'
    };
    return labels[type] || type;
  }

    exportToExcel() {
    if (!this.filteredEcritures || this.filteredEcritures.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredEcritures[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredEcritures.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess("Export Excel effectué");
  }

    exportToPDF() {
    if (!this.filteredEcritures || this.filteredEcritures.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.comptes[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredEcritures.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}