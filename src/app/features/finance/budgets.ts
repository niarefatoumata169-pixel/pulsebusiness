import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Budget {
  id?: number;
  code: string;
  titre: string;
  departement_id?: number;
  departement_nom?: string;
  montant: number;
  depenses: number;      // déjà engagé
  disponible: number;
  periode_debut: string;
  periode_fin: string;
  statut: 'en_cours' | 'termine' | 'annule';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="budgets-container">
      <div class="header">
        <div>
          <h1>💰 Gestion des budgets</h1>
          <p class="subtitle">{{ budgets.length }} budget(s) • Total alloué: {{ getMontantTotal() | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouveau budget</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="budgets.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ budgets.length }}</span>
            <span class="kpi-label">Budgets</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getMontantTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Total alloué</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💸</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getDepensesTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Dépenses engagées</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getDisponibleTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Disponible</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="budgets.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterBudgets()" placeholder="Rechercher par titre, département..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterBudgets()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="termine">✅ Terminé</option>
            <option value="annule">❌ Annulé</option>
          </select>
        </div>
      </div>

      <div class="budgets-section" *ngIf="budgets.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des budgets</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredBudgets.length }} / {{ budgets.length }} affiché(s)</span>
          </div>
        </div>
        <div class="budgets-grid">
          <div class="budget-card" *ngFor="let b of filteredBudgets" [class]="b.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="budget-icon">💰</div>
                <div class="budget-info">
                  <div class="budget-code">{{ b.code }}</div>
                  <div class="budget-titre">{{ b.titre }}</div>
                  <div class="budget-departement" *ngIf="b.departement_nom">{{ b.departement_nom }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="budget-montant">{{ b.montant | number }} FCFA</div>
                <span class="statut-badge" [class]="b.statut">{{ getStatutLabel(b.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Période:</span>
                <span class="info-value">{{ b.periode_debut | date:'dd/MM/yyyy' }} → {{ b.periode_fin | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💸 Dépensé:</span>
                <span class="info-value">{{ b.depenses | number }} FCFA</span>
              </div>
              <div class="info-row">
                <span class="info-label">✅ Disponible:</span>
                <span class="info-value disponible">{{ b.disponible | number }} FCFA</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getPourcentageDepense(b)"></div>
                <span class="progress-text">{{ getPourcentageDepense(b) }}% utilisé</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(b)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editBudget(b)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="ajouterDepense(b)" title="Ajouter dépense">💸</button>
                <button class="action-icon delete" (click)="confirmDelete(b)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucun budget</h2>
          <p>Créez votre premier budget</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau budget</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} budget</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveBudget()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentBudget.code" required>
              </div>
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentBudget.titre" required>
              </div>
              <div class="form-group">
                <label>Département</label>
                <select [(ngModel)]="currentBudget.departement_id" (change)="onDepartementChange()">
                  <option [value]="null">Sélectionner un département</option>
                  <option *ngFor="let d of departements" [value]="d.id">{{ d.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Montant total *</label>
                <input type="number" [(ngModel)]="currentBudget.montant" step="100000" (input)="recalculerDisponible()" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date début *</label>
                  <input type="date" [(ngModel)]="currentBudget.periode_debut" required>
                </div>
                <div class="form-group">
                  <label>Date fin *</label>
                  <input type="date" [(ngModel)]="currentBudget.periode_fin" required>
                </div>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentBudget.statut">
                  <option value="en_cours">🔄 En cours</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentBudget.notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal ajout dépense -->
      <div class="modal-overlay" *ngIf="showDepenseModal && depenseBudget">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>💸 Ajouter une dépense</h3>
            <button class="modal-close" (click)="showDepenseModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Montant</label>
              <input type="number" [(ngModel)]="depenseMontant" step="1000">
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" [(ngModel)]="depenseDescription">
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDepenseModal = false">Annuler</button>
              <button class="btn-primary" (click)="saveDepense()">💾 Enregistrer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedBudget">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails du budget - {{ selectedBudget.titre }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Code:</strong> {{ selectedBudget.code }}</p>
              <p><strong>Département:</strong> {{ selectedBudget.departement_nom || '-' }}</p>
              <p><strong>Période:</strong> {{ selectedBudget.periode_debut | date:'dd/MM/yyyy' }} → {{ selectedBudget.periode_fin | date:'dd/MM/yyyy' }}</p>
              <p><strong>Montant total:</strong> {{ selectedBudget.montant | number }} FCFA</p>
              <p><strong>Dépenses engagées:</strong> {{ selectedBudget.depenses | number }} FCFA</p>
              <p><strong>Disponible:</strong> {{ selectedBudget.disponible | number }} FCFA</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedBudget.statut) }}</p>
              <p *ngIf="selectedBudget.notes"><strong>Notes:</strong> {{ selectedBudget.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer le budget <strong>{{ budgetToDelete?.titre }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteBudget()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budgets-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 1; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .budgets-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .budget-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .budget-card.en_cours { border-left-color: #3B82F6; }
    .budget-card.termine { border-left-color: #10B981; opacity: 0.9; }
    .budget-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .budget-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .budget-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .budget-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .budget-titre { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .budget-departement { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .budget-montant { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.termine { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .info-value.disponible { color: #10B981; font-weight: 600; }
    .progress-bar { background: #F3F4F6; border-radius: 20px; height: 6px; margin-top: 12px; position: relative; }
    .progress-fill { background: #3B82F6; border-radius: 20px; height: 6px; }
    .progress-text { font-size: 10px; color: #6B7280; position: absolute; right: 0; top: -16px; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .budgets-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } }
  `]
})
export class Budgets implements OnInit {
  budgets: Budget[] = [];
  filteredBudgets: Budget[] = [];
  departements: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showDepenseModal = false;
  editMode = false;
  selectedBudget: Budget | null = null;
  budgetToDelete: Budget | null = null;
  depenseBudget: Budget | null = null;
  depenseMontant = 0;
  depenseDescription = '';
  successMessage = '';

  currentBudget: Partial<Budget> = {
    code: '',
    titre: '',
    montant: 0,
    depenses: 0,
    disponible: 0,
    periode_debut: new Date().toISOString().split('T')[0],
    periode_fin: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    statut: 'en_cours'
  };

  ngOnInit() {
    this.loadDepartements();
    this.loadBudgets();
  }

  loadDepartements() {
    const saved = localStorage.getItem('departements');
    this.departements = saved ? JSON.parse(saved) : [];
  }

  loadBudgets() {
    const saved = localStorage.getItem('budgets');
    this.budgets = saved ? JSON.parse(saved) : [];
    this.filteredBudgets = [...this.budgets];
  }

  saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(this.budgets));
  }

  openForm() {
    this.currentBudget = {
      code: this.generateCode(),
      titre: '',
      montant: 0,
      depenses: 0,
      disponible: 0,
      periode_debut: new Date().toISOString().split('T')[0],
      periode_fin: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      statut: 'en_cours'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.budgets.length + 1;
    return `BUD-${String(count).padStart(4, '0')}`;
  }

  onDepartementChange() {
    const dept = this.departements.find(d => d.id === this.currentBudget.departement_id);
    if (dept) {
      this.currentBudget.departement_nom = dept.nom;
    } else {
      this.currentBudget.departement_nom = undefined;
    }
  }

  recalculerDisponible() {
    this.currentBudget.disponible = (this.currentBudget.montant || 0) - (this.currentBudget.depenses || 0);
  }

  saveBudget() {
    if (!this.currentBudget.code || !this.currentBudget.titre || !this.currentBudget.montant) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.recalculerDisponible();

    if (this.editMode && this.currentBudget.id) {
      const index = this.budgets.findIndex(b => b.id === this.currentBudget.id);
      if (index !== -1) {
        this.budgets[index] = { ...this.currentBudget, updated_at: new Date().toISOString() } as Budget;
        this.showSuccess('Budget modifié');
      }
    } else {
      this.budgets.push({
        ...this.currentBudget,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Budget);
      this.showSuccess('Budget ajouté');
    }
    this.saveBudgets();
    this.filterBudgets();
    this.cancelForm();
  }

  editBudget(b: Budget) {
    this.currentBudget = { ...b };
    this.editMode = true;
    this.showForm = true;
  }

  ajouterDepense(b: Budget) {
    this.depenseBudget = b;
    this.depenseMontant = 0;
    this.depenseDescription = '';
    this.showDepenseModal = true;
  }

  saveDepense() {
    if (this.depenseBudget && this.depenseMontant > 0) {
      const nouveauDepense = (this.depenseBudget.depenses || 0) + this.depenseMontant;
      if (nouveauDepense <= this.depenseBudget.montant) {
        this.depenseBudget.depenses = nouveauDepense;
        this.depenseBudget.disponible = this.depenseBudget.montant - nouveauDepense;
        this.saveBudgets();
        this.filterBudgets();
        this.showDepenseModal = false;
        this.showSuccess('Dépense enregistrée');
      } else {
        alert('Le montant dépasse le budget disponible');
      }
    }
  }

  viewDetails(b: Budget) {
    this.selectedBudget = b;
    this.showDetailsModal = true;
  }

  confirmDelete(b: Budget) {
    this.budgetToDelete = b;
    this.showDeleteModal = true;
  }

  deleteBudget() {
    if (this.budgetToDelete) {
      this.budgets = this.budgets.filter(b => b.id !== this.budgetToDelete?.id);
      this.saveBudgets();
      this.filterBudgets();
      this.showDeleteModal = false;
      this.budgetToDelete = null;
      this.showSuccess('Budget supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterBudgets() {
    let filtered = [...this.budgets];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.titre?.toLowerCase().includes(term) ||
        b.code?.toLowerCase().includes(term) ||
        b.departement_nom?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(b => b.statut === this.statutFilter);
    }
    this.filteredBudgets = filtered;
  }

  getMontantTotal(): number {
    return this.budgets.reduce((sum, b) => sum + (b.montant || 0), 0);
  }

  getDepensesTotal(): number {
    return this.budgets.reduce((sum, b) => sum + (b.depenses || 0), 0);
  }

  getDisponibleTotal(): number {
    return this.budgets.reduce((sum, b) => sum + (b.disponible || 0), 0);
  }

  getPourcentageDepense(b: Budget): number {
    if (!b.montant) return 0;
    return Math.min(100, Math.round(((b.depenses || 0) / b.montant) * 100));
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      en_cours: '🔄 En cours',
      termine: '✅ Terminé',
      annule: '❌ Annulé'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}