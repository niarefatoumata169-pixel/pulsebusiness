import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Incident {
  id?: number;
  date: string;
  employe_id?: number;
  employe_nom?: string;
  type: 'accident' | 'maladie' | 'incident' | 'presque_accident';
  gravite: 'bénin' | 'modéré' | 'grave' | 'très_grave';
  lieu: string;
  description: string;
  actions_immediates: string;
  causes?: string;
  consequences?: string;
  actions_correctives?: string;
  temoins?: string;
  declaration: string;
  declare_par: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'clos';
  date_cloture?: string;
  notes?: string;
}

interface FormationSecurite {
  id?: number;
  libelle: string;
  date: string;
  duree: number;
  formateur: string;
  participants: number[];
  theme: string;
  valide: boolean;
  date_validite?: string;
  notes?: string;
}

interface EquipementSecurite {
  id?: number;
  type: string;
  reference: string;
  localisation: string;
  responsable: string;
  date_installation: string;
  date_controle: string;
  periodicite_controle: number;
  statut: 'operationnel' | 'defaillant' | 'maintenance';
  notes?: string;
}

@Component({
  selector: 'app-securite',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="securite-container">
      <div class="header">
        <div>
          <h1>Sécurité</h1>
          <p class="subtitle">{{ incidents.length }} incident(s) • {{ formations.length }} formation(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="activeView = 'incidents'; showIncidentForm = !showIncidentForm">+ Déclarer incident</button>
          <button class="btn-add" (click)="activeView = 'formations'; showFormationForm = !showFormationForm">+ Nouvelle formation</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Vues -->
      <div class="view-tabs">
        <button [class.active]="activeView === 'incidents'" (click)="activeView = 'incidents'">Incidents</button>
        <button [class.active]="activeView === 'formations'" (click)="activeView = 'formations'">Formations</button>
        <button [class.active]="activeView === 'equipements'" (click)="activeView = 'equipements'">Équipements</button>
      </div>

      <!-- Vue Incidents -->
      <div *ngIf="activeView === 'incidents'">
        <!-- Formulaire incident -->
        <div class="form-card" *ngIf="showIncidentForm">
          <h3>{{ editIncidentMode ? 'Modifier' : 'Nouvel' }} incident</h3>
          <form (ngSubmit)="saveIncident()" #incidentForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" [(ngModel)]="currentIncident.date" name="date" required>
              </div>
              <div class="form-group">
                <label>Employé concerné</label>
                <select [(ngModel)]="currentIncident.employe_id" name="employe_id">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type d'incident</label>
                <select [(ngModel)]="currentIncident.type" name="type">
                  <option value="accident">Accident</option>
                  <option value="maladie">Maladie</option>
                  <option value="incident">Incident</option>
                  <option value="presque_accident">Presque accident</option>
                </select>
              </div>
              <div class="form-group">
                <label>Gravité</label>
                <select [(ngModel)]="currentIncident.gravite" name="gravite">
                  <option value="bénin">Bénin</option>
                  <option value="modéré">Modéré</option>
                  <option value="grave">Grave</option>
                  <option value="très_grave">Très grave</option>
                </select>
              </div>
              <div class="form-group">
                <label>Lieu</label>
                <input type="text" [(ngModel)]="currentIncident.lieu" name="lieu">
              </div>
              <div class="form-group">
                <label>Déclaration</label>
                <input type="text" [(ngModel)]="currentIncident.declaration" name="declaration">
              </div>
              <div class="form-group">
                <label>Déclaré par</label>
                <input type="text" [(ngModel)]="currentIncident.declare_par" name="declare_par">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentIncident.statut" name="statut">
                  <option value="ouvert">Ouvert</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
                  <option value="clos">Clos</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea [(ngModel)]="currentIncident.description" name="description" rows="3" required></textarea>
              </div>
              <div class="form-group full-width">
                <label>Actions immédiates</label>
                <textarea [(ngModel)]="currentIncident.actions_immediates" name="actions_immediates" rows="2"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Causes</label>
                <textarea [(ngModel)]="currentIncident.causes" name="causes" rows="2"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Conséquences</label>
                <textarea [(ngModel)]="currentIncident.consequences" name="consequences" rows="2"></textarea>
              </div>
              <div class="form-group full-width">
                <label>Actions correctives</label>
                <textarea [(ngModel)]="currentIncident.actions_correctives" name="actions_correctives" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Témoins</label>
                <input type="text" [(ngModel)]="currentIncident.temoins" name="temoins">
              </div>
              <div class="form-group" *ngIf="currentIncident.statut === 'clos'">
                <label>Date de clôture</label>
                <input type="date" [(ngModel)]="currentIncident.date_cloture" name="date_cloture">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentIncident.notes" name="notes" rows="2"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="cancelIncidentForm()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="incidentForm.invalid">💾 Enregistrer</button>
            </div>
          </form>
        </div>

        <!-- Filtres incidents -->
        <div class="filters-bar" *ngIf="incidents.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="incidentSearchTerm" (ngModelChange)="filterIncidents()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterIncidents()" class="filter-select">
            <option value="">Tous types</option>
            <option value="accident">Accidents</option>
            <option value="maladie">Maladies</option>
            <option value="incident">Incidents</option>
            <option value="presque_accident">Presque accidents</option>
          </select>
          <select [(ngModel)]="statutIncidentFilter" (ngModelChange)="filterIncidents()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
            <option value="clos">Clos</option>
          </select>
        </div>

        <!-- Tableau incidents -->
        <div class="table-container" *ngIf="incidents.length > 0; else noIncidents">
          <table class="incidents-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employé</th>
                <th>Type</th>
                <th>Gravité</th>
                <th>Lieu</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of filteredIncidents">
                <td>{{ i.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ i.employe_nom || 'Non spécifié' }}</td>
                <td><span class="badge" [class]="i.type">{{ getTypeLabel(i.type) }}</span></td>
                <td><span class="badge" [class]="i.gravite">{{ i.gravite }}</span></td>
                <td>{{ i.lieu }}</td>
                <td><span class="badge" [class]="i.statut">{{ getStatutLabel(i.statut) }}</span></td>
                <td class="actions">
                  <button class="btn-icon" (click)="viewIncident(i)" title="Voir">👁️</button>
                  <button class="btn-icon" (click)="editIncident(i)" title="Modifier">✏️</button>
                  <button class="btn-icon delete" (click)="confirmDeleteIncident(i)" title="Supprimer">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noIncidents>
          <div class="empty-state">
            <div class="empty-icon">🛡️</div>
            <h2>Aucun incident</h2>
            <p>Déclarez votre premier incident</p>
            <button class="btn-primary" (click)="showIncidentForm = true">+ Déclarer incident</button>
          </div>
        </ng-template>
      </div>

      <!-- Vue Formations -->
      <div *ngIf="activeView === 'formations'">
        <!-- Formulaire formation -->
        <div class="form-card" *ngIf="showFormationForm">
          <h3>{{ editFormationMode ? 'Modifier' : 'Nouvelle' }} formation sécurité</h3>
          <form (ngSubmit)="saveFormation()" #formationForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Libellé *</label>
                <input type="text" [(ngModel)]="currentFormation.libelle" name="libelle" required>
              </div>
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="currentFormation.date" name="date">
              </div>
              <div class="form-group">
                <label>Durée (heures)</label>
                <input type="number" [(ngModel)]="currentFormation.duree" name="duree" min="1">
              </div>
              <div class="form-group">
                <label>Formateur</label>
                <input type="text" [(ngModel)]="currentFormation.formateur" name="formateur">
              </div>
              <div class="form-group">
                <label>Thème</label>
                <input type="text" [(ngModel)]="currentFormation.theme" name="theme">
              </div>
              <div class="form-group">
                <label>Participants</label>
                <select multiple [(ngModel)]="currentFormation.participants" name="participants" class="multi-select">
                  <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
                </select>
                <small>Maintenir Ctrl pour sélectionner plusieurs</small>
              </div>
              <div class="form-group">
                <label>Validée</label>
                <input type="checkbox" [(ngModel)]="currentFormation.valide" name="valide">
              </div>
              <div class="form-group" *ngIf="currentFormation.valide">
                <label>Date de validité</label>
                <input type="date" [(ngModel)]="currentFormation.date_validite" name="date_validite">
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentFormation.notes" name="notes" rows="3"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="cancelFormationForm()">Annuler</button>
              <button type="submit" class="btn-save">💾 Enregistrer</button>
            </div>
          </form>
        </div>

        <!-- Liste formations -->
        <div class="formations-grid" *ngIf="formations.length > 0; else noFormations">
          <div class="formation-card" *ngFor="let f of formations">
            <div class="formation-header">
              <span class="formation-titre">{{ f.libelle }}</span>
              <span class="formation-badge" [class.valide]="f.valide">{{ f.valide ? 'Validée' : 'À valider' }}</span>
            </div>
            <div class="formation-body">
              <p><strong>Date:</strong> {{ f.date | date }}</p>
              <p><strong>Durée:</strong> {{ f.duree }}h</p>
              <p><strong>Formateur:</strong> {{ f.formateur }}</p>
              <p><strong>Participants:</strong> {{ f.participants.length || 0 }}</p>
            </div>
            <div class="formation-actions">
              <button class="btn-icon" (click)="editFormation(f)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDeleteFormation(f)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
        <ng-template #noFormations>
          <div class="empty-state">
            <div class="empty-icon">🎓</div>
            <h2>Aucune formation</h2>
            <p>Ajoutez votre première formation sécurité</p>
            <button class="btn-primary" (click)="showFormationForm = true">+ Nouvelle formation</button>
          </div>
        </ng-template>
      </div>

      <!-- Vue Équipements -->
      <div *ngIf="activeView === 'equipements'">
        <div class="empty-state">
          <div class="empty-icon">🔧</div>
          <h2>Gestion des équipements de sécurité</h2>
          <p>Module en cours de développement</p>
        </div>
      </div>

      <!-- Modals de confirmation -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer cet élément ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="confirmDelete()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .securite-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    
    .view-tabs { display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .view-tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .view-tabs button.active { background: #EC4899; color: white; }
    
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
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
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .incidents-table { width: 100%; border-collapse: collapse; }
    .incidents-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .incidents-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.accident { background: #EF4444; color: white; }
    .badge.maladie { background: #F59E0B; color: white; }
    .badge.incident { background: #EC4899; color: white; }
    .badge.presque_accident { background: #10B981; color: white; }
    .badge.bénin { background: #10B981; color: white; }
    .badge.modéré { background: #F59E0B; color: white; }
    .badge.grave { background: #EC4899; color: white; }
    .badge.très_grave { background: #EF4444; color: white; }
    .badge.ouvert { background: #EF4444; color: white; }
    .badge.en_cours { background: #F59E0B; color: white; }
    .badge.resolu { background: #10B981; color: white; }
    .badge.clos { background: #6B7280; color: white; }
    
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .formations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .formation-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .formation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .formation-titre { font-weight: 600; color: #1F2937; }
    .formation-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; background: #FDF2F8; color: #EC4899; }
    .formation-badge.valide { background: #10B981; color: white; }
    .formation-body p { margin: 5px 0; color: #6B7280; }
    .formation-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Securite implements OnInit {
  employes: any[] = [];
  
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  formations: FormationSecurite[] = [];
  
  currentIncident: any = {
    date: new Date().toISOString().split('T')[0],
    type: 'incident',
    gravite: 'modéré',
    lieu: '',
    description: '',
    actions_immediates: '',
    declaration: new Date().toISOString().split('T')[0],
    declare_par: '',
    statut: 'ouvert'
  };
  
  currentFormation: any = {
    libelle: '',
    date: new Date().toISOString().split('T')[0],
    duree: 1,
    formateur: '',
    theme: '',
    participants: [],
    valide: false
  };

  activeView = 'incidents';
  
  incidentSearchTerm = '';
  typeFilter = '';
  statutIncidentFilter = '';
  
  showIncidentForm = false;
  showFormationForm = false;
  editIncidentMode = false;
  editFormationMode = false;
  showDeleteModal = false;
  deleteType: 'incident' | 'formation' = 'incident';
  itemToDelete: any = null;
  successMessage = '';

  ngOnInit() {
    this.loadEmployes();
    this.loadIncidents();
    this.loadFormations();
  }

  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }

  loadIncidents() {
    const saved = localStorage.getItem('incidents_securite');
    this.incidents = saved ? JSON.parse(saved) : [];
    this.filteredIncidents = [...this.incidents];
  }

  loadFormations() {
    const saved = localStorage.getItem('formations_securite');
    this.formations = saved ? JSON.parse(saved) : [];
  }

  saveIncident() {
    const employe = this.employes.find(e => e.id === this.currentIncident.employe_id);
    
    if (this.editIncidentMode) {
      const index = this.incidents.findIndex(i => i.id === this.currentIncident.id);
      if (index !== -1) {
        this.incidents[index] = { 
          ...this.currentIncident, 
          employe_nom: employe ? `${employe.nom} ${employe.prenom}` : null
        };
        this.showSuccess('Incident modifié !');
      }
    } else {
      const newIncident = { 
        ...this.currentIncident, 
        id: Date.now(),
        employe_nom: employe ? `${employe.nom} ${employe.prenom}` : null
      };
      this.incidents.push(newIncident);
      this.showSuccess('Incident déclaré !');
    }
    
    localStorage.setItem('incidents_securite', JSON.stringify(this.incidents));
    this.filterIncidents();
    this.cancelIncidentForm();
  }

  saveFormation() {
    if (this.editFormationMode) {
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
    
    localStorage.setItem('formations_securite', JSON.stringify(this.formations));
    this.cancelFormationForm();
  }

  editIncident(i: Incident) {
    this.currentIncident = { ...i };
    this.editIncidentMode = true;
    this.showIncidentForm = true;
  }

  editFormation(f: FormationSecurite) {
    this.currentFormation = { ...f };
    this.editFormationMode = true;
    this.showFormationForm = true;
  }

  viewIncident(i: Incident) {
    alert('Détails de l\'incident à implémenter');
  }

  confirmDeleteIncident(i: Incident) {
    this.deleteType = 'incident';
    this.itemToDelete = i;
    this.showDeleteModal = true;
  }

  confirmDeleteFormation(f: FormationSecurite) {
    this.deleteType = 'formation';
    this.itemToDelete = f;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.deleteType === 'incident' && this.itemToDelete) {
      this.incidents = this.incidents.filter(i => i.id !== this.itemToDelete.id);
      localStorage.setItem('incidents_securite', JSON.stringify(this.incidents));
      this.filterIncidents();
      this.showSuccess('Incident supprimé !');
    } else if (this.deleteType === 'formation' && this.itemToDelete) {
      this.formations = this.formations.filter(f => f.id !== this.itemToDelete.id);
      localStorage.setItem('formations_securite', JSON.stringify(this.formations));
      this.showSuccess('Formation supprimée !');
    }
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  cancelIncidentForm() {
    this.currentIncident = {
      date: new Date().toISOString().split('T')[0],
      type: 'incident',
      gravite: 'modéré',
      lieu: '',
      description: '',
      actions_immediates: '',
      declaration: new Date().toISOString().split('T')[0],
      declare_par: '',
      statut: 'ouvert'
    };
    this.showIncidentForm = false;
    this.editIncidentMode = false;
  }

  cancelFormationForm() {
    this.currentFormation = {
      libelle: '',
      date: new Date().toISOString().split('T')[0],
      duree: 1,
      formateur: '',
      theme: '',
      participants: [],
      valide: false
    };
    this.showFormationForm = false;
    this.editFormationMode = false;
  }

  filterIncidents() {
    let filtered = this.incidents;

    if (this.incidentSearchTerm) {
      const term = this.incidentSearchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.description?.toLowerCase().includes(term) ||
        i.lieu?.toLowerCase().includes(term) ||
        i.employe_nom?.toLowerCase().includes(term)
      );
    }

    if (this.typeFilter) {
      filtered = filtered.filter(i => i.type === this.typeFilter);
    }

    if (this.statutIncidentFilter) {
      filtered = filtered.filter(i => i.statut === this.statutIncidentFilter);
    }

    this.filteredIncidents = filtered;
  }

  getTypeLabel(type: string): string {
    const labels: any = { 
      accident: 'Accident', 
      maladie: 'Maladie', 
      incident: 'Incident', 
      presque_accident: 'Presque accident' 
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = { ouvert: 'Ouvert', en_cours: 'En cours', resolu: 'Résolu', clos: 'Clos' };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
