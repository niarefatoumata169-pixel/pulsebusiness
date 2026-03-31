import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Formation {
  id?: number;
  reference: string;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  formateur: string;
  lieu: string;
  prix: number;
  participants: number[];
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="formations-container">
      <div class="header">
        <div>
          <h1>🎓 Gestion des formations</h1>
          <p class="subtitle">{{ formations.length }} formation(s) • {{ getParticipantsTotal() }} participant(s) total</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvelle formation</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="formations.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">🎓</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formations.length }}</span>
            <span class="kpi-label">Formations</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getParticipantsTotal() }}</span>
            <span class="kpi-label">Participants</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCoutTotal() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Coût total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTerminees() }}</span>
            <span class="kpi-label">Terminées</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="formations.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFormations()" placeholder="Rechercher par titre, formateur..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterFormations()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="planifiee">📅 Planifiée</option>
            <option value="en_cours">🔄 En cours</option>
            <option value="terminee">✅ Terminée</option>
            <option value="annulee">❌ Annulée</option>
          </select>
        </div>
      </div>

      <div class="formations-section" *ngIf="formations.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des formations</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredFormations.length }} / {{ formations.length }} affiché(s)</span>
          </div>
        </div>
        <div class="formations-grid">
          <div class="formation-card" *ngFor="let f of filteredFormations" [class]="f.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="formation-icon">🎓</div>
                <div class="formation-info">
                  <div class="formation-ref">{{ f.reference }}</div>
                  <div class="formation-titre">{{ f.titre }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">📅 Dates:</span>
                <span class="info-value">{{ f.date_debut | date:'dd/MM/yyyy' }} → {{ f.date_fin | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👨‍🏫 Formateur:</span>
                <span class="info-value">{{ f.formateur }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Lieu:</span>
                <span class="info-value">{{ f.lieu }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👥 Participants:</span>
                <span class="info-value">{{ f.participants.length }} personne(s)</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(f)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editFormation(f)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="gererParticipants(f)" title="Gérer participants">👥</button>
                <button class="action-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🎓</div>
          <h2>Aucune formation</h2>
          <p>Ajoutez votre première formation</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle formation</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} formation</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveFormation()">
              <div class="form-group">
                <label>Référence</label>
                <input type="text" [(ngModel)]="currentFormation.reference" readonly class="readonly">
              </div>
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentFormation.titre" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="currentFormation.description" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date début *</label>
                  <input type="date" [(ngModel)]="currentFormation.date_debut" required>
                </div>
                <div class="form-group">
                  <label>Date fin *</label>
                  <input type="date" [(ngModel)]="currentFormation.date_fin" required>
                </div>
              </div>
              <div class="form-group">
                <label>Formateur *</label>
                <input type="text" [(ngModel)]="currentFormation.formateur" required>
              </div>
              <div class="form-group">
                <label>Lieu *</label>
                <input type="text" [(ngModel)]="currentFormation.lieu" required>
              </div>
              <div class="form-group">
                <label>Coût (FCFA)</label>
                <input type="number" [(ngModel)]="currentFormation.prix" step="10000">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentFormation.statut">
                  <option value="planifiee">📅 Planifiée</option>
                  <option value="en_cours">🔄 En cours</option>
                  <option value="terminee">✅ Terminée</option>
                  <option value="annulee">❌ Annulée</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFormation.notes" rows="2"></textarea>
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
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedFormation">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de la formation - {{ selectedFormation.titre }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Référence:</strong> {{ selectedFormation.reference }}</p>
              <p><strong>Dates:</strong> {{ selectedFormation.date_debut | date:'dd/MM/yyyy' }} → {{ selectedFormation.date_fin | date:'dd/MM/yyyy' }}</p>
              <p><strong>Formateur:</strong> {{ selectedFormation.formateur }}</p>
              <p><strong>Lieu:</strong> {{ selectedFormation.lieu }}</p>
              <p><strong>Coût:</strong> {{ selectedFormation.prix | number }} FCFA</p>
              <p><strong>Statut:</strong> {{ getStatutLabel(selectedFormation.statut) }}</p>
              <p><strong>Participants:</strong> {{ selectedFormation.participants.length }} inscrit(s)</p>
              <p *ngIf="selectedFormation.description"><strong>Description:</strong> {{ selectedFormation.description }}</p>
              <p *ngIf="selectedFormation.notes"><strong>Notes:</strong> {{ selectedFormation.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal gestion participants -->
      <div class="modal-overlay" *ngIf="showParticipantsModal && currentFormationParticipants">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Gérer les participants - {{ currentFormationParticipants.titre }}</h3>
            <button class="modal-close" (click)="showParticipantsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Ajouter un employé</label>
              <select [(ngModel)]="newParticipantId">
                <option [value]="null">Sélectionner</option>
                <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
              </select>
              <button class="btn-add-small" (click)="addParticipant()">+ Ajouter</button>
            </div>
            <div class="participants-list">
              <h4>Participants inscrits ({{ currentFormationParticipants.participants.length }})</h4>
              <div *ngFor="let pId of currentFormationParticipants.participants">
                <div class="participant-item">
                  <span>{{ getEmployeNom(pId) }}</span>
                  <button class="remove-btn" (click)="removeParticipant(pId)">🗑️</button>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-primary" (click)="closeParticipantsModal()">Fermer</button>
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
            <p>Supprimer la formation <strong>{{ formationToDelete?.titre }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteFormation()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .formations-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary, .btn-add-small { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add-small { padding: 5px 12px; font-size: 12px; }
    .btn-add:hover, .btn-primary:hover, .btn-add-small:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
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
    .formations-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .formations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .formation-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .formation-card.planifiee { border-left-color: #3B82F6; }
    .formation-card.en_cours { border-left-color: #F59E0B; }
    .formation-card.terminee { border-left-color: #10B981; opacity: 0.9; }
    .formation-card.annulee { border-left-color: #EF4444; opacity: 0.7; }
    .formation-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .formation-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .formation-ref { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .formation-titre { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.planifiee { background: #DBEAFE; color: #1E40AF; }
    .statut-badge.en_cours { background: #FEF3C7; color: #D97706; }
    .statut-badge.terminee { background: #DCFCE7; color: #16A34A; }
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
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .participants-list { margin-top: 20px; }
    .participant-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #F3F4F6; }
    .remove-btn { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.6; }
    .remove-btn:hover { opacity: 1; }
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .formations-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } }
  `]
})
export class Formations implements OnInit {
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  employes: any[] = [];
  searchTerm = '';
  statutFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showParticipantsModal = false;
  editMode = false;
  selectedFormation: Formation | null = null;
  formationToDelete: Formation | null = null;
  currentFormationParticipants: Formation | null = null;
  newParticipantId: number | null = null;
  successMessage = '';

  currentFormation: Partial<Formation> = {
    reference: '',
    titre: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    formateur: '',
    lieu: '',
    prix: 0,
    participants: [],
    statut: 'planifiee'
  };

  ngOnInit() {
    this.loadEmployes();
    this.loadFormations();
  }

  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }

  loadFormations() {
    const saved = localStorage.getItem('formations');
    this.formations = saved ? JSON.parse(saved) : [];
    this.filteredFormations = [...this.formations];
  }

  saveFormations() {
    localStorage.setItem('formations', JSON.stringify(this.formations));
  }

  openForm() {
    this.currentFormation = {
      reference: this.generateReference(),
      titre: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      formateur: '',
      lieu: '',
      prix: 0,
      participants: [],
      statut: 'planifiee'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateReference(): string {
    const count = this.formations.length + 1;
    return `FORM-${String(count).padStart(4, '0')}`;
  }

  saveFormation() {
    if (!this.currentFormation.titre || !this.currentFormation.formateur || !this.currentFormation.lieu) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentFormation.id) {
      const index = this.formations.findIndex(f => f.id === this.currentFormation.id);
      if (index !== -1) {
        this.formations[index] = { ...this.currentFormation, updated_at: new Date().toISOString() } as Formation;
        this.showSuccess('Formation modifiée');
      }
    } else {
      this.formations.push({
        ...this.currentFormation,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Formation);
      this.showSuccess('Formation ajoutée');
    }
    this.saveFormations();
    this.filterFormations();
    this.cancelForm();
  }

  editFormation(f: Formation) {
    this.currentFormation = { ...f };
    this.editMode = true;
    this.showForm = true;
  }

  gererParticipants(f: Formation) {
    this.currentFormationParticipants = f;
    this.showParticipantsModal = true;
  }

  addParticipant() {
    if (this.currentFormationParticipants && this.newParticipantId) {
      if (!this.currentFormationParticipants.participants.includes(this.newParticipantId)) {
        this.currentFormationParticipants.participants.push(this.newParticipantId);
        this.saveFormations();
        this.showSuccess('Participant ajouté');
      }
      this.newParticipantId = null;
    }
  }

  removeParticipant(participantId: number) {
    if (this.currentFormationParticipants) {
      this.currentFormationParticipants.participants = this.currentFormationParticipants.participants.filter(p => p !== participantId);
      this.saveFormations();
      this.showSuccess('Participant retiré');
    }
  }

  getEmployeNom(id: number): string {
    const employe = this.employes.find(e => e.id === id);
    return employe ? `${employe.nom} ${employe.prenom}` : 'Inconnu';
  }

  closeParticipantsModal() {
    this.showParticipantsModal = false;
    this.currentFormationParticipants = null;
  }

  viewDetails(f: Formation) {
    this.selectedFormation = f;
    this.showDetailsModal = true;
  }

  confirmDelete(f: Formation) {
    this.formationToDelete = f;
    this.showDeleteModal = true;
  }

  deleteFormation() {
    if (this.formationToDelete) {
      this.formations = this.formations.filter(f => f.id !== this.formationToDelete?.id);
      this.saveFormations();
      this.filterFormations();
      this.showDeleteModal = false;
      this.formationToDelete = null;
      this.showSuccess('Formation supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterFormations() {
    let filtered = [...this.formations];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.titre?.toLowerCase().includes(term) ||
        f.formateur?.toLowerCase().includes(term) ||
        f.reference?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    this.filteredFormations = filtered;
  }

  getParticipantsTotal(): number {
    return this.formations.reduce((sum, f) => sum + (f.participants.length), 0);
  }

  getCoutTotal(): number {
    return this.formations.reduce((sum, f) => sum + (f.prix || 0), 0);
  }

  getTerminees(): number {
    return this.formations.filter(f => f.statut === 'terminee').length;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      planifiee: '📅 Planifiée',
      en_cours: '🔄 En cours',
      terminee: '✅ Terminée',
      annulee: '❌ Annulée'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}