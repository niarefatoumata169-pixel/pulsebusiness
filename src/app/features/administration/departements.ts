import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Departement {
  id?: number;
  code: string;
  nom: string;
  entite_id?: number;
  entite_nom?: string;
  filiale_id?: number;
  filiale_nom?: string;
  description: string;
  responsable: string;
  email: string;
  telephone: string;
  budget: number;
  effectif: number;
  date_creation: string;
  statut: 'actif' | 'inactif' | 'restructure';
  notes?: string;
}

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="departements-container">
      <div class="header">
        <div>
          <h1>Départements</h1>
          <p class="subtitle">{{ departements.length }} département(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau département</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} département</h3>
        <form (ngSubmit)="saveDepartement()" #departementForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'rattachement'" (click)="activeTab = 'rattachement'">Rattachement</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentDepartement.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentDepartement.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentDepartement.responsable" name="responsable">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentDepartement.email" name="email">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentDepartement.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Budget (FCFA)</label>
                <input type="number" [(ngModel)]="currentDepartement.budget" name="budget" min="0">
              </div>
              <div class="form-group">
                <label>Effectif</label>
                <input type="number" [(ngModel)]="currentDepartement.effectif" name="effectif" min="0">
              </div>
              <div class="form-group">
                <label>Date création</label>
                <input type="date" [(ngModel)]="currentDepartement.date_creation" name="date_creation">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentDepartement.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="restructure">En restructuration</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea [(ngModel)]="currentDepartement.description" name="description" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'rattachement'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Entité de rattachement</label>
                <select [(ngModel)]="currentDepartement.entite_id" name="entite_id" (change)="onEntiteChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let e of entites" [value]="e.id">{{ e.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Filiale de rattachement</label>
                <select [(ngModel)]="currentDepartement.filiale_id" name="filiale_id" (change)="onFilialeChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let f of filiales" [value]="f.id">{{ f.nom }}</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentDepartement.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="departementForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="departements.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterDepartements()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterDepartements()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="restructure">Restructuration</option>
        </select>
      </div>
      <div class="departements-grid" *ngIf="departements.length > 0; else emptyState">
        <div class="departement-card" *ngFor="let d of filteredDepartements">
          <div class="departement-header">
            <span class="departement-nom">{{ d.nom }}</span>
            <span class="departement-code">{{ d.code }}</span>
          </div>
          <div class="departement-body">
            <p><span class="label">Responsable:</span> {{ d.responsable || '-' }}</p>
            <p><span class="label">Email:</span> {{ d.email || '-' }}</p>
            <p><span class="label">Effectif:</span> {{ d.effectif }}</p>
            <p><span class="label">Budget:</span> {{ d.budget | number }} FCFA</p>
            <p class="rattachement" *ngIf="d.entite_nom || d.filiale_nom">
              <small>{{ d.entite_nom }}{{ d.filiale_nom ? ' / ' + d.filiale_nom : '' }}</small>
            </p>
          </div>
          <div class="departement-footer">
            <span class="badge-statut" [class]="d.statut">{{ getStatutLabel(d.statut) }}</span>
            <div class="departement-actions">
              <button class="btn-icon" (click)="viewDetails(d)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editDepartement(d)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(d)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h2>Aucun département</h2>
          <p>Créez votre premier département</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau département</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedDepartement?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedDepartement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedDepartement.code }}</p>
                <p><strong>Nom:</strong> {{ selectedDepartement.nom }}</p>
                <p><strong>Description:</strong> {{ selectedDepartement.description }}</p>
                <p><strong>Date création:</strong> {{ selectedDepartement.date_creation | date }}</p>
              </div>
              <div class="detail-section">
                <h4>Responsable</h4>
                <p><strong>Nom:</strong> {{ selectedDepartement.responsable || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedDepartement.email || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedDepartement.telephone || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Budget & Effectif</h4>
                <p><strong>Budget:</strong> {{ selectedDepartement.budget | number }} FCFA</p>
                <p><strong>Effectif:</strong> {{ selectedDepartement.effectif }}</p>
              </div>
              <div class="detail-section">
                <h4>Rattachement</h4>
                <p><strong>Entité:</strong> {{ selectedDepartement.entite_nom || '-' }}</p>
                <p><strong>Filiale:</strong> {{ selectedDepartement.filiale_nom || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedDepartement.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le département <strong>{{ departementToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteDepartement()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .departements-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .departements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .departement-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .departement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .departement-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .departement-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .departement-body p { margin: 5px 0; color: #6B7280; }
    .departement-body .label { color: #4B5563; width: 90px; display: inline-block; }
    .rattachement { margin-top: 8px; color: #EC4899; }
    .departement-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.restructure { background: #F59E0B; color: white; }
    .departement-actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Departements implements OnInit {
  entites: any[] = [];
  filiales: any[] = [];
  departements: Departement[] = [];
  filteredDepartements: Departement[] = [];
  selectedDepartement: Departement | null = null;
  currentDepartement: any = {
    code: 'DEP-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    entite_id: '',
    filiale_id: '',
    description: '',
    responsable: '',
    email: '',
    telephone: '',
    budget: 0,
    effectif: 0,
    date_creation: new Date().toISOString().split('T')[0],
    statut: 'actif',
    notes: ''
  };
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  departementToDelete: Departement | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadEntites();
    this.loadFiliales();
    this.loadDepartements();
  }
  loadEntites() {
    const saved = localStorage.getItem('entites');
    this.entites = saved ? JSON.parse(saved) : [];
  }
  loadFiliales() {
    const saved = localStorage.getItem('filiales');
    this.filiales = saved ? JSON.parse(saved) : [];
  }
  loadDepartements() {
    const saved = localStorage.getItem('departements');
    this.departements = saved ? JSON.parse(saved) : [];
    this.updateRattachementNames();
    this.filteredDepartements = [...this.departements];
  }
  updateRattachementNames() {
    this.departements.forEach(d => {
      if (d.entite_id) {
        const entite = this.entites.find(e => e.id === d.entite_id);
        d.entite_nom = entite?.nom;
      }
      if (d.filiale_id) {
        const filiale = this.filiales.find(f => f.id === d.filiale_id);
        d.filiale_nom = filiale?.nom;
      }
    });
  }
  onEntiteChange() {
    const entite = this.entites.find(e => e.id === this.currentDepartement.entite_id);
    if (entite) this.currentDepartement.entite_nom = entite.nom;
  }
  onFilialeChange() {
    const filiale = this.filiales.find(f => f.id === this.currentDepartement.filiale_id);
    if (filiale) this.currentDepartement.filiale_nom = filiale.nom;
  }
  saveDepartement() {
    const entite = this.entites.find(e => e.id === this.currentDepartement.entite_id);
    const filiale = this.filiales.find(f => f.id === this.currentDepartement.filiale_id);
    if (this.editMode) {
      const index = this.departements.findIndex(d => d.id === this.currentDepartement.id);
      if (index !== -1) {
        this.departements[index] = { 
          ...this.currentDepartement, 
          entite_nom: entite?.nom,
          filiale_nom: filiale?.nom
        };
        this.showSuccess('Département modifié !');
      }
    } else {
      const newDepartement = { 
        ...this.currentDepartement, 
        id: Date.now(),
        entite_nom: entite?.nom,
        filiale_nom: filiale?.nom
      };
      this.departements.push(newDepartement);
      this.showSuccess('Département ajouté !');
    }
    localStorage.setItem('departements', JSON.stringify(this.departements));
    this.filterDepartements();
    this.cancelForm();
  }
  editDepartement(d: Departement) {
    this.currentDepartement = { ...d };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(d: Departement) {
    this.selectedDepartement = d;
    this.showDetailsModal = true;
  }
  confirmDelete(d: Departement) {
    this.departementToDelete = d;
    this.showDeleteModal = true;
  }
  deleteDepartement() {
    if (this.departementToDelete) {
      this.departements = this.departements.filter(d => d.id !== this.departementToDelete?.id);
      localStorage.setItem('departements', JSON.stringify(this.departements));
      this.filterDepartements();
      this.showDeleteModal = false;
      this.departementToDelete = null;
      this.showSuccess('Département supprimé !');
    }
  }
  cancelForm() {
    this.currentDepartement = {
      code: 'DEP-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      entite_id: '',
      filiale_id: '',
      description: '',
      responsable: '',
      email: '',
      telephone: '',
      budget: 0,
      effectif: 0,
      date_creation: new Date().toISOString().split('T')[0],
      statut: 'actif',
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterDepartements() {
    let filtered = this.departements;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.nom?.toLowerCase().includes(term) ||
        d.code?.toLowerCase().includes(term) ||
        d.responsable?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(d => d.statut === this.statutFilter);
    }
    this.filteredDepartements = filtered;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', restructure: 'Restructuration' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
