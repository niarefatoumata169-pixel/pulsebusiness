import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Client {
  id?: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  secteur?: string;
  statut?: 'actif' | 'inactif';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="clients-container">
      <div class="header">
        <div>
          <h1>👥 Clients</h1>
          <p class="subtitle">{{ clients.length }} client(s) • {{ clientsActifs }} actif(s) • {{ villesUniques }} ville(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="clients.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="clients.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau client</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="clients.length > 0">
        <div class="kpi-card total"><div class="kpi-icon">👥</div><div class="kpi-content"><span class="kpi-value">{{ totalClients }}</span><span class="kpi-label">Total clients</span></div></div>
        <div class="kpi-card actifs"><div class="kpi-icon">✅</div><div class="kpi-content"><span class="kpi-value">{{ clientsActifs }}</span><span class="kpi-label">Clients actifs</span></div></div>
        <div class="kpi-card mois"><div class="kpi-icon">📅</div><div class="kpi-content"><span class="kpi-value">{{ clientsMois }}</span><span class="kpi-label">Nouveaux ce mois</span></div></div>
        <div class="kpi-card villes"><div class="kpi-icon">🏙️</div><div class="kpi-content"><span class="kpi-value">{{ villesUniques }}</span><span class="kpi-label">Villes représentées</span></div></div>
      </div>

      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header"><h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} client</h3><button class="modal-close" (click)="cancelForm()">✕</button></div>
          <div class="modal-body">
            <form (ngSubmit)="saveClient()" #clientForm="ngForm">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">📋 Informations</button>
                <button type="button" [class.active]="activeTab === 'adresse'" (click)="activeTab = 'adresse'">📍 Adresse</button>
                <button type="button" [class.active]="activeTab === 'notes'" (click)="activeTab = 'notes'">📝 Notes</button>
              </div>
              <div *ngIf="activeTab === 'info'" class="tab-content">
                <div class="form-row">
                  <div class="form-group"><label>Nom *</label><input type="text" [(ngModel)]="currentClient.nom" name="nom" required></div>
                  <div class="form-group"><label>Prénom</label><input type="text" [(ngModel)]="currentClient.prenom" name="prenom"></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="currentClient.email" name="email" required email></div>
                  <div class="form-group"><label>Téléphone *</label><input type="tel" [(ngModel)]="currentClient.telephone" name="telephone" required></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label>Secteur d'activité</label><input type="text" [(ngModel)]="currentClient.secteur" name="secteur"></div>
                  <div class="form-group"><label>Statut</label><select [(ngModel)]="currentClient.statut"><option value="actif">✅ Actif</option><option value="inactif">⏸️ Inactif</option></select></div>
                </div>
              </div>
              <div *ngIf="activeTab === 'adresse'" class="tab-content">
                <div class="form-group"><label>Adresse</label><textarea [(ngModel)]="currentClient.adresse" rows="2"></textarea></div>
                <div class="form-row"><div class="form-group"><label>Ville</label><input type="text" [(ngModel)]="currentClient.ville"></div><div class="form-group"><label>Code postal</label><input type="text" [(ngModel)]="currentClient.code_postal"></div></div>
                <div class="form-group"><label>Pays</label><input type="text" [(ngModel)]="currentClient.pays" value="Mali"></div>
              </div>
              <div *ngIf="activeTab === 'notes'" class="tab-content"><div class="form-group"><label>Notes</label><textarea [(ngModel)]="currentClient.notes" rows="5"></textarea></div></div>
              <div class="modal-actions"><button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button><button type="submit" class="btn-primary" [disabled]="clientForm.invalid">💾 Enregistrer</button></div>
            </form>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="clients.length > 0">
        <div class="search-wrapper"><span class="search-icon">🔍</span><input [(ngModel)]="searchTerm" (ngModelChange)="filterClients()" placeholder="Rechercher..." class="search-input"></div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterClients()"><option value="">📊 Tous statuts</option><option value="actif">✅ Actif</option><option value="inactif">⏸️ Inactif</option></select>
          <select [(ngModel)]="periodeFilter" (ngModelChange)="filterClients()"><option value="">📅 Toutes périodes</option><option value="today">Aujourd'hui</option><option value="week">Cette semaine</option><option value="month">Ce mois</option><option value="last_month">Mois dernier</option></select>
        </div>
      </div>

      <div class="clients-section" *ngIf="clients.length > 0; else emptyState">
        <div class="section-header"><h2>📋 Liste des clients</h2><div class="header-stats"><span class="stat-badge">{{ paginatedClients.length }} / {{ filteredClients.length }} affiché(s)</span></div></div>
        <div class="clients-grid">
          <div class="client-card" *ngFor="let c of paginatedClients" [class]="c.statut">
            <div class="card-header">
              <div class="header-left"><div class="client-avatar">{{ getInitials(c.nom) }}</div><div class="client-info"><div class="client-nom">{{ c.nom }} {{ c.prenom || '' }}</div><div class="client-email">{{ c.email }}</div><div class="client-tel">{{ c.telephone }}</div></div></div>
              <div class="header-right"><span class="statut-badge" [class]="c.statut">{{ c.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}</span></div>
            </div>
            <div class="card-body">
              <div class="info-row"><span class="info-label">📍 Ville:</span><span class="info-value">{{ c.ville || '-' }}</span></div>
              <div class="info-row"><span class="info-label">🏢 Secteur:</span><span class="info-value">{{ c.secteur || '-' }}</span></div>
              <div class="info-row"><span class="info-label">📅 Créé le:</span><span class="info-value">{{ c.created_at | date:'dd/MM/yyyy' }}</span></div>
            </div>
            <div class="card-footer"><div class="footer-actions"><button class="action-icon" (click)="viewDetails(c)">👁️</button><button class="action-icon" (click)="editClient(c)">✏️</button><button class="action-icon" (click)="duplicateClient(c)">📋</button><button class="action-icon delete" (click)="deleteClient(c)">🗑️</button></div></div>
          </div>
        </div>
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">◀</button>
          <span *ngFor="let page of getPages()"><button class="page-btn" [class.active]="page === currentPage" (click)="changePage(page)">{{ page }}</button></span>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">▶</button>
        </div>
      </div>

      <ng-template #emptyState><div class="empty-state"><div class="empty-icon">👥</div><h2>Aucun client</h2><p>Commencez par ajouter votre premier client</p><button class="btn-primary" (click)="openForm()">+ Nouveau client</button></div></ng-template>

      <div class="modal-overlay" *ngIf="showDetailsModal && selectedClient">
        <div class="modal-container large">
          <div class="modal-header"><h3>Détails du client - {{ selectedClient.nom }} {{ selectedClient.prenom }}</h3><button class="modal-close" (click)="showDetailsModal = false">✕</button></div>
          <div class="modal-body"><div class="details-grid"><div class="detail-section"><h4>📋 Informations générales</h4><p><strong>Nom:</strong> {{ selectedClient.nom }} {{ selectedClient.prenom || '' }}</p><p><strong>Email:</strong> {{ selectedClient.email }}</p><p><strong>Téléphone:</strong> {{ selectedClient.telephone }}</p><p><strong>Secteur:</strong> {{ selectedClient.secteur || '-' }}</p><p><strong>Statut:</strong> {{ selectedClient.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}</p><p><strong>Date création:</strong> {{ selectedClient.created_at | date:'dd/MM/yyyy HH:mm' }}</p></div><div class="detail-section"><h4>📍 Adresse</h4><p>{{ selectedClient.adresse || '-' }}</p><p>{{ selectedClient.code_postal }} {{ selectedClient.ville }}</p><p>{{ selectedClient.pays || 'Mali' }}</p></div><div class="detail-section full-width" *ngIf="selectedClient.notes"><h4>📝 Notes</h4><p>{{ selectedClient.notes }}</p></div></div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clients-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.actifs .kpi-value { color: #10B981; }
    .kpi-card.mois .kpi-value { color: #3B82F6; }
    .kpi-card.villes .kpi-value { color: #F59E0B; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 800px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #F3F4F6; padding-bottom: 10px; flex-wrap: wrap; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; transition: all 0.2s; }
    .tabs button.active { background: #EC4899; color: white; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .btn-secondary { background: white; border: 2px solid #FCE7F3; border-radius: 10px; padding: 10px 20px; cursor: pointer; color: #4B5563; }
    .btn-secondary:hover { background: #F9FAFB; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .clients-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .client-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .client-card.actif { border-left-color: #10B981; }
    .client-card.inactif { border-left-color: #EF4444; opacity: 0.7; }
    .client-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; flex: 1; }
    .client-avatar { font-size: 28px; width: 56px; height: 56px; background: linear-gradient(135deg, #EC4899, #F472B6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 20px; }
    .client-info { flex: 1; }
    .client-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .client-email { font-size: 12px; color: #6B7280; margin-bottom: 2px; word-break: break-all; }
    .client-tel { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .header-right { text-align: right; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #FEE2E2; color: #EF4444; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; flex-wrap: wrap; }
    .info-label { color: #6B7280; min-width: 80px; }
    .info-value { font-weight: 500; color: #1F2937; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 20px; }
    .page-btn { background: white; border: 1px solid #FCE7F3; border-radius: 6px; padding: 8px 12px; cursor: pointer; color: #4B5563; min-width: 40px; }
    .page-btn:hover:not(:disabled) { background: #FDF2F8; border-color: #EC4899; color: #EC4899; }
    .page-btn.active { background: #EC4899; color: white; border-color: #EC4899; }
    .page-btn.disabled, .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .form-row { grid-template-columns: 1fr; gap: 12px; } .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr; } .clients-grid { grid-template-columns: 1fr; } }
  `]
})
export class Clients implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  paginatedClients: Client[] = [];

  searchTerm = '';
  statutFilter = '';
  periodeFilter = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  showForm = false;
  editMode = false;
  showDetailsModal = false;
  selectedClient: Client | null = null;
  currentClient: Client = { nom: '', email: '', telephone: '', statut: 'actif' };
  activeTab = 'info';
  successMessage = '';

  totalClients = 0;
  clientsActifs = 0;
  clientsMois = 0;
  villesUniques = 0;

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
    this.updateKPIs();
    this.applyFilters();
  }

  saveClients() {
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.updateKPIs();
    this.applyFilters();
  }

  updateKPIs() {
    this.totalClients = this.clients.length;
    this.clientsActifs = this.clients.filter(c => c.statut === 'actif').length;
    const now = new Date();
    this.clientsMois = this.clients.filter(c => {
      if (!c.created_at) return false;
      const date = new Date(c.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const villes = new Set(this.clients.map(c => c.ville).filter((v): v is string => !!v && v.trim() !== ''));
    this.villesUniques = villes.size;
  }

  applyFilters() {
    let filtered = [...this.clients];
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(c =>
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.telephone?.includes(term) ||
        c.ville?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) filtered = filtered.filter(c => c.statut === this.statutFilter);
    if (this.periodeFilter) {
      const today = new Date(); today.setHours(0,0,0,0);
      filtered = filtered.filter(c => {
        if (!c.created_at) return false;
        const date = new Date(c.created_at);
        if (isNaN(date.getTime())) return false;
        switch (this.periodeFilter) {
          case 'today': return date.toDateString() === today.toDateString();
          case 'week': const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7); return date >= weekAgo;
          case 'month': return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
          case 'last_month': const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1); return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
          default: return true;
        }
      });
    }
    this.filteredClients = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) this.currentPage = Math.max(1, this.totalPages);
    this.setPaginatedClients();
  }

  setPaginatedClients() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.setPaginatedClients();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  filterClients() { this.currentPage = 1; this.applyFilters(); }

  openForm() { this.currentClient = { nom: '', prenom: '', email: '', telephone: '', pays: 'Mali', statut: 'actif' }; this.editMode = false; this.showForm = true; this.activeTab = 'info'; }
  editClient(client: Client) { this.currentClient = { ...client }; this.editMode = true; this.showForm = true; this.activeTab = 'info'; }
  cancelForm() { this.showForm = false; this.editMode = false; }

  saveClient() {
    if (this.editMode && this.currentClient.id) {
      const index = this.clients.findIndex(c => c.id === this.currentClient.id);
      if (index !== -1) {
        this.clients[index] = { ...this.currentClient, updated_at: new Date().toISOString() };
        this.showSuccess('Client modifié');
      }
    } else {
      const newClient: Client = { ...this.currentClient, id: Date.now(), created_at: new Date().toISOString() };
      this.clients.push(newClient);
      this.showSuccess('Client ajouté');
    }
    this.saveClients();
    this.cancelForm();
  }

  duplicateClient(client: Client) {
    const newClient: Client = { ...client, id: undefined, nom: `${client.nom} (copie)`, email: `copy_${client.email}`, created_at: new Date().toISOString() };
    this.clients.push(newClient);
    this.saveClients();
    this.showSuccess('Client dupliqué');
  }

  viewDetails(client: Client) { this.selectedClient = client; this.showDetailsModal = true; }

  deleteClient(client: Client) {
    if (confirm(`Voulez-vous vraiment supprimer ${client.nom} ${client.prenom || ''} ?`)) {
      this.clients = this.clients.filter(c => c.id !== client.id);
      this.saveClients();
      this.showSuccess('Client supprimé');
    }
  }

  getInitials(nom: string): string { if (!nom) return '??'; return nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2); }

  showSuccess(msg: string) { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }

  exportToExcel() {
    const colonnes = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse', 'Ville', 'Code postal', 'Pays', 'Secteur', 'Statut', 'Date création'];
    const lignes = this.filteredClients.map(c => [c.id || '', c.nom, c.prenom || '', c.email, c.telephone, c.adresse || '', c.ville || '', c.code_postal || '', c.pays || '', c.secteur || '', c.statut === 'actif' ? 'Actif' : 'Inactif', c.created_at ? new Date(c.created_at).toLocaleDateString() : '']);
    const csvContent = [colonnes, ...lignes].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `clients_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }

  exportToPDF() {
    const contenu = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Liste des clients</title>
      <style>body{font-family:Arial;margin:20px;} h1{color:#EC4899;text-align:center;} table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f2f2f2;} .footer{text-align:center;margin-top:30px;font-size:12px;color:gray;}</style>
      </head>
      <body><h1>Liste des clients</h1><p>Généré le ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Statut</th></tr></thead>
      <tbody>${this.filteredClients.map(c => `<tr><td>${c.id || ''}</td><td>${c.nom}</td><td>${c.prenom || ''}</td><td>${c.email}</td><td>${c.telephone}</td><td>${c.ville || '-'}</td><td>${c.statut === 'actif' ? 'Actif' : 'Inactif'}</td></tr>`).join('')}</tbody>
      </table><div class="footer">PulseBusiness - Export clients</div></body></html>
    `;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); }
    else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }
}