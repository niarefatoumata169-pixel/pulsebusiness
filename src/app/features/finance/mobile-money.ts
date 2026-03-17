import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CompteMobile {
  id?: number;
  operateur: 'orange' | 'moov' | 'mtn' | 'other';
  nom_operateur?: string;
  numero: string;
  nom_compte: string;
  solde: number;
  plafond_journalier?: number;
  frais_depot?: number;
  frais_retrait?: number;
  date_creation: string;
  notes?: string;
}

interface TransactionMobile {
  id?: number;
  compte_id: number;
  compte_nom?: string;
  date: string;
  type: 'depot' | 'retrait' | 'transfert' | 'paiement' | 'reception';
  montant: number;
  frais: number;
  montant_total: number;
  telephone_destinataire?: string;
  nom_destinataire?: string;
  reference?: string;
  motif?: string;
  statut: 'effectue' | 'en_attente' | 'echoue';
  notes?: string;
}

@Component({
  selector: 'app-mobile-money',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mobile-container">
      <div class="header">
        <div>
          <h1>Mobile Money</h1>
          <p class="subtitle">{{ comptes.length }} compte(s) • Solde total: {{ soldeTotal | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-add" (click)="showCompteForm = !showCompteForm">+ Nouveau compte</button>
          <button class="btn-transaction" (click)="showTransactionForm = !showTransactionForm" *ngIf="comptes.length > 0">📱 Nouvelle transaction</button>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>

      <!-- Formulaire nouveau compte -->
      <div class="form-card" *ngIf="showCompteForm">
        <h3>{{ editCompteMode ? 'Modifier' : 'Nouveau' }} compte</h3>
        <form (ngSubmit)="saveCompte()" #compteForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Opérateur</label>
              <select [(ngModel)]="currentCompte.operateur" name="operateur">
                <option value="orange">Orange Money</option>
                <option value="moov">Moov Money</option>
                <option value="mtn">MTN Money</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div class="form-group" *ngIf="currentCompte.operateur === 'other'">
              <label>Nom opérateur</label>
              <input type="text" [(ngModel)]="currentCompte.nom_operateur" name="nom_operateur">
            </div>
            <div class="form-group">
              <label>Numéro *</label>
              <input type="tel" [(ngModel)]="currentCompte.numero" name="numero" required>
            </div>
            <div class="form-group">
              <label>Nom du compte</label>
              <input type="text" [(ngModel)]="currentCompte.nom_compte" name="nom_compte">
            </div>
            <div class="form-group">
              <label>Solde initial</label>
              <input type="number" [(ngModel)]="currentCompte.solde" name="solde">
            </div>
            <div class="form-group">
              <label>Plafond journalier</label>
              <input type="number" [(ngModel)]="currentCompte.plafond_journalier" name="plafond_journalier">
            </div>
            <div class="form-group">
              <label>Frais dépôt (%)</label>
              <input type="number" [(ngModel)]="currentCompte.frais_depot" name="frais_depot">
            </div>
            <div class="form-group">
              <label>Frais retrait (%)</label>
              <input type="number" [(ngModel)]="currentCompte.frais_retrait" name="frais_retrait">
            </div>
            <div class="form-group">
              <label>Date création</label>
              <input type="date" [(ngModel)]="currentCompte.date_creation" name="date_creation">
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentCompte.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelCompteForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="compteForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Formulaire nouvelle transaction -->
      <div class="form-card" *ngIf="showTransactionForm && comptes.length > 0">
        <h3>Nouvelle transaction</h3>
        <form (ngSubmit)="saveTransaction()" #transactionForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Compte *</label>
              <select [(ngModel)]="currentTransaction.compte_id" name="compte_id" required (change)="onCompteChange()">
                <option value="">Sélectionner un compte</option>
                <option *ngFor="let c of comptes" [value]="c.id">{{ getOperateurLabel(c.operateur) }} - {{ c.numero }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentTransaction.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="currentTransaction.type" name="type" (change)="updateFrais()">
                <option value="depot">Dépôt</option>
                <option value="retrait">Retrait</option>
                <option value="transfert">Transfert</option>
                <option value="paiement">Paiement</option>
                <option value="reception">Réception</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="currentTransaction.montant" name="montant" required (input)="updateFrais()">
            </div>
            <div class="form-group">
              <label>Frais</label>
              <input type="number" [(ngModel)]="currentTransaction.frais" name="frais" (input)="updateTotal()">
            </div>
            <div class="form-group">
              <label>Montant total</label>
              <input type="number" [(ngModel)]="currentTransaction.montant_total" name="montant_total" readonly>
            </div>
            <div class="form-group">
              <label>Téléphone destinataire</label>
              <input type="tel" [(ngModel)]="currentTransaction.telephone_destinataire" name="telephone_destinataire">
            </div>
            <div class="form-group">
              <label>Nom destinataire</label>
              <input type="text" [(ngModel)]="currentTransaction.nom_destinataire" name="nom_destinataire">
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input type="text" [(ngModel)]="currentTransaction.reference" name="reference">
            </div>
            <div class="form-group">
              <label>Motif</label>
              <input type="text" [(ngModel)]="currentTransaction.motif" name="motif">
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="currentTransaction.statut" name="statut">
                <option value="effectue">Effectué</option>
                <option value="en_attente">En attente</option>
                <option value="echoue">Échoué</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea [(ngModel)]="currentTransaction.notes" name="notes" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="showTransactionForm = false">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="transactionForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Liste des comptes -->
      <div class="comptes-grid" *ngIf="comptes.length > 0; else emptyState">
        <div class="compte-card" *ngFor="let compte of comptes">
          <div class="compte-header">
            <span class="compte-nom">{{ compte.nom_compte || getOperateurLabel(compte.operateur) }}</span>
            <span class="compte-operateur">{{ getOperateurLabel(compte.operateur) }}</span>
          </div>
          <div class="compte-body">
            <div class="compte-numero">{{ compte.numero }}</div>
            <div class="compte-solde">
              <span class="solde-label">Solde:</span>
              <span class="solde-valeur">{{ compte.solde | number }} FCFA</span>
            </div>
            <div class="compte-frais" *ngIf="compte.frais_depot || compte.frais_retrait">
              <small>Frais: dépôt {{ compte.frais_depot || 0 }}% / retrait {{ compte.frais_retrait || 0 }}%</small>
            </div>
          </div>
          <div class="compte-actions">
            <button class="btn-icon" (click)="voirTransactions(compte)" title="Voir transactions">📋</button>
            <button class="btn-icon" (click)="editCompte(compte)" title="Modifier">✏️</button>
            <button class="btn-icon delete" (click)="confirmDeleteCompte(compte)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Détail des transactions -->
      <div class="transactions-section" *ngIf="selectedCompte">
        <div class="section-header">
          <h3>Transactions {{ selectedCompte.nom_compte || getOperateurLabel(selectedCompte.operateur) }}</h3>
          <button class="btn-close" (click)="selectedCompte = null">✕</button>
        </div>
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Frais</th>
              <th>Total</th>
              <th>Destinataire</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of getTransactionsForCompte(selectedCompte.id!)">
              <td>{{ t.date | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge" [class]="t.type">{{ getTypeLabel(t.type) }}</span></td>
              <td>{{ t.montant | number }} FCFA</td>
              <td>{{ t.frais | number }} FCFA</td>
              <td [class.depot]="t.type === 'depot' || t.type === 'reception'" 
                  [class.retrait]="t.type === 'retrait' || t.type === 'transfert' || t.type === 'paiement'">
                {{ t.montant_total | number }} FCFA
              </td>
              <td>{{ t.nom_destinataire || t.telephone_destinataire || '-' }}</td>
              <td><span class="badge-statut" [class]="t.statut">{{ getStatutLabel(t.statut) }}</span></td>
            </tr>
            <tr *ngIf="getTransactionsForCompte(selectedCompte.id!).length === 0">
              <td colspan="7" class="text-center">Aucune transaction pour ce compte</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📱</div>
          <h2>Aucun compte Mobile Money</h2>
          <p>Ajoutez votre premier compte</p>
          <button class="btn-primary" (click)="showCompteForm = true">+ Nouveau compte</button>
        </div>
      </ng-template>

      <!-- Modal de confirmation suppression -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer {{ deleteType === 'compte' ? 'le compte' : 'la transaction' }} 
             <strong>{{ deleteType === 'compte' ? compteToDelete?.numero : '' }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="confirmDelete()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-transaction { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
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
    .comptes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .compte-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .compte-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .compte-nom { font-weight: 600; color: #1F2937; }
    .compte-operateur { font-size: 12px; padding: 4px 8px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .compte-numero { font-family: monospace; color: #6B7280; margin-bottom: 10px; }
    .compte-solde { display: flex; justify-content: space-between; border-top: 1px solid #FCE7F3; padding-top: 15px; }
    .solde-valeur { font-weight: 600; color: #10B981; }
    .compte-frais { margin-top: 8px; color: #6B7280; }
    .compte-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .transactions-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; margin-top: 30px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .transactions-table { width: 100%; border-collapse: collapse; }
    .transactions-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .transactions-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.depot, .badge.reception { background: #10B981; color: white; }
    .badge.retrait, .badge.transfert, .badge.paiement { background: #EC4899; color: white; }
    .badge-statut { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-statut.effectue { background: #10B981; color: white; }
    .badge-statut.en_attente { background: #F59E0B; color: white; }
    .badge-statut.echoue { background: #EF4444; color: white; }
    .depot, .reception { color: #10B981; font-weight: 600; }
    .retrait, .transfert, .paiement { color: #EC4899; font-weight: 600; }
    .text-center { text-align: center; color: #9CA3AF; padding: 20px; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class MobileMoney implements OnInit {
  comptes: CompteMobile[] = [];
  transactions: TransactionMobile[] = [];
  selectedCompte: CompteMobile | null = null;

  currentCompte: any = {
    operateur: 'orange',
    nom_operateur: '',
    numero: '',
    nom_compte: '',
    solde: 0,
    plafond_journalier: null,
    frais_depot: null,
    frais_retrait: null,
    date_creation: new Date().toISOString().split('T')[0],
    notes: ''
  };

  currentTransaction: any = {
    compte_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'depot',
    montant: 0,
    frais: 0,
    montant_total: 0,
    telephone_destinataire: '',
    nom_destinataire: '',
    reference: '',
    motif: '',
    statut: 'effectue',
    notes: ''
  };

  showCompteForm = false;
  showTransactionForm = false;
  editCompteMode = false;
  showDeleteModal = false;
  deleteType: 'compte' | 'transaction' = 'compte';
  compteToDelete: CompteMobile | null = null;
  successMessage = '';

  soldeTotal = 0;

  ngOnInit() {
    this.loadComptes();
    this.loadTransactions();
  }

  loadComptes() {
    const saved = localStorage.getItem('comptes_mobile');
    this.comptes = saved ? JSON.parse(saved) : [];
    this.calculerSoldeTotal();
  }

  loadTransactions() {
    const saved = localStorage.getItem('transactions_mobile');
    this.transactions = saved ? JSON.parse(saved) : [];
  }

  saveComptes() {
    localStorage.setItem('comptes_mobile', JSON.stringify(this.comptes));
    this.calculerSoldeTotal();
  }

  saveTransactions() {
    localStorage.setItem('transactions_mobile', JSON.stringify(this.transactions));
  }

  saveCompte() {
    if (this.editCompteMode) {
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
    this.cancelCompteForm();
  }

  saveTransaction() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (!compte) return;

    // Mettre à jour le solde
    const index = this.comptes.findIndex(c => c.id === compte.id);
    if (index !== -1) {
      if (this.currentTransaction.type === 'depot' || this.currentTransaction.type === 'reception') {
        this.comptes[index].solde += this.currentTransaction.montant_total;
      } else {
        this.comptes[index].solde -= this.currentTransaction.montant_total;
      }
      this.saveComptes();
    }

    const newTransaction = {
      ...this.currentTransaction,
      id: Date.now(),
      compte_nom: compte.nom_compte || this.getOperateurLabel(compte.operateur)
    };

    this.transactions.push(newTransaction);
    this.saveTransactions();
    this.showSuccess('Transaction enregistrée !');
    this.showTransactionForm = false;
    this.resetTransactionForm();
  }

  onCompteChange() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (compte) {
      this.currentTransaction.compte_nom = compte.nom_compte || this.getOperateurLabel(compte.operateur);
      this.updateFrais();
    }
  }

  updateFrais() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (!compte) return;

    if (this.currentTransaction.type === 'depot' && compte.frais_depot) {
      this.currentTransaction.frais = this.currentTransaction.montant * compte.frais_depot / 100;
    } else if (this.currentTransaction.type === 'retrait' && compte.frais_retrait) {
      this.currentTransaction.frais = this.currentTransaction.montant * compte.frais_retrait / 100;
    } else {
      this.currentTransaction.frais = 0;
    }
    this.updateTotal();
  }

  updateTotal() {
    this.currentTransaction.montant_total = this.currentTransaction.montant + this.currentTransaction.frais;
  }

  voirTransactions(compte: CompteMobile) {
    this.selectedCompte = compte;
  }

  getTransactionsForCompte(compteId: number): TransactionMobile[] {
    return this.transactions.filter(t => t.compte_id === compteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  editCompte(c: CompteMobile) {
    this.currentCompte = { ...c };
    this.editCompteMode = true;
    this.showCompteForm = true;
  }

  confirmDeleteCompte(c: CompteMobile) {
    this.deleteType = 'compte';
    this.compteToDelete = c;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.deleteType === 'compte' && this.compteToDelete) {
      this.comptes = this.comptes.filter(c => c.id !== this.compteToDelete?.id);
      this.transactions = this.transactions.filter(t => t.compte_id !== this.compteToDelete?.id);
      this.saveComptes();
      this.saveTransactions();
      this.showSuccess('Compte supprimé !');
    }
    this.showDeleteModal = false;
    this.compteToDelete = null;
  }

  cancelCompteForm() {
    this.currentCompte = {
      operateur: 'orange',
      nom_operateur: '',
      numero: '',
      nom_compte: '',
      solde: 0,
      plafond_journalier: null,
      frais_depot: null,
      frais_retrait: null,
      date_creation: new Date().toISOString().split('T')[0],
      notes: ''
    };
    this.showCompteForm = false;
    this.editCompteMode = false;
  }

  resetTransactionForm() {
    this.currentTransaction = {
      compte_id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'depot',
      montant: 0,
      frais: 0,
      montant_total: 0,
      telephone_destinataire: '',
      nom_destinataire: '',
      reference: '',
      motif: '',
      statut: 'effectue',
      notes: ''
    };
  }

  calculerSoldeTotal() {
    this.soldeTotal = this.comptes.reduce((s, c) => s + (c.solde || 0), 0);
  }

  getOperateurLabel(operateur: string): string {
    const labels: any = { orange: 'Orange Money', moov: 'Moov Money', mtn: 'MTN Money', other: 'Autre' };
    return labels[operateur] || operateur;
  }

  getTypeLabel(type: string): string {
    const labels: any = { 
      depot: 'Dépôt', retrait: 'Retrait', transfert: 'Transfert', 
      paiement: 'Paiement', reception: 'Réception' 
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string): string {
    const labels: any = { effectue: 'Effectué', en_attente: 'En attente', echoue: 'Échoué' };
    return labels[statut] || statut;
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
