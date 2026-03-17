import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-production-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <div>
          <h1>Dashboard Production</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-content">
            <span class="kpi-value">0</span>
            <span class="kpi-label">Équipements</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">0</span>
            <span class="kpi-label">Plannings</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📋</div>
          <div class="kpi-content">
            <span class="kpi-value">0</span>
            <span class="kpi-label">Ordres</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">0%</span>
            <span class="kpi-label">Taux qualité</span>
          </div>
        </div>
      </div>
      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/production/equipements/nouveau" class="action-btn">
            <span class="action-icon">⚙️</span> Nouvel équipement
          </a>
          <a routerLink="/production/plannings/nouveau" class="action-btn">
            <span class="action-icon">📅</span> Nouveau planning
          </a>
          <a routerLink="/production/ordres/nouveau" class="action-btn">
            <span class="action-icon">📋</span> Nouvel ordre
          </a>
          <a routerLink="/production/qualite/nouveau" class="action-btn">
            <span class="action-icon">✅</span> Nouveau contrôle
          </a>
        </div>
      </div>
      <div class="charts-row">
        <div class="chart-card">
          <h3>Taux de production</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <small>Les graphiques apparaîtront quand vous aurez des données</small>
          </div>
        </div>
        <div class="chart-card">
          <h3>Efficacité équipements</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <small>Les graphiques apparaîtront quand vous aurez des données</small>
          </div>
        </div>
      </div>
      <div class="orders-section">
        <h3>Ordres en cours</h3>
        <div class="empty-state">
          <p>Aucun ordre de production</p>
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
    .orders-section { background: white; border-radius: 12px; padding: 20px; border: 1px solid #FCE7F3; }
    .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 8px; color: #9CA3AF; border: 2px dashed #FCE7F3; }
  `]
})
export class ProductionDashboard {
  today = new Date();
}
