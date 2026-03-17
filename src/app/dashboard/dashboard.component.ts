import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Tableau de bord</h1>
      
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">0 FCFA</div>
          <div class="kpi-label">Chiffre d'affaires</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">0</div>
          <div class="kpi-label">Clients</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">0</div>
          <div class="kpi-label">Factures</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">0 FCFA</div>
          <div class="kpi-label">Impayés</div>
        </div>
      </div>

      <div class="welcome">
        <h2>Bienvenue sur PulseBusiness</h2>
        <p>Commencez par ajouter vos premiers clients et factures.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
    }
    h1 {
      color: #1F2937;
      margin-bottom: 24px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: #EC4899;
      margin-bottom: 4px;
    }
    .kpi-label {
      color: #6B7280;
    }
    .welcome {
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
    }
    h2 {
      color: #1F2937;
      margin-bottom: 16px;
    }
    p {
      color: #6B7280;
    }
  `]
})
export class DashboardComponent {}