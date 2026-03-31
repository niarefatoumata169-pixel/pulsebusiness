import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>🏛️ Administration</h1>
        <p class="subtitle">Gestion de la structure organisationnelle</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">🏢</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ entitesCount }}</span>
            <span class="kpi-label">Entités</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📂</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ departementsCount }}</span>
            <span class="kpi-label">Départements</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🏭</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ filialesCount }}</span>
            <span class="kpi-label">Filiales</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">👔</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ postesCount }}</span>
            <span class="kpi-label">Postes</span>
          </div>
        </div>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/administration/entites">
          <div class="action-icon">🏢</div>
          <h3>Entités</h3>
          <p>Gérer les entités de l'organisation</p>
          <span class="action-badge">{{ entitesCount }}</span>
        </div>
        <div class="action-card" routerLink="/administration/departements">
          <div class="action-icon">📂</div>
          <h3>Départements</h3>
          <p>Gérer les départements</p>
          <span class="action-badge">{{ departementsCount }}</span>
        </div>
        <div class="action-card" routerLink="/administration/filiales">
          <div class="action-icon">🏭</div>
          <h3>Filiales</h3>
          <p>Gérer les filiales</p>
          <span class="action-badge">{{ filialesCount }}</span>
        </div>
        <div class="action-card" routerLink="/administration/postes">
          <div class="action-icon">👔</div>
          <h3>Postes</h3>
          <p>Gérer les postes et fonctions</p>
          <span class="action-badge">{{ postesCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 32px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin-top: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 28px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 14px; color: #6B7280; }
    .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .action-card { background: white; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s; border: 1px solid #F3F4F6; position: relative; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: #FCE7F3; }
    .action-icon { font-size: 48px; margin-bottom: 16px; }
    .action-card h3 { margin: 0 0 8px; font-size: 20px; color: #1F2937; }
    .action-card p { margin: 0 0 16px; color: #6B7280; font-size: 14px; }
    .action-badge { background: #FEF3F9; color: #EC4899; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; display: inline-block; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .actions-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboard implements OnInit {
  entitesCount = 0;
  departementsCount = 0;
  filialesCount = 0;
  postesCount = 0;

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    const entites = localStorage.getItem('entites');
    this.entitesCount = entites ? JSON.parse(entites).length : 0;
    const departements = localStorage.getItem('departements');
    this.departementsCount = departements ? JSON.parse(departements).length : 0;
    const filiales = localStorage.getItem('filiales');
    this.filialesCount = filiales ? JSON.parse(filiales).length : 0;
    const postes = localStorage.getItem('postes');
    this.postesCount = postes ? JSON.parse(postes).length : 0;
  }
}