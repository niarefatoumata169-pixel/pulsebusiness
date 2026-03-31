import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces pour les données
interface Vehicule {
  id?: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  statut: 'disponible' | 'en_mission' | 'en_maintenance' | 'hors_service';
  prochaine_revision?: string;
  date_achat?: string;
  kilometrage?: number;
  created_at: string;
}

interface Trajet {
  id?: number;
  reference: string;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  chauffeur_id?: number;
  chauffeur_nom?: string;
  date_depart: string;
  date_arrivee?: string;
  depart: string;
  destination: string;
  distance_km: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  notes?: string;
  created_at: string;
}

interface Maintenance {
  id?: number;
  vehicule_id: number;
  vehicule_immatriculation?: string;
  type: 'revision' | 'reparation' | 'controle_technique' | 'autre';
  description: string;
  date_debut: string;
  date_fin?: string;
  cout?: number;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  created_at: string;
}

interface Chauffeur {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  permis: string;
  statut: 'disponible' | 'en_mission' | 'repos';
  created_at: string;
}

@Component({
  selector: 'app-transport-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- En-tête -->
      <div class="header">
        <div>
          <h1>🚛 Dashboard Transport</h1>
          <p class="date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <div class="header-stats">
          <div class="welcome-badge">
            <span class="badge-icon">📊</span>
            <span>Gestion de flotte</span>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card vehicules">
          <div class="kpi-icon">🚛</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalVehicules }}</span>
            <span class="kpi-label">Véhicules</span>
            <span class="kpi-sub">{{ vehiculesDisponibles }} disponibles</span>
          </div>
        </div>
        <div class="kpi-card trajets">
          <div class="kpi-icon">📍</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalTrajets }}</span>
            <span class="kpi-label">Trajets</span>
            <span class="kpi-sub">{{ trajetsEnCours }} en cours</span>
          </div>
        </div>
        <div class="kpi-card maintenance">
          <div class="kpi-icon">🔧</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ totalMaintenances }}</span>
            <span class="kpi-label">Maintenances</span>
            <span class="kpi-sub">{{ maintenancesEnCours }} en cours</span>
          </div>
        </div>
        <div class="kpi-card distance">
          <div class="kpi-icon">📏</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ distanceMois | number }} km</span>
            <span class="kpi-label">Distance ce mois</span>
            <span class="kpi-sub">{{ distanceTotal | number }} km total</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h2>⚡ Actions rapides</h2>
        <div class="action-buttons">
          <a routerLink="/transport/vehicules/nouveau" class="action-btn vehicule">
            <span class="action-icon">🚛</span>
            <div class="action-info">
              <strong>Nouveau véhicule</strong>
              <small>Ajouter à la flotte</small>
            </div>
          </a>
          <a routerLink="/transport/trajets/nouveau" class="action-btn trajet">
            <span class="action-icon">📍</span>
            <div class="action-info">
              <strong>Nouveau trajet</strong>
              <small>Planifier un déplacement</small>
            </div>
          </a>
          <a routerLink="/transport/maintenance/nouveau" class="action-btn maintenance">
            <span class="action-icon">🔧</span>
            <div class="action-info">
              <strong>Maintenance</strong>
              <small>Planifier une révision</small>
            </div>
          </a>
          <a routerLink="/transport/chauffeurs/nouveau" class="action-btn chauffeur">
            <span class="action-icon">👤</span>
            <div class="action-info">
              <strong>Nouveau chauffeur</strong>
              <small>Ajouter un conducteur</small>
            </div>
          </a>
        </div>
      </div>

      <!-- Graphiques / activités -->
      <div class="charts-row">
        <!-- État de la flotte (répartition) -->
        <div class="chart-card">
          <h3>📊 État de la flotte</h3>
          <div class="chart-container" *ngIf="fleetStats.length > 0; else emptyFleet">
            <div class="chart-bars">
              <div class="chart-bar" *ngFor="let stat of fleetStats">
                <div class="bar-info">
                  <span class="bar-label">{{ stat.label }}</span>
                  <span class="bar-value">{{ stat.valeur }} véhicules</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="stat.pourcentage" [style.background]="stat.couleur"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyFleet>
            <div class="empty-chart">
              <div class="empty-icon">🚛</div>
              <p>Aucun véhicule enregistré</p>
            </div>
          </ng-template>
        </div>

        <!-- Activités récentes -->
        <div class="chart-card">
          <h3>🔄 Activités récentes</h3>
          <div class="activities-list" *ngIf="activitesRecentes.length > 0; else emptyActivities">
            <div class="activity-item" *ngFor="let a of activitesRecentes">
              <div class="activity-icon">{{ a.icon }}</div>
              <div class="activity-info">
                <div class="activity-titre">{{ a.titre }}</div>
                <div class="activity-date">{{ a.date | date:'dd/MM/yyyy' }}</div>
              </div>
            </div>
          </div>
          <ng-template #emptyActivities>
            <div class="empty-chart">
              <div class="empty-icon">🔄</div>
              <p>Aucune activité récente</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Alertes maintenance et trajets -->
      <div class="alertes-section">
        <div class="section-header">
          <h3>⚠️ Alertes</h3>
          <a routerLink="/transport/maintenance" class="btn-link">Voir tout →</a>
        </div>
        <div class="alertes-list" *ngIf="alertes.length > 0; else noAlerts">
          <div class="alerte-card" *ngFor="let a of alertes" [class]="a.critique ? 'critique' : 'warning'">
            <div class="alerte-icon">{{ a.type === 'revision' ? '🔧' : a.type === 'trajet' ? '📍' : '⛽' }}</div>
            <div class="alerte-info">
              <div class="alerte-titre">{{ a.titre }}</div>
              <div class="alerte-message">{{ a.message }}</div>
            </div>
          </div>
        </div>
        <ng-template #noAlerts>
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <p>Aucune alerte en cours</p>
          </div>
        </ng-template>
      </div>

      <!-- Top chauffeurs (optionnel) -->
      <div class="top-chauffeurs-section" *ngIf="topChauffeurs.length > 0">
        <h3>🏆 Top chauffeurs (km parcourus)</h3>
        <div class="chauffeurs-list">
          <div class="chauffeur-item" *ngFor="let c of topChauffeurs; let i = index">
            <span class="chauffeur-rank">{{ i + 1 }}</span>
            <span class="chauffeur-name">{{ c.nom }} {{ c.prenom }}</span>
            <span class="chauffeur-value">{{ c.distance | number }} km</span>
            <div class="chauffeur-bar">
              <div class="chauffeur-fill" [style.width.%]="(c.distance / maxDistanceChauffeur) * 100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: #F9FAFB;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    h1 {
      color: #1F2937;
      font-size: 28px;
      margin: 0;
    }
    .date {
      color: #6B7280;
      margin: 8px 0 0 0;
    }
    .header-stats {
      display: flex;
      gap: 12px;
    }
    .welcome-badge {
      background: #FEF3F9;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #EC4899;
      font-size: 14px;
    }

    /* KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.2s;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .kpi-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
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
      font-size: 24px;
      font-weight: 700;
      color: #1F2937;
    }
    .kpi-label {
      font-size: 13px;
      color: #6B7280;
      margin-top: 4px;
    }
    .kpi-sub {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
      display: block;
    }
    .kpi-card.vehicules .kpi-value { color: #EC4899; }
    .kpi-card.trajets .kpi-value { color: #3B82F6; }
    .kpi-card.maintenance .kpi-value { color: #F59E0B; }
    .kpi-card.distance .kpi-value { color: #10B981; }

    /* Actions rapides */
    .quick-actions {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    h2, h3 {
      color: #1F2937;
      margin: 0 0 16px 0;
      font-size: 18px;
    }
    .action-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .action-btn {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 12px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
      border: 1px solid #F3F4F6;
    }
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .action-btn.vehicule:hover { background: #FFE4E6; border-color: #EC4899; }
    .action-btn.trajet:hover { background: #DBEAFE; border-color: #3B82F6; }
    .action-btn.maintenance:hover { background: #FEF3C7; border-color: #F59E0B; }
    .action-btn.chauffeur:hover { background: #DCFCE7; border-color: #10B981; }
    .action-icon { font-size: 28px; }
    .action-info { flex: 1; }
    .action-info strong { display: block; color: #1F2937; margin-bottom: 4px; }
    .action-info small { font-size: 11px; color: #6B7280; }

    /* Graphiques */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
    }
    .chart-container {
      min-height: 200px;
    }
    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .chart-bar {
      width: 100%;
    }
    .bar-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .bar-label {
      font-weight: 500;
      color: #4B5563;
    }
    .bar-value {
      color: #6B7280;
    }
    .bar-container {
      width: 100%;
      height: 8px;
      background: #F3F4F6;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }
    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: #F9FAFB;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .activity-item:hover {
      background: #FEF3F9;
      transform: translateX(4px);
    }
    .activity-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .activity-info {
      flex: 1;
    }
    .activity-titre {
      font-weight: 600;
      font-size: 13px;
      color: #1F2937;
    }
    .activity-date {
      font-size: 10px;
      color: #9CA3AF;
    }
    .empty-chart {
      height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #F9FAFB;
      border-radius: 12px;
      color: #9CA3AF;
      text-align: center;
      gap: 8px;
    }
    .empty-icon {
      font-size: 48px;
      opacity: 0.5;
    }

    /* Alertes */
    .alertes-section {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .btn-link {
      color: #EC4899;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }
    .btn-link:hover {
      text-decoration: underline;
    }
    .alertes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .alerte-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 12px;
      border-left: 4px solid transparent;
    }
    .alerte-card.critique {
      border-left-color: #EF4444;
      background: #FEF2F2;
    }
    .alerte-card.warning {
      border-left-color: #F59E0B;
      background: #FEF3C7;
    }
    .alerte-icon {
      font-size: 24px;
    }
    .alerte-info {
      flex: 1;
    }
    .alerte-titre {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 4px;
    }
    .alerte-message {
      font-size: 12px;
      color: #6B7280;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      background: #F9FAFB;
      border-radius: 12px;
      color: #9CA3AF;
      border: 2px dashed #FCE7F3;
    }

    /* Top chauffeurs */
    .top-chauffeurs-section {
      background: white;
      border-radius: 16px;
      padding: 20px;
    }
    .chauffeurs-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .chauffeur-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    .chauffeur-rank {
      width: 28px;
      height: 28px;
      background: #FDF2F8;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #EC4899;
    }
    .chauffeur-name {
      flex: 1;
      font-weight: 500;
      color: #1F2937;
    }
    .chauffeur-value {
      font-size: 14px;
      font-weight: 600;
      color: #EC4899;
      min-width: 100px;
      text-align: right;
    }
    .chauffeur-bar {
      width: 120px;
      height: 6px;
      background: #F3F4F6;
      border-radius: 3px;
      overflow: hidden;
    }
    .chauffeur-fill {
      height: 100%;
      background: #EC4899;
      border-radius: 3px;
      transition: width 0.3s;
    }

    @media (max-width: 1024px) {
      .action-buttons { grid-template-columns: repeat(2, 1fr); }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .action-buttons { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TransportDashboard implements OnInit {
  today = new Date();

  // Données
  vehicules: Vehicule[] = [];
  trajets: Trajet[] = [];
  maintenances: Maintenance[] = [];
  chauffeurs: Chauffeur[] = [];

  // Métriques
  totalVehicules = 0;
  vehiculesDisponibles = 0;
  vehiculesEnMission = 0;
  vehiculesMaintenance = 0;

  totalTrajets = 0;
  trajetsEnCours = 0;
  distanceMois = 0;
  distanceTotal = 0;

  totalMaintenances = 0;
  maintenancesEnCours = 0;

  // Données dérivées
  fleetStats: { label: string; valeur: number; pourcentage: number; couleur: string }[] = [];
  activitesRecentes: any[] = [];
  alertes: { type: string; titre: string; message: string; critique: boolean }[] = [];
  topChauffeurs: { nom: string; prenom: string; distance: number }[] = [];
  maxDistanceChauffeur = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadVehicules();
    this.loadTrajets();
    this.loadMaintenances();
    this.loadChauffeurs();
    this.computeFleetStats();
    this.computeRecentActivities();
    this.computeAlertes();
    this.computeTopChauffeurs();
  }

  loadVehicules(): void {
    const saved = localStorage.getItem('vehicules');
    this.vehicules = saved ? JSON.parse(saved) : [];
    this.totalVehicules = this.vehicules.length;
    this.vehiculesDisponibles = this.vehicules.filter(v => v.statut === 'disponible').length;
    this.vehiculesEnMission = this.vehicules.filter(v => v.statut === 'en_mission').length;
    this.vehiculesMaintenance = this.vehicules.filter(v => v.statut === 'en_maintenance').length;
  }

  loadTrajets(): void {
    const saved = localStorage.getItem('trajets');
    this.trajets = saved ? JSON.parse(saved) : [];
    this.totalTrajets = this.trajets.length;
    this.trajetsEnCours = this.trajets.filter(t => t.statut === 'en_cours').length;

    // Distance totale et distance du mois
    const now = new Date();
    const moisActuel = now.getMonth();
    const anneeActuelle = now.getFullYear();

    this.distanceTotal = this.trajets.reduce((sum, t) => sum + (t.distance_km || 0), 0);
    this.distanceMois = this.trajets
      .filter(t => {
        const date = new Date(t.date_depart);
        return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
      })
      .reduce((sum, t) => sum + (t.distance_km || 0), 0);
  }

  loadMaintenances(): void {
    const saved = localStorage.getItem('maintenances');
    this.maintenances = saved ? JSON.parse(saved) : [];
    this.totalMaintenances = this.maintenances.length;
    this.maintenancesEnCours = this.maintenances.filter(m => m.statut === 'en_cours').length;
  }

  loadChauffeurs(): void {
    const saved = localStorage.getItem('chauffeurs');
    this.chauffeurs = saved ? JSON.parse(saved) : [];
  }

  computeFleetStats(): void {
    const categories = [
      { label: 'Disponibles', valeur: this.vehiculesDisponibles, couleur: '#10B981' },
      { label: 'En mission', valeur: this.vehiculesEnMission, couleur: '#F59E0B' },
      { label: 'En maintenance', valeur: this.vehiculesMaintenance, couleur: '#EF4444' }
    ];
    const total = this.totalVehicules || 1;
    this.fleetStats = categories.map(cat => ({
      ...cat,
      pourcentage: (cat.valeur / total) * 100
    }));
  }

  computeRecentActivities(): void {
    // Fusionne trajets et maintenances récents, triés par date
    const activites = [
      ...this.trajets.map(t => ({
        type: 'trajet',
        date: t.date_depart,
        titre: `Trajet ${t.reference} : ${t.depart} → ${t.destination}`,
        icon: '📍'
      })),
      ...this.maintenances.map(m => ({
        type: 'maintenance',
        date: m.date_debut,
        titre: `Maintenance ${m.type} : ${m.description}`,
        icon: '🔧'
      }))
    ];
    this.activitesRecentes = activites
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  computeAlertes(): void {
    const now = new Date();
    const alertes: any[] = [];

    // Révisions dépassées
    this.vehicules.forEach(v => {
      if (v.prochaine_revision) {
        const dateRevision = new Date(v.prochaine_revision);
        if (dateRevision < now) {
          alertes.push({
            type: 'revision',
            titre: 'Révision dépassée',
            message: `${v.immatriculation} (${v.marque} ${v.modele}) - révision due depuis ${dateRevision.toLocaleDateString()}`,
            critique: true
          });
        } else {
          const diffJours = Math.ceil((dateRevision.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (diffJours <= 7 && diffJours > 0) {
            alertes.push({
              type: 'revision',
              titre: 'Révision imminente',
              message: `${v.immatriculation} - révision prévue dans ${diffJours} jour(s)`,
              critique: false
            });
          }
        }
      }
    });

    // Trajets en cours sans date d'arrivée planifiée ? Optionnel
    const trajetsSansFin = this.trajets.filter(t => t.statut === 'en_cours' && !t.date_arrivee);
    trajetsSansFin.forEach(t => {
      alertes.push({
        type: 'trajet',
        titre: 'Trajet en cours sans date de fin',
        message: `${t.reference} : ${t.depart} → ${t.destination} (départ le ${new Date(t.date_depart).toLocaleDateString()})`,
        critique: false
      });
    });

    // Maintenances en cours dépassant la durée estimée ? Optionnel
    // Ici on pourrait comparer date_fin prévue mais pas stockée.

    this.alertes = alertes;
  }

  computeTopChauffeurs(): void {
    // Calculer la distance parcourue par chaque chauffeur à partir des trajets
    const chauffeurDistance = new Map<number, number>();

    this.trajets.forEach(t => {
      if (t.chauffeur_id && t.distance_km) {
        const current = chauffeurDistance.get(t.chauffeur_id) || 0;
        chauffeurDistance.set(t.chauffeur_id, current + t.distance_km);
      }
    });

    const top = Array.from(chauffeurDistance.entries())
      .map(([id, distance]) => {
        const chauffeur = this.chauffeurs.find(c => c.id === id);
        if (!chauffeur) return null;
        return {
          id: chauffeur.id,
          nom: chauffeur.nom,
          prenom: chauffeur.prenom,
          distance: distance
        };
      })
      .filter(c => c !== null)
      .sort((a, b) => b!.distance - a!.distance)
      .slice(0, 5) as { nom: string; prenom: string; distance: number }[];

    this.topChauffeurs = top;
    this.maxDistanceChauffeur = top.length ? top[0].distance : 0;
  }
}