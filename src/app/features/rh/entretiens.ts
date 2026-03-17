import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Entretien {
  id?: number;
  candidature_id?: number;
  candidat_nom?: string;
  candidat_prenom?: string;
  date: string;
  heure: string;
  duree: number;
  type: 'presentiel' | 'visio' | 'telephone';
  lieu?: string;
  lien_visio?: string;
  intervieweurs: string[];
  poste: string;
  statut: 'planifie' | 'confirme' | 'realise' | 'annule' | 'reporte';
  compte_rendu?: string;
  evaluation?: number;
  notes?: string;
}

@Component({
  selector: 'app-entretiens',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="entretiens-container">
      <div class="header">
        <div>
          <h1>Entretiens</h1>
          <p class="subtitle">{{ entretiens.length }} entretien(s) planifié(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Planifier un entretien</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} entretien</h3>
        <form (ngSubmit)="saveEntretien()" #entretienForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Candidat *</label>
              <select [(ngModel)]="currentEntretien.candidature_id" name="candidature_id" required (change)="onCandidatChange()">
                <option value="">Sélectionner un candidat</option>
                <option *ngFor="let c of candidatures" [value]="c.id">{{ c.nom }} {{ c.prenom }} - {{ c.poste }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentEntretien.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Heure *</label>
              <input type="time" [(ngModel)]="currentEntretien.heure" name="heure" required>
            </div>
            <div class="form-group">
              <label>Durée (minutes)</label>
              <input type="number" [(ngModel)]="currentEntretien.duree" name="duree" min="15" step="15">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="currentEntretien.type" name="type">
                <option value="presentiel">Présentiel</option>
                <option value="visio">Visio</option>
                <option value="telephone">Téléphone</option>
              </select>
            </div>
            <div class="form-group" *ngIf="currentEntretien.type === 'presentiel'">
              <label>Lieu</label>
              <input type="text" [(ngModel)]="currentEntretien.lieu" name="lieu">
            </div>
            <div class="form-group" *ngIf="currentEntretien.type === 'visio'">
              <label>Lien visio</label>
              <input type="url" [(ngModel)]="currentEntretien.lien_visio" name="lien_visio">
            </div>
            <div class="form-group">
              <label>Poste</label>
              <input type="text" [(ngModel)]="currentEntretien.poste" name="poste" readonly>
            </div>
            <div class="form-group full-width">
              <label>Intervieweurs</label>
              <div *ngFor="let i of currentEntretien.intervieweurs; let idx = index" class="ligne-form">
                <input type="text" [(ngModel)]="currentEntretien.intervieweurs[idx]" [name]="'intervieweur_' + idx" placeholder="Nom de l'intervieweur">
                <button type="button" class="btn-remove" (click)="removeIntervieweur(idx)">✕</button>
              </div>
              <button type="button" class="btn-add-ligne" (click)="addIntervieweur()">+ Ajouter un intervieweur</button>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentEntretien.statut" name="statut">
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="realise">Réalisé</option>
                <option value="annule">Annulé</option>
                <option value="reporte">Reporté</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Compte rendu</label>
              <textarea [(ngModel)]="currentEntretien.compte_rendu" name="compte_rendu" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>Évaluation (/10)</label>
              <input type="number" [(ngModel)]="currentEntretien.evaluation" name="evaluation" min="0" max="10" step="0.5">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentEntretien.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="entretienForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Calendrier / Liste -->
      <div class="view-tabs">
        <button [class.active]="viewMode === 'liste'" (click)="viewMode = 'liste'">Liste</button>
        <button [class.active]="viewMode === 'semaine'" (click)="viewMode = 'semaine'">Semaine</button>
      </div>

      <!-- Vue Liste -->
      <div *ngIf="viewMode === 'liste'">
        <!-- Filtres -->
        <div class="filters-bar" *ngIf="entretiens.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTerm" (ngModelChange)="filterEntretiens()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterEntretiens()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="planifie">Planifié</option>
            <option value="confirme">Confirmé</option>
            <option value="realise">Réalisé</option>
            <option value="annule">Annulé</option>
            <option value="reporte">Reporté</option>
          </select>
          <input type="date" [(ngModel)]="dateFilter" (ngModelChange)="filterEntretiens()" class="date-filter">
        </div>

        <!-- Tableau -->
        <div class="table-container" *ngIf="entretiens.length > 0; else emptyState">
          <table class="entretiens-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Candidat</th>
                <th>Poste</th>
                <th>Type</th>
                <th>Intervieweurs</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of filteredEntretiens">
                <td>{{ e.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ e.heure }}</td>
                <td>{{ e.candidat_nom }} {{ e.candidat_prenom }}</td>
                <td>{{ e.poste }}</td>
                <td>{{ getTypeLabel(e.type) }}</td>
                <td>{{ e.intervieweurs.join(', ') }}</td>
                <td><span class="badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span></td>
                <td class="actions">
                  <button class="btn-icon" (click)="viewDetails(e)" title="Voir détails">👁️</button>
                  <button class="btn-icon" (click)="editEntretien(e)" title="Modifier">✏️</button>
                  <button class="btn-icon" (click)="updateStatut(e)" title="Changer statut">🔄</button>
                  <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vue Semaine -->
      <div *ngIf="viewMode === 'semaine'" class="calendar-view">
        <div class="calendar-header">
          <button (click)="previousWeek()">←</button>
          <span>Semaine du {{ weekStart | date }} au {{ weekEnd | date }}</span>
          <button (click)="nextWeek()">→</button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-day" *ngFor="let day of weekDays">
            <div class="day-header">{{ day.date | date:'EEEE d' }}</div>
            <div class="day-events">
              <div *ngFor="let e of getEntretiensForDay(day.date)" class="calendar-event" [class]="e.statut">
                <div class="event-time">{{ e.heure }}</div>
                <div class="event-title">{{ e.candidat_nom }} {{ e.candidat_prenom }}</div>
                <div class="event-type">{{ getTypeLabel(e.type) }}</div>
              </div>
              <div *ngIf="getEntretiensForDay(day.date).length === 0" class="no-event">
                Aucun entretien
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🤝</div>
          <h2>Aucun entretien planifié</h2>
          <p>Planifiez votre premier entretien</p>
          <button class="btn-primary" (click)="showForm = true">+ Planifier un entretien</button>
        </div>
      </ng-template>

      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Détails de l'entretien</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEntretien">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Candidat</h4>
                <p><strong>Nom:</strong> {{ selectedEntretien.candidat_nom }} {{ selectedEntretien.candidat_prenom }}</p>
                <p><strong>Poste:</strong> {{ selectedEntretien.poste }}</p>
              </div>
              <div class="detail-section">
                <h4>Horaires</h4>
                <p><strong>Date:</strong> {{ selectedEntretien.date | date }}</p>
                <p><strong>Heure:</strong> {{ selectedEntretien.heure }}</p>
                <p><strong>Durée:</strong> {{ selectedEntretien.duree }} minutes</p>
              </div>
              <div class="detail-section">
                <h4>Lieu</h4>
                <p *ngIf="selectedEntretien.type === 'presentiel'">{{ selectedEntretien.lieu || 'Non précisé' }}</p>
                <p *ngIf="selectedEntretien.type === 'visio'"><a [href]="selectedEntretien.lien_visio" target="_blank">Lien visio</a></p>
                <p *ngIf="selectedEntretien.type === 'telephone'">Entretien téléphonique</p>
              </div>
              <div class="detail-section">
                <h4>Intervieweurs</h4>
                <p>{{ selectedEntretien.intervieweurs.join(', ') || 'Non précisé' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Compte rendu</h4>
                <p>{{ selectedEntretien.compte_rendu || 'Aucun compte rendu' }}</p>
              </div>
              <div class="detail-section">
                <h4>Évaluation</h4>
                <p>{{ selectedEntretien.evaluation ? selectedEntretien.evaluation + '/10' : 'Non évalué' }}</p>
              </div>
              <div class="detail-section">
                <h4>Statut</h4>
                <p><span class="badge" [class]="selectedEntretien.statut">{{ getStatutLabel(selectedEntretien.statut) }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de changement de statut -->
      <div class="modal" *ngIf="showStatutModal">
        <div class="modal-content">
          <h3>Changer le statut</h3>
          <p>Pour l'entretien de {{ statutDocument?.candidat_nom }} {{ statutDocument?.candidat_prenom }}</p>
          <div class="form-group">
            <label>Nouveau statut</label>
            <select [(ngModel)]="newStatut" class="form-control">
              <option value="planifie">Planifié</option>
              <option value="confirme">Confirmé</option>
              <option value="realise">Réalisé</option>
              <option value="annule">Annulé</option>
              <option value="reporte">Reporté</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showStatutModal = false">Annuler</button>
            <button class="btn-save" (click)="updateStatutConfirm()">✅ Confirmer</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'entretien du {{ entretienToDelete?.date }} avec {{ entretienToDelete?.candidat_nom }} ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEntretien()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .entretiens-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; }
    label { margin-bottom: 5px; color: #4B5563; }
    input, textarea, select { padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .ligne-form { display: flex; gap: 10px; margin-bottom: 10px; }
    .btn-remove { background: #FEE2E2; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; color: #EF4444; }
    .btn-add-ligne { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 8px 16px; margin: 10px 0; cursor: pointer; color: #EC4899; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    
    .view-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
    .view-tabs button { background: none; border: 2px solid #FCE7F3; padding: 8px 16px; cursor: pointer; border-radius: 20px; color: #6B7280; }
    .view-tabs button.active { background: #EC4899; color: white; border-color: #EC4899; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .date-filter { padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .entretiens-table { width: 100%; border-collapse: collapse; }
    .entretiens-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .entretiens-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.planifie { background: #F59E0B; color: white; }
    .badge.confirme { background: #10B981; color: white; }
    .badge.realise { background: #6B7280; color: white; }
    .badge.annule { background: #EF4444; color: white; }
    .badge.reporte { background: #EC4899; color: white; }
    
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .calendar-view { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .calendar-header button { background: none; border: 1px solid #FCE7F3; padding: 8px 16px; cursor: pointer; border-radius: 8px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
    .calendar-day { border: 1px solid #FCE7F3; border-radius: 8px; min-height: 200px; }
    .day-header { background: #FDF2F8; padding: 10px; font-weight: 600; text-align: center; }
    .day-events { padding: 10px; }
    .calendar-event { background: #FDF2F8; border-left: 3px solid #EC4899; padding: 8px; margin-bottom: 5px; border-radius: 4px; cursor: pointer; }
    .calendar-event.planifie { border-left-color: #F59E0B; }
    .calendar-event.confirme { border-left-color: #10B981; }
    .calendar-event.realise { border-left-color: #6B7280; }
    .calendar-event.annule { border-left-color: #EF4444; opacity: 0.5; }
    .event-time { font-size: 11px; color: #6B7280; }
    .event-title { font-weight: 600; font-size: 13px; }
    .event-type { font-size: 11px; color: #EC4899; }
    .no-event { text-align: center; color: #9CA3AF; padding: 10px; font-size: 12px; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
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
export class Entretiens implements OnInit {
  candidatures: any[] = [];
  entretiens: Entretien[] = [];
  filteredEntretiens: Entretien[] = [];
  selectedEntretien: Entretien | null = null;

  currentEntretien: any = {
    candidature_id: '',
    date: new Date().toISOString().split('T')[0],
    heure: '09:00',
    duree: 60,
    type: 'presentiel',
    lieu: '',
    lien_visio: '',
    intervieweurs: [''],
    poste: '',
    statut: 'planifie',
    compte_rendu: '',
    evaluation: null,
    notes: ''
  };

  viewMode = 'liste';
  searchTerm = '';
  statutFilter = '';
  dateFilter = '';

  weekStart: Date = new Date();
  weekEnd: Date = new Date();
  weekDays: any[] = [];

  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  showStatutModal = false;
  entretienToDelete: Entretien | null = null;
  statutDocument: Entretien | null = null;
  newStatut = '';
  successMessage = '';

  ngOnInit() {
    this.loadCandidatures();
    this.loadEntretiens();
    this.initWeek();
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

  onCandidatChange() {
    const candidat = this.candidatures.find(c => c.id === this.currentEntretien.candidature_id);
    if (candidat) {
      this.currentEntretien.poste = candidat.poste;
      this.currentEntretien.candidat_nom = candidat.nom;
      this.currentEntretien.candidat_prenom = candidat.prenom;
    }
  }

  addIntervieweur() {
    this.currentEntretien.intervieweurs.push('');
  }

  removeIntervieweur(index: number) {
    this.currentEntretien.intervieweurs.splice(index, 1);
  }

  saveEntretien() {
    const candidat = this.candidatures.find(c => c.id === this.currentEntretien.candidature_id);
    
    if (this.editMode) {
      const index = this.entretiens.findIndex(e => e.id === this.currentEntretien.id);
      if (index !== -1) {
        this.entretiens[index] = { 
          ...this.currentEntretien,
          candidat_nom: candidat?.nom,
          candidat_prenom: candidat?.prenom
        };
        this.showSuccess('Entretien modifié !');
      }
    } else {
      const newEntretien = { 
        ...this.currentEntretien, 
        id: Date.now(),
        candidat_nom: candidat?.nom,
        candidat_prenom: candidat?.prenom
      };
      this.entretiens.push(newEntretien);
      this.showSuccess('Entretien planifié !');
    }
    
    localStorage.setItem('entretiens', JSON.stringify(this.entretiens));
    this.filterEntretiens();
    this.cancelForm();
  }

  editEntretien(e: Entretien) {
    this.currentEntretien = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  viewDetails(e: Entretien) {
    this.selectedEntretien = e;
    this.showDetailsModal = true;
  }

  updateStatut(e: Entretien) {
    this.statutDocument = e;
    this.newStatut = e.statut;
    this.showStatutModal = true;
  }

  updateStatutConfirm() {
    if (this.statutDocument) {
      const index = this.entretiens.findIndex(e => e.id === this.statutDocument?.id);
      if (index !== -1) {
        this.entretiens[index].statut = this.newStatut as any;
        localStorage.setItem('entretiens', JSON.stringify(this.entretiens));
        this.filterEntretiens();
        this.showSuccess(`Statut mis à jour : ${this.getStatutLabel(this.newStatut)}`);
      }
    }
    this.showStatutModal = false;
    this.statutDocument = null;
  }

  confirmDelete(e: Entretien) {
    this.entretienToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEntretien() {
    if (this.entretienToDelete) {
      this.entretiens = this.entretiens.filter(e => e.id !== this.entretienToDelete?.id);
      localStorage.setItem('entretiens', JSON.stringify(this.entretiens));
      this.filterEntretiens();
      this.showDeleteModal = false;
      this.entretienToDelete = null;
      this.showSuccess('Entretien supprimé !');
    }
  }

  cancelForm() {
    this.currentEntretien = {
      candidature_id: '',
      date: new Date().toISOString().split('T')[0],
      heure: '09:00',
      duree: 60,
      type: 'presentiel',
      lieu: '',
      lien_visio: '',
      intervieweurs: [''],
      poste: '',
      statut: 'planifie',
      compte_rendu: '',
      evaluation: null,
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterEntretiens() {
    let filtered = this.entretiens;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.candidat_nom?.toLowerCase().includes(term) ||
        e.candidat_prenom?.toLowerCase().includes(term) ||
        e.poste?.toLowerCase().includes(term)
      );
    }

    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }

    if (this.dateFilter) {
      filtered = filtered.filter(e => e.date === this.dateFilter);
    }

    this.filteredEntretiens = filtered;
  }

  initWeek() {
    const today = new Date();
    this.weekStart = new Date(today);
    this.weekStart.setDate(today.getDate() - today.getDay() + 1);
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekStart.getDate() + 6);
    this.updateWeekDays();
  }

  previousWeek() {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.weekEnd.setDate(this.weekEnd.getDate() - 7);
    this.updateWeekDays();
  }

  nextWeek() {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.weekEnd.setDate(this.weekEnd.getDate() + 7);
    this.updateWeekDays();
  }

  updateWeekDays() {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStart);
      date.setDate(this.weekStart.getDate() + i);
      this.weekDays.push({ date: date.toISOString().split('T')[0] });
    }
  }

  getEntretiensForDay(date: string): Entretien[] {
    return this.entretiens.filter(e => e.date === date);
  }

  getTypeLabel(type: string): string {
    const labels: any = { presentiel: 'Présentiel', visio: 'Visio', telephone: 'Téléphone' };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = { 
      planifie: 'Planifié', 
      confirme: 'Confirmé', 
      realise: 'Réalisé', 
      annule: 'Annulé', 
      reporte: 'Reporté' 
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
