import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MouvementTresorerie {
  id?: number;
  date: string;
  libelle: string;
  categorie: 'encaissement' | 'decaissement' | 'virement' | 'frais';
  montant: number;
  mode: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  compte_source?: string;
  compte_destination?: string;
  beneficiaire?: string;
  reference?: string;
  notes?: string;
  piece_jointe?: string;
}

@Component({
  selector: 'app-tresorerie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="tresorerie-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>💰 Trésorerie</h1>
          <p class="subtitle">{{ mouvements.length }} mouvement(s) • Solde: {{ solde | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="mouvements.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="mouvements.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau mouvement</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="mouvements.length > 0">
        <div class="kpi-card solde">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ solde | number }} <small>FCFA</small></span>
            <span class="kpi-label">Solde disponible</span>
          </div>
        </div>
        <div class="kpi-card encaissements">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <span class="kpi-value">+ {{ totalEncaissements | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total encaissements</span>
          </div>
        </div>
        <div class="kpi-card decaissements">
          <div class="kpi-icon">📉</div>
          <div class="kpi-content">
            <span class="kpi-value">- {{ totalDecaissements | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total décaissements</span>
          </div>
        </div>
        <div class="kpi-card mouvements">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMouvementsMois() }}</span>
            <span class="kpi-label">Mouvements ce mois</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} mouvement de trésorerie</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMouvement()">
              <div class="form-row">
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="currentMouvement.date" name="date" required>
                </div>
                <div class="form-group">
                  <label>Libellé *</label>
                  <input type="text" [(ngModel)]="currentMouvement.libelle" name="libelle" required placeholder="Description">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Catégorie</label>
                  <div class="type-toggle">
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.categorie === 'encaissement'" (click)="currentMouvement.categorie = 'encaissement'">
                      📥 Encaissement
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.categorie === 'decaissement'" (click)="currentMouvement.categorie = 'decaissement'">
                      📤 Décaissement
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.categorie === 'virement'" (click)="currentMouvement.categorie = 'virement'">
                      🔄 Virement
                    </button>
                    <button type="button" class="toggle-btn" [class.active]="currentMouvement.categorie === 'frais'" (click)="currentMouvement.categorie = 'frais'">
                      📋 Frais
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Mode de paiement</label>
                  <select [(ngModel)]="currentMouvement.mode" name="mode">
                    <option value="especes">💵 Espèces</option>
                    <option value="carte">💳 Carte</option>
                    <option value="cheque">📝 Chèque</option>
                    <option value="virement">🏦 Virement</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Montant *</label>
                  <input type="number" [(ngModel)]="currentMouvement.montant" name="montant" required placeholder="0">
                </div>
                <div class="form-group">
                  <label>Référence</label>
                  <input type="text" [(ngModel)]="currentMouvement.reference" name="reference" placeholder="N° facture, chèque...">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Compte source</label>
                  <input type="text" [(ngModel)]="currentMouvement.compte_source" name="compte_source" placeholder="Ex: Caisse, Banque...">
                </div>
                <div class="form-group">
                  <label>Compte destination</label>
                  <input type="text" [(ngModel)]="currentMouvement.compte_destination" name="compte_destination" placeholder="Ex: Caisse, Banque...">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Bénéficiaire</label>
                  <input type="text" [(ngModel)]="currentMouvement.beneficiaire" name="beneficiaire" placeholder="Nom du bénéficiaire">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentMouvement.notes" name="notes" rows="3" placeholder="Informations complémentaires..."></textarea>
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
      <div class="filters-section" *ngIf="mouvements.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher par libellé, bénéficiaire..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="encaissement">📥 Encaissements</option>
            <option value="decaissement">📤 Décaissements</option>
            <option value="virement">🔄 Virements</option>
            <option value="frais">📋 Frais</option>
          </select>
          <select [(ngModel)]="modeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
            <option value="">Tous modes</option>
            <option value="especes">💵 Espèces</option>
            <option value="carte">💳 Carte</option>
            <option value="cheque">📝 Chèque</option>
            <option value="virement">🏦 Virement</option>
            <option value="mobile_money">📱 Mobile Money</option>
          </select>
        </div>
      </div>

      <!-- Liste des mouvements améliorée -->
      <div class="mouvements-section" *ngIf="mouvements.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Journal des mouvements</h2>
          <div class="header-stats">
            <span class="stat-badge encaissements">+ {{ totalEncaissements | number }} FCFA</span>
            <span class="stat-badge decaissements">- {{ totalDecaissements | number }} FCFA</span>
          </div>
        </div>
        
        <div class="mouvements-list">
          <div class="mouvement-card" *ngFor="let m of filteredMouvements" [class]="m.categorie">
            <div class="card-header">
              <div class="header-left">
                <div class="mouvement-icon" [class]="m.categorie">
                  {{ m.categorie === 'encaissement' ? '📥' : m.categorie === 'decaissement' ? '📤' : m.categorie === 'virement' ? '🔄' : '📋' }}
                </div>
                <div class="mouvement-info">
                  <div class="mouvement-libelle">{{ m.libelle }}</div>
                  <div class="mouvement-details">
                    <span class="detail-date">{{ m.date | date:'dd/MM/yyyy' }}</span>
                    <span class="detail-mode">{{ getModeLabel(m.mode) }}</span>
                    <span *ngIf="m.reference" class="detail-ref">Réf: {{ m.reference }}</span>
                  </div>
                  <div *ngIf="m.beneficiaire" class="mouvement-beneficiaire">
                    👤 {{ m.beneficiaire }}
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="mouvement-montant" [class]="m.categorie">
                  {{ m.categorie === 'encaissement' ? '+' : '-' }}{{ m.montant | number }} FCFA
                </div>
                <div class="mouvement-comptes" *ngIf="m.compte_source || m.compte_destination">
                  <span *ngIf="m.compte_source">De: {{ m.compte_source }}</span>
                  <span *ngIf="m.compte_destination">Vers: {{ m.compte_destination }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer" *ngIf="m.notes">
              <div class="notes-info">
                📝 {{ m.notes | slice:0:100 }}{{ m.notes.length > 100 ? '...' : '' }}
              </div>
            </div>
            <div class="card-actions">
              <button class="action-icon" (click)="editMouvement(m)" title="Modifier">✏️</button>
              <button class="action-icon delete" (click)="confirmDelete(m)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <h2>Aucun mouvement de trésorerie</h2>
          <p>Ajoutez votre premier mouvement</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau mouvement</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le mouvement <strong>{{ mouvementToDelete?.libelle }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteMouvement()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tresorerie-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.solde .kpi-value { color: #EC4899; }
    .kpi-card.encaissements .kpi-value { color: #10B981; }
    .kpi-card.decaissements .kpi-value { color: #EF4444; }
    
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
    
    .mouvements-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.encaissements { background: #DCFCE7; color: #16A34A; }
    .stat-badge.decaissements { background: #FEE2E2; color: #EF4444; }
    
    .mouvements-list { display: flex; flex-direction: column; gap: 16px; }
    .mouvement-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .mouvement-card.encaissement { border-left-color: #10B981; }
    .mouvement-card.decaissement { border-left-color: #EF4444; }
    .mouvement-card.virement { border-left-color: #EC4899; }
    .mouvement-card.frais { border-left-color: #F59E0B; }
    .mouvement-card:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; gap: 16px; align-items: flex-start; flex: 1; }
    .mouvement-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .mouvement-libelle { font-weight: 600; color: #1F2937; margin-bottom: 6px; }
    .mouvement-details { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .detail-date { font-size: 11px; color: #9CA3AF; }
    .detail-mode { font-size: 11px; padding: 2px 8px; background: #E5E7EB; border-radius: 20px; color: #4B5563; }
    .detail-ref { font-size: 10px; color: #6B7280; font-family: monospace; }
    .mouvement-beneficiaire { font-size: 12px; color: #6B7280; }
    .header-right { text-align: right; }
    .mouvement-montant { font-size: 20px; font-weight: 700; }
    .mouvement-montant.encaissement { color: #10B981; }
    .mouvement-montant.decaissement { color: #EF4444; }
    .mouvement-comptes { font-size: 11px; color: #9CA3AF; margin-top: 4px; display: flex; gap: 8px; justify-content: flex-end; }
    .card-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #F3F4F6; }
    .notes-info { font-size: 12px; color: #6B7280; font-style: italic; }
    .card-actions { margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .card-header { flex-direction: column; }
      .header-right { text-align: left; }
      .mouvement-comptes { justify-content: flex-start; }
    }
  `]
})
export class Tresorerie implements OnInit {
  mouvements: MouvementTresorerie[] = [];
  filteredMouvements: MouvementTresorerie[] = [];
  
  currentMouvement: Partial<MouvementTresorerie> = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    categorie: 'encaissement',
    montant: 0,
    mode: 'especes',
    notes: ''
  };
  
  searchTerm = '';
  categorieFilter = '';
  modeFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  mouvementToDelete: MouvementTresorerie | null = null;
  successMessage = '';

  solde = 0;
  totalEncaissements = 0;
  totalDecaissements = 0;

  ngOnInit() { 
    this.loadMouvements(); 
  }

  openForm() {
    this.currentMouvement = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      categorie: 'encaissement',
      montant: 0,
      mode: 'especes',
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  loadMouvements() {
    const saved = localStorage.getItem('mouvements_tresorerie');
    this.mouvements = saved ? JSON.parse(saved) : [];
    this.filteredMouvements = [...this.mouvements];
    this.calculerStats();
  }

  saveMouvements() {
    localStorage.setItem('mouvements_tresorerie', JSON.stringify(this.mouvements));
    this.calculerStats();
  }

  saveMouvement() {
    if (this.editMode && this.currentMouvement.id) {
      const index = this.mouvements.findIndex(m => m.id === this.currentMouvement.id);
      if (index !== -1) {
        this.mouvements[index] = { ...this.currentMouvement } as MouvementTresorerie;
        this.showSuccess('Mouvement modifié');
      }
    } else {
      const newMouvement = { ...this.currentMouvement, id: Date.now() } as MouvementTresorerie;
      this.mouvements.push(newMouvement);
      this.showSuccess('Mouvement ajouté');
    }
    this.saveMouvements();
    this.filterMouvements();
    this.cancelForm();
  }

  editMouvement(m: MouvementTresorerie) {
    this.currentMouvement = { ...m };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(m: MouvementTresorerie) {
    this.mouvementToDelete = m;
    this.showDeleteModal = true;
  }

  deleteMouvement() {
    if (this.mouvementToDelete) {
      this.mouvements = this.mouvements.filter(m => m.id !== this.mouvementToDelete?.id);
      this.saveMouvements();
      this.filterMouvements();
      this.showDeleteModal = false;
      this.mouvementToDelete = null;
      this.showSuccess('Mouvement supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterMouvements() {
    let filtered = this.mouvements;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.libelle?.toLowerCase().includes(term) ||
        m.beneficiaire?.toLowerCase().includes(term) ||
        m.reference?.toLowerCase().includes(term)
      );
    }

    if (this.categorieFilter) {
      filtered = filtered.filter(m => m.categorie === this.categorieFilter);
    }

    if (this.modeFilter) {
      filtered = filtered.filter(m => m.mode === this.modeFilter);
    }

    this.filteredMouvements = filtered;
  }

  calculerStats() {
    this.solde = this.mouvements.reduce((s, m) => {
      if (m.categorie === 'encaissement') return s + m.montant;
      if (m.categorie === 'decaissement') return s - m.montant;
      return s;
    }, 0);
    
    this.totalEncaissements = this.mouvements
      .filter(m => m.categorie === 'encaissement')
      .reduce((s, m) => s + m.montant, 0);
      
    this.totalDecaissements = this.mouvements
      .filter(m => m.categorie === 'decaissement')
      .reduce((s, m) => s + m.montant, 0);
  }

  getMouvementsMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    return this.mouvements.filter(m => {
      const date = new Date(m.date);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }

  getCategorieLabel(cat: string): string {
    const labels: any = { encaissement: '📥 Encaissement', decaissement: '📤 Décaissement', virement: '🔄 Virement', frais: '📋 Frais' };
    return labels[cat] || cat;
  }

  getModeLabel(mode: string): string {
    const labels: any = { especes: '💵 Espèces', carte: '💳 Carte', cheque: '📝 Chèque', virement: '🏦 Virement', mobile_money: '📱 Mobile Money' };
    return labels[mode] || mode;
  }

    exportToExcel() {
    if (!this.filteredMouvements || this.filteredMouvements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMouvements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredMouvements.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
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
    if (!this.filteredMouvements || this.filteredMouvements.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMouvements[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredMouvements.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}