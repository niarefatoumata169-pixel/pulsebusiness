import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Partenaire {
  id?: number;
  reference: string;
  nom: string;
  secteur: string;
  contact: string;
  statut: 'prospect' | 'en_discussion' | 'client_actif' | 'partenaire';
  potentiel: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-partenariats',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="partenariats-container">
      <div class="header">
        <div>
          <h1>🤝 Partenariats</h1>
          <p class="subtitle">{{ partenaires.length }} partenaires / clients • Développement commercial</p>
        </div>
        <button class="btn-add" (click)="openForm()">+ Nouveau partenaire</button>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="partenaires.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🤝</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTotalPartenaires() }}</span>
            <span class="kpi-label">Partenaires</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPipeline() }}</span>
            <span class="kpi-label">Pipeline (Prospects)</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifs() }}</span>
            <span class="kpi-label">Actifs (Clients/Part.)</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPotentielTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Potentiel total</span>
          </div>
        </div>
      </div>

      <div class="filters-bar" *ngIf="partenaires.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPartenaires()" placeholder="Rechercher par nom, secteur, contact..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterPartenaires()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="prospect">📌 Prospect</option>
            <option value="en_discussion">🗣️ En discussion</option>
            <option value="client_actif">✅ Client actif</option>
            <option value="partenaire">🤝 Partenaire</option>
          </select>
        </div>
      </div>

      <div class="table-section" *ngIf="partenaires.length > 0; else emptyState">
        <div class="section-header">
          <h2>Liste des partenaires / clients</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredPartenaires.length }} / {{ partenaires.length }} affiché(s)</span>
          </div>
        </div>

        <div class="table-container">
          <table class="partenaires-table">
            <thead>
               <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>Potentiel</th>
                <th>Actions</th>
               </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredPartenaires">
                <td class="company-cell">
                  <strong>{{ p.nom }}</strong><br>
                  <span class="ref">Réf. {{ p.reference }}</span>
                </td>
                <td>{{ p.secteur || '-' }}</td>
                <td>{{ p.contact || '-' }}</td>
                <td>
                  <span class="statut-badge" [class]="p.statut">{{ getStatutLabel(p.statut) }}</span>
                </td>
                <td class="montant">{{ p.potentiel | number }} FCFA</td>
                <td class="actions-cell">
                  <button class="action-icon" (click)="editPartenaire(p)" title="Modifier">✏️</button>
                  <button class="action-icon delete" (click)="confirmDelete(p)" title="Supprimer">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🤝</div>
          <h2>Aucun partenaire</h2>
          <p>Ajoutez votre premier partenaire ou client</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau partenaire</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} partenaire</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="savePartenaire()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentPartenaire.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Nom / Raison sociale *</label>
                <input type="text" [(ngModel)]="currentPartenaire.nom" required>
              </div>
              <div class="form-group">
                <label>Secteur d'activité</label>
                <input type="text" [(ngModel)]="currentPartenaire.secteur">
              </div>
              <div class="form-group">
                <label>Contact (téléphone ou email)</label>
                <input type="text" [(ngModel)]="currentPartenaire.contact">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentPartenaire.statut">
                  <option value="prospect">📌 Prospect</option>
                  <option value="en_discussion">🗣️ En discussion</option>
                  <option value="client_actif">✅ Client actif</option>
                  <option value="partenaire">🤝 Partenaire</option>
                </select>
              </div>
              <div class="form-group">
                <label>Potentiel (FCFA)</label>
                <input type="number" [(ngModel)]="currentPartenaire.potentiel" step="100000">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentPartenaire.notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
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
            <p>Supprimer <strong>{{ partenaireToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deletePartenaire()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #EC4899;
      --primary-dark: #DB2777;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-500: #6B7280;
      --gray-700: #374151;
      --gray-900: #1F2937;
      --error: #EF4444;
      --success: #10B981;
    }

    .partenariats-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: var(--gray-50);
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
    }

    .subtitle {
      color: var(--gray-500);
      margin: 4px 0 0;
      font-size: 14px;
    }

    .btn-add, .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 24px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add:hover, .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(236,72,153,0.3);
    }

    .alert-success {
      background: var(--success);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .kpi-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      background: var(--gray-100);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }

    .kpi-label {
      font-size: 13px;
      color: var(--gray-500);
    }

    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      background: white;
      padding: 16px 20px;
      border-radius: 16px;
    }

    .search-wrapper {
      flex: 2;
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--gray-50);
      border-radius: 12px;
      padding: 8px 16px;
      border: 1px solid var(--gray-200);
    }

    .search-icon {
      color: var(--gray-500);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
    }

    .filter-group {
      flex: 1;
    }

    .filter-select {
      width: 100%;
      padding: 8px 16px;
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      background: white;
      font-size: 14px;
    }

    .table-section {
      background: white;
      border-radius: 16px;
      padding: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .header-stats {
      display: flex;
      gap: 12px;
    }

    .stat-badge {
      background: var(--gray-100);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      color: var(--gray-700);
    }

    .table-container {
      overflow-x: auto;
    }

    .partenaires-table {
      width: 100%;
      border-collapse: collapse;
    }

    .partenaires-table th {
      text-align: left;
      padding: 12px;
      background: var(--gray-50);
      font-weight: 600;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-200);
    }

    .partenaires-table td {
      padding: 16px 12px;
      border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }

    .company-cell .ref {
      font-size: 11px;
      color: var(--gray-500);
      font-family: monospace;
    }

    .montant {
      font-weight: 500;
      color: var(--primary);
    }

    .statut-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .statut-badge.prospect { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.en_discussion { background: #FEF3C7; color: #D97706; }
    .statut-badge.client_actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.partenaire { background: #F3F4F6; color: #6B7280; }

    .actions-cell {
      white-space: nowrap;
    }

    .action-icon {
      background: none;
      border: 1px solid var(--gray-200);
      border-radius: 6px;
      padding: 4px 8px;
      margin: 0 4px;
      cursor: pointer;
      transition: 0.2s;
    }

    .action-icon:hover {
      background: var(--gray-100);
      border-color: var(--primary);
    }

    .action-icon.delete:hover {
      background: #FEE2E2;
      border-color: var(--error);
    }

    .empty-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
      border: 2px dashed var(--gray-200);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideIn 0.2s ease;
    }

    .modal-container.small {
      max-width: 450px;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--gray-200);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--primary);
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--gray-500);
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--gray-700);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--gray-200);
      border-radius: 10px;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
    }

    .readonly {
      background: var(--gray-100);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-secondary {
      background: white;
      border: 2px solid var(--gray-200);
      padding: 10px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-danger {
      background: var(--error);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .filters-bar {
        flex-direction: column;
      }
      .partenaires-table th,
      .partenaires-table td {
        padding: 8px;
        font-size: 12px;
      }
      .actions-cell .action-icon {
        padding: 2px 6px;
      }
    }
  `]
})
export class Partenariats implements OnInit {
  partenaires: Partenaire[] = [];
  filteredPartenaires: Partenaire[] = [];

  searchTerm = '';
  statutFilter = '';

  showForm = false;
  editMode = false;
  showDeleteModal = false;
  partenaireToDelete: Partenaire | null = null;
  successMessage = '';

  currentPartenaire: Partial<Partenaire> = {
    reference: '',
    nom: '',
    secteur: '',
    contact: '',
    statut: 'prospect',
    potentiel: 0,
    notes: ''
  };

  ngOnInit() {
    this.loadPartenaires();
  }

  loadPartenaires() {
    const saved = localStorage.getItem('partenariats');
    this.partenaires = saved ? JSON.parse(saved) : [];
    this.filteredPartenaires = [...this.partenaires];
  }

  savePartenaires() {
    localStorage.setItem('partenariats', JSON.stringify(this.partenaires));
  }

  openForm() {
    this.currentPartenaire = {
      reference: this.generateReference(),
      nom: '',
      secteur: '',
      contact: '',
      statut: 'prospect',
      potentiel: 0,
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.partenaires.length + 1;
    return `PART-${String(count).padStart(4, '0')}`;
  }

  savePartenaire() {
    if (!this.currentPartenaire.nom) {
      alert('Le nom est requis');
      return;
    }

    if (this.editMode && this.currentPartenaire.id) {
      const index = this.partenaires.findIndex(p => p.id === this.currentPartenaire.id);
      if (index !== -1) {
        this.partenaires[index] = { ...this.currentPartenaire, updated_at: new Date().toISOString() } as Partenaire;
        this.showSuccess('Partenaire modifié');
      }
    } else {
      this.partenaires.push({
        ...this.currentPartenaire,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Partenaire);
      this.showSuccess('Partenaire ajouté');
    }
    this.savePartenaires();
    this.filterPartenaires();
    this.cancelForm();
  }

  editPartenaire(p: Partenaire) {
    this.currentPartenaire = { ...p };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(p: Partenaire) {
    this.partenaireToDelete = p;
    this.showDeleteModal = true;
  }

  deletePartenaire() {
    if (this.partenaireToDelete) {
      this.partenaires = this.partenaires.filter(p => p.id !== this.partenaireToDelete?.id);
      this.savePartenaires();
      this.filterPartenaires();
      this.showDeleteModal = false;
      this.partenaireToDelete = null;
      this.showSuccess('Partenaire supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterPartenaires() {
    let filtered = [...this.partenaires];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(term) ||
        p.secteur?.toLowerCase().includes(term) ||
        p.contact?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term)
      );
    }

    if (this.statutFilter) {
      filtered = filtered.filter(p => p.statut === this.statutFilter);
    }

    this.filteredPartenaires = filtered;
  }

  getTotalPartenaires(): number {
    return this.partenaires.filter(p => p.statut === 'partenaire' || p.statut === 'client_actif').length;
  }

  getPipeline(): number {
    return this.partenaires.filter(p => p.statut === 'prospect' || p.statut === 'en_discussion').length;
  }

  getActifs(): number {
    return this.partenaires.filter(p => p.statut === 'client_actif' || p.statut === 'partenaire').length;
  }

  getPotentielTotal(): number {
    return this.partenaires.reduce((sum, p) => sum + (p.potentiel || 0), 0);
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      prospect: '📌 Prospect',
      en_discussion: '🗣️ En discussion',
      client_actif: '✅ Client actif',
      partenaire: '🤝 Partenaire'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}