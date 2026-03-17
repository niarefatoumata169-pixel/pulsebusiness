import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface OperationDiverse {
  id?: number;
  date: string;
  libelle: string;
  categorie: string;
  montant: number;
  type: 'produit' | 'charge' | 'transfert' | 'correction';
  compte_debit?: string;
  compte_credit?: string;
  reference?: string;
  justificatif?: string;
  notes?: string;
  validee: boolean;
}

@Component({
  selector: 'app-od',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="od-container">
      <div class="header">
        <div>
          <h1>Opérations Diverses</h1>
          <p class="subtitle">{{ filteredOD.length }} opération(s) • Total: {{ totalOD | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle OD</button>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} opération diverse</h3>
        <form (ngSubmit)="saveOD()" #odForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentOD.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="currentOD.libelle" name="libelle" required>
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="currentOD.categorie" name="categorie">
                <option value="achat">Achat</option>
                <option value="vente">Vente</option>
                <option value="frais">Frais</option>
                <option value="salaire">Salaire</option>
                <option value="impot">Impôt</option>
                <option value="divers">Divers</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="currentOD.type" name="type">
                <option value="produit">Produit</option>
                <option value="charge">Charge</option>
                <option value="transfert">Transfert</option>
                <option value="correction">Correction</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="currentOD.montant" name="montant" required>
            </div>
            <div class="form-group">
              <label>Compte débit</label>
              <input type="text" [(ngModel)]="currentOD.compte_debit" name="compte_debit">
            </div>
            <div class="form-group">
              <label>Compte crédit</label>
              <input type="text" [(ngModel)]="currentOD.compte_credit" name="compte_credit">
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="currentOD.reference" name="reference">
            </div>
            <div class="form-group">
              <label>Justificatif</label>
              <input type="text" [(ngModel)]="currentOD.justificatif" name="justificatif">
            </div>
            <div class="form-group">
              <label>Validée</label>
              <input type="checkbox" [(ngModel)]="currentOD.validee" name="validee">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentOD.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="odForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Filtres -->
      <div class="filters-bar" *ngIf="operations.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterOD()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterOD()" class="filter-select">
          <option value="">Tous types</option>
          <option value="produit">Produits</option>
          <option value="charge">Charges</option>
          <option value="transfert">Transferts</option>
          <option value="correction">Corrections</option>
        </select>
        <select [(ngModel)]="valideeFilter" (ngModelChange)="filterOD()" class="filter-select">
          <option value="">Tous</option>
          <option value="true">Validées</option>
          <option value="false">Non validées</option>
        </select>
      </div>

      <!-- Tableau -->
      <div class="table-container" *ngIf="operations.length > 0; else emptyState">
        <table class="od-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Référence</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let od of filteredOD">
              <td>{{ od.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ od.libelle }}</td>
              <td>{{ getCategorieLabel(od.categorie) }}</td>
              <td><span class="badge" [class]="od.type">{{ getTypeLabel(od.type) }}</span></td>
              <td [class.produit]="od.type === 'produit'" [class.charge]="od.type === 'charge'">
                {{ od.montant | number }} FCFA
              </td>
              <td>{{ od.reference || '-' }}</td>
              <td>
                <span class="badge-statut" [class.validee]="od.validee" [class.non-validee]="!od.validee">
                  {{ od.validee ? 'Validée' : 'En attente' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon" (click)="toggleValidee(od)" title="Valider/Dévalider">✓</button>
                <button class="btn-icon" (click)="editOD(od)" title="Modifier">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(od)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h2>Aucune opération diverse</h2>
          <p>Enregistrez votre première opération diverse</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle OD</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'opération <strong>{{ odToDelete?.libelle }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteOD()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .od-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    input[type="checkbox"] { width: 20px; height: 20px; margin-top: 5px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .od-table { width: 100%; border-collapse: collapse; }
    .od-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .od-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.produit { background: #10B981; color: white; }
    .badge.charge { background: #EF4444; color: white; }
    .badge.transfert { background: #EC4899; color: white; }
    .badge.correction { background: #F59E0B; color: white; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.validee { background: #10B981; color: white; }
    .badge-statut.non-validee { background: #9CA3AF; color: white; }
    .produit { color: #10B981; font-weight: 600; }
    .charge { color: #EF4444; font-weight: 600; }
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
export class Od implements OnInit {
  operations: OperationDiverse[] = [];
  filteredOD: OperationDiverse[] = [];
  currentOD: any = {
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    categorie: 'divers',
    montant: 0,
    type: 'charge',
    compte_debit: '',
    compte_credit: '',
    reference: '',
    justificatif: '',
    notes: '',
    validee: false
  };
  searchTerm = '';
  typeFilter = '';
  valideeFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  odToDelete: OperationDiverse | null = null;
  successMessage = '';

  totalOD = 0;

  ngOnInit() { this.loadOD(); }

  loadOD() {
    const saved = localStorage.getItem('operations_diverses');
    this.operations = saved ? JSON.parse(saved) : [];
    this.filteredOD = [...this.operations];
    this.calculerTotal();
  }

  saveOD() {
    if (this.editMode) {
      const index = this.operations.findIndex(o => o.id === this.currentOD.id);
      if (index !== -1) {
        this.operations[index] = { ...this.currentOD };
        this.showSuccess('Opération modifiée !');
      }
    } else {
      const newOD = { ...this.currentOD, id: Date.now() };
      this.operations.push(newOD);
      this.showSuccess('Opération ajoutée !');
    }
    localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
    this.filterOD();
    this.cancelForm();
  }

  toggleValidee(od: OperationDiverse) {
    od.validee = !od.validee;
    localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
    this.filterOD();
    this.showSuccess(od.validee ? 'Opération validée' : 'Validation retirée');
  }

  editOD(od: OperationDiverse) {
    this.currentOD = { ...od };
    this.editMode = true;
    this.showForm = true;
  }

  confirmDelete(od: OperationDiverse) {
    this.odToDelete = od;
    this.showDeleteModal = true;
  }

  deleteOD() {
    if (this.odToDelete) {
      this.operations = this.operations.filter(o => o.id !== this.odToDelete?.id);
      localStorage.setItem('operations_diverses', JSON.stringify(this.operations));
      this.filterOD();
      this.showDeleteModal = false;
      this.odToDelete = null;
      this.showSuccess('Opération supprimée !');
    }
  }

  cancelForm() {
    this.currentOD = {
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      categorie: 'divers',
      montant: 0,
      type: 'charge',
      compte_debit: '',
      compte_credit: '',
      reference: '',
      justificatif: '',
      notes: '',
      validee: false
    };
    this.showForm = false;
    this.editMode = false;
  }

  filterOD() {
    let filtered = this.operations;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.libelle?.toLowerCase().includes(term) ||
        o.reference?.toLowerCase().includes(term) ||
        o.notes?.toLowerCase().includes(term)
      );
    }

    if (this.typeFilter) {
      filtered = filtered.filter(o => o.type === this.typeFilter);
    }

    if (this.valideeFilter) {
      const validee = this.valideeFilter === 'true';
      filtered = filtered.filter(o => o.validee === validee);
    }

    this.filteredOD = filtered;
    this.calculerTotal();
  }

  calculerTotal() {
    this.totalOD = this.filteredOD.reduce((s, o) => s + (o.montant || 0), 0);
  }

  getCategorieLabel(cat: string): string {
    const labels: any = { 
      achat: 'Achat', vente: 'Vente', frais: 'Frais', 
      salaire: 'Salaire', impot: 'Impôt', divers: 'Divers' 
    };
    return labels[cat] || cat;
  }

  getTypeLabel(type: string): string {
    const labels: any = { produit: 'Produit', charge: 'Charge', transfert: 'Transfert', correction: 'Correction' };
    return labels[type] || type;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
