import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Equipement {
  id?: number;
  code: string;
  nom: string;
  type: 'machine' | 'outil' | 'vehicule' | 'instrument' | 'autre';
  marque: string;
  modele: string;
  numero_serie: string;
  date_acquisition: string;
  date_mise_en_service: string;
  fournisseur: string;
  prix_achat: number;
  duree_vie_ans: number;
  garantie_mois: number;
  date_fin_garantie?: string;
  localisation: string;
  service_responsable: string;
  responsable: string;
  caracteristiques: string;
  puissance?: string;
  capacite?: string;
  dimensions?: string;
  poids?: number;
  consommation?: string;
  etat: 'operationnel' | 'maintenance' | 'panne' | 'hors_service';
  disponibilite: 'disponible' | 'occupe' | 'reserve';
  date_derniere_maintenance?: string;
  date_prochaine_maintenance?: string;
  frequence_maintenance_jours: number;
  notes?: string;
  document_tech?: string;
  photo?: string;
}

@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="equipements-container">
      <div class="header">
        <div>
          <h1>Équipements</h1>
          <p class="subtitle">{{ equipements.length }} équipement(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvel équipement</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} équipement</h3>
        <form (ngSubmit)="saveEquipement()" #equipementForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'caracteristiques'" (click)="activeTab = 'caracteristiques'">Caractéristiques</button>
            <button type="button" [class.active]="activeTab === 'maintenance'" (click)="activeTab = 'maintenance'">Maintenance</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentEquipement.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentEquipement.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentEquipement.type" name="type">
                  <option value="machine">Machine</option>
                  <option value="outil">Outil</option>
                  <option value="instrument">Instrument</option>
                  <option value="vehicule">Véhicule</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div class="form-group">
                <label>Marque</label>
                <input type="text" [(ngModel)]="currentEquipement.marque" name="marque">
              </div>
              <div class="form-group">
                <label>Modèle</label>
                <input type="text" [(ngModel)]="currentEquipement.modele" name="modele">
              </div>
              <div class="form-group">
                <label>N° de série</label>
                <input type="text" [(ngModel)]="currentEquipement.numero_serie" name="numero_serie">
              </div>
              <div class="form-group">
                <label>Date d'acquisition</label>
                <input type="date" [(ngModel)]="currentEquipement.date_acquisition" name="date_acquisition">
              </div>
              <div class="form-group">
                <label>Date mise en service</label>
                <input type="date" [(ngModel)]="currentEquipement.date_mise_en_service" name="date_mise_en_service">
              </div>
              <div class="form-group">
                <label>Fournisseur</label>
                <input type="text" [(ngModel)]="currentEquipement.fournisseur" name="fournisseur">
              </div>
              <div class="form-group">
                <label>Prix d'achat (FCFA)</label>
                <input type="number" [(ngModel)]="currentEquipement.prix_achat" name="prix_achat" min="0">
              </div>
              <div class="form-group">
                <label>Durée de vie (ans)</label>
                <input type="number" [(ngModel)]="currentEquipement.duree_vie_ans" name="duree_vie_ans" min="0" step="0.5">
              </div>
              <div class="form-group">
                <label>Garantie (mois)</label>
                <input type="number" [(ngModel)]="currentEquipement.garantie_mois" name="garantie_mois" min="0" (input)="calculerFinGarantie()">
              </div>
              <div class="form-group">
                <label>Fin de garantie</label>
                <input type="date" [(ngModel)]="currentEquipement.date_fin_garantie" name="date_fin_garantie" readonly>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'caracteristiques'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Localisation</label>
                <input type="text" [(ngModel)]="currentEquipement.localisation" name="localisation">
              </div>
              <div class="form-group">
                <label>Service responsable</label>
                <input type="text" [(ngModel)]="currentEquipement.service_responsable" name="service_responsable">
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentEquipement.responsable" name="responsable">
              </div>
              <div class="form-group">
                <label>État</label>
                <select [(ngModel)]="currentEquipement.etat" name="etat">
                  <option value="operationnel">Opérationnel</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="panne">En panne</option>
                  <option value="hors_service">Hors service</option>
                </select>
              </div>
              <div class="form-group">
                <label>Disponibilité</label>
                <select [(ngModel)]="currentEquipement.disponibilite" name="disponibilite">
                  <option value="disponible">Disponible</option>
                  <option value="occupe">Occupé</option>
                  <option value="reserve">Réservé</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Caractéristiques techniques</label>
                <textarea [(ngModel)]="currentEquipement.caracteristiques" name="caracteristiques" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Puissance</label>
                <input type="text" [(ngModel)]="currentEquipement.puissance" name="puissance">
              </div>
              <div class="form-group">
                <label>Capacité</label>
                <input type="text" [(ngModel)]="currentEquipement.capacite" name="capacite">
              </div>
              <div class="form-group">
                <label>Dimensions</label>
                <input type="text" [(ngModel)]="currentEquipement.dimensions" name="dimensions">
              </div>
              <div class="form-group">
                <label>Poids (kg)</label>
                <input type="number" [(ngModel)]="currentEquipement.poids" name="poids" min="0" step="0.1">
              </div>
              <div class="form-group">
                <label>Consommation</label>
                <input type="text" [(ngModel)]="currentEquipement.consommation" name="consommation">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'maintenance'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Fréquence maintenance (jours)</label>
                <input type="number" [(ngModel)]="currentEquipement.frequence_maintenance_jours" name="frequence_maintenance_jours" min="0">
              </div>
              <div class="form-group">
                <label>Dernière maintenance</label>
                <input type="date" [(ngModel)]="currentEquipement.date_derniere_maintenance" name="date_derniere_maintenance" (change)="calculerProchaineMaintenance()">
              </div>
              <div class="form-group">
                <label>Prochaine maintenance</label>
                <input type="date" [(ngModel)]="currentEquipement.date_prochaine_maintenance" name="date_prochaine_maintenance" readonly>
              </div>
              <div class="form-group">
                <label>Document technique (URL)</label>
                <input type="text" [(ngModel)]="currentEquipement.document_tech" name="document_tech">
              </div>
              <div class="form-group">
                <label>Photo (URL)</label>
                <input type="text" [(ngModel)]="currentEquipement.photo" name="photo">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentEquipement.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="equipementForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="equipements.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEquipements()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterEquipements()" class="filter-select">
          <option value="">Tous types</option>
          <option value="machine">Machine</option>
          <option value="outil">Outil</option>
          <option value="instrument">Instrument</option>
          <option value="vehicule">Véhicule</option>
          <option value="autre">Autre</option>
        </select>
        <select [(ngModel)]="etatFilter" (ngModelChange)="filterEquipements()" class="filter-select">
          <option value="">Tous états</option>
          <option value="operationnel">Opérationnel</option>
          <option value="maintenance">Maintenance</option>
          <option value="panne">Panne</option>
          <option value="hors_service">Hors service</option>
        </select>
      </div>
      <div class="equipements-grid" *ngIf="equipements.length > 0; else emptyState">
        <div class="equipement-card" *ngFor="let e of filteredEquipements" [class.alerte]="isMaintenanceDue(e)">
          <div class="equipement-header">
            <span class="equipement-nom">{{ e.nom }}</span>
            <span class="equipement-code">{{ e.code }}</span>
          </div>
          <div class="equipement-body">
            <p><span class="label">Type:</span> {{ e.type }}</p>
            <p><span class="label">Marque:</span> {{ e.marque }} {{ e.modele }}</p>
            <p><span class="label">Localisation:</span> {{ e.localisation }}</p>
            <p><span class="label">État:</span> <span class="etat-badge" [class]="e.etat">{{ getEtatLabel(e.etat) }}</span></p>
            <p><span class="label">Dispo:</span> {{ getDispoLabel(e.disponibilite) }}</p>
            <div class="maintenance-alert" *ngIf="isMaintenanceDue(e)">
              ⚠️ Maintenance dans {{ getJoursAvantMaintenance(e) }} jours
            </div>
          </div>
          <div class="equipement-footer">
            <div class="equipement-actions">
              <button class="btn-icon" (click)="viewDetails(e)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editEquipement(e)" title="Modifier">✏️</button>
              <button class="btn-icon" (click)="duplicateEquipement(e)" title="Dupliquer">📋</button>
              <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">⚙️</div>
          <h2>Aucun équipement</h2>
          <p>Ajoutez votre premier équipement</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvel équipement</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedEquipement?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEquipement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedEquipement.code }}</p>
                <p><strong>Nom:</strong> {{ selectedEquipement.nom }}</p>
                <p><strong>Type:</strong> {{ selectedEquipement.type }}</p>
                <p><strong>Marque:</strong> {{ selectedEquipement.marque }} {{ selectedEquipement.modele }}</p>
                <p><strong>N° série:</strong> {{ selectedEquipement.numero_serie || '-' }}</p>
                <p><strong>Fournisseur:</strong> {{ selectedEquipement.fournisseur || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Acquisition</h4>
                <p><strong>Date acquisition:</strong> {{ selectedEquipement.date_acquisition | date }}</p>
                <p><strong>Mise en service:</strong> {{ selectedEquipement.date_mise_en_service | date }}</p>
                <p><strong>Prix achat:</strong> {{ selectedEquipement.prix_achat | number }} FCFA</p>
                <p><strong>Durée de vie:</strong> {{ selectedEquipement.duree_vie_ans }} ans</p>
                <p><strong>Garantie:</strong> {{ selectedEquipement.garantie_mois }} mois</p>
                <p><strong>Fin garantie:</strong> {{ selectedEquipement.date_fin_garantie | date }}</p>
              </div>
              <div class="detail-section">
                <h4>Localisation & Responsable</h4>
                <p><strong>Localisation:</strong> {{ selectedEquipement.localisation }}</p>
                <p><strong>Service:</strong> {{ selectedEquipement.service_responsable }}</p>
                <p><strong>Responsable:</strong> {{ selectedEquipement.responsable }}</p>
                <p><strong>État:</strong> {{ getEtatLabel(selectedEquipement.etat) }}</p>
                <p><strong>Disponibilité:</strong> {{ getDispoLabel(selectedEquipement.disponibilite) }}</p>
              </div>
              <div class="detail-section">
                <h4>Caractéristiques techniques</h4>
                <p>{{ selectedEquipement.caracteristiques || '-' }}</p>
                <p><strong>Puissance:</strong> {{ selectedEquipement.puissance || '-' }}</p>
                <p><strong>Capacité:</strong> {{ selectedEquipement.capacite || '-' }}</p>
                <p><strong>Dimensions:</strong> {{ selectedEquipement.dimensions || '-' }}</p>
                <p><strong>Poids:</strong> {{ selectedEquipement.poids || '-' }} kg</p>
                <p><strong>Consommation:</strong> {{ selectedEquipement.consommation || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Maintenance</h4>
                <p><strong>Fréquence:</strong> {{ selectedEquipement.frequence_maintenance_jours }} jours</p>
                <p><strong>Dernière:</strong> {{ selectedEquipement.date_derniere_maintenance | date }}</p>
                <p><strong>Prochaine:</strong> {{ selectedEquipement.date_prochaine_maintenance | date }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedEquipement.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'équipement <strong>{{ equipementToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEquipement()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .equipements-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .equipements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .equipement-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .equipement-card.alerte { border-left: 4px solid #F59E0B; }
    .equipement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .equipement-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .equipement-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .equipement-body p { margin: 5px 0; color: #6B7280; }
    .equipement-body .label { color: #4B5563; width: 90px; display: inline-block; }
    .etat-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .etat-badge.operationnel { background: #10B981; color: white; }
    .etat-badge.maintenance { background: #F59E0B; color: white; }
    .etat-badge.panne { background: #EF4444; color: white; }
    .etat-badge.hors_service { background: #6B7280; color: white; }
    .maintenance-alert { margin-top: 10px; padding: 8px; background: #FEF3C7; border-radius: 4px; color: #92400E; font-size: 12px; }
    .equipement-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .equipement-actions { display: flex; justify-content: flex-end; gap: 8px; }
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
export class Equipements implements OnInit {
  equipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  selectedEquipement: Equipement | null = null;
  currentEquipement: any = {
    code: 'EQ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    type: 'machine',
    marque: '',
    modele: '',
    numero_serie: '',
    date_acquisition: new Date().toISOString().split('T')[0],
    date_mise_en_service: new Date().toISOString().split('T')[0],
    fournisseur: '',
    prix_achat: 0,
    duree_vie_ans: 10,
    garantie_mois: 12,
    date_fin_garantie: '',
    localisation: '',
    service_responsable: '',
    responsable: '',
    caracteristiques: '',
    puissance: '',
    capacite: '',
    dimensions: '',
    poids: 0,
    consommation: '',
    etat: 'operationnel',
    disponibilite: 'disponible',
    date_derniere_maintenance: new Date().toISOString().split('T')[0],
    date_prochaine_maintenance: '',
    frequence_maintenance_jours: 30,
    notes: '',
    document_tech: '',
    photo: ''
  };
  activeTab = 'info';
  searchTerm = '';
  typeFilter = '';
  etatFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  equipementToDelete: Equipement | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadEquipements();
  }
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    this.equipements = saved ? JSON.parse(saved) : [];
    this.filteredEquipements = [...this.equipements];
  }
  calculerFinGarantie() {
    if (this.currentEquipement.date_acquisition && this.currentEquipement.garantie_mois) {
      const date = new Date(this.currentEquipement.date_acquisition);
      date.setMonth(date.getMonth() + Number(this.currentEquipement.garantie_mois));
      this.currentEquipement.date_fin_garantie = date.toISOString().split('T')[0];
    }
  }
  calculerProchaineMaintenance() {
    if (this.currentEquipement.date_derniere_maintenance && this.currentEquipement.frequence_maintenance_jours) {
      const date = new Date(this.currentEquipement.date_derniere_maintenance);
      date.setDate(date.getDate() + Number(this.currentEquipement.frequence_maintenance_jours));
      this.currentEquipement.date_prochaine_maintenance = date.toISOString().split('T')[0];
    }
  }
  saveEquipement() {
    if (this.editMode) {
      const index = this.equipements.findIndex(e => e.id === this.currentEquipement.id);
      if (index !== -1) {
        this.equipements[index] = { ...this.currentEquipement };
        this.showSuccess('Équipement modifié !');
      }
    } else {
      const newEquipement = { ...this.currentEquipement, id: Date.now() };
      this.equipements.push(newEquipement);
      this.showSuccess('Équipement ajouté !');
    }
    localStorage.setItem('equipements', JSON.stringify(this.equipements));
    this.filterEquipements();
    this.cancelForm();
  }
  editEquipement(e: Equipement) {
    this.currentEquipement = { ...e };
    this.editMode = true;
    this.showForm = true;
  }
  duplicateEquipement(e: Equipement) {
    const newEquipement = { 
      ...e, 
      id: Date.now(), 
      code: e.code + '-COPY',
      nom: e.nom + ' (copie)'
    };
    this.equipements.push(newEquipement);
    localStorage.setItem('equipements', JSON.stringify(this.equipements));
    this.filterEquipements();
    this.showSuccess('Équipement dupliqué !');
  }
  viewDetails(e: Equipement) {
    this.selectedEquipement = e;
    this.showDetailsModal = true;
  }
  confirmDelete(e: Equipement) {
    this.equipementToDelete = e;
    this.showDeleteModal = true;
  }
  deleteEquipement() {
    if (this.equipementToDelete) {
      this.equipements = this.equipements.filter(e => e.id !== this.equipementToDelete?.id);
      localStorage.setItem('equipements', JSON.stringify(this.equipements));
      this.filterEquipements();
      this.showDeleteModal = false;
      this.equipementToDelete = null;
      this.showSuccess('Équipement supprimé !');
    }
  }
  cancelForm() {
    this.currentEquipement = {
      code: 'EQ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      type: 'machine',
      marque: '',
      modele: '',
      numero_serie: '',
      date_acquisition: new Date().toISOString().split('T')[0],
      date_mise_en_service: new Date().toISOString().split('T')[0],
      fournisseur: '',
      prix_achat: 0,
      duree_vie_ans: 10,
      garantie_mois: 12,
      date_fin_garantie: '',
      localisation: '',
      service_responsable: '',
      responsable: '',
      caracteristiques: '',
      puissance: '',
      capacite: '',
      dimensions: '',
      poids: 0,
      consommation: '',
      etat: 'operationnel',
      disponibilite: 'disponible',
      date_derniere_maintenance: new Date().toISOString().split('T')[0],
      date_prochaine_maintenance: '',
      frequence_maintenance_jours: 30,
      notes: '',
      document_tech: '',
      photo: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterEquipements() {
    let filtered = this.equipements;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom?.toLowerCase().includes(term) ||
        e.code?.toLowerCase().includes(term) ||
        e.marque?.toLowerCase().includes(term) ||
        e.numero_serie?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(e => e.type === this.typeFilter);
    }
    if (this.etatFilter) {
      filtered = filtered.filter(e => e.etat === this.etatFilter);
    }
    this.filteredEquipements = filtered;
  }
  getEtatLabel(etat: string): string {
    const labels: any = { 
      operationnel: 'Opérationnel', 
      maintenance: 'En maintenance', 
      panne: 'En panne', 
      hors_service: 'Hors service' 
    };
    return labels[etat] || etat;
  }
  getDispoLabel(dispo: string): string {
    const labels: any = { disponible: 'Disponible', occupe: 'Occupé', reserve: 'Réservé' };
    return labels[dispo] || dispo;
  }
  isMaintenanceDue(e: Equipement): boolean {
    if (!e.date_prochaine_maintenance) return false;
    const today = new Date();
    const prochaine = new Date(e.date_prochaine_maintenance);
    const diffTime = prochaine.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }
  getJoursAvantMaintenance(e: Equipement): number {
    if (!e.date_prochaine_maintenance) return 0;
    const today = new Date();
    const prochaine = new Date(e.date_prochaine_maintenance);
    const diffTime = prochaine.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
