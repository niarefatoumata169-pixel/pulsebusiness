import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Contrat {
  id?: number;
  numero: string;
  client_id?: number;
  client_nom?: string;
  type: 'vente' | 'service' | 'location' | 'maintenance' | 'prestation';
  date_debut: string;
  date_fin: string;
  montant: number;
  periodicite: 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
  statut: 'actif' | 'expire' | 'resilie' | 'en_negociation';
  renouvelable: boolean;
  conditions: string;
  notes?: string;
}

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="contrats-container">
      <div class="header">
        <div>
          <h1>Contrats</h1>
          <p class="subtitle">{{ contrats.length }} contrat(s) • Valeur totale: {{ valeurTotale | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau contrat</button>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} contrat</h3>
        <form (ngSubmit)="saveContrat()" #contratForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Client *</label>
              <select [(ngModel)]="newContrat.client_id" name="client_id" required (change)="onClientChange()">
                <option value="">Sélectionner un client</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.raison_sociale || c.nom + ' ' + (c.prenom || '') }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Type de contrat</label>
              <select [(ngModel)]="newContrat.type" name="type" required>
                <option value="vente">Vente</option>
                <option value="service">Service</option>
                <option value="location">Location</option>
                <option value="maintenance">Maintenance</option>
                <option value="prestation">Prestation</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Date de début *</label>
              <input type="date" [(ngModel)]="newContrat.date_debut" name="date_debut" required>
            </div>
            
            <div class="form-group">
              <label>Date de fin *</label>
              <input type="date" [(ngModel)]="newContrat.date_fin" name="date_fin" required>
            </div>
            
            <div class="form-group">
              <label>Montant (FCFA) *</label>
              <input type="number" [(ngModel)]="newContrat.montant" name="montant" required>
            </div>
            
            <div class="form-group">
              <label>Périodicité</label>
              <select [(ngModel)]="newContrat.periodicite" name="periodicite" required>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
                <option value="ponctuel">Ponctuel</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="newContrat.statut" name="statut" required>
                <option value="actif">Actif</option>
                <option value="expire">Expiré</option>
                <option value="resilie">Résilié</option>
                <option value="en_negociation">En négociation</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Renouvelable</label>
              <input type="checkbox" [(ngModel)]="newContrat.renouvelable" name="renouvelable">
            </div>
            
            <div class="form-group full-width">
              <label>Conditions particulières</label>
              <textarea [(ngModel)]="newContrat.conditions" name="conditions" rows="4" placeholder="Décrivez les conditions du contrat..."></textarea>
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newContrat.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- Filtres -->
      <div class="filters-bar" *ngIf="contrats.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterContrats()" placeholder="Rechercher un contrat...">
        </div>
        
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterContrats()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="expire">Expiré</option>
          <option value="resilie">Résilié</option>
          <option value="en_negociation">En négociation</option>
        </select>
        
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterContrats()" class="filter-select">
          <option value="">Tous types</option>
          <option value="vente">Vente</option>
          <option value="service">Service</option>
          <option value="location">Location</option>
          <option value="maintenance">Maintenance</option>
          <option value="prestation">Prestation</option>
        </select>
      </div>
      
      <!-- Liste -->
      <div class="contrats-list" *ngIf="contrats.length > 0; else emptyState">
        <div class="contrat-card" *ngFor="let c of filteredContrats" [class.alerte]="isExpirationProche(c)">
          <div class="contrat-header">
            <span class="contrat-numero">{{ c.numero }}</span>
            <span class="contrat-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
          </div>
          <div class="contrat-body">
            <p><span class="label">Client:</span> {{ c.client_nom || '-' }}</p>
            <p><span class="label">Type:</span> {{ getTypeLabel(c.type) }}</p>
            <p><span class="label">Période:</span> {{ c.date_debut | date }} - {{ c.date_fin | date }}</p>
            <p><span class="label">Montant:</span> {{ c.montant | number }} FCFA</p>
            <p><span class="label">Périodicité:</span> {{ getPeriodiciteLabel(c.periodicite) }}</p>
            <p><span class="label">Renouvelable:</span> {{ c.renouvelable ? 'Oui' : 'Non' }}</p>
            <div class="expiration-alert" *ngIf="isExpirationProche(c)">
              ⚠️ Expire dans {{ getJoursAvantExpiration(c) }} jours
            </div>
          </div>
          <div class="contrat-footer">
            <button class="btn-icon" (click)="viewDetails(c)">👁️</button>
            <button class="btn-icon" (click)="editContrat(c)">✏️</button>
            <button class="btn-icon" (click)="duplicateContrat(c)">📋</button>
            <button class="btn-icon delete" (click)="deleteContrat(c)">🗑️</button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h2>Aucun contrat</h2>
          <p>Créez votre premier contrat</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau contrat</button>
        </div>
      </ng-template>
      
      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Contrat {{ selectedContrat?.numero }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedContrat">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>N° contrat:</strong> {{ selectedContrat.numero }}</p>
                <p><strong>Client:</strong> {{ selectedContrat.client_nom }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedContrat.type) }}</p>
                <p><strong>Statut:</strong> <span class="badge" [class]="selectedContrat.statut">{{ getStatutLabel(selectedContrat.statut) }}</span></p>
              </div>
              
              <div class="detail-section">
                <h4>Période</h4>
                <p><strong>Date début:</strong> {{ selectedContrat.date_debut | date }}</p>
                <p><strong>Date fin:</strong> {{ selectedContrat.date_fin | date }}</p>
                <p><strong>Durée:</strong> {{ getDuree(selectedContrat) }}</p>
                <p><strong>Renouvelable:</strong> {{ selectedContrat.renouvelable ? 'Oui' : 'Non' }}</p>
              </div>
              
              <div class="detail-section">
                <h4>Montant</h4>
                <p><strong>Montant:</strong> {{ selectedContrat.montant | number }} FCFA</p>
                <p><strong>Périodicité:</strong> {{ getPeriodiciteLabel(selectedContrat.periodicite) }}</p>
                <p><strong>Valeur totale:</strong> {{ getValeurTotale(selectedContrat) | number }} FCFA</p>
              </div>
              
              <div class="detail-section full-width">
                <h4>Conditions particulières</h4>
                <p>{{ selectedContrat.conditions || 'Aucune condition spécifique' }}</p>
              </div>
              
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedContrat.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contrats-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .contrats-list { display: grid; gap: 15px; }
    .contrat-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .contrat-card.alerte { border-left: 4px solid #F59E0B; }
    .contrat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .contrat-numero { font-weight: 600; color: #1F2937; }
    .contrat-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .contrat-badge.actif { background: #10B981; color: white; }
    .contrat-badge.expire { background: #6B7280; color: white; }
    .contrat-badge.resilie { background: #EF4444; color: white; }
    .contrat-badge.en_negociation { background: #F59E0B; color: white; }
    .contrat-body p { margin: 5px 0; color: #6B7280; }
    .label { color: #4B5563; width: 100px; display: inline-block; }
    .expiration-alert { margin-top: 10px; padding: 8px; background: #FEF3C7; border-radius: 4px; color: #92400E; font-size: 12px; }
    .contrat-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
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
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
  `]
})
export class Contrats implements OnInit {
  clients: any[] = [];
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  selectedContrat: Contrat | null = null;
  
  newContrat: Partial<Contrat> = {
    client_id: undefined,
    type: 'service',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    montant: 0,
    periodicite: 'mensuel',
    statut: 'en_negociation',
    renouvelable: false,
    conditions: '',
    notes: ''
  };
  
  searchTerm = '';
  statutFilter = '';
  typeFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  successMessage = '';
  valeurTotale = 0;
  
  ngOnInit() {
    this.loadClients();
    this.loadContrats();
  }
  
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  
  loadContrats() {
    const saved = localStorage.getItem('contrats');
    this.contrats = saved ? JSON.parse(saved) : [];
    this.filteredContrats = [...this.contrats];
    this.calculerValeurTotale();
  }
  
  onClientChange() {
    const client = this.clients.find(c => c.id === Number(this.newContrat.client_id));
    if (client) {
      this.newContrat.client_nom = client.raison_sociale || client.nom + ' ' + (client.prenom || '');
    }
  }
  
  saveContrat() {
    if (this.editMode && this.newContrat.id) {
      const index = this.contrats.findIndex(c => c.id === this.newContrat.id);
      if (index !== -1) {
        this.contrats[index] = this.newContrat as Contrat;
        this.showMessage('Contrat modifié !');
      }
    } else {
      const newContrat: Contrat = {
        id: Date.now(),
        numero: 'CT-' + (this.contrats.length + 1).toString().padStart(4, '0'),
        client_id: this.newContrat.client_id,
        client_nom: this.newContrat.client_nom,
        type: this.newContrat.type as 'vente' | 'service' | 'location' | 'maintenance' | 'prestation' || 'service',
        date_debut: this.newContrat.date_debut || new Date().toISOString().split('T')[0],
        date_fin: this.newContrat.date_fin || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        montant: this.newContrat.montant || 0,
        periodicite: this.newContrat.periodicite as 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel' || 'mensuel',
        statut: this.newContrat.statut as 'actif' | 'expire' | 'resilie' | 'en_negociation' || 'en_negociation',
        renouvelable: this.newContrat.renouvelable || false,
        conditions: this.newContrat.conditions || '',
        notes: this.newContrat.notes
      };
      this.contrats.push(newContrat);
      this.showMessage('Contrat créé !');
    }
    
    localStorage.setItem('contrats', JSON.stringify(this.contrats));
    this.filterContrats();
    this.calculerValeurTotale();
    this.cancelForm();
  }
  
  editContrat(c: Contrat) {
    this.newContrat = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateContrat(c: Contrat) {
    const newContrat: Contrat = {
      ...c,
      id: Date.now(),
      numero: c.numero + '-COPY',
      statut: 'en_negociation'
    };
    this.contrats.push(newContrat);
    localStorage.setItem('contrats', JSON.stringify(this.contrats));
    this.filterContrats();
    this.calculerValeurTotale();
    this.showMessage('Contrat dupliqué !');
  }
  
  deleteContrat(c: Contrat) {
    if (confirm('Supprimer ce contrat ?')) {
      this.contrats = this.contrats.filter(cont => cont.id !== c.id);
      localStorage.setItem('contrats', JSON.stringify(this.contrats));
      this.filterContrats();
      this.calculerValeurTotale();
      this.showMessage('Contrat supprimé !');
    }
  }
  
  viewDetails(c: Contrat) {
    this.selectedContrat = c;
    this.showDetailsModal = true;
  }
  
  cancelForm() {
    this.newContrat = {
      client_id: undefined,
      type: 'service',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      montant: 0,
      periodicite: 'mensuel',
      statut: 'en_negociation',
      renouvelable: false,
      conditions: '',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  
  filterContrats() {
    let filtered = this.contrats;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.client_nom?.toLowerCase().includes(term) ||
        c.numero?.toLowerCase().includes(term) ||
        c.conditions?.toLowerCase().includes(term)
      );
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }
    
    this.filteredContrats = filtered;
  }
  
  calculerValeurTotale() {
    this.valeurTotale = this.contrats.reduce((sum, c) => sum + (c.montant || 0), 0);
  }
  
  isExpirationProche(c: Contrat): boolean {
    if (c.statut !== 'actif') return false;
    const today = new Date();
    const fin = new Date(c.date_fin);
    const diffTime = fin.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }
  
  getJoursAvantExpiration(c: Contrat): number {
    const today = new Date();
    const fin = new Date(c.date_fin);
    const diffTime = fin.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  getDuree(c: Contrat): string {
    const debut = new Date(c.date_debut);
    const fin = new Date(c.date_fin);
    const diffTime = fin.getTime() - debut.getTime();
    const diffJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffJours < 30) return diffJours + ' jours';
    if (diffJours < 365) return Math.round(diffJours / 30) + ' mois';
    return (diffJours / 365).toFixed(1) + ' ans';
  }
  
  getValeurTotale(c: Contrat): number {
    const debut = new Date(c.date_debut);
    const fin = new Date(c.date_fin);
    const diffTime = fin.getTime() - debut.getTime();
    const diffMois = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    switch(c.periodicite) {
      case 'mensuel': return c.montant * diffMois;
      case 'trimestriel': return c.montant * Math.ceil(diffMois / 3);
      case 'annuel': return c.montant * Math.ceil(diffMois / 12);
      default: return c.montant;
    }
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { 
      vente: 'Vente', 
      service: 'Service', 
      location: 'Location', 
      maintenance: 'Maintenance', 
      prestation: 'Prestation' 
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      actif: 'Actif', 
      expire: 'Expiré', 
      resilie: 'Résilié', 
      en_negociation: 'En négociation' 
    };
    return labels[statut] || statut;
  }
  
  getPeriodiciteLabel(periodicite: string): string {
    const labels: any = { 
      mensuel: 'Mensuel', 
      trimestriel: 'Trimestriel', 
      annuel: 'Annuel', 
      ponctuel: 'Ponctuel' 
    };
    return labels[periodicite] || periodicite;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}