import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Competence {
  id?: number;
  nom: string;
  categorie: string;
  description?: string;
  niveau_requis?: number;
}

interface EmployeCompetence {
  id?: number;
  employe_id: number;
  competence_id: number;
  competence_nom?: string;
  niveau: number;
  date_obtention?: string;
  date_expiration?: string;
  certificat?: string;
  notes?: string;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="competences-container">
      <div class="header">
        <div>
          <h1>Compétences</h1>
          <p class="subtitle">{{ competences.length }} compétence(s) • {{ employeCompetences.length }} attribution(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="showCompetenceForm = !showCompetenceForm">+ Nouvelle compétence</button>
          <button class="btn-assign" (click)="showAssignForm = !showAssignForm" *ngIf="competences.length > 0">📌 Attribuer</button>
        </div>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showCompetenceForm">
        <h3>{{ editCompetenceMode ? 'Modifier' : 'Nouvelle' }} compétence</h3>
        <form (ngSubmit)="saveCompetence()" #competenceForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="currentCompetence.nom" name="nom" required>
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="currentCompetence.categorie" name="categorie">
                <option value="technique">Technique</option>
                <option value="informatique">Informatique</option>
                <option value="linguistique">Linguistique</option>
                <option value="management">Management</option>
                <option value="commercial">Commercial</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Niveau requis (1-5)</label>
              <input type="number" [(ngModel)]="currentCompetence.niveau_requis" name="niveau_requis" min="1" max="5">
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="currentCompetence.description" name="description" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelCompetenceForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="competenceForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="form-card" *ngIf="showAssignForm">
        <h3>Attribuer une compétence</h3>
        <form (ngSubmit)="saveAttribution()" #assignForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Employé *</label>
              <select [(ngModel)]="currentAttribution.employe_id" name="employe_id" required>
                <option value="">Sélectionner</option>
                <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Compétence *</label>
              <select [(ngModel)]="currentAttribution.competence_id" name="competence_id" required (change)="onCompetenceChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let c of competences" [value]="c.id">{{ c.nom }} ({{ c.categorie }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Niveau (1-5)</label>
              <input type="number" [(ngModel)]="currentAttribution.niveau" name="niveau" min="1" max="5" required>
            </div>
            <div class="form-group">
              <label>Date d'obtention</label>
              <input type="date" [(ngModel)]="currentAttribution.date_obtention" name="date_obtention">
            </div>
            <div class="form-group">
              <label>Date d'expiration</label>
              <input type="date" [(ngModel)]="currentAttribution.date_expiration" name="date_expiration">
            </div>
            <div class="form-group">
              <label>Certificat (URL)</label>
              <input type="text" [(ngModel)]="currentAttribution.certificat" name="certificat">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentAttribution.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="showAssignForm = false">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="assignForm.invalid">💾 Attribuer</button>
          </div>
        </form>
      </div>
      <div class="view-tabs">
        <button [class.active]="activeView === 'competences'" (click)="activeView = 'competences'">Compétences</button>
        <button [class.active]="activeView === 'employes'" (click)="activeView = 'employes'">Par employé</button>
      </div>
      <div *ngIf="activeView === 'competences'">
        <div class="filters-bar" *ngIf="competences.length > 0">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="searchTerm" (ngModelChange)="filterCompetences()" placeholder="Rechercher...">
          </div>
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterCompetences()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="technique">Technique</option>
            <option value="informatique">Informatique</option>
            <option value="linguistique">Linguistique</option>
            <option value="management">Management</option>
            <option value="commercial">Commercial</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="competences-grid" *ngIf="competences.length > 0; else emptyCompetences">
          <div class="competence-card" *ngFor="let c of filteredCompetences">
            <div class="competence-header">
              <span class="competence-nom">{{ c.nom }}</span>
              <span class="competence-categorie">{{ c.categorie }}</span>
            </div>
            <div class="competence-body">
              <p><strong>Niveau requis:</strong> {{ c.niveau_requis || '-' }}/5</p>
              <p class="description">{{ c.description || 'Aucune description' }}</p>
              <p><strong>Employés:</strong> {{ getEmployesCountForCompetence(c.id!) }}</p>
            </div>
            <div class="competence-actions">
              <button class="btn-icon" (click)="viewCompetenceDetails(c)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editCompetence(c)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDeleteCompetence(c)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="activeView === 'employes'">
        <div class="employes-competences" *ngIf="employes.length > 0; else noEmployes">
          <div class="employe-card" *ngFor="let e of employes">
            <div class="employe-header">
              <span class="employe-nom">{{ e.nom }} {{ e.prenom }}</span>
              <span class="employe-poste">{{ e.poste }}</span>
            </div>
            <div class="employe-competences-list">
              <div *ngFor="let ec of getEmployeCompetences(e.id)" class="competence-item">
                <span class="comp-nom">{{ ec.competence_nom }}</span>
                <div class="comp-niveau">
                  <span class="niveau-valeur">Niveau {{ ec.niveau }}/5</span>
                  <div class="niveau-bar">
                    <div class="niveau-fill" [style.width.%]="ec.niveau * 20"></div>
                  </div>
                </div>
              </div>
              <div *ngIf="getEmployeCompetences(e.id).length === 0" class="no-competence">
                Aucune compétence attribuée
              </div>
            </div>
            <button class="btn-add-competence" (click)="assignToEmploye(e)">+ Ajouter compétence</button>
          </div>
        </div>
      </div>
      <ng-template #emptyCompetences>
        <div class="empty-state">
          <div class="empty-icon">⚡</div>
          <h2>Aucune compétence</h2>
          <p>Créez votre première compétence</p>
          <button class="btn-primary" (click)="showCompetenceForm = true">+ Nouvelle compétence</button>
        </div>
      </ng-template>
      <ng-template #noEmployes>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h2>Aucun employé</h2>
          <p>Ajoutez d'abord des employés</p>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedCompetence?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedCompetence">
            <p><strong>Catégorie:</strong> {{ selectedCompetence.categorie }}</p>
            <p><strong>Niveau requis:</strong> {{ selectedCompetence.niveau_requis || 'Non défini' }}/5</p>
            <p><strong>Description:</strong> {{ selectedCompetence.description || 'Aucune description' }}</p>
            <h4>Employés possédant cette compétence</h4>
            <table class="attributions-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Niveau</th>
                  <th>Date obtention</th>
                  <th>Date expiration</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let att of getAttributionsForCompetence(selectedCompetence.id!)">
                  <td>{{ getEmployeName(att.employe_id) }}</td>
                  <td>{{ att.niveau }}/5</td>
                  <td>{{ att.date_obtention | date }}</td>
                  <td>{{ att.date_expiration | date : 'Non définie' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer {{ deleteType === 'competence' ? 'cette compétence' : 'cette attribution' }} ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="confirmDelete()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .competences-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-assign { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-add-competence { background: #FDF2F8; border: 2px solid #FCE7F3; border-radius: 8px; padding: 8px 16px; margin-top: 10px; cursor: pointer; color: #EC4899; width: 100%; }
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
    .view-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
    .view-tabs button { background: none; border: 2px solid #FCE7F3; padding: 8px 16px; cursor: pointer; border-radius: 20px; color: #6B7280; }
    .view-tabs button.active { background: #EC4899; color: white; border-color: #EC4899; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .competences-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .competence-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .competence-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .competence-nom { font-weight: 600; color: #1F2937; }
    .competence-categorie { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .competence-body p { margin: 5px 0; color: #6B7280; }
    .description { font-size: 13px; color: #4B5563; }
    .competence-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .employes-competences { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .employe-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .employe-header { margin-bottom: 15px; }
    .employe-nom { font-weight: 600; color: #1F2937; display: block; }
    .employe-poste { font-size: 13px; color: #EC4899; }
    .employe-competences-list { margin: 15px 0; }
    .competence-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #FCE7F3; }
    .comp-nom { font-size: 13px; }
    .comp-niveau { width: 60%; }
    .niveau-valeur { font-size: 11px; color: #6B7280; }
    .niveau-bar { height: 6px; background: #FCE7F3; border-radius: 3px; margin-top: 2px; overflow: hidden; }
    .niveau-fill { height: 100%; background: #EC4899; border-radius: 3px; }
    .no-competence { text-align: center; color: #9CA3AF; padding: 10px; font-style: italic; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .attributions-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .attributions-table th { background: #FDF2F8; padding: 8px; text-align: left; font-size: 12px; }
    .attributions-table td { padding: 8px; border-bottom: 1px solid #FCE7F3; font-size: 13px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Competences implements OnInit {
  employes: any[] = [];
  competences: Competence[] = [];
  filteredCompetences: Competence[] = [];
  employeCompetences: EmployeCompetence[] = [];
  selectedCompetence: Competence | null = null;
  currentCompetence: any = {
    nom: '',
    categorie: 'technique',
    description: '',
    niveau_requis: 3
  };
  currentAttribution: any = {
    employe_id: '',
    competence_id: '',
    niveau: 3,
    date_obtention: new Date().toISOString().split('T')[0],
    date_expiration: '',
    certificat: '',
    notes: ''
  };
  activeView = 'competences';
  searchTerm = '';
  categorieFilter = '';
  showCompetenceForm = false;
  showAssignForm = false;
  editCompetenceMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  deleteType: 'competence' | 'attribution' = 'competence';
  itemToDelete: any = null;
  successMessage = '';
  ngOnInit() {
    this.loadEmployes();
    this.loadCompetences();
    this.loadEmployeCompetences();
  }
  loadEmployes() {
    const saved = localStorage.getItem('effectifs');
    this.employes = saved ? JSON.parse(saved) : [];
  }
  loadCompetences() {
    const saved = localStorage.getItem('competences');
    this.competences = saved ? JSON.parse(saved) : [];
    this.filteredCompetences = [...this.competences];
  }
  loadEmployeCompetences() {
    const saved = localStorage.getItem('employe_competences');
    this.employeCompetences = saved ? JSON.parse(saved) : [];
  }
  saveCompetence() {
    if (this.editCompetenceMode) {
      const index = this.competences.findIndex(c => c.id === this.currentCompetence.id);
      if (index !== -1) {
        this.competences[index] = { ...this.currentCompetence };
        this.showSuccess('Compétence modifiée !');
      }
    } else {
      const newCompetence = { ...this.currentCompetence, id: Date.now() };
      this.competences.push(newCompetence);
      this.showSuccess('Compétence ajoutée !');
    }
    localStorage.setItem('competences', JSON.stringify(this.competences));
    this.filterCompetences();
    this.cancelCompetenceForm();
  }
  onCompetenceChange() {
    const comp = this.competences.find(c => c.id === this.currentAttribution.competence_id);
    if (comp && comp.niveau_requis) {
      this.currentAttribution.niveau = comp.niveau_requis;
    }
  }
  saveAttribution() {
    const comp = this.competences.find(c => c.id === this.currentAttribution.competence_id);
    const newAttribution = { 
      ...this.currentAttribution, 
      id: Date.now(),
      competence_nom: comp?.nom
    };
    this.employeCompetences.push(newAttribution);
    localStorage.setItem('employe_competences', JSON.stringify(this.employeCompetences));
    this.showSuccess('Compétence attribuée !');
    this.showAssignForm = false;
    this.resetAttributionForm();
  }
  assignToEmploye(e: any) {
    this.currentAttribution.employe_id = e.id;
    this.showAssignForm = true;
  }
  editCompetence(c: Competence) {
    this.currentCompetence = { ...c };
    this.editCompetenceMode = true;
    this.showCompetenceForm = true;
  }
  viewCompetenceDetails(c: Competence) {
    this.selectedCompetence = c;
    this.showDetailsModal = true;
  }
  getEmployeCompetences(employeId: number): EmployeCompetence[] {
    return this.employeCompetences.filter(ec => ec.employe_id === employeId);
  }
  getAttributionsForCompetence(competenceId: number): EmployeCompetence[] {
    return this.employeCompetences.filter(ec => ec.competence_id === competenceId);
  }
  getEmployesCountForCompetence(competenceId: number): number {
    return this.employeCompetences.filter(ec => ec.competence_id === competenceId).length;
  }
  getEmployeName(employeId: number): string {
    const emp = this.employes.find(e => e.id === employeId);
    return emp ? `${emp.nom} ${emp.prenom}` : '';
  }
  confirmDeleteCompetence(c: Competence) {
    this.deleteType = 'competence';
    this.itemToDelete = c;
    this.showDeleteModal = true;
  }
  confirmDelete() {
    if (this.deleteType === 'competence' && this.itemToDelete) {
      this.competences = this.competences.filter(c => c.id !== this.itemToDelete.id);
      this.employeCompetences = this.employeCompetences.filter(ec => ec.competence_id !== this.itemToDelete.id);
      localStorage.setItem('competences', JSON.stringify(this.competences));
      localStorage.setItem('employe_competences', JSON.stringify(this.employeCompetences));
      this.filterCompetences();
      this.showSuccess('Compétence supprimée !');
    }
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }
  cancelCompetenceForm() {
    this.currentCompetence = {
      nom: '',
      categorie: 'technique',
      description: '',
      niveau_requis: 3
    };
    this.showCompetenceForm = false;
    this.editCompetenceMode = false;
  }
  resetAttributionForm() {
    this.currentAttribution = {
      employe_id: '',
      competence_id: '',
      niveau: 3,
      date_obtention: new Date().toISOString().split('T')[0],
      date_expiration: '',
      certificat: '',
      notes: ''
    };
  }
  filterCompetences() {
    let filtered = this.competences;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    if (this.categorieFilter) {
      filtered = filtered.filter(c => c.categorie === this.categorieFilter);
    }
    this.filteredCompetences = filtered;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
