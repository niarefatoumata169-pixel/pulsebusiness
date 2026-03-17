import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MouvementStock {
  id?: number;
  date: string;
  type: 'entree' | 'sortie' | 'transfert' | 'inventaire' | 'retour';
  article_id: number;
  article_nom?: string;
  article_reference?: string;
  quantite: number;
  unite_mesure?: string;
  prix_unitaire?: number;
  montant_total?: number;
  fournisseur_id?: number;
  fournisseur_nom?: string;
  client_id?: number;
  client_nom?: string;
  motif: string;
  emplacement_source?: string;
  emplacement_destination?: string;
  numero_lot?: string;
  date_peremption?: string;
  document_reference?: string;
  responsable: string;
  notes?: string;
}

@Component({
  selector: 'app-mouvements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mouvements-container">
      <div class="header">
        <div>
          <h1>Mouvements de stock</h1>
          <p class="subtitle">{{ mouvements.length }} mouvement(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouveau mouvement</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouveau' }} mouvement</h3>
        <form (ngSubmit)="saveMouvement()" #mouvementForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="currentMouvement.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Type de mouvement *</label>
              <select [(ngModel)]="currentMouvement.type" name="type" required (change)="onTypeChange()">
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
                <option value="transfert">Transfert</option>
                <option value="inventaire">Inventaire</option>
                <option value="retour">Retour</option>
              </select>
            </div>
            <div class="form-group">
              <label>Article *</label>
              <select [(ngModel)]="currentMouvement.article_id" name="article_id" required (change)="onArticleChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let a of articles" [value]="a.id">{{ a.nom }} ({{ a.reference }}) - Stock: {{ a.stock_actuel }} {{ a.unite_mesure }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantité *</label>
              <input type="number" [(ngModel)]="currentMouvement.quantite" name="quantite" required min="0.01" step="0.01" (input)="calculerMontant()">
            </div>
            <div class="form-group">
              <label>Unité</label>
              <input type="text" [(ngModel)]="currentMouvement.unite_mesure" name="unite_mesure" readonly>
            </div>
            <div class="form-group" *ngIf="currentMouvement.type !== 'transfert'">
              <label>Prix unitaire (FCFA)</label>
              <input type="number" [(ngModel)]="currentMouvement.prix_unitaire" name="prix_unitaire" min="0" (input)="calculerMontant()">
            </div>
            <div class="form-group" *ngIf="currentMouvement.type !== 'transfert'">
              <label>Montant total</label>
              <input type="number" [(ngModel)]="currentMouvement.montant_total" name="montant_total" readonly>
            </div>
            <div class="form-group" *ngIf="currentMouvement.type === 'entree' || currentMouvement.type === 'retour'">
              <label>Fournisseur</label>
              <select [(ngModel)]="currentMouvement.fournisseur_id" name="fournisseur_id" (change)="onFournisseurChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let f of fournisseurs" [value]="f.id">{{ f.nom }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="currentMouvement.type === 'sortie'">
              <label>Client</label>
              <select [(ngModel)]="currentMouvement.client_id" name="client_id" (change)="onClientChange()">
                <option value="">Sélectionner</option>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Motif *</label>
              <input type="text" [(ngModel)]="currentMouvement.motif" name="motif" required>
            </div>
            <div class="form-group" *ngIf="currentMouvement.type === 'transfert'">
              <label>Emplacement source</label>
              <input type="text" [(ngModel)]="currentMouvement.emplacement_source" name="emplacement_source">
            </div>
            <div class="form-group" *ngIf="currentMouvement.type === 'transfert'">
              <label>Emplacement destination</label>
              <input type="text" [(ngModel)]="currentMouvement.emplacement_destination" name="emplacement_destination">
            </div>
            <div class="form-group">
              <label>N° lot</label>
              <input type="text" [(ngModel)]="currentMouvement.numero_lot" name="numero_lot">
            </div>
            <div class="form-group">
              <label>Date péremption</label>
              <input type="date" [(ngModel)]="currentMouvement.date_peremption" name="date_peremption">
            </div>
            <div class="form-group">
              <label>Référence document</label>
              <input type="text" [(ngModel)]="currentMouvement.document_reference" name="document_reference">
            </div>
            <div class="form-group">
              <label>Responsable *</label>
              <input type="text" [(ngModel)]="currentMouvement.responsable" name="responsable" required>
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
      <div class="filters-bar" *ngIf="mouvements.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterMouvements()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="filterMouvements()" class="filter-select">
          <option value="">Tous types</option>
          <option value="entree">Entrées</option>
          <option value="sortie">Sorties</option>
          <option value="transfert">Transferts</option>
          <option value="inventaire">Inventaires</option>
          <option value="retour">Retours</option>
        </select>
        <input type="date" [(ngModel)]="dateFilter" (ngModelChange)="filterMouvements()" class="date-filter" placeholder="Date">
      </div>
      <div class="table-container" *ngIf="mouvements.length > 0; else emptyState">
        <table class="mouvements-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Article</th>
              <th>Quantité</th>
              <th>Motif</th>
              <th>Responsable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filteredMouvements">
              <td>{{ m.date | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge" [class]="m.type">{{ getTypeLabel(m.type) }}</span></td>
              <td>{{ m.article_nom }}<br><small>{{ m.article_reference }}</small></td>
              <td [class.entree]="m.type === 'entree' || m.type === 'retour'" 
                  [class.sortie]="m.type === 'sortie'">
                {{ m.type === 'entree' || m.type === 'retour' ? '+' : '-' }}{{ m.quantite }} {{ m.unite_mesure }}
              </td>
              <td>{{ m.motif }}</td>
              <td>{{ m.responsable }}</td>
              <td class="actions">
                <button class="btn-icon" (click)="viewDetails(m)" title="Voir">👁️</button>
                <button class="btn-icon" (click)="editMouvement(m)" title="Modifier" *ngIf="m.type !== 'inventaire'">✏️</button>
                <button class="btn-icon" (click)="printMouvement(m)" title="Imprimer">🖨️</button>
                <button class="btn-icon delete" (click)="confirmDelete(m)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🔄</div>
          <h2>Aucun mouvement</h2>
          <p>Enregistrez votre premier mouvement</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouveau mouvement</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>Détails du mouvement</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedMouvement">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Date:</strong> {{ selectedMouvement.date | date }}</p>
                <p><strong>Type:</strong> {{ getTypeLabel(selectedMouvement.type) }}</p>
                <p><strong>Motif:</strong> {{ selectedMouvement.motif }}</p>
                <p><strong>Responsable:</strong> {{ selectedMouvement.responsable }}</p>
              </div>
              <div class="detail-section">
                <h4>Article</h4>
                <p><strong>Article:</strong> {{ selectedMouvement.article_nom }}</p>
                <p><strong>Référence:</strong> {{ selectedMouvement.article_reference }}</p>
                <p><strong>Quantité:</strong> {{ selectedMouvement.quantite }} {{ selectedMouvement.unite_mesure }}</p>
                <p><strong>Prix unitaire:</strong> {{ selectedMouvement.prix_unitaire | number }} FCFA</p>
                <p><strong>Montant total:</strong> {{ selectedMouvement.montant_total | number }} FCFA</p>
              </div>
              <div class="detail-section" *ngIf="selectedMouvement.fournisseur_nom">
                <h4>Fournisseur</h4>
                <p>{{ selectedMouvement.fournisseur_nom }}</p>
              </div>
              <div class="detail-section" *ngIf="selectedMouvement.client_nom">
                <h4>Client</h4>
                <p>{{ selectedMouvement.client_nom }}</p>
              </div>
              <div class="detail-section">
                <h4>Traçabilité</h4>
                <p><strong>N° lot:</strong> {{ selectedMouvement.numero_lot || '-' }}</p>
                <p><strong>Date péremption:</strong> {{ selectedMouvement.date_peremption | date : '-' }}</p>
                <p><strong>Document:</strong> {{ selectedMouvement.document_reference || '-' }}</p>
              </div>
              <div class="detail-section full-width">
                <h4>Notes</h4>
                <p>{{ selectedMouvement.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer ce mouvement ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteMouvement()">��️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mouvements-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .btn-cancel { background: white; border: 2px solid #FCE7F3; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
    .btn-save { background: #EC4899; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .date-filter { padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .mouvements-table { width: 100%; border-collapse: collapse; }
    .mouvements-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .mouvements-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.entree { background: #10B981; color: white; }
    .badge.sortie { background: #EF4444; color: white; }
    .badge.transfert { background: #EC4899; color: white; }
    .badge.inventaire { background: #F59E0B; color: white; }
    .badge.retour { background: #3B82F6; color: white; }
    .entree { color: #10B981; font-weight: 600; }
    .sortie { color: #EF4444; font-weight: 600; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 10px; }
    .detail-section.full-width { grid-column: span 2; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Mouvements implements OnInit {
  articles: any[] = [];
  fournisseurs: any[] = [];
  clients: any[] = [];
  mouvements: MouvementStock[] = [];
  filteredMouvements: MouvementStock[] = [];
  selectedMouvement: MouvementStock | null = null;
  currentMouvement: any = {
    date: new Date().toISOString().split('T')[0],
    type: 'entree',
    article_id: '',
    quantite: 1,
    prix_unitaire: 0,
    montant_total: 0,
    fournisseur_id: '',
    client_id: '',
    motif: '',
    emplacement_source: '',
    emplacement_destination: '',
    numero_lot: '',
    date_peremption: '',
    document_reference: '',
    responsable: '',
    notes: ''
  };
  searchTerm = '';
  typeFilter = '';
  dateFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  mouvementToDelete: MouvementStock | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadArticles();
    this.loadFournisseurs();
    this.loadClients();
    this.loadMouvements();
  }
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    this.fournisseurs = saved ? JSON.parse(saved) : [];
  }
  loadClients() {
    const saved = localStorage.getItem('clients');
    this.clients = saved ? JSON.parse(saved) : [];
  }
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_stock');
    this.mouvements = saved ? JSON.parse(saved) : [];
    this.filteredMouvements = [...this.mouvements];
  }
  onTypeChange() {
    this.currentMouvement.fournisseur_id = '';
    this.currentMouvement.client_id = '';
  }
  onArticleChange() {
    const article = this.articles.find(a => a.id === this.currentMouvement.article_id);
    if (article) {
      this.currentMouvement.unite_mesure = article.unite_mesure;
      this.currentMouvement.article_nom = article.nom;
      this.currentMouvement.article_reference = article.reference;
      if (this.currentMouvement.type === 'entree') {
        this.currentMouvement.prix_unitaire = article.prix_achat;
      } else if (this.currentMouvement.type === 'sortie') {
        this.currentMouvement.prix_unitaire = article.prix_vente;
      }
      this.calculerMontant();
    }
  }
  onFournisseurChange() {
    const f = this.fournisseurs.find(f => f.id === this.currentMouvement.fournisseur_id);
    if (f) this.currentMouvement.fournisseur_nom = f.nom;
  }
  onClientChange() {
    const c = this.clients.find(c => c.id === this.currentMouvement.client_id);
    if (c) this.currentMouvement.client_nom = c.nom;
  }
  calculerMontant() {
    this.currentMouvement.montant_total = this.currentMouvement.quantite * this.currentMouvement.prix_unitaire;
  }
  saveMouvement() {
    const article = this.articles.find(a => a.id === this.currentMouvement.article_id);
    const f = this.fournisseurs.find(f => f.id === this.currentMouvement.fournisseur_id);
    const c = this.clients.find(c => c.id === this.currentMouvement.client_id);
    if (this.editMode) {
      const index = this.mouvements.findIndex(m => m.id === this.currentMouvement.id);
      if (index !== -1) {
        this.mouvements[index] = { 
          ...this.currentMouvement, 
          article_nom: article?.nom,
          article_reference: article?.reference,
          fournisseur_nom: f?.nom,
          client_nom: c?.nom
        };
        this.showSuccess('Mouvement modifié !');
      }
    } else {
      const newMouvement = { 
        ...this.currentMouvement, 
        id: Date.now(),
        article_nom: article?.nom,
        article_reference: article?.reference,
        fournisseur_nom: f?.nom,
        client_nom: c?.nom
      };
      this.mouvements.push(newMouvement);
      this.updateStock();
      this.showSuccess('Mouvement enregistré !');
    }
    localStorage.setItem('mouvements_stock', JSON.stringify(this.mouvements));
    this.filterMouvements();
    this.cancelForm();
  }
  updateStock() {
    const article = this.articles.find(a => a.id === this.currentMouvement.article_id);
    if (!article) return;
    const index = this.articles.findIndex(a => a.id === article.id);
    if (index !== -1) {
      if (this.currentMouvement.type === 'entree' || this.currentMouvement.type === 'retour') {
        this.articles[index].stock_actuel += this.currentMouvement.quantite;
      } else if (this.currentMouvement.type === 'sortie') {
        this.articles[index].stock_actuel -= this.currentMouvement.quantite;
      }
      if (this.articles[index].stock_actuel <= this.articles[index].stock_min) {
        this.articles[index].statut = 'rupture';
      }
      localStorage.setItem('articles', JSON.stringify(this.articles));
    }
  }
  editMouvement(m: MouvementStock) {
    this.currentMouvement = { ...m };
    this.editMode = true;
    this.showForm = true;
  }
  viewDetails(m: MouvementStock) {
    this.selectedMouvement = m;
    this.showDetailsModal = true;
  }
  printMouvement(m: MouvementStock) {
    alert('Fonction d\'impression à venir');
  }
  confirmDelete(m: MouvementStock) {
    this.mouvementToDelete = m;
    this.showDeleteModal = true;
  }
  deleteMouvement() {
    if (this.mouvementToDelete) {
      this.mouvements = this.mouvements.filter(m => m.id !== this.mouvementToDelete?.id);
      localStorage.setItem('mouvements_stock', JSON.stringify(this.mouvements));
      this.filterMouvements();
      this.showDeleteModal = false;
      this.mouvementToDelete = null;
      this.showSuccess('Mouvement supprimé !');
    }
  }
  cancelForm() {
    this.currentMouvement = {
      date: new Date().toISOString().split('T')[0],
      type: 'entree',
      article_id: '',
      quantite: 1,
      prix_unitaire: 0,
      montant_total: 0,
      fournisseur_id: '',
      client_id: '',
      motif: '',
      emplacement_source: '',
      emplacement_destination: '',
      numero_lot: '',
      date_peremption: '',
      document_reference: '',
      responsable: '',
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
        m.article_nom?.toLowerCase().includes(term) ||
        m.motif?.toLowerCase().includes(term) ||
        m.responsable?.toLowerCase().includes(term) ||
        m.document_reference?.toLowerCase().includes(term)
      );
    }
    if (this.typeFilter) {
      filtered = filtered.filter(m => m.type === this.typeFilter);
    }
    if (this.dateFilter) {
      filtered = filtered.filter(m => m.date === this.dateFilter);
    }
    this.filteredMouvements = filtered;
  }
  getTypeLabel(type: string): string {
    const labels: any = { 
      entree: 'Entrée', 
      sortie: 'Sortie', 
      transfert: 'Transfert', 
      inventaire: 'Inventaire', 
      retour: 'Retour' 
    };
    return labels[type] || type;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
