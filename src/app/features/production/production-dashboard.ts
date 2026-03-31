import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Equipement {
  id?: number;
  code: string;
  nom: string;
  type: string;
  etat: 'operationnel' | 'maintenance' | 'panne' | 'hors_service';
}

interface Planning {
  id?: number;
  reference: string;
  titre: string;
  type: string;
  statut: 'brouillon' | 'publie' | 'archive';
  taches?: any[];
}

interface OrdreProduction {
  id?: number;
  numero: string;
  designation: string;
  quantite_prevue: number;
  quantite_produite: number;
  quantite_rebut: number;
  priorite: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
}

interface ControleQualite {
  id?: number;
  reference: string;
  titre: string;
  resultat: 'conforme' | 'non_conforme' | 'en_attente';
}

@Component({
  selector: 'app-production-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête avec bienvenue -->
      <div class="header">
        <div>
          <h1>🏭 Dashboard Production</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge">
            <span class="badge-icon">📊</span>
            <span>Vue d'ensemble de la production</span>
          </div>
        </div>
      </div>

      <!-- KPIs améliorés avec données dynamiques -->
      <div class="kpi-grid">
        <div class="kpi-card equipements">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalEquipements }}</span>
            <span class="kpi-label">Équipements</span>
            <span class="kpi-sub">{{ equipementsOperationnels }} opérationnels</span>
          </div>
        </div>
        <div class="kpi-card plannings">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalPlannings }}</span>
            <span class="kpi-label">Plannings</span>
            <span class="kpi-sub">{{ planningsPublies }} publiés</span>
          </div>
        </div>
        <div class="kpi-card ordres">
          <div class="kpi-icon">📋</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalOrdres }}</span>
            <span class="kpi-label">Ordres</span>
            <span class="kpi-sub">{{ ordresEnCours }} en cours</span>
          </div>
        </div>
        <div class="kpi-card qualite">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ tauxQualite }}%</span>
            <span class="kpi-label">Taux qualité</span>
            <span class="kpi-sub">{{ controlesConformes }}/{{ totalControles }} conformes</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides modernisées -->
      <div class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/production/equipements/nouveau" class="action-btn equipement">
            <span class="action-icon">⚙️</span>
            <div class="action-info">
              <strong>Nouvel équipement</strong>
              <small>Ajouter une machine</small>
            </div>
          </a>
          <a routerLink="/production/plannings/nouveau" class="action-btn planning">
            <span class="action-icon">📅</span>
            <div class="action-info">
              <strong>Nouveau planning</strong>
              <small>Planifier la production</small>
            </div>
          </a>
          <a routerLink="/production/ordres/nouveau" class="action-btn ordre">
            <span class="action-icon">📋</span>
            <div class="action-info">
              <strong>Nouvel ordre</strong>
              <small>Lancer une production</small>
            </div>
          </a>
          <a routerLink="/production/qualite/nouveau" class="action-btn controle">
            <span class="action-icon">✅</span>
            <div class="action-info">
              <strong>Nouveau contrôle</strong>
              <small>Vérifier la qualité</small>
            </div>
          </a>
        </div>
      </div>

      <!-- Graphiques améliorés -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>📊 Taux de production</h3>
          <div class="chart-container" *ngIf="productionData.length > 0; else emptyChart">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let item of productionData">
                <div class="bar-info">
                  <span class="bar-label">{{ item.nom }}</span>
                  <span class="bar-value">{{ item.quantite_produite }} / {{ item.quantite_prevue }}</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="item.pourcentage" [class]="getBarClass(item.pourcentage)"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyChart>
            <div class="empty-chart">
              <div class="empty-icon">📊</div>
              <p>Aucune donnée disponible</p>
              <small>Les graphiques apparaîtront quand vous aurez des ordres de production</small>
            </div>
          </ng-template>
        </div>

        <div class="chart-card">
          <h3>⚙️ État des équipements</h3>
          <div class="chart-container" *ngIf="equipementsData.length > 0; else emptyEquipements">
            <div class="donut-chart">
              <div class="donut-stats">
                <div class="donut-item operationnel">
                  <span class="donut-color"></span>
                  <span class="donut-label">Opérationnels</span>
                  <span class="donut-value">{{ equipementsOperationnels }}</span>
                </div>
                <div class="donut-item maintenance">
                  <span class="donut-color"></span>
                  <span class="donut-label">En maintenance</span>
                  <span class="donut-value">{{ equipementsMaintenance }}</span>
                </div>
                <div class="donut-item panne">
                  <span class="donut-color"></span>
                  <span class="donut-label">En panne</span>
                  <span class="donut-value">{{ equipementsPanne }}</span>
                </div>
              </div>
              <div class="progress-ring">
                <div class="ring-segment" *ngFor="let e of equipementsData">
                  <div class="segment" [style.width.%]="e.pourcentage" [style.background]="e.couleur"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyEquipements>
            <div class="empty-chart">
              <div class="empty-icon">⚙️</div>
              <p>Aucun équipement enregistré</p>
              <small>Ajoutez vos premiers équipements</small>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Ordres en cours améliorés -->
      <div class="orders-section">
        <div class="section-header">
          <h3>📋 Ordres de production en cours</h3>
          <a routerLink="/production/ordres" class="btn-link">Voir tous →</a>
        </div>
        
        <div class="orders-list" *ngIf="ordresEnCoursList.length > 0; else emptyOrders">
          <div class="order-card" *ngFor="let o of ordresEnCoursList" [class]="'priorite-' + o.priorite">
            <div class="order-header">
              <div class="order-info">
                <span class="order-numero">{{ o.numero }}</span>
                <span class="order-designation">{{ o.designation }}</span>
              </div>
              <span class="order-priorite" [class]="o.priorite">{{ getPrioriteLabel(o.priorite) }}</span>
            </div>
            <div class="order-body">
              <div class="progress-container">
                <div class="progress-label">Avancement: {{ getAvancement(o) }}%</div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getAvancement(o)"></div>
                </div>
              </div>
              <div class="order-stats">
                <span>📦 {{ o.quantite_produite }} / {{ o.quantite_prevue }} unités</span>
                <span *ngIf="o.quantite_rebut > 0" class="rebut">⚠️ {{ o.quantite_rebut }} rebuts</span>
              </div>
            </div>
          </div>
        </div>
        <ng-template #emptyOrders>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>Aucun ordre de production en cours</p>
            <small>Créez un nouvel ordre pour démarrer la production</small>
          </div>
        </ng-template>
      </div>

      <!-- Derniers contrôles qualité -->
      <div class="controls-section" *ngIf="derniersControles.length > 0">
        <div class="section-header">
          <h3>✅ Derniers contrôles qualité</h3>
          <a routerLink="/production/qualite" class="btn-link">Voir tous →</a>
        </div>
        <div class="controls-list">
          <div class="control-card" *ngFor="let c of derniersControles" [class]="c.resultat">
            <div class="control-icon">{{ c.resultat === 'conforme' ? '✅' : c.resultat === 'non_conforme' ? '❌' : '⏳' }}</div>
            <div class="control-info">
              <div class="control-titre">{{ c.titre }}</div>
              <div class="control-ref">{{ c.reference }}</div>
            </div>
            <div class="control-resultat" [class]="c.resultat">{{ getResultatLabel(c.resultat) }}</div>
          </div>
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
    .kpi-value { display: block; font-size: 28px; font-weight: 700; color: #1F2937; }
    .kpi-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .kpi-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; display: block; }
    .kpi-card.equipements .kpi-icon { color: #3B82F6; }
    .kpi-card.plannings .kpi-icon { color: #10B981; }
    .kpi-card.ordres .kpi-icon { color: #F59E0B; }
    .kpi-card.qualite .kpi-icon { color: #EC4899; }
    
    .quick-actions { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    h2, h3 { color: #1F2937; margin: 0 0 16px 0; font-size: 18px; }
    .action-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .action-btn { background: #F9FAFB; padding: 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border: 1px solid #F3F4F6; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .action-btn.equipement:hover { background: #DBEAFE; border-color: #3B82F6; }
    .action-btn.planning:hover { background: #DCFCE7; border-color: #10B981; }
    .action-btn.ordre:hover { background: #FEF3C7; border-color: #F59E0B; }
    .action-btn.controle:hover { background: #FFE4E6; border-color: #EC4899; }
    .action-icon { font-size: 28px; }
    .action-info { flex: 1; }
    .action-info strong { display: block; color: #1F2937; margin-bottom: 4px; }
    .action-info small { font-size: 11px; color: #6B7280; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: white; border-radius: 16px; padding: 20px; }
    .chart-container { min-height: 220px; }
    .chart-bars { display: flex; flex-direction: column; gap: 16px; }
    .chart-bar { width: 100%; }
    .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-label { font-weight: 500; color: #4B5563; }
    .bar-value { color: #6B7280; }
    .bar-container { width: 100%; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .bar-fill.low { background: #EF4444; }
    .bar-fill.medium { background: #F59E0B; }
    .bar-fill.high { background: #10B981; }
    .donut-chart { display: flex; align-items: center; justify-content: center; gap: 30px; flex-wrap: wrap; }
    .donut-stats { display: flex; flex-direction: column; gap: 12px; }
    .donut-item { display: flex; align-items: center; gap: 8px; }
    .donut-color { width: 12px; height: 12px; border-radius: 2px; }
    .donut-item.operationnel .donut-color { background: #10B981; }
    .donut-item.maintenance .donut-color { background: #F59E0B; }
    .donut-item.panne .donut-color { background: #EF4444; }
    .donut-label { font-size: 13px; color: #6B7280; }
    .donut-value { font-weight: 600; color: #1F2937; min-width: 30px; }
    .progress-ring { width: 100px; height: 100px; border-radius: 50%; background: #F3F4F6; overflow: hidden; position: relative; }
    .ring-segment { position: absolute; bottom: 0; left: 0; width: 100%; display: flex; flex-direction: column; }
    .segment { height: 100%; transition: height 0.3s; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; text-align: center; gap: 8px; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    
    .orders-section, .controls-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .btn-link { color: #EC4899; text-decoration: none; font-size: 13px; font-weight: 500; }
    .btn-link:hover { text-decoration: underline; }
    .orders-list { display: flex; flex-direction: column; gap: 12px; }
    .order-card { background: #F9FAFB; border-radius: 12px; padding: 16px; border-left: 4px solid transparent; }
    .order-card.priorite-basse { border-left-color: #9CA3AF; }
    .order-card.priorite-normale { border-left-color: #3B82F6; }
    .order-card.priorite-haute { border-left-color: #F59E0B; }
    .order-card.priorite-urgente { border-left-color: #EF4444; }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .order-numero { font-weight: 600; color: #1F2937; font-family: monospace; font-size: 13px; }
    .order-designation { font-size: 14px; color: #4B5563; margin-left: 12px; }
    .order-priorite { font-size: 11px; padding: 2px 8px; border-radius: 20px; }
    .order-priorite.basse { background: #F3F4F6; color: #6B7280; }
    .order-priorite.normale { background: #DBEAFE; color: #1E40AF; }
    .order-priorite.haute { background: #FEF3C7; color: #D97706; }
    .order-priorite.urgente { background: #FEE2E2; color: #EF4444; }
    .progress-container { margin-bottom: 8px; }
    .progress-label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
    .progress-bar { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    .order-stats { display: flex; gap: 12px; font-size: 12px; color: #6B7280; }
    .rebut { color: #EF4444; }
    
    .controls-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
    .control-card { background: #F9FAFB; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-left: 4px solid transparent; }
    .control-card.conforme { border-left-color: #10B981; }
    .control-card.non_conforme { border-left-color: #EF4444; }
    .control-card.en_attente { border-left-color: #F59E0B; }
    .control-icon { font-size: 24px; }
    .control-info { flex: 1; }
    .control-titre { font-weight: 500; color: #1F2937; margin-bottom: 4px; }
    .control-ref { font-size: 11px; color: #9CA3AF; font-family: monospace; }
    .control-resultat { font-size: 11px; padding: 2px 8px; border-radius: 20px; }
    .control-resultat.conforme { background: #DCFCE7; color: #16A34A; }
    .control-resultat.non_conforme { background: #FEE2E2; color: #EF4444; }
    .control-resultat.en_attente { background: #FEF3C7; color: #D97706; }
    
    .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; border: 2px dashed #FCE7F3; }
    
    @media (max-width: 1024px) {
      .action-buttons { grid-template-columns: repeat(2, 1fr); }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    
    @media (max-width: 640px) {
      .action-buttons { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr; }
      .order-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ProductionDashboard implements OnInit {
  today = new Date();
  
  totalEquipements = 0;
  equipementsOperationnels = 0;
  equipementsMaintenance = 0;
  equipementsPanne = 0;
  
  totalPlannings = 0;
  planningsPublies = 0;
  
  totalOrdres = 0;
  ordresEnCours = 0;
  ordresEnCoursList: any[] = [];
  
  totalControles = 0;
  controlesConformes = 0;
  tauxQualite = 0;
  
  productionData: any[] = [];
  equipementsData: any[] = [];
  derniersControles: any[] = [];
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.loadEquipements();
    this.loadPlannings();
    this.loadOrdres();
    this.loadControles();
  }
  
  loadEquipements() {
    const saved = localStorage.getItem('equipements');
    const equipements: Equipement[] = saved ? JSON.parse(saved) : [];
    
    this.totalEquipements = equipements.length;
    this.equipementsOperationnels = equipements.filter(e => e.etat === 'operationnel').length;
    this.equipementsMaintenance = equipements.filter(e => e.etat === 'maintenance').length;
    this.equipementsPanne = equipements.filter(e => e.etat === 'panne').length;
    
    const total = this.totalEquipements || 1;
    this.equipementsData = [
      { pourcentage: (this.equipementsOperationnels / total) * 100, couleur: '#10B981' },
      { pourcentage: (this.equipementsMaintenance / total) * 100, couleur: '#F59E0B' },
      { pourcentage: (this.equipementsPanne / total) * 100, couleur: '#EF4444' }
    ];
  }
  
  loadPlannings() {
    const saved = localStorage.getItem('plannings');
    const plannings: Planning[] = saved ? JSON.parse(saved) : [];
    
    this.totalPlannings = plannings.length;
    this.planningsPublies = plannings.filter(p => p.statut === 'publie').length;
  }
  
  loadOrdres() {
    const saved = localStorage.getItem('ordres_production');
    const ordres: OrdreProduction[] = saved ? JSON.parse(saved) : [];
    
    this.totalOrdres = ordres.length;
    this.ordresEnCours = ordres.filter(o => o.statut === 'en_cours').length;
    this.ordresEnCoursList = ordres
      .filter(o => o.statut === 'en_cours')
      .slice(0, 5)
      .map(o => ({
        ...o,
        pourcentage: (o.quantite_produite / o.quantite_prevue) * 100
      }));
    
    this.productionData = ordres
      .filter(o => o.statut === 'en_cours' || o.statut === 'planifie')
      .slice(0, 5)
      .map(o => ({
        nom: o.designation,
        quantite_prevue: o.quantite_prevue,
        quantite_produite: o.quantite_produite,
        pourcentage: (o.quantite_produite / o.quantite_prevue) * 100
      }));
  }
  
  loadControles() {
    const saved = localStorage.getItem('qualite_controles');
    const controles: ControleQualite[] = saved ? JSON.parse(saved) : [];
    
    this.totalControles = controles.length;
    this.controlesConformes = controles.filter(c => c.resultat === 'conforme').length;
    this.tauxQualite = this.totalControles > 0 
      ? Math.round((this.controlesConformes / this.totalControles) * 100) 
      : 0;
    
    this.derniersControles = controles.slice(0, 5);
  }
  
  getAvancement(o: any): number {
    if (o.quantite_prevue === 0) return 0;
    return Math.round((o.quantite_produite / o.quantite_prevue) * 100);
  }
  
  getBarClass(pourcentage: number): string {
    if (pourcentage < 30) return 'low';
    if (pourcentage < 70) return 'medium';
    return 'high';
  }
  
  getPrioriteLabel(priorite: string): string {
    const labels: any = { basse: '🟢 Basse', normale: '🔵 Normale', haute: '🟠 Haute', urgente: '🔴 Urgente' };
    return labels[priorite] || priorite;
  }
  
  getResultatLabel(resultat: string): string {
    const labels: any = { conforme: 'Conforme', non_conforme: 'Non conforme', en_attente: 'En attente' };
    return labels[resultat] || resultat;
  }
}