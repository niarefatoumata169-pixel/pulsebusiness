import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Transitaire {
  id?: number;
  code: string;
  nom: string;
  forme_juridique: string;
  nif: string;
  registre_commerce: string;
  agrement_douane: string;
  date_agrement: string;
  date_validite_agrement: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  contact_nom: string;
  contact_telephone: string;
  contact_email: string;
  specialites: string[];
  pays_operation: string[];
  ports_principaux: string[];
  conditions_paiement: string;
  tarifs?: string;
  devise: string;
  note?: number;
  statut: 'actif' | 'inactif' | 'suspendu';
  notes?: string;
}

@Component({
  selector: 'app-transitaires',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="transitaires-container">
      <div class="header">
        <div>
          <h1>Transitaires</h1>
          <p class="subtitle">{{ transitaires.length }} transitaire(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau transitaire</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} transitaire</h3>
        <form (ngSubmit)="saveTransitaire()" #transitaireForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'agrement'" (click)="activeTab = 'agrement'">Agrément</button>
            <button type="button" [class.active]="activeTab === 'operations'" (click)="activeTab = 'operations'">Opérations</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentTransitaire.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentTransitaire.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Forme juridique</label>
                <input type="text" [(ngModel)]="currentTransitaire.forme_juridique" name="forme_juridique">
              </div>
              <div class="form-group">
                <label>NIF</label>
                <input type="text" [(ngModel)]="currentTransitaire.nif" name="nif">
              </div>
              <div class="form-group">
                <label>Registre commerce</label>
                <input type="text" [(ngModel)]="currentTransitaire.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentTransitaire.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentTransitaire.ville" name="ville">
              </div>
              <div class="form-group">
                <label>Pays</label>
                <input type="text" [(ngModel)]="currentTransitaire.pays" name="pays">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentTransitaire.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentTransitaire.email" name="email">
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="currentTransitaire.site_web" name="site_web">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentTransitaire.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'agrement'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>N° agrément douane</label>
                <input type="text" [(ngModel)]="currentTransitaire.agrement_douane" name="agrement_douane">
              </div>
              <div class="form-group">
                <label>Date agrément</label>
                <input type="date" [(ngModel)]="currentTransitaire.date_agrement" name="date_agrement">
              </div>
              <div class="form-group">
                <label>Date validité</label>
                <input type="date" [(ngModel)]="currentTransitaire.date_validite_agrement" name="date_validite_agrement">
              </div>
              <div class="form-group">
                <label>Note (0-10)</label>
                <input type="number" [(ngModel)]="currentTransitaire.note" name="note" min="0" max="10" step="0.1">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'operations'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Spécialités</label>
                <div *ngFor="let s of ['Import', 'Export', 'Transit', 'Douane', 'Logistique']" class="checkbox-group">
                  <input type="checkbox" [value]="s" (change)="toggleSpecialite(s)" [checked]="currentTransitaire.specialites.includes(s)">
                  <label>{{ s }}</label>
                </div>
              </div>
              <div class="form-group">
                <label>Pays d'opération</label>
                <textarea [(ngModel)]="paysOperationText" (blur)="updatePaysOperation()" rows="3" placeholder="Saisir les pays séparés par des virgules"></textarea>
              </div>
              <div class="form-group">
                <label>Ports principaux</label>
                <textarea [(ngModel)]="portsText" (blur)="updatePorts()" rows="3" placeholder="Saisir les ports séparés par des virgules"></textarea>
              </div>
              <div class="form-group">
                <label>Conditions de paiement</label>
                <input type="text" [(ngModel)]="currentTransitaire.conditions_paiement" name="conditions_paiement">
              </div>
              <div class="form-group">
                <label>Devise</label>
                <select [(ngModel)]="currentTransitaire.devise" name="devise">
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">Euro</option>
                  <option value="USD">Dollar US</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tarifs (URL document)</label>
                <input type="text" [(ngModel)]="currentTransitaire.tarifs" name="tarifs">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentTransitaire.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="transitaireForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="transitaires.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterTransitaires()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterTransitaires()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select [(ngModel)]="paysFilter" (ngModelChange)="filterTransitaires()" class="filter-select">
          <option value="">Tous pays</option>
          <option *ngFor="let p of getPaysList()" [value]="p">{{ p }}</option>
        </select>
      </div>
      <div class="transitaires-grid" *ngIf="transitaires.length > 0; else emptyState">
        <div class="transitaire-card" *ngFor="let t of filteredTransitaires">
          <div class="transitaire-header">
            <span class="transitaire-nom">{{ t.nom }}</span>
            <span class="transitaire-code">{{ t.code }}</span>
          </div>
          <div class="transitaire-body">
            <p><span class="label">Ville:</span> {{ t.ville }}, {{ t.pays }}</p>
            <p><span class="label">Tél:</span> {{ t.telephone }}</p>
            <p><span class="label">Email:</span> {{ t.email }}</p>
            <p><span class="label">Contact:</span> {{ t.contact_nom || '-' }}</p>
            <p><span class="label">Note:</span> {{ t.note || '-' }}/10</p>
            <p><span class="label">Spécialités:</span> {{ t.specialites.join(', ') || '-' }}</p>
          </div>
          <div class="transitaire-footer">
            <span class="badge-statut" [class]="t.statut">{{ getStatutLabel(t.statut) }}</span>
            <div class="transitaire-actions">
              <button class="btn-icon" (click)="viewDetails(t)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editTransitaire(t)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(t)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🚛</div>
          <h2>Aucun transitaire</h2>
          <p>Ajoutez votre premier transitaire</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau transitaire</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedTransitaire?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedTransitaire">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedTransitaire.code }}</p>
                <p><strong>Nom:</strong> {{ selectedTransitaire.nom }}</p>
                <p><strong>Forme juridique:</strong> {{ selectedTransitaire.forme_juridique || '-' }}</p>
                <p><strong>NIF:</strong> {{ selectedTransitaire.nif || '-' }}</p>
                <p><strong>RCCM:</strong> {{ selectedTransitaire.registre_commerce || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedTransitaire.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedTransitaire.ville }}</p>
                <p><strong>Pays:</strong> {{ selectedTransitaire.pays }}</p>
                <p><strong>Téléphone:</strong> {{ selectedTransitaire.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedTransitaire.email }}</p>
                <p><strong>Site web:</strong> {{ selectedTransitaire.site_web || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Agrément</h4>
                <p><strong>N° agrément:</strong> {{ selectedTransitaire.agrement_douane || '-' }}</p>
                <p><strong>Date agrément:</strong> {{ selectedTransitaire.date_agrement | date }}</p>
                <p><strong>Validité:</strong> {{ selectedTransitaire.date_validite_agrement | date }}</p>
                <p><strong>Note:</strong> {{ selectedTransitaire.note || '-' }}/10</p>
              </div>
              <div class="detail-section">
                <h4>Contact principal</h4>
                <p><strong>Nom:</strong> {{ selectedTransitaire.contact_nom || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedTransitaire.contact_telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedTransitaire.contact_email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Spécialités</h4>
                <p>{{ selectedTransitaire.specialites.join(', ') || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Pays d'opération</h4>
                <p>{{ selectedTransitaire.pays_operation.join(', ') || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Ports principaux</h4>
                <p>{{ selectedTransitaire.ports_principaux.join(', ') || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le transitaire <strong>{{ transitaireToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteTransitaire()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transitaires-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .checkbox-group { display: flex; align-items: center; gap: 10px; margin: 5px 0; }
    .checkbox-group input { width: auto; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .transitaires-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .transitaire-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .transitaire-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .transitaire-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .transitaire-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .transitaire-body p { margin: 5px 0; color: #6B7280; }
    .transitaire-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .transitaire-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.suspendu { background: #EF4444; color: white; }
    .transitaire-actions { display: flex; gap: 8px; }
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
export class Transitaires implements OnInit {
  transitaires: Transitaire[] = [];
  filteredTransitaires: Transitaire[] = [];
  selectedTransitaire: Transitaire | null = null;
  currentTransitaire: any = {
    code: 'TRANS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    forme_juridique: '',
    nif: '',
    registre_commerce: '',
    agrement_douane: '',
    date_agrement: new Date().toISOString().split('T')[0],
    date_validite_agrement: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    site_web: '',
    contact_nom: '',
    contact_telephone: '',
    contact_email: '',
    specialites: [],
    pays_operation: [],
    ports_principaux: [],
    conditions_paiement: '',
    tarifs: '',
    devise: 'FCFA',
    note: 0,
    statut: 'actif',
    notes: ''
  };
  paysOperationText = '';
  portsText = '';
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  paysFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  transitaireToDelete: Transitaire | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadTransitaires();
  }
  loadTransitaires() {
    const saved = localStorage.getItem('transitaires');
    this.transitaires = saved ? JSON.parse(saved) : [];
    this.filteredTransitaires = [...this.transitaires];
  }
  toggleSpecialite(specialite: string) {
    if (!this.currentTransitaire.specialites) this.currentTransitaire.specialites = [];
    const index = this.currentTransitaire.specialites.indexOf(specialite);
    if (index === -1) {
      this.currentTransitaire.specialites.push(specialite);
    } else {
      this.currentTransitaire.specialites.splice(index, 1);
    }
  }
  updatePaysOperation() {
    this.currentTransitaire.pays_operation = this.paysOperationText.split(',').map(p => p.trim()).filter(p => p);
  }
  updatePorts() {
    this.currentTransitaire.ports_principaux = this.portsText.split(',').map(p => p.trim()).filter(p => p);
  }
  saveTransitaire() {
    if (this.editMode) {
      const index = this.transitaires.findIndex(t => t.id === this.currentTransitaire.id);
      if (index !== -1) {
        this.transitaires[index] = { ...this.currentTransitaire };
        this.showSuccess('Transitaire modifié !');
      }
    } else {
      const newTransitaire = { ...this.currentTransitaire, id: Date.now() };
      this.transitaires.push(newTransitaire);
      this.showSuccess('Transitaire ajouté !');
    }
    localStorage.setItem('transitaires', JSON.stringify(this.transitaires));
    this.filterTransitaires();
    this.cancelForm();
  }
  editTransitaire(t: Transitaire) {
    this.currentTransitaire = { ...t };
    this.paysOperationText = t.pays_operation.join(', ') || '';
    this.portsText = t.ports_principaux.join(', ') || '';
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(t: Transitaire) {
    this.selectedTransitaire = t;
    this.showDetailsModal = true;
  }
  confirmDelete(t: Transitaire) {
    this.transitaireToDelete = t;
    this.showDeleteModal = true;
  }
  deleteTransitaire() {
    if (this.transitaireToDelete) {
      this.transitaires = this.transitaires.filter(t => t.id !== this.transitaireToDelete?.id);
      localStorage.setItem('transitaires', JSON.stringify(this.transitaires));
      this.filterTransitaires();
      this.showDeleteModal = false;
      this.transitaireToDelete = null;
      this.showSuccess('Transitaire supprimé !');
    }
  }
  cancelForm() {
    this.currentTransitaire = {
      code: 'TRANS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      forme_juridique: '',
      nif: '',
      registre_commerce: '',
      agrement_douane: '',
      date_agrement: new Date().toISOString().split('T')[0],
      date_validite_agrement: '',
      adresse: '',
      ville: '',
      pays: '',
      telephone: '',
      email: '',
      site_web: '',
      contact_nom: '',
      contact_telephone: '',
      contact_email: '',
      specialites: [],
      pays_operation: [],
      ports_principaux: [],
      conditions_paiement: '',
      tarifs: '',
      devise: 'FCFA',
      note: 0,
      statut: 'actif',
      notes: ''
    };
    this.paysOperationText = '';
    this.portsText = '';
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterTransitaires() {
    let filtered = this.transitaires;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.nom?.toLowerCase().includes(term) ||
        t.code?.toLowerCase().includes(term) ||
        t.ville?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(t => t.statut === this.statutFilter);
    }
    if (this.paysFilter) {
      filtered = filtered.filter(t => t.pays_operation.includes(this.paysFilter));
    }
    this.filteredTransitaires = filtered;
  }
  getPaysList(): string[] {
    const paysSet = new Set<string>();
    this.transitaires.forEach(t => {
      t.pays_operation.forEach(p => paysSet.add(p));
    });
    return Array.from(paysSet);
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', suspendu: 'Suspendu' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
