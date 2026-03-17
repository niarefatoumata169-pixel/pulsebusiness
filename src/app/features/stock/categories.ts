import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  code?: string;
  parent_id?: number;
  parent_nom?: string;
  image?: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="categories-container">
      <div class="header">
        <div>
          <h1>Catégories</h1>
          <p class="subtitle">{{ categories.length }} catégorie(s)</p>
        </div>
        <button class="btn-add" (click)="showForm = !showForm">+ Nouvelle catégorie</button>
      </div>
      <div *ngIf="successMessage" class="alert-success">✅ {{ successMessage }}</div>
      <div class="form-card" *ngIf="showForm">
        <h3>{{ editMode ? 'Modifier' : 'Nouvelle' }} catégorie</h3>
        <form (ngSubmit)="saveCategorie()" #categorieForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="currentCategorie.nom" name="nom" required>
            </div>
            <div class="form-group">
              <label>Code</label>
              <input type="text" [(ngModel)]="currentCategorie.code" name="code">
            </div>
            <div class="form-group">
              <label>Catégorie parente</label>
              <select [(ngModel)]="currentCategorie.parent_id" name="parent_id" (change)="onParentChange()">
                <option value="">Aucune (catégorie racine)</option>
                <option *ngFor="let c of categories" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Image (URL)</label>
              <input type="text" [(ngModel)]="currentCategorie.image" name="image">
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="currentCategorie.description" name="description" rows="4"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="cancelForm()">Annuler</button>
            <button type="submit" class="btn-save" [disabled]="categorieForm.invalid">💾 Enregistrer</button>
          </div>
        </form>
      </div>
      <div class="filters-bar" *ngIf="categories.length > 0">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="filterCategories()" placeholder="Rechercher...">
        </div>
      </div>
      <div class="categories-grid" *ngIf="categories.length > 0; else emptyState">
        <div class="categorie-card" *ngFor="let c of filteredCategories">
          <div class="categorie-header">
            <span class="categorie-nom">{{ c.nom }}</span>
            <span class="categorie-code" *ngIf="c.code">{{ c.code }}</span>
          </div>
          <div class="categorie-body">
            <p class="categorie-parent" *ngIf="c.parent_nom"><small>Parent: {{ c.parent_nom }}</small></p>
            <p class="categorie-description">{{ c.description || 'Aucune description' }}</p>
          </div>
          <div class="categorie-footer">
            <span class="article-count">{{ getArticleCount(c.id) }} article(s)</span>
            <div class="categorie-actions">
              <button class="btn-icon" (click)="editCategorie(c)" title="Modifier">✏️</button>
              <button class="btn-icon delete" (click)="confirmDelete(c)" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h2>Aucune catégorie</h2>
          <p>Créez votre première catégorie</p>
          <button class="btn-primary" (click)="showForm = true">+ Nouvelle catégorie</button>
        </div>
      </ng-template>
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <h3>Confirmer la suppression</h3>
          <p>Supprimer la catégorie <strong>{{ categorieToDelete?.nom }}</strong> ?</p>
          <p class="warning" *ngIf="getArticleCount(categorieToDelete?.id) > 0">
            ⚠️ Cette catégorie contient {{ getArticleCount(categorieToDelete?.id) }} article(s)
          </p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Annuler</button>
            <button class="btn-delete" (click)="deleteCategorie()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
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
    .filters-bar { margin-bottom: 24px; }
    .search-box { background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .categorie-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .categorie-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .categorie-nom { font-weight: 600; color: #1F2937; font-size: 16px; }
    .categorie-code { font-size: 11px; padding: 2px 6px; background: #FDF2F8; border-radius: 4px; color: #EC4899; }
    .categorie-parent { color: #6B7280; margin: 5px 0; }
    .categorie-description { color: #4B5563; font-size: 13px; margin: 10px 0; }
    .categorie-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #FCE7F3; }
    .article-count { font-size: 12px; color: #6B7280; }
    .categorie-actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    .btn-icon.delete:hover { background: #FEE2E2; border-color: #EF4444; }
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; }
    .warning { color: #EF4444; font-size: 13px; margin-top: 10px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    .btn-delete { background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  `]
})
export class Categories implements OnInit {
  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];
  articles: any[] = [];
  currentCategorie: any = {
    nom: '',
    code: '',
    parent_id: '',
    description: '',
    image: ''
  };
  searchTerm = '';
  showForm = false;
  editMode = false;
  showDeleteModal = false;
  categorieToDelete: Categorie | null = null;
  successMessage = '';
  ngOnInit() {
    this.loadCategories();
    this.loadArticles();
  }
  loadCategories() {
    const saved = localStorage.getItem('categories');
    this.categories = saved ? JSON.parse(saved) : [];
    this.updateParentNames();
    this.filteredCategories = [...this.categories];
  }
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
  }
  updateParentNames() {
    this.categories.forEach(c => {
      if (c.parent_id) {
        const parent = this.categories.find(p => p.id === c.parent_id);
        c.parent_nom = parent?.nom;
      }
    });
  }
  onParentChange() {
    const parent = this.categories.find(c => c.id === this.currentCategorie.parent_id);
    if (parent) this.currentCategorie.parent_nom = parent.nom;
  }
  saveCategorie() {
    if (this.editMode) {
      const index = this.categories.findIndex(c => c.id === this.currentCategorie.id);
      if (index !== -1) {
        this.categories[index] = { ...this.currentCategorie };
        this.showSuccess('Catégorie modifiée !');
      }
    } else {
      const newCategorie = { ...this.currentCategorie, id: Date.now() };
      this.categories.push(newCategorie);
      this.showSuccess('Catégorie ajoutée !');
    }
    this.updateParentNames();
    localStorage.setItem('categories', JSON.stringify(this.categories));
    this.filterCategories();
    this.cancelForm();
  }
  editCategorie(c: Categorie) {
    this.currentCategorie = { ...c };
    this.editMode = true;
    this.showForm = true;
  }
  confirmDelete(c: Categorie) {
    this.categorieToDelete = c;
    this.showDeleteModal = true;
  }
  deleteCategorie() {
    if (this.categorieToDelete) {
      this.categories = this.categories.filter(c => c.id !== this.categorieToDelete?.id);
      localStorage.setItem('categories', JSON.stringify(this.categories));
      this.filterCategories();
      this.showDeleteModal = false;
      this.categorieToDelete = null;
      this.showSuccess('Catégorie supprimée !');
    }
  }
  cancelForm() {
    this.currentCategorie = {
      nom: '',
      code: '',
      parent_id: '',
      description: '',
      image: ''
    };
    this.showForm = false;
    this.editMode = false;
  }
  filterCategories() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(c => 
      c.nom?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term)
    );
  }
  getArticleCount(categorieId?: number): number {
    if (!categorieId) return 0;
    return this.articles.filter(a => a.categorie_id === categorieId).length;
  }
  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
