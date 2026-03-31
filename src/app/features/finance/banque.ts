import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CompteBancaire {
  id?: number;
  code: string;
  nom: string;
  banque: string;
  numero: string;
  type: 'compte_courant' | 'epargne' | 'bloque';
  devise: string;
  solde: number;
  agence?: string;
  titulaire?: string;
  statut: 'actif' | 'inactif';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-banque',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="banque-container">
      <div class="header">
        <div>
          <h1>🏦 Comptes bancaires</h1>
          <p class="subtitle">{{ comptes.length }} compte(s) • Solde total: {{ getSoldeTotal() | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouveau compte</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="comptes.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🏦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ comptes.length }}</span>
            <span class="kpi-label">Comptes</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getSoldeTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Solde total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getComptesActifs() }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="comptes.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterComptes()" placeholder="Rechercher par code, banque, numéro..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterComptes()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
          </select>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterComptes()" class="filter-select">
            <option value="">Tous types</option>
            <option value="compte_courant">💳 Compte courant</option>
            <option value="epargne">📈 Épargne</option>
            <option value="bloque">🔒 Bloqué</option>
          </select>
        </div>
      </div>

      <div class="comptes-section" *ngIf="comptes.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des comptes</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredComptes.length }} / {{ comptes.length }} affiché(s)</span>
          </div>
        </div>
        <div class="comptes-grid">
          <div class="compte-card" *ngFor="let c of filteredComptes" [class]="c.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="compte-icon">🏦</div>
                <div class="compte-info">
                  <div class="compte-code">{{ c.code }}</div>
                  <div class="compte-nom">{{ c.nom }}</div>
                  <div class="compte-banque">{{ c.banque }} - {{ c.numero }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="compte-solde">{{ c.solde | number }} FCFA</div>
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📊 Type:</span>
                <span class="info-value">{{ getTypeLabel(c.type) }}</span>
              </div>
              <div class="info-row" *ngIf="c.titulaire">
                <span class="info-label">👤 Titulaire:</span>
                <span class="info-value">{{ c.titulaire }}</span>
              </div>
              <div class="info-row" *ngIf="c.agence">
                <span class="info-label">🏢 Agence:</span>
                <span class="info-value">{{ c.agence }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editCompte(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="ajouterMouvement(c)" title="Ajouter mouvement">💸</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏦</div>
          <h2>Aucun compte bancaire</h2>
          <p>Ajoutez votre premier compte</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau compte</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} compte</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCompte()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentCompte.code" required>
              </div>
              <div class="form-group">
                <label>Nom du compte *</label>
                <input type="text" [(ngModel)]="currentCompte.nom" required>
              </div>
              <div class="form-group">
                <label>Banque *</label>
                <input type="text" [(ngModel)]="currentCompte.banque" required>
              </div>
              <div class="form-group">
                <label>Numéro de compte *</label>
                <input type="text" [(ngModel)]="currentCompte.numero" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="currentCompte.type">
                    <option value="compte_courant">💳 Compte courant</option>
                    <option value="epargne">📈 Épargne</option>
                    <option value="bloque">🔒 Bloqué</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Devise</label>
                  <select [(ngModel)]="currentCompte.devise">
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Solde initial</label>
                <input type="number" [(ngModel)]="currentCompte.solde" step="1000">
              </div>
              <div class="form-group">
                <label>Agence</label>
                <input type="text" [(ngModel)]="currentCompte.agence">
              </div>
              <div class="form-group">
                <label>Titulaire</label>
                <input type="text" [(ngModel)]="currentCompte.titulaire">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentCompte.statut">
                  <option value="actif">✅ Actif</option>
                  <option value="inactif">⏸️ Inactif</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentCompte.notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedCompte">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails du compte - {{ selectedCompte.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Code:</strong> {{ selectedCompte.code }}</p>
              <p><strong>Banque:</strong> {{ selectedCompte.banque }}</p>
              <p><strong>Numéro:</strong> {{ selectedCompte.numero }}</p>
              <p><strong>Type:</strong> {{ getTypeLabel(selectedCompte.type) }}</p>
              <p><strong>Devise:</strong> {{ selectedCompte.devise }}</p>
              <p><strong>Solde:</strong> {{ selectedCompte.solde | number }} FCFA</p>
              <p><strong>Agence:</strong> {{ selectedCompte.agence || '-' }}</p>
              <p><strong>Titulaire:</strong> {{ selectedCompte.titulaire || '-' }}</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedCompte.statut) }}</p>
              <p *ngIf="selectedCompte.notes"><strong>Notes:</strong> {{ selectedCompte.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal mouvement (simplifié) -->
      <div class="modal-overlay" *ngIf="showMouvementModal && mouvementCompte">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>💸 Ajouter un mouvement</h3>
            <button class="modal-close" (click)="showMouvementModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="mouvementType">
                <option value="depot">💵 Dépôt</option>
                <option value="retrait">💸 Retrait</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant</label>
              <input type="number" [(ngModel)]="mouvementMontant" step="1000">
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="mouvementDate">
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" [(ngModel)]="mouvementDescription">
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showMouvementModal = false">Annuler</button>
              <button class="btn-primary" (click)="saveMouvement()">💾 Enregistrer</button>
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
            <p>Supprimer le compte <strong>{{ compteToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteCompte()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .banque-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .comptes-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .comptes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .compte-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .compte-card.actif { border-left-color: #10B981; }
    .compte-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .compte-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .compte-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .compte-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .compte-nom { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .compte-banque { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .compte-solde { font-weight: 700; color: #EC4899; margin-bottom: 8px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
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
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .comptes-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } .filter-group { flex-direction: column; } }
  `]
})
export class Banque implements OnInit {
  comptes: CompteBancaire[] = [];
  filteredComptes: CompteBancaire[] = [];
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showMouvementModal = false;
  editMode = false;
  selectedCompte: CompteBancaire | null = null;
  compteToDelete: CompteBancaire | null = null;
  mouvementCompte: CompteBancaire | null = null;
  mouvementType = 'depot';
  mouvementMontant = 0;
  mouvementDate = new Date().toISOString().split('T')[0];
  mouvementDescription = '';
  successMessage = '';

  currentCompte: Partial<CompteBancaire> = {
    code: '',
    nom: '',
    banque: '',
    numero: '',
    type: 'compte_courant',
    devise: 'FCFA',
    solde: 0,
    statut: 'actif'
  };

  ngOnInit() {
    this.loadComptes();
  }

  loadComptes() {
    const saved = localStorage.getItem('comptes_bancaires');
    this.comptes = saved ? JSON.parse(saved) : [];
    this.filteredComptes = [...this.comptes];
  }

  saveComptes() {
    localStorage.setItem('comptes_bancaires', JSON.stringify(this.comptes));
  }

  openForm() {
    this.currentCompte = {
      code: this.generateCode(),
      nom: '',
      banque: '',
      numero: '',
      type: 'compte_courant',
      devise: 'FCFA',
      solde: 0,
      agence: '',
      titulaire: '',
      statut: 'actif'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.comptes.length + 1;
    return `CPT-${String(count).padStart(4, '0')}`;
  }

  saveCompte() {
    if (!this.currentCompte.code || !this.currentCompte.nom || !this.currentCompte.banque || !this.currentCompte.numero) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentCompte.id) {
      const index = this.comptes.findIndex(c => c.id === this.currentCompte.id);
      if (index !== -1) {
        this.comptes[index] = { ...this.currentCompte, updated_at: new Date().toISOString() } as CompteBancaire;
        this.showSuccess('Compte modifié');
      }
    } else {
      this.comptes.push({
        ...this.currentCompte,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as CompteBancaire);
      this.showSuccess('Compte ajouté');
    }
    this.saveComptes();
    this.filterComptes();
    this.cancelForm();
  }

  editCompte(c: CompteBancaire) {
    this.currentCompte = { ...c };
    this.editMode = true;
    this.showForm = true;
  }

  ajouterMouvement(c: CompteBancaire) {
    this.mouvementCompte = c;
    this.mouvementType = 'depot';
    this.mouvementMontant = 0;
    this.mouvementDate = new Date().toISOString().split('T')[0];
    this.mouvementDescription = '';
    this.showMouvementModal = true;
  }

  saveMouvement() {
    if (this.mouvementCompte && this.mouvementMontant > 0) {
      if (this.mouvementType === 'depot') {
        this.mouvementCompte.solde += this.mouvementMontant;
      } else {
        this.mouvementCompte.solde -= this.mouvementMontant;
      }
      this.saveComptes();
      this.filterComptes();
      this.showMouvementModal = false;
      this.showSuccess('Mouvement enregistré');
    } else {
      alert('Montant invalide');
    }
  }

  viewDetails(c: CompteBancaire) {
    this.selectedCompte = c;
    this.showDetailsModal = true;
  }

  confirmDelete(c: CompteBancaire) {
    this.compteToDelete = c;
    this.showDeleteModal = true;
  }

  deleteCompte() {
    if (this.compteToDelete) {
      this.comptes = this.comptes.filter(c => c.id !== this.compteToDelete?.id);
      this.saveComptes();
      this.filterComptes();
      this.showDeleteModal = false;
      this.compteToDelete = null;
      this.showSuccess('Compte supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterComptes() {
    let filtered = [...this.comptes];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.code?.toLowerCase().includes(term) ||
        c.nom?.toLowerCase().includes(term) ||
        c.banque?.toLowerCase().includes(term) ||
        c.numero?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    this.filteredComptes = filtered;
  }

  getSoldeTotal(): number {
    return this.comptes.reduce((sum, c) => sum + (c.solde || 0), 0);
  }

  getComptesActifs(): number {
    return this.comptes.filter(c => c.statut === 'actif').length;
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      compte_courant: '💳 Compte courant',
      epargne: '📈 Épargne',
      bloque: '🔒 Bloqué'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    return statut === 'actif' ? '✅ Actif' : '⏸️ Inactif';
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}