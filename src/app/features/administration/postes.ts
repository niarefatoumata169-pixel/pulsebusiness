import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Poste {
  id?: number;
  code: string;
  titre: string;
  departement_id?: number;
  departement_nom?: string;
  description?: string;
  niveau?: string;
  competences?: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-postes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="postes-container">
      <div class="header">
        <div>
          <h1>👔 Postes</h1>
          <p class="subtitle">{{ postes.length }} poste(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="postes.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="postes.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouveau poste</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="postes.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">👔</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ postes.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifsCount() }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="postes.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPostes()" placeholder="Rechercher par code, titre..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterPostes()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
          </select>
        </div>
      </div>

      <div class="postes-section" *ngIf="postes.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des postes</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredPostes.length }} / {{ postes.length }} affiché(s)</span>
          </div>
        </div>
        <div class="postes-grid">
          <div class="poste-card" *ngFor="let p of filteredPostes" [class]="p.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="poste-icon">👔</div>
                <div class="poste-info">
                  <div class="poste-code">{{ p.code }}</div>
                  <div class="poste-titre">{{ p.titre }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="p.statut">{{ getStatutLabel(p.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="p.departement_nom">
                <span class="info-label">📂 Département:</span>
                <span class="info-value">{{ p.departement_nom }}</span>
              </div>
              <div class="info-row" *ngIf="p.niveau">
                <span class="info-label">📊 Niveau:</span>
                <span class="info-value">{{ p.niveau }}</span>
              </div>
              <div class="info-row" *ngIf="p.description">
                <span class="info-label">📝 Description:</span>
                <span class="info-value">{{ p.description }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editPoste(p)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(p)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👔</div>
          <h2>Aucun poste</h2>
          <p>Ajoutez votre premier poste</p>
          <button class="btn-primary" (click)="openForm()">+ Nouveau poste</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouveau' }} poste</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="savePoste()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentPoste.code" required>
              </div>
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentPoste.titre" required>
              </div>
              <div class="form-group">
                <label>Département</label>
                <select [(ngModel)]="currentPoste.departement_id" (change)="onDepartementChange()">
                  <option [ngValue]="null">Sélectionner un département</option>
                  <option *ngFor="let d of departements" [ngValue]="d.id">{{ d.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Niveau</label>
                <input type="text" [(ngModel)]="currentPoste.niveau" placeholder="Ex: Cadre, Agent de maîtrise...">
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="currentPoste.description" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Compétences requises</label>
                <textarea [(ngModel)]="currentPoste.competences" rows="2" placeholder="Liste des compétences séparées par des virgules..."></textarea>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentPoste.statut">
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
            <p>Supprimer le poste <strong>{{ posteToDelete?.titre }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deletePoste()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .postes-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .postes-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .postes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .poste-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .poste-card.actif { border-left-color: #10B981; }
    .poste-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .poste-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .poste-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .poste-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .poste-titre { font-weight: 600; color: #1F2937; margin-top: 4px; }
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
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .postes-grid { grid-template-columns: 1fr; } }
  `]
})
export class Postes implements OnInit {
  postes: Poste[] = [];
  filteredPostes: Poste[] = [];
  departements: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  posteToDelete: Poste | null = null;
  successMessage = '';

  currentPoste: Partial<Poste> = {
    code: '',
    titre: '',
    statut: 'actif'
  };

  ngOnInit() {
    this.loadDepartements();
    this.loadPostes();
  }

  loadDepartements() {
    const saved = localStorage.getItem('departements');
    this.departements = saved ? JSON.parse(saved) : [];
  }

  loadPostes() {
    const saved = localStorage.getItem('postes');
    this.postes = saved ? JSON.parse(saved) : [];
    this.filteredPostes = [...this.postes];
  }

  savePostes() {
    localStorage.setItem('postes', JSON.stringify(this.postes));
  }

  openForm() {
    this.currentPoste = {
      code: this.generateCode(),
      titre: '',
      niveau: '',
      description: '',
      competences: '',
      statut: 'actif'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.postes.length + 1;
    return `POS-${String(count).padStart(4, '0')}`;
  }

  onDepartementChange() {
    const dept = this.departements.find(d => d.id === this.currentPoste.departement_id);
    if (dept) {
      this.currentPoste.departement_nom = dept.nom;
    } else {
      this.currentPoste.departement_nom = undefined;
    }
  }

  savePoste() {
    if (!this.currentPoste.code || !this.currentPoste.titre) {
      alert('Le code et le titre sont requis');
      return;
    }

    if (this.editMode && this.currentPoste.id) {
      const index = this.postes.findIndex(p => p.id === this.currentPoste.id);
      if (index !== -1) {
        this.postes[index] = { ...this.currentPoste, updated_at: new Date().toISOString() } as Poste;
        this.showSuccess('Poste modifié');
      }
    } else {
      this.postes.push({
        ...this.currentPoste,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Poste);
      this.showSuccess('Poste ajouté');
    }
    this.savePostes();
    this.filterPostes();
    this.cancelForm();
  }

  editPoste(p: Poste) {
    this.currentPoste = { ...p };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(p: Poste) {
    this.posteToDelete = p;
    this.showDeleteModal = true;
  }

  deletePoste() {
    if (this.posteToDelete) {
      this.postes = this.postes.filter(p => p.id !== this.posteToDelete?.id);
      this.savePostes();
      this.filterPostes();
      this.showDeleteModal = false;
      this.posteToDelete = null;
      this.showSuccess('Poste supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterPostes() {
    let filtered = [...this.postes];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.code?.toLowerCase().includes(term) || p.titre?.toLowerCase().includes(term));
    }
    if (this.statutFilter) {
      filtered = filtered.filter(p => p.statut === this.statutFilter);
    }
    this.filteredPostes = filtered;
  }

  getActifsCount(): number {
    return this.postes.filter(p => p.statut === 'actif').length;
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
    const colonnes = ['Code', 'Titre', 'Département', 'Niveau', 'Description', 'Compétences', 'Statut', 'Date création'];
    const lignes = this.filteredPostes.map(p => [
      p.code,
      p.titre,
      p.departement_nom || '',
      p.niveau || '',
      p.description || '',
      p.competences || '',
      this.getStatutLabel(p.statut),
      new Date(p.created_at).toLocaleDateString()
    ]);
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `postes_${new Date().toISOString().slice(0,19)}.csv`);
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
        <title>Liste des postes</title>
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
        <h1>Liste des postes</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr><th>Code</th><th>Titre</th><th>Département</th><th>Niveau</th><th>Description</th><th>Compétences</th><th>Statut</th><th>Date création</th></tr>
          </thead>
          <tbody>
            ${this.filteredPostes.map(p => `
              <tr>
                <td>${p.code}</td>
                <td>${p.titre}</td>
                <td>${p.departement_nom || '-'}</td>
                <td>${p.niveau || '-'}</td>
                <td>${p.description || '-'}</td>
                <td>${p.competences || '-'}</td>
                <td>${this.getStatutLabel(p.statut)}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export postes</div>
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