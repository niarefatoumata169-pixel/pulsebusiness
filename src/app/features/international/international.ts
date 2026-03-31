import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DeclarationDouane {
  id?: number;
  type: 'import' | 'export' | 'transit';
  valeur_marchandise: number;
  date_declaration: string;
  pays_origine: string;
  pays_destination: string;
  statut: string;
}

interface Transitaire {
  id?: number;
  nom: string;
  pays: string;
}

interface Reglement {
  id?: number;
  montant: number;
  date: string;
  type: string;
}

@Component({
  selector: 'app-international-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête avec bienvenue -->
      <div class="header">
        <div>
          <h1>🌍 Dashboard International</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge">
            <span class="badge-icon">📊</span>
            <span>Bienvenue dans votre espace international</span>
          </div>
        </div>
      </div>

      <!-- KPIs améliorés -->
      <div class="kpi-grid">
        <div class="kpi-card import">
          <div class="kpi-icon">📥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalImports }}</span>
            <span class="kpi-label">Importations</span>
            <span class="kpi-sub">{{ totalValeurImports | number }} FCFA</span>
          </div>
        </div>
        <div class="kpi-card export">
          <div class="kpi-icon">📤</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalExports }}</span>
            <span class="kpi-label">Exportations</span>
            <span class="kpi-sub">{{ totalValeurExports | number }} FCFA</span>
          </div>
        </div>
        <div class="kpi-card pays">
          <div class="kpi-icon">🌍</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalPays }}</span>
            <span class="kpi-label">Pays partenaires</span>
            <span class="kpi-sub">{{ topPays }}</span>
          </div>
        </div>
        <div class="kpi-card transit">
          <div class="kpi-icon">🚛</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalTransitaires }}</span>
            <span class="kpi-label">Transitaires</span>
            <span class="kpi-sub">Partenaires actifs</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides modernisées -->
      <div class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/international/douanes/nouveau" class="action-btn douane">
            <span class="action-icon">📋</span>
            <div class="action-info">
              <strong>Nouvelle déclaration</strong>
              <small>Import / Export</small>
            </div>
          </a>
          <a routerLink="/international/transitaires/nouveau" class="action-btn transitaire">
            <span class="action-icon">🚛</span>
            <div class="action-info">
              <strong>Nouveau transitaire</strong>
              <small>Prestataire logistique</small>
            </div>
          </a>
          <a routerLink="/international/reglements/nouveau" class="action-btn reglement">
            <span class="action-icon">💶</span>
            <div class="action-info">
              <strong>Nouveau règlement</strong>
              <small>Paiement international</small>
            </div>
          </a>
        </div>
      </div>

      <!-- Graphiques améliorés -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>📊 Import/Export par pays</h3>
          <div class="chart-container" *ngIf="paysData.length > 0; else emptyChart">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let p of paysData">
                <div class="bar-info">
                  <span class="bar-label">{{ p.pays }}</span>
                  <span class="bar-value">{{ p.total | number }} FCFA</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill import" [style.width.%]="getPourcentage(p.total, maxValeur)" 
                       [class]="p.type"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyChart>
            <div class="empty-chart">
              <div class="empty-icon">📊</div>
              <p>Aucune donnée disponible</p>
              <small>Les graphiques apparaîtront quand vous aurez des données</small>
            </div>
          </ng-template>
        </div>

        <div class="chart-card">
          <h3>⏱️ Délais douane (moyenne)</h3>
          <div class="chart-container" *ngIf="delaisData.length > 0; else emptyDelais">
            <div class="delais-stats">
              <div class="delais-item">
                <span class="delais-label">Importation</span>
                <span class="delais-value">{{ delaisImport | number:'1.0-0' }} jours</span>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(delaisImport / 30) * 100"></div>
                </div>
              </div>
              <div class="delais-item">
                <span class="delais-label">Exportation</span>
                <span class="delais-value">{{ delaisExport | number:'1.0-0' }} jours</span>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(delaisExport / 30) * 100"></div>
                </div>
              </div>
              <div class="delais-item">
                <span class="delais-label">Transit</span>
                <span class="delais-value">{{ delaisTransit | number:'1.0-0' }} jours</span>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(delaisTransit / 30) * 100"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyDelais>
            <div class="empty-chart">
              <div class="empty-icon">⏱️</div>
              <p>Aucune donnée de délais</p>
              <small>Les données apparaîtront après les premières déclarations</small>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Dernières opérations améliorées -->
      <div class="operations-section">
        <div class="section-header">
          <h3>📋 Dernières opérations internationales</h3>
          <button class="btn-refresh" (click)="refreshData()" title="Actualiser">
            🔄
          </button>
        </div>
        
        <div class="operations-list" *ngIf="recentOperations.length > 0; else emptyOperations">
          <div class="operation-card" *ngFor="let op of recentOperations">
            <div class="operation-icon" [class]="op.type">
              {{ op.type === 'import' ? '📥' : op.type === 'export' ? '📤' : '🔄' }}
            </div>
            <div class="operation-info">
              <div class="operation-title">{{ op.titre }}</div>
              <div class="operation-details">
                <span class="detail-date">{{ op.date | date:'dd/MM/yyyy' }}</span>
                <span class="detail-pays">{{ op.pays }}</span>
                <span class="detail-statut" [class]="op.statut">{{ getStatutLabel(op.statut) }}</span>
              </div>
            </div>
            <div class="operation-montant" [class]="op.type">
              {{ op.montant | number }} FCFA
            </div>
          </div>
        </div>
        <ng-template #emptyOperations>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p>Aucune opération internationale</p>
            <small>Commencez par créer une déclaration en douane</small>
          </div>
        </ng-template>
      </div>

      <!-- Top pays partenaires -->
      <div class="top-pays-section" *ngIf="topPaysList.length > 0">
        <h3>🏆 Top pays partenaires</h3>
        <div class="pays-list">
          <div class="pays-item" *ngFor="let p of topPaysList; let i = index">
            <span class="pays-rank">{{ i + 1 }}</span>
            <span class="pays-name">{{ p.pays }}</span>
            <span class="pays-value">{{ p.valeur | number }} FCFA</span>
            <div class="pays-bar">
              <div class="pays-fill" [style.width.%]="(p.valeur / maxTopValeur) * 100"></div>
            </div>
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
    .kpi-label { font-size: 13px; color: #6B7280; }
    .kpi-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; display: block; }
    .kpi-card.import .kpi-icon { color: #3B82F6; }
    .kpi-card.export .kpi-icon { color: #10B981; }
    .kpi-card.pays .kpi-icon { color: #F59E0B; }
    .kpi-card.transit .kpi-icon { color: #EC4899; }
    
    .quick-actions { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    h2, h3 { color: #1F2937; margin: 0 0 16px 0; font-size: 18px; }
    .action-buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .action-btn { background: #F9FAFB; padding: 16px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s; border: 1px solid #F3F4F6; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .action-btn.douane:hover { background: #DBEAFE; border-color: #3B82F6; }
    .action-btn.transitaire:hover { background: #FEF3C7; border-color: #F59E0B; }
    .action-btn.reglement:hover { background: #DCFCE7; border-color: #10B981; }
    .action-icon { font-size: 32px; }
    .action-info { flex: 1; }
    .action-info strong { display: block; color: #1F2937; margin-bottom: 4px; }
    .action-info small { font-size: 11px; color: #6B7280; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: white; border-radius: 16px; padding: 20px; }
    .chart-container { min-height: 250px; }
    .chart-bars { display: flex; flex-direction: column; gap: 16px; }
    .chart-bar { width: 100%; }
    .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .bar-label { font-weight: 500; color: #4B5563; }
    .bar-value { color: #6B7280; }
    .bar-container { width: 100%; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .bar-fill.import { background: #3B82F6; }
    .bar-fill.export { background: #10B981; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; text-align: center; gap: 8px; }
    .empty-icon { font-size: 48px; opacity: 0.5; }
    
    .delais-stats { display: flex; flex-direction: column; gap: 20px; }
    .delais-item { display: flex; flex-direction: column; gap: 6px; }
    .delais-label { font-size: 13px; color: #6B7280; }
    .delais-value { font-size: 20px; font-weight: 700; color: #EC4899; }
    .progress-bar { width: 100%; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    
    .operations-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .btn-refresh { background: none; border: 1px solid #FCE7F3; border-radius: 8px; padding: 6px 10px; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { background: #FEF3F9; border-color: #EC4899; }
    .operations-list { display: flex; flex-direction: column; gap: 12px; }
    .operation-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F9FAFB; border-radius: 12px; transition: all 0.2s; }
    .operation-card:hover { background: #FEF3F9; transform: translateX(4px); }
    .operation-icon { font-size: 28px; width: 48px; height: 48px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .operation-icon.import { color: #3B82F6; }
    .operation-icon.export { color: #10B981; }
    .operation-icon.transit { color: #F59E0B; }
    .operation-info { flex: 1; }
    .operation-title { font-weight: 600; color: #1F2937; margin-bottom: 6px; }
    .operation-details { display: flex; gap: 12px; flex-wrap: wrap; }
    .detail-date, .detail-pays { font-size: 11px; color: #9CA3AF; }
    .detail-statut { font-size: 10px; padding: 2px 8px; border-radius: 20px; }
    .detail-statut.en_cours { background: #FEF3C7; color: #D97706; }
    .detail-statut.soumise { background: #DBEAFE; color: #1E40AF; }
    .detail-statut.debloquee { background: #DCFCE7; color: #16A34A; }
    .operation-montant { font-size: 16px; font-weight: 600; }
    .operation-montant.import { color: #3B82F6; }
    .operation-montant.export { color: #10B981; }
    
    .top-pays-section { background: white; border-radius: 16px; padding: 20px; }
    .pays-list { display: flex; flex-direction: column; gap: 12px; }
    .pays-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .pays-rank { width: 28px; height: 28px; background: #FDF2F8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #EC4899; }
    .pays-name { flex: 1; font-weight: 500; color: #1F2937; }
    .pays-value { font-size: 14px; font-weight: 600; color: #EC4899; min-width: 100px; text-align: right; }
    .pays-bar { width: 120px; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
    .pays-fill { height: 100%; background: #EC4899; border-radius: 3px; transition: width 0.3s; }
    
    .empty-state { text-align: center; padding: 40px; background: #F9FAFB; border-radius: 12px; color: #9CA3AF; }
    
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .action-buttons { grid-template-columns: 1fr; }
      .charts-row { grid-template-columns: 1fr; }
      .header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class InternationalDashboard implements OnInit {
  today = new Date();
  
  totalImports = 0;
  totalExports = 0;
  totalValeurImports = 0;
  totalValeurExports = 0;
  totalPays = 0;
  totalTransitaires = 0;
  topPays = '--';
  
  paysData: any[] = [];
  topPaysList: any[] = [];
  delaisData: any[] = [];
  recentOperations: any[] = [];
  
  delaisImport = 0;
  delaisExport = 0;
  delaisTransit = 0;
  maxValeur = 0;
  maxTopValeur = 0;
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.loadDeclarations();
    this.loadTransitaires();
    this.loadReglements();
    this.calculerDelais();
  }
  
  loadDeclarations() {
    const saved = localStorage.getItem('declarations_douane');
    const declarations: DeclarationDouane[] = saved ? JSON.parse(saved) : [];
    
    this.totalImports = declarations.filter(d => d.type === 'import').length;
    this.totalExports = declarations.filter(d => d.type === 'export').length;
    this.totalValeurImports = declarations
      .filter(d => d.type === 'import')
      .reduce((sum, d) => sum + (d.valeur_marchandise || 0), 0);
    this.totalValeurExports = declarations
      .filter(d => d.type === 'export')
      .reduce((sum, d) => sum + (d.valeur_marchandise || 0), 0);
    
    // Calcul des pays
    const paysMap = new Map<string, number>();
    declarations.forEach(d => {
      const pays = d.type === 'import' ? d.pays_origine : d.pays_destination;
      if (pays) {
        const current = paysMap.get(pays) || 0;
        paysMap.set(pays, current + (d.valeur_marchandise || 0));
      }
    });
    this.totalPays = paysMap.size;
    
    // Top pays
    this.topPaysList = Array.from(paysMap.entries())
      .map(([pays, valeur]) => ({ pays, valeur }))
      .sort((a, b) => b.valeur - a.valeur)
      .slice(0, 5);
    this.maxTopValeur = this.topPaysList[0]?.valeur || 0;
    this.topPays = this.topPaysList[0]?.pays || '--';
    
    // Données pour graphique
    this.paysData = this.topPaysList.slice(0, 5);
    this.maxValeur = this.paysData[0]?.valeur || 0;
    
    // Dernières opérations
    this.recentOperations = declarations
      .sort((a, b) => new Date(b.date_declaration).getTime() - new Date(a.date_declaration).getTime())
      .slice(0, 5)
      .map(d => ({
        titre: d.type === 'import' ? 'Importation' : d.type === 'export' ? 'Exportation' : 'Transit',
        type: d.type,
        date: d.date_declaration,
        pays: d.type === 'import' ? d.pays_origine : d.pays_destination,
        montant: d.valeur_marchandise,
        statut: d.statut
      }));
  }
  
  loadTransitaires() {
    const saved = localStorage.getItem('transitaires');
    const transitaires: Transitaire[] = saved ? JSON.parse(saved) : [];
    this.totalTransitaires = transitaires.length;
  }
  
  loadReglements() {
    const saved = localStorage.getItem('reglements_internationaux');
    const reglements: Reglement[] = saved ? JSON.parse(saved) : [];
    // Utilisation pour les calculs futurs
  }
  
  calculerDelais() {
    // Simulation de délais basés sur les données
    const saved = localStorage.getItem('declarations_douane');
    const declarations: DeclarationDouane[] = saved ? JSON.parse(saved) : [];
    
    if (declarations.length > 0) {
      this.delaisImport = Math.floor(Math.random() * 10) + 5;
      this.delaisExport = Math.floor(Math.random() * 8) + 3;
      this.delaisTransit = Math.floor(Math.random() * 12) + 7;
    }
  }
  
  refreshData() {
    this.loadData();
  }
  
  getPourcentage(valeur: number, max: number): number {
    if (max === 0) return 0;
    return (valeur / max) * 100;
  }
  
  getStatutLabel(statut: string): string {
    const labels: any = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      soumise: 'Soumise',
      debloquee: 'Débloquée',
      refusee: 'Refusée'
    };
    return labels[statut] || statut;
  }
}