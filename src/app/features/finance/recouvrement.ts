import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CreanceFinance {
  id?: number;
  reference: string;
  tiers: string;
  type_tiers: 'client' | 'fournisseur' | 'autre';
  document_type: 'facture' | 'devis' | 'contrat' | 'avoir';
  document_numero: string;
  date_emission: string;
  date_echeance: string;
  montant_initial: number;
  montant_restant: number;
  devise: string;
  nature: 'créance' | 'dette';
  statut: 'en_attente' | 'partiel' | 'retard' | 'solde' | 'litige';
  responsable?: string;
  notes?: string;
}

@Component({
  selector: 'app-recouvrement-finance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="recouvrement-container">
      <div class="header">
        <div>
          <h1>Recouvrement - Finance</h1>
          <p class="subtitle">
            Créances: {{ totalCreances | number }} FCFA | 
            Dettes: {{ totalDettes | number }} FCFA |
            Solde: {{ soldeNet | number }} FCFA
          </p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle écriture</button>
      </div>
      
      <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>
      
      <!-- Formulaire d'ajout -->
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} écriture de recouvrement</h3>
        <form (ngSubmit)="saveCreance()" #creanceForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Référence *</label>
              <input type="text" [(ngModel)]="newCreance.reference" name="reference" required>
            </div>
            
            <div class="form-group">
              <label>Tiers *</label>
              <input type="text" [(ngModel)]="newCreance.tiers" name="tiers" required>
            </div>
            
            <div class="form-group">
              <label>Type de tiers</label>
              <select [(ngModel)]="newCreance.type_tiers" name="type_tiers">
                <option value="client">Client</option>
                <option value="fournisseur">Fournisseur</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Nature</label>
              <select [(ngModel)]="newCreance.nature" name="nature" required (change)="onNatureChange()">
                <option value="créance">Créance (on nous doit)</option>
                <option value="dette">Dette (nous devons)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Type de document</label>
              <select [(ngModel)]="newCreance.document_type" name="document_type">
                <option value="facture">Facture</option>
                <option value="devis">Devis</option>
                <option value="contrat">Contrat</option>
                <option value="avoir">Avoir</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>N° document</label>
              <input type="text" [(ngModel)]="newCreance.document_numero" name="document_numero">
            </div>
            
            <div class="form-group">
              <label>Date d'émission</label>
              <input type="date" [(ngModel)]="newCreance.date_emission" name="date_emission" required>
            </div>
            
            <div class="form-group">
              <label>Date d'échéance</label>
              <input type="date" [(ngModel)]="newCreance.date_echeance" name="date_echeance" required>
            </div>
            
            <div class="form-group">
              <label>Montant initial *</label>
              <input type="number" [(ngModel)]="newCreance.montant_initial" name="montant_initial" required (input)="updateRestant()">
            </div>
            
            <div class="form-group">
              <label>Devise</label>
              <select [(ngModel)]="newCreance.devise" name="devise">
                <option value="FCFA">FCFA</option>
                <option value="EUR">Euro</option>
                <option value="USD">Dollar US</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Montant restant *</label>
              <input type="number" [(ngModel)]="newCreance.montant_restant" name="montant_restant" required>
            </div>
            
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="newCreance.statut" name="statut" required>
                <option value="en_attente">En attente</option>
                <option value="partiel">Partiel</option>
                <option value="retard">En retard</option>
                <option value="solde">Soldé</option>
                <option value="litige">Litige</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Responsable</label>
              <input type="text" [(ngModel)]="newCreance.responsable" name="responsable">
            </div>
            
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="newCreance.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">Enregistrer</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
          </div>
        </form>
      </div>
      
      <!-- KPIs -->
      <div class="kpi-grid" *ngIf="creances.length > 0">
        <div class="kpi-card creance">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-label">Total créances</span>
            <span class="kpi-value">{{ totalCreances | number }} FCFA</span>
          </div>
        </div>
        <div class="kpi-card dette">
          <div class="kpi-icon">💳</div>
          <div class="kpi-content">
            <span class="kpi-label">Total dettes</span>
            <span class="kpi-value">{{ totalDettes | number }} FCFA</span>
          </div>
        </div>
        <div class="kpi-card solde">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-content">
            <span class="kpi-label">Solde net</span>
            <span class="kpi-value">{{ soldeNet | number }} FCFA</span>
          </div>
        </div>
        <div class="kpi-card retard">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-label">En retard</span>
            <span class="kpi-value">{{ totalRetard | number }} FCFA</span>
          </div>
        </div>
      </div>
      
      <!-- Filtres -->
      <div class="filters-bar" *ngIf="creances.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCreances()" placeholder="Rechercher...">
        </div>
        
        <select [(ngModel)]="natureFilter" (ngModelChange)="filterCreances()" class="filter-select">
          <option value="">Toutes natures</option>
          <option value="créance">Créances</option>
          <option value="dette">Dettes</option>
        </select>
        
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterCreances()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="en_attente">En attente</option>
          <option value="partiel">Partiel</option>
          <option value="retard">En retard</option>
          <option value="solde">Soldé</option>
          <option value="litige">Litige</option>
        </select>
      </div>
      
      <!-- Tableau -->
      <div class="table-container" *ngIf="creances.length > 0; else emptyState">
        <table class="creances-table">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Tiers</th>
              <th>Type</th>
              <th>Document</th>
              <th>Échéance</th>
              <th>Initial</th>
              <th>Restant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredCreances" [class.retard]="c.statut === 'retard'" [class.litige]="c.statut === 'litige'">
              <td>{{ c.reference }}</td>
              <td>{{ c.tiers }}</td>
              <td>{{ c.nature === 'créance' ? '💰' : '💳' }} {{ c.nature }}</td>
              <td>{{ c.document_type }} {{ c.document_numero }}</td>
              <td [class.urgent]="isEcheanceProche(c)">{{ c.date_echeance | date }}</td>
              <td class="text-right">{{ c.montant_initial | number }}</td>
              <td class="text-right montant-restant">{{ c.montant_restant | number }}</td>
              <td><span class="badge" [class]="c.statut">{{ getStatutLabel(c.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="enregistrerPaiement(c)" [disabled]="c.statut === 'solde'">💰</button>
                <button class="btn-icon" (click)="editCreance(c)">✏️</button>
                <button class="btn-icon" (click)="duplicateCreance(c)">📋</button>
                <button class="btn-icon delete" (click)="deleteCreance(c)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h2>Aucune écriture de recouvrement</h2>
          <p>Ajoutez votre première créance ou dette</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle écriture</button>
        </div>
      </ng-template>
      
      <!-- Modal de paiement -->
      <div class="modal" *ngIf="showPaiementModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Enregistrer un paiement</h3>
            <button class="btn-close" (click)="showPaiementModal = false">✕</button>
          </div>
          
          <div class="modal-body" *ngIf="paiementDocument">
            <p><strong>Tiers:</strong> {{ paiementDocument.tiers }}</p>
            <p><strong>Document:</strong> {{ paiementDocument.document_type }} {{ paiementDocument.document_numero }}</p>
            <p><strong>Montant initial:</strong> {{ paiementDocument.montant_initial | number }} {{ paiementDocument.devise }}</p>
            <p><strong>Montant restant:</strong> {{ paiementDocument.montant_restant | number }} {{ paiementDocument.devise }}</p>
            
            <div class="form-group">
              <label>Montant payé *</label>
              <input type="number" [(ngModel)]="montantPaiement" class="form-control" min="0" [max]="paiementDocument.montant_restant">
            </div>
            
            <div class="form-group">
              <label>Mode de paiement</label>
              <select [(ngModel)]="modePaiement" class="form-control">
                <option value="especes">Espèces</option>
                <option value="carte">Carte</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="compensation">Compensation</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Date de paiement</label>
              <input type="date" [(ngModel)]="datePaiement" class="form-control">
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showPaiementModal = false">Annuler</button>
            <button class="btn-save" (click)="validerPaiement()">✅ Valider</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recouvrement-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; display: flex; gap: 16px; border: 1px solid #FCE7F3; }
    .kpi-icon { font-size: 32px; background: #FDF2F8; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-card.creance .kpi-icon { color: #EC4899; }
    .kpi-card.dette .kpi-icon { color: #F59E0B; }
    .kpi-card.solde .kpi-icon { color: #10B981; }
    .kpi-card.retard .kpi-icon { color: #EF4444; }
    .kpi-value { display: block; font-size: 20px; font-weight: 700; color: #1F2937; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .creances-table { width: 100%; border-collapse: collapse; }
    .creances-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .creances-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .creances-table tr.retard { background: #FEF2F2; }
    .creances-table tr.litige { background: #FEF2F2; }
    .text-right { text-align: right; }
    .montant-restant { font-weight: 600; color: #EC4899; }
    .urgent { color: #EF4444; font-weight: 600; }
    
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.en_attente { background: #F59E0B; color: white; }
    .badge.partiel { background: #EC4899; color: white; }
    .badge.retard { background: #EF4444; color: white; }
    .badge.solde { background: #10B981; color: white; }
    .badge.litige { background: #6B7280; color: white; }
    
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
  `]
})
export class Recouvrement implements OnInit {
  creances: CreanceFinance[] = [];
  filteredCreances: CreanceFinance[] = [];
  
  newCreance: Partial<CreanceFinance> = {
    reference: 'REC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    tiers: '',
    type_tiers: 'client',
    nature: 'créance',
    document_type: 'facture',
    document_numero: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    montant_initial: 0,
    montant_restant: 0,
    devise: 'FCFA',
    statut: 'en_attente',
    responsable: '',
    notes: ''
  };
  
  searchTerm = '';
  natureFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showPaiementModal = false;
  successMessage = '';
  
  totalCreances = 0;
  totalDettes = 0;
  totalRetard = 0;
  soldeNet = 0;
  
  paiementDocument: CreanceFinance | null = null;
  montantPaiement = 0;
  modePaiement = 'especes';
  datePaiement = new Date().toISOString().split('T')[0];
  
  ngOnInit() {
    this.loadCreances();
  }
  
  loadCreances() {
    const saved = localStorage.getItem('recouvrement_finance');
    this.creances = saved ? JSON.parse(saved) : [];
    this.filteredCreances = [...this.creances];
    this.calculerStats();
  }
  
  onNatureChange() {
    // Ajuster le statut par défaut selon la nature
    if (this.newCreance.nature === 'dette') {
      this.newCreance.statut = 'en_attente';
    }
  }
  
  updateRestant() {
    this.newCreance.montant_restant = this.newCreance.montant_initial;
  }
  
  saveCreance() {
    if (this.editMode && this.newCreance.id) {
      const index = this.creances.findIndex(c => c.id === this.newCreance.id);
      if (index !== -1) {
        this.creances[index] = this.newCreance as CreanceFinance;
        this.showMessage('Écriture modifiée !');
      }
    } else {
      const newCreance: CreanceFinance = {
        id: Date.now(),
        reference: this.newCreance.reference || '',
        tiers: this.newCreance.tiers || '',
        type_tiers: this.newCreance.type_tiers as 'client' | 'fournisseur' | 'autre' || 'client',
        nature: this.newCreance.nature as 'créance' | 'dette' || 'créance',
        document_type: this.newCreance.document_type as 'facture' | 'devis' | 'contrat' | 'avoir' || 'facture',
        document_numero: this.newCreance.document_numero || '',
        date_emission: this.newCreance.date_emission || new Date().toISOString().split('T')[0],
        date_echeance: this.newCreance.date_echeance || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        montant_initial: this.newCreance.montant_initial || 0,
        montant_restant: this.newCreance.montant_restant || this.newCreance.montant_initial || 0,
        devise: this.newCreance.devise || 'FCFA',
        statut: this.newCreance.statut as 'en_attente' | 'partiel' | 'retard' | 'solde' | 'litige' || 'en_attente',
        responsable: this.newCreance.responsable,
        notes: this.newCreance.notes
      };
      this.creances.push(newCreance);
      this.showMessage('Écriture ajoutée !');
    }
    
    localStorage.setItem('recouvrement_finance', JSON.stringify(this.creances));
    this.filterCreances();
    this.calculerStats();
    this.cancelForm();
  }
  
  editCreance(c: CreanceFinance) {
    this.newCreance = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  
  duplicateCreance(c: CreanceFinance) {
    const newCreance: CreanceFinance = { 
      ...c, 
      id: Date.now(), 
      reference: c.reference + '-COPY',
      statut: 'en_attente',
      montant_restant: c.montant_initial
    };
    this.creances.push(newCreance);
    localStorage.setItem('recouvrement_finance', JSON.stringify(this.creances));
    this.filterCreances();
    this.calculerStats();
    this.showMessage('Écriture dupliquée !');
  }
  
  deleteCreance(c: CreanceFinance) {
    if (confirm('Supprimer cette écriture ?')) {
      this.creances = this.creances.filter(cre => cre.id !== c.id);
      localStorage.setItem('recouvrement_finance', JSON.stringify(this.creances));
      this.filterCreances();
      this.calculerStats();
      this.showMessage('Écriture supprimée !');
    }
  }
  
  enregistrerPaiement(c: CreanceFinance) {
    this.paiementDocument = c;
    this.montantPaiement = c.montant_restant;
    this.showPaiementModal = true;
  }
  
  validerPaiement() {
    if (this.paiementDocument && this.montantPaiement > 0) {
      const index = this.creances.findIndex(c => c.id === this.paiementDocument?.id);
      if (index !== -1) {
        const nouveauRestant = this.paiementDocument.montant_restant - this.montantPaiement;
        this.creances[index].montant_restant = Math.max(0, nouveauRestant);
        this.creances[index].statut = nouveauRestant <= 0 ? 'solde' : 'partiel';
        
        localStorage.setItem('recouvrement_finance', JSON.stringify(this.creances));
        this.filterCreances();
        this.calculerStats();
        this.showPaiementModal = false;
        this.showMessage(`✅ Paiement de ${this.montantPaiement.toLocaleString()} FCFA enregistré !`);
      }
    }
  }
  
  cancelForm() {
    this.newCreance = {
      reference: 'REC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      tiers: '',
      type_tiers: 'client',
      nature: 'créance',
      document_type: 'facture',
      document_numero: '',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      montant_initial: 0,
      montant_restant: 0,
      devise: 'FCFA',
      statut: 'en_attente',
      responsable: '',
      notes: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  
  filterCreances() {
    let filtered = this.creances;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.reference?.toLowerCase().includes(term) ||
        c.tiers?.toLowerCase().includes(term) ||
        c.document_numero?.toLowerCase().includes(term)
      );
    }
    
    if (this.natureFilter) {
      filtered = filtered.filter(c => c.nature === this.natureFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }
    
    this.filteredCreances = filtered;
  }
  
  calculerStats() {
    this.totalCreances = this.creances
      .filter(c => c.nature === 'créance')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.totalDettes = this.creances
      .filter(c => c.nature === 'dette')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.totalRetard = this.creances
      .filter(c => c.statut === 'retard')
      .reduce((sum, c) => sum + (c.montant_restant || 0), 0);
      
    this.soldeNet = this.totalCreances - this.totalDettes;
  }
  
  isEcheanceProche(c: CreanceFinance): boolean {
    if (c.statut === 'solde') return false;
    const today = new Date();
    const echeance = new Date(c.date_echeance);
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      en_attente: 'En attente', 
      partiel: 'Partiel', 
      retard: 'En retard', 
      solde: 'Soldé', 
      litige: 'Litige' 
    };
    return labels[statut] || statut;
  }
  
  showMessage(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}