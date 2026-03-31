import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Filiale {
  id?: number;
  code: string;
  nom: string;
  entite_id?: number;
  entite_nom?: string;
  pays?: string;
  ville?: string;
  responsable?: string;
  telephone?: string;
  email?: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-filiales',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="filiales-container">
      <div class="header">
        <div>
          <h1>🏭 Filiales</h1>
          <p class="subtitle">{{ filiales.length }} filiale(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="filiales.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="filiales.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle filiale</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="filiales.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🏭</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ filiales.length }}</span>
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

      <div class="filters-section" *ngIf="filiales.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFiliales()" placeholder="Rechercher par code, nom..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterFiliales()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
          </select>
        </div>
      </div>

      <div class="filiales-section" *ngIf="filiales.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des filiales</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredFiliales.length }} / {{ filiales.length }} affiché(s)</span>
          </div>
        </div>
        <div class="filiales-grid">
          <div class="filiale-card" *ngFor="let f of filteredFiliales" [class]="f.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="filiale-icon">🏭</div>
                <div class="filiale-info">
                  <div class="filiale-code">{{ f.code }}</div>
                  <div class="filiale-nom">{{ f.nom }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="f.entite_nom">
                <span class="info-label">🏢 Entité mère:</span>
                <span class="info-value">{{ f.entite_nom }}</span>
              </div>
              <div class="info-row" *ngIf="f.pays">
                <span class="info-label">🌍 Pays:</span>
                <span class="info-value">{{ f.pays }}</span>
              </div>
              <div class="info-row" *ngIf="f.ville">
                <span class="info-label">📍 Ville:</span>
                <span class="info-value">{{ f.ville }}</span>
              </div>
              <div class="info-row" *ngIf="f.responsable">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ f.responsable }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editFiliale(f)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏭</div>
          <h2>Aucune filiale</h2>
          <p>Ajoutez votre première filiale</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle filiale</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} filiale</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveFiliale()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentFiliale.code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentFiliale.nom" required>
              </div>
              <div class="form-group">
                <label>Entité mère</label>
                <select [(ngModel)]="currentFiliale.entite_id" (change)="onEntiteChange()">
                  <option [ngValue]="null">Sélectionner une entité</option>
                  <option *ngFor="let e of entites" [ngValue]="e.id">{{ e.nom }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Pays</label>
                  <input type="text" [(ngModel)]="currentFiliale.pays">
                </div>
                <div class="form-group">
                  <label>Ville</label>
                  <input type="text" [(ngModel)]="currentFiliale.ville">
                </div>
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentFiliale.responsable">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="tel" [(ngModel)]="currentFiliale.telephone">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="currentFiliale.email">
                </div>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentFiliale.statut">
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
            <p>Supprimer la filiale <strong>{{ filialeToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteFiliale()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filiales-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .filiales-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .filiales-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .filiale-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .filiale-card.actif { border-left-color: #10B981; }
    .filiale-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .filiale-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .filiale-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .filiale-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .filiale-nom { font-weight: 600; color: #1F2937; margin-top: 4px; }
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
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .filiales-grid { grid-template-columns: 1fr; } }
  `]
})
export class Filiales implements OnInit {
  filiales: Filiale[] = [];
  filteredFiliales: Filiale[] = [];
  entites: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  filialeToDelete: Filiale | null = null;
  successMessage = '';

  currentFiliale: Partial<Filiale> = {
    code: '',
    nom: '',
    statut: 'actif'
  };

  ngOnInit() {
    this.loadEntites();
    this.loadFiliales();
  }

  loadEntites() {
    const saved = localStorage.getItem('entites');
    this.entites = saved ? JSON.parse(saved) : [];
  }

  loadFiliales() {
    const saved = localStorage.getItem('filiales');
    this.filiales = saved ? JSON.parse(saved) : [];
    this.filteredFiliales = [...this.filiales];
  }

  saveFiliales() {
    localStorage.setItem('filiales', JSON.stringify(this.filiales));
  }

  openForm() {
    this.currentFiliale = {
      code: this.generateCode(),
      nom: '',
      pays: '',
      ville: '',
      responsable: '',
      telephone: '',
      email: '',
      statut: 'actif'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.filiales.length + 1;
    return `FIL-${String(count).padStart(4, '0')}`;
  }

  onEntiteChange() {
    const entite = this.entites.find(e => e.id === this.currentFiliale.entite_id);
    if (entite) {
      this.currentFiliale.entite_nom = entite.nom;
    } else {
      this.currentFiliale.entite_nom = undefined;
    }
  }

  saveFiliale() {
    if (!this.currentFiliale.code || !this.currentFiliale.nom) {
      alert('Le code et le nom sont requis');
      return;
    }

    if (this.editMode && this.currentFiliale.id) {
      const index = this.filiales.findIndex(f => f.id === this.currentFiliale.id);
      if (index !== -1) {
        this.filiales[index] = { ...this.currentFiliale, updated_at: new Date().toISOString() } as Filiale;
        this.showSuccess('Filiale modifiée');
      }
    } else {
      this.filiales.push({
        ...this.currentFiliale,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Filiale);
      this.showSuccess('Filiale ajoutée');
    }
    this.saveFiliales();
    this.filterFiliales();
    this.cancelForm();
  }

  editFiliale(f: Filiale) {
    this.currentFiliale = { ...f };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(f: Filiale) {
    this.filialeToDelete = f;
    this.showDeleteModal = true;
  }

  deleteFiliale() {
    if (this.filialeToDelete) {
      this.filiales = this.filiales.filter(f => f.id !== this.filialeToDelete?.id);
      this.saveFiliales();
      this.filterFiliales();
      this.showDeleteModal = false;
      this.filialeToDelete = null;
      this.showSuccess('Filiale supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterFiliales() {
    let filtered = [...this.filiales];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => f.code?.toLowerCase().includes(term) || f.nom?.toLowerCase().includes(term));
    }
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    this.filteredFiliales = filtered;
  }

  getActifsCount(): number {
    return this.filiales.filter(f => f.statut === 'actif').length;
  }

  getStatutLabel(statut: string): string {
    return statut === 'actif' ? '✅ Actif' : '⏸️ Inactif';
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  // Export Excel (CSV)
  exportToExcel() {
    const colonnes = ['Code', 'Nom', 'Entité mère', 'Pays', 'Ville', 'Responsable', 'Téléphone', 'Email', 'Statut', 'Date création'];
    const lignes = this.filteredFiliales.map(f => [
      f.code,
      f.nom,
      f.entite_nom || '',
      f.pays || '',
      f.ville || '',
      f.responsable || '',
      f.telephone || '',
      f.email || '',
      this.getStatutLabel(f.statut),
      new Date(f.created_at).toLocaleDateString()
    ]);
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `filiales_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }

  // Export PDF (impression)
  exportToPDF() {
    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des filiales</title>
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
        <h1>Liste des filiales</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr><th>Code</th><th>Nom</th><th>Entité mère</th><th>Pays</th><th>Ville</th><th>Responsable</th><th>Téléphone</th><th>Email</th><th>Statut</th><th>Date création</th></tr>
          </thead>
          <tbody>
            ${this.filteredFiliales.map(f => `
              <tr>
                <td>${f.code}</td>
                <td>${f.nom}</td>
                <td>${f.entite_nom || '-'}</td>
                <td>${f.pays || '-'}</td>
                <td>${f.ville || '-'}</td>
                <td>${f.responsable || '-'}</td>
                <td>${f.telephone || '-'}</td>
                <td>${f.email || '-'}</td>
                <td>${this.getStatutLabel(f.statut)}</td>
                <td>${new Date(f.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export filiales</div>
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