import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>💰 Finance</h1>
        <p class="subtitle">Gestion financière et trésorerie</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">🏦</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ soldesBancaires | number }} <small>FCFA</small></span>
            <span class="kpi-label">Solde bancaire total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ budgetsTotal | number }} <small>FCFA</small></span>
            <span class="kpi-label">Budgets alloués</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ depensesTotal | number }} <small>FCFA</small></span>
            <span class="kpi-label">Dépenses engagées</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ encaissementsTotal | number }} <small>FCFA</small></span>
            <span class="kpi-label">Encaissements</span>
          </div>
        </div>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/finance/banque">
          <div class="action-icon">🏦</div>
          <h3>Comptes bancaires</h3>
          <p>Gérer les comptes bancaires et soldes</p>
          <span class="action-badge">{{ comptesCount }}</span>
        </div>
        <div class="action-card" routerLink="/finance/budgets">
          <div class="action-icon">💰</div>
          <h3>Budgets</h3>
          <p>Gérer les budgets par département</p>
          <span class="action-badge">{{ budgetsCount }}</span>
        </div>
        <div class="action-card" routerLink="/finance/recouvrement">
          <div class="action-icon">📥</div>
          <h3>Recouvrement</h3>
          <p>Suivi des créances</p>
          <span class="action-badge">{{ recouvrementsCount }}</span>
        </div>
        <div class="action-card" routerLink="/finance/tresorerie">
          <div class="action-icon">📈</div>
          <h3>Trésorerie</h3>
          <p>Flux de trésorerie</p>
          <span class="action-badge">{{ mouvementsCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 32px; }
    h1 { color: #1F2937; font-size: 28px; margin: 0; }
    .subtitle { color: #6B7280; margin-top: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-icon { font-size: 32px; width: 56px; height: 56px; background: #FDF2F8; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-content { flex: 1; }
    .kpi-value { display: block; font-size: 28px; font-weight: 700; color: #EC4899; }
    .kpi-label { font-size: 14px; color: #6B7280; }
    .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .action-card { background: white; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s; border: 1px solid #F3F4F6; position: relative; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: #FCE7F3; }
    .action-icon { font-size: 48px; margin-bottom: 16px; }
    .action-card h3 { margin: 0 0 8px; font-size: 20px; color: #1F2937; }
    .action-card p { margin: 0 0 16px; color: #6B7280; font-size: 14px; }
    .action-badge { background: #FEF3F9; color: #EC4899; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; display: inline-block; }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .actions-grid { grid-template-columns: 1fr; } }
  `]
})
export class FinanceDashboard implements OnInit {
  comptesCount = 0;
  budgetsCount = 0;
  recouvrementsCount = 0;
  mouvementsCount = 0;
  soldesBancaires = 0;
  budgetsTotal = 0;
  depensesTotal = 0;
  encaissementsTotal = 0;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const comptes = localStorage.getItem('comptes_bancaires');
    if (comptes) {
      const comptesParsed = JSON.parse(comptes);
      this.comptesCount = comptesParsed.length;
      this.soldesBancaires = comptesParsed.reduce((sum: number, c: any) => sum + (c.solde || 0), 0);
    }

    const budgets = localStorage.getItem('budgets');
    if (budgets) {
      const budgetsParsed = JSON.parse(budgets);
      this.budgetsCount = budgetsParsed.length;
      this.budgetsTotal = budgetsParsed.reduce((sum: number, b: any) => sum + (b.montant || 0), 0);
    }

    const recouvrements = localStorage.getItem('recouvrements');
    if (recouvrements) {
      this.recouvrementsCount = JSON.parse(recouvrements).length;
    }

    const mouvements = localStorage.getItem('mouvements_tresorerie');
    if (mouvements) {
      const mouvs = JSON.parse(mouvements);
      this.mouvementsCount = mouvs.length;
      this.encaissementsTotal = mouvs.filter((m: any) => m.type === 'encaissement').reduce((sum: number, m: any) => sum + (m.montant || 0), 0);
      this.depensesTotal = mouvs.filter((m: any) => m.type === 'depense').reduce((sum: number, m: any) => sum + (m.montant || 0), 0);
    }
  }
}