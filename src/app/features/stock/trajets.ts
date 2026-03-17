import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Trajet {
  id?: number;
  reference: string;
  date_depart: string;
  date_arrivee?: string;
  heure_depart: string;
  heure_arrivee?: string;
  lieu_depart: string;
  lieu_arrivee: string;
  distance_km: number;
  duree_estimee: number;
  duree_reelle?: number;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  chauffeur_id: number;
  chauffeur_nom?: string;
  type: 'livraison' | 'transport' | 'transfert' | 'tournee';
  client_id?: number;
  client_nom?: string;
  marchandise?: string;
  poids?: number;
  volume?: number;
  cout_carburant?: number;
  cout_peage?: number;
  cout_autre?: number;
  cout_total?: number;
  notes?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
}

@Component({
  selector: 'app-trajets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="trajets-container">
      <div class="header">
        <div>
          <h1>Trajets</h1>
          <p class="subtitle">{{ trajets.length }} trajet(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau trajet</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} trajet</h3>
        <form (ngSubmit)="saveTrajet()" #trajetForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Référence *</label>
              <input type="text" [(ngModel)]="currentTrajet.reference" name="reference" required>
            </div>
            <div class="form-group">
              <label>Date départ *</label>
              <input type="date" [(ngModel)]="currentTrajet.date_depart" name="date_depart" required>
            </div>
            <div class="form-group">
              <label>Heure départ *</label>
              <input type="time" [(ngModel)]="currentTrajet.heure_depart" name="heure_depart" required>
            </div>
            <div class="form-group">
              <label>Date arrivée</label>
              <input type="date" [(ngModel)]="currentTrajet.date_arrivee" name="date_arrivee">
            </div>
            <div class="form-group">
              <label>Heure arrivée</label>
              <input type="time" [(ngModel)]="currentTrajet.heure_arrivee" name="heure_arrivee">
            </div>
            <div class="form-group">
              <label>Lieu départ *</label>
              <input type="text" [(ngModel)]="currentTrajet.lieu_depart" name="lieu_depart" required>
            </div>
            <div class="form-group">
              <label>Lieu arrivée *</label>
              <input type="text" [(ngModel)]="currentTrajet.lieu_arrivee" name="lieu_arrivee" required>
            </div>
            <div class="form-group">
              <label>Distance (km)</label>
              <input type="number" [(ngModel)]="currentTrajet.distance_km" name="distance_km" min="0" step="0.1">
            </div>
            <div class="form-group">
              <label>Durée estimée (heures)</label>
              <input type="number" [(ngModel)]="currentTrajet.duree_estimee" name="duree_estimee" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label>Véhicule *</label>
              <select [(ngModel)]="currentTrajet.vehicule_id" name="vehicule_id" required (change)="onVehiculeChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Chauffeur *</label>
              <select [(ngModel)]="currentTrajet.chauffeur_id" name="chauffeur_id" required (change)="onChauffeurChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let c of chauffeurs" [value]="c.id">{{ c.nom }} {{ c.prenom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="currentTrajet.type" name="type">
                <option value="livraison">Livraison</option>
                <option value="transport">Transport</option>
                <option value="transfert">Transfert</option>
                <option value="tournee">Tournée</option>
              </select>
            </div>
            <div class="form-group">
              <label>Client</label>
              <select [(ngModel)]="currentTrajet.client_id" name="client_id" (change)="onClientChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Marchandise</label>
              <input type="text" [(ngModel)]="currentTrajet.marchandise" name="marchandise">
            </div>
            <div class="form-group">
              <label>Poids (kg)</label>
              <input type="number" [(ngModel)]="currentTrajet.poids" name="poids" min="0" step="0.1">
            </div>
            <div class="form-group">
              <label>Volume (m³)</label>
              <input type="number" [(ngModel)]="currentTrajet.volume" name="volume" min="0" step="0.1">
            </div>
            <div class="form-group">
              <label>Coût carburant</label>
              <input type="number" [(ngModel)]="currentTrajet.cout_carburant" name="cout_carburant" min="0" (input)="calculerCoutTotal()">
            </div>
            <div class="form-group">
              <label>Coût péage</label>
              <input type="number" [(ngModel)]="currentTrajet.cout_peage" name="cout_peage" min="0" (input)="calculerCoutTotal()">
            </div>
            <div class="form-group">
              <label>Autres coûts</label>
              <input type="number" [(ngModel)]="currentTrajet.cout_autre" name="cout_autre" min="0" (input)="calculerCoutTotal()">
            </div>
            <div class="form-group">
              <label>Coût total</label>
              <input type="number" [(ngModel)]="currentTrajet.cout_total" name="cout_total" readonly>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentTrajet.statut" name="statut">
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentTrajet.notes" name="notes" rows="4"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="trajetForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="trajets.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterTrajets()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterTrajets()" class="filter-select">
          <option value="">Tous types</option>
          <option value="livraison">Livraison</option>
          <option value="transport">Transport</option>
          <option value="transfert">Transfert</option>
          <option value="tournee">Tournée</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterTrajets()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="planifie">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>
      <div class="trajets-list" *ngIf="trajets.length > 0; else emptyState">
        <div class="trajet-card" *ngFor="let t of filteredTrajets">
          <div class="trajet-header">
            <span class="trajet-reference">{{ t.reference }}</span>
            <span class="trajet-badge" [class]="t.statut">{{ getStatutLabel(t.statut) }}</span>
          </div>
          <div class="trajet-body">
            <div class="trajet-itineraire">
              <div class="point-depart">
                <span class="point-label">Départ:</span>
                <span class="point-lieu">{{ t.lieu_depart }}</span>
                <span class="point-date">{{ t.date_depart | date }} {{ t.heure_depart }}</span>
              </div>
              <div class="point-arrivee">
                <span class="point-label">Arrivée:</span>
                <span class="point-lieu">{{ t.lieu_arrivee }}</span>
                <span class="point-date">{{ t.date_arrivee | date }} {{ t.heure_arrivee }}</span>
              </div>
            </div>
            <div class="trajet-infos">
              <p><span class="label">Véhicule:</span> {{ t.vehicule_immatriculation }}</p>
              <p><span class="label">Chauffeur:</span> {{ t.chauffeur_nom }}</p>
              <p><span class="label">Distance:</span> {{ t.distance_km }} km</p>
              <p><span class="label">Coût total:</span> {{ t.cout_total | number }} FCFA</p>
            </div>
          </div>
          <div class="trajet-footer">
            <div class="trajet-actions">
              <button class="btn-icon" (click)="startTrajet(t)" *ngIf="t.statut === 'planifie'" title="Démarrer">▶️</button>
              <button class="btn-icon" (click)="completeTrajet(t)" *ngIf="t.statut === 'en_cours'" title="Terminer">⏹️</button>
              <button class="btn-icon" (click)="viewDetails(t)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editTrajet(t)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(t)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📍</div>
          <h2>Aucun trajet</h2>
          <p>Planifiez votre premier trajet</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau trajet</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Trajet {{ selectedTrajet?.reference }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedTrajet">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedTrajet.reference }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedTrajet.type) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedTrajet.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>Itinéraire</h4>
                <p><strong>Départ:</strong> {{ selectedTrajet.lieu_depart }}</p>
                <p><strong>Date départ:</strong> {{ selectedTrajet.date_depart | date }} à {{ selectedTrajet.heure_depart }}</p>
                <p><strong>Arrivée:</strong> {{ selectedTrajet.lieu_arrivee }}</p>
                <p><strong>Date arrivée:</strong> {{ selectedTrajet.date_arrivee | date }} à {{ selectedTrajet.heure_arrivee }}</p>
                <p><strong>Distance:</strong> {{ selectedTrajet.distance_km }} km</p>
              </div>
              <div class="detail-section">
                <h4>Moyens</h4>
                <p><strong>Véhicule:</strong> {{ selectedTrajet.vehicule_immatriculation }}</p>
                <p><strong>Chauffeur:</strong> {{ selectedTrajet.chauffeur_nom }}</p>
              </div>
              <div class="detail-section">
                <h4>Client & Marchandise</h4>
                <p><strong>Client:</strong> {{ selectedTrajet.client_nom || '-' }}</p>
                <p><strong>Marchandise:</strong> {{ selectedTrajet.marchandise || '-' }}</p>
                <p><strong>Poids:</strong> {{ selectedTrajet.poids || '-' }} kg</p>
                <p><strong>Volume:</strong> {{ selectedTrajet.volume || '-' }} m³</p>
              </div>
              <div class="detail-section">
                <h4>Coûts</h4>
                <p><strong>Carburant:</strong> {{ selectedTrajet.cout_carburant | number }} FCFA</p>
                <p><strong>Péage:</strong> {{ selectedTrajet.cout_peage | number }} FCFA</p>
                <p><strong>Autres:</strong> {{ selectedTrajet.cout_autre | number }} FCFA</p>
                <p><strong>Total:</strong> {{ selectedTrajet.cout_total | number }} FCFA</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedTrajet.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le trajet <strong>{{ trajetToDelete?.reference }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteTrajet()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trajets-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
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
    .trajets-list { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .trajet-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .trajet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .trajet-reference { font-weight: 600; color: #1F2937; font-size: 16px; }
    .trajet-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .trajet-badge.planifie { background: #F59E0B; color: white; }
    .trajet-badge.en_cours { background: #10B981; color: white; }
    .trajet-badge.termine { background: #6B7280; color: white; }
    .trajet-badge.annule { background: #EF4444; color: white; }
    .trajet-body { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 15px; }
    .trajet-itineraire { border-right: 1px solid #FCE7F3; padding-right: 20px; }
    .point-depart, .point-arrivee { margin-bottom: 10px; }
    .point-label { font-weight: 600; color: #4B5563; display: block; }
    .point-lieu { color: #1F2937; font-size: 16px; display: block; }
    .point-date { color: #6B7280; font-size: 13px; }
    .trajet-infos p { margin: 5px 0; }
    .trajet-infos .label { color: #6B7280; width: 80px; display: inline-block; }
    .trajet-footer { border-top: 1px solid #FCE7F3; padding-top: 15px; }
    .trajet-actions { display: flex; justify-content: flex-end; gap: 8px; }
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
export class Trajets implements OnInit {
  vehicules: any[] = [];
  chauffeurs: any[] = [];
  clients: any[] = [];
  trajets: Trajet[] = [];
  filteredTrajets: Trajet[] = [];
  selectedTrajet: Trajet | null = null;
  currentTrajet: any = {
    reference: 'TRJ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    date_depart: new Date().toISOString().split('T')[0],
    heure_depart: '08:00',
    date_arrivee: '',
    heure_arrivee: '',
    lieu_depart: '',
    lieu_arrivee: '',
    distance_km: 0,
    duree_estimee: 0,
    duree_reelle: 0,
    vehicule_id: '',
    chauffeur_id: '',
    type: 'transport',
    client_id: '',
    marchandise: '',
    poids: 0,
    volume: 0,
    cout_carburant: 0,
    cout_peage: 0,
    cout_autre: 0,
    cout_total: 0,
    notes: '',
    statut: 'planifie'
  };
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  trajetToDelete: Trajet | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
    this.loadClients();
    this.loadTrajets();
  }
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
  }
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  loadTrajets() {
    const saved = localStorage.getItem('trajets');
    this.trajets = saved ? JSON.parse(saved) : [];
    this.filteredTrajets = [...this.trajets];
  }
  onVehiculeChange() {
    const v = this.vehicules.find(v => v.id === this.currentTrajet.vehicule_id);
    if (v) this.currentTrajet.vehicule_immatriculation = v.immatriculation;
  }
  onChauffeurChange() {
    const c = this.chauffeurs.find(c => c.id === this.currentTrajet.chauffeur_id);
    if (c) this.currentTrajet.chauffeur_nom = c.nom + ' ' + c.prenom;
  }
  onClientChange() {
    const c = this.clients.find(c => c.id === this.currentTrajet.client_id);
    if (c) this.currentTrajet.client_nom = c.nom;
  }
  calculerCoutTotal() {
    this.currentTrajet.cout_total = (this.currentTrajet.cout_carburant || 0) + 
                                   (this.currentTrajet.cout_peage || 0) + 
                                   (this.currentTrajet.cout_autre || 0);
  }
  saveTrajet() {
    const v = this.vehicules.find(v => v.id === this.currentTrajet.vehicule_id);
    const c = this.chauffeurs.find(c => c.id === this.currentTrajet.chauffeur_id);
    const cl = this.clients.find(c => c.id === this.currentTrajet.client_id);
    if (this.editMode) {
      const index = this.trajets.findIndex(t => t.id === this.currentTrajet.id);
      if (index !== -1) {
        this.trajets[index] = { 
          ...this.currentTrajet, 
          vehicule_immatriculation: v?.immatriculation,
          chauffeur_nom: c ? c.nom + ' ' + c.prenom : '',
          client_nom: cl?.nom
        };
        this.showSuccess('Trajet modifié !');
      }
    } else {
      const newTrajet = { 
        ...this.currentTrajet, 
        id: Date.now(),
        vehicule_immatriculation: v?.immatriculation,
        chauffeur_nom: c ? c.nom + ' ' + c.prenom : '',
        client_nom: cl?.nom
      };
      this.trajets.push(newTrajet);
      this.showSuccess('Trajet ajouté !');
    }
    localStorage.setItem('trajets', JSON.stringify(this.trajets));
    this.filterTrajets();
    this.cancelForm();
  }
  startTrajet(t: Trajet) {
    t.statut = 'en_cours';
    t.date_depart = new Date().toISOString().split('T')[0];
    t.heure_depart = new Date().toTimeString().split(' ')[0].substring(0,5);
    localStorage.setItem('trajets', JSON.stringify(this.trajets));
    this.filterTrajets();
    this.showSuccess('Trajet démarré !');
  }
  completeTrajet(t: Trajet) {
    t.statut = 'termine';
    t.date_arrivee = new Date().toISOString().split('T')[0];
    t.heure_arrivee = new Date().toTimeString().split(' ')[0].substring(0,5);
    localStorage.setItem('trajets', JSON.stringify(this.trajets));
    this.filterTrajets();
    this.showSuccess('Trajet terminé !');
  }
  editTrajet(t: Trajet) {
    this.currentTrajet = { ...t };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(t: Trajet) {
    this.selectedTrajet = t;
    this.showDetailsModal = true;
  }
  confirmDelete(t: Trajet) {
    this.trajetToDelete = t;
    this.showDeleteModal = true;
  }
  deleteTrajet() {
    if (this.trajetToDelete) {
      this.trajets = this.trajets.filter(t => t.id !== this.trajetToDelete?.id);
      localStorage.setItem('trajets', JSON.stringify(this.trajets));
      this.filterTrajets();
      this.showDeleteModal = false;
      this.trajetToDelete = null;
      this.showSuccess('Trajet supprimé !');
    }
  }
  cancelForm() {
    this.currentTrajet = {
      reference: 'TRJ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      date_depart: new Date().toISOString().split('T')[0],
      heure_depart: '08:00',
      date_arrivee: '',
      heure_arrivee: '',
      lieu_depart: '',
      lieu_arrivee: '',
      distance_km: 0,
      duree_estimee: 0,
      duree_reelle: 0,
      vehicule_id: '',
      chauffeur_id: '',
      type: 'transport',
      client_id: '',
      marchandise: '',
      poids: 0,
      volume: 0,
      cout_carburant: 0,
      cout_peage: 0,
      cout_autre: 0,
      cout_total: 0,
      notes: '',
      statut: 'planifie'
    };
    this.showForm = false;
    this.editMode = false;
  }
  filterTrajets() {
    let filtered = this.trajets;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.reference?.toLowerCase().includes(term) ||
        t.lieu_depart?.toLowerCase().includes(term) ||
        t.lieu_arrivee?.toLowerCase().includes(term) ||
        t.vehicule_immatriculation?.toLowerCase().includes(term) ||
        t.chauffeur_nom?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(t => t.type === this.typeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(t => t.statut === this.statutFilter);
    }
    this.filteredTrajets = filtered;
  }
  getTypeLabel(type: string): string {
    const labels: any = { livraison: 'Livraison', transport: 'Transport', transfert: 'Transfert', tournee: 'Tournée' };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
