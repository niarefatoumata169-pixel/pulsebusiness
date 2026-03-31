import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-commercial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <div>
          <h1>📊 Dashboard Commercial</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge"><span class="badge-icon">📈</span><span>Performance commerciale</span></div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card chiffre"><div class="kpi-icon">💰</div><div class="kpi-content"><span class="kpi-value">{{ chiffreAffaires | number }} FCFA</span><span class="kpi-label">Chiffre d'affaires</span><span class="kpi-sub">+{{ evolutionCA }}% vs mois dernier</span></div></div>
        <div class="kpi-card ventes"><div class="kpi-icon">🛒</div><div class="kpi-content"><span class="kpi-value">{{ totalVentes }}</span><span class="kpi-label">Ventes</span><span class="kpi-sub">{{ ventesMois }} ce mois</span></div></div>
        <div class="kpi-card devis"><div class="kpi-icon">📄</div><div class="kpi-content"><span class="kpi-value">{{ totalDevis }}</span><span class="kpi-label">Devis</span><span class="kpi-sub">{{ devisEnAttente }} en attente</span></div></div>
        <div class="kpi-card contrats"><div class="kpi-icon">📑</div><div class="kpi-content"><span class="kpi-value">{{ totalContrats }}</span><span class="kpi-label">Contrats actifs</span><span class="kpi-sub">{{ contratsEcheance }} fin prochaine</span></div></div>
      </div>

      <div class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/commercial/devis/nouveau" class="action-btn"><span class="action-icon">📄</span><div class="action-info"><strong>Nouveau devis</strong><small>Créer un devis</small></div></a>
          <a routerLink="/commercial/ventes/nouvelle" class="action-btn"><span class="action-icon">🛒</span><div class="action-info"><strong>Nouvelle vente</strong><small>Enregistrer une vente</small></div></a>
          <a routerLink="/commercial/contrats/nouveau" class="action-btn"><span class="action-icon">📑</span><div class="action-info"><strong>Nouveau contrat</strong><small>Gérer les contrats</small></div></a>
          <a routerLink="/commercial/recouvrement" class="action-btn"><span class="action-icon">💰</span><div class="action-info"><strong>Recouvrement</strong><small>Suivi des paiements</small></div></a>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card"><h3>📊 Évolution des ventes</h3><div class="chart-container"><div class="chart-bars"><div class="chart-bar" *ngFor="let v of ventesParMois"><div class="bar-info"><span class="bar-label">{{ v.mois }}</span><span class="bar-value">{{ v.montant | number }} FCFA</span></div><div class="bar-container"><div class="bar-fill" [style.width.%]="getPourcentage(v.montant, maxVente)" style="background: #EC4899"></div></div></div></div></div></div>
        <div class="chart-card"><h3>📋 Top clients</h3><div class="top-clients"><div class="client-item" *ngFor="let c of topClients; let i = index"><span class="client-rank">{{ i + 1 }}</span><span class="client-name">{{ c.nom }}</span><span class="client-value">{{ c.total | number }} FCFA</span><div class="client-bar"><div class="client-fill" [style.width.%]="(c.total / maxClient) * 100"></div></div></div><div *ngIf="topClients.length === 0" class="empty-chart"><p>Aucun client</p></div></div></div>
      </div>

      <div class="alerts-section"><h3>⚠️ Alertes commerciales</h3><div class="alerts-list"><div class="alert-card" *ngFor="let a of alertes"><div class="alert-icon">{{ a.type === 'devis' ? '📄' : '💰' }}</div><div class="alert-info"><div class="alert-titre">{{ a.titre }}</div><div class="alert-message">{{ a.message }}</div></div></div><div *ngIf="alertes.length === 0" class="empty-state"><p>Aucune alerte</p></div></div></div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; background: #F9FAFB; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .date { color: #6B7280; margin: 8px 0 0 0; }
    .welcome-badge { background: #FEF3F9; padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px; color: #EC4899; font-size: 14px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; }
    .kpi-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .kpi-sub { font-size: 11px; color: #9CA3AF; margin-top: 2px; display: block; }
    .kpi-card.chiffre .kpi-value { color: #10B981; }
    .kpi-card.ventes .kpi-value { color: #EC4899; }
    .kpi-card.devis .kpi-value { color: #3B82F6; }
    .kpi-card.contrats .kpi-value { color: #F59E0B; }
    .quick-actions { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    h2, h3 { color: #1F2937; margin: 0 0 16px 0; font-size: 18px; }
    .action-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .action-btn { background: #F9FAFB; padding: 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border: 1px solid #F3F4F6; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #FEF3F9; border-color: #EC4899; }
    .action-icon { font-size: 28px; }
    .action-info strong { display: block; color: #1F2937; margin-bottom: 4px; }
    .action-info small { font-size: 11px; color: #6B7280; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: white; border-radius: 16px; padding: 20px; }
    .chart-bars { display: flex; flex-direction: column; gap: 16px; }
    .chart-bar { width: 100%; }
    .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-label { font-weight: 500; color: #4B5563; }
    .bar-value { color: #6B7280; }
    .bar-container { width: 100%; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .top-clients { display: flex; flex-direction: column; gap: 12px; }
    .client-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .client-rank { width: 28px; height: 28px; background: #FDF2F8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #EC4899; }
    .client-name { flex: 1; font-weight: 500; color: #1F2937; }
    .client-value { font-size: 14px; font-weight: 600; color: #EC4899; min-width: 100px; text-align: right; }
    .client-bar { width: 100px; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .client-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    .alerts-section { background: white; border-radius: 16px; padding: 20px; }
    .alerts-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-card { display: flex; align-items: center; gap: 16px; padding: 12px; background: #FEF3C7; border-radius: 12px; border-left: 4px solid #F59E0B; }
    .alert-icon { font-size: 24px; }
    .alert-info { flex: 1; }
    .alert-titre { font-weight: 600; color: #1F2937; margin-bottom: 4px; }
    .alert-message { font-size: 12px; color: #6B7280; }
    .empty-chart, .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; }
    @media (max-width: 1024px) { .action-buttons { grid-template-columns: repeat(2, 1fr); } .kpi-grid { grid-template-columns: repeat(2, 1fr); } .charts-row { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .action-buttons { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: 1fr; } }
  `]
})
export class CommercialDashboard implements OnInit {
  today = new Date();
  chiffreAffaires = 0; totalVentes = 0; totalDevis = 0; totalContrats = 0;
  ventesMois = 0; devisEnAttente = 0; contratsEcheance = 0; evolutionCA = 12;
  ventesParMois: any[] = []; topClients: any[] = []; alertes: any[] = [];
  maxVente = 0; maxClient = 0;
  
  ngOnInit() { this.loadData(); }
  
  loadData() {
    const ventes = JSON.parse(localStorage.getItem('ventes') || '[]');
    const devis = JSON.parse(localStorage.getItem('devis') || '[]');
    const contrats = JSON.parse(localStorage.getItem('contrats') || '[]');
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    this.totalVentes = ventes.length;
    this.totalDevis = devis.length;
    this.totalContrats = contrats.length;
    this.chiffreAffaires = ventes.filter((v: any) => v.statut === 'payee').reduce((s: number, v: any) => s + (v.montant || 0), 0);
    this.ventesMois = ventes.filter((v: any) => new Date(v.date_creation).getMonth() === new Date().getMonth()).length;
    this.devisEnAttente = devis.filter((d: any) => d.statut === 'envoye').length;
    
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const ventesParMoisMap = new Map<string, number>();
    ventes.forEach((v: any) => { if (v.statut === 'payee') { const mois = moisNoms[new Date(v.date_creation).getMonth()]; ventesParMoisMap.set(mois, (ventesParMoisMap.get(mois) || 0) + (v.montant || 0)); } });
    this.ventesParMois = Array.from(ventesParMoisMap.entries()).map(([mois, montant]) => ({ mois, montant }));
    this.maxVente = Math.max(...this.ventesParMois.map(v => v.montant), 0);
    
    const clientMap = new Map<number, { nom: string; total: number }>();
    ventes.forEach((v: any) => { if (v.client_id && v.statut === 'payee') { const c = clients.find((cl: any) => cl.id === v.client_id); if (c) { const current = clientMap.get(v.client_id) || { nom: c.nom, total: 0 }; current.total += v.montant; clientMap.set(v.client_id, current); } } });
    this.topClients = Array.from(clientMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);
    this.maxClient = this.topClients[0]?.total || 0;
    
    this.alertes = []; if (this.devisEnAttente > 0) this.alertes.push({ type: 'devis', titre: 'Devis en attente', message: `${this.devisEnAttente} devis en attente de signature` });
    if (this.contratsEcheance > 0) this.alertes.push({ type: 'contrat', titre: 'Contrats bientôt expirés', message: `${this.contratsEcheance} contrats arrivent à échéance` });
  }
  
  getPourcentage(valeur: number, max: number): number { return max === 0 ? 0 : (valeur / max) * 100; }
}