import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Entite {
  id?: number;
  code: string;
  nom: string;
  forme_juridique: string;
  nif: string;
  registre_commerce: string;
  date_creation: string;
  capital_social: number;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  logo?: string;
  statut: 'actif' | 'inactif';
  notes?: string;
}

@Component({
  selector: 'app-entites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="entites-container">
      <div class="header">
        <div>
          <h1>Entités juridiques</h1>
          <p class="subtitle">{{ entites.length }} entité(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle entité</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} entité</h3>
        <form (ngSubmit)="saveEntite()" #entiteForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'legal'" (click)="activeTab = 'legal'">Légal</button>
            <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentEntite.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentEntite.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Forme juridique</label>
                <select [(ngModel)]="currentEntite.forme_juridique" name="forme_juridique">
                  <option value="SA">SA</option>
                  <option value="SARL">SARL</option>
                  <option value="SAS">SAS</option>
                  <option value="EURL">EURL</option>
                  <option value="SNC">SNC</option>
                  <option value="GIE">GIE</option>
                  <option value="Association">Association</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date création</label>
                <input type="date" [(ngModel)]="currentEntite.date_creation" name="date_creation">
              </div>
              <div class="form-group">
                <label>Capital social (FCFA)</label>
                <input type="number" [(ngModel)]="currentEntite.capital_social" name="capital_social" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEntite.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'legal'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>NIF</label>
                <input type="text" [(ngModel)]="currentEntite.nif" name="nif">
              </div>
              <div class="form-group">
                <label>Registre de commerce</label>
                <input type="text" [(ngModel)]="currentEntite.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentEntite.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentEntite.ville" name="ville">
              </div>
              <div class="form-group">
                <label>Pays</label>
                <input type="text" [(ngModel)]="currentEntite.pays" name="pays" value="Mali">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contact'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentEntite.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentEntite.email" name="email">
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="currentEntite.site_web" name="site_web">
              </div>
              <div class="form-group">
                <label>Logo (URL)</label>
                <input type="text" [(ngModel)]="currentEntite.logo" name="logo">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentEntite.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="entiteForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="entites.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEntites()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterEntites()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
      <div class="entites-grid" *ngIf="entites.length > 0; else emptyState">
        <div class="entite-card" *ngFor="let e of filteredEntites">
          <div class="entite-header">
            <span class="entite-nom">{{ e.nom }}</span>
            <span class="entite-code">{{ e.code }}</span>
          </div>
          <div class="entite-body">
            <p><span class="label">Forme:</span> {{ e.forme_juridique }}</p>
            <p><span class="label">NIF:</span> {{ e.nif || '-' }}</p>
            <p><span class="label">Ville:</span> {{ e.ville }}</p>
            <p><span class="label">Capital:</span> {{ e.capital_social | number }} FCFA</p>
          </div>
          <div class="entite-footer">
            <span class="badge-statut" [class.actif]="e.statut === 'actif'" [class.inactif]="e.statut === 'inactif'">
              {{ e.statut === 'actif' ? 'Actif' : 'Inactif' }}
            </span>
            <div class="entite-actions">
              <button class="btn-icon" (click)="viewDetails(e)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editEntite(e)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏢</div>
          <h2>Aucune entité</h2>
          <p>Créez votre première entité juridique</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle entité</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedEntite?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEntite">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedEntite.code }}</p>
                <p><strong>Nom:</strong> {{ selectedEntite.nom }}</p>
                <p><strong>Forme juridique:</strong> {{ selectedEntite.forme_juridique }}</p>
                <p><strong>Date création:</strong> {{ selectedEntite.date_creation | date }}</p>
                <p><strong>Capital social:</strong> {{ selectedEntite.capital_social | number }} FCFA</p>
              </div>
              <div class="detail-section">
                <h4>Informations légales</h4>
                <p><strong>NIF:</strong> {{ selectedEntite.nif || '-' }}</p>
                <p><strong>RCCM:</strong> {{ selectedEntite.registre_commerce || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedEntite.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedEntite.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedEntite.pays }}</p>
                <p><strong>Téléphone:</strong> {{ selectedEntite.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedEntite.email }}</p>
                <p><strong>Site web:</strong> {{ selectedEntite.site_web || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedEntite.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'entité <strong>{{ entiteToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEntite()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .entites-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .entites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .entite-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .entite-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .entite-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .entite-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .entite-body p { margin: 5px 0; color: #6B7280; }
    .entite-body .label { color: #4B5563; width: 70px; display: inline-block; }
    .entite-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .entite-actions { display: flex; gap: 8px; }
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
export class Entites implements OnInit {
  entites: Entite[] = [];
  filteredEntites: Entite[] = [];
  selectedEntite: Entite | null = null;
  currentEntite: any = {
    code: 'ENT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    forme_juridique: 'SARL',
    nif: '',
    registre_commerce: '',
    date_creation: new Date().toISOString().split('T')[0],
    capital_social: 0,
    adresse: '',
    ville: '',
    pays: 'Mali',
    telephone: '',
    email: '',
    site_web: '',
    logo: '',
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
  entiteToDelete: Entite | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadEntites();
  }
  loadEntites() {
    const saved = localStorage.getItem('entites');
    this.entites = saved ? JSON.parse(saved) : [];
    this.filteredEntites = [...this.entites];
  }
  saveEntite() {
    if (this.editMode) {
      const index = this.entites.findIndex(e => e.id === this.currentEntite.id);
      if (index !== -1) {
        this.entites[index] = { ...this.currentEntite };
        this.showSuccess('Entité modifiée !');
      }
    } else {
      const newEntite = { ...this.currentEntite, id: Date.now() };
      this.entites.push(newEntite);
      this.showSuccess('Entité ajoutée !');
    }
    localStorage.setItem('entites', JSON.stringify(this.entites));
    this.filterEntites();
    this.cancelForm();
  }
  editEntite(e: Entite) {
    this.currentEntite = { ...e };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(e: Entite) {
    this.selectedEntite = e;
    this.showDetailsModal = true;
  }
  confirmDelete(e: Entite) {
    this.entiteToDelete = e;
    this.showDeleteModal = true;
  }
  deleteEntite() {
    if (this.entiteToDelete) {
      this.entites = this.entites.filter(e => e.id !== this.entiteToDelete?.id);
      localStorage.setItem('entites', JSON.stringify(this.entites));
      this.filterEntites();
      this.showDeleteModal = false;
      this.entiteToDelete = null;
      this.showSuccess('Entité supprimée !');
    }
  }
  cancelForm() {
    this.currentEntite = {
      code: 'ENT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      forme_juridique: 'SARL',
      nif: '',
      registre_commerce: '',
      date_creation: new Date().toISOString().split('T')[0],
      capital_social: 0,
      adresse: '',
      ville: '',
      pays: 'Mali',
      telephone: '',
      email: '',
      site_web: '',
      logo: '',
      statut: 'actif',
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterEntites() {
    let filtered = this.entites;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom?.toLowerCase().includes(term) ||
        e.code?.toLowerCase().includes(term) ||
        e.ville?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    this.filteredEntites = filtered;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
