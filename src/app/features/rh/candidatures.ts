import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Candidature {
  id?: number;
  reference: string;
  poste: string;
  candidat_nom: string;
  candidat_email: string;
  candidat_telephone?: string;
  date_candidature: string;
  statut: 'nouvelle' | 'en_cours' | 'entretien' | 'acceptee' | 'refusee';
  source?: string;
  cv_url?: string;
  lettre_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="candidatures-container">
      <div class="header">
        <div>
          <h1>📝 Gestion des candidatures</h1>
          <p class="subtitle">{{ candidatures.length }} candidature(s) • {{ getNouvelles() }} nouvelle(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvelle candidature</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="candidatures.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">📝</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ candidatures.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🆕</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getNouvelles() }}</span>
            <span class="kpi-label">Nouvelles</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🗣️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEnEntretien() }}</span>
            <span class="kpi-label">En entretien</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getAcceptees() }}</span>
            <span class="kpi-label">Acceptées</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="candidatures.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCandidatures()" placeholder="Rechercher par nom, poste..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterCandidatures()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="nouvelle">🆕 Nouvelle</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="entretien">🗣️ Entretien</option>
            <option value="acceptee">✅ Acceptée</option>
            <option value="refusee">❌ Refusée</option>
          </select>
        </div>
      </div>

      <div class="candidatures-section" *ngIf="candidatures.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des candidatures</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredCandidatures.length }} / {{ candidatures.length }} affiché(s)</span>
          </div>
        </div>
        <div class="candidatures-grid">
          <div class="candidature-card" *ngFor="let c of filteredCandidatures" [class]="c.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="candidature-icon">📝</div>
                <div class="candidature-info">
                  <div class="candidature-ref">{{ c.reference }}</div>
                  <div class="candidature-nom">{{ c.candidat_nom }}</div>
                  <div class="candidature-poste">{{ c.poste }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">{{ c.candidat_email }}</span>
              </div>
              <div class="info-row" *ngIf="c.candidat_telephone">
                <span class="info-label">📞 Tél:</span>
                <span class="info-value">{{ c.candidat_telephone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Candidature:</span>
                <span class="info-value">{{ c.date_candidature | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editCandidature(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="changerStatut(c, 'entretien')" *ngIf="c.statut !== 'entretien' && c.statut !== 'acceptee' && c.statut !== 'refusee'" title="Passer en entretien">🗣️</button>
                <button class="action-icon" (click)="changerStatut(c, 'acceptee')" *ngIf="c.statut !== 'acceptee' && c.statut !== 'refusee'" title="Accepter">✅</button>
                <button class="action-icon" (click)="changerStatut(c, 'refusee')" *ngIf="c.statut !== 'acceptee' && c.statut !== 'refusee'" title="Refuser">❌</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>Aucune candidature</h2>
          <p>Enregistrez votre première candidature</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle candidature</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} candidature</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCandidature()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentCandidature.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Poste *</label>
                <input type="text" [(ngModel)]="currentCandidature.poste" required>
              </div>
              <div class="form-group">
                <label>Nom du candidat *</label>
                <input type="text" [(ngModel)]="currentCandidature.candidat_nom" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="currentCandidature.candidat_email" required>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentCandidature.candidat_telephone">
              </div>
              <div class="form-group">
                <label>Date de candidature</label>
                <input type="date" [(ngModel)]="currentCandidature.date_candidature">
              </div>
              <div class="form-group">
                <label>Source (LinkedIn, site web...)</label>
                <input type="text" [(ngModel)]="currentCandidature.source">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentCandidature.statut">
                  <option value="nouvelle">🆕 Nouvelle</option>
                  <option value="en_cours">🔄 En cours</option>
                  <option value="entretien">🗣️ Entretien</option>
                  <option value="acceptee">✅ Acceptée</option>
                  <option value="refusee">❌ Refusée</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentCandidature.notes" rows="3"></textarea>
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
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedCandidature">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de la candidature - {{ selectedCandidature.reference }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Poste:</strong> {{ selectedCandidature.poste }}</p>
              <p><strong>Candidat:</strong> {{ selectedCandidature.candidat_nom }}</p>
              <p><strong>Email:</strong> {{ selectedCandidature.candidat_email }}</p>
              <p><strong>Téléphone:</strong> {{ selectedCandidature.candidat_telephone || '-' }}</p>
              <p><strong>Date:</strong> {{ selectedCandidature.date_candidature | date:'dd/MM/yyyy' }}</p>
              <p><strong>Source:</strong> {{ selectedCandidature.source || '-' }}</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedCandidature.statut) }}</p>
              <p *ngIf="selectedCandidature.notes"><strong>Notes:</strong> {{ selectedCandidature.notes }}</p>
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
            <p>Supprimer la candidature de <strong>{{ candidatureToDelete?.candidat_nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteCandidature()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidatures-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
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
    .candidatures-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .candidatures-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .candidature-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .candidature-card.nouvelle { border-left-color: #3B82F6; }
    .candidature-card.en_cours { border-left-color: #F59E0B; }
    .candidature-card.entretien { border-left-color: #8B5CF6; }
    .candidature-card.acceptee { border-left-color: #10B981; opacity: 0.9; }
    .candidature-card.refusee { border-left-color: #EF4444; opacity: 0.7; }
    .candidature-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .candidature-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .candidature-ref { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .candidature-nom { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .candidature-poste { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.nouvelle { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.en_cours { background: #FEF3C7; color: #D97706; }
    .statut-badge.entretien { background: #EDE9FE; color: #7C3AED; }
    .statut-badge.acceptee { background: #DCFCE7; color: #16A34A; }
    .statut-badge.refusee { background: #FEE2E2; color: #EF4444; }
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
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .candidatures-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } }
  `]
})
export class Candidatures implements OnInit {
  candidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editMode = false;
  selectedCandidature: Candidature | null = null;
  candidatureToDelete: Candidature | null = null;
  successMessage = '';

  currentCandidature: Partial<Candidature> = {
    reference: '',
    poste: '',
    candidat_nom: '',
    candidat_email: '',
    date_candidature: new Date().toISOString().split('T')[0],
    statut: 'nouvelle'
  };

  ngOnInit() {
    this.loadCandidatures();
  }

  loadCandidatures() {
    const saved = localStorage.getItem('candidatures');
    this.candidatures = saved ? JSON.parse(saved) : [];
    this.filteredCandidatures = [...this.candidatures];
  }

  saveCandidatures() {
    localStorage.setItem('candidatures', JSON.stringify(this.candidatures));
  }

  openForm() {
    this.currentCandidature = {
      reference: this.generateReference(),
      poste: '',
      candidat_nom: '',
      candidat_email: '',
      candidat_telephone: '',
      date_candidature: new Date().toISOString().split('T')[0],
      source: '',
      statut: 'nouvelle',
      notes: ''
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.candidatures.length + 1;
    return `CAND-${String(count).padStart(4, '0')}`;
  }

  saveCandidature() {
    if (!this.currentCandidature.poste || !this.currentCandidature.candidat_nom || !this.currentCandidature.candidat_email) {
      alert('Veuillez remplir tous les champs obligatoires (poste, nom, email)');
      return;
    }

    if (this.editMode && this.currentCandidature.id) {
      const index = this.candidatures.findIndex(c => c.id === this.currentCandidature.id);
      if (index !== -1) {
        this.candidatures[index] = { ...this.currentCandidature, updated_at: new Date().toISOString() } as Candidature;
        this.showSuccess('Candidature modifiée');
      }
    } else {
      this.candidatures.push({
        ...this.currentCandidature,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Candidature);
      this.showSuccess('Candidature ajoutée');
    }
    this.saveCandidatures();
    this.filterCandidatures();
    this.cancelForm();
  }

  editCandidature(c: Candidature) {
    this.currentCandidature = { ...c };
    this.editMode = true;
    this.showForm = true;
  }

  changerStatut(c: Candidature, nouveauStatut: string) {
    c.statut = nouveauStatut as any;
    this.saveCandidatures();
    this.filterCandidatures();
    this.showSuccess(`Statut changé en ${this.getStatutLabel(nouveauStatut)}`);
  }

  viewDetails(c: Candidature) {
    this.selectedCandidature = c;
    this.showDetailsModal = true;
  }

  confirmDelete(c: Candidature) {
    this.candidatureToDelete = c;
    this.showDeleteModal = true;
  }

  deleteCandidature() {
    if (this.candidatureToDelete) {
      this.candidatures = this.candidatures.filter(c => c.id !== this.candidatureToDelete?.id);
      this.saveCandidatures();
      this.filterCandidatures();
      this.showDeleteModal = false;
      this.candidatureToDelete = null;
      this.showSuccess('Candidature supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterCandidatures() {
    let filtered = [...this.candidatures];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.candidat_nom?.toLowerCase().includes(term) ||
        c.poste?.toLowerCase().includes(term) ||
        c.reference?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    this.filteredCandidatures = filtered;
  }

  getNouvelles(): number {
    return this.candidatures.filter(c => c.statut === 'nouvelle').length;
  }

  getEnEntretien(): number {
    return this.candidatures.filter(c => c.statut === 'entretien').length;
  }

  getAcceptees(): number {
    return this.candidatures.filter(c => c.statut === 'acceptee').length;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      nouvelle: '🆕 Nouvelle',
      en_cours: '🔄 En cours',
      entretien: '🗣️ Entretien',
      acceptee: '✅ Acceptée',
      refusee: '❌ Refusée'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}