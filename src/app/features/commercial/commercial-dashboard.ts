import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-commercial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="commercial-dashboard">
      <!-- En-tête avec date -->
      <div class="header">
        <div>
          <h1>Dashboard Commercial</h1>
          <p class="date">{{ today | date:'EEEE dd MMMM yyyy' }}</p>
        </div>
      </div>

      <!-- Cartes KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">0 FCFA</span>
            <span class="kpi-label">Chiffre d'affaires</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">📄</div>
          <div class="kpi-content">
            <span class="kpi-value">0</span>
            <span class="kpi-label">Devis en cours</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">0%</span>
            <span class="kpi-label">Taux de conversion</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">0</span>
            <span class="kpi-label">Clients actifs</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <button class="action-btn" routerLink="/commercial/devis/nouveau">
            <span class="action-icon">📄</span>
            <span class="action-label">Nouveau devis</span>
          </button>
          <button class="action-btn" routerLink="/commercial/ventes/nouvelle">
            <span class="action-icon">💰</span>
            <span class="action-label">Nouvelle vente</span>
          </button>
          <button class="action-btn" routerLink="/commercial/contrats/nouveau">
            <span class="action-icon">📝</span>
            <span class="action-label">Nouveau contrat</span>
          </button>
          <button class="action-btn" routerLink="/commercial/recouvrement">
            <span class="action-icon">💳</span>
            <span class="action-label">Recouvrement</span>
          </button>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Évolution des ventes</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <span class="empty-sub">Les graphiques apparaîtront quand vous aurez des données</span>
          </div>
        </div>

        <div class="chart-card">
          <h3>Répartition par client</h3>
          <div class="empty-chart">
            <p>Aucune donnée disponible</p>
            <span class="empty-sub">Les graphiques apparaîtront quand vous aurez des données</span>
          </div>
        </div>
      </div>

      <!-- Deux colonnes -->
      <div class="two-columns">
        <!-- Devis récents -->
        <div class="card">
          <div class="card-header">
            <h3>Devis récents</h3>
            <a routerLink="/commercial/devis" class="view-link">Voir tout →</a>
          </div>
          <div class="empty-list">
            <p>Aucun devis récent</p>
            <button class="btn-add" routerLink="/commercial/devis/nouveau">
              + Créer un devis
            </button>
          </div>
        </div>

        <!-- Dernières ventes -->
        <div class="card">
          <div class="card-header">
            <h3>Dernières ventes</h3>
            <a routerLink="/commercial/ventes" class="view-link">Voir tout →</a>
          </div>
          <div class="empty-list">
            <p>Aucune vente récente</p>
            <button class="btn-add" routerLink="/commercial/ventes/nouvelle">
              + Nouvelle vente
            </button>
          </div>
        </div>
      </div>

      <!-- Pipeline des opportunités -->
      <div class="pipeline-card">
        <div class="card-header">
          <h3>Pipeline des opportunités</h3>
          <a routerLink="/commercial/opportunites" class="view-link">Gérer →</a>
        </div>
        
        <div class="pipeline-empty">
          <p>Aucune opportunité en cours</p>
          <button class="btn-add" routerLink="/commercial/opportunites/nouvelle">
            + Ajouter une opportunité
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .commercial-dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    h1 {
      color: #1F2937;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .date {
      color: #6B7280;
      font-size: 14px;
      margin: 0;
      text-transform: capitalize;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #FCE7F3;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .kpi-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      background: #FDF2F8;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-value {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: #1F2937;
    }

    .kpi-label {
      font-size: 13px;
      color: #6B7280;
    }

    /* Quick Actions */
    .quick-actions {
      margin-bottom: 40px;
    }

    .quick-actions h2 {
      color: #1F2937;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }

    .action-btn {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 10px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #4B5563;
      text-decoration: none;
    }

    .action-btn:hover {
      border-color: #EC4899;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(236,72,153,0.1);
    }

    .action-icon {
      font-size: 24px;
    }

    .action-label {
      font-size: 13px;
      font-weight: 500;
    }

    /* Charts */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 12px;
      padding: 20px;
    }

    .chart-card h3 {
      color: #1F2937;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    .empty-chart {
      text-align: center;
      padding: 40px 20px;
      background: #F9FAFB;
      border-radius: 8px;
    }

    .empty-chart p {
      color: #1F2937;
      font-size: 14px;
      margin: 0 0 8px 0;
    }

    .empty-sub {
      color: #9CA3AF;
      font-size: 12px;
    }

    /* Two columns */
    .two-columns {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 12px;
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h3 {
      color: #1F2937;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .view-link {
      color: #EC4899;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }

    .empty-list {
      text-align: center;
      padding: 30px;
      background: #F9FAFB;
      border-radius: 8px;
    }

    .empty-list p {
      color: #1F2937;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .btn-add {
      background: #EC4899;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    /* Pipeline */
    .pipeline-card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 12px;
      padding: 20px;
    }

    .pipeline-empty {
      text-align: center;
      padding: 40px;
      background: #F9FAFB;
      border-radius: 8px;
    }

    .pipeline-empty p {
      color: #1F2937;
      font-size: 14px;
      margin-bottom: 15px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .two-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CommercialDashboard implements OnInit {
  today = new Date();

  constructor() {}

  ngOnInit() {
    // Ici vous chargerez vos données depuis l'API
    // this.loadData();
  }

  // async loadData() {
  //   const data = await this.api.getCommercialData();
  //   // Mettre à jour les KPI avec les vraies données
  // }
}
