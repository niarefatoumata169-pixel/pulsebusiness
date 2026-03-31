import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Category {
  id?: number;
  code: string;
  nom: string;
  description?: string;
  parent_id?: number | null;
  niveau: number;
  ordre: number;
  icone?: string;
  couleur?: string;
  type: 'article' | 'client' | 'fournisseur' | 'chantier' | 'general';
  statut: 'actif' | 'inactif';
  nombre_elements?: number;
  date_creation: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="categories-container">
      <!-- En-tête avec stats -->
      <div class="header">
        <div>
          <h1>🏷️ Catégories</h1>
          <p class="subtitle">{{ categories.length }} catégorie(s) • {{ getActiveCount() }} active(s)</p>
        </div>
        <div class="header-actions">
          <button class="btn-excel" (click)="exportToExcel()" *ngIf="categories.length > 0">📊 Excel</button>
          <button class="btn-pdf" (click)="exportToPDF()" *ngIf="categories.length > 0">📄 PDF</button>
          <button class="btn-add" (click)="openForm()">+ Nouvelle catégorie</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ successMessage }}
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid" *ngIf="categories.length > 0">
        <div class="kpi-card total">
          <div class="kpi-icon">🏷️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ categories.length }}</span>
            <span class="kpi-label">Total catégories</span>
          </div>
        </div>
        <div class="kpi-card actives">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getActiveCount() }}</span>
            <span class="kpi-label">Catégories actives</span>
          </div>
        </div>
        <div class="kpi-card racines">
          <div class="kpi-icon">🌳</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getRootCount() }}</span>
            <span class="kpi-label">Catégories racines</span>
          </div>
        </div>
        <div class="kpi-card elements">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ getTotalElements() }}</span>
            <span class="kpi-label">Éléments liés</span>
          </div>
        </div>
      </div>

      <!-- Formulaire moderne -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editMode ? '✏️ Modifier' : '➕ Nouvelle' }} catégorie</h3>
            <button class="modal-close" (click)="cancelForm()">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveCategory()">
              <div class="form-row">
                <div class="form-group">
                  <label>Code *</label>
                  <input type="text" [(ngModel)]="currentCategory.code" name="code" required placeholder="Ex: ART-001">
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" [(ngModel)]="currentCategory.nom" name="nom" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type *</label>
                  <select [(ngModel)]="currentCategory.type" name="type" required (change)="onTypeChange()">
                    <option value="article">📦 Articles / Produits</option>
                    <option value="client">👥 Clients</option>
                    <option value="fournisseur">🏭 Fournisseurs</option>
                    <option value="chantier">🏗️ Chantiers / Projets</option>
                    <option value="general">📌 Général</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Catégorie parente</label>
                  <select [(ngModel)]="currentCategory.parent_id" name="parent_id">
                    <option [ngValue]="null">Aucune (racine)</option>
                    <option *ngFor="let cat of getParentCandidates()" [ngValue]="cat.id">
                      {{ getIndentation(cat.niveau) }} {{ cat.icone }} {{ cat.nom }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ordre d'affichage</label>
                  <input type="number" [(ngModel)]="currentCategory.ordre" name="ordre" min="0">
                </div>
                <div class="form-group">
                  <label>Icône</label>
                  <input type="text" [(ngModel)]="currentCategory.icone" name="icone" placeholder="Ex: 📦, 🏭, 👥">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Couleur</label>
                  <div class="color-input">
                    <input type="color" [(ngModel)]="currentCategory.couleur" name="couleur">
                    <input type="text" [(ngModel)]="currentCategory.couleur" name="couleur_text" placeholder="#EC4899" class="color-text">
                  </div>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <select [(ngModel)]="currentCategory.statut" name="statut">
                    <option value="actif">✅ Actif</option>
                    <option value="inactif">⏸️ Inactif</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="currentCategory.description" name="description" rows="3"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="cancelForm()">Annuler</button>
                <button type="submit" class="btn-primary">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Vue Toggle -->
      <div class="view-toggle" *ngIf="categories.length > 0">
        <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
          📋 Vue liste
        </button>
        <button [class.active]="viewMode === 'tree'" (click)="viewMode = 'tree'">
          🌳 Vue arborescence
        </button>
      </div>

      <!-- Filtres modernes -->
      <div class="filters-section" *ngIf="categories.length > 0">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCategories()" placeholder="Rechercher par nom, code..." class="search-input">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (ngModelChange)="filterCategories()" class="filter-select">
            <option value="">Tous types</option>
            <option value="article">📦 Articles</option>
            <option value="client">👥 Clients</option>
            <option value="fournisseur">🏭 Fournisseurs</option>
            <option value="chantier">🏗️ Chantiers</option>
            <option value="general">📌 Général</option>
          </select>
          <select [(ngModel)]="statutFilter" (ngModelChange)="filterCategories()" class="filter-select">
            <option value="">Tous statuts</option>
            <option value="actif">✅ Actifs</option>
            <option value="inactif">⏸️ Inactifs</option>
          </select>
        </div>
      </div>

      <!-- Vue en liste -->
      <div *ngIf="viewMode === 'list'" class="categories-list">
        <div *ngIf="filteredCategories.length > 0; else emptyState">
          <table class="categories-table">
            <thead>
               <th>Code</th><th>Nom</th><th>Type</th><th>Parent</th><th>Éléments</th><th>Statut</th><th>Actions</th>
            </thead>
            <tbody>
              <tr *ngFor="let cat of filteredCategories">
                <td class="code-cell">
                  <span class="category-color" [style.backgroundColor]="cat.couleur" *ngIf="cat.couleur"></span>
                  <span class="category-code">{{ cat.code }}</span>
                  </td>
                <td>
                  <strong>{{ getIndentation(cat.niveau) }} {{ cat.icone }} {{ cat.nom }}</strong>
                </td>
                <td><span class="type-badge" [class]="cat.type">{{ getTypeLabel(cat.type) }}</span></td>
                <td>{{ getParentName(cat.parent_id) }}</td>
                <td class="count-cell">{{ cat.nombre_elements || 0 }}</td>
                <td><span class="status-badge" [class]="cat.statut">{{ cat.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}</span></td>
                <td class="actions-cell">
                  <button class="action-icon" (click)="viewDetails(cat)" title="Voir">👁️</button>
                  <button class="action-icon" (click)="editCategory(cat)" title="Modifier">✏️</button>
                  <button class="action-icon delete" (click)="confirmDelete(cat)" title="Supprimer">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vue en arborescence -->
      <div *ngIf="viewMode === 'tree'" class="categories-tree">
        <div *ngIf="filteredCategories.length > 0; else emptyState">
          <div *ngFor="let cat of getRootCategories()" class="tree-node">
            <div class="tree-item">
              <div class="tree-content" [style.backgroundColor]="cat.couleur ? cat.couleur + '20' : '#F9FAFB'">
                <span class="tree-icon">{{ cat.icone || '📁' }}</span>
                <span class="tree-name">{{ cat.nom }}</span>
                <span class="tree-code">{{ cat.code }}</span>
                <div class="tree-actions">
                  <button class="action-icon-sm" (click)="viewDetails(cat)" title="Voir">👁️</button>
                  <button class="action-icon-sm" (click)="editCategory(cat)" title="Modifier">✏️</button>
                  <button class="action-icon-sm delete" (click)="confirmDelete(cat)" title="Supprimer">🗑️</button>
                </div>
              </div>
              <div *ngFor="let child of getChildren(cat.id!)" class="tree-child">
                <div class="tree-item" style="margin-left: 24px;">
                  <div class="tree-content" [style.backgroundColor]="child.couleur ? child.couleur + '20' : '#FFFFFF'">
                    <span class="tree-icon">{{ child.icone || '📄' }}</span>
                    <span class="tree-name">{{ child.nom }}</span>
                    <span class="tree-code">{{ child.code }}</span>
                    <div class="tree-actions">
                      <button class="action-icon-sm" (click)="viewDetails(child)" title="Voir">👁️</button>
                      <button class="action-icon-sm" (click)="editCategory(child)" title="Modifier">✏️</button>
                      <button class="action-icon-sm delete" (click)="confirmDelete(child)" title="Supprimer">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="getRootCategories().length === 0" class="empty-tree">
            <p>Aucune catégorie racine. Créez votre première catégorie !</p>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">🏷️</div>
          <h2>Aucune catégorie</h2>
          <p>Organisez vos données avec des catégories</p>
          <button class="btn-primary" (click)="openForm()">+ Nouvelle catégorie</button>
        </div>
      </ng-template>

      <!-- Modal Détails -->
      <div class="modal-overlay" *ngIf="showDetailsModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Détails de la catégorie</h3>
            <button class="modal-close" (click)="showDetailsModal = false">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedCategory">
            <div class="detail-card">
              <div class="detail-row">
                <span class="detail-label">Code</span>
                <span class="detail-value">{{ selectedCategory.code }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nom</span>
                <span class="detail-value">{{ selectedCategory.icone }} {{ selectedCategory.nom }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value type-badge" [class]="selectedCategory.type">{{ getTypeLabel(selectedCategory.type) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Catégorie parente</span>
                <span class="detail-value">{{ getParentName(selectedCategory.parent_id) || 'Aucune' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Ordre</span>
                <span class="detail-value">{{ selectedCategory.ordre }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Couleur</span>
                <span class="detail-value">
                  <span class="color-preview" [style.backgroundColor]="selectedCategory.couleur"></span>
                  {{ selectedCategory.couleur }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Statut</span>
                <span class="detail-value status-badge" [class]="selectedCategory.statut">
                  {{ selectedCategory.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif' }}
                </span>
              </div>
              <div class="detail-row" *ngIf="selectedCategory.description">
                <span class="detail-label">Description</span>
                <span class="detail-value">{{ selectedCategory.description }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedCategory.nombre_elements">
                <span class="detail-label">Éléments associés</span>
                <span class="detail-value">{{ selectedCategory.nombre_elements }}</span>
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
            <p>Supprimer la catégorie <strong>{{ categoryToDelete?.nom }}</strong> ?</p>
            <div class="alert-warning" *ngIf="hasChildren(categoryToDelete)">
              ⚠️ Attention : Cette catégorie contient des sous-catégories qui seront également supprimées.
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showDeleteModal = false">Annuler</button>
              <button class="btn-danger" (click)="deleteCategory()">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
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
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-card.total .kpi-value { color: #EC4899; }
    .kpi-card.actives .kpi-value { color: #10B981; }
    .kpi-card.racines .kpi-value { color: #3B82F6; }
    .kpi-card.elements .kpi-value { color: #F59E0B; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-container { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; animation: slideIn 0.2s ease; }
    .modal-container.small { max-width: 450px; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
    .modal-header h3 { margin: 0; color: #EC4899; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9CA3AF; }
    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 16px; }
    .form-group label { margin-bottom: 8px; color: #4B5563; font-weight: 500; font-size: 14px; }
    .form-group input, .form-group textarea, .form-group select { padding: 12px; border: 2px solid #F3F4F6; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #EC4899; }
    .color-input { display: flex; gap: 10px; align-items: center; }
    .color-input input[type="color"] { width: 50px; height: 40px; }
    .color-text { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 2px solid #F3F4F6; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .btn-danger { background: #EF4444; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 500; }
    .alert-warning { background: #FEF3C7; color: #D97706; padding: 12px; border-radius: 8px; margin-top: 15px; }
    
    .view-toggle { display: flex; gap: 8px; margin-bottom: 24px; justify-content: flex-end; }
    .view-toggle button { padding: 8px 16px; border: 1px solid #F3F4F6; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
    .view-toggle button.active { background: #EC4899; color: white; border-color: #EC4899; }
    
    .filters-section { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; background: white; padding: 16px 20px; border-radius: 16px; }
    .search-wrapper { flex: 2; display: flex; align-items: center; gap: 12px; background: #F9FAFB; border-radius: 12px; padding: 8px 16px; border: 1px solid #F3F4F6; }
    .search-icon { color: #9CA3AF; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; }
    .filter-group { display: flex; gap: 12px; flex: 2; flex-wrap: wrap; }
    .filter-select { padding: 8px 16px; border: 1px solid #F3F4F6; border-radius: 10px; background: white; flex: 1; }
    
    .categories-table { width: 100%; background: white; border-radius: 16px; border-collapse: collapse; overflow: hidden; }
    .categories-table th, .categories-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .categories-table th { background: #FDF2F8; color: #4B5563; font-weight: 600; }
    .categories-table tr:hover { background: #FEF3F9; }
    .code-cell { display: flex; align-items: center; gap: 8px; }
    .category-color { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .category-code { font-family: monospace; font-size: 12px; color: #6B7280; }
    .type-badge { padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .type-badge.article { background: #E0E7FF; color: #4F46E5; }
    .type-badge.client { background: #DCFCE7; color: #16A34A; }
    .type-badge.fournisseur { background: #FEF3C7; color: #D97706; }
    .type-badge.chantier { background: #FFE4E6; color: #EC4899; }
    .type-badge.general { background: #F3F4F6; color: #6B7280; }
    .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 11px; }
    .status-badge.actif { background: #DCFCE7; color: #16A34A; }
    .status-badge.inactif { background: #FEE2E2; color: #EF4444; }
    .count-cell { text-align: center; font-weight: 600; color: #EC4899; }
    .actions-cell { display: flex; gap: 8px; }
    
    .categories-tree { background: white; border-radius: 16px; padding: 20px; }
    .tree-node { margin-bottom: 8px; }
    .tree-item { margin-bottom: 4px; }
    .tree-content { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: all 0.2s; }
    .tree-content:hover { background: #FEF3F9 !important; }
    .tree-icon { font-size: 18px; }
    .tree-name { font-weight: 500; flex: 1; }
    .tree-code { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .tree-actions { display: flex; gap: 6px; }
    .action-icon, .action-icon-sm { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: all 0.2s; }
    .action-icon-sm { padding: 4px 8px; font-size: 12px; }
    .action-icon:hover, .action-icon-sm:hover { background: #FEF3F9; border-color: #EC4899; }
    .action-icon.delete:hover, .action-icon-sm.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-tree { text-align: center; padding: 40px; color: #9CA3AF; }
    
    .detail-card { background: #F9FAFB; border-radius: 12px; padding: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 500; color: #6B7280; }
    .detail-value { font-weight: 500; color: #1F2937; }
    .color-preview { display: inline-block; width: 20px; height: 20px; border-radius: 4px; vertical-align: middle; margin-right: 8px; border: 1px solid #E5E7EB; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; gap: 12px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .categories-table { display: block; overflow-x: auto; }
      .filters-section { flex-direction: column; }
      .filter-group { flex-direction: column; }
    }
  `]
})
export class Categories implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  selectedCategory: Category | null = null;

  currentCategory: Partial<Category> = {
    code: '',
    nom: '',
    parent_id: null,
    niveau: 0,
    ordre: 0,
    icone: '📁',
    couleur: '#EC4899',
    type: 'general',
    statut: 'actif',
    date_creation: new Date().toISOString().split('T')[0]
  };

  searchTerm = '';
  typeFilter = '';
  statutFilter = '';
  viewMode: 'list' | 'tree' = 'list';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  showDetailsModal = false;
  categoryToDelete: Category | null = null;
  successMessage = '';

  ngOnInit() {
    this.loadCategories();
  }

  openForm(): void {
    this.currentCategory = {
      code: this.generateCode(),
      nom: '',
      parent_id: null,
      niveau: 0,
      ordre: this.categories.length,
      icone: '📁',
      couleur: '#EC4899',
      type: 'general',
      statut: 'actif',
      date_creation: new Date().toISOString().split('T')[0]
    };
    this.editMode = false;
    this.showForm = true;
  }

  generateCode(): string {
    const count = this.categories.length + 1;
    return `CAT-${String(count).padStart(3, '0')}`;
  }

  loadCategories(): void {
    const saved = localStorage.getItem('categories');
    this.categories = saved ? JSON.parse(saved) : [];
    this.updateNiveaux();
    this.updateCounts();
    this.filterCategories();
  }

  saveCategories(): void {
    localStorage.setItem('categories', JSON.stringify(this.categories));
    this.updateCounts();
  }

  updateNiveaux(): void {
    const updateRecursive = (cat: Category, niveau: number) => {
      cat.niveau = niveau;
      const enfants = this.categories.filter(c => c.parent_id === cat.id);
      enfants.forEach(enfant => updateRecursive(enfant, niveau + 1));
    };
    this.categories.filter(c => !c.parent_id).forEach(root => updateRecursive(root, 0));
  }

  updateCounts(): void {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const fournisseurs = JSON.parse(localStorage.getItem('fournisseurs') || '[]');

    this.categories.forEach(cat => {
      let count = 0;
      if (cat.type === 'article') count = articles.filter((a: any) => a.categorie === cat.nom).length;
      if (cat.type === 'client') count = clients.filter((c: any) => c.categorie === cat.nom).length;
      if (cat.type === 'fournisseur') count = fournisseurs.filter((f: any) => f.categorie === cat.nom).length;
      cat.nombre_elements = count;
    });
  }

  getParentCandidates(): Category[] {
    const currentType = this.currentCategory.type as Category['type'] | undefined;
    if (this.editMode && this.currentCategory.id) {
      return this.categories.filter(c => c.id !== this.currentCategory.id && (!currentType || c.type === currentType));
    }
    return this.categories.filter(c => !currentType || c.type === currentType);
  }

  getParentName(parentId: number | null | undefined): string {
    if (!parentId) return '—';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.nom : '—';
  }

  getIndentation(niveau: number): string {
    return '　'.repeat(niveau);
  }

  getTypeLabel(type: Category['type']): string {
    const labels: Record<string, string> = { article: 'Articles', client: 'Clients', fournisseur: 'Fournisseurs', chantier: 'Chantiers', general: 'Général' };
    return labels[type] || type;
  }

  getRootCategories(): Category[] {
    return this.filteredCategories.filter(c => !c.parent_id).sort((a, b) => a.ordre - b.ordre);
  }

  getChildren(parentId: number): Category[] {
    return this.filteredCategories.filter(c => c.parent_id === parentId).sort((a, b) => a.ordre - b.ordre);
  }

  getActiveCount(): number {
    return this.categories.filter(c => c.statut === 'actif').length;
  }

  getRootCount(): number {
    return this.categories.filter(c => !c.parent_id).length;
  }

  getTotalElements(): number {
    return this.categories.reduce((sum, c) => sum + (c.nombre_elements || 0), 0);
  }

  hasChildren(category: Category | null): boolean {
    if (!category) return false;
    return this.categories.some(c => c.parent_id === category.id);
  }

  onTypeChange(): void {
    this.currentCategory.parent_id = null;
  }

  saveCategory(): void {
    if (this.editMode && this.currentCategory.id) {
      const index = this.categories.findIndex(c => c.id === this.currentCategory.id);
      if (index !== -1) {
        this.categories[index] = { ...(this.currentCategory as Category) };
        this.showSuccess('Catégorie modifiée');
      }
    } else {
      const newCategory = { ...(this.currentCategory as Category), id: Date.now() } as Category;
      this.categories.push(newCategory);
      this.showSuccess('Catégorie ajoutée');
    }

    this.updateNiveaux();
    this.saveCategories();
    this.filterCategories();
    this.cancelForm();
  }

  editCategory(cat: Category): void {
    this.currentCategory = { ...cat };
    this.editMode = true;
    this.showForm = true;
  }

  viewDetails(cat: Category): void {
    this.selectedCategory = cat;
    this.showDetailsModal = true;
  }

  confirmDelete(cat: Category): void {
    this.categoryToDelete = cat;
    this.showDeleteModal = true;
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      const toDelete: number[] = [this.categoryToDelete.id!];
      const findChildren = (parentId: number) => {
        const children = this.categories.filter(c => c.parent_id === parentId);
        children.forEach(child => {
          if (child.id) {
            toDelete.push(child.id);
            findChildren(child.id);
          }
        });
      };
      findChildren(this.categoryToDelete.id!);

      this.categories = this.categories.filter(c => !toDelete.includes(c.id!));
      this.updateNiveaux();
      this.saveCategories();
      this.filterCategories();
      this.showDeleteModal = false;
      this.categoryToDelete = null;
      this.showSuccess('Catégorie(s) supprimée(s)');
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editMode = false;
  }

  filterCategories(): void {
    let filtered: Category[] = this.categories;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.nom || '').toLowerCase().includes(term) ||
        (c.code || '').toLowerCase().includes(term)
      );
    }

    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }

    if (this.statutFilter) {
      filtered = filtered.filter(c => c.statut === this.statutFilter);
    }

    this.filteredCategories = filtered;
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  exportToExcel(): void {
    if (!this.filteredCategories || this.filteredCategories.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const colonnes = ['Code', 'Nom', 'Type', 'Parent', 'Ordre', 'Statut', 'Éléments', 'Couleur'];
    const lignes = this.filteredCategories.map((c: Category) => [
      c.code ?? '',
      `${c.icone || ''} ${c.nom ?? ''}`.trim(),
      this.getTypeLabel(c.type),
      this.getParentName(c.parent_id) || '',
      c.ordre ?? '',
      c.statut === 'actif' ? 'Actif' : 'Inactif',
      c.nombre_elements ?? 0,
      c.couleur ?? ''
    ]);

    const csvContent = [colonnes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    const filename = `categories_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccess('Export Excel effectué');
  }

  exportToPDF(): void {
    if (!this.filteredCategories || this.filteredCategories.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des catégories</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #EC4899; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: gray; }
        </style>
      </head>
      <body>
        <h1>Liste des catégories</h1>
        <p>Généré le ${new Date().toLocaleString()}</p>
        <table>
          <thead>
             <tr>
               <th>Code</th><th>Nom</th><th>Type</th><th>Parent</th><th>Ordre</th><th>Statut</th><th>Éléments</th>
             </tr>
          </thead>
          <tbody>
            ${this.filteredCategories.map(c => `
              <tr>
                <td>${c.code ?? ''}</td>
                <td>${(c.icone || '') + ' ' + (c.nom ?? '')}</td>
                <td>${this.getTypeLabel(c.type)}</td>
                <td>${this.getParentName(c.parent_id) || '-'}</td>
                <td>${c.ordre ?? ''}</td>
                <td>${c.statut === 'actif' ? 'Actif' : 'Inactif'}</td>
                <td>${c.nombre_elements ?? 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">PulseBusiness - Export catégories</div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(contenu);
      win.document.close();
      setTimeout(() => {
        try { win.print(); } catch { /* ignore */ }
      }, 300);
      this.showSuccess('Export PDF lancé');
    } else {
      alert('Veuillez autoriser les pop-ups pour exporter en PDF');
    }
  }
}