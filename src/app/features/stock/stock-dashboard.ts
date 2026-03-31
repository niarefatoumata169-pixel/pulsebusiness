import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Article {
  id?: number;
  nom: string;
  reference: string;
  stock_actuel: number;
  stock_minimum: number;
  categorie: string;
  prix_achat_ht: number;
  unite: string;
  statut: string;
}

interface MouvementStock {
  id?: number;
  reference: string;
  type: string;
  article_nom: string;
  quantite: number;
  date_mouvement: string;
  statut: string;
}

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête avec bienvenue -->
      <div class="header">
        <div>
          <h1>📦 Dashboard Stock</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge">
            <span class="badge-icon">📊</span>
            <span>Vue d'ensemble du stock</span>
          </div>
        </div>
      </div>

      <!-- KPIs améliorés avec données dynamiques -->
      <div class="kpi-grid">
        <div class="kpi-card articles">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalArticles }}</span>
            <span class="kpi-label">Articles en stock</span>
            <span class="kpi-sub">{{ getArticlesActifs() }} actifs</span>
          </div>
        </div>
        <div class="kpi-card categories">
          <div class="kpi-icon">📂</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalCategories }}</span>
            <span class="kpi-label">Catégories</span>
            <span class="kpi-sub">{{ getCategoriesActives() }} actives</span>
          </div>
        </div>
        <div class="kpi-card mouvements">
          <div class="kpi-icon">🔄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalMouvements }}</span>
            <span class="kpi-label">Mouvements</span>
            <span class="kpi-sub">{{ getMouvementsMois() }} ce mois</span>
          </div>
        </div>
        <div class="kpi-card fournisseurs">
          <div class="kpi-icon">🏭</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalFournisseurs }}</span>
            <span class="kpi-label">Fournisseurs</span>
            <span class="kpi-sub">{{ getFournisseursActifs() }} actifs</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides modernisées -->
      <div class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/stock/articles/nouveau" class="action-btn article">
            <span class="action-icon">📦</span>
            <div class="action-info">
              <strong>Nouvel article</strong>
              <small>Ajouter un produit</small>
            </div>
          </a>
          <a routerLink="/stock/mouvements/nouveau" class="action-btn mouvement">
            <span class="action-icon">🔄</span>
            <div class="action-info">
              <strong>Nouveau mouvement</strong>
              <small>Entrée / Sortie</small>
            </div>
          </a>
          <a routerLink="/stock/categories/nouveau" class="action-btn categorie">
            <span class="action-icon">📂</span>
            <div class="action-info">
              <strong>Nouvelle catégorie</strong>
              <small>Organiser le stock</small>
            </div>
          </a>
          <a routerLink="/stock/fournisseurs/nouveau" class="action-btn fournisseur">
            <span class="action-icon">🏭</span>
            <div class="action-info">
              <strong>Nouveau fournisseur</strong>
              <small>Ajouter un partenaire</small>
            </div>
          </a>
        </div>
      </div>

      <!-- Graphiques améliorés -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>📊 Stock par catégorie</h3>
          <div class="chart-container" *ngIf="categoriesData.length > 0; else emptyChart">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let cat of categoriesData">
                <div class="bar-info">
                  <span class="bar-label">{{ cat.nom }}</span>
                  <span class="bar-value">{{ cat.valeur }} unités</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="cat.pourcentage" [style.background]="cat.couleur"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyChart>
            <div class="empty-chart">
              <div class="empty-icon">📊</div>
              <p>Aucune donnée disponible</p>
              <small>Les graphiques apparaîtront quand vous aurez des articles</small>
            </div>
          </ng-template>
        </div>

        <div class="chart-card">
          <h3>🔄 Mouvements récents</h3>
          <div class="chart-container" *ngIf="mouvementsRecents.length > 0; else emptyMouvements">
            <div class="mouvements-list">
              <div class="mouvement-item" *ngFor="let m of mouvementsRecents">
                <div class="mouvement-icon" [class]="m.type">
                  {{ m.type === 'entree' ? '📥' : m.type === 'sortie' ? '📤' : '🔄' }}
                </div>
                <div class="mouvement-info">
                  <div class="mouvement-ref">{{ m.reference }}</div>
                  <div class="mouvement-article">{{ m.article_nom }}</div>
                  <div class="mouvement-date">{{ m.date_mouvement | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="mouvement-quantite" [class]="m.type">
                  {{ m.type === 'entree' ? '+' : '-' }}{{ m.quantite }}
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyMouvements>
            <div class="empty-chart">
              <div class="empty-icon">🔄</div>
              <p>Aucun mouvement récent</p>
              <small>Enregistrez vos premiers mouvements de stock</small>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Alertes stock améliorées -->
      <div class="alerts-section">
        <div class="section-header">
          <h3>⚠️ Alertes stock</h3>
          <a routerLink="/stock/articles" class="btn-link">Voir tous →</a>
        </div>
        
        <div class="alerts-list" *ngIf="alertesStock.length > 0; else noAlerts">
          <div class="alert-card" *ngFor="let a of alertesStock" [class.critique]="a.stock_actuel === 0" [class.bas]="a.stock_actuel > 0">
            <div class="alert-icon">{{ a.stock_actuel === 0 ? '🔴' : '⚠️' }}</div>
            <div class="alert-info">
              <div class="alert-article">{{ a.nom }} ({{ a.reference }})</div>
              <div class="alert-details">
                Stock actuel: <strong>{{ a.stock_actuel }} {{ a.unite }}</strong> / Minimum: {{ a.stock_minimum }} {{ a.unite }}
              </div>
            </div>
            <button class="btn-reappro" (click)="reapprovisionner(a)">Réapprovisionner</button>
          </div>
        </div>
        <ng-template #noAlerts>
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <p>Aucune alerte de stock</p>
            <small>Tous les stocks sont à des niveaux corrects</small>
          </div>
        </ng-template>
      </div>

      <!-- Top fournisseurs -->
      <div class="top-fournisseurs-section" *ngIf="topFournisseurs.length > 0">
        <h3>🏆 Top fournisseurs</h3>
        <div class="fournisseurs-list">
          <div class="fournisseur-item" *ngFor="let f of topFournisseurs; let i = index">
            <span class="fournisseur-rank">{{ i + 1 }}</span>
            <span class="fournisseur-name">{{ f.nom }}</span>
            <span class="fournisseur-value">{{ f.totalAchats | number }} FCFA</span>
            <div class="fournisseur-bar">
              <div class="fournisseur-fill" [style.width.%]="(f.totalAchats / maxAchats) * 100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .date { color: #6B7280; margin: 8px 0 0 0; }
    .header-stats { display: flex; gap: 12px; }
    .welcome-badge { background: #FEF3F9; padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px; color: #EC4899; font-size: 14px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #1F2937; }
    .kpi-value small { font-size: 12px; font-weight: 400; color: #6B7280; }
    .kpi-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .kpi-sub { font-size: 11px; color: #9CA3AF; margin-top: 2px; display: block; }
    .kpi-card.articles .kpi-value { color: #EC4899; }
    .kpi-card.categories .kpi-value { color: #3B82F6; }
    .kpi-card.mouvements .kpi-value { color: #10B981; }
    .kpi-card.fournisseurs .kpi-value { color: #F59E0B; }
    
    .quick-actions { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    h2, h3 { color: #1F2937; margin: 0 0 16px 0; font-size: 18px; }
    .action-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .action-btn { background: #F9FAFB; padding: 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border: 1px solid #F3F4F6; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .action-btn.article:hover { background: #FFE4E6; border-color: #EC4899; }
    .action-btn.mouvement:hover { background: #DCFCE7; border-color: #10B981; }
    .action-btn.categorie:hover { background: #DBEAFE; border-color: #3B82F6; }
    .action-btn.fournisseur:hover { background: #FEF3C7; border-color: #F59E0B; }
    .action-icon { font-size: 28px; }
    .action-info { flex: 1; }
    .action-info strong { display: block; color: #1F2937; margin-bottom: 4px; }
    .action-info small { font-size: 11px; color: #6B7280; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: white; border-radius: 16px; padding: 20px; }
    .chart-container { min-height: 220px; }
    .chart-bars { display: flex; flex-direction: column; gap: 16px; }
    .chart-bar { width: 100%; }
    .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-label { font-weight: 500; color: #4B5563; }
    .bar-value { color: #6B7280; }
    .bar-container { width: 100%; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .mouvements-list { display: flex; flex-direction: column; gap: 12px; }
    .mouvement-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #F9FAFB; border-radius: 10px; transition: all 0.2s; }
    .mouvement-item:hover { background: #FEF3F9; transform: translateX(4px); }
    .mouvement-icon { font-size: 24px; width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .mouvement-icon.entree { color: #10B981; }
    .mouvement-icon.sortie { color: #EF4444; }
    .mouvement-info { flex: 1; }
    .mouvement-ref { font-weight: 600; font-size: 12px; color: #1F2937; font-family: monospace; }
    .mouvement-article { font-size: 13px; color: #4B5563; }
    .mouvement-date { font-size: 10px; color: #9CA3AF; }
    .mouvement-quantite { font-size: 14px; font-weight: 600; }
    .mouvement-quantite.entree { color: #10B981; }
    .mouvement-quantite.sortie { color: #EF4444; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; text-align: center; gap: 8px; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    
    .alerts-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .btn-link { color: #EC4899; text-decoration: none; font-size: 13px; font-weight: 500; }
    .btn-link:hover { text-decoration: underline; }
    .alerts-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F9FAFB; border-radius: 12px; border-left: 4px solid transparent; }
    .alert-card.critique { border-left-color: #EF4444; background: #FEF2F2; }
    .alert-card.bas { border-left-color: #F59E0B; background: #FEF3C7; }
    .alert-icon { font-size: 24px; }
    .alert-info { flex: 1; }
    .alert-article { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .alert-details { font-size: 12px; color: #6B7280; }
    .alert-details strong { color: #EF4444; }
    .btn-reappro { background: #EC4899; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .btn-reappro:hover { background: #DB2777; transform: translateY(-1px); }
    
    .top-fournisseurs-section { background: white; border-radius: 16px; padding: 20px; }
    .fournisseurs-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .fournisseur-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .fournisseur-rank { width: 28px; height: 28px; background: #FDF2F8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #EC4899; }
    .fournisseur-name { flex: 1; font-weight: 500; color: #1F2937; }
    .fournisseur-value { font-size: 14px; font-weight: 600; color: #EC4899; min-width: 100px; text-align: right; }
    .fournisseur-bar { width: 120px; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .fournisseur-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    
    .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; border: 2px dashed #FCE7F3; }
    
    @media (max-width: 1024px) {
      .action-buttons { grid-template-columns: repeat(2, 1fr); }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    
    @media (max-width: 640px) {
      .action-buttons { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StockDashboard implements OnInit {
  today = new Date();
  
  totalArticles = 0;
  totalCategories = 0;
  totalMouvements = 0;
  totalFournisseurs = 0;
  
  articles: Article[] = [];
  categories: any[] = [];
  mouvements: MouvementStock[] = [];
  fournisseurs: any[] = [];
  
  categoriesData: any[] = [];
  mouvementsRecents: any[] = [];
  alertesStock: any[] = [];
  topFournisseurs: any[] = [];
  maxAchats = 0;
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.loadArticles();
    this.loadCategories();
    this.loadMouvements();
    this.loadFournisseurs();
  }
  
  loadArticles() {
    const saved = localStorage.getItem('articles');
    this.articles = saved ? JSON.parse(saved) : [];
    this.totalArticles = this.articles.length;
    
    // Alertes stock
    this.alertesStock = this.articles
      .filter(a => a.stock_actuel <= a.stock_minimum)
      .sort((a, b) => (a.stock_actuel / a.stock_minimum) - (b.stock_actuel / b.stock_minimum))
      .slice(0, 5);
    
    // Données pour graphique par catégorie
    const categorieMap = new Map<string, number>();
    this.articles.forEach(a => {
      const current = categorieMap.get(a.categorie) || 0;
      categorieMap.set(a.categorie, current + a.stock_actuel);
    });
    
    const couleurs = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    let i = 0;
    this.categoriesData = Array.from(categorieMap.entries()).map(([nom, valeur]) => ({
      nom,
      valeur,
      pourcentage: this.totalArticles > 0 ? (valeur / this.totalArticles) * 100 : 0,
      couleur: couleurs[i++ % couleurs.length]
    })).sort((a, b) => b.valeur - a.valeur).slice(0, 5);
  }
  
  getArticlesActifs(): number {
    return this.articles.filter(a => a.statut === 'actif').length;
  }
  
  loadCategories() {
    const saved = localStorage.getItem('categories');
    this.categories = saved ? JSON.parse(saved) : [];
    this.totalCategories = this.categories.length;
  }
  
  getCategoriesActives(): number {
    return this.categories.filter((c: any) => c.statut === 'actif').length;
  }
  
  loadMouvements() {
    const saved = localStorage.getItem('mouvements_stock');
    this.mouvements = saved ? JSON.parse(saved) : [];
    this.totalMouvements = this.mouvements.length;
    
    this.mouvementsRecents = this.mouvements
      .sort((a, b) => new Date(b.date_mouvement).getTime() - new Date(a.date_mouvement).getTime())
      .slice(0, 5);
  }
  
  getMouvementsMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    return this.mouvements.filter(m => {
      const date = new Date(m.date_mouvement);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }
  
  loadFournisseurs() {
    const saved = localStorage.getItem('fournisseurs');
    this.fournisseurs = saved ? JSON.parse(saved) : [];
    this.totalFournisseurs = this.fournisseurs.length;
    
    this.topFournisseurs = this.fournisseurs
      .sort((a, b) => (b.totalAchats || 0) - (a.totalAchats || 0))
      .slice(0, 5);
    
    this.maxAchats = this.topFournisseurs[0]?.totalAchats || 0;
  }
  
  getFournisseursActifs(): number {
    return this.fournisseurs.filter((f: any) => f.statut === 'actif').length;
  }
  
  reapprovisionner(article: any) {
    alert(`Réapprovisionnement de ${article.nom} - Fonctionnalité à venir`);
  }
}