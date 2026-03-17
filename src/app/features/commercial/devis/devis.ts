import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="devis-container">
      <div class="header">
        <h1>Devis</h1>
        <button class="btn-add" routerLink="/commercial/devis/nouveau">
          + Nouveau devis
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Total devis</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0 FCFA</span>
          <span class="stat-label">Montant total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Acceptés</span>
        </div>
      </div>

      <!-- Recherche et filtres -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Rechercher...">
        </div>
        
        <select class="filter-select">
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoye">Envoyé</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
          <option value="expire">Expiré</option>
        </select>
        
        <select class="filter-select">
          <option value="">Toutes dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      <!-- Liste vide -->
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Aucun devis</h2>
        <p>Créez votre premier devis</p>
        <button class="btn-primary" routerLink="/commercial/devis/nouveau">
          + Nouveau devis
        </button>
      </div>
    </div>
  `,
  styles: [`
    .devis-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1F2937; margin: 0; }
    .btn-add, .btn-primary { background: #EC4899; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #FCE7F3; text-align: center; }
    .stat-value { display: block; font-size: 24px; font-weight: 700; color: #EC4899; margin-bottom: 4px; }
    .stat-label { color: #6B7280; font-size: 14px; }
    
    .filters-bar { display: flex; gap: 15px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { flex: 2; background: white; border: 2px solid #FCE7F3; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 12px; }
    .search-icon { color: #9CA3AF; }
    .search-box input { flex: 1; border: none; outline: none; background: transparent; }
    .filter-select { flex: 1; padding: 8px 12px; border: 2px solid #FCE7F3; border-radius: 8px; background: white; }
    
    .empty-state { text-align: center; padding: 60px; background: white; border-radius: 12px; border: 2px dashed #FCE7F3; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h2 { color: #1F2937; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; margin-bottom: 20px; }
  `]
})
export class Devis implements OnInit {
  ngOnInit() {}
}
