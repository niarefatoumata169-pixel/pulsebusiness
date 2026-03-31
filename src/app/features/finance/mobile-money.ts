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
  template: `...` // (le template reste inchangé, nous ne le recopions pas ici pour garder la réponse concise)
})
export class MobileMoney implements OnInit {
  comptes: CompteMobile[] = [];
  transactions: TransactionMobile[] = [];
  selectedCompte: CompteMobile | null = null;

  currentCompte: Partial<CompteMobile> = {
    operateur: 'orange',
    numero: '',
    nom_compte: '',
    solde: 0,
    date_creation: new Date().toISOString().split('T')[0]
  };

  currentTransaction: Partial<TransactionMobile> = {
    type: 'depot',
    date: new Date().toISOString().split('T')[0],
    montant: 0,
    frais: 0,
    montant_total: 0,
    statut: 'effectue'
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

  openCompteForm() {
    this.currentCompte = {
      operateur: 'orange',
      numero: '',
      nom_compte: '',
      solde: 0,
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editCompteMode = false;
    this.showCompteForm = true;
  }

  openTransactionForm() {
    this.currentTransaction = {
      type: 'depot',
      date: new Date().toISOString().split('T')[0],
      montant: 0,
      frais: 0,
      montant_total: 0,
      statut: 'effectue'
    };
    this.showTransactionForm = true;
  }

  closeTransactionForm() {
    this.showTransactionForm = false;
  }

  saveCompte() {
    if (this.editCompteMode && this.currentCompte.id) {
      const index = this.comptes.findIndex(c => c.id === this.currentCompte.id);
      if (index !== -1) {
        this.comptes[index] = { ...this.currentCompte } as CompteMobile;
        this.showSuccess('Compte modifié');
      }
    } else {
      const newCompte = { ...this.currentCompte, id: Date.now() } as CompteMobile;
      this.comptes.push(newCompte);
      this.showSuccess('Compte ajouté');
    }
    this.saveComptes();
    this.cancelCompteForm();
  }

  saveTransaction() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (!compte) {
      this.showSuccess('Veuillez sélectionner un compte');
      return;
    }

    // Vérifier le solde pour les retraits/transferts/paiements
    const type = this.currentTransaction.type;
    if ((type === 'retrait' || type === 'transfert' || type === 'paiement') && 
        compte.solde < (this.currentTransaction.montant_total || 0)) {
      this.showSuccess('Solde insuffisant');
      return;
    }

    // Mettre à jour le solde
    const index = this.comptes.findIndex(c => c.id === compte.id);
    if (index !== -1) {
      if (type === 'depot' || type === 'reception') {
        this.comptes[index].solde += this.currentTransaction.montant_total || 0;
      } else {
        this.comptes[index].solde -= this.currentTransaction.montant_total || 0;
      }
    }

    const newTransaction = {
      ...this.currentTransaction,
      id: Date.now(),
      compte_nom: compte.nom_compte || this.getOperateurLabel(compte.operateur)
    } as TransactionMobile;

    this.transactions.push(newTransaction);
    this.saveComptes();
    this.saveTransactions();
    this.showSuccess('Transaction enregistrée');
    this.closeTransactionForm();
  }

  onCompteChange() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (compte) {
      this.updateFrais();
    }
  }

  updateFrais() {
    const compte = this.comptes.find(c => c.id === this.currentTransaction.compte_id);
    if (!compte) return;

    let fraisPourcent = 0;
    if (this.currentTransaction.type === 'depot' && compte.frais_depot) {
      fraisPourcent = compte.frais_depot;
    } else if (this.currentTransaction.type === 'retrait' && compte.frais_retrait) {
      fraisPourcent = compte.frais_retrait;
    }

    const montant = this.currentTransaction.montant || 0;
    this.currentTransaction.frais = montant * fraisPourcent / 100;
    this.currentTransaction.montant_total = montant + (this.currentTransaction.frais || 0);
  }

  voirTransactions(compte: CompteMobile) {
    this.selectedCompte = compte;
  }

  getTransactionsForCompte(compteId: number): TransactionMobile[] {
    return this.transactions.filter(t => t.compte_id === compteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getTransactionsCount(compteId: number): number {
    return this.transactions.filter(t => t.compte_id === compteId).length;
  }

  getTransactionsMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    return this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
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
      this.showSuccess('Compte supprimé');
    }
    this.showDeleteModal = false;
    this.compteToDelete = null;
  }

  cancelCompteForm() {
    this.showCompteForm = false;
    this.editCompteMode = false;
  }

  calculerSoldeTotal() {
    this.soldeTotal = this.comptes.reduce((s, c) => s + (c.solde || 0), 0);
  }

  getOperateurClass(operateur: string): string {
    return operateur;
  }

  getOperateurIcone(operateur: string): string {
    switch(operateur) {
      case 'orange': return '📱🟠';
      case 'moov': return '📱🔴';
      case 'mtn': return '📱🟢';
      default: return '📱';
    }
  }

  getTransactionIcone(type: string): string {
    switch(type) {
      case 'depot': return '📥';
      case 'retrait': return '📤';
      case 'transfert': return '🔄';
      case 'paiement': return '💳';
      case 'reception': return '📲';
      default: return '📱';
    }
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

  // Méthodes d'exportation corrigées
  exportToExcel() {
    if (!this.transactions || this.transactions.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.transactions[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const lignes = this.transactions.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ''));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }

  exportToPDF() {
    if (!this.transactions || this.transactions.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const firstItem = this.transactions[0] || {};
    const colonnes = Object.keys(firstItem).filter(k => !['id', 'created_at', 'updated_at'].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join('')}</tr>\n</thead>\n<tbody>${this.transactions.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : '-'}</td>`).join('')}</tr>`).join('')}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}