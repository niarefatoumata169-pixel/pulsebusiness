import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MouvementTresorerie {
  id?: number;
  date: string;
  libelle: string;
  categorie: 'encaissement' | 'decaissement' | 'virement' | 'frais';
  montant: number;
  mode: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  compte_source?: string;
  compte_destination?: string;
  beneficiaire?: string;
  reference?: string;
  notes?: string;
  piece_jointe?: string;
}

@Component({
  selector: 'app-tresorerie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="tresorerie-container">
      <div class="header">
        <div>
          <h1>Trésorerie</h1>
          <p class="subtitle">{{ mouvements.length }} mouvement(s) • Solde: {{ solde | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau mouvement</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} mouvement</h3>
        <form (ngSubmit)="saveMouvement()" #mouvementForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentMouvement.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="currentMouvement.libelle" name="libelle" required>
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="currentMouvement.categorie" name="categorie">
                <option value="encaissement">Encaissement</option>
                <option value="decaissement">Décaissement</option>
                <option value="virement">Virement</option>
                <option value="frais">Frais</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="currentMouvement.montant" name="montant" required>
            </div>
            <div class="form-group">
              <label>Mode</label>
              <select [(ngModel)]="currentMouvement.mode" name="mode">
                <option value="especes">Espèces</option>
                <option value="carte">Carte</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div class="form-group">
              <label>Compte source</label>
              <input type="text" [(ngModel)]="currentMouvement.compte_source" name="compte_source">
            </div>
            <div class="form-group">
              <label>Compte destination</label>
              <input type="text" [(ngModel)]="currentMouvement.compte_destination" name="compte_destination">
            </div>
            <div class="form-group">
              <label>Bénéficiaire</label>
              <input type="text" [(ngModel)]="currentMouvement.beneficiaire" name="beneficiaire">
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="currentMouvement.reference" name="reference">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentMouvement.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="mouvementForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="mouvements.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="categorieFilter" (ngModelChange)="filterMouvements()" class="filter-select">
          <option value="">Toutes catégories</option>
          <option value="encaissement">Encaissements</option>
          <option value="decaissement">Décaissements</option>
          <option value="virement">Virements</option>
          <option value="frais">Frais</option>
        </select>
        <select [(ngModel)]="modeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
          <option value="">Tous modes</option>
          <option value="especes">Espèces</option>
          <option value="carte">Carte</option>
          <option value="cheque">Chèque</option>
          <option value="virement">Virement</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
      </div>

      <!-- Tableau -->
      <div class="table-container" *ngIf="mouvements.length > 0; else emptyState">
        <table class="mouvements-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Mode</th>
              <th>Montant</th>
              <th>Bénéficiaire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filteredMouvements" [class.encaissement]="m.categorie === 'encaissement'">
              <td>{{ m.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ m.libelle }}</td>
              <td>{{ getCategorieLabel(m.categorie) }}</td>
              <td>{{ getModeLabel(m.mode) }}</td>
              <td [class.positif]="m.categorie === 'encaissement'" [class.negatif]="m.categorie === 'decaissement'">
                {{ m.montant | number }} FCFA
              </td>
              <td>{{ m.beneficiaire || '-' }}</td>
              <td class="actions">
                <button class="btn-icon" (click)="editMouvement(m)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(m)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <h2>Aucun mouvement</h2>
          <p>Ajoutez votre premier mouvement de trésorerie</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau mouvement</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le mouvement <strong>{{ mouvementToDelete?.libelle }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteMouvement()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tresorerie-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .mouvements-table { width: 100%; border-collapse: collapse; }
    .mouvements-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .mouvements-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .mouvements-table tr.encaissement { background: #F0FDF4; }
    .positif { color: #10B981; font-weight: 600; }
    .negatif { color: #EF4444; font-weight: 600; }
    .actions { display: flex; gap: 8px; }
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
export class Tresorerie implements OnInit {
  mouvements: MouvementTresorerie[] = [];
  filteredMouvements: MouvementTresorerie[] = [];
  currentMouvement: any = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    categorie: 'encaissement',
    montant: 0,
    mode: 'especes',
    compte_source: '',
    compte_destination: '',
    beneficiaire: '',
    reference: '',
    notes: ''
  };
  searchTerm = '';
  categorieFilter = '';
  modeFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  mouvementToDelete: MouvementTresorerie | null = null;
  successMessage = '';

  solde = 0;

  ngOnInit() { this.loadMouvements(); }

  loadMouvements() {
    const saved = localStorage.getItem('mouvements_tresorerie');
    this.mouvements = saved ? JSON.parse(saved) : [];
    this.filteredMouvements = [...this.mouvements];
    this.calculerSolde();
  }

  saveMouvements() {
    localStorage.setItem('mouvements_tresorerie', JSON.stringify(this.mouvements));
    this.calculerSolde();
  }

  saveMouvement() {
    if (this.editMode) {
      const index = this.mouvements.findIndex(m => m.id === this.currentMouvement.id);
      if (index !== -1) {
        this.mouvements[index] = { ...this.currentMouvement };
        this.showSuccess('Mouvement modifié !');
      }
    } else {
      const newMouvement = { ...this.currentMouvement, id: Date.now() };
      this.mouvements.push(newMouvement);
      this.showSuccess('Mouvement ajouté !');
    }
    this.saveMouvements();
    this.filterMouvements();
    this.cancelForm();
  }

  editMouvement(m: MouvementTresorerie) {
    this.currentMouvement = { ...m };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(m: MouvementTresorerie) {
    this.mouvementToDelete = m;
    this.showDeleteModal = true;
  }

  deleteMouvement() {
    if (this.mouvementToDelete) {
      this.mouvements = this.mouvements.filter(m => m.id !== this.mouvementToDelete?.id);
      this.saveMouvements();
      this.filterMouvements();
      this.showDeleteModal = false;
      this.mouvementToDelete = null;
      this.showSuccess('Mouvement supprimé !');
    }
  }

  cancelForm() {
    this.currentMouvement = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      categorie: 'encaissement',
      montant: 0,
      mode: 'especes',
      compte_source: '',
      compte_destination: '',
      beneficiaire: '',
      reference: '',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterMouvements() {
    let filtered = this.mouvements;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.libelle?.toLowerCase().includes(term) ||
        m.beneficiaire?.toLowerCase().includes(term) ||
        m.reference?.toLowerCase().includes(term)
      );
    }

    if (this.categorieFilter) {
      filtered = filtered.filter(m => m.categorie === this.categorieFilter);
    }

    if (this.modeFilter) {
      filtered = filtered.filter(m => m.mode === this.modeFilter);
    }

    this.filteredMouvements = filtered;
  }

  calculerSolde() {
    this.solde = this.mouvements.reduce((s, m) => {
      if (m.categorie === 'encaissement') return s + m.montant;
      if (m.categorie === 'decaissement') return s - m.montant;
      return s;
    }, 0);
  }

  getCategorieLabel(cat: string): string {
    const labels: any = { encaissement: 'Encaissement', decaissement: 'Décaissement', virement: 'Virement', frais: 'Frais' };
    return labels[cat] || cat;
  }

  getModeLabel(mode: string): string {
    const labels: any = { especes: 'Espèces', carte: 'Carte', cheque: 'Chèque', virement: 'Virement', mobile_money: 'Mobile Money' };
    return labels[mode] || mode;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
