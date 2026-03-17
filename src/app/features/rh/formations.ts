import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Formation {
  id?: number;
  titre: string;
  theme: string;
  formateur: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  lieu: string;
  participants: number[];
  cout: number;
  objectifs: string;
  programme: string;
  prerequis: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  evaluation?: number;
  notes?: string;
}

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="formations-container">
      <div class="header">
        <div>
          <h1>Formations</h1>
          <p class="subtitle">{{ formations.length }} formation(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle formation</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} formation</h3>
        <form (ngSubmit)="saveFormation()" #formationForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'contenu'" (click)="activeTab = 'contenu'">Contenu</button>
            <button type="button" [class.active]="activeTab === 'participants'" (click)="activeTab = 'participants'">Participants</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentFormation.titre" name="titre" required>
              </div>
              <div class="form-group">
                <label>Thème</label>
                <select [(ngModel)]="currentFormation.theme" name="theme">
                  <option value="">Sélectionner</option>
                  <option value="technique">Technique</option>
                  <option value="management">Management</option>
                  <option value="securite">Sécurité</option>
                  <option value="qualite">Qualité</option>
                  <option value="langues">Langues</option>
                  <option value="informatique">Informatique</option>
                </select>
              </div>
              <div class="form-group">
                <label>Formateur</label>
                <input type="text" [(ngModel)]="currentFormation.formateur" name="formateur">
              </div>
              <div class="form-group">
                <label>Date début *</label>
                <input type="date" [(ngModel)]="currentFormation.date_debut" name="date_debut" required>
              </div>
              <div class="form-group">
                <label>Date fin *</label>
                <input type="date" [(ngModel)]="currentFormation.date_fin" name="date_fin" required>
              </div>
              <div class="form-group">
                <label>Durée (heures)</label>
                <input type="number" [(ngModel)]="currentFormation.duree" name="duree" min="1">
              </div>
              <div class="form-group">
                <label>Lieu</label>
                <input type="text" [(ngModel)]="currentFormation.lieu" name="lieu">
              </div>
              <div class="form-group">
                <label>Coût (FCFA)</label>
                <input type="number" [(ngModel)]="currentFormation.cout" name="cout" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentFormation.statut" name="statut">
                  <option value="planifiee">Planifiée</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                  <option value="annulee">Annulée</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'contenu'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Objectifs</label>
                <textarea [(ngModel)]="currentFormation.objectifs" name="objectifs" rows="4" placeholder="Objectifs de la formation..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Programme</label>
                <textarea [(ngModel)]="currentFormation.programme" name="programme" rows="6" placeholder="Détail du programme..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Prérequis</label>
                <textarea [(ngModel)]="currentFormation.prerequis" name="prerequis" rows="3" placeholder="Prérequis nécessaires..."></textarea>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'participants'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Participants</label>
                <select multiple [(ngModel)]="currentFormation.participants" name="participants" class="multi-select">
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }} - {{ e.poste }}</option>
                </select>
                <small>Maintenir Ctrl pour sélectionner plusieurs</small>
              </div>
              <div class="form-group" *ngIf="currentFormation.statut === 'terminee'">
                <label>Évaluation (/10)</label>
                <input type="number" [(ngModel)]="currentFormation.evaluation" name="evaluation" min="0" max="10" step="0.5">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFormation.notes" name="notes" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="formationForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="formations.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterFormations()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="themeFilter" (ngModelChange)="filterFormations()" class="filter-select">
          <option value="">Tous thèmes</option>
          <option value="technique">Technique</option>
          <option value="management">Management</option>
          <option value="securite">Sécurité</option>
          <option value="qualite">Qualité</option>
          <option value="langues">Langues</option>
          <option value="informatique">Informatique</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterFormations()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>
      <div class="formations-grid" *ngIf="formations.length > 0; else emptyState">
        <div class="formation-card" *ngFor="let f of filteredFormations">
          <div class="formation-header">
            <span class="formation-titre">{{ f.titre }}</span>
            <span class="formation-badge" [class]="f.statut">{{ getStatutLabel(f.statut) }}</span>
          </div>
          <div class="formation-body">
            <p><strong>Thème:</strong> {{ f.theme }}</p>
            <p><strong>Dates:</strong> {{ f.date_debut | date }} au {{ f.date_fin | date }}</p>
            <p><strong>Formateur:</strong> {{ f.formateur }}</p>
            <p><strong>Participants:</strong> {{ f.participants.length || 0 }}</p>
            <p><strong>Coût:</strong> {{ f.cout | number }} FCFA</p>
            <p *ngIf="f.evaluation"><strong>Évaluation:</strong> {{ f.evaluation }}/10</p>
          </div>
          <div class="formation-actions">
            <button class="btn-icon" (click)="viewDetails(f)" title="Voir détails">👁️</button>
            <button class="btn-icon" (click)="editFormation(f)" title="Modifier">✏️</button>
            <button class="btn-icon delete" (click)="confirmDelete(f)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🎓</div>
          <h2>Aucune formation</h2>
          <p>Ajoutez votre première formation</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle formation</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedFormation?.titre }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedFormation">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations</h4>
                <p><strong>Thème:</strong> {{ selectedFormation.theme }}</p>
                <p><strong>Formateur:</strong> {{ selectedFormation.formateur }}</p>
                <p><strong>Lieu:</strong> {{ selectedFormation.lieu }}</p>
                <p><strong>Dates:</strong> {{ selectedFormation.date_debut | date }} au {{ selectedFormation.date_fin | date }}</p>
                <p><strong>Durée:</strong> {{ selectedFormation.duree }} heures</p>
                <p><strong>Coût:</strong> {{ selectedFormation.cout | number }} FCFA</p>
              </div>
              <div class="detail-section">
                <h4>Objectifs</h4>
                <p>{{ selectedFormation.objectifs || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Programme</h4>
                <p>{{ selectedFormation.programme || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Prérequis</h4>
                <p>{{ selectedFormation.prerequis || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Participants</h4>
                <ul>
                  <li *ngFor="let p of getParticipantsNames(selectedFormation.participants)">{{ p }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer la formation <strong>{{ formationToDelete?.titre }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteFormation()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .formations-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .multi-select { height: 100px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .formations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .formation-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .formation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .formation-titre { font-weight: 600; color: #1F2937; }
    .formation-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .formation-badge.planifiee { background: #F59E0B; color: white; }
    .formation-badge.en_cours { background: #10B981; color: white; }
    .formation-badge.terminee { background: #6B7280; color: white; }
    .formation-badge.annulee { background: #EF4444; color: white; }
    .formation-body p { margin: 5px 0; color: #6B7280; }
    .formation-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Formations implements OnInit {
  employes: any[] = [];
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  selectedFormation: Formation | null = null;
  currentFormation: any = {
    titre: '',
    theme: '',
    formateur: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    duree: 1,
    lieu: '',
    participants: [],
    cout: 0,
    objectifs: '',
    programme: '',
    prerequis: '',
    statut: 'planifiee',
    evaluation: null,
    notes: ''
  };
  activeTab = 'info';
  searchTerm = '';
  themeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  formationToDelete: Formation | null = null;
  successMessage = '';
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
  saveFormation() {
    if (this.editMode) {
      const index = this.formations.findIndex(f => f.id === this.currentFormation.id);
      if (index !== -1) {
        this.formations[index] = { ...this.currentFormation };
        this.showSuccess('Formation modifiée !');
      }
    } else {
      const newFormation = { ...this.currentFormation, id: Date.now() };
      this.formations.push(newFormation);
      this.showSuccess('Formation ajoutée !');
    }
    localStorage.setItem('formations', JSON.stringify(this.formations));
    this.filterFormations();
    this.cancelForm();
  }
  editFormation(f: Formation) {
    this.currentFormation = { ...f };
    this.editMode = true;
    this.showForm = true;
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
      localStorage.setItem('formations', JSON.stringify(this.formations));
      this.filterFormations();
      this.showDeleteModal = false;
      this.formationToDelete = null;
      this.showSuccess('Formation supprimée !');
    }
  }
  cancelForm() {
    this.currentFormation = {
      titre: '',
      theme: '',
      formateur: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date().toISOString().split('T')[0],
      duree: 1,
      lieu: '',
      participants: [],
      cout: 0,
      objectifs: '',
      programme: '',
      prerequis: '',
      statut: 'planifiee',
      evaluation: null,
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterFormations() {
    let filtered = this.formations;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.titre?.toLowerCase().includes(term) ||
        f.formateur?.toLowerCase().includes(term) ||
        f.theme?.toLowerCase().includes(term)
      );
    }
    if (this.themeFilter) {
      filtered = filtered.filter(f => f.theme === this.themeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(f => f.statut === this.statutFilter);
    }
    this.filteredFormations = filtered;
  }
  getParticipantsNames(participantIds: number[]): string[] {
    if (!participantIds) return [];
    return participantIds.map(id => {
      const emp = this.employes.find(e => e.id === id);
      return emp ? `${emp.nom} ${emp.prenom}` : '';
    }).filter(n => n);
  }
  getStatutLabel(statut: string): string {
    const labels: any = { planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
