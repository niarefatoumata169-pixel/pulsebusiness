import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="vehicules-container">
      <div class="header">
        <h1>Véhicules</h1>
        <button class="btn-add" routerLink="/transport/vehicules/nouveau">
          + Nouveau véhicule
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Total véhicules</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Disponibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Maintenance</span>
        </div>
      </div>

      <!-- Recherche -->
      <div class="search-box">
        <input type="text" placeholder="🔍 Rechercher un véhicule...">
        <select class="filter-select">
          <option value="">Tous les types</option>
          <option value="camion">Camion</option>
          <option value="fourgon">Fourgon</option>
          <option value="voiture">Voiture</option>
        </select>
      </div>

      <!-- Liste vide -->
      <div class="empty-state">
        <div class="empty-icon">🚗</div>
        <h2>Aucun véhicule trouvé</h2>
        <p>Commencez par ajouter votre premier véhicule</p>
        <button class="btn-primary" routerLink="/transport/vehicules/nouveau">
          + Nouveau véhicule
        </button>
      </div>
    </div>
  `,
  styles: [`
    .vehicules-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #FCE7F3; text-align: center; }
    .stat-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; margin-bottom: 4px; }
    .stat-label { color: #6B7280; font-size: 14px; }
    
    .search-box { display: flex; gap: 15px; margin-bottom: 30px; }
    .search-box input { flex: 2; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; }
    .filter-select { flex: 1; padding: 10px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h2 { color: #1F2937; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; margin-bottom: 20px; }
  `]
})
export class Vehicules implements OnInit {
  ngOnInit() {}
}
