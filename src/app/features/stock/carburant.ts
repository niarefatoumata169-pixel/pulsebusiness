import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PleinCarburant {
  id?: number;
  date: string;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  type_carburant: 'essence' | 'diesel' | 'gpl' | 'electrique';
  quantite_litres: number;
  prix_unitaire: number;
  montant_total: number;
  kilometrage: number;
  consommation_calculee?: number;
  station?: string;
  numero_facture?: string;
  conducteur_id?: number;
  conducteur_nom?: string;
  plein_complet: boolean;
  notes?: string;
}

@Component({
  selector: 'app-carburant',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="carburant-container">
      <div class="header">
        <div>
          <h1>Gestion carburant</h1>
          <p class="subtitle">{{ pleins.length }} plein(s) • Total: {{ totalLitres | number }} L • {{ totalMontant | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau plein</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} plein</h3>
        <form (ngSubmit)="savePlein()" #pleinForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentPlein.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Véhicule *</label>
              <select [(ngModel)]="currentPlein.vehicule_id" name="vehicule_id" required (change)="onVehiculeChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }} ({{ v.kilometrage }} km)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type carburant</label>
              <select [(ngModel)]="currentPlein.type_carburant" name="type_carburant">
                <option value="diesel">Diesel</option>
                <option value="essence">Essence</option>
                <option value="gpl">GPL</option>
                <option value="electrique">Électrique</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantité (litres) *</label>
              <input type="number" [(ngModel)]="currentPlein.quantite_litres" name="quantite_litres" required min="0" step="0.01" (input)="calculerMontant()">
            </div>
            <div class="form-group">
              <label>Prix unitaire (FCFA/L) *</label>
              <input type="number" [(ngModel)]="currentPlein.prix_unitaire" name="prix_unitaire" required min="0" (input)="calculerMontant()">
            </div>
            <div class="form-group">
              <label>Montant total</label>
              <input type="number" [(ngModel)]="currentPlein.montant_total" name="montant_total" readonly>
            </div>
            <div class="form-group">
              <label>Kilométrage *</label>
              <input type="number" [(ngModel)]="currentPlein.kilometrage" name="kilometrage" required min="0">
            </div>
            <div class="form-group">
              <label>Station</label>
              <input type="text" [(ngModel)]="currentPlein.station" name="station">
            </div>
            <div class="form-group">
              <label>N° facture</label>
              <input type="text" [(ngModel)]="currentPlein.numero_facture" name="numero_facture">
            </div>
            <div class="form-group">
              <label>Conducteur</label>
              <select [(ngModel)]="currentPlein.conducteur_id" name="conducteur_id" (change)="onConducteurChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let c of chauffeurs" [value]="c.id">{{ c.nom }} {{ c.prenom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Plein complet</label>
              <input type="checkbox" [(ngModel)]="currentPlein.plein_complet" name="plein_complet">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentPlein.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="pleinForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="stats-mini" *ngIf="pleins.length > 0">
        <div class="stat-item">
          <span class="stat-label">Moyenne générale:</span>
          <span class="stat-value">{{ moyenneConsommation | number:'1.1-1' }} L/100km</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Coût moyen au litre:</span>
          <span class="stat-value">{{ prixMoyen | number:'1.0-0' }} FCFA</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total dépensé:</span>
          <span class="stat-value">{{ totalMontant | number }} FCFA</span>
        </div>
      </div>
      <div class="filters-bar" *ngIf="pleins.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPleins()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="vehiculeFilter" (ngModelChange)="filterPleins()" class="filter-select">
          <option value="">Tous véhicules</option>
          <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }}</option>
        </select>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterPleins()" class="filter-select">
          <option value="">Tous types</option>
          <option value="diesel">Diesel</option>
          <option value="essence">Essence</option>
        </select>
      </div>
      <div class="table-container" *ngIf="pleins.length > 0; else emptyState">
        <table class="pleins-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Véhicule</th>
              <th>Quantité (L)</th>
              <th>Prix/L</th>
              <th>Montant</th>
              <th>Km</th>
              <th>Conso</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPleins">
              <td>{{ p.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ p.vehicule_immatriculation }}</td>
              <td>{{ p.quantite_litres }} L</td>
              <td>{{ p.prix_unitaire | number }} FCFA</td>
              <td>{{ p.montant_total | number }} FCFA</td>
              <td>{{ p.kilometrage | number }}</td>
              <td>{{ p.consommation_calculee | number:'1.1-1' }}</td>
              <td class="actions">
                <button class="btn-icon" (click)="editPlein(p)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(p)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">⛽</div>
          <h2>Aucun relevé de carburant</h2>
          <p>Enregistrez votre premier plein</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau plein</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer ce plein ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deletePlein()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carburant-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    input[type="checkbox"] { width: 20px; height: 20px; margin-top: 5px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .stats-mini { display: flex; gap: 30px; margin-bottom: 20px; padding: 15px; background: white; border-radius: 12px; border: 1px solid #FCE7F3; }
    .stat-item { display: flex; align-items: center; gap: 8px; }
    .stat-label { color: #6B7280; }
    .stat-value { font-weight: 600; color: #EC4899; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .pleins-table { width: 100%; border-collapse: collapse; }
    .pleins-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .pleins-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Carburant implements OnInit {
  vehicules: any[] = [];
  chauffeurs: any[] = [];
  pleins: PleinCarburant[] = [];
  filteredPleins: PleinCarburant[] = [];
  currentPlein: any = {
    date: new Date().toISOString().split('T')[0],
    vehicule_id: '',
    type_carburant: 'diesel',
    quantite_litres: 0,
    prix_unitaire: 0,
    montant_total: 0,
    kilometrage: 0,
    station: '',
    numero_facture: '',
    conducteur_id: '',
    plein_complet: true,
    notes: ''
  };
  searchTerm = '';
  vehiculeFilter = '';
  typeFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  pleinToDelete: PleinCarburant | null = null;
  successMessage = '';
  totalLitres = 0;
  totalMontant = 0;
  moyenneConsommation = 0;
  prixMoyen = 0;
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
    this.loadPleins();
  }
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
  }
  loadPleins() {
    const saved = localStorage.getItem('pleins_carburant');
    this.pleins = saved ? JSON.parse(saved) : [];
    this.filteredPleins = [...this.pleins];
    this.calculerStats();
  }
  onVehiculeChange() {
    const v = this.vehicules.find(v => v.id === this.currentPlein.vehicule_id);
    if (v) {
      this.currentPlein.vehicule_immatriculation = v.immatriculation;
      this.currentPlein.kilometrage = v.kilometrage;
    }
  }
  onConducteurChange() {
    const c = this.chauffeurs.find(c => c.id === this.currentPlein.conducteur_id);
    if (c) this.currentPlein.conducteur_nom = c.nom + ' ' + c.prenom;
  }
  calculerMontant() {
    this.currentPlein.montant_total = this.currentPlein.quantite_litres * this.currentPlein.prix_unitaire;
  }
  savePlein() {
    const v = this.vehicules.find(v => v.id === this.currentPlein.vehicule_id);
    const c = this.chauffeurs.find(c => c.id === this.currentPlein.conducteur_id);
    if (this.editMode) {
      const index = this.pleins.findIndex(p => p.id === this.currentPlein.id);
      if (index !== -1) {
        this.pleins[index] = { 
          ...this.currentPlein, 
          vehicule_immatriculation: v?.immatriculation,
          conducteur_nom: c ? c.nom + ' ' + c.prenom : ''
        };
        this.showSuccess('Plein modifié !');
      }
    } else {
      const newPlein = { 
        ...this.currentPlein, 
        id: Date.now(),
        vehicule_immatriculation: v?.immatriculation,
        conducteur_nom: c ? c.nom + ' ' + c.prenom : ''
      };
      this.pleins.push(newPlein);
      this.updateVehiculeKm(v);
      this.showSuccess('Plein enregistré !');
    }
    localStorage.setItem('pleins_carburant', JSON.stringify(this.pleins));
    this.calculerConsoPrecedente();
    this.calculerStats();
    this.filterPleins();
    this.cancelForm();
  }
  updateVehiculeKm(v: any) {
    if (v && this.currentPlein.kilometrage > v.kilometrage) {
      v.kilometrage = this.currentPlein.kilometrage;
      localStorage.setItem('vehicules', JSON.stringify(this.vehicules));
    }
  }
  calculerConsoPrecedente() {
    const pleinsParVehicule = this.pleins.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < pleinsParVehicule.length; i++) {
      const plein = pleinsParVehicule[i];
      const precedent = pleinsParVehicule[i - 1];
      if (plein.vehicule_id === precedent.vehicule_id && precedent.plein_complet) {
        const distance = plein.kilometrage - precedent.kilometrage;
        if (distance > 0) {
          plein.consommation_calculee = (precedent.quantite_litres / distance) * 100;
        }
      }
    }
  }
  editPlein(p: PleinCarburant) {
    this.currentPlein = { ...p };
    this.editMode = true;
    this.showForm = true;
  }
  confirmDelete(p: PleinCarburant) {
    this.pleinToDelete = p;
    this.showDeleteModal = true;
  }
  deletePlein() {
    if (this.pleinToDelete) {
      this.pleins = this.pleins.filter(p => p.id !== this.pleinToDelete?.id);
      localStorage.setItem('pleins_carburant', JSON.stringify(this.pleins));
      this.calculerStats();
      this.filterPleins();
      this.showDeleteModal = false;
      this.pleinToDelete = null;
      this.showSuccess('Plein supprimé !');
    }
  }
  cancelForm() {
    this.currentPlein = {
      date: new Date().toISOString().split('T')[0],
      vehicule_id: '',
      type_carburant: 'diesel',
      quantite_litres: 0,
      prix_unitaire: 0,
      montant_total: 0,
      kilometrage: 0,
      station: '',
      numero_facture: '',
      conducteur_id: '',
      plein_complet: true,
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  filterPleins() {
    let filtered = this.pleins;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.vehicule_immatriculation?.toLowerCase().includes(term) ||
        p.station?.toLowerCase().includes(term) ||
        p.numero_facture?.toLowerCase().includes(term)
      );
    }
    if (this.vehiculeFilter) {
      filtered = filtered.filter(p => p.vehicule_id === Number(this.vehiculeFilter));
    }
    if (this.typeFilter) {
      filtered = filtered.filter(p => p.type_carburant === this.typeFilter);
    }
    this.filteredPleins = filtered;
  }
  calculerStats() {
    this.totalLitres = this.pleins.reduce((s, p) => s + p.quantite_litres, 0);
    this.totalMontant = this.pleins.reduce((s, p) => s + p.montant_total, 0);
    const consoValides = this.pleins.filter(p => p.consommation_calculee).length;
    this.moyenneConsommation = this.pleins.reduce((s, p) => s + (p.consommation_calculee || 0), 0) / consoValides || 0;
    this.prixMoyen = this.totalLitres > 0 ? this.totalMontant / this.totalLitres : 0;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
