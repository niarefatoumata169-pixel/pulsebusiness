import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Budget {
  id?: number;
  nom: string;
  annee: number;
  periode: 'annuel' | 'trimestriel' | 'mensuel';
  montant_previsionnel: number;
  montant_realise: number;
  categorie: string;
  departement?: string;
  responsable?: string;
  date_debut: string;
  date_fin: string;
  notes?: string;
  statut: 'en_cours' | 'termine' | 'annule';
}

interface LigneBudget {
  id?: number;
  budget_id: number;
  mois: number;
  montant_prevu: number;
  montant_realise: number;
  ecart: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="budgets-container">
      <div class="header">
        <div>
          <h1>Budgets</h1>
          <p class="subtitle">{{ budgets.length }} budget(s) • Total prévu: {{ totalPrevu | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau budget</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} budget</h3>
        <form (ngSubmit)="saveBudget()" #budgetForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom du budget *</label>
              <input type="text" [(ngModel)]="currentBudget.nom" name="nom" required>
            </div>
            <div class="form-group">
              <label>Année *</label>
              <input type="number" [(ngModel)]="currentBudget.annee" name="annee" required min="2020" max="2030">
            </div>
            <div class="form-group">
              <label>Période</label>
              <select [(ngModel)]="currentBudget.periode" name="periode" (change)="updateDates()">
                <option value="annuel">Annuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="mensuel">Mensuel</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant prévisionnel *</label>
              <input type="number" [(ngModel)]="currentBudget.montant_previsionnel" name="montant_previsionnel" required>
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="currentBudget.categorie" name="categorie">
                <option value="fonctionnement">Fonctionnement</option>
                <option value="investissement">Investissement</option>
                <option value="marketing">Marketing</option>
                <option value="rh">Ressources humaines</option>
                <option value="projet">Projet</option>
              </select>
            </div>
            <div class="form-group">
              <label>Département</label>
              <input type="text" [(ngModel)]="currentBudget.departement" name="departement">
            </div>
            <div class="form-group">
              <label>Responsable</label>
              <input type="text" [(ngModel)]="currentBudget.responsable" name="responsable">
            </div>
            <div class="form-group">
              <label>Date début</label>
              <input type="date" [(ngModel)]="currentBudget.date_debut" name="date_debut" (change)="updateDateFin()">
            </div>
            <div class="form-group">
              <label>Date fin</label>
              <input type="date" [(ngModel)]="currentBudget.date_fin" name="date_fin" readonly>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentBudget.statut" name="statut">
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentBudget.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="budgetForm.invalid">�� Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="budgets.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterBudgets()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="anneeFilter" (ngModelChange)="filterBudgets()" class="filter-select">
          <option value="">Toutes années</option>
          <option *ngFor="let a of annees" [value]="a">{{ a }}</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterBudgets()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>

      <!-- Liste des budgets -->
      <div class="budgets-grid" *ngIf="budgets.length > 0; else emptyState">
        <div class="budget-card" *ngFor="let b of filteredBudgets">
          <div class="budget-header">
            <span class="budget-nom">{{ b.nom }}</span>
            <span class="budget-statut" [class]="b.statut">{{ getStatutLabel(b.statut) }}</span>
          </div>
          <div class="budget-body">
            <div class="budget-info">
              <span class="info-label">Période:</span>
              <span class="info-value">{{ b.periode }} {{ b.annee }}</span>
            </div>
            <div class="budget-info">
              <span class="info-label">Catégorie:</span>
              <span class="info-value">{{ b.categorie }}</span>
            </div>
            <div class="budget-montants">
              <div class="montant-prevu">
                <span class="montant-label">Prévu:</span>
                <span class="montant-valeur">{{ b.montant_previsionnel | number }} FCFA</span>
              </div>
              <div class="montant-realise">
                <span class="montant-label">Réalisé:</span>
                <span class="montant-valeur">{{ b.montant_realise | number }} FCFA</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getTauxRealisation(b)"></div>
              </div>
              <div class="taux">{{ getTauxRealisation(b) }}% réalisé</div>
            </div>
          </div>
          <div class="budget-actions">
            <button class="btn-icon" (click)="voirDetails(b)" title="Détails">📊</button>
            <button class="btn-icon" (click)="editBudget(b)" title="Modifier">✏️</button>
            <button class="btn-icon delete" (click)="confirmDelete(b)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Détail du budget -->
      <div class="detail-section" *ngIf="selectedBudget">
        <div class="section-header">
          <h3>Détail du budget: {{ selectedBudget.nom }}</h3>
          <button class="btn-close" (click)="selectedBudget = null">✕</button>
        </div>
        <div class="detail-info">
          <p><strong>Période:</strong> {{ selectedBudget.periode }} {{ selectedBudget.annee }}</p>
          <p><strong>Du:</strong> {{ selectedBudget.date_debut | date }} <strong>au:</strong> {{ selectedBudget.date_fin | date }}</p>
          <p><strong>Responsable:</strong> {{ selectedBudget.responsable || 'Non défini' }}</p>
        </div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th>Prévu</th>
              <th>Réalisé</th>
              <th>Écart</th>
              <th>% réal.</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ligne of getLignesBudget(selectedBudget.id!)">
              <td>{{ getMoisLabel(ligne.mois) }}</td>
              <td>{{ ligne.montant_prevu | number }} FCFA</td>
              <td>{{ ligne.montant_realise | number }} FCFA</td>
              <td [class.positif]="ligne.ecart >= 0" [class.negatif]="ligne.ecart < 0">
                {{ ligne.ecart | number }} FCFA
              </td>
              <td>
                <div class="mini-progress">
                  <div class="mini-progress-fill" [style.width.%]="getTauxMensuel(ligne)"></div>
                  <span>{{ getTauxMensuel(ligne) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📈</div>
          <h2>Aucun budget</h2>
          <p>Créez votre premier budget</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau budget</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer le budget <strong>{{ budgetToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteBudget()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budgets-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .budget-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .budget-nom { font-weight: 600; color: #1F2937; }
    .budget-statut { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
    .budget-statut.en_cours { background: #10B981; color: white; }
    .budget-statut.termine { background: #6B7280; color: white; }
    .budget-statut.annule { background: #EF4444; color: white; }
    .budget-info { display: flex; justify-content: space-between; margin-bottom: 8px; color: #6B7280; }
    .info-value { color: #1F2937; }
    .budget-montants { margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .montant-prevu, .montant-realise { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .montant-valeur { font-weight: 600; }
    .progress-bar { height: 8px; background: #FCE7F3; border-radius: 4px; margin: 10px 0 5px; overflow: hidden; }
    .progress-fill { height: 100%; background: #EC4899; border-radius: 4px; }
    .taux { text-align: right; font-size: 12px; color: #6B7280; }
    .budget-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .detail-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; margin-top: 30px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .detail-info { display: flex; gap: 30px; margin-bottom: 20px; padding: 15px; background: #FDF2F8; border-radius: 8px; }
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .detail-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .positif { color: #10B981; font-weight: 600; }
    .negatif { color: #EF4444; font-weight: 600; }
    .mini-progress { display: flex; align-items: center; gap: 8px; }
    .mini-progress-fill { height: 6px; background: #EC4899; border-radius: 3px; width: 50px; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Budgets implements OnInit {
  budgets: Budget[] = [];
  lignesBudget: LigneBudget[] = [];
  filteredBudgets: Budget[] = [];
  selectedBudget: Budget | null = null;
  annees: number[] = [];

  currentBudget: any = {
    nom: '',
    annee: new Date().getFullYear(),
    periode: 'annuel',
    montant_previsionnel: 0,
    montant_realise: 0,
    categorie: 'fonctionnement',
    departement: '',
    responsable: '',
    date_debut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    date_fin: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    notes: '',
    statut: 'en_cours'
  };

  searchTerm = '';
  anneeFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  budgetToDelete: Budget | null = null;
  successMessage = '';

  totalPrevu = 0;

  ngOnInit() {
    this.genererAnnees();
    this.loadBudgets();
    this.loadLignes();
  }

  genererAnnees() {
    const anneeCourante = new Date().getFullYear();
    for (let i = anneeCourante - 2; i <= anneeCourante + 2; i++) {
      this.annees.push(i);
    }
  }

  loadBudgets() {
    const saved = localStorage.getItem('budgets');
    this.budgets = saved ? JSON.parse(saved) : [];
    this.filteredBudgets = [...this.budgets];
    this.calculerTotalPrevu();
  }

  loadLignes() {
    const saved = localStorage.getItem('lignes_budget');
    this.lignesBudget = saved ? JSON.parse(saved) : [];
  }

  saveBudget() {
    if (this.editMode) {
      const index = this.budgets.findIndex(b => b.id === this.currentBudget.id);
      if (index !== -1) {
        this.budgets[index] = { ...this.currentBudget };
        this.showSuccess('Budget modifié !');
      }
    } else {
      const newBudget = { ...this.currentBudget, id: Date.now(), montant_realise: 0 };
      this.budgets.push(newBudget);
      this.genererLignesBudget(newBudget);
      this.showSuccess('Budget ajouté !');
    }
    localStorage.setItem('budgets', JSON.stringify(this.budgets));
    this.filterBudgets();
    this.cancelForm();
  }

  genererLignesBudget(budget: any) {
    const lignes: LigneBudget[] = [];
    const mois = budget.periode === 'annuel' ? 12 : budget.periode === 'trimestriel' ? 4 : 12;
    const montantMensuel = budget.montant_previsionnel / mois;

    for (let i = 1; i <= mois; i++) {
      lignes.push({
        id: Date.now() + i,
        budget_id: budget.id,
        mois: i,
        montant_prevu: Math.round(montantMensuel),
        montant_realise: 0,
        ecart: -Math.round(montantMensuel)
      });
    }
    this.lignesBudget = [...this.lignesBudget, ...lignes];
    localStorage.setItem('lignes_budget', JSON.stringify(this.lignesBudget));
  }

  updateDates() {
    const annee = this.currentBudget.annee;
    if (this.currentBudget.periode === 'annuel') {
      this.currentBudget.date_debut = new Date(annee, 0, 1).toISOString().split('T')[0];
      this.currentBudget.date_fin = new Date(annee, 11, 31).toISOString().split('T')[0];
    } else if (this.currentBudget.periode === 'trimestriel') {
      // À personnaliser selon le trimestre choisi
    }
  }

  updateDateFin() {
    // Calcul automatique de la date de fin basé sur la période
  }

  editBudget(b: Budget) {
    this.currentBudget = { ...b };
    this.editMode = true;
    this.showForm = true;
  }

  voirDetails(b: Budget) {
    this.selectedBudget = b;
  }

  getLignesBudget(budgetId: number): LigneBudget[] {
    return this.lignesBudget.filter(l => l.budget_id === budgetId)
      .sort((a, b) => a.mois - b.mois);
  }

  getTauxRealisation(b: Budget): number {
    if (b.montant_previsionnel === 0) return 0;
    return Math.round((b.montant_realise / b.montant_previsionnel) * 100);
  }

  getTauxMensuel(ligne: LigneBudget): number {
    if (ligne.montant_prevu === 0) return 0;
    return Math.round((ligne.montant_realise / ligne.montant_prevu) * 100);
  }

  confirmDelete(b: Budget) {
    this.budgetToDelete = b;
    this.showDeleteModal = true;
  }

  deleteBudget() {
    if (this.budgetToDelete) {
      this.budgets = this.budgets.filter(b => b.id !== this.budgetToDelete?.id);
      this.lignesBudget = this.lignesBudget.filter(l => l.budget_id !== this.budgetToDelete?.id);
      localStorage.setItem('budgets', JSON.stringify(this.budgets));
      localStorage.setItem('lignes_budget', JSON.stringify(this.lignesBudget));
      this.filterBudgets();
      this.showDeleteModal = false;
      this.budgetToDelete = null;
      this.showSuccess('Budget supprimé !');
    }
  }

  cancelForm() {
    this.currentBudget = {
      nom: '',
      annee: new Date().getFullYear(),
      periode: 'annuel',
      montant_previsionnel: 0,
      montant_realise: 0,
      categorie: 'fonctionnement',
      departement: '',
      responsable: '',
      date_debut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      date_fin: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      notes: '',
      statut: 'en_cours'
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterBudgets() {
    let filtered = this.budgets;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.nom?.toLowerCase().includes(term) ||
        b.categorie?.toLowerCase().includes(term) ||
        b.departement?.toLowerCase().includes(term)
      );
    }

    if (this.anneeFilter) {
      filtered = filtered.filter(b => b.annee === Number(this.anneeFilter));
    }

    if (this.statutFilter) {
      filtered = filtered.filter(b => b.statut === this.statutFilter);
    }

    this.filteredBudgets = filtered;
    this.calculerTotalPrevu();
  }

  calculerTotalPrevu() {
    this.totalPrevu = this.filteredBudgets.reduce((s, b) => s + (b.montant_previsionnel || 0), 0);
  }

  getStatutLabel(statut: string): string {
    const labels: any = { en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
    return labels[statut] || statut;
  }

  getMoisLabel(mois: number): string {
    const moisLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return moisLabels[mois - 1];
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
