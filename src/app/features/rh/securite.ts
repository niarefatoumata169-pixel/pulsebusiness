import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Utilisateur {
  id?: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  statut: 'actif' | 'inactif' | 'suspendu';
  dernier_acces?: string;
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-securite',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="securite-container">
      <div class="header">
        <div>
          <h1>🔒 Gestion des accès</h1>
          <p class="subtitle">{{ utilisateurs.length }} utilisateur(s) • {{ getUtilisateursActifs() }} actif(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="openForm()">+ Nouvel utilisateur</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

      <div class="kpi-grid" *ngIf="utilisateurs.length > 0">
        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ utilisateurs.length }}</span>
            <span class="kpi-label">Total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getUtilisateursActifs() }}</span>
            <span class="kpi-label">Actifs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">👑</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getAdmins() }}</span>
            <span class="kpi-label">Administrateurs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getUtilisateursSuspendus() }}</span>
            <span class="kpi-label">Suspendus</span>
          </div>
        </div>
      </div>

      <div class="filters-section" *ngIf="utilisateurs.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterUtilisateurs()" placeholder="Rechercher par nom, email..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="roleFilter" (ngModelChange)="filterUtilisateurs()" class="filter-select">
            <option value="">Tous rôles</option>
            <option value="admin">👑 Admin</option>
            <option value="manager">📊 Manager</option>
            <option value="user">👤 Utilisateur</option>
            <option value="viewer">👁️ Viewer</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterUtilisateurs()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
            <option value="suspendu">⚠️ Suspendu</option>
          </select>
        </div>
      </div>

      <div class="utilisateurs-section" *ngIf="utilisateurs.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des utilisateurs</h2>
          <div class="header-stats">
            <span class="stat-badge">{{ filteredUtilisateurs.length }} / {{ utilisateurs.length }} affiché(s)</span>
          </div>
        </div>
        <div class="utilisateurs-grid">
          <div class="utilisateur-card" *ngFor="let u of filteredUtilisateurs" [class]="u.statut">
            <div class="card-header">
              <div class="header-left">
                <div class="utilisateur-icon">👤</div>
                <div class="utilisateur-info">
                  <div class="utilisateur-username">{{ u.username }}</div>
                  <div class="utilisateur-email">{{ u.email }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="role-badge" [class]="u.role">{{ getRoleLabel(u.role) }}</span>
                <span class="statut-badge" [class]="u.statut">{{ getStatutLabel(u.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row" *ngIf="u.dernier_acces">
                <span class="info-label">🕒 Dernier accès:</span>
                <span class="info-value">{{ u.dernier_acces | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Créé le:</span>
                <span class="info-value">{{ u.created_at | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="editUtilisateur(u)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="resetPassword(u)" title="Réinitialiser mot de passe">🔑</button>
                <button class="action-icon delete" (click)="confirmDelete(u)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h2>Aucun utilisateur</h2>
          <p>Ajoutez votre premier utilisateur</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel utilisateur</button>
        </div>
      </ng-template>

      <!-- Modal formulaire -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} utilisateur</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveUtilisateur()">
              <div class="form-group">
                <label>Nom d'utilisateur *</label>
                <input type="text" [(ngModel)]="currentUtilisateur.username" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="currentUtilisateur.email" required>
              </div>
              <div class="form-group">
                <label>Rôle</label>
                <select [(ngModel)]="currentUtilisateur.role">
                  <option value="admin">👑 Administrateur</option>
                  <option value="manager">📊 Manager</option>
                  <option value="user">👤 Utilisateur</option>
                  <option value="viewer">👁️ Viewer</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentUtilisateur.statut">
                  <option value="actif">✅ Actif</option>
                  <option value="inactif">⏸️ Inactif</option>
                  <option value="suspendu">⚠️ Suspendu</option>
                </select>
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
            <p>Supprimer l'utilisateur <strong>{{ utilisateurToDelete?.username }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteUtilisateur()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .securite-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .utilisateurs-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #FEF3F9; color: #EC4899; }
    .utilisateurs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .utilisateur-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: 0.2s; border-left: 4px solid transparent; }
    .utilisateur-card.actif { border-left-color: #10B981; }
    .utilisateur-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .utilisateur-card.suspendu { border-left-color: #EF4444; opacity: 0.7; }
    .utilisateur-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; }
    .utilisateur-icon { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .utilisateur-username { font-weight: 600; color: #1F2937; }
    .utilisateur-email { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .role-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; display: inline-block; margin-right: 6px; }
    .role-badge.admin { background: #FEF3C7; color: #D97706; }
    .role-badge.manager { background: #DBEAFE; color: #1E40AF; }
    .role-badge.user { background: #DCFCE7; color: #16A34A; }
    .role-badge.viewer { background: #F3F4F6; color: #6B7280; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; display: inline-block; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
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
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .utilisateurs-grid { grid-template-columns: 1fr; } .filter-group { flex-direction: column; } }
  `]
})
export class Securite implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  searchTerm = '';
  roleFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  utilisateurToDelete: Utilisateur | null = null;
  successMessage = '';

  currentUtilisateur: Partial<Utilisateur> = {
    username: '',
    email: '',
    role: 'user',
    statut: 'actif'
  };

  ngOnInit() {
    this.loadUtilisateurs();
  }

  loadUtilisateurs() {
    const saved = localStorage.getItem('utilisateurs');
    this.utilisateurs = saved ? JSON.parse(saved) : [];
    this.filteredUtilisateurs = [...this.utilisateurs];
  }

  saveUtilisateurs() {
    localStorage.setItem('utilisateurs', JSON.stringify(this.utilisateurs));
  }

  openForm() {
    this.currentUtilisateur = {
      username: '',
      email: '',
      role: 'user',
      statut: 'actif'
    };
    this.editMode = false;
    this.showForm = true;
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  saveUtilisateur() {
    if (!this.currentUtilisateur.username || !this.currentUtilisateur.email) {
      alert('Le nom d\'utilisateur et l\'email sont requis');
      return;
    }

    if (this.editMode && this.currentUtilisateur.id) {
      const index = this.utilisateurs.findIndex(u => u.id === this.currentUtilisateur.id);
      if (index !== -1) {
        this.utilisateurs[index] = { ...this.currentUtilisateur, updated_at: new Date().toISOString() } as Utilisateur;
        this.showSuccess('Utilisateur modifié');
      }
    } else {
      const password = this.generatePassword();
      this.utilisateurs.push({
        ...this.currentUtilisateur,
        id: Date.now(),
        created_at: new Date().toISOString(),
        dernier_acces: undefined
      } as Utilisateur);
      this.showSuccess(`Utilisateur ajouté (mot de passe: ${password})`);
    }
    this.saveUtilisateurs();
    this.filterUtilisateurs();
    this.cancelForm();
  }

  editUtilisateur(u: Utilisateur) {
    this.currentUtilisateur = { ...u };
    this.editMode = true;
    this.showForm = true;
  }

  resetPassword(u: Utilisateur) {
    const newPassword = this.generatePassword();
    alert(`Nouveau mot de passe pour ${u.username}: ${newPassword}`);
    this.showSuccess('Mot de passe réinitialisé');
  }

  confirmDelete(u: Utilisateur) {
    this.utilisateurToDelete = u;
    this.showDeleteModal = true;
  }

  deleteUtilisateur() {
    if (this.utilisateurToDelete) {
      this.utilisateurs = this.utilisateurs.filter(u => u.id !== this.utilisateurToDelete?.id);
      this.saveUtilisateurs();
      this.filterUtilisateurs();
      this.showDeleteModal = false;
      this.utilisateurToDelete = null;
      this.showSuccess('Utilisateur supprimé');
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  filterUtilisateurs() {
    let filtered = [...this.utilisateurs];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    if (this.roleFilter) {
      filtered = filtered.filter(u => u.role === this.roleFilter);
    }
    if (this.statutFilter) {
      filtered = filtered.filter(u => u.statut === this.statutFilter);
    }
    this.filteredUtilisateurs = filtered;
  }

  getUtilisateursActifs(): number {
    return this.utilisateurs.filter(u => u.statut === 'actif').length;
  }

  getAdmins(): number {
    return this.utilisateurs.filter(u => u.role === 'admin').length;
  }

  getUtilisateursSuspendus(): number {
    return this.utilisateurs.filter(u => u.statut === 'suspendu').length;
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      admin: '👑 Admin',
      manager: '📊 Manager',
      user: '👤 Utilisateur',
      viewer: '👁️ Viewer'
    };
    return labels[role] || role;
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      actif: '✅ Actif',
      inactif: '⏸️ Inactif',
      suspendu: '⚠️ Suspendu'
    };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}