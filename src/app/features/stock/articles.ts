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
  categorie: string;
  sous_categorie?: string;
  famille?: string;
  unite: string;
  prix_achat_ht: number;
  prix_vente_ht: number;
  tva: number;
  marge: number;
  stock_minimum: number;
  stock_actuel: number;
  stock_maximum?: number;
  emplacement?: string;
  fournisseur_principal?: string;
  fournisseur_ref?: string;
  delai_approvisionnement?: number;
  quantite_commande?: number;
  statut: 'actif' | 'inactif' | 'rupture' | 'promotion';
  poids?: number;
  dimensions?: string;
  image?: string;
  notes?: string;
  date_creation: string;
  date_derniere_modification?: string;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="articles-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>📦 Articles / Produits</h1>
          <p class="subtitle">{{ articles.length }} article(s) • Valeur stock: {{ getValeurStock() | number }} FCFA</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="articles.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="articles.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvel article</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="articles.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ articles.length }}</span>
            <span class="kpi-label">Total articles</span>
          </div>
        </div>
        <div class="kpi-card valeur">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getValeurStock() | number }} <small>FCFA</small></span>
            <span class="kpi-label">Valeur du stock</span>
          </div>
        </div>
        <div class="kpi-card alerte">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getStockBasCount() }}</span>
            <span class="kpi-label">Stock bas</span>
          </div>
        </div>
        <div class="kpi-card rupture">
          <div class="kpi-icon">❌</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getRuptureCount() }}</span>
            <span class="kpi-label">En rupture</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvel' }} article</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveArticle()">
              <div class="tabs">
                <button type="button" [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">📋 Général</button>
                <button type="button" [class.active]="activeTab === 'stock'" (click)="activeTab = 'stock'">📦 Stock</button>
                <button type="button" [class.active]="activeTab === 'prix'" (click)="activeTab = 'prix'">💰 Prix & TVA</button>
                <button type="button" [class.active]="activeTab === 'fournisseur'" (click)="activeTab = 'fournisseur'">🏭 Fournisseur</button>
              </div>

              <!-- Onglet Général -->
              <div *ngIf="activeTab === 'general'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Référence *</label>
                    <input type="text" [(ngModel)]="currentArticle.reference" name="reference" required>
                  </div>
                  <div class="form-group">
                    <label>Code barre</label>
                    <input type="text" [(ngModel)]="currentArticle.code_barre" name="code_barre">
                  </div>
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" [(ngModel)]="currentArticle.nom" name="nom" required>
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="currentArticle.description" name="description" rows="3"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Catégorie *</label>
                    <select [(ngModel)]="currentArticle.categorie" name="categorie" required>
                      <option value="">Sélectionner</option>
                      <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Sous-catégorie</label>
                    <input type="text" [(ngModel)]="currentArticle.sous_categorie" name="sous_categorie">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Unité *</label>
                    <select [(ngModel)]="currentArticle.unite" name="unite" required>
                      <option value="pièce">Pièce</option>
                      <option value="kg">Kilogramme (kg)</option>
                      <option value="g">Gramme (g)</option>
                      <option value="l">Litre (L)</option>
                      <option value="ml">Millilitre (ml)</option>
                      <option value="m">Mètre (m)</option>
                      <option value="m2">Mètre carré (m²)</option>
                      <option value="m3">Mètre cube (m³)</option>
                      <option value="carton">Carton</option>
                      <option value="palette">Palette</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="currentArticle.statut" name="statut">
                      <option value="actif">✅ Actif</option>
                      <option value="inactif">⏸️ Inactif</option>
                      <option value="rupture">❌ Rupture</option>
                      <option value="promotion">🎉 Promotion</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Poids (kg)</label>
                    <input type="number" [(ngModel)]="currentArticle.poids" name="poids" step="0.001">
                  </div>
                  <div class="form-group">
                    <label>Dimensions (LxHxP)</label>
                    <input type="text" [(ngModel)]="currentArticle.dimensions" name="dimensions" placeholder="Ex: 30x20x10 cm">
                  </div>
                </div>
              </div>

              <!-- Onglet Stock -->
              <div *ngIf="activeTab === 'stock'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Stock actuel</label>
                    <input type="number" [(ngModel)]="currentArticle.stock_actuel" name="stock_actuel" min="0">
                  </div>
                  <div class="form-group">
                    <label>Stock minimum *</label>
                    <input type="number" [(ngModel)]="currentArticle.stock_minimum" name="stock_minimum" min="0" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Stock maximum</label>
                    <input type="number" [(ngModel)]="currentArticle.stock_maximum" name="stock_maximum" min="0">
                  </div>
                  <div class="form-group">
                    <label>Emplacement</label>
                    <input type="text" [(ngModel)]="currentArticle.emplacement" name="emplacement" placeholder="Ex: A-12, Rayon 3">
                  </div>
                </div>
                <div class="alert-stock" *ngIf="currentArticle.stock_actuel !== undefined && currentArticle.stock_minimum !== undefined && currentArticle.stock_actuel <= currentArticle.stock_minimum && currentArticle.stock_minimum > 0">
                  ⚠️ Stock bas ! Actuel: {{ currentArticle.stock_actuel }} / Minimum: {{ currentArticle.stock_minimum }}
                </div>
              </div>

              <!-- Onglet Prix & TVA -->
              <div *ngIf="activeTab === 'prix'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Prix d'achat HT</label>
                    <input type="number" [(ngModel)]="currentArticle.prix_achat_ht" name="prix_achat_ht" min="0" (input)="calculerMarge()">
                  </div>
                  <div class="form-group">
                    <label>Prix de vente HT</label>
                    <input type="number" [(ngModel)]="currentArticle.prix_vente_ht" name="prix_vente_ht" min="0" (input)="calculerMarge()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>TVA (%)</label>
                    <select [(ngModel)]="currentArticle.tva" name="tva" (change)="calculerMarge()">
                      <option value="0">0%</option>
                      <option value="5.5">5.5%</option>
                      <option value="10">10%</option>
                      <option value="18">18%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Marge (%)</label>
                    <input type="text" [value]="currentArticle.marge + '%'" disabled class="readonly marge-field">
                  </div>
                </div>
                <div class="info-card" *ngIf="currentArticle.prix_vente_ht !== undefined && currentArticle.prix_vente_ht > 0">
                  <p><strong>💰 Prix TTC :</strong> {{ getPrixTTC(currentArticle.prix_vente_ht || 0, currentArticle.tva || 0) | number }} FCFA</p>
                  <p><strong>📈 Marge brute :</strong> {{ ((currentArticle.prix_vente_ht || 0) - (currentArticle.prix_achat_ht || 0)) | number }} FCFA / unité</p>
                </div>
              </div>

              <!-- Onglet Fournisseur -->
              <div *ngIf="activeTab === 'fournisseur'" class="tab-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>Fournisseur principal</label>
                    <select [(ngModel)]="currentArticle.fournisseur_principal" name="fournisseur_principal">
                      <option [value]="null">Sélectionner</option>
                      <option *ngFor="let f of fournisseurs" [value]="f.nom">{{ f.nom }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Réf. fournisseur</label>
                    <input type="text" [(ngModel)]="currentArticle.fournisseur_ref" name="fournisseur_ref">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Délai d'approvisionnement (jours)</label>
                    <input type="number" [(ngModel)]="currentArticle.delai_approvisionnement" name="delai_approvisionnement" min="0">
                  </div>
                  <div class="form-group">
                    <label>Quantité de commande</label>
                    <input type="number" [(ngModel)]="currentArticle.quantite_commande" name="quantite_commande" min="0">
                  </div>
                </div>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea [(ngModel)]="currentArticle.notes" name="notes" rows="3"></textarea>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="articles.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterArticles()" placeholder="Rechercher par nom, référence..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="categorieFilter" (ngModelChange)="filterArticles()" class="filter-select">
            <option value="">Toutes catégories</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterArticles()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actif</option>
            <option value="inactif">⏸️ Inactif</option>
            <option value="rupture">❌ Rupture</option>
            <option value="promotion">🎉 Promotion</option>
          </select>
          <select [(ngModel)]="stockFilter" (ngModelChange)="filterArticles()" class="filter-select">
            <option value="">Tous stocks</option>
            <option value="low">⚠️ Stock bas</option>
            <option value="out">❌ Rupture</option>
            <option value="normal">✅ Stock normal</option>
          </select>
        </div>
      </div>

      <!-- Liste des articles améliorée -->
      <div class="articles-section" *ngIf="articles.length > 0; else emptyState">
        <div class="section-header">
          <h2>📋 Liste des articles</h2>
          <div class="header-stats">
            <span class="stat-badge total">{{ articles.length }} articles</span>
            <span class="stat-badge valeur">{{ getValeurStock() | number }} FCFA</span>
          </div>
        </div>
        
        <div class="articles-grid">
          <div class="article-card" *ngFor="let a of filteredArticles" [class]="a.statut" [class.low-stock]="a.stock_actuel <= a.stock_minimum && a.statut !== 'rupture'">
            <div class="card-header">
              <div class="header-left">
                <div class="article-icon">{{ getTypeIcon(a.categorie) }}</div>
                <div class="article-info">
                  <div class="article-ref">{{ a.reference }}</div>
                  <div class="article-nom">{{ a.nom }}</div>
                  <div class="article-categorie">{{ a.categorie }}</div>
                </div>
              </div>
              <div class="header-right">
                <span class="statut-badge" [class]="a.statut">{{ getStatutLabel(a.statut) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="stock-info">
                <span class="stock-label">📦 Stock:</span>
                <span class="stock-value" [class.low]="a.stock_actuel <= a.stock_minimum">
                  {{ a.stock_actuel }} {{ a.unite }}
                </span>
                <span class="stock-mini" *ngIf="a.stock_minimum > 0">(min: {{ a.stock_minimum }})</span>
              </div>
              <div class="price-info">
                <span class="price-ht">{{ a.prix_vente_ht | number }} FCFA HT</span>
                <span class="price-ttc">{{ getPrixTTC(a.prix_vente_ht, a.tva) | number }} FCFA TTC</span>
              </div>
              <div class="supplier-info" *ngIf="a.fournisseur_principal">
                <span>🏭 {{ a.fournisseur_principal }}</span>
              </div>
              <div class="progress-container" *ngIf="a.stock_maximum && a.stock_maximum > 0">
                <div class="progress-label">Niveau de stock: {{ (a.stock_actuel / a.stock_maximum * 100) | number:'1.0-0' }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(a.stock_actuel / a.stock_maximum * 100)" [class]="getProgressClass(a)"></div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-actions">
                <button class="action-icon" (click)="viewDetails(a)" title="Voir détails">👁️</button>
                <button class="action-icon" (click)="editArticle(a)" title="Modifier">✏️</button>
                <button class="action-icon" (click)="duplicateArticle(a)" title="Dupliquer">📋</button>
                <button class="action-icon delete" (click)="confirmDelete(a)" title="Supprimer">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucun article</h2>
          <p>Ajoutez votre premier article ou produit</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvel article</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container large">
          <div class="modal-header">
            <h3>{{ selectedArticle?.nom }}</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedArticle">
            <div class="details-grid">
              <div class="detail-section">
                <h4>📋 Informations générales</h4>
                <p><strong>Référence:</strong> {{ selectedArticle.reference }}</p>
                <p><strong>Code barre:</strong> {{ selectedArticle.code_barre || '-' }}</p>
                <p><strong>Catégorie:</strong> {{ selectedArticle.categorie }}</p>
                <p><strong>Sous-catégorie:</strong> {{ selectedArticle.sous_categorie || '-' }}</p>
                <p><strong>Unité:</strong> {{ selectedArticle.unite }}</p>
                <p><strong>Statut:</strong> {{ getStatutLabel(selectedArticle.statut) }}</p>
              </div>
              <div class="detail-section">
                <h4>📦 Stock</h4>
                <p><strong>Stock actuel:</strong> {{ selectedArticle.stock_actuel }} {{ selectedArticle.unite }}</p>
                <p><strong>Stock minimum:</strong> {{ selectedArticle.stock_minimum }} {{ selectedArticle.unite }}</p>
                <p><strong>Emplacement:</strong> {{ selectedArticle.emplacement || '-' }}</p>
                <div *ngIf="selectedArticle.stock_actuel <= selectedArticle.stock_minimum" class="alert-red">
                  ⚠️ Stock bas !
                </div>
              </div>
              <div class="detail-section">
                <h4>💰 Prix</h4>
                <p><strong>Prix d'achat HT:</strong> {{ selectedArticle.prix_achat_ht | number }} FCFA</p>
                <p><strong>Prix de vente HT:</strong> {{ selectedArticle.prix_vente_ht | number }} FCFA</p>
                <p><strong>TVA:</strong> {{ selectedArticle.tva }}%</p>
                <p><strong>Prix TTC:</strong> {{ getPrixTTC(selectedArticle.prix_vente_ht, selectedArticle.tva) | number }} FCFA</p>
                <p><strong>Marge:</strong> {{ selectedArticle.marge }}%</p>
              </div>
              <div class="detail-section">
                <h4>🏭 Fournisseur</h4>
                <p><strong>Fournisseur:</strong> {{ selectedArticle.fournisseur_principal || '-' }}</p>
                <p><strong>Réf. fournisseur:</strong> {{ selectedArticle.fournisseur_ref || '-' }}</p>
                <p><strong>Délai appro:</strong> {{ selectedArticle.delai_approvisionnement || '-' }} jours</p>
              </div>
              <div class="detail-section full-width" *ngIf="selectedArticle.notes">
                <h4>📝 Notes</h4>
                <p>{{ selectedArticle.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🗑️ Confirmer la suppression</h3>
            <button class="modal-close" (click)="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Supprimer l'article <strong>{{ articleToDelete?.nom }}</strong> ?</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteArticle()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .articles-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-add:hover, .btn-primary:hover { background: #DB2777; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(236,72,153,0.3); }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-pdf { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-success { background: #10B981; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.valeur .kpi-value { color: #10B981; }
    .kpi-card.alerte .kpi-value { color: #F59E0B; }
    .kpi-card.rupture .kpi-value { color: #EF4444; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.large { max-width: 900px; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #F3F4F6; padding-bottom: 10px; flex-wrap: wrap; }
    .tabs button { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #6B7280; border-radius: 20px; }
    .tabs button.active { background: #EC4899; color: white; }
    .tab-content { margin-top: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .readonly { background: #F9FAFB; color: #6B7280; }
    .marge-field { font-weight: 600; color: #EC4899; }
    .info-card { background: #FEF3F9; padding: 12px; border-radius: 10px; margin-top: 10px; }
    .alert-stock { background: #FEF2F2; color: #EF4444; padding: 12px; border-radius: 10px; margin-top: 10px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .articles-section { background: white; border-radius: 16px; padding: 20px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }
    .header-stats { display: flex; gap: 12px; }
    .stat-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .stat-badge.total { background: #FEF3F9; color: #EC4899; }
    .stat-badge.valeur { background: #DCFCE7; color: #16A34A; }
    
    .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .article-card { background: #F9FAFB; border-radius: 16px; padding: 20px; transition: all 0.2s; border-left: 4px solid transparent; }
    .article-card.actif { border-left-color: #10B981; }
    .article-card.inactif { border-left-color: #9CA3AF; opacity: 0.7; }
    .article-card.rupture { border-left-color: #EF4444; background: #FEF2F2; }
    .article-card.promotion { border-left-color: #F59E0B; }
    .article-card.low-stock { background: #FEF3C7; }
    .article-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .header-left { display: flex; gap: 12px; align-items: center; flex: 1; }
    .article-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .article-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; margin-bottom: 4px; }
    .article-nom { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .article-categorie { font-size: 11px; background: #FEF3F9; padding: 2px 8px; border-radius: 20px; color: #EC4899; display: inline-block; }
    .statut-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; }
    .statut-badge.actif { background: #DCFCE7; color: #16A34A; }
    .statut-badge.inactif { background: #F3F4F6; color: #6B7280; }
    .statut-badge.rupture { background: #FEE2E2; color: #EF4444; }
    .statut-badge.promotion { background: #FEF3C7; color: #D97706; }
    .card-body { margin: 16px 0; }
    .stock-info { margin-bottom: 8px; font-size: 14px; }
    .stock-value.low { color: #EF4444; font-weight: 600; }
    .stock-mini { font-size: 11px; color: #9CA3AF; margin-left: 5px; }
    .price-info { margin-bottom: 8px; }
    .price-ht { font-size: 13px; color: #6B7280; }
    .price-ttc { font-size: 16px; font-weight: 600; color: #EC4899; margin-left: 12px; }
    .supplier-info { font-size: 12px; color: #6B7280; margin-top: 5px; }
    .progress-container { margin-top: 12px; }
    .progress-label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
    .progress-bar { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .progress-fill.low { background: #EF4444; }
    .progress-fill.medium { background: #F59E0B; }
    .progress-fill.high { background: #10B981; }
    .card-footer { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
    .footer-actions { display: flex; gap: 8px; }
    .action-icon { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .action-icon:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-section h4 { color: #EC4899; margin: 0 0 12px 0; font-size: 16px; }
    .detail-section p { margin: 8px 0; font-size: 14px; color: #4B5563; }
    .detail-section.full-width { grid-column: span 2; }
    .alert-red { background: #FEF2F2; color: #EF4444; padding: 8px; border-radius: 6px; margin-top: 8px; font-size: 13px; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; }
      .detail-section.full-width { grid-column: span 1; }
      .articles-grid { grid-template-columns: 1fr; }
      .filters-section { flex-direction: column; }
    }
  `]
})
export class Articles implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  selectedArticle: Article | null = null;
  
  categories: string[] = ['Matières premières', 'Produits finis', 'Emballages', 'Consommables', 'Outillage', 'Services', 'Autre'];
  fournisseurs: any[] = [];
  
  currentArticle: Partial<Article> = {
    reference: '',
    code_barre: '',
    nom: '',
    description: '',
    categorie: '',
    sous_categorie: '',
    unite: 'pièce',
    prix_achat_ht: 0,
    prix_vente_ht: 0,
    tva: 18,
    marge: 0,
    stock_minimum: 0,
    stock_actuel: 0,
    stock_maximum: 0,
    statut: 'actif',
    date_creation: new Date().toISOString().split('T')[0]
  };
  
  activeTab = 'general';
  searchTerm = '';
  categorieFilter = '';
  statutFilter = '';
  stockFilter = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  articleToDelete: Article | null = null;
  successMessage = '';
  
  ngOnInit() {
    this.loadFournisseurs();
    this.loadArticles();
  }
  
  openForm() {
    this.currentArticle = {
      reference: this.generateReference(),
      code_barre: '',
      nom: '',
      description: '',
      categorie: '',
      sous_categorie: '',
      unite: 'pièce',
      prix_achat_ht: 0,
      prix_vente_ht: 0,
      tva: 18,
      marge: 0,
      stock_minimum: 0,
      stock_actuel: 0,
      stock_maximum: 0,
      statut: 'actif',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
    this.activeTab = 'general';
  }
  
  generateReference(): string {
    const count = this.articles.length + 1;
    return `ART-${String(count).padStart(4, '0')}`;
  }
  
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    this.fournisseurs = saved ? JSON.parse(saved) : [];
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
    this.filteredArticles = [...this.articles];
  }
  
  saveArticles() {
    localStorage.setItem('articles', JSON.stringify(this.articles));
  }
  
  calculerMarge() {
    const prixAchat = this.currentArticle.prix_achat_ht || 0;
    const prixVente = this.currentArticle.prix_vente_ht || 0;
    if (prixAchat > 0 && prixVente > 0) {
      const margeBrute = prixVente - prixAchat;
      this.currentArticle.marge = Math.round((margeBrute / prixVente) * 100);
    } else {
      this.currentArticle.marge = 0;
    }
  }
  
  getPrixTTC(prixHT: number, tva: number): number {
    return prixHT * (1 + tva / 100);
  }
  
  getValeurStock(): number {
    return this.articles.reduce((total, article) => {
      return total + ((article.stock_actuel || 0) * (article.prix_achat_ht || 0));
    }, 0);
  }
  
  getStockBasCount(): number {
    return this.articles.filter(a => (a.stock_actuel || 0) <= (a.stock_minimum || 0) && a.statut !== 'rupture').length;
  }
  
  getRuptureCount(): number {
    return this.articles.filter(a => a.statut === 'rupture').length;
  }
  
  getProgressClass(article: Article): string {
    if (!article.stock_maximum || article.stock_maximum === 0) return '';
    const pourcentage = ((article.stock_actuel || 0) / article.stock_maximum) * 100;
    if (pourcentage < 30) return 'low';
    if (pourcentage < 70) return 'medium';
    return 'high';
  }
  
  getTypeIcon(categorie: string): string {
    const icons: any = {
      'Matières premières': '📦',
      'Produits finis': '✅',
      'Emballages': '📦',
      'Consommables': '🔧',
      'Outillage': '🔨',
      'Services': '💼',
      'Autre': '📌'
    };
    return icons[categorie] || '📦';
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { 
      actif: '✅ Actif', 
      inactif: '⏸️ Inactif', 
      rupture: '❌ Rupture', 
      promotion: '🎉 Promotion' 
    };
    return labels[statut] || statut;
  }
  
  saveArticle() {
    if (this.editMode && this.currentArticle.id) {
      const index = this.articles.findIndex(a => a.id === this.currentArticle.id);
      if (index !== -1) {
        this.currentArticle.date_derniere_modification = new Date().toISOString().split('T')[0];
        this.articles[index] = { ...this.currentArticle } as Article;
        this.showSuccess('Article modifié');
      }
    } else {
      const newArticle = { ...this.currentArticle, id: Date.now() } as Article;
      this.articles.push(newArticle);
      this.showSuccess('Article ajouté');
    }
    
    this.saveArticles();
    this.filterArticles();
    this.cancelForm();
  }
  
  editArticle(a: Article) {
    this.currentArticle = { ...a };
    this.editMode = true;
    this.showForm = true;
    this.activeTab = 'general';
  }
  
  duplicateArticle(a: Article) {
    const newArticle = { 
      ...a, 
      id: Date.now(), 
      reference: this.generateReference(),
      nom: a.nom + ' (copie)',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.articles.push(newArticle);
    this.saveArticles();
    this.filterArticles();
    this.showSuccess('Article dupliqué');
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
      this.saveArticles();
      this.filterArticles();
      this.showDeleteModal = false;
      this.articleToDelete = null;
      this.showSuccess('Article supprimé');
    }
  }
  
  cancelForm() {
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
      filtered = filtered.filter(a => a.categorie === this.categorieFilter);
    }
    
    if (this.statutFilter) {
      filtered = filtered.filter(a => a.statut === this.statutFilter);
    }
    
    if (this.stockFilter === 'low') {
      filtered = filtered.filter(a => (a.stock_actuel || 0) <= (a.stock_minimum || 0) && (a.stock_actuel || 0) > 0);
    } else if (this.stockFilter === 'out') {
      filtered = filtered.filter(a => (a.stock_actuel || 0) === 0 || a.statut === 'rupture');
    } else if (this.stockFilter === 'normal') {
      filtered = filtered.filter(a => (a.stock_actuel || 0) > (a.stock_minimum || 0));
    }
    
    this.filteredArticles = filtered;
  }
  
    exportToExcel() {
    if (!this.filteredArticles || this.filteredArticles.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredArticles[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const lignes = this.filteredArticles.map(obj => colonnes.map(k => (obj as any)[k] !== undefined ? (obj as any)[k] : ""));
    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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
    if (!this.filteredArticles || this.filteredArticles.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }
    const firstItem = this.filteredArticles[0];
    const colonnes = Object.keys(firstItem).filter(k => !["id", "created_at", "updated_at"].includes(k));
    const contenu = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export PDF</title><style>body{font-family:Arial;margin:20px;}h1{color:#EC4899;text-align:center;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f2f2f2;}</style></head><body><h1>Export de données</h1><p>Généré le ${new Date().toLocaleString()}</p>\n<table>\n<thead>\n<tr>${colonnes.map(c => `<th>${c}</th>`).join("")}</tr>\n</thead>\n<tbody>${this.filteredArticles.map(obj => `\n<tr>${colonnes.map(c => `<td>${(obj as any)[c] !== undefined ? (obj as any)[c] : "-"}</td>`).join("")}</tr>`).join("")}\n</tbody>\n</table>\n<div class="footer">PulseBusiness - Export</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(contenu); win.document.close(); win.print(); } else { alert("Veuillez autoriser les pop-ups pour exporter en PDF"); }
  }
  
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}