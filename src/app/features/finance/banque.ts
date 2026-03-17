import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CompteBancaire {
  id?: number;
  nom_banque: string;
  numero_compte: string;
  intitule_compte: string;
  type_compte: 'courant' | 'epargne' | 'titre' | 'devise';
  devise: string;
  solde_initial: number;
  solde_actuel: number;
  date_ouverture: string;
  gestionnaire?: string;
  telephone?: string;
  email?: string;
  notes?: string;
}

@Component({
  selector: 'app-banque',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="banque-container">
      <div class="header">
        <div>
          <h1>Comptes bancaires</h1>
          <p class="subtitle">{{ comptes.length }} compte(s) • Solde total: {{ soldeTotal | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau compte</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} compte</h3>
        <form (ngSubmit)="saveCompte()" #compteForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom de la banque *</label>
              <input type="text" [(ngModel)]="currentCompte.nom_banque" name="nom_banque" required>
            </div>
            <div class="form-group">
              <label>Numéro de compte *</label>
              <input type="text" [(ngModel)]="currentCompte.numero_compte" name="numero_compte" required>
            </div>
            <div class="form-group">
              <label>Intitulé du compte</label>
              <input type="text" [(ngModel)]="currentCompte.intitule_compte" name="intitule_compte">
            </div>
            <div class="form-group">
              <label>Type de compte</label>
              <select [(ngModel)]="currentCompte.type_compte" name="type_compte">
                <option value="courant">Compte courant</option>
                <option value="epargne">Compte épargne</option>
                <option value="titre">Compte titres</option>
                <option value="devise">Compte devise</option>
              </select>
            </div>
            <div class="form-group">
              <label>Devise</label>
              <input type="text" [(ngModel)]="currentCompte.devise" name="devise" value="FCFA">
            </div>
            <div class="form-group">
              <label>Solde initial</label>
              <input type="number" [(ngModel)]="currentCompte.solde_initial" name="solde_initial" (input)="updateSolde()">
            </div>
            <div class="form-group">
              <label>Solde actuel</label>
              <input type="number" [(ngModel)]="currentCompte.solde_actuel" name="solde_actuel">
            </div>
            <div class="form-group">
              <label>Date d'ouverture</label>
              <input type="date" [(ngModel)]="currentCompte.date_ouverture" name="date_ouverture">
            </div>
            <div class="form-group">
              <label>Gestionnaire</label>
              <input type="text" [(ngModel)]="currentCompte.gestionnaire" name="gestionnaire">
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" [(ngModel)]="currentCompte.telephone" name="telephone">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="currentCompte.email" name="email">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentCompte.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="compteForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Liste des comptes -->
      <div class="comptes-grid" *ngIf="comptes.length > 0; else emptyState">
        <div class="compte-card" *ngFor="let c of comptes">
          <div class="compte-header">
            <span class="banque-nom">{{ c.nom_banque }}</span>
            <span class="compte-type">{{ getTypeLabel(c.type_compte) }}</span>
          </div>
          <div class="compte-body">
            <div class="compte-numero">{{ c.numero_compte }}</div>
            <div class="compte-intitule">{{ c.intitule_compte || 'Compte sans intitulé' }}</div>
            <div class="compte-solde">
              <span class="solde-label">Solde:</span>
              <span class="solde-valeur">{{ c.solde_actuel | number }} {{ c.devise }}</span>
            </div>
          </div>
          <div class="compte-actions">
            <button class="btn-icon" (click)="editCompte(c)" title="Modifier">✏️</button>
            <button class="btn-icon" [routerLink]="['/finance/tresorerie']" title="Voir mouvements">📊</button>
            <button class="btn-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏦</div>
          <h2>Aucun compte bancaire</h2>
          <p>Ajoutez votre premier compte</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau compte</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le compte <strong>{{ compteToDelete?.nom_banque }} - {{ compteToDelete?.numero_compte }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteCompte()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .banque-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .comptes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .compte-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .compte-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .banque-nom { font-weight: 600; color: #1F2937; }
    .compte-type { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .compte-numero { font-family: monospace; font-size: 14px; color: #6B7280; margin-bottom: 5px; }
    .compte-intitule { color: #1F2937; margin-bottom: 15px; }
    .compte-solde { display: flex; justify-content: space-between; border-top: 1px solid #FCE7F3; padding-top: 15px; }
    .solde-label { color: #6B7280; }
    .solde-valeur { font-weight: 600; color: #10B981; }
    .compte-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Banque implements OnInit {
  comptes: CompteBancaire[] = [];
  currentCompte: any = {
    nom_banque: '',
    numero_compte: '',
    intitule_compte: '',
    type_compte: 'courant',
    devise: 'FCFA',
    solde_initial: 0,
    solde_actuel: 0,
    date_ouverture: new Date().toISOString().split('T')[0],
    gestionnaire: '',
    telephone: '',
    email: '',
    notes: ''
  };
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  compteToDelete: CompteBancaire | null = null;
  successMessage = '';

  soldeTotal = 0;

  ngOnInit() { this.loadComptes(); }

  loadComptes() {
    const saved = localStorage.getItem('comptes_bancaires');
    this.comptes = saved ? JSON.parse(saved) : [];
    this.calculerSoldeTotal();
  }

  saveComptes() {
    localStorage.setItem('comptes_bancaires', JSON.stringify(this.comptes));
    this.calculerSoldeTotal();
  }

  saveCompte() {
    if (this.editMode) {
      const index = this.comptes.findIndex(c => c.id === this.currentCompte.id);
      if (index !== -1) {
        this.comptes[index] = { ...this.currentCompte };
        this.showSuccess('Compte modifié !');
      }
    } else {
      const newCompte = { ...this.currentCompte, id: Date.now() };
      this.comptes.push(newCompte);
      this.showSuccess('Compte ajouté !');
    }
    this.saveComptes();
    this.cancelForm();
  }

  updateSolde() {
    this.currentCompte.solde_actuel = this.currentCompte.solde_initial;
  }

  editCompte(c: CompteBancaire) {
    this.currentCompte = { ...c };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(c: CompteBancaire) {
    this.compteToDelete = c;
    this.showDeleteModal = true;
  }

  deleteCompte() {
    if (this.compteToDelete) {
      this.comptes = this.comptes.filter(c => c.id !== this.compteToDelete?.id);
      this.saveComptes();
      this.showDeleteModal = false;
      this.compteToDelete = null;
      this.showSuccess('Compte supprimé !');
    }
  }

  cancelForm() {
    this.currentCompte = {
      nom_banque: '',
      numero_compte: '',
      intitule_compte: '',
      type_compte: 'courant',
      devise: 'FCFA',
      solde_initial: 0,
      solde_actuel: 0,
      date_ouverture: new Date().toISOString().split('T')[0],
      gestionnaire: '',
      telephone: '',
      email: '',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }

  calculerSoldeTotal() {
    this.soldeTotal = this.comptes.reduce((s, c) => s + (c.solde_actuel || 0), 0);
  }

  getTypeLabel(type: string): string {
    const labels: any = { courant: 'Courant', epargne: 'Épargne', titre: 'Titres', devise: 'Devise' };
    return labels[type] || type;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
