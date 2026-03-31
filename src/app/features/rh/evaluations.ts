import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Evaluation {
  id?: number;
  reference: string;
  employe_id: number;
  employe_nom?: string;
  evaluateur: string;
  date_evaluation: string;
  periode: string; // ex: "2024-Q1"
  note: number; // 0-10
  commentaire?: string;
  objectifs: ObjectifEvaluation[];
  statut: 'planifiee' | 'realisee' | 'annulee';
  created_at: string;
  updated_at?: string;
}

interface ObjectifEvaluation {
  id?: number;
  description: string;
  atteint: boolean;
  note: number;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="evaluations-container">
      <div class="header">
        <div>
          <h1>⭐ Évaluations de performance</h1>
          <p class="subtitle">{{ evaluations.length }} évaluation(s) • Note moyenne: {{ getNoteMoyenne() | number:'1.1-1' }}/10</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvelle évaluation</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="evaluations.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ evaluations.length }}</span>
            <span class="kpi-label">Évaluations</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getNoteMoyenne() | number:'1.1-1' }}/10</span>
            <span class="kpi-label">Note moyenne</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getRealisees() }}</span>
            <span class="kpi-label">Réalisées</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="evaluations.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEvaluations()" placeholder="Rechercher par employé, évaluateur..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterEvaluations()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="planifiee">📅 Planifiée</option>
            <option value="realisee">✅ Réalisée</option>
            <option value="annulee">❌ Annulée</option>
          </select>
        </div>
      </div>

      <div class="evaluations-section" *ngIf="evaluations.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des évaluations</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredEvaluations.length }} / {{ evaluations.length }} affiché(s)</span>
          </div>
        </div>
        <div class="evaluations-grid">
          <div class="evaluation-card" *ngFor="let e of filteredEvaluations" [class]="e.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="evaluation-icon">⭐</div>
                <div class="evaluation-info">
                  <div class="evaluation-ref">{{ e.reference }}</div>
                  <div class="evaluation-employe">{{ e.employe_nom }}</div>
                  <div class="evaluation-periode">{{ e.periode }}</div>
                </div>
              </div>
              <div class="header-right">
                <div class="evaluation-note">{{ e.note }}/10</div>
                <span class="statut-badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">{{ e.date_evaluation | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Évaluateur:</span>
                <span class="info-value">{{ e.evaluateur }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🎯 Objectifs:</span>
                <span class="info-value">{{ getObjectifsAtteints(e) }}/{{ e.objectifs.length }} atteints</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(e)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editEvaluation(e)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="marquerRealisee(e)" *ngIf="e.statut === 'planifiee'" title="Marquer réalisée">✅</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <h2>Aucune évaluation</h2>
          <p>Créez votre première évaluation</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle évaluation</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} évaluation</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEvaluation()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentEvaluation.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Employé *</label>
                <select [(ngModel)]="currentEvaluation.employe_id" (change)="onEmployeChange()" required>
                  <option [value]="null">Sélectionner</option>
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Évaluateur *</label>
                <input type="text" [(ngModel)]="currentEvaluation.evaluateur" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date *</label>
                  <input type="date" [(ngModel)]="currentEvaluation.date_evaluation" required>
                </div>
                <div class="form-group">
                  <label>Période (ex: 2024-Q1) *</label>
                  <input type="text" [(ngModel)]="currentEvaluation.periode" required placeholder="2024-Q1">
                </div>
              </div>
              <div class="form-group">
                <label>Note générale (0-10) *</label>
                <input type="number" [(ngModel)]="currentEvaluation.note" min="0" max="10" step="0.5" required>
              </div>
              <div class="form-group">
                <label>Commentaire</label>
                <textarea [(ngModel)]="currentEvaluation.commentaire" rows="2"></textarea>
              </div>

              <div class="objectifs-header">
                <h4>🎯 Objectifs</h4>
                <button type="button" class="btn-add-small" (click)="addObjectif()">+ Ajouter objectif</button>
              </div>
              <div class="objectifs-list" *ngIf="currentEvaluation.objectifs && currentEvaluation.objectifs.length > 0">
                <div *ngFor="let obj of currentEvaluation.objectifs; let i = index" class="objectif-item">
                  <div class="objectif-description">
                    <input type="text" [(ngModel)]="obj.description" placeholder="Description de l'objectif">
                  </div>
                  <div class="objectif-atteint">
                    <label>Atteint ?</label>
                    <input type="checkbox" [(ngModel)]="obj.atteint">
                  </div>
                  <div class="objectif-note">
                    <input type="number" [(ngModel)]="obj.note" placeholder="Note" min="0" max="10" step="0.5">
                  </div>
                  <button type="button" class="remove-objectif" (click)="removeObjectif(i)">🗑️</button>
                </div>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEvaluation.statut">
                  <option value="planifiee">📅 Planifiée</option>
                  <option value="realisee">✅ Réalisée</option>
                  <option value="annulee">❌ Annulée</option>
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

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedEvaluation">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de l'évaluation - {{ selectedEvaluation.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Employé:</strong> {{ selectedEvaluation.employe_nom }}</p>
              <p><strong>Évaluateur:</strong> {{ selectedEvaluation.evaluateur }}</p>
              <p><strong>Date:</strong> {{ selectedEvaluation.date_evaluation | date:'dd/MM/yyyy' }}</p>
              <p><strong>Période:</strong> {{ selectedEvaluation.periode }}</p>
              <p><strong>Note:</strong> {{ selectedEvaluation.note }}/10</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedEvaluation.statut) }}</p>
              <p *ngIf="selectedEvaluation.commentaire"><strong>Commentaire:</strong> {{ selectedEvaluation.commentaire }}</p>
              <h4>Objectifs</h4>
              <ul>
                <li *ngFor="let obj of selectedEvaluation.objectifs">
                  {{ obj.description }} - Atteint: {{ obj.atteint ? '✅' : '❌' }} (Note: {{ obj.note }}/10)
                </li>
              </ul>
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
            <p>Supprimer l'évaluation <strong>{{ evaluationToDelete?.reference }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEvaluation()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .evaluations-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary, .btn-add-small { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add-small { padding: 5px 12px; font-size: 12px; }
    .btn-add:hover, .btn-primary:hover, .btn-add-small:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
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
    .evaluations-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .evaluations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .evaluation-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .evaluation-card.planifiee { border-left-color: #3B82F6; }
    .evaluation-card.realisee { border-left-color: #10B981; opacity: 0.9; }
    .evaluation-card.annulee { border-left-color: #EF4444; opacity: 0.7; }
    .evaluation-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .evaluation-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .evaluation-ref { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .evaluation-employe { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .evaluation-periode { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .evaluation-note { font-weight: 700; color: #EC4899; margin-bottom: 8px; font-size: 18px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.planifiee { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.realisee { background: #DCFCE7; color: #16A34A; }
    .statut-badge.annulee { background: #FEE2E2; color: #EF4444; }
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
    .objectifs-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 12px; }
    .objectifs-list { border: 1px solid #F3F4F6; border-radius: 8px; margin-bottom: 16px; }
    .objectif-item { display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid #F3F4F6; }
    .objectif-item:last-child { border-bottom: none; }
    .objectif-description { flex: 2; }
    .objectif-description input { width: 100%; padding: 6px; }
    .objectif-atteint { width: 80px; text-align: center; }
    .objectif-note { width: 100px; }
    .objectif-note input { width: 100%; padding: 6px; }
    .remove-objectif { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.6; }
    .remove-objectif:hover { opacity: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    .detail-section ul { margin-top: 8px; padding-left: 20px; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .evaluations-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } .objectif-item { flex-wrap: wrap; } .objectif-description { width: 100%; } .objectif-atteint, .objectif-note { width: auto; } }
  `]
})
export class Evaluations implements OnInit {
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  employes: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedEvaluation: Evaluation | null = null;
  evaluationToDelete: Evaluation | null = null;
  successMessage = '';

  currentEvaluation: Partial<Evaluation> = {
    reference: '',
    evaluateur: '',
    date_evaluation: new Date().toISOString().split('T')[0],
    periode: `${new Date().getFullYear()}-Q1`,
    note: 0,
    objectifs: [],
    statut: 'planifiee'
  };

  ngOnInit() {
    this.loadEmployes();
    this.loadEvaluations();
  }

  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }

  loadEvaluations() {
    const saved = localStorage.getItem('evaluations');
    this.evaluations = saved ? JSON.parse(saved) : [];
    this.filteredEvaluations = [...this.evaluations];
  }

  saveEvaluations() {
    localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
  }

  openForm() {
    this.currentEvaluation = {
      reference: this.generateReference(),
      evaluateur: '',
      date_evaluation: new Date().toISOString().split('T')[0],
      periode: `${new Date().getFullYear()}-Q1`,
      note: 0,
      objectifs: [],
      statut: 'planifiee'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.evaluations.length + 1;
    return `EVAL-${String(count).padStart(4, '0')}`;
  }

  onEmployeChange() {
    const employe = this.employes.find(e => e.id === this.currentEvaluation.employe_id);
    if (employe) {
      this.currentEvaluation.employe_nom = `${employe.nom} ${employe.prenom}`;
    }
  }

  addObjectif() {
    if (!this.currentEvaluation.objectifs) {
      this.currentEvaluation.objectifs = [];
    }
    this.currentEvaluation.objectifs.push({
      id: Date.now(),
      description: '',
      atteint: false,
      note: 0
    });
  }

  removeObjectif(index: number) {
    if (this.currentEvaluation.objectifs) {
      this.currentEvaluation.objectifs.splice(index, 1);
    }
  }

  saveEvaluation() {
    if (!this.currentEvaluation.employe_id || !this.currentEvaluation.evaluateur || !this.currentEvaluation.periode) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentEvaluation.id) {
      const index = this.evaluations.findIndex(e => e.id === this.currentEvaluation.id);
      if (index !== -1) {
        this.evaluations[index] = { ...this.currentEvaluation, updated_at: new Date().toISOString() } as Evaluation;
        this.showSuccess('Évaluation modifiée');
      }
    } else {
      this.evaluations.push({
        ...this.currentEvaluation,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Evaluation);
      this.showSuccess('Évaluation ajoutée');
    }
    this.saveEvaluations();
    this.filterEvaluations();
    this.cancelForm();
  }

  editEvaluation(e: Evaluation) {
    this.currentEvaluation = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  marquerRealisee(e: Evaluation) {
    e.statut = 'realisee';
    this.saveEvaluations();
    this.filterEvaluations();
    this.showSuccess('Évaluation marquée comme réalisée');
  }

  viewDetails(e: Evaluation) {
    this.selectedEvaluation = e;
    this.showDetailsModal = true;
  }

  confirmDelete(e: Evaluation) {
    this.evaluationToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEvaluation() {
    if (this.evaluationToDelete) {
      this.evaluations = this.evaluations.filter(e => e.id !== this.evaluationToDelete?.id);
      this.saveEvaluations();
      this.filterEvaluations();
      this.showDeleteModal = false;
      this.evaluationToDelete = null;
      this.showSuccess('Évaluation supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterEvaluations() {
    let filtered = [...this.evaluations];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.employe_nom?.toLowerCase().includes(term) ||
        e.evaluateur?.toLowerCase().includes(term) ||
        e.reference?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    this.filteredEvaluations = filtered;
  }

  getNoteMoyenne(): number {
    const realisees = this.evaluations.filter(e => e.statut === 'realisee');
    if (realisees.length === 0) return 0;
    const total = realisees.reduce((sum, e) => sum + (e.note || 0), 0);
    return total / realisees.length;
  }

  getRealisees(): number {
    return this.evaluations.filter(e => e.statut === 'realisee').length;
  }

  getObjectifsAtteints(e: Evaluation): number {
    return e.objectifs.filter(obj => obj.atteint).length;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      planifiee: '📅 Planifiée',
      realisee: '✅ Réalisée',
      annulee: '❌ Annulée'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}