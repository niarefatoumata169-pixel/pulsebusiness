import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Entretien {
  id?: number;
  reference: string;
  candidature_id: number;
  candidat_nom?: string;
  poste?: string;
  date_entretien: string;
  heure: string;
  type: 'telephonique' | 'visio' | 'physique';
  responsable: string;
  statut: 'planifie' | 'realise' | 'annule';
  feedback?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-entretiens',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="entretiens-container">
      <div class="header">
        <div>
          <h1>🗣️ Gestion des entretiens</h1>
          <p class="subtitle">{{ entretiens.length }} entretien(s) • {{ getPlanifies() }} planifié(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Planifier un entretien</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="entretiens.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🗣️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ entretiens.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getPlanifies() }}</span>
            <span class="kpi-label">Planifiés</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getRealises() }}</span>
            <span class="kpi-label">Réalisés</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="entretiens.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEntretiens()" placeholder="Rechercher par candidat, responsable..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterEntretiens()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="planifie">📅 Planifié</option>
            <option value="realise">✅ Réalisé</option>
            <option value="annule">❌ Annulé</option>
          </select>
        </div>
      </div>

      <div class="entretiens-section" *ngIf="entretiens.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des entretiens</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredEntretiens.length }} / {{ entretiens.length }} affiché(s)</span>
          </div>
        </div>
        <div class="entretiens-grid">
          <div class="entretien-card" *ngFor="let e of filteredEntretiens" [class]="e.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="entretien-icon">🗣️</div>
                <div class="entretien-info">
                  <div class="entretien-ref">{{ e.reference }}</div>
                  <div class="entretien-candidat">{{ e.candidat_nom }}</div>
                  <div class="entretien-poste">{{ e.poste }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">{{ e.date_entretien | date:'dd/MM/yyyy' }} à {{ e.heure }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📞 Type:</span>
                <span class="info-value">{{ getTypeLabel(e.type) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Responsable:</span>
                <span class="info-value">{{ e.responsable }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(e)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editEntretien(e)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="marquerRealise(e)" *ngIf="e.statut === 'planifie'" title="Marquer réalisé">✅</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🗣️</div>
          <h2>Aucun entretien</h2>
          <p>Planifiez votre premier entretien</p>
          <button class="btn-primary" (click)="openForm()">+ Planifier un entretien</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Planifier' }} un entretien</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEntretien()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentEntretien.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Candidature *</label>
                <select [(ngModel)]="currentEntretien.candidature_id" (change)="onCandidatureChange()" required>
                  <option [value]="null">Sélectionner</option>
                  <option *ngFor="let c of candidatures" [value]="c.id">{{ c.candidat_nom }} - {{ c.poste }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="currentEntretien.date_entretien" required>
                </div>
                <div class="form-group">
                  <label>Heure *</label>
                  <input type="time" [(ngModel)]="currentEntretien.heure" required>
                </div>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentEntretien.type">
                  <option value="telephonique">📞 Téléphonique</option>
                  <option value="visio">💻 Visioconférence</option>
                  <option value="physique">🏢 Physique</option>
                </select>
              </div>
              <div class="form-group">
                <label>Responsable *</label>
                <input type="text" [(ngModel)]="currentEntretien.responsable" required>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEntretien.statut">
                  <option value="planifie">📅 Planifié</option>
                  <option value="realise">✅ Réalisé</option>
                  <option value="annule">❌ Annulé</option>
                </select>
              </div>
              <div class="form-group">
                <label>Feedback (optionnel)</label>
                <textarea [(ngModel)]="currentEntretien.feedback" rows="3" placeholder="Retour sur l'entretien..."></textarea>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentEntretien.notes" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedEntretien">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de l'entretien - {{ selectedEntretien.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Candidat:</strong> {{ selectedEntretien.candidat_nom }}</p>
              <p><strong>Poste:</strong> {{ selectedEntretien.poste }}</p>
              <p><strong>Date:</strong> {{ selectedEntretien.date_entretien | date:'dd/MM/yyyy' }} à {{ selectedEntretien.heure }}</p>
              <p><strong>Type:</strong> {{ getTypeLabel(selectedEntretien.type) }}</p>
              <p><strong>Responsable:</strong> {{ selectedEntretien.responsable }}</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedEntretien.statut) }}</p>
              <p *ngIf="selectedEntretien.feedback"><strong>Feedback:</strong> {{ selectedEntretien.feedback }}</p>
              <p *ngIf="selectedEntretien.notes"><strong>Notes:</strong> {{ selectedEntretien.notes }}</p>
            </div>
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
            <p>Supprimer l'entretien <strong>{{ entretienToDelete?.reference }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEntretien()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .entretiens-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
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
    .entretiens-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .entretiens-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .entretien-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .entretien-card.planifie { border-left-color: #3B82F6; }
    .entretien-card.realise { border-left-color: #10B981; opacity: 0.9; }
    .entretien-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .entretien-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .entretien-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .entretien-ref { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .entretien-candidat { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .entretien-poste { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.planifie { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.realise { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annule { background: #FEE2E2; color: #EF4444; }
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .entretiens-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } }
  `]
})
export class Entretiens implements OnInit {
  entretiens: Entretien[] = [];
  filteredEntretiens: Entretien[] = [];
  candidatures: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedEntretien: Entretien | null = null;
  entretienToDelete: Entretien | null = null;
  successMessage = '';

  currentEntretien: Partial<Entretien> = {
    reference: '',
    statut: 'planifie',
    type: 'physique',
    date_entretien: new Date().toISOString().split('T')[0],
    heure: '10:00'
  };

  ngOnInit() {
    this.loadCandidatures();
    this.loadEntretiens();
  }

  loadCandidatures() {
    const saved = localStorage.getItem('candidatures');
    this.candidatures = saved ? JSON.parse(saved) : [];
  }

  loadEntretiens() {
    const saved = localStorage.getItem('entretiens');
    this.entretiens = saved ? JSON.parse(saved) : [];
    this.filteredEntretiens = [...this.entretiens];
  }

  saveEntretiens() {
    localStorage.setItem('entretiens', JSON.stringify(this.entretiens));
  }

  openForm() {
    this.currentEntretien = {
      reference: this.generateReference(),
      statut: 'planifie',
      type: 'physique',
      date_entretien: new Date().toISOString().split('T')[0],
      heure: '10:00',
      responsable: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.entretiens.length + 1;
    return `ENT-${String(count).padStart(4, '0')}`;
  }

  onCandidatureChange() {
    const candidature = this.candidatures.find(c => c.id === this.currentEntretien.candidature_id);
    if (candidature) {
      this.currentEntretien.candidat_nom = candidature.candidat_nom;
      this.currentEntretien.poste = candidature.poste;
    }
  }

  saveEntretien() {
    if (!this.currentEntretien.candidature_id || !this.currentEntretien.date_entretien || !this.currentEntretien.responsable) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentEntretien.id) {
      const index = this.entretiens.findIndex(e => e.id === this.currentEntretien.id);
      if (index !== -1) {
        this.entretiens[index] = { ...this.currentEntretien, updated_at: new Date().toISOString() } as Entretien;
        this.showSuccess('Entretien modifié');
      }
    } else {
      this.entretiens.push({
        ...this.currentEntretien,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Entretien);
      this.showSuccess('Entretien planifié');
    }
    this.saveEntretiens();
    this.filterEntretiens();
    this.cancelForm();
  }

  editEntretien(e: Entretien) {
    this.currentEntretien = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  marquerRealise(e: Entretien) {
    e.statut = 'realise';
    this.saveEntretiens();
    this.filterEntretiens();
    this.showSuccess('Entretien marqué comme réalisé');
  }

  viewDetails(e: Entretien) {
    this.selectedEntretien = e;
    this.showDetailsModal = true;
  }

  confirmDelete(e: Entretien) {
    this.entretienToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEntretien() {
    if (this.entretienToDelete) {
      this.entretiens = this.entretiens.filter(e => e.id !== this.entretienToDelete?.id);
      this.saveEntretiens();
      this.filterEntretiens();
      this.showDeleteModal = false;
      this.entretienToDelete = null;
      this.showSuccess('Entretien supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterEntretiens() {
    let filtered = [...this.entretiens];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.candidat_nom?.toLowerCase().includes(term) ||
        e.responsable?.toLowerCase().includes(term) ||
        e.reference?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    this.filteredEntretiens = filtered;
  }

  getPlanifies(): number {
    return this.entretiens.filter(e => e.statut === 'planifie').length;
  }

  getRealises(): number {
    return this.entretiens.filter(e => e.statut === 'realise').length;
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      telephonique: '📞 Téléphonique',
      visio: '💻 Visioconférence',
      physique: '🏢 Physique'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      planifie: '📅 Planifié',
      realise: '✅ Réalisé',
      annule: '❌ Annulé'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}