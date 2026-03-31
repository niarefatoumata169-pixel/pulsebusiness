import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Entite {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  type?: 'siege' | 'filiale' | 'bureau';
  telephone?: string;
  email?: string;
  adresse?: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-entites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="entites-container">
      <div class="header">
        <div>
          <h1>🏢 Entités</h1>
          <p class="subtitle">{{ entites.length }} entité(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="entites.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="entites.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle entité</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <!-- KPIs -->
      <div class="kpi-grid" *ngIf="entites.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🏢</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ entites.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifsCount() }}</span>
            <span class="kpi-label">Actives</span>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section" *ngIf="entites.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEntites()" placeholder="Rechercher par code, nom..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterEntites()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
          </select>
        </div>
      </div>

      <!-- Liste -->
      <div class="entites-section" *ngIf="entites.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des entités</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredEntites.length }} / {{ entites.length }} affiché(s)</span>
          </div>
        </div>
        <div class="entites-grid">
          <div class="entite-card" *ngFor="let e of filteredEntites" [class]="e.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="entite-icon">🏢</div>
                <div class="entite-info">
                  <div class="entite-code">{{ e.code }}</div>
                  <div class="entite-nom">{{ e.nom }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="e.description">
                <span class="info-label">📝 Description:</span>
                <span class="info-value">{{ e.description }}</span>
              </div>
              <div class="info-row" *ngIf="e.telephone">
                <span class="info-label">📞 Tél:</span>
                <span class="info-value">{{ e.telephone }}</span>
              </div>
              <div class="info-row" *ngIf="e.email">
                <span class="info-label">✉️ Email:</span>
                <span class="info-value">{{ e.email }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editEntite(e)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏢</div>
          <h2>Aucune entité</h2>
          <p>Ajoutez votre première entité</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle entité</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} entité</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEntite()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentEntite.code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentEntite.nom" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="currentEntite.description" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" [(ngModel)]="currentEntite.telephone">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="currentEntite.email">
                </div>
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <input type="text" [(ngModel)]="currentEntite.adresse">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEntite.statut">
                  <option value="actif">✅ Actif</option>
                  <option value="inactif">⏸️ Inactif</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer l'entité <strong>{{ entiteToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEntite()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .entites-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 1; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .entites-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .entites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .entite-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .entite-card.actif { border-left-color: #10B981; }
    .entite-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .entite-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .entite-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .entite-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .entite-nom { font-weight: 600; color: #1F2937; margin-top: 4px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
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
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .entites-grid { grid-template-columns: 1fr; } }
  `]
})
export class Entites implements OnInit {
  entites: Entite[] = [];
  filteredEntites: Entite[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  entiteToDelete: Entite | null = null;
  successMessage = '';

  currentEntite: Partial<Entite> = {
    code: '',
    nom: '',
    statut: 'actif'
  };

  ngOnInit() {
    this.loadEntites();
  }

  loadEntites() {
    const saved = localStorage.getItem('entites');
    this.entites = saved ? JSON.parse(saved) : [];
    this.filteredEntites = [...this.entites];
  }

  saveEntites() {
    localStorage.setItem('entites', JSON.stringify(this.entites));
  }

  openForm() {
    this.currentEntite = {
      code: this.generateCode(),
      nom: '',
      description: '',
      telephone: '',
      email: '',
      adresse: '',
      statut: 'actif'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.entites.length + 1;
    return `ENT-${String(count).padStart(4, '0')}`;
  }

  saveEntite() {
    if (!this.currentEntite.code || !this.currentEntite.nom) {
      alert('Le code et le nom sont requis');
      return;
    }

    if (this.editMode && this.currentEntite.id) {
      const index = this.entites.findIndex(e => e.id === this.currentEntite.id);
      if (index !== -1) {
        this.entites[index] = { ...this.currentEntite, updated_at: new Date().toISOString() } as Entite;
        this.showSuccess('Entité modifiée');
      }
    } else {
      this.entites.push({
        ...this.currentEntite,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Entite);
      this.showSuccess('Entité ajoutée');
    }
    this.saveEntites();
    this.filterEntites();
    this.cancelForm();
  }

  editEntite(e: Entite) {
    this.currentEntite = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(e: Entite) {
    this.entiteToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEntite() {
    if (this.entiteToDelete) {
      this.entites = this.entites.filter(e => e.id !== this.entiteToDelete?.id);
      this.saveEntites();
      this.filterEntites();
      this.showDeleteModal = false;
      this.entiteToDelete = null;
      this.showSuccess('Entité supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterEntites() {
    let filtered = [...this.entites];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => e.code?.toLowerCase().includes(term) || e.nom?.toLowerCase().includes(term));
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    this.filteredEntites = filtered;
  }

  getActifsCount(): number {
    return this.entites.filter(e => e.statut === 'actif').length;
  }

  getStatutLabel(statut: string): string {
    return statut === 'actif' ? '✅ Actif' : '⏸️ Inactif';
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportToExcel() {
    const colonnes = ['Code', 'Nom', 'Description', 'Téléphone', 'Email', 'Adresse', 'Statut', 'Date création'];
    const lignes = this.filteredEntites.map(e => [
      e.code,
      e.nom,
      e.description || '',
      e.telephone || '',
      e.email || '',
      e.adresse || '',
      this.getStatutLabel(e.statut),
      new Date(e.created_at).toLocaleDateString()
    ]);
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `entites_${new Date().toISOString().slice(0,19)}.csv`);
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
      <head>
        <meta charset="UTF-8">
        <title>Liste des entités</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #EC4899; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: gray; }
        </style>
      </head>
      <body>
        <h1>Liste des entités</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr><th>Code</th><th>Nom</th><th>Description</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Statut</th><th>Date création</th></tr>
          </thead>
          <tbody>
            ${this.filteredEntites.map(e => `
              <tr>
                <td>${e.code}</td>
                <td>${e.nom}</td>
                <td>${e.description || '-'}</td>
                <td>${e.telephone || '-'}</td>
                <td>${e.email || '-'}</td>
                <td>${e.adresse || '-'}</td>
                <td>${this.getStatutLabel(e.statut)}</td>
                <td>${new Date(e.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export entités</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      win.print();
    } else {
      alert('Veuillez autoriser les pop-ups pour exporter en PDF');
    }
  }
}