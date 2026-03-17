import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="invoices-container">
      <!-- En-tête -->
      <div class="header">
        <h1>Gestion des factures</h1>
        <button class="btn-add" routerLink="/factures/nouvelle">
          + Nouvelle facture
        </button>
      </div>

      <!-- Statistiques (vides mais prêtes) -->
      <div class="stats-cards">
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Total factures</span>
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
          <span class="stat-label">Payées</span>
        </div>
      </div>

      <!-- Tableau vide -->
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <h2>Aucune facture pour le moment</h2>
        <p>Commencez par créer votre première facture</p>
        <button class="btn-primary" routerLink="/factures/nouvelle">
          + Créer une facture
        </button>
      </div>

      <!-- Structure du tableau (cachée mais prête) -->
      <div class="table-container" style="display: none;">
        <table class="invoices-table">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Les données viendront plus tard -->
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    h1 {
      color: #1F2937;
      font-size: 28px;
      margin: 0;
    }

    .btn-add {
      background: #EC4899;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #EC4899;
      margin-bottom: 4px;
    }

    .stat-label {
      color: #6B7280;
      font-size: 13px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h2 {
      color: #1F2937;
      margin-bottom: 8px;
    }

    .empty-state p {
      color: #6B7280;
      margin-bottom: 24px;
    }

    .btn-primary {
      background: #EC4899;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }
  `]
})
export class InvoicesComponent {}