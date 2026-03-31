import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Competence {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  categorie: 'technique' | 'soft_skill' | 'langue' | 'certification';
  niveau: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  employes_maitrisant: number[]; // ids des employés
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="competences-container">
      <div class="header">
        <div>
          <h1>💡 Gestion des compétences</h1>
          <p class="subtitle">{{ competences.length }} compétence(s) • {{ getEmployesCompetents() }} employé(s) compétent(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvelle compétence</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="competences.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">💡</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ competences.length }}</span>
            <span class="kpi-label">Compétences</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getEmployesCompetents() }}</span>
            <span class="kpi-label">Employés compétents</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🔧</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCompetencesTechniques() }}</span>
            <span class="kpi-label">Techniques</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🗣️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getSoftSkills() }}</span>
            <span class="kpi-label">Soft skills</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="competences.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCompetences()" placeholder="Rechercher par nom, catégorie..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterCompetences()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option value="technique">🔧 Technique</option>
            <option value="soft_skill">🗣️ Soft skill</option>
            <option value="langue">🌍 Langue</option>
            <option value="certification">📜 Certification</option>
          </select>
          <select [(ngModel)]="niveauFilter" (ngModelChange)="filterCompetences()" class="filter-select">
            <option value="">Tous niveaux</option>
            <option value="débutant">🌱 Débutant</option>
            <option value="intermédiaire">📘 Intermédiaire</option>
            <option value="avancé">🚀 Avancé</option>
            <option value="expert">🏆 Expert</option>
          </select>
        </div>
      </div>

      <div class="competences-section" *ngIf="competences.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des compétences</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredCompetences.length }} / {{ competences.length }} affiché(s)</span>
          </div>
        </div>
        <div class="competences-grid">
          <div class="competence-card" *ngFor="let c of filteredCompetences">
            <div class="card-header">
              <div class="header-left">
                <div class="competence-icon">{{ getCategorieIcon(c.categorie) }}</div>
                <div class="competence-info">
                  <div class="competence-code">{{ c.code }}</div>
                  <div class="competence-nom">{{ c.nom }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="niveau-badge" [class]="c.niveau">{{ getNiveauLabel(c.niveau) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="c.description">
                <span class="info-label">📝 Description:</span>
                <span class="info-value">{{ c.description }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👥 Employés:</span>
                <span class="info-value">{{ c.employes_maitrisant.length }} personne(s)</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(c)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editCompetence(c)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="gererEmployes(c)" title="Gérer employés">👥</button>
                <button class="action-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💡</div>
          <h2>Aucune compétence</h2>
          <p>Ajoutez votre première compétence</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle compétence</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} compétence</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCompetence()">
              <div class="form-group">
                <label>Code *</label>
                <input type="text" [(ngModel)]="currentCompetence.code" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentCompetence.nom" required>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="currentCompetence.description" rows="2"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Catégorie</label>
                  <select [(ngModel)]="currentCompetence.categorie">
                    <option value="technique">🔧 Technique</option>
                    <option value="soft_skill">🗣️ Soft skill</option>
                    <option value="langue">🌍 Langue</option>
                    <option value="certification">📜 Certification</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Niveau requis</label>
                  <select [(ngModel)]="currentCompetence.niveau">
                    <option value="débutant">🌱 Débutant</option>
                    <option value="intermédiaire">📘 Intermédiaire</option>
                    <option value="avancé">🚀 Avancé</option>
                    <option value="expert">🏆 Expert</option>
                  </select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal && selectedCompetence">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de la compétence - {{ selectedCompetence.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <p><strong>Code:</strong> {{ selectedCompetence.code }}</p>
              <p><strong>Catégorie:</strong> {{ getCategorieLabel(selectedCompetence.categorie) }}</p>
              <p><strong>Niveau:</strong> {{ getNiveauLabel(selectedCompetence.niveau) }}</p>
              <p *ngIf="selectedCompetence.description"><strong>Description:</strong> {{ selectedCompetence.description }}</p>
              <p><strong>Employés maîtrisant:</strong> {{ selectedCompetence.employes_maitrisant.length }}</p>
              <ul>
                <li *ngFor="let eId of selectedCompetence.employes_maitrisant">{{ getEmployeNom(eId) }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal gestion employés -->
      <div class="modal-overlay" *ngIf="showEmployesModal && currentCompetenceEmployes">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Gérer les employés - {{ currentCompetenceEmployes.nom }}</h3>
            <button class="modal-close" (click)="showEmployesModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Ajouter un employé</label>
              <select [(ngModel)]="newEmployeId">
                <option [value]="null">Sélectionner</option>
                <option *ngFor="let e of employes" [value]="e.id">{{ e.nom }} {{ e.prenom }}</option>
              </select>
              <button class="btn-add-small" (click)="addEmployeCompetence()">+ Ajouter</button>
            </div>
            <div class="employes-list">
              <h4>Employés maîtrisant cette compétence ({{ currentCompetenceEmployes.employes_maitrisant.length }})</h4>
              <div *ngFor="let eId of currentCompetenceEmployes.employes_maitrisant">
                <div class="employe-item">
                  <span>{{ getEmployeNom(eId) }}</span>
                  <button class="remove-btn" (click)="removeEmployeCompetence(eId)">🗑️</button>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-primary" (click)="closeEmployesModal()">Fermer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer la compétence <strong>{{ competenceToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteCompetence()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .competences-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary, .btn-add-small { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add-small { padding: 5px 12px; font-size: 12px; }
    .btn-add:hover, .btn-primary:hover, .btn-add-small:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    .competences-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .competences-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .competence-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .competence-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .competence-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .competence-code { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .competence-nom { font-weight: 600; color: #1F2937; margin-top: 2px; }
    .niveau-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .niveau-badge.débutant { background: #F3F4F6; color: #6B7280; }
    .niveau-badge.intermédiaire { background: #DBEAFE; color: #1E40AF; }
    .niveau-badge.avancé { background: #FEF3C7; color: #D97706; }
    .niveau-badge.expert { background: #DCFCE7; color: #16A34A; }
    .card-body { margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 500; color: #1F2937; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .employes-list { margin-top: 20px; }
    .employe-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #F3F4F6; }
    .remove-btn { background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.6; }
    .remove-btn:hover { opacity: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .detail-section { margin: 8px 0; }
    .detail-section p { margin: 8px 0; font-size: 14px; }
    .detail-section ul { margin-top: 8px; padding-left: 20px; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .competences-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; gap: 12px; } }
  `]
})
export class Competences implements OnInit {
  competences: Competence[] = [];
  filteredCompetences: Competence[] = [];
  employes: any[] = [];
  searchTerm = '';
  categorieFilter = '';
  niveauFilter = '';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showEmployesModal = false;
  editMode = false;
  selectedCompetence: Competence | null = null;
  competenceToDelete: Competence | null = null;
  currentCompetenceEmployes: Competence | null = null;
  newEmployeId: number | null = null;
  successMessage = '';

  currentCompetence: Partial<Competence> = {
    code: '',
    nom: '',
    categorie: 'technique',
    niveau: 'intermédiaire',
    employes_maitrisant: []
  };

  ngOnInit() {
    this.loadEmployes();
    this.loadCompetences();
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

  saveCompetences() {
    localStorage.setItem('competences', JSON.stringify(this.competences));
  }

  openForm() {
    this.currentCompetence = {
      code: this.generateCode(),
      nom: '',
      description: '',
      categorie: 'technique',
      niveau: 'intermédiaire',
      employes_maitrisant: []
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.competences.length + 1;
    return `COMP-${String(count).padStart(4, '0')}`;
  }

  saveCompetence() {
    if (!this.currentCompetence.code || !this.currentCompetence.nom) {
      alert('Le code et le nom sont requis');
      return;
    }

    if (this.editMode && this.currentCompetence.id) {
      const index = this.competences.findIndex(c => c.id === this.currentCompetence.id);
      if (index !== -1) {
        this.competences[index] = { ...this.currentCompetence, updated_at: new Date().toISOString() } as Competence;
        this.showSuccess('Compétence modifiée');
      }
    } else {
      this.competences.push({
        ...this.currentCompetence,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Competence);
      this.showSuccess('Compétence ajoutée');
    }
    this.saveCompetences();
    this.filterCompetences();
    this.cancelForm();
  }

  editCompetence(c: Competence) {
    this.currentCompetence = { ...c };
    this.editMode = true;
    this.showForm = true;
  }

  gererEmployes(c: Competence) {
    this.currentCompetenceEmployes = c;
    this.showEmployesModal = true;
  }

  addEmployeCompetence() {
    if (this.currentCompetenceEmployes && this.newEmployeId) {
      if (!this.currentCompetenceEmployes.employes_maitrisant.includes(this.newEmployeId)) {
        this.currentCompetenceEmployes.employes_maitrisant.push(this.newEmployeId);
        this.saveCompetences();
        this.showSuccess('Employé ajouté');
      }
      this.newEmployeId = null;
    }
  }

  removeEmployeCompetence(employeId: number) {
    if (this.currentCompetenceEmployes) {
      this.currentCompetenceEmployes.employes_maitrisant = this.currentCompetenceEmployes.employes_maitrisant.filter(id => id !== employeId);
      this.saveCompetences();
      this.showSuccess('Employé retiré');
    }
  }

  getEmployeNom(id: number): string {
    const employe = this.employes.find(e => e.id === id);
    return employe ? `${employe.nom} ${employe.prenom}` : 'Inconnu';
  }

  closeEmployesModal() {
    this.showEmployesModal = false;
    this.currentCompetenceEmployes = null;
  }

  viewDetails(c: Competence) {
    this.selectedCompetence = c;
    this.showDetailsModal = true;
  }

  confirmDelete(c: Competence) {
    this.competenceToDelete = c;
    this.showDeleteModal = true;
  }

  deleteCompetence() {
    if (this.competenceToDelete) {
      this.competences = this.competences.filter(c => c.id !== this.competenceToDelete?.id);
      this.saveCompetences();
      this.filterCompetences();
      this.showDeleteModal = false;
      this.competenceToDelete = null;
      this.showSuccess('Compétence supprimée');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterCompetences() {
    let filtered = [...this.competences];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nom?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    if (this.categorieFilter) {
      filtered = filtered.filter(c => c.categorie === this.categorieFilter);
    }
    if (this.niveauFilter) {
      filtered = filtered.filter(c => c.niveau === this.niveauFilter);
    }
    this.filteredCompetences = filtered;
  }

  getEmployesCompetents(): number {
    const allEmployes = new Set<number>();
    this.competences.forEach(c => {
      c.employes_maitrisant.forEach(e => allEmployes.add(e));
    });
    return allEmployes.size;
  }

  getCompetencesTechniques(): number {
    return this.competences.filter(c => c.categorie === 'technique').length;
  }

  getSoftSkills(): number {
    return this.competences.filter(c => c.categorie === 'soft_skill').length;
  }

  getCategorieIcon(categorie: string): string {
    const icons: any = {
      technique: '🔧',
      soft_skill: '🗣️',
      langue: '🌍',
      certification: '📜'
    };
    return icons[categorie] || '💡';
  }

  getCategorieLabel(categorie: string): string {
    const labels: any = {
      technique: 'Technique',
      soft_skill: 'Soft skill',
      langue: 'Langue',
      certification: 'Certification'
    };
    return labels[categorie] || categorie;
  }

  getNiveauLabel(niveau: string): string {
    const labels: any = {
      débutant: '🌱 Débutant',
      intermédiaire: '📘 Intermédiaire',
      avancé: '🚀 Avancé',
      expert: '🏆 Expert'
    };
    return labels[niveau] || niveau;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}