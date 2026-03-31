import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="stock-container">
      <div class="header">
        <h1>Gestion des stocks</h1>
        <p class="subtitle">Module de gestion des mouvements de stock</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>Articles en stock</h3>
            <p class="stat-value">{{ getTotalArticles() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📥</div>
          <div class="stat-info">
            <h3>Entrées (mois)</h3>
            <p class="stat-value">{{ getEntreesMois() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📤</div>
          <div class="stat-info">
            <h3>Sorties (mois)</h3>
            <p class="stat-value">{{ getSortiesMois() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>Stock bas</h3>
            <p class="stat-value">{{ getStockBas() }}</p>
          </div>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn-add" (click)="openMouvement()">+ Nouveau mouvement</button>
        <button class="btn-secondary" (click)="openInventaire()">📊 Inventaire</button>
      </div>

      <div class="tabs">
        <button [class.active]="activeTab === 'articles'" (click)="activeTab = 'articles'">Articles</button>
        <button [class.active]="activeTab === 'mouvements'" (click)="activeTab = 'mouvements'">Mouvements</button>
        <button [class.active]="activeTab === 'alertes'" (click)="activeTab = 'alertes'">Alertes stock</button>
      </div>

      <!-- Articles -->
      <div *ngIf="activeTab === 'articles'" class="tab-content">
        <div class="articles-grid" *ngIf="articles.length > 0; else emptyArticles">
          <div class="article-card" *ngFor="let a of articles">
            <div class="article-header">
              <span class="article-ref">{{ a.reference }}</span>
              <span class="article-statut" [class]="a.statut">{{ getStatutLabel(a.statut) }}</span>
            </div>
            <h3 class="article-nom">{{ a.nom }}</h3>
            <div class="article-details">
              <div class="detail">
                <span class="label">Stock:</span>
                <span class="value" [class.low]="a.stock_actuel <= a.stock_minimum">
                  {{ a.stock_actuel }} {{ a.unite }}
                </span>
              </div>
              <div class="detail">
                <span class="label">Min:</span>
                <span class="value">{{ a.stock_minimum }} {{ a.unite }}</span>
              </div>
              <div class="detail">
                <span class="label">Prix vente:</span>
                <span class="value">{{ a.prix_vente_ht | number }} FCFA</span>
              </div>
            </div>
            <div class="article-footer">
              <button class="btn-icon" (click)="editArticle(a)">✏️</button>
              <button class="btn-icon" (click)="voirMouvements(a)">📊</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mouvements -->
      <div *ngIf="activeTab === 'mouvements'" class="tab-content">
        <div class="mouvements-list" *ngIf="mouvements.length > 0; else emptyMouvements">
          <table class="mouvements-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Article</th>
                <th>Quantité</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of mouvements.slice(0, 20)">
                <td>{{ m.date_mouvement | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="type-badge" [class]="m.type">
                    {{ m.type === 'entree' ? '📥 Entrée' : m.type === 'sortie' ? '📤 Sortie' : '🔄 Transfert' }}
                  </span>
                </td>
                <td>{{ m.article_nom }}</td>
                <td [class.entree]="m.type === 'entree'" [class.sortie]="m.type === 'sortie'">
                  {{ m.quantite }} {{ m.article_unite }}
                </td>
                <td>{{ m.motif }}</td>
                <td>
                  <span class="statut-badge" [class]="m.statut">
                    {{ m.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alertes stock -->
      <div *ngIf="activeTab === 'alertes'" class="tab-content">
        <div class="alertes-list" *ngIf="alertesStock.length > 0; else noAlertes">
          <div class="alerte-card" *ngFor="let a of alertesStock">
            <div class="alerte-icon">⚠️</div>
            <div class="alerte-info">
              <h4>{{ a.nom }}</h4>
              <p>Stock actuel: {{ a.stock_actuel }} {{ a.unite }} (minimum: {{ a.stock_minimum }} {{ a.unite }})</p>
            </div>
            <button class="btn-small" (click)="reapprovisionner(a)">Réapprovisionner</button>
          </div>
        </div>
      </div>

      <ng-template #emptyArticles>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Aucun article</h3>
          <p>Commencez par ajouter des articles au stock</p>
          <button class="btn-primary" routerLink="/articles">+ Ajouter un article</button>
        </div>
      </ng-template>

      <ng-template #emptyMouvements>
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>Aucun mouvement</h3>
          <p>Enregistrez les entrées et sorties de stock</p>
          <button class="btn-primary" (click)="openMouvement()">+ Nouveau mouvement</button>
        </div>
      </ng-template>

      <ng-template #noAlertes>
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>Aucune alerte</h3>
          <p>Tous les stocks sont à des niveaux corrects</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .stock-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin: 8px 0 0 0; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #FCE7F3; }
    .stat-icon { font-size: 32px; }
    .stat-info h3 { margin: 0 0 4px 0; font-size: 14px; color: #6B7280; }
    .stat-value { margin: 0; font-size: 24px; font-weight: 600; color: #EC4899; }
    
    .actions-bar { display: flex; gap: 12px; margin-bottom: 24px; }
    .btn-add { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-secondary { background: white; border: 2px solid #FCE7F3; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    .btn-small { background: #EC4899; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    
    .tabs { display: flex; gap: 8px; border-bottom: 2px solid #FCE7F3; margin-bottom: 24px; }
    .tabs button { background: none; border: none; padding: 10px 20px; cursor: pointer; color: #6B7280; font-size: 14px; }
    .tabs button.active { color: #EC4899; border-bottom: 2px solid #EC4899; margin-bottom: -2px; }
    
    .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .article-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .article-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .article-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .article-statut { font-size: 10px; padding: 2px 8px; border-radius: 4px; }
    .article-statut.actif { background: #DCFCE7; color: #16A34A; }
    .article-statut.rupture { background: #FEE2E2; color: #EF4444; }
    .article-nom { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
    .article-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .detail .label { font-size: 11px; color: #9CA3AF; }
    .detail .value { font-size: 14px; font-weight: 500; display: block; }
    .detail .value.low { color: #EF4444; }
    .article-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid #FCE7F3; }
    
    .mouvements-list { overflow-x: auto; }
    .mouvements-table { width: 100%; background: white; border-radius: 12px; border-collapse: collapse; }
    .mouvements-table th, .mouvements-table td { padding: 12px; text-align: left; border-bottom: 1px solid #F3F4F6; }
    .mouvements-table th { background: #F9FAFB; color: #4B5563; font-weight: 600; }
    .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; }
    .type-badge.entree { background: #DCFCE7; color: #16A34A; }
    .type-badge.sortie { background: #FEE2E2; color: #EF4444; }
    .type-badge.transfert { background: #E0E7FF; color: #4F46E5; }
    .statut-badge.brouillon { background: #F3F4F6; color: #6B7280; }
    .statut-badge.valide { background: #DCFCE7; color: #16A34A; }
    td.entree { color: #10B981; font-weight: 600; }
    td.sortie { color: #EF4444; font-weight: 600; }
    
    .alertes-list { display: flex; flex-direction: column; gap: 12px; }
    .alerte-card { background: #FEF2F2; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 4px solid #EF4444; }
    .alerte-icon { font-size: 24px; }
    .alerte-info { flex: 1; }
    .alerte-info h4 { margin: 0 0 4px 0; font-size: 14px; }
    .alerte-info p { margin: 0; font-size: 12px; color: #EF4444; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .btn-icon { background: none; border: 1px solid #FCE7F3; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .articles-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StockComponent implements OnInit {
  articles: any[] = [];
  mouvements: any[] = [];
  
  activeTab: string = 'articles';
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    const articlesSaved = localStorage.getItem('articles');
    this.articles = articlesSaved ? JSON.parse(articlesSaved) : [];
    
    const mouvementsSaved = localStorage.getItem('mouvements_stock');
    this.mouvements = mouvementsSaved ? JSON.parse(mouvementsSaved) : [];
  }
  
  getTotalArticles(): number {
    return this.articles.length;
  }
  
  getEntreesMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    
    return this.mouvements
      .filter(m => {
        const date = new Date(m.date_mouvement);
        return m.type === 'entree' && 
               m.statut === 'valide' &&
               date.getMonth() === moisActuel &&
               date.getFullYear() === anneeActuelle;
      })
      .reduce((sum, m) => sum + (m.prix_total || 0), 0);
  }
  
  getSortiesMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    
    return this.mouvements
      .filter(m => {
        const date = new Date(m.date_mouvement);
        return m.type === 'sortie' && 
               m.statut === 'valide' &&
               date.getMonth() === moisActuel &&
               date.getFullYear() === anneeActuelle;
      })
      .reduce((sum, m) => sum + (m.prix_total || 0), 0);
  }
  
  getStockBas(): number {
    return this.articles.filter(a => a.stock_actuel <= a.stock_minimum && a.statut !== 'rupture').length;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = { actif: 'Actif', rupture: 'Rupture', promotion: 'Promo', inactif: 'Inactif' };
    return labels[statut] || statut;
  }
  
  getAlertesStock(): any[] {
    return this.articles.filter(a => a.stock_actuel <= a.stock_minimum);
  }
  
  openMouvement() {
    console.log('Ouvrir formulaire mouvement');
  }
  
  openInventaire() {
    console.log('Ouvrir inventaire');
  }
  
  editArticle(article: any) {
    console.log('Modifier article', article);
  }
  
  voirMouvements(article: any) {
    console.log('Voir mouvements', article);
  }
  
  reapprovisionner(article: any) {
    console.log('Réapprovisionner', article);
  }
}