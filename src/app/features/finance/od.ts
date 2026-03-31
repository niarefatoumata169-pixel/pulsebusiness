import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface OperationDiverse {
  id?: number;
  date: string;
  libelle: string;
  categorie: string;
  montant: number;
  type: 'produit' | 'charge' | 'transfert' | 'correction';
  compte_debit?: string;
  compte_credit?: string;
  reference?: string;
  justificatif?: string;
  notes?: string;
  validee: boolean;
  date_validation?: string;
}

@Component({
  selector: 'app-od',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="od-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📋 Opérations Diverses</h1>
          <p class="subtitle">{{ filteredOD.length }} opération(s) • Total: {{ totalOD | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="operations.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="operations.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle OD</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="operations.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalOD | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total général</span>
          </div>
        </div>
        <div class="kpi-card produits">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <span class="kpi-value">+ {{ getTotalByType('produit') | number }} <small>FCFA</small></span>
            <span class="kpi-label">Produits</span>
          </div>
        </div>
        <div class="kpi-card charges">
          <div class="kpi-icon">📉</div>
          <div class="kpi-content">
            <span class="kpi-value">- {{ getTotalByType('charge') | number }} <small>FCFA</small></span>
            <span class="kpi-label">Charges</span>
          </div>
        </div>
        <div class="kpi-card solde">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getSolde() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Résultat</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} opération diverse</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveOD()">
              <div class="form-row">
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="currentOD.date" name="date" required>
                </div>
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentOD.reference" name="reference" placeholder="N° facture, etc.">
                </div>
              </div>
              <div class="form-group">
                <label>Libellé *</label>
                <input type="text" [(ngModel)]="currentOD.libelle" name="libelle" required placeholder="Description de l'opération">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type *</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="currentOD.type === 'produit'" (click)="currentOD.type = 'produit'; updateType()">
                      📈 Produit
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentOD.type === 'charge'" (click)="currentOD.type = 'charge'; updateType()">
                      📉 Charge
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentOD.type === 'transfert'" (click)="currentOD.type = 'transfert'">
                      🔄 Transfert
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentOD.type === 'correction'" (click)="currentOD.type = 'correction'">
                      ⚖️ Correction
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Catégorie</label>
                  <select [(ngModel)]="currentOD.categorie" name="categorie">
                    <option value="achat">🛒 Achat</option>
                    <option value="vente">💰 Vente</option>
                    <option value="frais">📋 Frais</option>
                    <option value="salaire">👔 Salaire</option>
                    <option value="impot">🏛️ Impôt</option>
                    <option value="divers">📌 Divers</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant *</label>
                  <input type="number" [(ngModel)]="currentOD.montant" name="montant" required placeholder="0" (input)="updateMontant()">
                </div>
                <div class="form-group">
                  <label>Justificatif</label>
                  <input type="text" [(ngModel)]="currentOD.justificatif" name="justificatif" placeholder="N° pièce justificative">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Compte débit</label>
                  <input type="text" [(ngModel)]="currentOD.compte_debit" name="compte_debit" placeholder="Ex: 601, 401...">
                </div>
                <div class="form-group">
                  <label>Compte crédit</label>
                  <input type="text" [(ngModel)]="currentOD.compte_credit" name="compte_credit" placeholder="Ex: 701, 411...">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentOD.notes" name="notes" rows="3" placeholder="Informations complémentaires..."></textarea>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="currentOD.validee" name="validee">
                  Valider immédiatement cette opération
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

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="operations.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterOD()" placeholder="Rechercher par libellé, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterOD()" class="filter-select">
            <option value="">Tous types</option>
            <option value="produit">📈 Produits</option>
            <option value="charge">📉 Charges</option>
            <option value="transfert">🔄 Transferts</option>
            <option value="correction">⚖️ Corrections</option>
          </select>
          <select [(ngModel)]="valideeFilter" (ngModelChange)="filterOD()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="true">✅ Validées</option>
            <option value="false">⏳ En attente</option>
          </select>
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterOD()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="achat">🛒 Achat</option>
            <option value="vente">💰 Vente</option>
            <option value="frais">📋 Frais</option>
            <option value="salaire">👔 Salaire</option>
            <option value="impot">🏛️ Impôt</option>
          </select>
        </div>
      </div>

      <!-- Liste des opérations améliorée -->
      <div class="operations-section" *ngIf="operations.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Journal des opérations</h2>
          <div class="header-stats">
            <span class="stat-badge produits">Produits: {{ getTotalByType('produit') | number }} FCFA</span>
            <span class="stat-badge charges">Charges: {{ getTotalByType('charge') | number }} FCFA</span>
          </div>
        </div>
        
        <div class="operations-list">
          <div class="operation-card" *ngFor="let od of filteredOD" [class]="od.type" [class.validee]="od.validee">
            <div class="card-header">
              <div class="header-left">
                <div class="operation-icon" [class]="od.type">
                  {{ od.type === 'produit' ? '📈' : od.type === 'charge' ? '📉' : od.type === 'transfert' ? '🔄' : '⚖️' }}
                </div>
                <div class="operation-info">
                  <div class="operation-libelle">{{ od.libelle }}</div>
                  <div class="operation-details">
                    <span class="detail-date">{{ od.date | date:'dd/MM/yyyy' }}</span>
                    <span class="detail-categorie">{{ getCategorieLabel(od.categorie) }}</span>
                    <span *ngIf="od.reference" class="detail-ref">Réf: {{ od.reference }}</span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="operation-montant" [class]="od.type">
                  {{ od.type === 'produit' ? '+' : '-' }}{{ od.montant | number }} FCFA
                </div>
                <div class="operation-status">
                  <span class="status-badge" [class.valid]="od.validee" [class.pending]="!od.validee">
                    {{ od.validee ? '✅ Validée' : '⏳ En attente' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-body" *ngIf="od.compte_debit || od.compte_credit || od.justificatif">
              <div class="comptes-info">
                <span *ngIf="od.compte_debit" class="compte-debit">Débit: {{ od.compte_debit }}</span>
                <span *ngIf="od.compte_credit" class="compte-credit">Crédit: {{ od.compte_credit }}</span>
                <span *ngIf="od.justificatif" class="justificatif">📎 {{ od.justificatif }}</span>
              </div>
              <div *ngIf="od.notes" class="notes-info">
                📝 {{ od.notes | slice:0:100 }}{{ od.notes.length > 100 ? '...' : '' }}
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="toggleValidee(od)" title="{{ od.validee ? 'Dévalider' : 'Valider' }}">
                  {{ od.validee ? '⏳' : '✅' }}
                </button>
                <button class="action-icon" (click)="editOD(od)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(od)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h2>Aucune opération diverse</h2>
          <p>Enregistrez votre première opération diverse</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle OD</button>
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
            <p>Supprimer l'opération <strong>{{ odToDelete?.libelle }}</strong> ?</p>
            <p class="warning-text" *ngIf="odToDelete?.validee">⚠️ Cette opération est validée. Sa suppression affectera les calculs.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteOD()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .od-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #1F2937; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.produits .kpi-value { color: #10B981; }
    .kpi-card.charges .kpi-value { color: #EF4444; }
    .kpi-card.solde .kpi-value { color: #F59E0B; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .type-toggle { display: flex; gap: 8px; flex-wrap: wrap; }
    .toggle-btn { flex: 1; padding: 10px; border: 2px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-size: 12px; }
    .toggle-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .operations-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.produits { background: #DCFCE7; color: #16A34A; }
    .stat-badge.charges { background: #FEE2E2; color: #EF4444; }
    
    .operations-list { display: flex; flex-direction: column; gap: 12px; }
    .operation-card { background: #F9FAFB; border-radius: 12px; padding: 16px 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .operation-card.produit { border-left-color: #10B981; }
    .operation-card.charge { border-left-color: #EF4444; }
    .operation-card.transfert { border-left-color: #EC4899; }
    .operation-card.correction { border-left-color: #F59E0B; }
    .operation-card.validee { background: white; }
    .operation-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; gap: 16px; align-items: center; flex: 1; }
    .operation-icon { font-size: 28px; }
    .operation-libelle { font-weight: 600; color: #1F2937; margin-bottom: 6px; }
    .operation-details { display: flex; gap: 8px; flex-wrap: wrap; }
    .detail-date { font-size: 11px; color: #9CA3AF; }
    .detail-categorie { font-size: 11px; padding: 2px 8px; background: #E5E7EB; border-radius: 20px; color: #4B5563; }
    .detail-ref { font-size: 10px; color: #6B7280; font-family: monospace; }
    .header-right { text-align: right; }
    .operation-montant { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .operation-montant.produit { color: #10B981; }
    .operation-montant.charge { color: #EF4444; }
    .status-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .status-badge.valid { background: #DCFCE7; color: #16A34A; }
    .status-badge.pending { background: #FEF3C7; color: #D97706; }
    .card-body { margin-top: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6; }
    .comptes-info { display: flex; gap: 16px; font-size: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .compte-debit { color: #10B981; }
    .compte-credit { color: #EF4444; }
    .justificatif { color: #6B7280; }
    .notes-info { font-size: 12px; color: #6B7280; font-style: italic; }
    .card-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6; display: flex; justify-content: flex-end; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .warning-text { color: #EF4444; font-size: 13px; margin-top: 12px; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
      .filter-group { flex-direction: column; }
    }
  `]
})
export class Od implements OnInit {
  operations: OperationDiverse[] = [];
  filteredOD: OperationDiverse[] = [];
  
  currentOD: Partial<OperationDiverse> = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    categorie: 'divers',
    montant: 0,
    type: 'charge',
    validee: false
  };
  
  searchTerm = '';
  typeFilter = '';
  valideeFilter = '';
  categorieFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  odToDelete: OperationDiverse | null = null;
  successMessage = '';

  totalOD = 0;

  ngOnInit() { 
    this.loadOD(); 
  }

  openForm() {
    this.currentOD = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      categorie: 'divers',
      montant: 0,
      type: 'charge',
      validee: false
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadOD() {
    const saved = localStorage.getItem('operations_diverses');
    this.operations = saved ? JSON.parse(saved) : [];
    this.filteredOD = [...this.operations];
    this.calculerTotal();
  }

  saveOD() {
    if (this.editMode && this.currentOD.id) {
      const index = this.operations.findIndex(o => o.id === this.currentOD.id);
      if (index !== -1) {
        if (this.currentOD.validee && !this.operations[index].validee) {
          this.currentOD.date_validation = new Date().toISOString();
        }
        this.operations[index] = { ...this.currentOD } as OperationDiverse;
        this.showSuccess('Opération modifiée');
      }
    } else {
      const newOD = { 
        ...this.currentOD, 
        id: Date.now(),
        date_validation: this.currentOD.validee ? new Date().toISOString() : undefined
      } as OperationDiverse;
      this.operations.push(newOD);
      this.showSuccess('Opération ajoutée');
    }
    localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
    this.filterOD();
    this.cancelForm();
  }

  toggleValidee(od: OperationDiverse) {
    od.validee = !od.validee;
    if (od.validee) {
      od.date_validation = new Date().toISOString();
    }
    localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
    this.filterOD();
    this.showSuccess(od.validee ? 'Opération validée' : 'Validation retirée');
  }

  editOD(od: OperationDiverse) {
    this.currentOD = { ...od };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(od: OperationDiverse) {
    this.odToDelete = od;
    this.showDeleteModal = true;
  }

  deleteOD() {
    if (this.odToDelete) {
      this.operations = this.operations.filter(o => o.id !== this.odToDelete?.id);
      localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
      this.filterOD();
      this.showDeleteModal = false;
      this.odToDelete = null;
      this.showSuccess('Opération supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterOD() {
    let filtered = this.operations;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.libelle?.toLowerCase().includes(term) ||
        o.reference?.toLowerCase().includes(term) ||
        o.notes?.toLowerCase().includes(term)
      );
    }

    if (this.typeFilter) {
      filtered = filtered.filter(o => o.type === this.typeFilter);
    }

    if (this.valideeFilter) {
      const validee = this.valideeFilter === 'true';
      filtered = filtered.filter(o => o.validee === validee);
    }

    if (this.categorieFilter) {
      filtered = filtered.filter(o => o.categorie === this.categorieFilter);
    }

    this.filteredOD = filtered;
    this.calculerTotal();
  }

  calculerTotal() {
    this.totalOD = this.filteredOD.reduce((s, o) => s + (o.montant || 0), 0);
  }

  getTotalByType(type: string): number {
    return this.filteredOD
      .filter(o => o.type === type && o.validee)
      .reduce((s, o) => s + (o.montant || 0), 0);
  }

  getSolde(): number {
    return this.getTotalByType('produit') - this.getTotalByType('charge');
  }

  updateType() {
    // Mise à jour automatique des comptes selon le type
    if (this.currentOD.type === 'produit') {
      this.currentOD.compte_credit = '701';
    } else if (this.currentOD.type === 'charge') {
      this.currentOD.compte_debit = '601';
    }
  }

  updateMontant() {
    // Calcul automatique
  }

  getCategorieLabel(cat: string): string {
    const labels: any = { 
      achat: 'Achat', vente: 'Vente', frais: 'Frais', 
      salaire: 'Salaire', impot: 'Impôt', divers: 'Divers' 
    };
    return labels[cat] || cat;
  }

  getTypeLabel(type: string): string {
    const labels: any = { produit: 'Produit', charge: 'Charge', transfert: 'Transfert', correction: 'Correction' };
    return labels[type] || type;
  }

    exportToExcel() {
    if (!this.filteredOD || this.filteredOD.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredOD[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredOD.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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
    if (!this.filteredOD || this.filteredOD.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredOD[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredOD.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}