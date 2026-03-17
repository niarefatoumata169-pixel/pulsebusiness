import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Employe {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  sexe: 'M' | 'F';
  situation_familiale: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  nombre_enfants: number;
  
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  
  poste: string;
  departement: string;
  date_embauche: string;
  type_contrat: 'cdi' | 'cdd' | 'stage' | 'prestataire';
  duree_contrat?: number;
  date_fin_contrat?: string;
  periode_essai: number;
  
  salaire_base: number;
  numero_securite_sociale?: string;
  numero_compte_bancaire?: string;
  nom_banque?: string;
  
  photo?: string;
  cv?: string;
  diplomes?: string;
  
  notes?: string;
  statut: 'actif' | 'inactif' | 'conge' | 'suspendu';
}

@Component({
  selector: 'app-effectifs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="effectifs-container">
      <div class="header">
        <div>
          <h1>Effectifs</h1>
          <p class="subtitle">{{ effectifs.length }} employé(s) • Masse salariale: {{ masseSalariale | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvel employé</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} employé</h3>
        <form (ngSubmit)="saveEmploye()" #employeForm="ngForm">
          <!-- Onglets -->
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'emploi'" (click)="activeTab = 'emploi'">Emploi</button>
            <button type="button" [class.active]="activeTab === 'salaire'" (click)="activeTab = 'salaire'">Salaire</button>
            <button type="button" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">Documents</button>
          </div>

          <!-- Onglet Informations -->
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Matricule *</label>
                <input type="text" [(ngModel)]="currentEmploye.matricule" name="matricule" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentEmploye.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="currentEmploye.prenom" name="prenom" required>
              </div>
              <div class="form-group">
                <label>Date naissance</label>
                <input type="date" [(ngModel)]="currentEmploye.date_naissance" name="date_naissance">
              </div>
              <div class="form-group">
                <label>Lieu naissance</label>
                <input type="text" [(ngModel)]="currentEmploye.lieu_naissance" name="lieu_naissance">
              </div>
              <div class="form-group">
                <label>Nationalité</label>
                <input type="text" [(ngModel)]="currentEmploye.nationalite" name="nationalite" value="Malienne">
              </div>
              <div class="form-group">
                <label>Sexe</label>
                <select [(ngModel)]="currentEmploye.sexe" name="sexe">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div class="form-group">
                <label>Situation familiale</label>
                <select [(ngModel)]="currentEmploye.situation_familiale" name="situation_familiale">
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf(ve)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nombre d'enfants</label>
                <input type="number" [(ngModel)]="currentEmploye.nombre_enfants" name="nombre_enfants" min="0">
              </div>
              <div class="form-group full-width">
                <label>Adresse</label>
                <textarea [(ngModel)]="currentEmploye.adresse" name="adresse" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input type="text" [(ngModel)]="currentEmploye.ville" name="ville">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" [(ngModel)]="currentEmploye.telephone" name="telephone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="currentEmploye.email" name="email">
              </div>
            </div>
          </div>

          <!-- Onglet Emploi -->
          <div *ngIf="activeTab === 'emploi'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Poste</label>
                <input type="text" [(ngModel)]="currentEmploye.poste" name="poste">
              </div>
              <div class="form-group">
                <label>Département</label>
                <select [(ngModel)]="currentEmploye.departement" name="departement">
                  <option value="">Sélectionner</option>
                  <option value="Direction">Direction</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Finance">Finance</option>
                  <option value="RH">Ressources Humaines</option>
                  <option value="Production">Production</option>
                  <option value="Logistique">Logistique</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date d'embauche</label>
                <input type="date" [(ngModel)]="currentEmploye.date_embauche" name="date_embauche">
              </div>
              <div class="form-group">
                <label>Type de contrat</label>
                <select [(ngModel)]="currentEmploye.type_contrat" name="type_contrat" (change)="onTypeContratChange()">
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="prestataire">Prestataire</option>
                </select>
              </div>
              <div class="form-group" *ngIf="currentEmploye.type_contrat === 'cdd'">
                <label>Durée (mois)</label>
                <input type="number" [(ngModel)]="currentEmploye.duree_contrat" name="duree_contrat" min="1">
              </div>
              <div class="form-group" *ngIf="currentEmploye.type_contrat === 'cdd'">
                <label>Date fin contrat</label>
                <input type="date" [(ngModel)]="currentEmploye.date_fin_contrat" name="date_fin_contrat">
              </div>
              <div class="form-group">
                <label>Période d'essai (jours)</label>
                <input type="number" [(ngModel)]="currentEmploye.periode_essai" name="periode_essai" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentEmploye.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="conge">En congé</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Onglet Salaire -->
          <div *ngIf="activeTab === 'salaire'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Salaire de base</label>
                <input type="number" [(ngModel)]="currentEmploye.salaire_base" name="salaire_base">
              </div>
              <div class="form-group">
                <label>N° Sécurité sociale</label>
                <input type="text" [(ngModel)]="currentEmploye.numero_securite_sociale" name="numero_securite_sociale">
              </div>
              <div class="form-group">
                <label>N° Compte bancaire</label>
                <input type="text" [(ngModel)]="currentEmploye.numero_compte_bancaire" name="numero_compte_bancaire">
              </div>
              <div class="form-group">
                <label>Nom de la banque</label>
                <input type="text" [(ngModel)]="currentEmploye.nom_banque" name="nom_banque">
              </div>
            </div>
          </div>

          <!-- Onglet Documents -->
          <div *ngIf="activeTab === 'documents'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Photo (URL)</label>
                <input type="text" [(ngModel)]="currentEmploye.photo" name="photo">
              </div>
              <div class="form-group">
                <label>CV (URL)</label>
                <input type="text" [(ngModel)]="currentEmploye.cv" name="cv">
              </div>
              <div class="form-group full-width">
                <label>Diplômes / Formations</label>
                <textarea [(ngModel)]="currentEmploye.diplomes" name="diplomes" rows="4" placeholder="Listez vos diplômes et formations..."></textarea>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentEmploye.notes" name="notes" rows="4"></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="employeForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="effectifs.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEmployes()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="departementFilter" (ngModelChange)="filterEmployes()" class="filter-select">
          <option value="">Tous départements</option>
          <option value="Direction">Direction</option>
          <option value="Commercial">Commercial</option>
          <option value="Finance">Finance</option>
          <option value="RH">RH</option>
          <option value="Production">Production</option>
          <option value="Logistique">Logistique</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterEmployes()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="conge">En congé</option>
          <option value="suspendu">Suspendu</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <!-- Tableau -->
      <div class="table-container" *ngIf="effectifs.length > 0; else emptyState">
        <table class="effectifs-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom & Prénom</th>
              <th>Poste</th>
              <th>Département</th>
              <th>Date embauche</th>
              <th>Salaire</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filteredEffectifs">
              <td>{{ e.matricule }}</td>
              <td>{{ e.nom }} {{ e.prenom }}</td>
              <td>{{ e.poste || '-' }}</td>
              <td>{{ e.departement || '-' }}</td>
              <td>{{ e.date_embauche | date:'dd/MM/yyyy' }}</td>
              <td>{{ e.salaire_base | number }} FCFA</td>
              <td><span class="badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="editEmploye(e)" title="Modifier">✏️</button>
                <button class="btn-icon" (click)="viewDetails(e)" title="Détails">👁️</button>
                <button class="btn-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Détails de l'employé</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedEmploye">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations personnelles</h4>
                <p><strong>Matricule:</strong> {{ selectedEmploye.matricule }}</p>
                <p><strong>Nom complet:</strong> {{ selectedEmploye.nom }} {{ selectedEmploye.prenom }}</p>
                <p><strong>Date naissance:</strong> {{ selectedEmploye.date_naissance | date }}</p>
                <p><strong>Lieu naissance:</strong> {{ selectedEmploye.lieu_naissance || '-' }}</p>
                <p><strong>Nationalité:</strong> {{ selectedEmploye.nationalite || '-' }}</p>
                <p><strong>Situation familiale:</strong> {{ selectedEmploye.situation_familiale }}</p>
                <p><strong>Enfants:</strong> {{ selectedEmploye.nombre_enfants || 0 }}</p>
              </div>
              <div class="detail-section">
                <h4>Coordonnées</h4>
                <p><strong>Adresse:</strong> {{ selectedEmploye.adresse || '-' }}</p>
                <p><strong>Ville:</strong> {{ selectedEmploye.ville || '-' }}</p>
                <p><strong>Téléphone:</strong> {{ selectedEmploye.telephone || '-' }}</p>
                <p><strong>Email:</strong> {{ selectedEmploye.email || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Emploi</h4>
                <p><strong>Poste:</strong> {{ selectedEmploye.poste || '-' }}</p>
                <p><strong>Département:</strong> {{ selectedEmploye.departement || '-' }}</p>
                <p><strong>Date embauche:</strong> {{ selectedEmploye.date_embauche | date }}</p>
                <p><strong>Type contrat:</strong> {{ getTypeContratLabel(selectedEmploye.type_contrat) }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedEmploye.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>Salaire & Banque</h4>
                <p><strong>Salaire base:</strong> {{ selectedEmploye.salaire_base | number }} FCFA</p>
                <p><strong>N° SS:</strong> {{ selectedEmploye.numero_securite_sociale || '-' }}</p>
                <p><strong>Compte bancaire:</strong> {{ selectedEmploye.numero_compte_bancaire || '-' }}</p>
                <p><strong>Banque:</strong> {{ selectedEmploye.nom_banque || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">��</div>
          <h2>Aucun employé</h2>
          <p>Ajoutez votre premier employé</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvel employé</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'employé <strong>{{ employeToDelete?.nom }} {{ employeToDelete?.prenom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteEmploye()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .effectifs-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #FCE7F3; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .effectifs-table { width: 100%; border-collapse: collapse; }
    .effectifs-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .effectifs-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.actif { background: #10B981; color: white; }
    .badge.conge { background: #F59E0B; color: white; }
    .badge.suspendu { background: #EC4899; color: white; }
    .badge.inactif { background: #9CA3AF; color: white; }
    
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .modal-body { max-height: 70vh; overflow-y: auto; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 15px; padding-bottom: 5px; border-bottom: 1px solid #FCE7F3; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Effectifs implements OnInit {
  effectifs: Employe[] = [];
  filteredEffectifs: Employe[] = [];
  selectedEmploye: Employe | null = null;
  
  currentEmploye: any = {
    matricule: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Malienne',
    sexe: 'M',
    situation_familiale: 'celibataire',
    nombre_enfants: 0,
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    poste: '',
    departement: '',
    date_embauche: new Date().toISOString().split('T')[0],
    type_contrat: 'cdi',
    periode_essai: 0,
    salaire_base: 0,
    statut: 'actif'
  };
  
  activeTab = 'info';
  searchTerm = '';
  departementFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  employeToDelete: Employe | null = null;
  successMessage = '';

  masseSalariale = 0;

  ngOnInit() { this.loadEffectifs(); }

  loadEffectifs() {
    const saved = localStorage.getItem('effectifs');
    this.effectifs = saved ? JSON.parse(saved) : [];
    this.filteredEffectifs = [...this.effectifs];
    this.calculerMasseSalariale();
  }

  saveEffectifs() {
    localStorage.setItem('effectifs', JSON.stringify(this.effectifs));
    this.calculerMasseSalariale();
  }

  saveEmploye() {
    if (this.editMode) {
      const index = this.effectifs.findIndex(e => e.id === this.currentEmploye.id);
      if (index !== -1) {
        this.effectifs[index] = { ...this.currentEmploye };
        this.showSuccess('Employé modifié !');
      }
    } else {
      const newEmploye = { ...this.currentEmploye, id: Date.now() };
      this.effectifs.push(newEmploye);
      this.showSuccess('Employé ajouté !');
    }
    this.saveEffectifs();
    this.filterEmployes();
    this.cancelForm();
  }

  onTypeContratChange() {
    if (this.currentEmploye.type_contrat === 'cdd' && !this.currentEmploye.duree_contrat) {
      this.currentEmploye.duree_contrat = 6;
    }
  }

  editEmploye(e: Employe) {
    this.currentEmploye = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  viewDetails(e: Employe) {
    this.selectedEmploye = e;
    this.showDetailsModal = true;
  }

  confirmDelete(e: Employe) {
    this.employeToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEmploye() {
    if (this.employeToDelete) {
      this.effectifs = this.effectifs.filter(e => e.id !== this.employeToDelete?.id);
      this.saveEffectifs();
      this.filterEmployes();
      this.showDeleteModal = false;
      this.employeToDelete = null;
      this.showSuccess('Employé supprimé !');
    }
  }

  cancelForm() {
    this.currentEmploye = {
      matricule: '',
      nom: '',
      prenom: '',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: 'Malienne',
      sexe: 'M',
      situation_familiale: 'celibataire',
      nombre_enfants: 0,
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      poste: '',
      departement: '',
      date_embauche: new Date().toISOString().split('T')[0],
      type_contrat: 'cdi',
      periode_essai: 0,
      salaire_base: 0,
      statut: 'actif'
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }

  filterEmployes() {
    let filtered = this.effectifs;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom?.toLowerCase().includes(term) ||
        e.prenom?.toLowerCase().includes(term) ||
        e.matricule?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
      );
    }

    if (this.departementFilter) {
      filtered = filtered.filter(e => e.departement === this.departementFilter);
    }

    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }

    this.filteredEffectifs = filtered;
  }

  calculerMasseSalariale() {
    this.masseSalariale = this.effectifs.reduce((s, e) => s + (e.salaire_base || 0), 0);
  }

  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', conge: 'En congé', suspendu: 'Suspendu', inactif: 'Inactif' };
    return labels[statut] || statut;
  }

  getTypeContratLabel(type: string): string {
    const labels: any = { cdi: 'CDI', cdd: 'CDD', stage: 'Stage', prestataire: 'Prestataire' };
    return labels[type] || type;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
