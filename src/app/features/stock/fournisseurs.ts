import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Fournisseur {
  id?: number;
  code: string;
  nom: string;
  type: 'societe' | 'particulier' | 'grossiste' | 'producteur';
  forme_juridique?: string;
  nif?: string;
  registre_commerce?: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web?: string;
  contact_nom?: string;
  contact_telephone?: string;
  contact_email?: string;
  conditions_paiement?: string;
  delai_livraison?: number;
  devise?: string;
  notes?: string;
  statut: 'actif' | 'inactif';
  date_creation: string;
}

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="fournisseurs-container">
      <div class="header">
        <div>
          <h1>Fournisseurs</h1>
          <p class="subtitle">{{ fournisseurs.length }} fournisseur(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau fournisseur</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} fournisseur</h3>
        <form (ngSubmit)="saveFournisseur()" #fournisseurForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
            <button type="button" [class.active]="activeTab === 'commercial'" (click)="activeTab = 'commercial'">Commercial</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentFournisseur.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentFournisseur.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentFournisseur.type" name="type">
                  <option value="societe">Société</option>
                  <option value="particulier">Particulier</option>
                  <option value="grossiste">Grossiste</option>
                  <option value="producteur">Producteur</option>
                </select>
              </div>
              <div class="form-group">
                <label>Forme juridique</label>
                <input type="text" [(ngModel)]="currentFournisseur.forme_juridique" name="forme_juridique">
              </div>
              <div class="form-group">
                <label>NIF</label>
                <input type="text" [(ngModel)]="currentFournisseur.nif" name="nif">
              </div>
              <div class="form-group">
                <label>Registre de commerce</label>
                <input type="text" [(ngModel)]="currentFournisseur.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentFournisseur.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contact'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentFournisseur.adresse" name="adresse" rows="2" required></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentFournisseur.ville" name="ville" required>
              </div>
              <div class="form-group">
                <label>Pays</label>
                <input type="text" [(ngModel)]="currentFournisseur.pays" name="pays" value="Mali" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentFournisseur.telephone" name="telephone" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentFournisseur.email" name="email" required>
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="currentFournisseur.site_web" name="site_web">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'commercial'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Personne de contact</label>
                <input type="text" [(ngModel)]="currentFournisseur.contact_nom" name="contact_nom">
              </div>
              <div class="form-group">
                <label>Téléphone contact</label>
                <input type="tel" [(ngModel)]="currentFournisseur.contact_telephone" name="contact_telephone">
              </div>
              <div class="form-group">
                <label>Email contact</label>
                <input type="email" [(ngModel)]="currentFournisseur.contact_email" name="contact_email">
              </div>
              <div class="form-group">
                <label>Conditions de paiement</label>
                <input type="text" [(ngModel)]="currentFournisseur.conditions_paiement" name="conditions_paiement" placeholder="Ex: 30 jours fin de mois">
              </div>
              <div class="form-group">
                <label>Délai de livraison (jours)</label>
                <input type="number" [(ngModel)]="currentFournisseur.delai_livraison" name="delai_livraison" min="0">
              </div>
              <div class="form-group">
                <label>Devise</label>
                <input type="text" [(ngModel)]="currentFournisseur.devise" name="devise" value="FCFA">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFournisseur.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="fournisseurForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="fournisseurs.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFournisseurs()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterFournisseurs()" class="filter-select">
          <option value="">Tous types</option>
          <option value="societe">Société</option>
          <option value="particulier">Particulier</option>
          <option value="grossiste">Grossiste</option>
          <option value="producteur">Producteur</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterFournisseurs()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
      <div class="fournisseurs-grid" *ngIf="fournisseurs.length > 0; else emptyState">
        <div class="fournisseur-card" *ngFor="let f of filteredFournisseurs">
          <div class="fournisseur-header">
            <span class="fournisseur-nom">{{ f.nom }}</span>
            <span class="fournisseur-code">{{ f.code }}</span>
          </div>
          <div class="fournisseur-body">
            <p><span class="label">Type:</span> {{ getTypeLabel(f.type) }}</p>
            <p><span class="label">Ville:</span> {{ f.ville }}</p>
            <p><span class="label">Tél:</span> {{ f.telephone }}</p>
            <p><span class="label">Email:</span> {{ f.email }}</p>
            <p><span class="label">Contact:</span> {{ f.contact_nom || '-' }}</p>
          </div>
          <div class="fournisseur-footer">
            <span class="badge-statut" [class.actif]="f.statut === 'actif'" [class.inactif]="f.statut === 'inactif'">
              {{ f.statut === 'actif' ? 'Actif' : 'Inactif' }}
            </span>
            <div class="fournisseur-actions">
              <button class="btn-icon" (click)="viewDetails(f)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editFournisseur(f)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏭</div>
          <h2>Aucun fournisseur</h2>
          <p>Ajoutez votre premier fournisseur</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau fournisseur</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedFournisseur?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedFournisseur">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations légales</h4>
                <p><strong>Code:</strong> {{ selectedFournisseur.code }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedFournisseur.type) }}</p>
                <p><strong>Forme juridique:</strong> {{ selectedFournisseur.forme_juridique || '-' }}</p>
                <p><strong>NIF:</strong> {{ selectedFournisseur.nif || '-' }}</p>
                <p><strong>RCCM:</strong> {{ selectedFournisseur.registre_commerce || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedFournisseur.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedFournisseur.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedFournisseur.pays }}</p>
                <p><strong>Téléphone:</strong> {{ selectedFournisseur.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedFournisseur.email }}</p>
                <p><strong>Site web:</strong> {{ selectedFournisseur.site_web || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Contact principal</h4>
                <p><strong>Nom:</strong> {{ selectedFournisseur.contact_nom || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedFournisseur.contact_telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedFournisseur.contact_email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Conditions commerciales</h4>
                <p><strong>Conditions paiement:</strong> {{ selectedFournisseur.conditions_paiement || '-' }}</p>
                <p><strong>Délai livraison:</strong> {{ selectedFournisseur.delai_livraison || '-' }} jours</p>
                <p><strong>Devise:</strong> {{ selectedFournisseur.devise }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedFournisseur.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le fournisseur <strong>{{ fournisseurToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteFournisseur()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fournisseurs-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .fournisseurs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .fournisseur-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .fournisseur-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .fournisseur-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .fournisseur-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .fournisseur-body p { margin: 8px 0; color: #4B5563; }
    .fournisseur-body .label { color: #6B7280; width: 80px; display: inline-block; }
    .fournisseur-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .fournisseur-actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Fournisseurs implements OnInit {
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur | null = null;
  currentFournisseur: any = {
    code: 'FRS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    type: 'societe',
    forme_juridique: '',
    nif: '',
    registre_commerce: '',
    adresse: '',
    ville: '',
    pays: 'Mali',
    telephone: '',
    email: '',
    site_web: '',
    contact_nom: '',
    contact_telephone: '',
    contact_email: '',
    conditions_paiement: '',
    delai_livraison: 30,
    devise: 'FCFA',
    notes: '',
    statut: 'actif',
    date_creation: new Date().toISOString().split('T')[0]
  };
  activeTab = 'info';
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  fournisseurToDelete: Fournisseur | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadFournisseurs();
  }
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    this.fournisseurs = saved ? JSON.parse(saved) : [];
    this.filteredFournisseurs = [...this.fournisseurs];
  }
  saveFournisseur() {
    if (this.editMode) {
      const index = this.fournisseurs.findIndex(f => f.id === this.currentFournisseur.id);
      if (index !== -1) {
        this.fournisseurs[index] = { ...this.currentFournisseur };
        this.showSuccess('Fournisseur modifié !');
      }
    } else {
      const newFournisseur = { ...this.currentFournisseur, id: Date.now() };
      this.fournisseurs.push(newFournisseur);
      this.showSuccess('Fournisseur ajouté !');
    }
    localStorage.setItem('fournisseurs', JSON.stringify(this.fournisseurs));
    this.filterFournisseurs();
    this.cancelForm();
  }
  editFournisseur(f: Fournisseur) {
    this.currentFournisseur = { ...f };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(f: Fournisseur) {
    this.selectedFournisseur = f;
    this.showDetailsModal = true;
  }
  confirmDelete(f: Fournisseur) {
    this.fournisseurToDelete = f;
    this.showDeleteModal = true;
  }
  deleteFournisseur() {
    if (this.fournisseurToDelete) {
      this.fournisseurs = this.fournisseurs.filter(f => f.id !== this.fournisseurToDelete?.id);
      localStorage.setItem('fournisseurs', JSON.stringify(this.fournisseurs));
      this.filterFournisseurs();
      this.showDeleteModal = false;
      this.fournisseurToDelete = null;
      this.showSuccess('Fournisseur supprimé !');
    }
  }
  cancelForm() {
    this.currentFournisseur = {
      code: 'FRS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      type: 'societe',
      forme_juridique: '',
      nif: '',
      registre_commerce: '',
      adresse: '',
      ville: '',
      pays: 'Mali',
      telephone: '',
      email: '',
      site_web: '',
      contact_nom: '',
      contact_telephone: '',
      contact_email: '',
      conditions_paiement: '',
      delai_livraison: 30,
      devise: 'FCFA',
      notes: '',
      statut: 'actif',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterFournisseurs() {
    let filtered = this.fournisseurs;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.nom?.toLowerCase().includes(term) ||
        f.code?.toLowerCase().includes(term) ||
        f.email?.toLowerCase().includes(term) ||
        f.ville?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(f => f.type === this.typeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    this.filteredFournisseurs = filtered;
  }
  getTypeLabel(type: string): string {
    const labels: any = { 
      societe: 'Société', 
      particulier: 'Particulier', 
      grossiste: 'Grossiste', 
      producteur: 'Producteur' 
    };
    return labels[type] || type;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
