import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Candidature {
  id?: number;
  poste: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  date_naissance?: string;
  date_candidature: string;
  cv?: string;
  lettre_motivation?: string;
  diplomes?: string;
  experience?: number;
  competences?: string;
  source?: string;
  statut: 'nouvelle' | 'en_cours' | 'entretien' | 'test' | 'acceptee' | 'refusee';
  notes?: string;
}

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="candidatures-container">
      <div class="header">
        <div>
          <h1>Candidatures</h1>
          <p class="subtitle">{{ candidatures.length }} candidature(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle candidature</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} candidature</h3>
        <form (ngSubmit)="saveCandidature()" #candidatureForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Poste *</label>
              <input type="text" [(ngModel)]="currentCandidature.poste" name="poste" required>
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="currentCandidature.nom" name="nom" required>
            </div>
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" [(ngModel)]="currentCandidature.prenom" name="prenom" required>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="currentCandidature.email" name="email" required email>
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" [(ngModel)]="currentCandidature.telephone" name="telephone">
            </div>
            <div class="form-group">
              <label>Date naissance</label>
              <input type="date" [(ngModel)]="currentCandidature.date_naissance" name="date_naissance">
            </div>
            <div class="form-group">
              <label>Date candidature</label>
              <input type="date" [(ngModel)]="currentCandidature.date_candidature" name="date_candidature">
            </div>
            <div class="form-group">
              <label>Source</label>
              <select [(ngModel)]="currentCandidature.source" name="source">
                <option value="">Sélectionner</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="site">Site web</option>
                <option value="recommandation">Recommandation</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Expérience (années)</label>
              <input type="number" [(ngModel)]="currentCandidature.experience" name="experience" min="0" step="0.5">
            </div>
            <div class="form-group full-width">
              <label>Adresse</label>
              <textarea [(ngModel)]="currentCandidature.adresse" name="adresse" rows="2"></textarea>
            </div>
            <div class="form-group full-width">
              <label>CV (URL ou lien)</label>
              <input type="text" [(ngModel)]="currentCandidature.cv" name="cv">
            </div>
            <div class="form-group full-width">
              <label>Lettre de motivation (URL ou lien)</label>
              <input type="text" [(ngModel)]="currentCandidature.lettre_motivation" name="lettre_motivation">
            </div>
            <div class="form-group full-width">
              <label>Diplômes / Formations</label>
              <textarea [(ngModel)]="currentCandidature.diplomes" name="diplomes" rows="3" placeholder="Listez vos diplômes..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Compétences</label>
              <textarea [(ngModel)]="currentCandidature.competences" name="competences" rows="3" placeholder="Séparez par des virgules"></textarea>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentCandidature.statut" name="statut">
                <option value="nouvelle">Nouvelle</option>
                <option value="en_cours">En cours</option>
                <option value="entretien">Entretien</option>
                <option value="test">Test technique</option>
                <option value="acceptee">Acceptée</option>
                <option value="refusee">Refusée</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentCandidature.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="candidatureForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="candidatures.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCandidatures()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="posteFilter" (ngModelChange)="filterCandidatures()" class="filter-select">
          <option value="">Tous postes</option>
          <option *ngFor="let p of postes" [value]="p">{{ p }}</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterCandidatures()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="nouvelle">Nouvelle</option>
          <option value="en_cours">En cours</option>
          <option value="entretien">Entretien</option>
          <option value="test">Test</option>
          <option value="acceptee">Acceptée</option>
          <option value="refusee">Refusée</option>
        </select>
      </div>

      <!-- Tableau -->
      <div class="table-container" *ngIf="candidatures.length > 0; else emptyState">
        <table class="candidatures-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Poste</th>
              <th>Candidat</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Expérience</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredCandidatures">
              <td>{{ c.date_candidature | date:'dd/MM/yyyy' }}</td>
              <td>{{ c.poste }}</td>
              <td>{{ c.nom }} {{ c.prenom }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.telephone || '-' }}</td>
              <td>{{ c.experience || 0 }} ans</td>
              <td><span class="badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="btn-icon" (click)="editCandidature(c)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>Aucune candidature</h2>
          <p>Ajoutez votre première candidature</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle candidature</button>
        </div>
      </ng-template>

      <!-- Modal de détails -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Détails de la candidature</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedCandidature">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations personnelles</h4>
                <p><strong>Nom complet:</strong> {{ selectedCandidature.nom }} {{ selectedCandidature.prenom }}</p>
                <p><strong>Email:</strong> {{ selectedCandidature.email }}</p>
                <p><strong>Téléphone:</strong> {{ selectedCandidature.telephone || '-' }}</p>
                <p><strong>Date naissance:</strong> {{ selectedCandidature.date_naissance | date }}</p>
                <p><strong>Adresse:</strong> {{ selectedCandidature.adresse || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Poste & Expérience</h4>
                <p><strong>Poste visé:</strong> {{ selectedCandidature.poste }}</p>
                <p><strong>Date candidature:</strong> {{ selectedCandidature.date_candidature | date }}</p>
                <p><strong>Expérience:</strong> {{ selectedCandidature.experience || 0 }} ans</p>
                <p><strong>Source:</strong> {{ selectedCandidature.source || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Compétences</h4>
                <p>{{ selectedCandidature.competences || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Diplômes / Formations</h4>
                <p>{{ selectedCandidature.diplomes || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Documents</h4>
                <p *ngIf="selectedCandidature.cv"><a [href]="selectedCandidature.cv" target="_blank">📄 Voir CV</a></p>
                <p *ngIf="selectedCandidature.lettre_motivation"><a [href]="selectedCandidature.lettre_motivation" target="_blank">📝 Voir lettre de motivation</a></p>
                <p *ngIf="!selectedCandidature.cv && !selectedCandidature.lettre_motivation">Aucun document</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedCandidature.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer la candidature de <strong>{{ candidatureToDelete?.nom }} {{ candidatureToDelete?.prenom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteCandidature()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .candidatures-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .candidatures-table { width: 100%; border-collapse: collapse; }
    .candidatures-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .candidatures-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.nouvelle { background: #EC4899; color: white; }
    .badge.en_cours { background: #F59E0B; color: white; }
    .badge.entretien { background: #10B981; color: white; }
    .badge.test { background: #3B82F6; color: white; }
    .badge.acceptee { background: #10B981; color: white; }
    .badge.refusee { background: #EF4444; color: white; }
    
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
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Candidatures implements OnInit {
  candidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  selectedCandidature: Candidature | null = null;
  postes: string[] = [];

  currentCandidature: any = {
    poste: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    date_candidature: new Date().toISOString().split('T')[0],
    cv: '',
    lettre_motivation: '',
    diplomes: '',
    experience: 0,
    competences: '',
    source: '',
    statut: 'nouvelle',
    notes: ''
  };

  searchTerm = '';
  posteFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  candidatureToDelete: Candidature | null = null;
  successMessage = '';

  ngOnInit() { 
    this.loadCandidatures(); 
    this.loadPostes();
  }

  loadCandidatures() {
    const saved = localStorage.getItem('candidatures');
    this.candidatures = saved ? JSON.parse(saved) : [];
    this.filteredCandidatures = [...this.candidatures];
  }

  loadPostes() {
    const postesSet = new Set(this.candidatures.map(c => c.poste));
    this.postes = Array.from(postesSet);
  }

  saveCandidature() {
    if (this.editMode) {
      const index = this.candidatures.findIndex(c => c.id === this.currentCandidature.id);
      if (index !== -1) {
        this.candidatures[index] = { ...this.currentCandidature };
        this.showSuccess('Candidature modifiée !');
      }
    } else {
      const newCandidature = { ...this.currentCandidature, id: Date.now() };
      this.candidatures.push(newCandidature);
      this.showSuccess('Candidature ajoutée !');
    }
    
    localStorage.setItem('candidatures', JSON.stringify(this.candidatures));
    this.loadPostes();
    this.filterCandidatures();
    this.cancelForm();
  }

  editCandidature(c: Candidature) {
    this.currentCandidature = { ...c };
    this.editMode = true;
    this.showForm = true;
  }

  viewDetails(c: Candidature) {
    this.selectedCandidature = c;
    this.showDetailsModal = true;
  }

  confirmDelete(c: Candidature) {
    this.candidatureToDelete = c;
    this.showDeleteModal = true;
  }

  deleteCandidature() {
    if (this.candidatureToDelete) {
      this.candidatures = this.candidatures.filter(c => c.id !== this.candidatureToDelete?.id);
      localStorage.setItem('candidatures', JSON.stringify(this.candidatures));
      this.loadPostes();
      this.filterCandidatures();
      this.showDeleteModal = false;
      this.candidatureToDelete = null;
      this.showSuccess('Candidature supprimée !');
    }
  }

  cancelForm() {
    this.currentCandidature = {
      poste: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      date_naissance: '',
      date_candidature: new Date().toISOString().split('T')[0],
      cv: '',
      lettre_motivation: '',
      diplomes: '',
      experience: 0,
      competences: '',
      source: '',
      statut: 'nouvelle',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterCandidatures() {
    let filtered = this.candidatures;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.poste?.toLowerCase().includes(term)
      );
    }

    if (this.posteFilter) {
      filtered = filtered.filter(c => c.poste === this.posteFilter);
    }

    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }

    this.filteredCandidatures = filtered;
  }

  getStatutLabel(statut: string): string {
    const labels: any = { 
      nouvelle: 'Nouvelle', 
      en_cours: 'En cours', 
      entretien: 'Entretien', 
      test: 'Test', 
      acceptee: 'Acceptée', 
      refusee: 'Refusée' 
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
