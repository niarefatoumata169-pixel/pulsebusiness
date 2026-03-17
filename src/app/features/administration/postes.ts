import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Poste {
  id?: number;
  code: string;
  titre: string;
  description: string;
  departement_id?: number;
  departement_nom?: string;
  niveau_hierarchique: number;
  categorie: 'cadre' | 'agent_maitrise' | 'employe' | 'ouvrier' | 'stagiaire';
  type_contrat: 'cdi' | 'cdd' | 'stage' | 'prestataire';
  salaire_min: number;
  salaire_max: number;
  competences_requises: string;
  formations_requises: string;
  experience_requise: number;
  missions: string;
  superviseur_id?: number;
  superviseur_titre?: string;
  statut: 'actif' | 'inactif' | 'en_creation';
  notes?: string;
}

@Component({
  selector: 'app-postes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="postes-container">
      <div class="header">
        <div>
          <h1>Postes</h1>
          <p class="subtitle">{{ postes.length }} poste(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau poste</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} poste</h3>
        <form (ngSubmit)="savePoste()" #posteForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'missions'" (click)="activeTab = 'missions'">Missions</button>
            <button type="button" [class.active]="activeTab === 'competences'" (click)="activeTab = 'competences'">Compétences</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentPoste.code" name="code" required>
              </div>
              <div class="form-group">
                <label>Titre *</label>
                <input type="text" [(ngModel)]="currentPoste.titre" name="titre" required>
              </div>
              <div class="form-group">
                <label>Département</label>
                <select [(ngModel)]="currentPoste.departement_id" name="departement_id" (change)="onDepartementChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let d of departements" [value]="d.id">{{ d.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Niveau hiérarchique</label>
                <input type="number" [(ngModel)]="currentPoste.niveau_hierarchique" name="niveau_hierarchique" min="1" max="10">
              </div>
              <div class="form-group">
                <label>Catégorie</label>
                <select [(ngModel)]="currentPoste.categorie" name="categorie">
                  <option value="cadre">Cadre</option>
                  <option value="agent_maitrise">Agent de maîtrise</option>
                  <option value="employe">Employé</option>
                  <option value="ouvrier">Ouvrier</option>
                  <option value="stagiaire">Stagiaire</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type de contrat</label>
                <select [(ngModel)]="currentPoste.type_contrat" name="type_contrat">
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="prestataire">Prestataire</option>
                </select>
              </div>
              <div class="form-group">
                <label>Salaire min (FCFA)</label>
                <input type="number" [(ngModel)]="currentPoste.salaire_min" name="salaire_min" min="0">
              </div>
              <div class="form-group">
                <label>Salaire max (FCFA)</label>
                <input type="number" [(ngModel)]="currentPoste.salaire_max" name="salaire_max" min="0">
              </div>
              <div class="form-group">
                <label>Expérience requise (années)</label>
                <input type="number" [(ngModel)]="currentPoste.experience_requise" name="experience_requise" min="0" step="0.5">
              </div>
              <div class="form-group">
                <label>Superviseur</label>
                <select [(ngModel)]="currentPoste.superviseur_id" name="superviseur_id" (change)="onSuperviseurChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let p of postes" [value]="p.id">{{ p.titre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentPoste.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="en_creation">En création</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'missions'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Missions principales</label>
                <textarea [(ngModel)]="currentPoste.missions" name="missions" rows="8" placeholder="Décrivez les missions principales du poste..."></textarea>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'competences'" class="tab-content">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Compétences requises</label>
                <textarea [(ngModel)]="currentPoste.competences_requises" name="competences_requises" rows="6" placeholder="Listez les compétences nécessaires..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Formations requises</label>
                <textarea [(ngModel)]="currentPoste.formations_requises" name="formations_requises" rows="4" placeholder="Diplômes, certifications..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentPoste.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="posteForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="postes.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterPostes()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="categorieFilter" (ngModelChange)="filterPostes()" class="filter-select">
          <option value="">Toutes catégories</option>
          <option value="cadre">Cadre</option>
          <option value="agent_maitrise">Agent maîtrise</option>
          <option value="employe">Employé</option>
          <option value="ouvrier">Ouvrier</option>
          <option value="stagiaire">Stagiaire</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterPostes()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="en_creation">En création</option>
        </select>
      </div>
      <div class="postes-grid" *ngIf="postes.length > 0; else emptyState">
        <div class="poste-card" *ngFor="let p of filteredPostes">
          <div class="poste-header">
            <span class="poste-titre">{{ p.titre }}</span>
            <span class="poste-code">{{ p.code }}</span>
          </div>
          <div class="poste-body">
            <p><span class="label">Département:</span> {{ p.departement_nom || '-' }}</p>
            <p><span class="label">Niveau:</span> {{ p.niveau_hierarchique }}</p>
            <p><span class="label">Catégorie:</span> {{ getCategorieLabel(p.categorie) }}</p>
            <p><span class="label">Salaire:</span> {{ p.salaire_min | number }} - {{ p.salaire_max | number }} FCFA</p>
            <p><span class="label">Expérience:</span> {{ p.experience_requise }} ans</p>
          </div>
          <div class="poste-footer">
            <span class="badge-statut" [class]="p.statut">{{ getStatutLabel(p.statut) }}</span>
            <div class="poste-actions">
              <button class="btn-icon" (click)="viewDetails(p)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editPoste(p)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(p)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👔</div>
          <h2>Aucun poste</h2>
          <p>Créez votre premier poste</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau poste</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedPoste?.titre }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedPoste">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Code:</strong> {{ selectedPoste.code }}</p>
                <p><strong>Titre:</strong> {{ selectedPoste.titre }}</p>
                <p><strong>Département:</strong> {{ selectedPoste.departement_nom || '-' }}</p>
                <p><strong>Niveau:</strong> {{ selectedPoste.niveau_hierarchique }}</p>
                <p><strong>Catégorie:</strong> {{ getCategorieLabel(selectedPoste.categorie) }}</p>
                <p><strong>Type contrat:</strong> {{ getTypeContratLabel(selectedPoste.type_contrat) }}</p>
              </div>
              <div class="detail-section">
                <h4>Rémunération</h4>
                <p><strong>Salaire min:</strong> {{ selectedPoste.salaire_min | number }} FCFA</p>
                <p><strong>Salaire max:</strong> {{ selectedPoste.salaire_max | number }} FCFA</p>
                <p><strong>Expérience requise:</strong> {{ selectedPoste.experience_requise }} ans</p>
              </div>
              <div class="detail-section">
                <h4>Hiérarchie</h4>
                <p><strong>Superviseur:</strong> {{ selectedPoste.superviseur_titre || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Missions</h4>
                <p>{{ selectedPoste.missions }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Compétences requises</h4>
                <p>{{ selectedPoste.competences_requises }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Formations requises</h4>
                <p>{{ selectedPoste.formations_requises }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedPoste.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le poste <strong>{{ posteToDelete?.titre }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deletePoste()">��️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .postes-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .postes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .poste-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .poste-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .poste-titre { font-weight: 600; color: #1F2937; font-size: 16px; }
    .poste-code { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .poste-body p { margin: 5px 0; color: #6B7280; }
    .poste-body .label { color: #4B5563; width: 100px; display: inline-block; }
    .poste-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.actif { background: #10B981; color: white; }
    .badge-statut.inactif { background: #9CA3AF; color: white; }
    .badge-statut.en_creation { background: #F59E0B; color: white; }
    .poste-actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 900px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Postes implements OnInit {
  departements: any[] = [];
  postes: Poste[] = [];
  filteredPostes: Poste[] = [];
  selectedPoste: Poste | null = null;
  currentPoste: any = {
    code: 'POS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    titre: '',
    departement_id: '',
    niveau_hierarchique: 1,
    categorie: 'employe',
    type_contrat: 'cdi',
    salaire_min: 0,
    salaire_max: 0,
    competences_requises: '',
    formations_requises: '',
    experience_requise: 0,
    missions: '',
    superviseur_id: '',
    statut: 'actif',
    notes: ''
  };
  activeTab = 'info';
  searchTerm = '';
  categorieFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  posteToDelete: Poste | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadDepartements();
    this.loadPostes();
  }
  loadDepartements() {
    const saved = localStorage.getItem('departements');
    this.departements = saved ? JSON.parse(saved) : [];
  }
  loadPostes() {
    const saved = localStorage.getItem('postes');
    this.postes = saved ? JSON.parse(saved) : [];
    this.updateRelations();
    this.filteredPostes = [...this.postes];
  }
  updateRelations() {
    this.postes.forEach(p => {
      if (p.departement_id) {
        const dept = this.departements.find(d => d.id === p.departement_id);
        p.departement_nom = dept?.nom;
      }
      if (p.superviseur_id) {
        const sup = this.postes.find(s => s.id === p.superviseur_id);
        p.superviseur_titre = sup?.titre;
      }
    });
  }
  onDepartementChange() {
    const dept = this.departements.find(d => d.id === this.currentPoste.departement_id);
    if (dept) this.currentPoste.departement_nom = dept.nom;
  }
  onSuperviseurChange() {
    const sup = this.postes.find(s => s.id === this.currentPoste.superviseur_id);
    if (sup) this.currentPoste.superviseur_titre = sup.titre;
  }
  savePoste() {
    const dept = this.departements.find(d => d.id === this.currentPoste.departement_id);
    const sup = this.postes.find(s => s.id === this.currentPoste.superviseur_id);
    if (this.editMode) {
      const index = this.postes.findIndex(p => p.id === this.currentPoste.id);
      if (index !== -1) {
        this.postes[index] = { 
          ...this.currentPoste, 
          departement_nom: dept?.nom,
          superviseur_titre: sup?.titre
        };
        this.showSuccess('Poste modifié !');
      }
    } else {
      const newPoste = { 
        ...this.currentPoste, 
        id: Date.now(),
        departement_nom: dept?.nom,
        superviseur_titre: sup?.titre
      };
      this.postes.push(newPoste);
      this.showSuccess('Poste ajouté !');
    }
    localStorage.setItem('postes', JSON.stringify(this.postes));
    this.filterPostes();
    this.cancelForm();
  }
  editPoste(p: Poste) {
    this.currentPoste = { ...p };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(p: Poste) {
    this.selectedPoste = p;
    this.showDetailsModal = true;
  }
  confirmDelete(p: Poste) {
    this.posteToDelete = p;
    this.showDeleteModal = true;
  }
  deletePoste() {
    if (this.posteToDelete) {
      this.postes = this.postes.filter(p => p.id !== this.posteToDelete?.id);
      localStorage.setItem('postes', JSON.stringify(this.postes));
      this.filterPostes();
      this.showDeleteModal = false;
      this.posteToDelete = null;
      this.showSuccess('Poste supprimé !');
    }
  }
  cancelForm() {
    this.currentPoste = {
      code: 'POS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      titre: '',
      departement_id: '',
      niveau_hierarchique: 1,
      categorie: 'employe',
      type_contrat: 'cdi',
      salaire_min: 0,
      salaire_max: 0,
      competences_requises: '',
      formations_requises: '',
      experience_requise: 0,
      missions: '',
      superviseur_id: '',
      statut: 'actif',
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterPostes() {
    let filtered = this.postes;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.titre?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.missions?.toLowerCase().includes(term)
      );
    }
    if (this.categorieFilter) {
      filtered = filtered.filter(p => p.categorie === this.categorieFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(p => p.statut === this.statutFilter);
    }
    this.filteredPostes = filtered;
  }
  getCategorieLabel(cat: string): string {
    const labels: any = { 
      cadre: 'Cadre', 
      agent_maitrise: 'Agent de maîtrise', 
      employe: 'Employé', 
      ouvrier: 'Ouvrier', 
      stagiaire: 'Stagiaire' 
    };
    return labels[cat] || cat;
  }
  getTypeContratLabel(type: string): string {
    const labels: any = { cdi: 'CDI', cdd: 'CDD', stage: 'Stage', prestataire: 'Prestataire' };
    return labels[type] || type;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', en_creation: 'En création' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
