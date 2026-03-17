import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Client {
  id?: number;
  code: string;
  type: 'entreprise' | 'particulier' | 'association' | 'administration';
  civilite?: 'M' | 'Mme' | 'Mlle';
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  forme_juridique?: string;
  nif: string;
  registre_commerce?: string;
  date_creation?: string;
  secteur_activite?: string;
  adresse: string;
  ville: string;
  code_postal?: string;
  pays: string;
  telephone: string;
  email: string;
  site_web?: string;
  fax?: string;
  contact_nom?: string;
  contact_fonction?: string;
  contact_telephone?: string;
  contact_email?: string;
  conditions_paiement?: string;
  delai_paiement?: number;
  devise?: string;
  plafond_credit?: number;
  encours?: number;
  statut: 'actif' | 'inactif' | 'prospect';
  notes?: string;
  date_creation_compte: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="clients-container">
      <div class="header">
        <div>
          <h1>Clients</h1>
          <p class="subtitle">{{ clients.length }} client(s) • Total: {{ clientsActifs }} actifs</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau client</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} client</h3>
        <form (ngSubmit)="saveClient()" #clientForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
            <button type="button" [class.active]="activeTab === 'commercial'" (click)="activeTab = 'commercial'">Commercial</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentClient.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentClient.type" name="type">
                  <option value="entreprise">Entreprise</option>
                  <option value="particulier">Particulier</option>
                  <option value="association">Association</option>
                  <option value="administration">Administration</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentClient.type === 'particulier'">
                <label>Civilité</label>
                <select [(ngModel)]="currentClient.civilite" name="civilite">
                  <option value="M">M.</option>
                  <option value="Mme">Mme</option>
                  <option value="Mlle">Mlle</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentClient.type !== 'particulier'">
                <label>Raison sociale *</label>
                <input type="text" [(ngModel)]="currentClient.raison_sociale" name="raison_sociale" required>
              </div>
              <div class="form-group" *ngIf="currentClient.type === 'particulier'">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentClient.nom" name="nom" required>
              </div>
              <div class="form-group" *ngIf="currentClient.type === 'particulier'">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="currentClient.prenom" name="prenom">
              </div>
              <div class="form-group" *ngIf="currentClient.type !== 'particulier'">
                <label>Forme juridique</label>
                <input type="text" [(ngModel)]="currentClient.forme_juridique" name="forme_juridique">
              </div>
              <div class="form-group">
                <label>NIF *</label>
                <input type="text" [(ngModel)]="currentClient.nif" name="nif" required>
              </div>
              <div class="form-group">
                <label>Registre de commerce</label>
                <input type="text" [(ngModel)]="currentClient.registre_commerce" name="registre_commerce">
              </div>
              <div class="form-group">
                <label>Date création</label>
                <input type="date" [(ngModel)]="currentClient.date_creation" name="date_creation">
              </div>
              <div class="form-group">
                <label>Secteur d'activité</label>
                <input type="text" [(ngModel)]="currentClient.secteur_activite" name="secteur_activite">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contact'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Adresse *</label>
                <textarea [(ngModel)]="currentClient.adresse" name="adresse" rows="2" required></textarea>
              </div>
              <div class="form-group">
                <label>Ville *</label>
                <input type="text" [(ngModel)]="currentClient.ville" name="ville" required>
              </div>
              <div class="form-group">
                <label>Code postal</label>
                <input type="text" [(ngModel)]="currentClient.code_postal" name="code_postal">
              </div>
              <div class="form-group">
                <label>Pays *</label>
                <input type="text" [(ngModel)]="currentClient.pays" name="pays" value="Mali" required>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" [(ngModel)]="currentClient.telephone" name="telephone" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="currentClient.email" name="email" required>
              </div>
              <div class="form-group">
                <label>Site web</label>
                <input type="url" [(ngModel)]="currentClient.site_web" name="site_web">
              </div>
              <div class="form-group">
                <label>Fax</label>
                <input type="text" [(ngModel)]="currentClient.fax" name="fax">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'commercial'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Personne de contact</label>
                <input type="text" [(ngModel)]="currentClient.contact_nom" name="contact_nom">
              </div>
              <div class="form-group">
                <label>Fonction</label>
                <input type="text" [(ngModel)]="currentClient.contact_fonction" name="contact_fonction">
              </div>
              <div class="form-group">
                <label>Téléphone contact</label>
                <input type="tel" [(ngModel)]="currentClient.contact_telephone" name="contact_telephone">
              </div>
              <div class="form-group">
                <label>Email contact</label>
                <input type="email" [(ngModel)]="currentClient.contact_email" name="contact_email">
              </div>
              <div class="form-group">
                <label>Conditions de paiement</label>
                <input type="text" [(ngModel)]="currentClient.conditions_paiement" name="conditions_paiement" placeholder="Ex: 30 jours fin de mois">
              </div>
              <div class="form-group">
                <label>Délai de paiement (jours)</label>
                <input type="number" [(ngModel)]="currentClient.delai_paiement" name="delai_paiement" min="0">
              </div>
              <div class="form-group">
                <label>Devise</label>
                <input type="text" [(ngModel)]="currentClient.devise" name="devise" value="FCFA">
              </div>
              <div class="form-group">
                <label>Plafond de crédit (FCFA)</label>
                <input type="number" [(ngModel)]="currentClient.plafond_credit" name="plafond_credit" min="0">
              </div>
              <div class="form-group">
                <label>Encours actuel (FCFA)</label>
                <input type="number" [(ngModel)]="currentClient.encours" name="encours" min="0" readonly>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentClient.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentClient.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="clientForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="clients.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterClients()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterClients()" class="filter-select">
          <option value="">Tous types</option>
          <option value="entreprise">Entreprise</option>
          <option value="particulier">Particulier</option>
          <option value="association">Association</option>
          <option value="administration">Administration</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterClients()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>
      <div class="clients-grid" *ngIf="clients.length > 0; else emptyState">
        <div class="client-card" *ngFor="let c of filteredClients">
          <div class="client-header">
            <span class="client-nom">{{ c.type === 'particulier' ? c.civilite + ' ' + c.nom + ' ' + (c.prenom || '') : c.raison_sociale }}</span>
            <span class="client-code">{{ c.code }}</span>
          </div>
          <div class="client-body">
            <p><span class="label">NIF:</span> {{ c.nif }}</p>
            <p><span class="label">Ville:</span> {{ c.ville }}</p>
            <p><span class="label">Tél:</span> {{ c.telephone }}</p>
            <p><span class="label">Email:</span> {{ c.email }}</p>
            <p><span class="label">Encours:</span> {{ c.encours | number }} FCFA</p>
          </div>
          <div class="client-footer">
            <span class="badge-statut" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
            <div class="client-actions">
              <button class="btn-icon" [routerLink]="['/clients', c.id]" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editClient(c)" title="Modifier">✏️</button>
              <button class="btn-icon" (click)="duplicateClient(c)" title="Dupliquer">📋</button>
              <button class="btn-icon delete" (click)="confirmDelete(c)" title="Supprimer">��️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h2>Aucun client</h2>
          <p>Ajoutez votre premier client</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau client</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le client <strong>{{ clientToDelete?.nom || clientToDelete?.raison_sociale }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteClient()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clients-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .client-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .client-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .client-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .client-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .client-body p { margin: 5px 0; color: #6B7280; }
    .client-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .client-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.prospect { background: #F59E0B; color: white; }
    .client-actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Clients implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  currentClient: any = {
    code: 'CLI-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    type: 'entreprise',
    civilite: 'M',
    nom: '',
    prenom: '',
    raison_sociale: '',
    forme_juridique: '',
    nif: '',
    registre_commerce: '',
    date_creation: '',
    secteur_activite: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'Mali',
    telephone: '',
    email: '',
    site_web: '',
    fax: '',
    contact_nom: '',
    contact_fonction: '',
    contact_telephone: '',
    contact_email: '',
    conditions_paiement: '',
    delai_paiement: 30,
    devise: 'FCFA',
    plafond_credit: 0,
    encours: 0,
    statut: 'actif',
    notes: '',
    date_creation_compte: new Date().toISOString().split('T')[0]
  };
  activeTab = 'info';
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  clientToDelete: Client | null = null;
  successMessage = '';
  clientsActifs = 0;
  ngOnInit() {
    this.loadClients();
  }
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
    this.filteredClients = [...this.clients];
    this.calculerStats();
  }
  saveClient() {
    if (this.editMode) {
      const index = this.clients.findIndex(c => c.id === this.currentClient.id);
      if (index !== -1) {
        this.clients[index] = { ...this.currentClient };
        this.showSuccess('Client modifié !');
      }
    } else {
      const newClient = { ...this.currentClient, id: Date.now() };
      this.clients.push(newClient);
      this.showSuccess('Client ajouté !');
    }
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.calculerStats();
    this.filterClients();
    this.cancelForm();
  }
  editClient(c: Client) {
    this.currentClient = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  duplicateClient(c: Client) {
    const newClient = { 
      ...c, 
      id: Date.now(), 
      code: c.code + '-COPY',
      raison_sociale: c.raison_sociale ? c.raison_sociale + ' (copie)' : '',
      nom: c.nom ? c.nom + ' (copie)' : ''
    };
    this.clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.filterClients();
    this.calculerStats();
    this.showSuccess('Client dupliqué !');
  }
  confirmDelete(c: Client) {
    this.clientToDelete = c;
    this.showDeleteModal = true;
  }
  deleteClient() {
    if (this.clientToDelete) {
      this.clients = this.clients.filter(c => c.id !== this.clientToDelete?.id);
      localStorage.setItem('clients', JSON.stringify(this.clients));
      this.filterClients();
      this.calculerStats();
      this.showDeleteModal = false;
      this.clientToDelete = null;
      this.showSuccess('Client supprimé !');
    }
  }
  cancelForm() {
    this.currentClient = {
      code: 'CLI-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      type: 'entreprise',
      civilite: 'M',
      nom: '',
      prenom: '',
      raison_sociale: '',
      forme_juridique: '',
      nif: '',
      registre_commerce: '',
      date_creation: '',
      secteur_activite: '',
      adresse: '',
      ville: '',
      code_postal: '',
      pays: 'Mali',
      telephone: '',
      email: '',
      site_web: '',
      fax: '',
      contact_nom: '',
      contact_fonction: '',
      contact_telephone: '',
      contact_email: '',
      conditions_paiement: '',
      delai_paiement: 30,
      devise: 'FCFA',
      plafond_credit: 0,
      encours: 0,
      statut: 'actif',
      notes: '',
      date_creation_compte: new Date().toISOString().split('T')[0]
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterClients() {
    let filtered = this.clients;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.raison_sociale?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.ville?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    this.filteredClients = filtered;
  }
  calculerStats() {
    this.clientsActifs = this.clients.filter(c => c.statut === 'actif').length;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', prospect: 'Prospect' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
