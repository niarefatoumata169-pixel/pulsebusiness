import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-transport-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard Transport</h1>
      
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">🚗</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats.vehicules }}</span>
            <span class="kpi-label">Véhicules</span>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">👨‍✈️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats.chauffeurs }}</span>
            <span class="kpi-label">Chauffeurs</span>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">📍</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats.trajets }}</span>
            <span class="kpi-label">Trajets</span>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">⛽</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats.carburant | number }} L</span>
            <span class="kpi-label">Carburant</span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/transport/vehicules" class="action-card">
          <span class="action-icon">🚗</span>
          <span class="action-label">Gérer les véhicules</span>
        </a>
        <a routerLink="/transport/chauffeurs" class="action-card">
          <span class="action-icon">👨‍✈️</span>
          <span class="action-label">Gérer les chauffeurs</span>
        </a>
        <a routerLink="/transport/trajets" class="action-card">
          <span class="action-icon">📍</span>
          <span class="action-label">Gérer les trajets</span>
        </a>
        <a routerLink="/transport/maintenance" class="action-card">
          <span class="action-icon">🔧</span>
          <span class="action-label">Maintenance</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; }
    h1 { color: #1F2937; margin-bottom: 24px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      gap: 16px;
      border: 1px solid #FCE7F3;
    }
    .kpi-icon {
      font-size: 32px;
      background: #FDF2F8;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #EC4899;
    }
    .kpi-value {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: #1F2937;
    }
    .kpi-label { color: #6B7280; font-size: 14px; }
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .action-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      text-decoration: none;
      border: 1px solid #FCE7F3;
      transition: all 0.2s;
    }
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(236,72,153,0.1);
    }
    .action-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .action-label { color: #EC4899; font-weight: 600; }
  `]
})
export class TransportDashboard implements OnInit {
  stats = { vehicules: 0, chauffeurs: 0, trajets: 0, carburant: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  async loadStats() {
    // À implémenter avec les vraies données
  }
}
