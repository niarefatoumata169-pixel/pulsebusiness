import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Hero section avec bienvenue personnalisée -->
      <div class="hero">
        <div class="hero-content">
          <div class="greeting">
            <span class="wave">👋</span>
            <h1>Bonjour, <span class="highlight">{{ userName }}</span></h1>
            <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
          </div>
          <div class="hero-stats">
            <div class="stat-pill">
              <span class="pill-icon">⭐</span>
              <span>Pro Premium</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card ca">
          <div class="card-icon">💰</div>
          <div class="card-details">
            <span class="card-value">{{ chiffreAffaires | number }} <small>FCFA</small></span>
            <span class="card-label">Chiffre d'affaires</span>
            <span class="trend up">▲ +{{ getEvolutionCA() }}% vs mois dernier</span>
          </div>
        </div>
        <div class="kpi-card clients">
          <div class="card-icon">👥</div>
          <div class="card-details">
            <span class="card-value">{{ totalClients }}</span>
            <span class="card-label">Clients actifs</span>
            <span class="trend up">+{{ getNouveauxClientsMois() }} ce mois</span>
          </div>
        </div>
        <div class="kpi-card factures">
          <div class="card-icon">📄</div>
          <div class="card-details">
            <span class="card-value">{{ totalFactures }}</span>
            <span class="card-label">Factures</span>
            <span class="trend">{{ getFacturesMois() }} ce mois</span>
          </div>
        </div>
        <div class="kpi-card impayes">
          <div class="card-icon">⚠️</div>
          <div class="card-details">
            <span class="card-value">{{ totalImpayes | number }} <small>FCFA</small></span>
            <span class="card-label">Impayés</span>
            <span class="trend down">{{ getTauxImpayes() }}% des ventes</span>
          </div>
        </div>
      </div>

      <!-- Graphiques et activités -->
      <div class="two-columns">
        <div class="glass-card chart-card">
          <div class="card-header">
            <h3>📈 Évolution des ventes</h3>
            <div class="legend">
              <span class="legend-dot" style="background:#EC4899"></span>
              <span>CA mensuel (FCFA)</span>
            </div>
          </div>
          <div class="chart-container" *ngIf="ventesParMois.length > 0; else emptyChart">
            <div class="chart-bars">
              <div class="bar-item" *ngFor="let v of ventesParMois; let i = index">
                <div class="bar-wrapper">
                  <div class="bar-fill" [style.height.%]="getPourcentage(v.montant, maxVente)"></div>
                  <span class="bar-label">{{ v.mois }}</span>
                </div>
                <span class="bar-value">{{ v.montant | number }}</span>
              </div>
            </div>
          </div>
          <ng-template #emptyChart>
            <div class="empty-state">
              <div class="empty-icon">📊</div>
              <p>Aucune vente enregistrée</p>
              <button class="btn-empty" routerLink="/factures/nouvelle">Créer une facture</button>
            </div>
          </ng-template>
        </div>

        <div class="glass-card activity-card">
          <div class="card-header">
            <h3>🔄 Activités récentes</h3>
            <span class="badge">{{ activitesRecentes.length }} nouveaux</span>
          </div>
          <div class="activity-timeline" *ngIf="activitesRecentes.length > 0; else emptyActivity">
            <div class="timeline-item" *ngFor="let a of activitesRecentes">
              <div class="timeline-icon" [class]="a.type">
                {{ a.type === 'facture' ? '📄' : a.type === 'client' ? '👤' : '💰' }}
              </div>
              <div class="timeline-content">
                <div class="timeline-title">{{ a.titre }}</div>
                <div class="timeline-date">{{ a.date | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>
          </div>
          <ng-template #emptyActivity>
            <div class="empty-state small">
              <div class="empty-icon">🔄</div>
              <p>En attente d'activité</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Alertes -->
      <div class="alert-section" *ngIf="alertes.length > 0">
        <div class="glass-card alert-card">
          <div class="card-header">
            <h3>⚠️ Alertes importantes</h3>
            <span class="badge danger">{{ alertes.length }}</span>
          </div>
          <div class="alert-list">
            <div class="alert-item" *ngFor="let a of alertes" [class]="a.type">
              <div class="alert-icon">{{ a.type === 'stock' ? '📦' : '📄' }}</div>
              <div class="alert-details">
                <div class="alert-title">{{ a.titre }}</div>
                <div class="alert-message">{{ a.message }}</div>
              </div>
              <button class="alert-action" (click)="a.action()">Voir</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Derniers clients & factures -->
      <div class="two-columns">
        <div class="glass-card clients-card">
          <div class="card-header">
            <h3>👥 Nouveaux clients</h3>
            <a routerLink="/clients" class="link-more">Voir tout →</a>
          </div>
          <div class="list-items" *ngIf="derniersClients.length > 0; else emptyClients">
            <div class="list-row" *ngFor="let c of derniersClients">
              <div class="avatar">{{ getInitials(c.nom) }}</div>
              <div class="list-info">
                <div class="list-name">{{ c.nom }} {{ c.prenom || '' }}</div>
                <div class="list-sub">{{ c.email }}</div>
              </div>
              <div class="list-date">{{ c.created_at | date:'dd/MM/yyyy' }}</div>
            </div>
          </div>
          <ng-template #emptyClients>
            <div class="empty-state small">
              <p>Aucun client pour le moment</p>
              <button class="btn-empty-small" routerLink="/clients/nouveau">+ Ajouter</button>
            </div>
          </ng-template>
        </div>

        <div class="glass-card factures-card">
          <div class="card-header">
            <h3>📄 Dernières factures</h3>
            <a routerLink="/factures" class="link-more">Voir tout →</a>
          </div>
          <div class="list-items" *ngIf="dernieresFactures.length > 0; else emptyFactures">
            <div class="list-row" *ngFor="let f of dernieresFactures">
              <div class="status-badge" [class]="f.statut">{{ f.statut === 'payee' ? '✅' : '⏳' }}</div>
              <div class="list-info">
                <div class="list-name">{{ f.reference }}</div>
                <div class="list-sub">{{ f.client_nom || 'Client inconnu' }}</div>
              </div>
              <div class="list-amount">{{ f.net_a_payer | number }} FCFA</div>
            </div>
          </div>
          <ng-template #emptyFactures>
            <div class="empty-state small">
              <p>Aucune facture</p>
              <button class="btn-empty-small" routerLink="/factures/nouvelle">+ Créer</button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Actions rapides (sans ⚡) -->
      <div class="quick-actions">
        <div class="glass-card">
          <div class="card-header">
            <h3>Actions rapides</h3>
          </div>
          <div class="action-grid">
            <a routerLink="/clients/nouveau" class="action-card">
              <div class="action-icon client">👤</div>
              <span>Nouveau client</span>
            </a>
            <a routerLink="/factures/nouvelle" class="action-card">
              <div class="action-icon facture">📄</div>
              <span>Nouvelle facture</span>
            </a>
            <a routerLink="/chantiers/nouveau" class="action-card">
              <div class="action-icon chantier">🏗️</div>
              <span>Nouveau chantier</span>
            </a>
            <a routerLink="/stock/articles/nouveau" class="action-card">
              <div class="action-icon stock">📦</div>
              <span>Nouvel article</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #EC4899;
      --primary-dark: #BE185D;
      --primary-light: #FCE7F3;
      --secondary: #F472B6;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --dark: #1F2937;
      --gray-100: #F3F4F6;
      --gray-500: #6B7280;
      --gray-700: #374151;
    }

    .dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #FEF3F9 0%, #F9FAFB 100%);
      min-height: 100vh;
    }

    .hero {
      margin-bottom: 32px;
    }
    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .greeting h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--dark), var(--gray-700));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .highlight {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .date {
      color: var(--gray-500);
      margin: 8px 0 0;
      font-size: 14px;
    }
    .wave {
      font-size: 32px;
      display: inline-block;
      animation: wave 1s ease-in-out;
    }
    @keyframes wave {
      0%,100%{ transform: rotate(0deg); }
      50%{ transform: rotate(20deg); }
    }
    .stat-pill {
      background: rgba(236,72,153,0.1);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary);
      border: 1px solid rgba(236,72,153,0.2);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: white;
      border-radius: 28px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.08);
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      animation: fadeUp 0.5s ease-out forwards;
      opacity: 0;
      transform: translateY(20px);
    }
    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }
    .kpi-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 25px 40px -12px rgba(0,0,0,0.15);
    }
    .card-icon {
      font-size: 44px;
      background: var(--primary-light);
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
    }
    .card-details {
      flex: 1;
    }
    .card-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--dark);
      display: block;
    }
    .card-value small {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-500);
    }
    .card-label {
      font-size: 14px;
      color: var(--gray-500);
      margin: 4px 0;
      display: block;
    }
    .trend {
      font-size: 12px;
      font-weight: 500;
    }
    .trend.up { color: var(--success); }
    .trend.down { color: var(--danger); }

    .two-columns {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }
    .glass-card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(2px);
      border-radius: 28px;
      padding: 24px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.03);
      border: 1px solid rgba(255,255,255,0.5);
      transition: all 0.2s;
    }
    .glass-card:hover {
      border-color: rgba(236,72,153,0.2);
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--dark);
    }
    .badge {
      background: var(--primary-light);
      padding: 4px 12px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
    }
    .badge.danger {
      background: #FEE2E2;
      color: var(--danger);
    }

    .chart-container {
      padding: 10px 0;
    }
    .chart-bars {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      gap: 12px;
      min-height: 220px;
    }
    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      animation: fadeUp 0.4s ease-out forwards;
      opacity: 0;
      transform: translateY(10px);
    }
    .bar-wrapper {
      width: 100%;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: var(--gray-100);
      border-radius: 16px;
      overflow: hidden;
    }
    .bar-fill {
      width: 100%;
      transition: height 0.6s cubic-bezier(0.4,0,0.2,1);
      border-radius: 16px;
      background: linear-gradient(180deg, var(--primary), var(--primary-dark));
    }
    .bar-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--gray-500);
    }
    .bar-value {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .timeline-item {
      display: flex;
      align-items: center;
      gap: 16px;
      animation: fadeUp 0.3s ease-out forwards;
      opacity: 0;
    }
    .timeline-icon {
      width: 44px;
      height: 44px;
      background: var(--primary-light);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .timeline-icon.client { background: #DBEAFE; }
    .timeline-icon.facture { background: #FFE4E6; }
    .timeline-icon.paiement { background: #DCFCE7; }
    .timeline-content {
      flex: 1;
    }
    .timeline-title {
      font-weight: 600;
      color: var(--dark);
    }
    .timeline-date {
      font-size: 11px;
      color: var(--gray-500);
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .alert-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: var(--gray-100);
      border-radius: 20px;
      transition: all 0.2s;
    }
    .alert-item.stock {
      background: #FEF3C7;
      border-left: 4px solid var(--warning);
    }
    .alert-item.facture {
      background: #FEE2E2;
      border-left: 4px solid var(--danger);
    }
    .alert-icon {
      font-size: 28px;
    }
    .alert-details {
      flex: 1;
    }
    .alert-title {
      font-weight: 600;
      color: var(--dark);
    }
    .alert-message {
      font-size: 12px;
      color: var(--gray-700);
    }
    .alert-action {
      background: white;
      border: none;
      padding: 6px 16px;
      border-radius: 40px;
      cursor: pointer;
      font-weight: 500;
      transition: 0.2s;
    }
    .alert-action:hover {
      background: var(--primary);
      color: white;
    }

    .list-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .list-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--gray-100);
    }
    .avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
    }
    .status-badge {
      font-size: 20px;
    }
    .list-info {
      flex: 1;
    }
    .list-name {
      font-weight: 500;
      color: var(--dark);
    }
    .list-sub {
      font-size: 11px;
      color: var(--gray-500);
    }
    .list-date {
      font-size: 12px;
      color: var(--gray-500);
    }
    .list-amount {
      font-weight: 700;
      color: var(--primary);
    }
    .link-more {
      color: var(--primary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }

    .quick-actions {
      margin-top: 16px;
    }
    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: white;
      border-radius: 24px;
      text-decoration: none;
      color: var(--dark);
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .action-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary-light);
      box-shadow: 0 12px 20px -12px rgba(0,0,0,0.1);
    }
    .action-icon {
      font-size: 32px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      background: var(--gray-100);
    }
    .action-icon.client { background: #DBEAFE; }
    .action-icon.facture { background: #FFE4E6; }
    .action-icon.chantier { background: #FEF3C7; }
    .action-icon.stock { background: #DCFCE7; }
    .action-card span {
      font-size: 13px;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--gray-500);
    }
    .empty-state.small {
      padding: 20px;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .btn-empty, .btn-empty-small {
      background: var(--primary);
      border: none;
      padding: 8px 20px;
      border-radius: 30px;
      color: white;
      cursor: pointer;
      margin-top: 12px;
      font-weight: 500;
    }
    .btn-empty-small {
      padding: 4px 12px;
      font-size: 12px;
    }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2,1fr); }
      .two-columns { grid-template-columns: 1fr; }
      .action-grid { grid-template-columns: repeat(2,1fr); }
    }
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .action-grid { grid-template-columns: 1fr; }
      .hero-content { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  userName = 'Utilisateur';

  chiffreAffaires = 0;
  totalClients = 0;
  totalFactures = 0;
  totalImpayes = 0;

  ventesParMois: any[] = [];
  activitesRecentes: any[] = [];
  alertes: any[] = [];
  derniersClients: any[] = [];
  dernieresFactures: any[] = [];

  maxVente = 0;

  ngOnInit() {
    this.loadUserName();
    this.loadData();
  }

  loadUserName() {
    // Récupère l'utilisateur depuis localStorage (user_data) ou extrait l'email du token
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.email) {
          this.userName = user.email.split('@')[0];
          return;
        }
      } catch(e) {}
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          this.userName = payload.email.split('@')[0];
          return;
        }
      } catch(e) {}
    }
    // Fallback
    this.userName = 'Utilisateur';
  }

  loadData() {
    this.loadClients();
    this.loadFactures();
    this.loadChiffreAffaires();
    this.loadVentesParMois();
    this.loadActivitesRecentes();
    this.loadAlertes();
  }

  loadClients() {
    const saved = localStorage.getItem('clients');
    const clients = saved ? JSON.parse(saved) : [];
    this.totalClients = clients.length;
    this.derniersClients = [...clients]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  loadFactures() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];
    this.totalFactures = factures.length;
    this.dernieresFactures = [...factures]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    this.totalImpayes = factures
      .filter((f: any) => f.statut !== 'payee')
      .reduce((sum: number, f: any) => sum + (f.net_a_payer || 0), 0);
  }

  loadChiffreAffaires() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];
    this.chiffreAffaires = factures
      .filter((f: any) => f.statut === 'payee')
      .reduce((sum: number, f: any) => sum + (f.net_a_payer || 0), 0);
  }

  loadVentesParMois() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];

    const moisMap = new Map<string, number>();
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    factures.forEach((f: any) => {
      if (f.statut === 'payee' && f.created_at) {
        const date = new Date(f.created_at);
        const mois = moisNoms[date.getMonth()];
        const current = moisMap.get(mois) || 0;
        moisMap.set(mois, current + (f.net_a_payer || 0));
      }
    });

    this.ventesParMois = Array.from(moisMap.entries()).map(([mois, montant]) => ({ mois, montant }));
    this.maxVente = Math.max(...this.ventesParMois.map(v => v.montant), 0);
  }

  loadActivitesRecentes() {
    this.activitesRecentes = [];

    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    clients.forEach((c: any) => {
      this.activitesRecentes.push({
        type: 'client',
        titre: `Nouveau client : ${c.nom} ${c.prenom || ''}`,
        date: c.created_at || new Date().toISOString()
      });
    });

    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    factures.forEach((f: any) => {
      this.activitesRecentes.push({
        type: 'facture',
        titre: `Facture ${f.reference} créée`,
        date: f.created_at || new Date().toISOString()
      });
    });

    this.activitesRecentes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.activitesRecentes = this.activitesRecentes.slice(0, 5);
  }

  loadAlertes() {
    this.alertes = [];

    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    if (articles.length > 0) {
      const stockBas = articles.filter((a: any) => a.stock_actuel <= a.stock_minimum);
      stockBas.slice(0, 2).forEach((a: any) => {
        this.alertes.push({
          type: 'stock',
          titre: 'Stock bas',
          message: `${a.nom} : ${a.stock_actuel} ${a.unite} restant(s) (min: ${a.stock_minimum})`,
          action: () => window.location.href = '/stock/articles'
        });
      });
    }

    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const impayees = factures.filter((f: any) => f.statut !== 'payee');
    if (impayees.length > 0) {
      this.alertes.push({
        type: 'facture',
        titre: 'Factures impayées',
        message: `${impayees.length} facture(s) en attente de paiement`,
        action: () => window.location.href = '/factures'
      });
    }
  }

  getEvolutionCA(): number {
    // Simule une évolution (à remplacer par un vrai calcul si vous voulez)
    return Math.floor(Math.random() * 20) + 5;
  }

  getNouveauxClientsMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    return clients.filter((c: any) => {
      if (!c.created_at) return false;
      const date = new Date(c.created_at);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }

  getFacturesMois(): number {
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    return factures.filter((f: any) => {
      if (!f.created_at) return false;
      const date = new Date(f.created_at);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }

  getTauxImpayes(): number {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const total = factures.reduce((sum: number, f: any) => sum + (f.net_a_payer || 0), 0);
    if (total === 0) return 0;
    return Math.round((this.totalImpayes / total) * 100);
  }

  getPourcentage(valeur: number, max: number): number {
    if (max === 0) return 0;
    return (valeur / max) * 100;
  }

  getInitials(nom: string): string {
    if (!nom) return '??';
    return nom.substring(0, 2).toUpperCase();
  }
}