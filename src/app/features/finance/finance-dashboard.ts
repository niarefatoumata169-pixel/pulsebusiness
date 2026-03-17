import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête -->
      <div class="header">
        <div>
          <h1>Dashboard Finance</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
      </div>

      <!-- KPIs vides -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">0 FCFA</span>
            <span class="kpi-label">Trésorerie</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">0 FCFA</span>
            <span class="kpi-label">Créances</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💳</div>
          <div class="kpi-content">
            <span class="kpi-value">0 FCFA</span>
            <span class="kpi-label">Dettes</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <span class="kpi-value">0%</span>
            <span class="kpi-label">Marge</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/finance/recouvrement" class="action-btn">
            <span class="action-icon">💰</span> Recouvrement
          </a>
          <a routerLink="/finance/tresorerie/nouveau" class="action-btn">
            <span class="action-icon">💳</span> Nouveau mouvement
          </a>
          <a routerLink="/finance/banque/nouveau" class="action-btn">
            <span class="action-icon">🏦</span> Nouveau compte
          </a>
          <a routerLink="/finance/caisse/nouveau" class="action-btn">
            <span class="action-icon">💵</span> Nouvelle caisse
          </a>
        </div>
      </div>

      <!-- Graphiques vides -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>Évolution trésorerie</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <small>Les graphiques apparaîtront quand vous aurez des données</small>
          </div>
        </div>
        <div class="chart-card">
          <h3>Répartition des flux</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <small>Les graphiques apparaîtront quand vous aurez des données</small>
          </div>
        </div>
      </div>

      <!-- Derniers mouvements (vides) -->
      <div class="recent-section">
        <h3>Derniers mouvements</h3>
        <div class="empty-state">
          <p>Aucun mouvement enregistré</p>
          <button class="btn-primary" routerLink="/finance/tresorerie/nouveau">
            + Ajouter un mouvement
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0 0 8px; }
    .date { color: #6B7280; font-size: 14px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; display: flex; gap: 16px; border: 1px solid #FCE7F3; }
    .kpi-icon { font-size: 32px; background: #FDF2F8; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #EC4899; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #1F2937; }
    .kpi-label { color: #6B7280; font-size: 13px; }
    
    .quick-actions { background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #FCE7F3; }
    h2, h3 { color: #1F2937; margin: 0 0 15px; font-size: 18px; }
    .action-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .action-btn { background: #FDF2F8; padding: 15px; border-radius: 8px; text-decoration: none; color: #1F2937; display: flex; align-items: center; gap: 10px; }
    .action-btn:hover { background: #FCE7F3; }
    .action-icon { font-size: 24px; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .chart-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 8px; color: #9CA3AF; text-align: center; }
    
    .recent-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 8px; color: #9CA3AF; border: 2px dashed #FCE7F3; }
    .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px; text-decoration: none; display: inline-block; }
  `]
})
export class FinanceDashboard {
  today = new Date();
}
