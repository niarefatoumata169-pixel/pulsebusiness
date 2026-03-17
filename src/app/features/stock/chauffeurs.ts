import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Chauffeur {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  numero_permis: string;
  categorie_permis: string;
  date_obtention_permis: string;
  date_expiration_permis: string;
  date_embauche: string;
  type_contrat: 'cdi' | 'cdd' | 'prestataire';
  salaire_base: number;
  experience_annees: number;
  certifications?: string;
  specialisations?: string;
  medecine_travail_date?: string;
  medecine_travail_validite?: string;
  casier_judiciaire?: string;
  photo?: string;
  statut: 'actif' | 'conge' | 'inactif' | 'suspendu';
  vehicule_attitre?: number;
  notes?: string;
}

@Component({
  selector: 'app-chauffeurs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chauffeurs-container">
      <div class="header">
        <div>
          <h1>Chauffeurs</h1>
          <p class="subtitle">{{ chauffeurs.length }} chauffeur(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau chauffeur</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} chauffeur</h3>
        <form (ngSubmit)="saveChauffeur()" #chauffeurForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'permis'" (click)="activeTab = 'permis'">Permis</button>
            <button type="button" [class.active]="activeTab === 'emploi'" (click)="activeTab = 'emploi'">Emploi</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Matricule *</label>
                <input type="text" [(ngModel)]="currentChauffeur.matricule" name="matricule" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentChauffeur.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="currentChauffeur.prenom" name="prenom" required>
              </div>
              <div class="form-group">
                <label>Date naissance</label>
                <input type="date" [(ngModel)]="currentChauffeur.date_naissance" name="date_naissance">
              </div>
              <div class="form-group">
                <label>Lieu naissance</label>
                <input type="text" [(ngModel)]="currentChauffeur.lieu_naissance" name="lieu_naissance">
              </div>
              <div class="form-group">
                <label>Nationalité</label>
                <input type="text" [(ngModel)]="currentChauffeur.nationalite" name="nationalite" value="Malienne">
              </div>
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentChauffeur.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentChauffeur.ville" name="ville">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentChauffeur.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentChauffeur.email" name="email">
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'permis'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>N° permis *</label>
                <input type="text" [(ngModel)]="currentChauffeur.numero_permis" name="numero_permis" required>
              </div>
              <div class="form-group">
                <label>Catégorie permis</label>
                <input type="text" [(ngModel)]="currentChauffeur.categorie_permis" name="categorie_permis" placeholder="Ex: B, C, D, E">
              </div>
              <div class="form-group">
                <label>Date obtention</label>
                <input type="date" [(ngModel)]="currentChauffeur.date_obtention_permis" name="date_obtention_permis">
              </div>
              <div class="form-group">
                <label>Date expiration</label>
                <input type="date" [(ngModel)]="currentChauffeur.date_expiration_permis" name="date_expiration_permis">
              </div>
              <div class="form-group">
                <label>Médecine du travail</label>
                <input type="date" [(ngModel)]="currentChauffeur.medecine_travail_date" name="medecine_travail_date">
              </div>
              <div class="form-group">
                <label>Validité médecine</label>
                <input type="date" [(ngModel)]="currentChauffeur.medecine_travail_validite" name="medecine_travail_validite">
              </div>
              <div class="form-group">
                <label>Casier judiciaire</label>
                <input type="text" [(ngModel)]="currentChauffeur.casier_judiciaire" name="casier_judiciaire" placeholder="N° ou référence">
              </div>
              <div class="form-group">
                <label>Certifications</label>
                <textarea [(ngModel)]="currentChauffeur.certifications" name="certifications" rows="3" placeholder="Certifications supplémentaires..."></textarea>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'emploi'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Date d'embauche</label>
                <input type="date" [(ngModel)]="currentChauffeur.date_embauche" name="date_embauche">
              </div>
              <div class="form-group">
                <label>Type de contrat</label>
                <select [(ngModel)]="currentChauffeur.type_contrat" name="type_contrat">
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="prestataire">Prestataire</option>
                </select>
              </div>
              <div class="form-group">
                <label>Salaire de base</label>
                <input type="number" [(ngModel)]="currentChauffeur.salaire_base" name="salaire_base" min="0">
              </div>
              <div class="form-group">
                <label>Expérience (années)</label>
                <input type="number" [(ngModel)]="currentChauffeur.experience_annees" name="experience_annees" min="0" step="0.5">
              </div>
              <div class="form-group">
                <label>Spécialisations</label>
                <input type="text" [(ngModel)]="currentChauffeur.specialisations" name="specialisations" placeholder="Ex: Transport frigorifique, Matières dangereuses">
              </div>
              <div class="form-group">
                <label>Véhicule attitré</label>
                <select [(ngModel)]="currentChauffeur.vehicule_attitre" name="vehicule_attitre">
                  <option value="">Aucun</option>
                  <option *ngFor="let v of vehicules" [value]="v.id">{{ v.immatriculation }} - {{ v.marque }} {{ v.modele }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentChauffeur.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="conge">En congé</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentChauffeur.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="chauffeurForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="chauffeurs.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterChauffeurs()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterChauffeurs()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="conge">Congé</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select [(ngModel)]="permisFilter" (ngModelChange)="filterChauffeurs()" class="filter-select">
          <option value="">Tous permis</option>
          <option value="B">Permis B</option>
          <option value="C">Permis C</option>
          <option value="D">Permis D</option>
          <option value="E">Permis E</option>
        </select>
      </div>
      <div class="chauffeurs-grid" *ngIf="chauffeurs.length > 0; else emptyState">
        <div class="chauffeur-card" *ngFor="let c of filteredChauffeurs" [class.alerte]="isPermisExpired(c)">
          <div class="chauffeur-header">
            <span class="chauffeur-nom">{{ c.nom }} {{ c.prenom }}</span>
            <span class="chauffeur-badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span>
          </div>
          <div class="chauffeur-body">
            <p><span class="label">Matricule:</span> {{ c.matricule }}</p>
            <p><span class="label">Permis:</span> {{ c.categorie_permis }} ({{ c.numero_permis }})</p>
            <p><span class="label">Expiration:</span> {{ c.date_expiration_permis | date }}</p>
            <p><span class="label">Tél:</span> {{ c.telephone }}</p>
            <div class="permis-alert" *ngIf="isPermisExpired(c)">
              ⚠️ Permis expiré
            </div>
          </div>
          <div class="chauffeur-footer">
            <div class="chauffeur-actions">
              <button class="btn-icon" (click)="viewDetails(c)" title="Voir">👁️</button>
              <button class="btn-icon" (click)="editChauffeur(c)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👨‍✈️</div>
          <h2>Aucun chauffeur</h2>
          <p>Ajoutez votre premier chauffeur</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau chauffeur</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedChauffeur?.nom }} {{ selectedChauffeur?.prenom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedChauffeur">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations personnelles</h4>
                <p><strong>Matricule:</strong> {{ selectedChauffeur.matricule }}</p>
                <p><strong>Nom complet:</strong> {{ selectedChauffeur.nom }} {{ selectedChauffeur.prenom }}</p>
                <p><strong>Date naissance:</strong> {{ selectedChauffeur.date_naissance | date }}</p>
                <p><strong>Lieu naissance:</strong> {{ selectedChauffeur.lieu_naissance }}</p>
                <p><strong>Nationalité:</strong> {{ selectedChauffeur.nationalite }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedChauffeur.adresse }}</p>
                <p><strong>Ville:</strong> {{ selectedChauffeur.ville }}</p>
                <p><strong>Téléphone:</strong> {{ selectedChauffeur.telephone }}</p>
                <p><strong>Email:</strong> {{ selectedChauffeur.email }}</p>
              </div>
              <div class="detail-section">
                <h4>Permis de conduire</h4>
                <p><strong>N° permis:</strong> {{ selectedChauffeur.numero_permis }}</p>
                <p><strong>Catégorie:</strong> {{ selectedChauffeur.categorie_permis }}</p>
                <p><strong>Date obtention:</strong> {{ selectedChauffeur.date_obtention_permis | date }}</p>
                <p><strong>Date expiration:</strong> {{ selectedChauffeur.date_expiration_permis | date }}</p>
              </div>
              <div class="detail-section">
                <h4>Emploi</h4>
                <p><strong>Date embauche:</strong> {{ selectedChauffeur.date_embauche | date }}</p>
                <p><strong>Type contrat:</strong> {{ getContratLabel(selectedChauffeur.type_contrat) }}</p>
                <p><strong>Salaire:</strong> {{ selectedChauffeur.salaire_base | number }} FCFA</p>
                <p><strong>Expérience:</strong> {{ selectedChauffeur.experience_annees }} ans</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedChauffeur.statut) }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedChauffeur.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le chauffeur <strong>{{ chauffeurToDelete?.nom }} {{ chauffeurToDelete?.prenom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteChauffeur()">��️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chauffeurs-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .chauffeurs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .chauffeur-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .chauffeur-card.alerte { border-left: 4px solid #EF4444; }
    .chauffeur-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .chauffeur-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .chauffeur-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .chauffeur-badge.actif { background: #10B981; color: white; }
    .chauffeur-badge.conge { background: #F59E0B; color: white; }
    .chauffeur-badge.inactif { background: #9CA3AF; color: white; }
    .chauffeur-badge.suspendu { background: #EF4444; color: white; }
    .chauffeur-body p { margin: 5px 0; color: #6B7280; }
    .chauffeur-body .label { color: #4B5563; width: 80px; display: inline-block; }
    .permis-alert { margin-top: 10px; padding: 8px; background: #FEF2F2; border-radius: 4px; color: #EF4444; font-size: 12px; }
    .chauffeur-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .chauffeur-actions { display: flex; justify-content: flex-end; gap: 8px; }
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
export class Chauffeurs implements OnInit {
  vehicules: any[] = [];
  chauffeurs: Chauffeur[] = [];
  filteredChauffeurs: Chauffeur[] = [];
  selectedChauffeur: Chauffeur | null = null;
  currentChauffeur: any = {
    matricule: 'CH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Malienne',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    numero_permis: '',
    categorie_permis: '',
    date_obtention_permis: '',
    date_expiration_permis: '',
    date_embauche: new Date().toISOString().split('T')[0],
    type_contrat: 'cdi',
    salaire_base: 0,
    experience_annees: 0,
    certifications: '',
    specialisations: '',
    medecine_travail_date: '',
    medecine_travail_validite: '',
    casier_judiciaire: '',
    photo: '',
    statut: 'actif',
    vehicule_attitre: null,
    notes: ''
  };
  activeTab = 'info';
  searchTerm = '';
  statutFilter = '';
  permisFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  chauffeurToDelete: Chauffeur | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadVehicules();
    this.loadChauffeurs();
  }
  loadVehicules() {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
  }
  loadChauffeurs() {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
    this.filteredChauffeurs = [...this.chauffeurs];
  }
  saveChauffeur() {
    if (this.editMode) {
      const index = this.chauffeurs.findIndex(c => c.id === this.currentChauffeur.id);
      if (index !== -1) {
        this.chauffeurs[index] = { ...this.currentChauffeur };
        this.showSuccess('Chauffeur modifié !');
      }
    } else {
      const newChauffeur = { ...this.currentChauffeur, id: Date.now() };
      this.chauffeurs.push(newChauffeur);
      this.showSuccess('Chauffeur ajouté !');
    }
    localStorage.setItem('chauffeurs', JSON.stringify(this.chauffeurs));
    this.filterChauffeurs();
    this.cancelForm();
  }
  editChauffeur(c: Chauffeur) {
    this.currentChauffeur = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(c: Chauffeur) {
    this.selectedChauffeur = c;
    this.showDetailsModal = true;
  }
  confirmDelete(c: Chauffeur) {
    this.chauffeurToDelete = c;
    this.showDeleteModal = true;
  }
  deleteChauffeur() {
    if (this.chauffeurToDelete) {
      this.chauffeurs = this.chauffeurs.filter(c => c.id !== this.chauffeurToDelete?.id);
      localStorage.setItem('chauffeurs', JSON.stringify(this.chauffeurs));
      this.filterChauffeurs();
      this.showDeleteModal = false;
      this.chauffeurToDelete = null;
      this.showSuccess('Chauffeur supprimé !');
    }
  }
  cancelForm() {
    this.currentChauffeur = {
      matricule: 'CH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      nom: '',
      prenom: '',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: 'Malienne',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      numero_permis: '',
      categorie_permis: '',
      date_obtention_permis: '',
      date_expiration_permis: '',
      date_embauche: new Date().toISOString().split('T')[0],
      type_contrat: 'cdi',
      salaire_base: 0,
      experience_annees: 0,
      certifications: '',
      specialisations: '',
      medecine_travail_date: '',
      medecine_travail_validite: '',
      casier_judiciaire: '',
      photo: '',
      statut: 'actif',
      vehicule_attitre: null,
      notes: ''
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterChauffeurs() {
    let filtered = this.chauffeurs;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.matricule?.toLowerCase().includes(term) ||
        c.numero_permis?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    if (this.permisFilter) {
      filtered = filtered.filter(c => c.categorie_permis?.includes(this.permisFilter));
    }
    this.filteredChauffeurs = filtered;
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', conge: 'Congé', inactif: 'Inactif', suspendu: 'Suspendu' };
    return labels[statut] || statut;
  }
  getContratLabel(contrat: string): string {
    const labels: any = { cdi: 'CDI', cdd: 'CDD', prestataire: 'Prestataire' };
    return labels[contrat] || contrat;
  }
  isPermisExpired(c: Chauffeur): boolean {
    if (!c.date_expiration_permis) return false;
    return new Date(c.date_expiration_permis) < new Date();
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
