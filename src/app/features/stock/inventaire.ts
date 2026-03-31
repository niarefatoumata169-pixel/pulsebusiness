import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ArticleInventaire {
  id: number;
  code: string;
  designation: string;
  emplacement: string;
  quantite_theorique: number;
  quantite_reelle: number;
  ecart: number;
  statut: 'ok' | 'ecart' | 'manquant' | 'excedent';
}

interface SessionInventaire {
  id: number;
  reference: string;
  date_debut: string;
  date_fin?: string;
  statut: 'en_cours' | 'termine' | 'annule';
  responsable: string;
  articles: ArticleInventaire[];
  created_at: string;
}

@Component({
  selector: 'app-inventaire',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="inventaire-container">
      <div class="header">
        <div>
          <h1>📦 Gestion des inventaires</h1>
          <p class="subtitle">{{ sessions.length }} session(s) • {{ getSessionsEnCours() }} en cours</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvel inventaire</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <!-- Liste des sessions -->
      <div class="sessions-section" *ngIf="sessions.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Sessions d'inventaire</h2>
        </div>

        <div class="sessions-grid">
          <div class="session-card" *ngFor="let s of sessions" [class]="s.statut">
            <div class="card-header">
              <div class="session-ref">{{ s.reference }}</div>
              <div class="session-statut">{{ getStatutLabel(s.statut) }}</div>
            </div>
            <div class="card-body">
              <p>📅 {{ s.date_debut | date:'dd/MM/yyyy' }}</p>
              <p>👤 {{ s.responsable }}</p>
              <p>📦 {{ s.articles.length || 0 }} articles comptés</p>
            </div>
            <div class="card-footer">
              <button class="btn-icon" (click)="viewDetails(s)">👁️ Détails</button>
              <button class="btn-icon" (click)="editSession(s)">✏️ Modifier</button>
              <button class="btn-icon delete" (click)="confirmDelete(s)">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedSession">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedSession.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations</h4>
                <p><strong>Date début:</strong> {{ selectedSession.date_debut | date:'dd/MM/yyyy' }}</p>
                <p><strong>Date fin:</strong> {{ selectedSession.date_fin | date:'dd/MM/yyyy' || '-' }}</p>
                <p><strong>Responsable:</strong> {{ selectedSession.responsable }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedSession.statut) }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Articles comptés</h4>
                <ng-container *ngIf="selectedSession.articles as articles">
                  <div *ngIf="articles.length > 0; else noItems">
                    <table class="details-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Désignation</th>
                          <th>Emplacement</th>
                          <th>Théorique</th>
                          <th>Réel</th>
                          <th>Écart</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let a of articles">
                          <td>{{ a.code }}</td>
                          <td>{{ a.designation }}</td>
                          <td>{{ a.emplacement }}</td>
                          <td class="text-right">{{ a.quantite_theorique }}</td>
                          <td class="text-right">{{ a.quantite_reelle }}</td>
                          <td class="text-right" [class.ecart]="a.ecart !== 0">{{ a.ecart }}</td>
                          <td>{{ getArticleStatutLabel(a.statut) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <ng-template #noItems>
                    <p>Aucun article dans cette session.</p>
                  </ng-template>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal && sessionToDelete">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer la session <strong>{{ sessionToDelete.reference }}</strong> ?</p>
            <ng-container *ngIf="sessionToDelete.articles as items">
              <div *ngIf="items.length > 0">
                <p class="warning">La session contient {{ items.length }} comptage(s) qui seront supprimés.</p>
              </div>
            </ng-container>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteSession()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal formulaire (simplifié) -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel inventaire' }}</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveSession()">
              <div class="form-group">
                <label>Référence *</label>
                <input type="text" [(ngModel)]="currentSession.reference" readonly>
              </div>
              <div class="form-group">
                <label>Date début</label>
                <input type="date" [(ngModel)]="currentSession.date_debut">
              </div>
              <div class="form-group">
                <label>Responsable</label>
                <input type="text" [(ngModel)]="currentSession.responsable">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentSession.statut">
                  <option value="en_cours">🔄 En cours</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="annule">❌ Annulé</option>
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

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucune session d'inventaire</h2>
          <p>Créez votre premier inventaire</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel inventaire</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .inventaire-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .sessions-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .sessions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .session-card { background: #F9FAFB; border-radius: 12px; padding: 16px; border-left: 4px solid; transition: 0.2s; }
    .session-card.en_cours { border-left-color: #3B82F6; }
    .session-card.termine { border-left-color: #10B981; opacity: 0.8; }
    .session-card.annule { border-left-color: #EF4444; opacity: 0.7; }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .session-ref { font-weight: 600; font-family: monospace; }
    .session-statut { font-size: 12px; padding: 2px 8px; border-radius: 20px; background: #F3F4F6; }
    .card-body p { margin: 8px 0; font-size: 13px; }
    .card-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 4px 12px; cursor: pointer; font-size: 12px; }
    .btn-icon:hover { background: #FEF3F9; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 1000px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section.full-width { grid-column: span 2; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table th, .details-table td { padding: 8px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .details-table th { background: #F9FAFB; font-weight: 600; color: #6B7280; }
    .text-right { text-align: right; }
    .ecart { color: #EF4444; font-weight: bold; }
    .warning { color: #EF4444; font-size: 12px; margin-top: 8px; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    @media (max-width: 768px) { .details-grid { grid-template-columns: 1fr; } .detail-section.full-width { grid-column: span 1; } }
  `]
})
export class Inventaire implements OnInit {
  sessions: SessionInventaire[] = [];
  selectedSession: SessionInventaire | null = null;
  sessionToDelete: SessionInventaire | null = null;
  showDetailsModal = false;
  showDeleteModal = false;
  showForm = false;
  editMode = false;
  successMessage = '';

  currentSession: Partial<SessionInventaire> = {
    reference: '',
    date_debut: new Date().toISOString().split('T')[0],
    responsable: '',
    statut: 'en_cours',
    articles: []
  };

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    const saved = localStorage.getItem('inventaire_sessions');
    this.sessions = saved ? JSON.parse(saved) : [];
  }

  saveSessions() {
    localStorage.setItem('inventaire_sessions', JSON.stringify(this.sessions));
  }

  openForm() {
    this.currentSession = {
      reference: this.generateReference(),
      date_debut: new Date().toISOString().split('T')[0],
      responsable: '',
      statut: 'en_cours',
      articles: []
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.sessions.length + 1;
    return `INV-${String(count).padStart(4, '0')}`;
  }

  saveSession() {
    if (this.editMode && this.currentSession.id) {
      const index = this.sessions.findIndex(s => s.id === this.currentSession.id);
      if (index !== -1) {
        this.sessions[index] = { ...this.currentSession, updated_at: new Date().toISOString() } as SessionInventaire;
        this.showSuccess('Session modifiée');
      }
    } else {
      this.sessions.push({
        ...this.currentSession,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as SessionInventaire);
      this.showSuccess('Session ajoutée');
    }
    this.saveSessions();
    this.cancelForm();
  }

  editSession(s: SessionInventaire) {
    this.currentSession = { ...s };
    this.editMode = true;
    this.showForm = true;
  }

  viewDetails(s: SessionInventaire) {
    this.selectedSession = s;
    this.showDetailsModal = true;
  }

  confirmDelete(s: SessionInventaire) {
    this.sessionToDelete = s;
    this.showDeleteModal = true;
  }

  deleteSession() {
    if (this.sessionToDelete) {
      this.sessions = this.sessions.filter(s => s.id !== this.sessionToDelete?.id);
      this.saveSessions();
      this.showDeleteModal = false;
      this.sessionToDelete = null;
      this.showSuccess('Session supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  getSessionsEnCours(): number {
    return this.sessions.filter(s => s.statut === 'en_cours').length;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      en_cours: '🔄 En cours',
      termine: '✅ Terminé',
      annule: '❌ Annulé'
    };
    return labels[statut] || statut;
  }

  getArticleStatutLabel(statut: string): string {
    const labels: any = {
      ok: '✅ OK',
      ecart: '⚠️ Écart',
      manquant: '❌ Manquant',
      excedent: '📈 Excédent'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}