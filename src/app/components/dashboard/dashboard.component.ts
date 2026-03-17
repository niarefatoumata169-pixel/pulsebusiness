import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Tableau de bord</h2>
      
      @if (loading) {
        <div class="loading">Chargement...</div>
      }
      
      @if (error) {
        <div class="error">{{error}}</div>
      }
      
      @if (!loading && !error) {
        <div class="stats">
          <div class="stat-card">
            <h3>Clients</h3>
            <p>{{clients.length || 0}}</p>
          </div>
          
          <div class="stat-card">
            <h3>Employés</h3>
            <p>{{employes.length || 0}}</p>
          </div>
          
          <div class="stat-card">
            <h3>Devis</h3>
            <p>{{devis.length || 0}}</p>
          </div>
          
          <div class="stat-card">
            <h3>Factures</h3>
            <p>{{factures.length || 0}}</p>
          </div>
        </div>
      }

      @if (employes.length > 0) {
        <div class="data-section">
          <h3>Liste des employés</h3>
          <ul>
            @for (e of employes; track e.id) {
              <li>{{e.nom}} {{e.prenom}} - {{e.poste || 'N/A'}}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card h3 { margin: 0; font-size: 14px; color: #666; }
    .stat-card p { margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #333; }
    .loading { color: #666; font-style: italic; }
    .error { color: red; }
    .data-section { margin-top: 30px; }
  `]
})
export class DashboardComponent implements OnInit {
  clients: any[] = [];
  employes: any[] = [];
  devis: any[] = [];
  factures: any[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [clients, employes, devis, factures] = await Promise.all([
        this.api.getClients(),
        this.api.getEmployes(),
        this.api.getDevis(),
        this.api.getFactures()
      ]);
      
      this.clients = clients || [];
      this.employes = employes || [];
      this.devis = devis || [];
      this.factures = factures || [];
    } catch (err) {
      this.error = 'Erreur lors du chargement des données';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}
