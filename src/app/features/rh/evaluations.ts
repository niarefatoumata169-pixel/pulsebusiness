import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Evaluation {
  id?: number;
  employe_id: number;
  employe_nom?: string;
  evaluateur: string;
  date: string;
  type: 'annuelle' | 'semestrielle' | 'trimestrielle' | 'projet';
  periode_debut: string;
  periode_fin: string;
  criteres: CriteresEvaluation;
  commentaire?: string;
  recommandations?: string;
  statut: 'brouillon' | 'finalisee' | 'approuvee';
  date_validation?: string;
  validee_par?: string;
}

interface CriteresEvaluation {
  qualite_travail: number;
  productivite: number;
  ponctualite: number;
  travail_equipe: number;
  communication: number;
  initiative: number;
  respect_delais: number;
  adaptabilite: number;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="evaluations-container">
      <div class="header">
        <div>
          <h1>Évaluations</h1>
          <p class="subtitle">{{ evaluations.length }} évaluation(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle évaluation</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} évaluation</h3>
        <form (ngSubmit)="saveEvaluation()" #evaluationForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'criteres'" (click)="activeTab = 'criteres'">Critères</button>
            <button type="button" [class.active]="activeTab === 'commentaires'" (click)="activeTab = 'commentaires'">Commentaires</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Employé *</label>
                <select [(ngModel)]="currentEvaluation.employe_id" name="employe_id" required (change)="onEmployeChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Évaluateur</label>
                <input type="text" [(ngModel)]="currentEvaluation.evaluateur" name="evaluateur">
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="currentEvaluation.date" name="date">
              </div>
              <div class="form-group">
                <label>Type</label>
                <select [(ngModel)]="currentEvaluation.type" name="type">
                  <option value="annuelle">Annuelle</option>
                  <option value="semestrielle">Semestrielle</option>
                  <option value="trimestrielle">Trimestrielle</option>
                  <option value="projet">Fin de projet</option>
                </select>
              </div>
              <div class="form-group">
                <label>Période début</label>
                <input type="date" [(ngModel)]="currentEvaluation.periode_debut" name="periode_debut">
              </div>
              <div class="form-group">
                <label>Période fin</label>
                <input type="date" [(ngModel)]="currentEvaluation.periode_fin" name="periode_fin">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEvaluation.statut" name="statut">
                  <option value="brouillon">Brouillon</option>
                  <option value="finalisee">Finalisée</option>
                  <option value="approuvee">Approuvée</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'criteres'" class="tab-content">
            <div class="criteres-grid">
              <div class="critere-item">
                <label>Qualité du travail</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.qualite_travail" name="qualite_travail" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.qualite_travail }}/5</span>
              </div>
              <div class="critere-item">
                <label>Productivité</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.productivite" name="productivite" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.productivite }}/5</span>
              </div>
              <div class="critere-item">
                <label>Ponctualité</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.ponctualite" name="ponctualite" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.ponctualite }}/5</span>
              </div>
              <div class="critere-item">
                <label>Travail en équipe</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.travail_equipe" name="travail_equipe" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.travail_equipe }}/5</span>
              </div>
              <div class="critere-item">
                <label>Communication</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.communication" name="communication" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.communication }}/5</span>
              </div>
              <div class="critere-item">
                <label>Initiative</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.initiative" name="initiative" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.initiative }}/5</span>
              </div>
              <div class="critere-item">
                <label>Respect des délais</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.respect_delais" name="respect_delais" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.respect_delais }}/5</span>
              </div>
              <div class="critere-item">
                <label>Adaptabilité</label>
                <input type="range" [(ngModel)]="currentEvaluation.criteres.adaptabilite" name="adaptabilite" min="1" max="5" step="0.5">
                <span class="critere-valeur">{{ currentEvaluation.criteres.adaptabilite }}/5</span>
              </div>
            </div>
            <div class="moyenne-section">
              <strong>Moyenne générale:</strong> {{ calculerMoyenne() }}/5
            </div>
          </div>
          <div *ngIf="activeTab === 'commentaires'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Commentaires</label>
                <textarea [(ngModel)]="currentEvaluation.commentaire" name="commentaire" rows="6"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Recommandations</label>
                <textarea [(ngModel)]="currentEvaluation.recommandations" name="recommandations" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="evaluationForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="evaluations.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEvaluations()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterEvaluations()" class="filter-select">
          <option value="">Tous types</option>
          <option value="annuelle">Annuelle</option>
          <option value="semestrielle">Semestrielle</option>
          <option value="trimestrielle">Trimestrielle</option>
          <option value="projet">Projet</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterEvaluations()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="finalisee">Finalisée</option>
          <option value="approuvee">Approuvée</option>
        </select>
      </div>
      <div class="table-container" *ngIf="evaluations.length > 0; else emptyState">
        <table class="evaluations-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employé</th>
              <th>Évaluateur</th>
              <th>Type</th>
              <th>Moyenne</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredEvaluations">
              <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ e.employe_nom }}</td>
              <td>{{ e.evaluateur }}</td>
              <td>{{ getTypeLabel(e.type) }}</td>
              <td>{{ calculerMoyennePour(e) }}/5</td>
              <td><span class="badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="viewDetails(e)" title="Voir">👁️</button>
                <button class="btn-icon" (click)="editEvaluation(e)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h2>Aucune évaluation</h2>
          <p>Créez votre première évaluation</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle évaluation</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Évaluation de {{ selectedEvaluation?.employe_nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEvaluation">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations</h4>
                <p><strong>Employé:</strong> {{ selectedEvaluation.employe_nom }}</p>
                <p><strong>Évaluateur:</strong> {{ selectedEvaluation.evaluateur }}</p>
                <p><strong>Date:</strong> {{ selectedEvaluation.date | date }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedEvaluation.type) }}</p>
                <p><strong>Période:</strong> {{ selectedEvaluation.periode_debut | date }} au {{ selectedEvaluation.periode_fin | date }}</p>
              </div>
              <div class="detail-section">
                <h4>Résultats</h4>
                <p><strong>Qualité travail:</strong> {{ selectedEvaluation.criteres.qualite_travail }}/5</p>
                <p><strong>Productivité:</strong> {{ selectedEvaluation.criteres.productivite }}/5</p>
                <p><strong>Ponctualité:</strong> {{ selectedEvaluation.criteres.ponctualite }}/5</p>
                <p><strong>Travail équipe:</strong> {{ selectedEvaluation.criteres.travail_equipe }}/5</p>
                <p><strong>Communication:</strong> {{ selectedEvaluation.criteres.communication }}/5</p>
                <p><strong>Initiative:</strong> {{ selectedEvaluation.criteres.initiative }}/5</p>
                <p><strong>Respect délais:</strong> {{ selectedEvaluation.criteres.respect_delais }}/5</p>
                <p><strong>Adaptabilité:</strong> {{ selectedEvaluation.criteres.adaptabilite }}/5</p>
                <p class="moyenne"><strong>Moyenne:</strong> {{ calculerMoyennePour(selectedEvaluation) }}/5</p>
              </div>
              <div class="detail-section full-width">
                <h4>Commentaires</h4>
                <p>{{ selectedEvaluation.commentaire || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Recommandations</h4>
                <p>{{ selectedEvaluation.recommandations || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer cette évaluation ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEvaluation()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .evaluations-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    input, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    textarea { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; min-height: 100px; }
    .criteres-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .critere-item { display: flex; align-items: center; gap: 10px; }
    .critere-item label { flex: 2; }
    .critere-item input { flex: 3; }
    .critere-valeur { flex: 1; text-align: right; font-weight: 600; color: #EC4899; }
    .moyenne-section { margin-top: 20px; padding: 15px; background: #FDF2F8; border-radius: 8px; text-align: center; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .evaluations-table { width: 100%; border-collapse: collapse; }
    .evaluations-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .evaluations-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.brouillon { background: #9CA3AF; color: white; }
    .badge.finalisee { background: #10B981; color: white; }
    .badge.approuvee { background: #EC4899; color: white; }
    .actions { display: flex; gap: 8px; }
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
    .moyenne { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Evaluations implements OnInit {
  employes: any[] = [];
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  selectedEvaluation: Evaluation | null = null;
  currentEvaluation: any = {
    employe_id: '',
    evaluateur: '',
    date: new Date().toISOString().split('T')[0],
    type: 'annuelle',
    periode_debut: new Date().toISOString().split('T')[0],
    periode_fin: new Date().toISOString().split('T')[0],
    criteres: {
      qualite_travail: 3,
      productivite: 3,
      ponctualite: 3,
      travail_equipe: 3,
      communication: 3,
      initiative: 3,
      respect_delais: 3,
      adaptabilite: 3
    },
    commentaire: '',
    recommandations: '',
    statut: 'brouillon'
  };
  activeTab = 'info';
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  evaluationToDelete: Evaluation | null = null;
  successMessage = '';
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
  onEmployeChange() {
    const employe = this.employes.find(e => e.id === this.currentEvaluation.employe_id);
    if (employe) {
      this.currentEvaluation.employe_nom = `${employe.nom} ${employe.prenom}`;
    }
  }
  saveEvaluation() {
    const employe = this.employes.find(e => e.id === this.currentEvaluation.employe_id);
    if (this.editMode) {
      const index = this.evaluations.findIndex(e => e.id === this.currentEvaluation.id);
      if (index !== -1) {
        this.evaluations[index] = { 
          ...this.currentEvaluation, 
          employe_nom: employe ? `${employe.nom} ${employe.prenom}` : ''
        };
        this.showSuccess('Évaluation modifiée !');
      }
    } else {
      const newEvaluation = { 
        ...this.currentEvaluation, 
        id: Date.now(),
        employe_nom: employe ? `${employe.nom} ${employe.prenom}` : ''
      };
      this.evaluations.push(newEvaluation);
      this.showSuccess('Évaluation ajoutée !');
    }
    localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
    this.filterEvaluations();
    this.cancelForm();
  }
  editEvaluation(e: Evaluation) {
    this.currentEvaluation = { ...e };
    this.editMode = true;
    this.showForm = true;
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
      localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
      this.filterEvaluations();
      this.showDeleteModal = false;
      this.evaluationToDelete = null;
      this.showSuccess('Évaluation supprimée !');
    }
  }
  cancelForm() {
    this.currentEvaluation = {
      employe_id: '',
      evaluateur: '',
      date: new Date().toISOString().split('T')[0],
      type: 'annuelle',
      periode_debut: new Date().toISOString().split('T')[0],
      periode_fin: new Date().toISOString().split('T')[0],
      criteres: {
        qualite_travail: 3,
        productivite: 3,
        ponctualite: 3,
        travail_equipe: 3,
        communication: 3,
        initiative: 3,
        respect_delais: 3,
        adaptabilite: 3
      },
      commentaire: '',
      recommandations: '',
      statut: 'brouillon'
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterEvaluations() {
    let filtered = this.evaluations;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.employe_nom?.toLowerCase().includes(term) ||
        e.evaluateur?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(e => e.type === this.typeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    this.filteredEvaluations = filtered;
  }
  calculerMoyenne(): number {
    const c = this.currentEvaluation.criteres;
    const somme = c.qualite_travail + c.productivite + c.ponctualite + c.travail_equipe + 
                  c.communication + c.initiative + c.respect_delais + c.adaptabilite;
    return Math.round((somme / 8) * 10) / 10;
  }
  calculerMoyennePour(e: Evaluation): number {
    if (!e.criteres) return 0;
    const c = e.criteres;
    const somme = c.qualite_travail + c.productivite + c.ponctualite + c.travail_equipe + 
                  c.communication + c.initiative + c.respect_delais + c.adaptabilite;
    return Math.round((somme / 8) * 10) / 10;
  }
  getTypeLabel(type: string): string {
    const labels: any = { annuelle: 'Annuelle', semestrielle: 'Semestrielle', trimestrielle: 'Trimestrielle', projet: 'Projet' };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: 'Brouillon', finalisee: 'Finalisée', approuvee: 'Approuvée' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
