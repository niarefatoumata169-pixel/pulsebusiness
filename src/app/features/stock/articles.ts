import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Article {
  id?: number;
  reference: string;
  code_barre?: string;
  nom: string;
  description?: string;
  categorie_id?: number;
  categorie_nom?: string;
  fournisseur_id?: number;
  fournisseur_nom?: string;
  prix_achat: number;
  prix_vente: number;
  tva: number;
  stock_initial: number;
  stock_actuel: number;
  stock_min: number;
  stock_max: number;
  emplacement?: string;
  unite_mesure: string;
  poids?: number;
  volume?: number;
  photo?: string;
  date_creation: string;
  statut: 'actif' | 'inactif' | 'rupture';
  notes?: string;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="articles-container">
      <div class="header">
        <div>
          <h1>Articles</h1>
          <p class="subtitle">{{ articles.length }} article(s) • Valeur stock: {{ valeurStock | number }} FCFA</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvel article</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvel' }} article</h3>
        <form (ngSubmit)="saveArticle()" #articleForm="ngForm">
          <div class="tabs">
            <button type="button" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations</button>
            <button type="button" [class.active]="activeTab === 'stock'" (click)="activeTab = 'stock'">Stock & Prix</button>
            <button type="button" [class.active]="activeTab === 'fournisseur'" (click)="activeTab = 'fournisseur'">Fournisseur</button>
          </div>
          <div *ngIf="activeTab === 'info'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Référence *</label>
                <input type="text" [(ngModel)]="currentArticle.reference" name="reference" required>
              </div>
              <div class="form-group">
                <label>Code barre</label>
                <input type="text" [(ngModel)]="currentArticle.code_barre" name="code_barre">
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="currentArticle.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Catégorie</label>
                <select [(ngModel)]="currentArticle.categorie_id" name="categorie_id" (change)="onCategorieChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.nom }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Emplacement</label>
                <input type="text" [(ngModel)]="currentArticle.emplacement" name="emplacement">
              </div>
              <div class="form-group">
                <label>Unité de mesure</label>
                <select [(ngModel)]="currentArticle.unite_mesure" name="unite_mesure">
                  <option value="pièce">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="g">Gramme</option>
                  <option value="l">Litre</option>
                  <option value="ml">Millilitre</option>
                  <option value="m">Mètre</option>
                  <option value="m²">Mètre carré</option>
                  <option value="m³">Mètre cube</option>
                  <option value="carton">Carton</option>
                  <option value="palette">Palette</option>
                </select>
              </div>
              <div class="form-group">
                <label>Poids (kg)</label>
                <input type="number" [(ngModel)]="currentArticle.poids" name="poids" step="0.001">
              </div>
              <div class="form-group">
                <label>Volume (m³)</label>
                <input type="number" [(ngModel)]="currentArticle.volume" name="volume" step="0.001">
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea [(ngModel)]="currentArticle.description" name="description" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'stock'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Prix d'achat (FCFA)</label>
                <input type="number" [(ngModel)]="currentArticle.prix_achat" name="prix_achat" min="0">
              </div>
              <div class="form-group">
                <label>Prix de vente (FCFA)</label>
                <input type="number" [(ngModel)]="currentArticle.prix_vente" name="prix_vente" min="0">
              </div>
              <div class="form-group">
                <label>TVA (%)</label>
                <input type="number" [(ngModel)]="currentArticle.tva" name="tva" min="0" max="100">
              </div>
              <div class="form-group">
                <label>Stock initial</label>
                <input type="number" [(ngModel)]="currentArticle.stock_initial" name="stock_initial" min="0" (input)="updateStockActuel()">
              </div>
              <div class="form-group">
                <label>Stock actuel</label>
                <input type="number" [(ngModel)]="currentArticle.stock_actuel" name="stock_actuel" min="0" readonly>
              </div>
              <div class="form-group">
                <label>Stock minimum</label>
                <input type="number" [(ngModel)]="currentArticle.stock_min" name="stock_min" min="0">
              </div>
              <div class="form-group">
                <label>Stock maximum</label>
                <input type="number" [(ngModel)]="currentArticle.stock_max" name="stock_max" min="0">
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select [(ngModel)]="currentArticle.statut" name="statut">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="rupture">Rupture</option>
                </select>
              </div>
            </div>
          </div>
          <div *ngIf="activeTab === 'fournisseur'" class="tab-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Fournisseur principal</label>
                <select [(ngModel)]="currentArticle.fournisseur_id" name="fournisseur_id" (change)="onFournisseurChange()">
                  <option value="">Sélectionner</option>
                  <option *ngFor="let f of fournisseurs" [value]="f.id">{{ f.nom }}</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="currentArticle.notes" name="notes" rows="5"></textarea>
              </div>
              <div class="form-group">
                <label>Photo (URL)</label>
                <input type="text" [(ngModel)]="currentArticle.photo" name="photo">
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="articleForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="articles.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterArticles()" placeholder="Rechercher...">
        </div>
        <select [(ngModel)]="categorieFilter" (ngModelChange)="filterArticles()" class="filter-select">
          <option value="">Toutes catégories</option>
          <option *ngFor="let c of categories" [value]="c.id">{{ c.nom }}</option>
        </select>
        <select [(ngModel)]="statutFilter" (ngModelChange)="filterArticles()" class="filter-select">
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="rupture">Rupture</option>
        </select>
      </div>
      <div class="table-container" *ngIf="articles.length > 0; else emptyState">
        <table class="articles-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Stock</th>
              <th>Prix vente</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filteredArticles" [class.rupture]="a.stock_actuel <= a.stock_min">
              <td>{{ a.reference }}</td>
              <td>{{ a.nom }}</td>
              <td>{{ a.categorie_nom || '-' }}</td>
              <td>
                {{ a.stock_actuel }} {{ a.unite_mesure }}
                <span *ngIf="a.stock_actuel <= a.stock_min" class="stock-alert">⚠️</span>
              </td>
              <td>{{ a.prix_vente | number }} FCFA</td>
              <td><span class="badge" [class]="a.statut">{{ getStatutLabel(a.statut) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="viewDetails(a)" title="Voir">👁️</button>
                <button class="btn-icon" (click)="editArticle(a)" title="Modifier">✏️</button>
                <button class="btn-icon" (click)="duplicateArticle(a)" title="Dupliquer">📋</button>
                <button class="btn-icon delete" (click)="confirmDelete(a)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucun article</h2>
          <p>Ajoutez votre premier article</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvel article</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>{{ selectedArticle?.nom }}</h3>
            <button class="btn-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedArticle">
            <div class="details-grid">
              <div class="detail-section">
                <h4>Informations</h4>
                <p><strong>Référence:</strong> {{ selectedArticle.reference }}</p>
                <p><strong>Code barre:</strong> {{ selectedArticle.code_barre || '-' }}</p>
                <p><strong>Catégorie:</strong> {{ selectedArticle.categorie_nom || '-' }}</p>
                <p><strong>Emplacement:</strong> {{ selectedArticle.emplacement || '-' }}</p>
                <p><strong>Unité:</strong> {{ selectedArticle.unite_mesure }}</p>
              </div>
              <div class="detail-section">
                <h4>Stock & Prix</h4>
                <p><strong>Stock actuel:</strong> {{ selectedArticle.stock_actuel }} {{ selectedArticle.unite_mesure }}</p>
                <p><strong>Stock min:</strong> {{ selectedArticle.stock_min }}</p>
                <p><strong>Stock max:</strong> {{ selectedArticle.stock_max }}</p>
                <p><strong>Prix achat:</strong> {{ selectedArticle.prix_achat | number }} FCFA</p>
                <p><strong>Prix vente:</strong> {{ selectedArticle.prix_vente | number }} FCFA</p>
                <p><strong>TVA:</strong> {{ selectedArticle.tva }}%</p>
              </div>
              <div class="detail-section full-width">
                <h4>Description</h4>
                <p>{{ selectedArticle.description || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Fournisseur</h4>
                <p>{{ selectedArticle.fournisseur_nom || '-' }}</p>
              </div>
              <div class="detail-section">
                <h4>Notes</h4>
                <p>{{ selectedArticle.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer l'article <strong>{{ articleToDelete?.nom }}</strong> ?</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteArticle()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .articles-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .alert-success { background: #10B981; color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .form-card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #FCE7F3; padding-bottom: 10px; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
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
    .table-container { background: white; border-radius: 12px; overflow: auto; }
    .articles-table { width: 100%; border-collapse: collapse; }
    .articles-table th { background: #FDF2F8; padding: 12px; text-align: left; }
    .articles-table td { padding: 12px; border-bottom: 1px solid #FCE7F3; }
    .articles-table tr.rupture { background: #FEF2F2; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge.actif { background: #10B981; color: white; }
    .badge.inactif { background: #9CA3AF; color: white; }
    .badge.rupture { background: #EF4444; color: white; }
    .stock-alert { margin-left: 5px; font-size: 14px; }
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
export class Articles implements OnInit {
  categories: any[] = [];
  fournisseurs: any[] = [];
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  selectedArticle: Article | null = null;
  currentArticle: any = {
    reference: '',
    code_barre: '',
    nom: '',
    categorie_id: '',
    fournisseur_id: '',
    prix_achat: 0,
    prix_vente: 0,
    tva: 18,
    stock_initial: 0,
    stock_actuel: 0,
    stock_min: 0,
    stock_max: 0,
    emplacement: '',
    unite_mesure: 'pièce',
    poids: null,
    volume: null,
    photo: '',
    description: '',
    notes: '',
    statut: 'actif'
  };
  activeTab = 'info';
  searchTerm = '';
  categorieFilter = '';
  statutFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  articleToDelete: Article | null = null;
  successMessage = '';
  valeurStock = 0;
  ngOnInit() {
    this.loadCategories();
    this.loadFournisseurs();
    this.loadArticles();
  }
  loadCategories() {
    const saved = localStorage.getItem('categories');
    this.categories = saved ? JSON.parse(saved) : [];
  }
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    this.fournisseurs = saved ? JSON.parse(saved) : [];
  }
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
    this.filteredArticles = [...this.articles];
    this.calculerValeurStock();
  }
  onCategorieChange() {
    const cat = this.categories.find(c => c.id === this.currentArticle.categorie_id);
    if (cat) this.currentArticle.categorie_nom = cat.nom;
  }
  onFournisseurChange() {
    const f = this.fournisseurs.find(f => f.id === this.currentArticle.fournisseur_id);
    if (f) this.currentArticle.fournisseur_nom = f.nom;
  }
  updateStockActuel() {
    this.currentArticle.stock_actuel = this.currentArticle.stock_initial;
  }
  saveArticle() {
    const cat = this.categories.find(c => c.id === this.currentArticle.categorie_id);
    const f = this.fournisseurs.find(f => f.id === this.currentArticle.fournisseur_id);
    if (this.editMode) {
      const index = this.articles.findIndex(a => a.id === this.currentArticle.id);
      if (index !== -1) {
        this.articles[index] = { 
          ...this.currentArticle, 
          categorie_nom: cat?.nom,
          fournisseur_nom: f?.nom
        };
        this.showSuccess('Article modifié !');
      }
    } else {
      const newArticle = { 
        ...this.currentArticle, 
        id: Date.now(),
        date_creation: new Date().toISOString().split('T')[0],
        categorie_nom: cat?.nom,
        fournisseur_nom: f?.nom
      };
      this.articles.push(newArticle);
      this.showSuccess('Article ajouté !');
    }
    localStorage.setItem('articles', JSON.stringify(this.articles));
    this.calculerValeurStock();
    this.filterArticles();
    this.cancelForm();
  }
  editArticle(a: Article) {
    this.currentArticle = { ...a };
    this.editMode = true;
    this.showForm = true;
  }
  duplicateArticle(a: Article) {
    const newArticle = { 
      ...a, 
      id: Date.now(), 
      reference: a.reference + '-COPY',
      nom: a.nom + ' (copie)',
      stock_initial: 0,
      stock_actuel: 0
    };
    this.articles.push(newArticle);
    localStorage.setItem('articles', JSON.stringify(this.articles));
    this.filterArticles();
    this.showSuccess('Article dupliqué !');
  }
  viewDetails(a: Article) {
    this.selectedArticle = a;
    this.showDetailsModal = true;
  }
  confirmDelete(a: Article) {
    this.articleToDelete = a;
    this.showDeleteModal = true;
  }
  deleteArticle() {
    if (this.articleToDelete) {
      this.articles = this.articles.filter(a => a.id !== this.articleToDelete?.id);
      localStorage.setItem('articles', JSON.stringify(this.articles));
      this.filterArticles();
      this.calculerValeurStock();
      this.showDeleteModal = false;
      this.articleToDelete = null;
      this.showSuccess('Article supprimé !');
    }
  }
  cancelForm() {
    this.currentArticle = {
      reference: '',
      code_barre: '',
      nom: '',
      categorie_id: '',
      fournisseur_id: '',
      prix_achat: 0,
      prix_vente: 0,
      tva: 18,
      stock_initial: 0,
      stock_actuel: 0,
      stock_min: 0,
      stock_max: 0,
      emplacement: '',
      unite_mesure: 'pièce',
      poids: null,
      volume: null,
      photo: '',
      description: '',
      notes: '',
      statut: 'actif'
    };
    this.activeTab = 'info';
    this.showForm = false;
    this.editMode = false;
  }
  filterArticles() {
    let filtered = this.articles;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.nom?.toLowerCase().includes(term) ||
        a.reference?.toLowerCase().includes(term) ||
        a.code_barre?.toLowerCase().includes(term)
      );
    }
    if (this.categorieFilter) {
      filtered = filtered.filter(a => a.categorie_id === Number(this.categorieFilter));
    }
    if (this.statutFilter) {
      filtered = filtered.filter(a => a.statut === this.statutFilter);
    }
    this.filteredArticles = filtered;
  }
  calculerValeurStock() {
    this.valeurStock = this.articles.reduce((s, a) => s + (a.stock_actuel * a.prix_achat), 0);
  }
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', inactif: 'Inactif', rupture: 'Rupture' };
    return labels[statut] || statut;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
