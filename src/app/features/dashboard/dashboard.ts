import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- HEADER - avec nom dynamique -->
      <div class="header">
        <div class="header-left">
          <h1>Bonjour, <span class="client-name">{{ clientName || 'Client' }}</span> 👋</h1>
          <p class="date">{{ today | date:'EEEE dd MMMM yyyy' }}</p>
        </div>

        <div class="header-right">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher... (Ctrl+K)"
              [(ngModel)]="searchTerm"
              (keyup)="onSearch()"
            >
          </div>
          <button class="icon-btn" (click)="refresh()">↻</button>
          <button class="icon-btn notif">
            🔔
            <span class="notif-badge">{{ notifications }}</span>
          </button>
          <div class="user-avatar">{{ userInitials }}</div>
        </div>
      </div>

      <!-- FILTRES ET PERSONNALISATION -->
      <div class="dashboard-toolbar">
        <button class="customize-btn" (click)="customizeDashboard()">
          ⚙️ Personnaliser le dashboard
        </button>
        <div class="period-filters">
          <button 
            class="period-btn" 
            [class.active]="period === 'jour'"
            (click)="changePeriod('jour')"
          >Aujourd'hui</button>
          <button 
            class="period-btn" 
            [class.active]="period === 'semaine'"
            (click)="changePeriod('semaine')"
          >Cette semaine</button>
          <button 
            class="period-btn" 
            [class.active]="period === 'mois'"
            (click)="changePeriod('mois')"
          >Ce mois</button>
          <button 
            class="period-btn" 
            [class.active]="period === 'annee'"
            (click)="changePeriod('annee')"
          >Cette année</button>
        </div>
      </div>

      <!-- INDICATEUR DE DONNÉES -->
      <div class="data-indicator">
        <span class="indicator-dot"></span>
        <span class="indicator-text">
          {{ dataStatus }}
        </span>
      </div>

      <!-- KPI CARDS - vides, prêts à être remplis -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Chiffre d'Affaires</div>
          <div class="kpi-value">{{ formatValue(stats.ca) }}</div>
          <div class="kpi-footer">vs période précédente</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Dépenses</div>
          <div class="kpi-value">{{ formatValue(stats.depenses) }}</div>
          <div class="kpi-footer">Achats validés</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Marge Nette</div>
          <div class="kpi-value">{{ formatValue(stats.marge) }}</div>
          <div class="kpi-footer">CA - Dépenses</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Impayés</div>
          <div class="kpi-value">{{ formatValue(stats.impayes) }}</div>
          <div class="kpi-footer">À recouvrer</div>
        </div>
      </div>

      <!-- GRAPHIQUES - sans emoji -->
      <div class="charts-grid">
        <!-- Graphique évolution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Évolution financière</h3>
            <div class="chart-legend">
              <span><span class="dot" style="background: #10B981"></span> Revenus</span>
              <span><span class="dot" style="background: #EC4899"></span> Dépenses</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <p>Les graphiques apparaîtront ici</p>
              <small>après l'ajout de vos premières données</small>
            </div>
          </div>
        </div>

        <!-- Graphique répartition - SANS EMOJI 🥧 -->
        <div class="chart-card">
          <h3>Répartition des revenus</h3>
          <div class="chart-container small">
            <div class="chart-placeholder">
              <p>Données à venir</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FIL D'ACTIVITÉ -->
      <div class="activity-card">
        <div class="activity-header">
          <h3>📋 Fil d'activité</h3>
        </div>
        <div class="activity-list">
          <div class="empty-activities">
            <p>Aucune activité pour le moment</p>
            <small>Les actions récentes apparaîtront ici</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ===== HEADER ===== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #1F2937;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .client-name {
      color: #EC4899;
    }

    .date {
      color: #6B7280;
      font-size: 14px;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .search-box {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9CA3AF;
    }

    .search-box input {
      padding: 10px 10px 10px 35px;
      border: 2px solid #FCE7F3;
      border-radius: 30px;
      width: 250px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: #EC4899;
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #FDF2F8;
    }

    .notif-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #EC4899;
      color: white;
      font-size: 10px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #EC4899;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    /* ===== FILTRES ET PERSONNALISATION ===== */
    .dashboard-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .customize-btn {
      background: white;
      border: 2px solid #FCE7F3;
      padding: 8px 16px;
      border-radius: 30px;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .customize-btn:hover {
      border-color: #EC4899;
      color: #EC4899;
      background: #FDF2F8;
    }

    .period-filters {
      display: flex;
      gap: 10px;
    }

    .period-btn {
      padding: 8px 16px;
      border: none;
      background: none;
      border-radius: 30px;
      cursor: pointer;
      color: #6B7280;
      transition: all 0.2s;
      font-size: 14px;
    }

    .period-btn:hover {
      background: #FDF2F8;
      color: #EC4899;
    }

    .period-btn.active {
      background: #EC4899;
      color: white;
    }

    /* ===== INDICATEUR ===== */
    .data-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #FDF2F8;
      border-radius: 8px;
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
    }

    .indicator-text {
      color: #4B5563;
      font-size: 13px;
    }

    /* ===== KPI CARDS ===== */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.2s;
    }

    .kpi-card:hover {
      box-shadow: 0 10px 25px rgba(236,72,153,0.1);
      transform: translateY(-2px);
    }

    .kpi-title {
      color: #6B7280;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 8px;
    }

    .kpi-footer {
      color: #9CA3AF;
      font-size: 12px;
    }

    /* ===== GRAPHIQUES - VERSION SIMPLE ===== */
    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 16px;
      padding: 20px;
    }

    .chart-card h3 {
      color: #1F2937;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-legend {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #6B7280;
    }

    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
    }

    .chart-container {
      height: 250px;
    }

    .chart-container.small {
      height: 200px;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #F9FAFB;
      border-radius: 8px;
      color: #9CA3AF;
      text-align: center;
    }

    .chart-placeholder p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .chart-placeholder small {
      font-size: 12px;
    }

    /* ===== FIL D'ACTIVITÉ ===== */
    .activity-card {
      background: white;
      border: 1px solid #FCE7F3;
      border-radius: 16px;
      padding: 20px;
    }

    .activity-header {
      margin-bottom: 16px;
    }

    .activity-header h3 {
      color: #1F2937;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .empty-activities {
      text-align: center;
      padding: 40px;
      background: #F9FAFB;
      border-radius: 8px;
    }

    .empty-activities p {
      color: #6B7280;
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .empty-activities small {
      color: #9CA3AF;
      font-size: 12px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      .dashboard-toolbar {
        flex-direction: column;
        gap: 10px;
      }
      .period-filters {
        flex-wrap: wrap;
      }
    }
  `]
})
export class Dashboard implements OnInit {
  // Variables dynamiques (seront remplies par l'API)
  clientName = '';
  userInitials = 'CL';
  notifications = 0;
  
  // Données (vides par défaut)
  stats = {
    ca: null,
    depenses: null,
    marge: null,
    impayes: null
  };

  // État
  today = new Date();
  period = 'mois';
  searchTerm = '';
  dataStatus = 'Données clients à venir - Commencez par ajouter vos premières informations';

  ngOnInit() {
    this.loadUserData();
    // Ici vous ferez l'appel API pour charger les vraies données
    // this.loadDashboardData();
  }

  loadUserData() {
    try {
      const userJson = localStorage.getItem('user_data');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.clientName = user.prenom || user.nom || 'Client';
        
        // Générer les initiales
        if (user.prenom && user.nom) {
          this.userInitials = (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase();
        } else if (user.prenom) {
          this.userInitials = user.prenom.charAt(0).toUpperCase();
        } else if (user.nom) {
          this.userInitials = user.nom.charAt(0).toUpperCase();
        } else if (user.email) {
          this.userInitials = user.email.charAt(0).toUpperCase();
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur', error);
    }
  }

  formatValue(value: any): string {
    return value === null || value === undefined ? '—' : value.toString();
  }

  changePeriod(p: string) {
    this.period = p;
    console.log('Période changée:', p);
    // Ici vous rechargerez les données pour la période
  }

  onSearch() {
    if (this.searchTerm.length > 2) {
      console.log('Recherche:', this.searchTerm);
    }
  }

  refresh() {
    console.log('Rafraîchissement...');
    // Ici vous rechargerez les données
  }

  customizeDashboard() {
    console.log('Personnalisation du dashboard');
    alert('Fonctionnalité de personnalisation à venir !');
  }
}
