import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête avec bienvenue -->
      <div class="header">
        <div>
          <h1>👋 Tableau de bord</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge">
            <span class="badge-icon">📊</span>
            <span>Bienvenue sur PulseBusiness</span>
          </div>
        </div>
      </div>

      <!-- KPIs améliorés avec données dynamiques -->
      <div class="kpi-grid">
        <div class="kpi-card ca">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ chiffreAffaires | number }} <small>FCFA</small></span>
            <span class="kpi-label">Chiffre d'affaires</span>
            <span class="kpi-sub">+{{ getEvolutionCA() }}% vs mois dernier</span>
          </div>
        </div>
        <div class="kpi-card clients">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalClients }}</span>
            <span class="kpi-label">Clients</span>
            <span class="kpi-sub">{{ getNouveauxClientsMois() }} nouveaux ce mois</span>
          </div>
        </div>
        <div class="kpi-card factures">
          <div class="kpi-icon">📄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalFactures }}</span>
            <span class="kpi-label">Factures</span>
            <span class="kpi-sub">{{ getFacturesMois() }} ce mois</span>
          </div>
        </div>
        <div class="kpi-card impayes">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalImpayes | number }} <small>FCFA</small></span>
            <span class="kpi-label">Impayés</span>
            <span class="kpi-sub">{{ getTauxImpayes() }}% des ventes</span>
          </div>
        </div>
      </div>

      <!-- Graphiques et activités récentes -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>📊 Évolution des ventes</h3>
          <div class="chart-container" *ngIf="ventesParMois.length > 0; else emptyChart">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let v of ventesParMois">
                <div class="bar-info">
                  <span class="bar-label">{{ v.mois }}</span>
                  <span class="bar-value">{{ v.montant | number }} FCFA</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="getPourcentage(v.montant, maxVente)" style="background: #EC4899"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyChart>
            <div class="empty-chart">
              <div class="empty-icon">📊</div>
              <p>Aucune donnée de vente</p>
              <small>Les graphiques apparaîtront quand vous aurez des factures</small>
            </div>
          </ng-template>
        </div>

        <div class="chart-card">
          <h3>🔄 Activités récentes</h3>
          <div class="activities-list" *ngIf="activitesRecentes.length > 0; else emptyActivities">
            <div class="activity-item" *ngFor="let a of activitesRecentes">
              <div class="activity-icon" [class]="a.type">
                {{ a.type === 'facture' ? '📄' : a.type === 'client' ? '👤' : a.type === 'paiement' ? '💰' : '📦' }}
              </div>
              <div class="activity-info">
                <div class="activity-titre">{{ a.titre }}</div>
                <div class="activity-date">{{ a.date | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>
          </div>
          <ng-template #emptyActivities>
            <div class="empty-chart">
              <div class="empty-icon">🔄</div>
              <p>Aucune activité récente</p>
              <small>Commencez par créer vos premiers clients et factures</small>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Alertes et notifications -->
      <div class="alerts-section" *ngIf="alertes.length > 0">
        <div class="section-header">
          <h3>⚠️ Alertes importantes</h3>
          <span class="alert-count">{{ alertes.length }} alerte(s)</span>
        </div>
        <div class="alerts-list">
          <div class="alert-card" *ngFor="let a of alertes" [class]="a.type">
            <div class="alert-icon">{{ a.type === 'stock' ? '📦' : a.type === 'facture' ? '📄' : '⚠️' }}</div>
            <div class="alert-info">
              <div class="alert-titre">{{ a.titre }}</div>
              <div class="alert-message">{{ a.message }}</div>
            </div>
            <button class="btn-action" (click)="a.action()">Voir</button>
          </div>
        </div>
      </div>

      <!-- Derniers clients et factures -->
      <div class="last-items-row">
        <div class="last-card">
          <div class="card-header">
            <h3>👥 Derniers clients</h3>
            <a routerLink="/clients" class="btn-link">Voir tous →</a>
          </div>
          <div class="items-list" *ngIf="derniersClients.length > 0; else emptyClients">
            <div class="item-row" *ngFor="let c of derniersClients">
              <div class="item-avatar">{{ getInitials(c.nom) }}</div>
              <div class="item-info">
                <div class="item-name">{{ c.nom }} {{ c.prenom || '' }}</div>
                <div class="item-email">{{ c.email }}</div>
              </div>
              <div class="item-date">{{ c.created_at | date:'dd/MM/yyyy' }}</div>
            </div>
          </div>
          <ng-template #emptyClients>
            <div class="empty-small">
              <p>Aucun client</p>
              <a routerLink="/clients/nouveau" class="btn-add-small">+ Ajouter un client</a>
            </div>
          </ng-template>
        </div>

        <div class="last-card">
          <div class="card-header">
            <h3>📄 Dernières factures</h3>
            <a routerLink="/factures" class="btn-link">Voir toutes →</a>
          </div>
          <div class="items-list" *ngIf="dernieresFactures.length > 0; else emptyFactures">
            <div class="item-row" *ngFor="let f of dernieresFactures">
              <div class="item-icon">{{ f.statut === 'payee' ? '✅' : '⏳' }}</div>
              <div class="item-info">
                <div class="item-name">{{ f.reference }}</div>
                <div class="item-client">{{ f.client_nom }}</div>
              </div>
              <div class="item-montant">{{ f.montant | number }} FCFA</div>
            </div>
          </div>
          <ng-template #emptyFactures>
            <div class="empty-small">
              <p>Aucune facture</p>
              <a routerLink="/factures/nouvelle" class="btn-add-small">+ Créer une facture</a>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h3>⚡ Actions rapides</h3>
        <div class="action-buttons">
          <a routerLink="/clients/nouveau" class="action-btn client">
            <span class="action-icon">👤</span>
            <span>Nouveau client</span>
          </a>
          <a routerLink="/factures/nouvelle" class="action-btn facture">
            <span class="action-icon">📄</span>
            <span>Nouvelle facture</span>
          </a>
          <a routerLink="/chantiers/nouveau" class="action-btn chantier">
            <span class="action-icon">🏗️</span>
            <span>Nouveau chantier</span>
          </a>
          <a routerLink="/stock/articles/nouveau" class="action-btn stock">
            <span class="action-icon">📦</span>
            <span>Nouvel article</span>
          </a>
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
    .kpi-card.ca .kpi-value { color: #10B981; }
    .kpi-card.clients .kpi-value { color: #3B82F6; }
    .kpi-card.factures .kpi-value { color: #EC4899; }
    .kpi-card.impayes .kpi-value { color: #EF4444; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: white; border-radius: 16px; padding: 20px; }
    .chart-card h3 { margin: 0 0 16px 0; font-size: 16px; color: #1F2937; }
    .chart-container { min-height: 220px; }
    .chart-bars { display: flex; flex-direction: column; gap: 16px; }
    .chart-bar { width: 100%; }
    .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-label { font-weight: 500; color: #4B5563; }
    .bar-value { color: #6B7280; }
    .bar-container { width: 100%; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    
    .activities-list { display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #F9FAFB; border-radius: 10px; transition: all 0.2s; }
    .activity-item:hover { background: #FEF3F9; transform: translateX(4px); }
    .activity-icon { font-size: 24px; width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .activity-icon.facture { color: #EC4899; }
    .activity-icon.client { color: #3B82F6; }
    .activity-icon.paiement { color: #10B981; }
    .activity-info { flex: 1; }
    .activity-titre { font-weight: 500; color: #1F2937; }
    .activity-date { font-size: 11px; color: #9CA3AF; }
    
    .alerts-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .alert-count { background: #FEF3C7; padding: 4px 8px; border-radius: 20px; font-size: 12px; color: #D97706; }
    .alerts-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F9FAFB; border-radius: 12px; border-left: 4px solid transparent; }
    .alert-card.stock { border-left-color: #F59E0B; background: #FEF3C7; }
    .alert-card.facture { border-left-color: #EF4444; background: #FEE2E2; }
    .alert-icon { font-size: 24px; }
    .alert-info { flex: 1; }
    .alert-titre { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .alert-message { font-size: 12px; color: #6B7280; }
    .btn-action { background: #EC4899; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .btn-action:hover { background: #DB2777; }
    
    .last-items-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .last-card { background: white; border-radius: 16px; padding: 20px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { margin: 0; font-size: 16px; }
    .btn-link { color: #EC4899; text-decoration: none; font-size: 12px; }
    .btn-link:hover { text-decoration: underline; }
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .item-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
    .item-row:last-child { border-bottom: none; }
    .item-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #EC4899, #831843); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600; }
    .item-icon { font-size: 20px; }
    .item-info { flex: 1; }
    .item-name { font-weight: 500; color: #1F2937; }
    .item-email, .item-client { font-size: 11px; color: #9CA3AF; }
    .item-date, .item-montant { font-size: 12px; font-weight: 600; color: #EC4899; }
    .empty-small { text-align: center; padding: 24px; color: #9CA3AF; }
    .btn-add-small { display: inline-block; margin-top: 8px; padding: 6px 12px; background: #EC4899; color: white; border-radius: 6px; text-decoration: none; font-size: 12px; }
    
    .quick-actions { background: white; border-radius: 16px; padding: 20px; }
    .quick-actions h3 { margin: 0 0 16px 0; font-size: 16px; }
    .action-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .action-btn { display: flex; align-items: center; gap: 8px; padding: 12px; background: #F9FAFB; border-radius: 10px; text-decoration: none; color: #1F2937; font-weight: 500; transition: all 0.2s; border: 1px solid #F3F4F6; }
    .action-btn:hover { transform: translateY(-2px); }
    .action-btn.client:hover { background: #DBEAFE; border-color: #3B82F6; color: #1E40AF; }
    .action-btn.facture:hover { background: #FFE4E6; border-color: #EC4899; color: #EC4899; }
    .action-btn.chantier:hover { background: #FEF3C7; border-color: #F59E0B; color: #D97706; }
    .action-btn.stock:hover { background: #DCFCE7; border-color: #10B981; color: #16A34A; }
    .action-icon { font-size: 20px; }
    
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; text-align: center; gap: 8px; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .last-items-row { grid-template-columns: 1fr; }
      .action-buttons { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .action-buttons { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  
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
    this.loadData();
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
    this.derniersClients = clients.slice(0, 5);
  }
  
  loadFactures() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];
    this.totalFactures = factures.length;
    this.dernieresFactures = factures.slice(0, 5);
    
    // Calcul des impayés
    this.totalImpayes = factures
      .filter((f: any) => f.statut !== 'payee')
      .reduce((sum: number, f: any) => sum + (f.montant || 0), 0);
  }
  
  loadChiffreAffaires() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];
    this.chiffreAffaires = factures
      .filter((f: any) => f.statut === 'payee')
      .reduce((sum: number, f: any) => sum + (f.montant || 0), 0);
  }
  
  loadVentesParMois() {
    const saved = localStorage.getItem('factures');
    const factures = saved ? JSON.parse(saved) : [];
    
    const moisMap = new Map<string, number>();
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    factures.forEach((f: any) => {
      if (f.statut === 'payee') {
        const date = new Date(f.date_creation);
        const mois = moisNoms[date.getMonth()];
        const current = moisMap.get(mois) || 0;
        moisMap.set(mois, current + (f.montant || 0));
      }
    });
    
    this.ventesParMois = Array.from(moisMap.entries()).map(([mois, montant]) => ({ mois, montant }));
    this.maxVente = Math.max(...this.ventesParMois.map(v => v.montant), 0);
  }
  
  loadActivitesRecentes() {
    this.activitesRecentes = [];
    
    // Ajouter les derniers clients
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    clients.slice(0, 3).forEach((c: any) => {
      this.activitesRecentes.push({
        type: 'client',
        titre: `Nouveau client : ${c.nom} ${c.prenom || ''}`,
        date: c.created_at || new Date().toISOString()
      });
    });
    
    // Ajouter les dernières factures
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    factures.slice(0, 3).forEach((f: any) => {
      this.activitesRecentes.push({
        type: 'facture',
        titre: `Facture ${f.reference} créée`,
        date: f.date_creation || new Date().toISOString()
      });
    });
    
    this.activitesRecentes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.activitesRecentes = this.activitesRecentes.slice(0, 5);
  }
  
  loadAlertes() {
    this.alertes = [];
    
    // Alertes stock
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const stockBas = articles.filter((a: any) => a.stock_actuel <= a.stock_minimum);
    stockBas.slice(0, 2).forEach((a: any) => {
      this.alertes.push({
        type: 'stock',
        titre: 'Stock bas',
        message: `${a.nom} : ${a.stock_actuel} ${a.unite} restant(s) (min: ${a.stock_minimum})`,
        action: () => window.location.href = '/stock/articles'
      });
    });
    
    // Alertes factures impayées
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
    // Simulation d'évolution
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
      if (!f.date_creation) return false;
      const date = new Date(f.date_creation);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    }).length;
  }
  
  getTauxImpayes(): number {
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    const total = factures.reduce((sum: number, f: any) => sum + (f.montant || 0), 0);
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