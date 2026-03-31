import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface InterventionMaintenance {
  id?: number;
  reference: string;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  type: 'preventive' | 'corrective' | 'urgence';
  date_debut: string;
  date_fin?: string;
  description: string;
  cout: number;
  kilometrage: number;
  atelier: string;
  technicien?: string;
  pieces_changees?: string;
  prochaine_maintenance?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  notes?: string;
  created_at: string;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="maintenance-container">
      <div class="header">
        <div>
          <h1>🔧 Maintenance véhicules</h1>
          <p class="subtitle">{{ maintenances.length }} intervention(s) • {{ getMaintenancesEnCours() }} en cours</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="maintenances.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="maintenances.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle intervention</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="maintenances.length > 0">
        <div class="kpi-card total"><div class="kpi-icon">🔧</div><div class="kpi-content"><span class="kpi-value">{{ maintenances.length }}</span><span class="kpi-label">Interventions</span></div></div>
        <div class="kpi-card en-cours"><div class="kpi-icon">⚙️</div><div class="kpi-content"><span class="kpi-value">{{ getMaintenancesEnCours() }}</span><span class="kpi-label">En cours</span></div></div>
        <div class="kpi-card cout"><div class="kpi-icon">💰</div><div class="kpi-content"><span class="kpi-value">{{ getCoutTotal() | number }} FCFA</span><span class="kpi-label">Coût total</span></div></div>
        <div class="kpi-card preventive"><div class="kpi-icon">✅</div><div class="kpi-content"><span class="kpi-value">{{ getMaintenancesPreventives() }}</span><span class="kpi-label">Préventives</span></div></div>
      </div>

      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} intervention</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveMaintenance()">
              <div class="form-row">
                <div class="form-group"><label>Référence</label><input type="text" [(ngModel)]="currentMaintenance.reference" name="reference" readonly class="readonly"></div>
                <div class="form-group"><label>Véhicule *</label><select [(ngModel)]="currentMaintenance.vehicule_id" name="vehicule_id" required (change)="onVehiculeChange()"><option [value]="null">Sélectionner</option><option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }}</option></select></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Type</label><select [(ngModel)]="currentMaintenance.type" name="type"><option value="preventive">🛡️ Préventive</option><option value="corrective">🔧 Corrective</option><option value="urgence">⚠️ Urgence</option></select></div>
                <div class="form-group"><label>Statut</label><select [(ngModel)]="currentMaintenance.statut" name="statut"><option value="planifiee">📅 Planifiée</option><option value="en_cours">⚙️ En cours</option><option value="terminee">✅ Terminée</option><option value="annulee">❌ Annulée</option></select></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Date début *</label><input type="datetime-local" [(ngModel)]="currentMaintenance.date_debut" name="date_debut" required></div>
                <div class="form-group"><label>Date fin</label><input type="datetime-local" [(ngModel)]="currentMaintenance.date_fin" name="date_fin"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Kilométrage</label><input type="number" [(ngModel)]="currentMaintenance.kilometrage" name="kilometrage" min="0"></div>
                <div class="form-group"><label>Coût (FCFA)</label><input type="number" [(ngModel)]="currentMaintenance.cout" name="cout" min="0"></div>
              </div>
              <div class="form-group"><label>Description *</label><textarea [(ngModel)]="currentMaintenance.description" name="description" rows="2" required></textarea></div>
              <div class="form-row">
                <div class="form-group"><label>Atelier</label><input type="text" [(ngModel)]="currentMaintenance.atelier" name="atelier"></div>
                <div class="form-group"><label>Technicien</label><input type="text" [(ngModel)]="currentMaintenance.technicien" name="technicien"></div>
              </div>
              <div class="form-group"><label>Pièces changées</label><textarea [(ngModel)]="currentMaintenance.pieces_changees" name="pieces_changees" rows="2"></textarea></div>
              <div class="form-group"><label>Notes</label><textarea [(ngModel)]="currentMaintenance.notes" name="notes" rows="2"></textarea></div>
              <div class="modal-actions"><button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button><button type="submit" class="btn-primary">💾 Enregistrer</button></div>
            </form>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="maintenances.length > 0">
        <div class="search-wrapper"><span class="search-icon">🔍</span><input [(ngModel)]="searchTerm" (ngModelChange)="filterMaintenances()" placeholder="Rechercher..." class="search-input"></div>
        <div class="filter-group"><select [(ngModel)]="typeFilter" (ngModelChange)="filterMaintenances()" class="filter-select"><option value="">Tous types</option><option value="preventive">🛡️ Préventive</option><option value="corrective">🔧 Corrective</option><option value="urgence">⚠️ Urgence</option></select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterMaintenances()" class="filter-select"><option value="">Tous statuts</option><option value="planifiee">📅 Planifiée</option><option value="en_cours">⚙️ En cours</option><option value="terminee">✅ Terminée</option></select></div>
      </div>

      <div class="maintenances-section" *ngIf="maintenances.length > 0; else emptyState">
        <div class="section-header"><h2>📋 Historique des interventions</h2><div class="header-stats"><span class="stat-badge total">{{ maintenances.length }} interventions</span><span class="stat-badge cout">{{ getCoutTotal() | number }} FCFA</span></div></div>
        <div class="maintenances-grid">
          <div class="maintenance-card" *ngFor="let m of filteredMaintenances" [class]="m.statut">
            <div class="card-header"><div class="header-left"><div class="maintenance-icon">{{ getTypeIcon(m.type) }}</div><div class="maintenance-info"><div class="maintenance-ref">{{ m.reference }}</div><div class="maintenance-vehicule">🚛 {{ m.vehicule_immatriculation }}</div></div></div><div class="header-right"><span class="statut-badge" [class]="m.statut">{{ getStatutLabel(m.statut) }}</span></div></div>
            <div class="card-body"><div class="info-row"><span class="info-label">📅 Début:</span><span class="info-value">{{ m.date_debut | date:'dd/MM/yyyy HH:mm' }}</span></div><div class="info-row" *ngIf="m.date_fin"><span class="info-label">📅 Fin:</span><span class="info-value">{{ m.date_fin | date:'dd/MM/yyyy HH:mm' }}</span></div><div class="info-row"><span class="info-label">💰 Coût:</span><span class="info-value">{{ m.cout | number }} FCFA</span></div><div class="info-row"><span class="info-label">🔧 Type:</span><span class="info-value">{{ getTypeLabel(m.type) }}</span></div><div class="info-row"><span class="info-label">📝 Description:</span><span class="info-value">{{ m.description | slice:0:60 }}{{ m.description.length > 60 ? '...' : '' }}</span></div></div>
            <div class="card-footer"><div class="footer-actions"><button class="action-icon" (click)="viewDetails(m)">👁️</button><button class="action-icon" (click)="editMaintenance(m)" *ngIf="m.statut !== 'terminee'">✏️</button><button class="action-icon" (click)="startMaintenance(m)" *ngIf="m.statut === 'planifiee'">▶️</button><button class="action-icon" (click)="completeMaintenance(m)" *ngIf="m.statut === 'en_cours'">✅</button><button class="action-icon delete" (click)="confirmDelete(m)" *ngIf="m.statut !== 'terminee'">🗑️</button></div></div>
          </div>
        </div>
      </div>

      <ng-template #emptyState><div class="empty-state"><div class="empty-icon">🔧</div><h2>Aucune intervention</h2><p>Planifiez votre première maintenance</p><button class="btn-primary" (click)="openForm()">+ Nouvelle intervention</button></div></ng-template>

      <div class="modal-overlay" *ngIf="showDetailsModal"><div class="modal-container large"><div class="modal-header"><h3>Intervention {{ selectedMaintenance?.reference }}</h3><button class="modal-close" (click)="showDetailsModal = false">✕</button></div><div class="modal-body" *ngIf="selectedMaintenance"><div class="details-grid"><div class="detail-section"><h4>📋 Informations</h4><p><strong>Référence:</strong> {{ selectedMaintenance.reference }}</p><p><strong>Type:</strong> {{ getTypeLabel(selectedMaintenance.type) }}</p><p><strong>Statut:</strong> {{ getStatutLabel(selectedMaintenance.statut) }}</p><p><strong>Description:</strong> {{ selectedMaintenance.description }}</p></div><div class="detail-section"><h4>🚛 Véhicule</h4><p><strong>Immatriculation:</strong> {{ selectedMaintenance.vehicule_immatriculation }}</p><p><strong>Kilométrage:</strong> {{ selectedMaintenance.kilometrage | number }} km</p></div><div class="detail-section"><h4>📅 Dates</h4><p><strong>Début:</strong> {{ selectedMaintenance.date_debut | date:'dd/MM/yyyy HH:mm' }}</p><p><strong>Fin:</strong> {{ selectedMaintenance.date_fin | date:'dd/MM/yyyy HH:mm' }}</p></div><div class="detail-section"><h4>💰 Coût</h4><p><strong>Total:</strong> {{ selectedMaintenance.cout | number }} FCFA</p></div><div class="detail-section"><h4>🔧 Atelier</h4><p><strong>Atelier:</strong> {{ selectedMaintenance.atelier || '-' }}</p><p><strong>Technicien:</strong> {{ selectedMaintenance.technicien || '-' }}</p></div><div class="detail-section full-width" *ngIf="selectedMaintenance.pieces_changees"><h4>🔩 Pièces changées</h4><p>{{ selectedMaintenance.pieces_changees }}</p></div></div></div></div></div>

      <div class="modal-overlay" *ngIf="showDeleteModal"><div class="modal-container small"><div class="modal-header"><h3>🗑️ Confirmer la suppression</h3><button class="modal-close" (click)="showDeleteModal = false">✕</button></div><div class="modal-body"><p>Supprimer l'intervention <strong>{{ maintenanceToDelete?.reference }}</strong> ?</p><div class="modal-actions"><button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button><button class="btn-danger" (click)="deleteMaintenance()">🗑️ Supprimer</button></div></div></div></div>
    </div>
  `,
  styles: [`
    .maintenance-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.en-cours .kpi-value { color: #F59E0B; }
    .kpi-card.cout .kpi-value { color: #10B981; }
    .kpi-card.preventive .kpi-value { color: #3B82F6; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .readonly { background: #F9FAFB; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .maintenances-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.cout { background: #DCFCE7; color: #16A34A; }
    
    .maintenances-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .maintenance-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .maintenance-card.planifiee { border-left-color: #F59E0B; }
    .maintenance-card.en_cours { border-left-color: #3B82F6; }
    .maintenance-card.terminee { border-left-color: #10B981; }
    .maintenance-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .maintenance-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .maintenance-ref { font-weight: 600; color: #1F2937; font-family: monospace; font-size: 13px; }
    .maintenance-vehicule { font-size: 13px; color: #4B5563; margin-top: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.planifiee { background: #FEF3C7; color: #D97706; }
    .statut-badge.en_cours { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.terminee { background: #DCFCE7; color: #16A34A; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .info-label { font-weight: 500; color: #6B7280; width: 90px; }
    .info-value { color: #1F2937; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .maintenances-grid { grid-template-columns: 1fr; }
      .info-row { flex-direction: column; gap: 4px; }
      .info-label { width: auto; }
    }
  `]
})
export class Maintenance implements OnInit {
  maintenances: InterventionMaintenance[] = [];
  filteredMaintenances: InterventionMaintenance[] = [];
  selectedMaintenance: InterventionMaintenance | null = null;
  vehicules: any[] = [];
  
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  showDeleteModal = false;
  maintenanceToDelete: InterventionMaintenance | null = null;
  successMessage = '';
  
  currentMaintenance: Partial<InterventionMaintenance> = {
    reference: '',
    type: 'preventive',
    statut: 'planifiee',
    date_debut: new Date().toISOString().slice(0, 16),
    description: '',
    cout: 0,
    kilometrage: 0,
    atelier: '',
    created_at: new Date().toISOString()
  };
  
  ngOnInit() {
    this.loadVehicules();
    this.loadMaintenances();
  }
  
  openForm() {
    this.currentMaintenance = {
      reference: this.generateReference(),
      type: 'preventive',
      statut: 'planifiee',
      date_debut: new Date().toISOString().slice(0, 16),
      description: '',
      cout: 0,
      kilometrage: 0,
      atelier: '',
      created_at: new Date().toISOString()
    };
    this.editMode = false;
    this.showForm = true;
  }
  
  generateReference(): string {
    const count = this.maintenances.length + 1;
    return `MT-${String(count).padStart(4, '0')}`;
  }
  
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  
  loadMaintenances() {
    const saved = localStorage.getItem('maintenances');
    this.maintenances = saved ? JSON.parse(saved) : [];
    this.filteredMaintenances = [...this.maintenances];
  }
  
  saveMaintenances() {
    localStorage.setItem('maintenances', JSON.stringify(this.maintenances));
  }
  
  onVehiculeChange() {
    const v = this.vehicules.find(v => v.id === this.currentMaintenance.vehicule_id);
    if (v) {
      this.currentMaintenance.vehicule_immatriculation = v.immatriculation;
    }
  }
  
  saveMaintenance() {
    if (this.editMode && this.currentMaintenance.id) {
      const index = this.maintenances.findIndex(m => m.id === this.currentMaintenance.id);
      if (index !== -1) {
        this.maintenances[index] = { ...this.currentMaintenance } as InterventionMaintenance;
        this.showSuccess('Intervention modifiée');
      }
    } else {
      const newMaintenance = { ...this.currentMaintenance, id: Date.now() } as InterventionMaintenance;
      this.maintenances.push(newMaintenance);
      this.showSuccess('Intervention ajoutée');
    }
    this.saveMaintenances();
    this.filterMaintenances();
    this.cancelForm();
  }
  
  editMaintenance(m: InterventionMaintenance) {
    this.currentMaintenance = { ...m };
    this.editMode = true;
    this.showForm = true;
  }
  
  viewDetails(m: InterventionMaintenance) {
    this.selectedMaintenance = m;
    this.showDetailsModal = true;
  }
  
  startMaintenance(m: InterventionMaintenance) {
    m.statut = 'en_cours';
    this.saveMaintenances();
    this.filterMaintenances();
    this.showSuccess('Intervention démarrée');
  }
  
  completeMaintenance(m: InterventionMaintenance) {
    m.statut = 'terminee';
    m.date_fin = new Date().toISOString();
    this.saveMaintenances();
    this.filterMaintenances();
    this.showSuccess('Intervention terminée');
  }
  
  confirmDelete(m: InterventionMaintenance) {
    this.maintenanceToDelete = m;
    this.showDeleteModal = true;
  }
  
  deleteMaintenance() {
    if (this.maintenanceToDelete) {
      this.maintenances = this.maintenances.filter(m => m.id !== this.maintenanceToDelete?.id);
      this.saveMaintenances();
      this.filterMaintenances();
      this.showDeleteModal = false;
      this.maintenanceToDelete = null;
      this.showSuccess('Intervention supprimée');
    }
  }
  
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }
  
  filterMaintenances() {
    let filtered = this.maintenances;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.reference?.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term)
      );
    }
    
    if (this.typeFilter) {
      filtered = filtered.filter(m => m.type === this.typeFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(m => m.statut === this.statutFilter);
    }
    
    this.filteredMaintenances = filtered;
  }
  
  getMaintenancesEnCours(): number {
    return this.maintenances.filter(m => m.statut === 'en_cours').length;
  }
  
  getCoutTotal(): number {
    return this.maintenances.reduce((sum, m) => sum + (m.cout || 0), 0);
  }
  
  getMaintenancesPreventives(): number {
    return this.maintenances.filter(m => m.type === 'preventive').length;
  }
  
  getTypeIcon(type: string): string {
    const icons: any = { preventive: '🛡️', corrective: '🔧', urgence: '⚠️' };
    return icons[type] || '🔧';
  }
  
  getTypeLabel(type: string): string {
    const labels: any = { preventive: 'Préventive', corrective: 'Corrective', urgence: 'Urgence' };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { planifiee: '📅 Planifiée', en_cours: '⚙️ En cours', terminee: '✅ Terminée', annulee: '❌ Annulée' };
    return labels[statut] || statut;
  }
  
    exportToExcel() {
    if (!this.filteredMaintenances || this.filteredMaintenances.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMaintenances[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredMaintenances.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess("Export Excel effectué");
  }
  
    exportToPDF() {
    if (!this.filteredMaintenances || this.filteredMaintenances.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredMaintenances[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredMaintenances.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}