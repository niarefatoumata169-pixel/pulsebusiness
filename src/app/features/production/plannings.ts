import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Planning {
  id?: number;
  reference: string;
  titre: string;
  type: 'production' | 'maintenance' | 'equipe' | 'projet';
  periode_debut: string;
  periode_fin: string;
  statut: 'brouillon' | 'publie' | 'archive';
  responsable: string;
  notes?: string;
  taches: TachePlanning[];
}

interface TachePlanning {
  id?: number;
  titre: string;
  date_debut: string;
  date_fin: string;
  heure_debut?: string;
  heure_fin?: string;
  equipement_id?: number;
  equipement_nom?: string;
  operateur_id?: number;
  operateur_nom?: string;
  duree_prevue: number;
  duree_reelle?: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  notes?: string;
}

@Component({
  selector: 'app-plannings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="plannings-container">
      <div class="header">
        <div>
          <h1>Plannings de production</h1>
          <p class="subtitle">{{ plannings.length }} planning(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau planning</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} planning</h3>
        <form (ngSubmit)="savePlanning()" #planningForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Référence *</label>
              <input type="text" [(ngModel)]="currentPlanning.reference" name="reference" required>
            </div>
            <div class="form-group">
              <label>Titre *</label>
              <input type="text" [(ngModel)]="currentPlanning.titre" name="titre" required>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="currentPlanning.type" name="type">
                <option value="production">Production</option>
                <option value="maintenance">Maintenance</option>
                <option value="equipe">Équipe</option>
                <option value="projet">Projet</option>
              </select>
            </div>
            <div class="form-group">
              <label>Période début</label>
              <input type="date" [(ngModel)]="currentPlanning.periode_debut" name="periode_debut">
            </div>
            <div class="form-group">
              <label>Période fin</label>
              <input type="date" [(ngModel)]="currentPlanning.periode_fin" name="periode_fin">
            </div>
            <div class="form-group">
              <label>Responsable</label>
              <input type="text" [(ngModel)]="currentPlanning.responsable" name="responsable">
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentPlanning.statut" name="statut">
                <option value="brouillon">Brouillon</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentPlanning.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="planningForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="plannings.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPlannings()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterPlannings()" class="filter-select">
          <option value="">Tous types</option>
          <option value="production">Production</option>
          <option value="maintenance">Maintenance</option>
          <option value="equipe">Équipe</option>
          <option value="projet">Projet</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterPlannings()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="publie">Publié</option>
          <option value="archive">Archivé</option>
        </select>
      </div>
      <div class="plannings-grid" *ngIf="plannings.length > 0; else emptyState">
        <div class="planning-card" *ngFor="let p of filteredPlannings" (click)="viewPlanning(p)">
          <div class="planning-header">
            <span class="planning-titre">{{ p.titre }}</span>
            <span class="planning-badge" [class]="p.statut">{{ getStatutLabel(p.statut) }}</span>
          </div>
          <div class="planning-body">
            <p><span class="label">Réf:</span> {{ p.reference }}</p>
            <p><span class="label">Période:</span> {{ p.periode_debut | date }} - {{ p.periode_fin | date }}</p>
            <p><span class="label">Type:</span> {{ getTypeLabel(p.type) }}</p>
            <p><span class="label">Tâches:</span> {{ p.taches.length || 0 }}</p>
            <p><span class="label">Responsable:</span> {{ p.responsable }}</p>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h2>Aucun planning</h2>
          <p>Créez votre premier planning</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau planning</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedPlanning?.titre }}</h3>
            <button class="btn-close" (click)="closeDetails()">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedPlanning">
            <div class="planning-details">
              <div class="details-info">
                <p><strong>Référence:</strong> {{ selectedPlanning.reference }}</p>
                <p><strong>Période:</strong> {{ selectedPlanning.periode_debut | date }} au {{ selectedPlanning.periode_fin | date }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedPlanning.type) }}</p>
                <p><strong>Responsable:</strong> {{ selectedPlanning.responsable }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedPlanning.statut) }}</p>
                <p><strong>Notes:</strong> {{ selectedPlanning.notes || '-' }}</p>
              </div>
              <div class="taches-section">
                <h4>Tâches planifiées</h4>
                <button class="btn-add-tache" (click)="showTacheForm = true">+ Ajouter une tâche</button>
                <div class="taches-list">
                  <div class="tache-card" *ngFor="let t of selectedPlanning.taches">
                    <div class="tache-header">
                      <span class="tache-titre">{{ t.titre }}</span>
                      <span class="tache-badge" [class]="t.statut">{{ getTacheStatutLabel(t.statut) }}</span>
                    </div>
                    <div class="tache-body">
                      <p><span class="label">Date:</span> {{ t.date_debut | date }} {{ t.heure_debut }} - {{ t.date_fin | date }} {{ t.heure_fin }}</p>
                      <p><span class="label">Équipement:</span> {{ t.equipement_nom || '-' }}</p>
                      <p><span class="label">Opérateur:</span> {{ t.operateur_nom || '-' }}</p>
                      <p><span class="label">Priorité:</span> <span class="priorite" [class]="t.priorite">{{ getPrioriteLabel(t.priorite) }}</span></p>
                    </div>
                    <div class="tache-actions">
                      <button class="btn-icon" (click)="editTache(t)" title="Modifier">✏️</button>
                      <button class="btn-icon" (click)="deleteTache(t)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showTacheForm">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editTacheMode ? 'Modifier' : 'Nouvelle' }} tâche</h3>
            <button class="btn-close" (click)="showTacheForm = false">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveTache()" #tacheForm="ngForm">
              <div class="form-grid">
                <div class="form-group">
                  <label>Titre *</label>
                  <input type="text" [(ngModel)]="currentTache.titre" name="titre_tache" required>
                </div>
                <div class="form-group">
                  <label>Date début</label>
                  <input type="date" [(ngModel)]="currentTache.date_debut" name="date_debut">
                </div>
                <div class="form-group">
                  <label>Heure début</label>
                  <input type="time" [(ngModel)]="currentTache.heure_debut" name="heure_debut">
                </div>
                <div class="form-group">
                  <label>Date fin</label>
                  <input type="date" [(ngModel)]="currentTache.date_fin" name="date_fin">
                </div>
                <div class="form-group">
                  <label>Heure fin</label>
                  <input type="time" [(ngModel)]="currentTache.heure_fin" name="heure_fin">
                </div>
                <div class="form-group">
                  <label>Équipement</label>
                  <select [(ngModel)]="currentTache.equipement_id" name="equipement_id">
                    <option value="">Sélectionner</option>
                    <option *ngFor="let e of equipements" [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Opérateur</label>
                  <select [(ngModel)]="currentTache.operateur_id" name="operateur_id">
                    <option value="">Sélectionner</option>
                    <option *ngFor="let o of operateurs" [value]="o.id">{{ o.nom }} {{ o.prenom }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Durée prévue (heures)</label>
                  <input type="number" [(ngModel)]="currentTache.duree_prevue" name="duree_prevue" min="0" step="0.5">
                </div>
                <div class="form-group">
                  <label>Priorité</label>
                  <select [(ngModel)]="currentTache.priorite" name="priorite">
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentTache.statut" name="statut_tache">
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea [(ngModel)]="currentTache.notes" name="notes_tache" rows="3"></textarea>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="showTacheForm = false">Annuler</button>
                <button type="submit" class="btn-save" [disabled]="tacheForm.invalid">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer {{ deleteType === 'planning' ? 'le planning' : 'la tâche' }} ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="confirmDelete()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plannings-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .plannings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .planning-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; cursor: pointer; transition: all 0.2s; }
    .planning-card:hover { box-shadow: 0 4px 12px rgba(236,72,153,0.1); transform: translateY(-2px); }
    .planning-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .planning-titre { font-weight: 600; color: #1F2937; font-size: 16px; }
    .planning-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .planning-badge.brouillon { background: #9CA3AF; color: white; }
    .planning-badge.publie { background: #10B981; color: white; }
    .planning-badge.archive { background: #6B7280; color: white; }
    .planning-body p { margin: 5px 0; color: #6B7280; }
    .planning-body .label { color: #4B5563; width: 70px; display: inline-block; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .planning-details { display: flex; flex-direction: column; gap: 30px; }
    .details-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #FDF2F8; padding: 20px; border-radius: 8px; }
    .taches-section { margin-top: 20px; }
    .btn-add-tache { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; margin-bottom: 20px; cursor: pointer; color: #EC4899; width: 100%; }
    .taches-list { display: flex; flex-direction: column; gap: 15px; }
    .tache-card { background: white; border: 1px solid #FCE7F3; border-radius: 8px; padding: 15px; }
    .tache-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .tache-titre { font-weight: 600; color: #1F2937; }
    .tache-badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
    .tache-badge.planifie { background: #F59E0B; color: white; }
    .tache-badge.en_cours { background: #10B981; color: white; }
    .tache-badge.termine { background: #6B7280; color: white; }
    .tache-badge.annule { background: #EF4444; color: white; }
    .tache-body p { margin: 5px 0; font-size: 13px; }
    .priorite { padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .priorite.basse { background: #9CA3AF; color: white; }
    .priorite.normale { background: #10B981; color: white; }
    .priorite.haute { background: #F59E0B; color: white; }
    .priorite.urgente { background: #EF4444; color: white; }
    .tache-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Plannings implements OnInit {
  equipements: any[] = [];
  operateurs: any[] = [];
  plannings: Planning[] = [];
  filteredPlannings: Planning[] = [];
  selectedPlanning: Planning | null = null;
  currentPlanning: any = {
    reference: 'PLAN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    titre: '',
    type: 'production',
    periode_debut: new Date().toISOString().split('T')[0],
    periode_fin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    statut: 'brouillon',
    responsable: '',
    notes: '',
    taches: []
  };
  currentTache: any = {
    titre: '',
    date_debut: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    date_fin: new Date().toISOString().split('T')[0],
    heure_fin: '17:00',
    equipement_id: '',
    operateur_id: '',
    duree_prevue: 8,
    priorite: 'normale',
    statut: 'planifie',
    notes: ''
  };
  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDetailsModal = false;
  showTacheForm = false;
  editTacheMode = false;
  showDeleteModal = false;
  deleteType: 'planning' | 'tache' = 'planning';
  itemToDelete: any = null;
  successMessage = '';
  ngOnInit() {
    this.loadEquipements();
    this.loadOperateurs();
    this.loadPlannings();
  }
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    this.equipements = saved ? JSON.parse(saved) : [];
  }
  loadOperateurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.operateurs = saved ? JSON.parse(saved) : [];
  }
  loadPlannings() {
    const saved = localStorage.getItem('plannings');
    this.plannings = saved ? JSON.parse(saved) : [];
    this.filteredPlannings = [...this.plannings];
  }
  savePlanning() {
    if (this.editMode) {
      const index = this.plannings.findIndex(p => p.id === this.currentPlanning.id);
      if (index !== -1) {
        this.plannings[index] = { ...this.currentPlanning };
        this.showSuccess('Planning modifié !');
      }
    } else {
      const newPlanning = { ...this.currentPlanning, id: Date.now(), taches: [] };
      this.plannings.push(newPlanning);
      this.showSuccess('Planning ajouté !');
    }
    localStorage.setItem('plannings', JSON.stringify(this.plannings));
    this.filterPlannings();
    this.cancelForm();
  }
  viewPlanning(p: Planning) {
    this.selectedPlanning = p;
    this.showDetailsModal = true;
  }
  closeDetails() {
    this.showDetailsModal = false;
    this.selectedPlanning = null;
  }
  saveTache() {
    if (!this.selectedPlanning) return;
    const equip = this.equipements.find(e => e.id === this.currentTache.equipement_id);
    const op = this.operateurs.find(o => o.id === this.currentTache.operateur_id);
    if (this.editTacheMode) {
      const index = this.selectedPlanning.taches.findIndex(t => t.id === this.currentTache.id);
      if (index !== -1) {
        this.selectedPlanning.taches[index] = { 
          ...this.currentTache, 
          equipement_nom: equip?.nom,
          operateur_nom: op ? op.nom + ' ' + op.prenom : ''
        };
        this.showSuccess('Tâche modifiée !');
      }
    } else {
      const newTache = { 
        ...this.currentTache, 
        id: Date.now(),
        equipement_nom: equip?.nom,
        operateur_nom: op ? op.nom + ' ' + op.prenom : ''
      };
      this.selectedPlanning.taches.push(newTache);
      this.showSuccess('Tâche ajoutée !');
    }
    this.updatePlanning();
    this.showTacheForm = false;
    this.editTacheMode = false;
    this.resetTacheForm();
  }
  editTache(t: any) {
    this.currentTache = { ...t };
    this.editTacheMode = true;
    this.showTacheForm = true;
  }
  deleteTache(t: any) {
    if (this.selectedPlanning && confirm('Supprimer cette tâche ?')) {
      this.selectedPlanning.taches = this.selectedPlanning.taches.filter(tache => tache.id !== t.id);
      this.updatePlanning();
      this.showSuccess('Tâche supprimée !');
    }
  }
  updatePlanning() {
    if (this.selectedPlanning) {
      const index = this.plannings.findIndex(p => p.id === this.selectedPlanning?.id);
      if (index !== -1) {
        this.plannings[index] = this.selectedPlanning;
        localStorage.setItem('plannings', JSON.stringify(this.plannings));
      }
    }
  }
  confirmDeletePlanning(p: Planning) {
    this.deleteType = 'planning';
    this.itemToDelete = p;
    this.showDeleteModal = true;
  }
  confirmDelete() {
    if (this.deleteType === 'planning' && this.itemToDelete) {
      this.plannings = this.plannings.filter(p => p.id !== this.itemToDelete.id);
      localStorage.setItem('plannings', JSON.stringify(this.plannings));
      this.filterPlannings();
      this.showSuccess('Planning supprimé !');
    }
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }
  cancelForm() {
    this.currentPlanning = {
      reference: 'PLAN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      titre: '',
      type: 'production',
      periode_debut: new Date().toISOString().split('T')[0],
      periode_fin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      statut: 'brouillon',
      responsable: '',
      notes: '',
      taches: []
    };
    this.showForm = false;
    this.editMode = false;
  }
  resetTacheForm() {
    this.currentTache = {
      titre: '',
      date_debut: new Date().toISOString().split('T')[0],
      heure_debut: '08:00',
      date_fin: new Date().toISOString().split('T')[0],
      heure_fin: '17:00',
      equipement_id: '',
      operateur_id: '',
      duree_prevue: 8,
      priorite: 'normale',
      statut: 'planifie',
      notes: ''
    };
  }
  filterPlannings() {
    let filtered = this.plannings;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.titre?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term) ||
        p.responsable?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(p => p.type === this.typeFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(p => p.statut === this.statutFilter);
    }
    this.filteredPlannings = filtered;
  }
  getTypeLabel(type: string): string {
    const labels: any = { production: 'Production', maintenance: 'Maintenance', equipe: 'Équipe', projet: 'Projet' };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { brouillon: 'Brouillon', publie: 'Publié', archive: 'Archivé' };
    return labels[statut] || statut;
  }
  getTacheStatutLabel(statut: string): string {
    const labels: any = { planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
    return labels[statut] || statut;
  }
  getPrioriteLabel(priorite: string): string {
    const labels: any = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };
    return labels[priorite] || priorite;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
