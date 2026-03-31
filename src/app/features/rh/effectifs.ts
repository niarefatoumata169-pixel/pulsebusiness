import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Employe {
  id?: number;
  matricule: string;
  nom: string;
  prenom: string;
  poste: string;
  departement_id?: number;
  departement_nom?: string;
  date_embauche: string;
  statut: 'actif' | 'inactif' | 'conge' | 'suspendu';
  email: string;
  telephone: string;
  adresse?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  genre?: 'H' | 'F';
  situation_familiale?: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-effectifs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="effectifs-container">
      <div class="header">
        <div>
          <h1>👥 Effectifs</h1>
          <p class="subtitle">{{ effectifs.length }} employé(s) • {{ getActifsCount() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvel employé</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="effectifs.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ effectifs.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActifsCount() }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🏖️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getCongesCount() }}</span>
            <span class="kpi-label">En congé</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getAncienneteMoyenne() }} ans</span>
            <span class="kpi-label">Ancienneté moy.</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="effectifs.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterEffectifs()" placeholder="Rechercher par nom, prénom, matricule..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterEffectifs()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
            <option value="conge">🏖️ Congé</option>
            <option value="suspendu">⚠️ Suspendu</option>
          </select>
          <select [(ngModel)]="departementFilter" (ngModelChange)="filterEffectifs()" class="filter-select">
            <option value="">Tous départements</option>
            <option *ngFor="let d of departements" [value]="d.id">{{ d.nom }}</option>
          </select>
        </div>
      </div>

      <div class="effectifs-section" *ngIf="effectifs.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des employés</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredEffectifs.length }} / {{ effectifs.length }} affiché(s)</span>
          </div>
        </div>
        <div class="effectifs-grid">
          <div class="employe-card" *ngFor="let e of filteredEffectifs" [class]="e.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="employe-icon">👤</div>
                <div class="employe-info">
                  <div class="employe-matricule">{{ e.matricule }}</div>
                  <div class="employe-nom">{{ e.prenom }} {{ e.nom }}</div>
                  <div class="employe-poste">{{ e.poste }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="e.statut">{{ getStatutLabel(e.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="e.departement_nom">
                <span class="info-label">📂 Département:</span>
                <span class="info-value">{{ e.departement_nom }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Embauché le:</span>
                <span class="info-value">{{ e.date_embauche | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📞 Tél:</span>
                <span class="info-value">{{ e.telephone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">✉️ Email:</span>
                <span class="info-value">{{ e.email }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editEmploye(e)" title="Modifier">✏️</button>
                <button class="action-icon delete" (click)="confirmDelete(e)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h2>Aucun employé</h2>
          <p>Ajoutez votre premier employé</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel employé</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} employé</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEmploye()">
              <div class="form-row">
                <div class="form-group">
                  <label>Matricule *</label>
                  <input type="text" [(ngModel)]="currentEmploye.matricule" readonly class="readonly">
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentEmploye.statut">
                    <option value="actif">✅ Actif</option>
                    <option value="inactif">⏸️ Inactif</option>
                    <option value="conge">🏖️ Congé</option>
                    <option value="suspendu">⚠️ Suspendu</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" [(ngModel)]="currentEmploye.nom" required>
                </div>
                <div class="form-group">
                  <label>Prénom *</label>
                  <input type="text" [(ngModel)]="currentEmploye.prenom" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Poste *</label>
                  <input type="text" [(ngModel)]="currentEmploye.poste" required>
                </div>
                <div class="form-group">
                  <label>Département</label>
                  <select [(ngModel)]="currentEmploye.departement_id" (change)="onDepartementChange()">
                    <option [value]="undefined">Sélectionner</option>
                    <option *ngFor="let d of departements" [value]="d.id">{{ d.nom }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date d'embauche</label>
                  <input type="date" [(ngModel)]="currentEmploye.date_embauche">
                </div>
                <div class="form-group">
                  <label>Date de naissance</label>
                  <input type="date" [(ngModel)]="currentEmploye.date_naissance">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone *</label>
                  <input type="tel" [(ngModel)]="currentEmploye.telephone" required>
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="currentEmploye.email" required>
                </div>
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <input type="text" [(ngModel)]="currentEmploye.adresse">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Lieu de naissance</label>
                  <input type="text" [(ngModel)]="currentEmploye.lieu_naissance">
                </div>
                <div class="form-group">
                  <label>Nationalité</label>
                  <input type="text" [(ngModel)]="currentEmploye.nationalite">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Genre</label>
                  <select [(ngModel)]="currentEmploye.genre">
                    <option [value]="undefined">Non précisé</option>
                    <option value="H">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Situation familiale</label>
                  <select [(ngModel)]="currentEmploye.situation_familiale">
                    <option [value]="undefined">Non précisée</option>
                    <option value="celibataire">Célibataire</option>
                    <option value="marie">Marié(e)</option>
                    <option value="divorce">Divorcé(e)</option>
                    <option value="veuf">Veuf/Veuve</option>
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

      <!-- Modal suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer l'employé <strong>{{ employeToDelete?.prenom }} {{ employeToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteEmploye()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .effectifs-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
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
    .effectifs-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .effectifs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .employe-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .employe-card.actif { border-left-color: #10B981; }
    .employe-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .employe-card.conge { border-left-color: #F59E0B; }
    .employe-card.suspendu { border-left-color: #EF4444; }
    .employe-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .employe-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .employe-matricule { font-size: 12px; color: #9CA3AF; font-family: monospace; }
    .employe-nom { font-weight: 600; color: #1F2937; margin-top: 4px; }
    .employe-poste { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .statut-badge.conge { background: #FEF3C7; color: #D97706; }
    .statut-badge.suspendu { background: #FEE2E2; color: #EF4444; }
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
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
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
    .readonly { background: #F9FAFB; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; gap: 12px; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .effectifs-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } }
  `]
})
export class Effectifs implements OnInit {
  effectifs: Employe[] = [];
  filteredEffectifs: Employe[] = [];
  departements: any[] = [];
  searchTerm = '';
  statutFilter = '';
  departementFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  employeToDelete: Employe | null = null;
  successMessage = '';

  currentEmploye: Partial<Employe> = {
    matricule: '',
    nom: '',
    prenom: '',
    poste: '',
    date_embauche: new Date().toISOString().split('T')[0],
    statut: 'actif',
    email: '',
    telephone: ''
  };

  ngOnInit() {
    this.loadDepartements();
    this.loadEffectifs();
  }

  loadDepartements() {
    const saved = localStorage.getItem('departements');
    this.departements = saved ? JSON.parse(saved) : [];
  }

  loadEffectifs() {
    const saved = localStorage.getItem('effectifs');
    this.effectifs = saved ? JSON.parse(saved) : [];
    this.filteredEffectifs = [...this.effectifs];
  }

  saveEffectifs() {
    localStorage.setItem('effectifs', JSON.stringify(this.effectifs));
  }

  openForm() {
    this.currentEmploye = {
      matricule: this.generateMatricule(),
      nom: '',
      prenom: '',
      poste: '',
      departement_id: undefined,
      date_embauche: new Date().toISOString().split('T')[0],
      statut: 'actif',
      email: '',
      telephone: '',
      adresse: '',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: '',
      genre: undefined,
      situation_familiale: undefined
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateMatricule(): string {
    const count = this.effectifs.length + 1;
    return `EMP-${String(count).padStart(4, '0')}`;
  }

  onDepartementChange() {
    const dept = this.departements.find(d => d.id === this.currentEmploye.departement_id);
    if (dept) {
      this.currentEmploye.departement_nom = dept.nom;
    } else {
      this.currentEmploye.departement_nom = undefined;
    }
  }

  saveEmploye() {
    if (!this.currentEmploye.nom || !this.currentEmploye.prenom || !this.currentEmploye.poste || !this.currentEmploye.email || !this.currentEmploye.telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentEmploye.id) {
      const index = this.effectifs.findIndex(e => e.id === this.currentEmploye.id);
      if (index !== -1) {
        this.effectifs[index] = { ...this.currentEmploye, updated_at: new Date().toISOString() } as Employe;
        this.showSuccess('Employé modifié');
      }
    } else {
      this.effectifs.push({
        ...this.currentEmploye,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Employe);
      this.showSuccess('Employé ajouté');
    }
    this.saveEffectifs();
    this.filterEffectifs();
    this.cancelForm();
  }

  editEmploye(e: Employe) {
    this.currentEmploye = { ...e };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(e: Employe) {
    this.employeToDelete = e;
    this.showDeleteModal = true;
  }

  deleteEmploye() {
    if (this.employeToDelete) {
      this.effectifs = this.effectifs.filter(e => e.id !== this.employeToDelete?.id);
      this.saveEffectifs();
      this.filterEffectifs();
      this.showDeleteModal = false;
      this.employeToDelete = null;
      this.showSuccess('Employé supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterEffectifs() {
    let filtered = [...this.effectifs];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.matricule?.toLowerCase().includes(term) ||
        e.nom?.toLowerCase().includes(term) ||
        e.prenom?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
      );
    }
    if (this.statutFilter) {
      filtered = filtered.filter(e => e.statut === this.statutFilter);
    }
    if (this.departementFilter) {
      filtered = filtered.filter(e => e.departement_id?.toString() === this.departementFilter);
    }
    this.filteredEffectifs = filtered;
  }

  getActifsCount(): number {
    return this.effectifs.filter(e => e.statut === 'actif').length;
  }

  getCongesCount(): number {
    return this.effectifs.filter(e => e.statut === 'conge').length;
  }

  getAncienneteMoyenne(): number {
    if (this.effectifs.length === 0) return 0;
    const now = new Date();
    const total = this.effectifs.reduce((sum, e) => {
      const embauche = new Date(e.date_embauche);
      const diff = now.getFullYear() - embauche.getFullYear();
      return sum + diff;
    }, 0);
    return Math.round(total / this.effectifs.length);
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      actif: '✅ Actif',
      inactif: '⏸️ Inactif',
      conge: '🏖️ Congé',
      suspendu: '⚠️ Suspendu'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}