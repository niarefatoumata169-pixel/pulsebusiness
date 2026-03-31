import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-wrapper">
      <!-- Hero section : deux colonnes -->
      <div class="hero">
        <div class="hero-content">
          <div class="hero-left">
            <div class="logo">
              <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
            </div>
            <h1>Le pouls de votre entreprise</h1>
            <p class="description">
              La plateforme qui centralise et simplifie la gestion de votre entreprise.
              Tableaux de bord, facturation, RH, transport, finance – tout en un seul outil.
            </p>
            <div class="buttons">
              <a routerLink="/login" class="btn-primary">Commencer</a>
              <a routerLink="/login" class="btn-secondary">En savoir plus</a>
            </div>
          </div>
          <div class="hero-right">
            <div class="dashboard-preview">
              <div class="preview-card">
                <div class="preview-header">
                  <div class="dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span>Tableau de bord</span>
                </div>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <div class="stat-value">1 234 567</div>
                    <div class="stat-label">CA total</div>
                  </div>
                  <div class="preview-stat">
                    <div class="stat-value">+23%</div>
                    <div class="stat-label">Croissance</div>
                  </div>
                  <div class="preview-stat">
                    <div class="stat-value">128</div>
                    <div class="stat-label">Factures</div>
                  </div>
                </div>
                <div class="preview-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features section -->
      <div class="features">
        <div class="container">
          <h2>Une solution complète</h2>
          <p class="section-subtitle">Tous les outils dont vous avez besoin pour piloter votre entreprise</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>Tableau de bord</h3>
              <p>Visualisez vos indicateurs clés en temps réel</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>Gestion clients</h3>
              <p>Centralisez toutes vos relations clients</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📄</div>
              <h3>Facturation</h3>
              <p>Créez et gérez vos factures facilement</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚛</div>
              <h3>Transport</h3>
              <p>Gérez votre flotte et vos trajets</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👔</div>
              <h3>Ressources humaines</h3>
              <p>Gestion des employés et compétences</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💰</div>
              <h3>Finance</h3>
              <p>Budgets, recouvrements et trésorerie</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta">
        <div class="container">
          <h2>Prêt à digitaliser votre entreprise ?</h2>
          <p>Rejoignez des milliers d’entreprises qui nous font confiance</p>
          <a routerLink="/login" class="btn-primary">Commencer maintenant</a>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">PULSEBUSINESS</div>
            <div class="footer-links">
              <a routerLink="/">Accueil</a>
              <a routerLink="/login">Connexion</a>
              <a href="#">Mentions légales</a>
              <a href="#">Contact</a>
            </div>
            <div class="footer-copyright">
              &copy; {{ currentYear }} PulseBusiness. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --primary: #EC4899;
      --primary-dark: #DB2777;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-500: #6B7280;
      --gray-700: #374151;
      --gray-900: #1F2937;
      --shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero section */
    .hero {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 80px 0;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 60px;
    }

    .hero-left {
      flex: 1;
    }

    .logo {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
    }

    .logo .pulse { color: white; }
    .logo .business { color: rgba(255,255,255,0.9); }

    .hero-left h1 {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .description {
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .buttons {
      display: flex;
      gap: 16px;
      margin-bottom: 0;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 28px;
      border-radius: 40px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-block;
    }

    .btn-primary {
      background: white;
      color: var(--primary);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid white;
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
    }

    /* Hero right - dashboard preview */
    .hero-right {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .dashboard-preview {
      width: 100%;
      max-width: 450px;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    .preview-card {
      background: white;
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      color: var(--gray-900);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .dots {
      display: flex;
      gap: 6px;
    }

    .dots span {
      width: 10px;
      height: 10px;
      background: var(--gray-200);
      border-radius: 50%;
    }

    .preview-header span:last-child {
      font-weight: 500;
      color: var(--gray-500);
    }

    .preview-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .preview-stat {
      text-align: center;
    }

    .preview-stat .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
    }

    .preview-stat .stat-label {
      font-size: 12px;
      color: var(--gray-500);
    }

    .preview-chart {
      height: 100px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
      border-radius: 12px;
      opacity: 0.7;
    }

    /* Features */
    .features {
      padding: 80px 0;
      background: var(--gray-50);
    }

    h2 {
      text-align: center;
      font-size: 36px;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 16px;
    }

    .section-subtitle {
      text-align: center;
      color: var(--gray-500);
      font-size: 18px;
      margin-bottom: 48px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: white;
      padding: 32px;
      border-radius: 24px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: var(--shadow);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 30px -12px rgba(0,0,0,0.1);
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--gray-900);
    }

    .feature-card p {
      color: var(--gray-500);
      line-height: 1.5;
    }

    /* CTA */
    .cta {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 80px 0;
      text-align: center;
    }

    .cta h2 {
      color: white;
      margin-bottom: 16px;
    }

    .cta p {
      font-size: 18px;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .cta .btn-primary {
      background: white;
      color: var(--primary);
      display: inline-block;
    }

    /* Footer */
    .footer {
      background: var(--gray-900);
      color: var(--gray-500);
      padding: 48px 0 32px;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      text-align: center;
    }

    .footer-logo {
      font-size: 24px;
      font-weight: 800;
      color: white;
    }

    .footer-links {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-links a {
      color: var(--gray-500);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    .footer-copyright {
      font-size: 14px;
      border-top: 1px solid var(--gray-700);
      padding-top: 24px;
      width: 100%;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .hero-content {
        flex-direction: column;
        text-align: center;
      }
      .hero-left h1 {
        font-size: 36px;
      }
      .buttons {
        justify-content: center;
      }
      .hero-right {
        margin-top: 40px;
      }
      .features-grid {
        grid-template-columns: 1fr;
      }
      .footer-links {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class AccueilComponent {
  currentYear = new Date().getFullYear();
}