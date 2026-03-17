import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Filiale {
  id?: number;
  code: string;
  nom: string;
  entite_mere_id: number;
  entite_mere_nom?: string;
  forme_juridique: string;
  nif: string;
  registre_commerce: string;
  date_creation: string;
  capital_social: number;
  participation: number;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  secteur_activite: string;
  dirigeant: string;
  effectif: number;
  statut: 'actif' | 'inactif' | 'en_creation' | 'dissoute';
  notes?: string;
}

@Component({
  selector: 'app-filiales',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="filiales-container">
      <div class="header">
        <div>
          <h1>Filiales</h1>
          <p class="subtitle">{{ filiales.length }} filiale(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle filiale</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} filiale</h3>
        <form (ngSubmit)="saveFiliale()" #filialeForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'legal'" (click)="activeTab = 'legal'">Légal</button>
            <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentFiliale.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentFiliale.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Entité mère *</label>
                <select [(ngModel)]="currentFiliale.entite_mere_id" name="entite_mere_id" required (change)="onEntiteMereChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let e of entites" [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                </select>
              </div>
              <div class="form-group">
                <label>Forme juridique</label>
                <select [(ngModel)]="currentFiliale.forme_juridique" name="forme_juridique">
                  <option value="SA">SA</option>
                  <option value="SARL">SARL</option>
                  <option value="SAS">SAS</option>
                  <option value="EURL">EURL</option>
                  <option value="SNC">SNC</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date création</label>
                <input type="date" [(ngModel)]="currentFiliale.date_creation" name="date_creation">
              </div>
              <div class="form-group">
                <label>Capital social (FCFA)</label>
                <input type="number" [(ngModel)]="currentFiliale.capital_social" name="capital_social" min="0">
              </div>
              <div class="form-group">
                <label>Participation (%)</label>
                <input type="number" [(ngModel)]="currentFiliale.participation" name="participation" min="0" max="100">
              </div>
              <div class="form-group">
                <label>Secteur d'activité</label>
                <input type="text" [(ngModel)]="currentFiliale.secteur_activite" name="secteur_activite">
              </div>
              <div class="form-group">
                <label>Dirigeant</label>
                <input type="text" [(ngModel)]="currentFiliale.dirigeant" name="dirigeant">
              </div>
              <div class="form-group">
                <label>Effectif</label>
                <input type="number" [(ngModel)]="currentFiliale.effectif" name="effectif" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentFiliale.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="en_creation">En création</option>
                  <option value="dissoute">Dissoute</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'legal'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>NIF</label>
                <input type="text" [(ngModel)]="currentFiliale.nif" name="nif">
              </div>
              <div class="form-group">
                <label>Registre de commerce</label>
                <input type="text" [(ngModel)]="currentFiliale.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentFiliale.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentFiliale.ville" name="ville">
              </div>
              <div class="form-group">
                <label>Pays</label>
                <input type="text" [(ngModel)]="currentFiliale.pays" name="pays" value="Mali">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contact'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentFiliale.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentFiliale.email" name="email">
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="currentFiliale.site_web" name="site_web">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFiliale.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="filialeForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="filiales.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFiliales()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterFiliales()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="en_creation">En création</option>
          <option value="dissoute">Dissoute</option>
        </select>
      </div>
      <div class="filiales-grid" *ngIf="filiales.length > 0; else emptyState">
        <div class="filiale-card" *ngFor="let f of filteredFiliales">
          <div class="filiale-header">
            <span class="filiale-nom">{{ f.nom }}</span>
            <span class="filiale-code">{{ f.code }}</span>
          </div>
          <div class="filiale-body">
            <p><span class="label">Mère:</span> {{ f.entite_mere_nom }}</p>
            <p><span class="label">Participation:</span> {{ f.participation }}%</p>
            <p><span class="label">Ville:</span> {{ f.ville }}</p>
            <p><span class="label">Dirigeant:</span> {{ f.dirigeant || '-' }}</p>
          </div>
          <div class="filiale-footer">
            <span class="badge-statut" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
            <div class="filiale-actions">
              <button class="btn-icon" (click)="viewDetails(f)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editFiliale(f)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏭</div>
          <h2>Aucune filiale</h2>
          <p>Créez votre première filiale</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle filiale</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedFiliale?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedFiliale">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedFiliale.code }}</p>
                <p><strong>Nom:</strong> {{ selectedFiliale.nom }}</p>
                <p><strong>Entité mère:</strong> {{ selectedFiliale.entite_mere_nom }}</p>
                <p><strong>Participation:</strong> {{ selectedFiliale.participation }}%</p>
                <p><strong>Forme juridique:</strong> {{ selectedFiliale.forme_juridique }}</p>
                <p><strong>Date création:</strong> {{ selectedFiliale.date_creation | date }}</p>
                <p><strong>Capital social:</strong> {{ selectedFiliale.capital_social | number }} FCFA</p>
              </div>
              <div class="detail-section">
                <h4>Activité</h4>
                <p><strong>Secteur:</strong> {{ selectedFiliale.secteur_activite || '-' }}</p>
                <p><strong>Dirigeant:</strong> {{ selectedFiliale.dirigeant || '-' }}</p>
                <p><strong>Effectif:</strong> {{ selectedFiliale.effectif || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Informations légales</h4>
                <p><strong>NIF:</strong> {{ selectedFiliale.nif || '-' }}</p>
                <p><strong>RCCM:</strong> {{ selectedFiliale.registre_commerce || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedFiliale.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedFiliale.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedFiliale.pays }}</p>
                <p><strong>Téléphone:</strong> {{ selectedFiliale.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedFiliale.email }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedFiliale.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer la filiale <strong>{{ filialeToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteFiliale()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filiales-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .filiales-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .filiale-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .filiale-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .filiale-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .filiale-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .filiale-body p { margin: 5px 0; color: #6B7280; }
    .filiale-body .label { color: #4B5563; width: 90px; display: inline-block; }
    .filiale-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.en_creation { background: #F59E0B; color: white; }
    .badge-statut.dissoute { background: #6B7280; color: white; }
    .filiale-actions { display: flex; gap: 8px; }
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
export class Filiales implements OnInit {
  entites: any[] = [];
  filiales: Filiale[] = [];
  filteredFiliales: Filiale[] = [];
  selectedFiliale: Filiale | null = null;
  currentFiliale: any = {
    code: 'FIL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    entite_mere_id: '',
    forme_juridique: 'SARL',
    nif: '',
    registre_commerce: '',
    date_creation: new Date().toISOString().split('T')[0],
    capital_social: 0,
    participation: 100,
    adresse: '',
    ville: '',
    pays: 'Mali',
    telephone: '',
    email: '',
    site_web: '',
    secteur_activite: '',
    dirigeant: '',
    effectif: 0,
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
  filialeToDelete: Filiale | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadEntites();
    this.loadFiliales();
  }
  loadEntites() {
    const saved = localStorage.getItem('entites');
    this.entites = saved ? JSON.parse(saved) : [];
  }
  loadFiliales() {
    const saved = localStorage.getItem('filiales');
    this.filiales = saved ? JSON.parse(saved) : [];
    this.updateEntiteNames();
    this.filteredFiliales = [...this.filiales];
  }
  updateEntiteNames() {
    this.filiales.forEach(f => {
      const mere = this.entites.find(e => e.id === f.entite_mere_id);
      f.entite_mere_nom = mere ? mere.nom : '';
    });
  }
  onEntiteMereChange() {
    const mere = this.entites.find(e => e.id === this.currentFiliale.entite_mere_id);
    if (mere) this.currentFiliale.entite_mere_nom = mere.nom;
  }
  saveFiliale() {
    const mere = this.entites.find(e => e.id === this.currentFiliale.entite_mere_id);
    if (this.editMode) {
      const index = this.filiales.findIndex(f => f.id === this.currentFiliale.id);
      if (index !== -1) {
        this.filiales[index] = { 
          ...this.currentFiliale, 
          entite_mere_nom: mere?.nom 
        };
        this.showSuccess('Filiale modifiée !');
      }
    } else {
      const newFiliale = { 
        ...this.currentFiliale, 
        id: Date.now(),
        entite_mere_nom: mere?.nom 
      };
      this.filiales.push(newFiliale);
      this.showSuccess('Filiale ajoutée !');
    }
    localStorage.setItem('filiales', JSON.stringify(this.filiales));
    this.filterFiliales();
    this.cancelForm();
  }
  editFiliale(f: Filiale) {
    this.currentFiliale = { ...f };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(f: Filiale) {
    this.selectedFiliale = f;
    this.showDetailsModal = true;
  }
  confirmDelete(f: Filiale) {
    this.filialeToDelete = f;
    this.showDeleteModal = true;
  }
  deleteFiliale() {
    if (this.filialeToDelete) {
      this.filiales = this.filiales.filter(f => f.id !== this.filialeToDelete?.id);
      localStorage.setItem('filiales', JSON.stringify(this.filiales));
      this.filterFiliales();
      this.showDeleteModal = false;
      this.filialeToDelete = null;
      this.showSuccess('Filiale supprimée !');
    }
  }
  cancelForm() {
    this.currentFiliale = {
      code: 'FIL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      entite_mere_id: '',
      forme_juridique: 'SARL',
      nif: '',
      registre_commerce: '',
      date_creation: new Date().toISOString().split('T')[0],
      capital_social: 0,
      participation: 100,
      adresse: '',
      ville: '',
      pays: 'Mali',
      telephone: '',
      email: '',
      site_web: '',
      secteur_activite: '',
      dirigeant: '',
      effectif: 0,
      statut: 'actif',
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterFiliales() {
    let filtered = this.filiales;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.nom?.toLowerCase().includes(term) ||
        f.code?.toLowerCase().includes(term) ||
        f.ville?.toLowerCase().includes(term) ||
        f.dirigeant?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    this.filteredFiliales = filtered;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { 
      actif: 'Actif', 
      inactif: 'Inactif', 
      en_creation: 'En création', 
      dissoute: 'Dissoute' 
    };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
