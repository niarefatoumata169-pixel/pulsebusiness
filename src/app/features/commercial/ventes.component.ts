import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ===== INTERFACES =====
interface VenteArticle {
  id?: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

interface Vente {
  id?: number;
  reference: string;
  date_vente: string;
  client_id: number;
  client_nom?: string;
  client_contact?: string;
  client_email?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  remise?: number;
  mode_paiement: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  statut: 'en_attente' | 'payee' | 'annulee' | 'partielle';
  notes?: string;
  articles?: VenteArticle[];
  created_at: string;
  updated_at?: string;
  date_paiement?: string;
  reference_paiement?: string;
  montant_paye?: number;  // pour les paiements partiels
}

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ventes.html',
  styleUrls: ['./ventes.scss']
})
export class Ventes implements OnInit {
  // ===== DONNÉES =====
  ventes: Vente[] = [];
  filteredVentes: Vente[] = [];
  clients: any[] = [];

  // ===== FILTRES =====
  searchTerm = '';
  statutFilter = '';
  modeFilter = '';
  periodeFilter = '';

  // ===== UI =====
  activeTab = 'info';
  showForm = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showPaymentModal = false;
  showClientForm = false;
  showTicketModal = false;
  editMode = false;

  // ===== SÉLECTION =====
  selectedVente: Vente | null = null;
  venteToDelete: Vente | null = null;
  paymentVente: Vente | null = null;
  ticketVente: Vente | null = null;

  // ===== MESSAGES =====
  successMessage = '';

  // ===== PAIEMENT =====
  paymentAmount = 0;
  paymentDate = new Date().toISOString().split('T')[0];
  paymentMode = 'especes';
  paymentReference = '';

  // ===== NOUVEAU CLIENT RAPIDE =====
  newClient: any = { nom: '', prenom: '', telephone: '', email: '' };

  // ===== FORMULAIRE COURANT =====
  currentVente: Partial<Vente> = {
    reference: '',
    statut: 'en_attente',
    mode_paiement: 'especes',
    date_vente: new Date().toISOString().split('T')[0],
    montant_ht: 0,
    tva: 18,
    montant_ttc: 0,
    remise: 0,
    articles: [],
    montant_paye: 0
  };

  // ===== LIFECYCLE =====
  ngOnInit() {
    this.loadClients();
    this.loadVentes();
  }

  // ===== CHARGEMENT ET SAUVEGARDE =====
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }

  loadVentes() {
    const saved = localStorage.getItem('ventes');
    this.ventes = saved ? JSON.parse(saved) : [];
    this.filteredVentes = [...this.ventes];
  }

  saveVentesToStorage() {
    localStorage.setItem('ventes', JSON.stringify(this.ventes));
  }

  // ===== GÉNÉRATION DE RÉFÉRENCE =====
  generateReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = this.ventes.length + 1;
    return `VEN-${year}${month}${day}-${String(count).padStart(4, '0')}`;
  }

  // ===== FORMULAIRES =====
  openForm() {
    this.currentVente = {
      reference: this.generateReference(),
      statut: 'en_attente',
      mode_paiement: 'especes',
      date_vente: new Date().toISOString().split('T')[0],
      montant_ht: 0,
      tva: 18,
      montant_ttc: 0,
      remise: 0,
      articles: [],
      montant_paye: 0
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'info';
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
  }

  // ===== GESTION DES ARTICLES =====
  addArticle() {
    if (!this.currentVente.articles) {
      this.currentVente.articles = [];
    }
    this.currentVente.articles.push({
      designation: '',
      quantite: 1,
      prix_unitaire: 0,
      montant: 0
    });
  }

  removeArticle(index: number) {
    if (this.currentVente.articles) {
      this.currentVente.articles.splice(index, 1);
      this.recalculerTotalDepuisArticles();
    }
  }

  updateArticleMontant(article: VenteArticle) {
    article.montant = (article.quantite || 0) * (article.prix_unitaire || 0);
    this.recalculerTotalDepuisArticles();
  }

  recalculerTotalDepuisArticles() {
    const sousTotal = this.getSousTotalHT();
    this.currentVente.montant_ht = sousTotal;
    this.calculerTotal();
  }

  getSousTotalHT(): number {
    if (!this.currentVente.articles) return 0;
    return this.currentVente.articles.reduce((sum, a) => sum + (a.montant || 0), 0);
  }

  getTvaMontant(): number {
    return (this.currentVente.montant_ht || 0) * (this.currentVente.tva || 0) / 100;
  }

  getRemiseMontant(): number {
    const totalAvecTva = (this.currentVente.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva * (this.currentVente.remise || 0) / 100;
  }

  getTotalTTCFromArticles(): number {
    const totalAvecTva = (this.currentVente.montant_ht || 0) + this.getTvaMontant();
    return totalAvecTva - this.getRemiseMontant();
  }

  calculerTotal() {
    const totalAvecTva = (this.currentVente.montant_ht || 0) * (1 + (this.currentVente.tva || 0) / 100);
    this.currentVente.montant_ttc = totalAvecTva * (1 - (this.currentVente.remise || 0) / 100);
  }

  // ===== GESTION CLIENT =====
  onClientChange() {
    const client = this.clients.find(c => c.id === this.currentVente.client_id);
    if (client) {
      this.currentVente.client_nom = `${client.nom} ${client.prenom || ''}`;
      this.currentVente.client_contact = client.telephone;
      this.currentVente.client_email = client.email;
    }
  }

  openClientForm() {
    this.newClient = { nom: '', prenom: '', telephone: '', email: '' };
    this.showClientForm = true;
  }

  saveNewClient() {
    if (!this.newClient.nom) return;
    const newId = Date.now();
    const client = { ...this.newClient, id: newId };
    this.clients.push(client);
    localStorage.setItem('clients', JSON.stringify(this.clients));
    this.currentVente.client_id = newId;
    this.onClientChange();
    this.showClientForm = false;
    this.showSuccess('Client ajouté avec succès');
  }

  // ===== CRUD =====
  saveVente() {
    if (!this.currentVente.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (this.currentVente.statut === 'payee' && !this.currentVente.date_paiement) {
      this.currentVente.date_paiement = new Date().toISOString().split('T')[0];
    }

    if (this.editMode && this.currentVente.id) {
      const index = this.ventes.findIndex(v => v.id === this.currentVente.id);
      if (index !== -1) {
        this.ventes[index] = { ...this.currentVente, updated_at: new Date().toISOString() } as Vente;
        this.showSuccess('Vente modifiée');
      }
    } else {
      this.ventes.push({
        ...this.currentVente,
        id: Date.now(),
        created_at: new Date().toISOString()
      } as Vente);
      this.showSuccess('Vente ajoutée');
    }
    this.saveVentesToStorage();
    this.filterVentes();
    this.cancelForm();
  }

  editVente(v: Vente) {
    this.currentVente = { ...v };
    if (!this.currentVente.articles) this.currentVente.articles = [];
    if (!this.currentVente.montant_paye) this.currentVente.montant_paye = 0;
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'info';
  }

  duplicateVente(v: Vente) {
    const newVente = {
      ...v,
      id: undefined,
      reference: this.generateReference(),
      statut: 'en_attente' as const,
      created_at: new Date().toISOString(),
      date_paiement: undefined,
      reference_paiement: undefined,
      montant_paye: 0
    };
    this.ventes.push(newVente);
    this.saveVentesToStorage();
    this.filterVentes();
    this.showSuccess('Vente dupliquée');
  }

  viewDetails(v: Vente) {
    this.selectedVente = v;
    this.showDetailsModal = true;
  }

  confirmDelete(v: Vente) {
    this.venteToDelete = v;
    this.showDeleteModal = true;
  }

  deleteVente() {
    if (this.venteToDelete) {
      this.ventes = this.ventes.filter(v => v.id !== this.venteToDelete?.id);
      this.saveVentesToStorage();
      this.filterVentes();
      this.showDeleteModal = false;
      this.venteToDelete = null;
      this.showSuccess('Vente supprimée');
    }
  }

  // ===== PAIEMENT =====
  marquerPayee(v: Vente) {
    v.statut = 'payee';
    v.date_paiement = new Date().toISOString().split('T')[0];
    this.saveVentesToStorage();
    this.filterVentes();
    this.showSuccess('Vente marquée payée');
  }

  enregistrerPaiement(v: Vente) {
    this.paymentVente = v;
    const resteAPayer = v.montant_ttc - (v.montant_paye || 0);
    this.paymentAmount = resteAPayer;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMode = 'especes';
    this.paymentReference = '';
    this.showPaymentModal = true;
  }

  savePayment() {
    if (this.paymentVente && this.paymentAmount > 0) {
      const nouveauPaye = (this.paymentVente.montant_paye || 0) + this.paymentAmount;
      this.paymentVente.montant_paye = nouveauPaye;

      if (nouveauPaye >= this.paymentVente.montant_ttc) {
        this.paymentVente.statut = 'payee';
        this.paymentVente.date_paiement = this.paymentDate;
      } else {
        this.paymentVente.statut = 'partielle';
      }

      this.paymentVente.mode_paiement = this.paymentMode as any;
      this.paymentVente.reference_paiement = this.paymentReference;

      this.saveVentesToStorage();
      this.filterVentes();
      this.showPaymentModal = false;
      this.showSuccess(`Paiement de ${this.paymentAmount.toLocaleString()} FCFA enregistré`);
    } else {
      alert('Veuillez saisir un montant valide');
    }
  }

  // ===== TICKET D'IMPRESSION =====
  printTicket(v: Vente) {
    this.ticketVente = v;
    this.showTicketModal = true;
  }

  printTicketModal() {
    const printContent = document.querySelector('.ticket-content');
    if (printContent) {
      const originalTitle = document.title;
      document.title = `Ticket_${this.ticketVente?.reference}`;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Ticket ${this.ticketVente?.reference}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .ticket-content { max-width: 300px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 4px; text-align: left; }
              td:last-child { text-align: right; }
              .grand-total { font-weight: bold; color: #EC4899; }
            </style>
            </head>
            <body>${printContent.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
      document.title = originalTitle;
    }
  }

  // ===== FILTRES =====
  filterVentes() {
    let filtered = [...this.ventes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.reference?.toLowerCase().includes(term) ||
        v.client_nom?.toLowerCase().includes(term)
      );
    }

    if (this.statutFilter) {
      filtered = filtered.filter(v => v.statut === this.statutFilter);
    }

    if (this.modeFilter) {
      filtered = filtered.filter(v => v.mode_paiement === this.modeFilter);
    }

    if (this.periodeFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (this.periodeFilter === 'today') {
        filtered = filtered.filter(v => new Date(v.date_vente).toDateString() === today.toDateString());
      } else if (this.periodeFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(v => new Date(v.date_vente) >= weekAgo);
      } else if (this.periodeFilter === 'month') {
        filtered = filtered.filter(v => {
          const date = new Date(v.date_vente);
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        });
      } else if (this.periodeFilter === 'last_month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(v => {
          const date = new Date(v.date_vente);
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        });
      }
    }

    this.filteredVentes = filtered;
  }

  // ===== STATISTIQUES =====
  getVentesEnAttente(): number {
    return this.ventes.filter(v => v.statut === 'en_attente').length;
  }

  getMontantTotal(): number {
    return this.ventes.reduce((sum, v) => sum + (v.montant_ttc || 0), 0);
  }

  getMontantEncaisse(): number {
    return this.ventes.filter(v => v.statut === 'payee').reduce((sum, v) => sum + (v.montant_ttc || 0), 0);
  }

  getMontantFiltre(): number {
    return this.filteredVentes.reduce((sum, v) => sum + (v.montant_ttc || 0), 0);
  }

  getTauxRecouvrement(): number {
    const total = this.getMontantTotal();
    const encaisse = this.getMontantEncaisse();
    return total ? Math.round((encaisse / total) * 100) : 0;
  }

  getVentesMois(): number {
    const now = new Date();
    return this.ventes.filter(v => {
      const date = new Date(v.date_vente);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }

  getPanierMoyen(): number {
    const total = this.getMontantTotal();
    return this.ventes.length ? total / this.ventes.length : 0;
  }

  getPourcentagePaye(v: Vente): number {
    if (!v.montant_ttc) return 0;
    const paye = v.montant_paye || 0;
    return Math.min(100, Math.round((paye / v.montant_ttc) * 100));
  }

  // ===== LABELS =====
  getStatutLabel(statut: string): string {
    const labels: any = {
      en_attente: '⏳ En attente',
      payee: '✅ Payée',
      annulee: '❌ Annulée',
      partielle: '🔄 Paiement partiel'
    };
    return labels[statut] || statut;
  }

  getModePaiementLabel(mode: string | undefined): string {
    if (!mode) return '-';
    const labels: any = {
      especes: '💵 Espèces',
      carte: '💳 Carte',
      cheque: '📝 Chèque',
      virement: '🏦 Virement',
      mobile_money: '📱 Mobile Money'
    };
    return labels[mode] || mode;
  }

  // ===== EXPORTS =====
    exportToExcel() {
    if (!this.filteredVentes || this.filteredVentes.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.;
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredVentes.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, )}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `export_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess("Export Excel effectué");
  }

    exportToPDF() {
    if (!this.filteredVentes || this.filteredVentes.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.;
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredVentes.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}