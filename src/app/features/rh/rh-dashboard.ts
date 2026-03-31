import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>👥 Ressources Humaines</h1>
        <p class="subtitle">Gestion du personnel et des compétences</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ effectifsCount }}</span>
            <span class="kpi-label">Effectif total</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">📄</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ candidaturesCount }}</span>
            <span class="kpi-label">Candidatures</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🎓</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formationsCount }}</span>
            <span class="kpi-label">Formations</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ evaluationsMoyenne | number:'1.0-1' }}</span>
            <span class="kpi-label">Note moyenne</span>
          </div>
        </div>
      </div>

      <div class="actions-grid">
        <div class="action-card" routerLink="/rh/effectifs">
          <div class="action-icon">👥</div>
          <h3>Effectifs</h3>
          <p>Gérer les employés</p>
          <span class="action-badge">{{ effectifsCount }}</span>
        </div>
        <div class="action-card" routerLink="/rh/paie">
          <div class="action-icon">💰</div>
          <h3>Paie</h3>
          <p>Gérer les bulletins de paie</p>
        </div>
        <div class="action-card" routerLink="/rh/securite">
          <div class="action-icon">🛡️</div>
          <h3>Sécurité</h3>
          <p>Documents et formations sécurité</p>
        </div>
        <div class="action-card" routerLink="/rh/candidatures">
          <div class="action-icon">📄</div>
          <h3>Candidatures</h3>
          <p>Gérer les candidats</p>
          <span class="action-badge">{{ candidaturesCount }}</span>
        </div>
        <div class="action-card" routerLink="/rh/entretiens">
          <div class="action-icon">🗣️</div>
          <h3>Entretiens</h3>
          <p>Planifier les entretiens</p>
        </div>
        <div class="action-card" routerLink="/rh/formations">
          <div class="action-icon">🎓</div>
          <h3>Formations</h3>
          <p>Gérer les formations</p>
          <span class="action-badge">{{ formationsCount }}</span>
        </div>
        <div class="action-card" routerLink="/rh/evaluations">
          <div class="action-icon">⭐</div>
          <h3>Évaluations</h3>
          <p>Évaluations de performance</p>
        </div>
        <div class="action-card" routerLink="/rh/competences">
          <div class="action-icon">💪</div>
          <h3>Compétences</h3>
          <p>Gestion des compétences</p>
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
    .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .action-card { background: white; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s; border: 1px solid #F3F4F6; position: relative; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: #FCE7F3; }
    .action-icon { font-size: 48px; margin-bottom: 16px; }
    .action-card h3 { margin: 0 0 8px; font-size: 20px; color: #1F2937; }
    .action-card p { margin: 0 0 16px; color: #6B7280; font-size: 14px; }
    .action-badge { background: #FEF3F9; color: #EC4899; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; display: inline-block; }
    @media (max-width: 1024px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .actions-grid { grid-template-columns: 1fr; } }
  `]
})
export class RhDashboard implements OnInit {
  effectifsCount = 0;
  candidaturesCount = 0;
  formationsCount = 0;
  evaluationsMoyenne = 0;

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    const effectifs = localStorage.getItem('effectifs');
    this.effectifsCount = effectifs ? JSON.parse(effectifs).length : 0;
    const candidatures = localStorage.getItem('candidatures');
    this.candidaturesCount = candidatures ? JSON.parse(candidatures).length : 0;
    const formations = localStorage.getItem('formations');
    this.formationsCount = formations ? JSON.parse(formations).length : 0;
    const evaluations = localStorage.getItem('evaluations');
    if (evaluations) {
      const evals = JSON.parse(evaluations);
      if (evals.length) {
        const sum = evals.reduce((acc: number, e: any) => acc + (e.note || 0), 0);
        this.evaluationsMoyenne = sum / evals.length;
      }
    }
  }
}