import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero section -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge">✨ La gestion d'entreprise nouvelle génération</div>
        <h1>PULSE<span class="highlight">BUSINESS</span></h1>
        <p class="subtitle">Le pouls de votre entreprise</p>
        <p class="description">
          La plateforme tout-en-un qui centralise et simplifie la gestion de votre entreprise.<br>
          <strong>Commercial, Finance, Stock, RH, Import-Export</strong> – une seule interface.
        </p>
        
        <div class="stats">
          <div class="stat">
            <span class="stat-number">+1 500</span>
            <span class="stat-label">entreprises</span>
          </div>
          <div class="stat">
            <span class="stat-number">97%</span>
            <span class="stat-label">satisfaction</span>
          </div>
          <div class="stat">
            <span class="stat-number">24/7</span>
            <span class="stat-label">support</span>
          </div>
        </div>

        <div class="buttons">
          <a routerLink="/register" class="btn-primary">
            Commencer gratuitement
            <span class="arrow">→</span>
          </a>
          <a routerLink="/login" class="btn-secondary">Se connecter</a>
        </div>

        <p class="trial-info">✅ Sans carte bancaire • 7 jours d'essai</p>
      </div>
    </section>

    <!-- Features section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">FONCTIONNALITÉS</span>
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une suite complète d'outils pour piloter votre activité</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="icon">📊</div>
            <h3>Tableau de bord</h3>
            <p>Visualisez vos indicateurs clés en temps réel et prenez les bonnes décisions</p>
          </div>
          <div class="feature-card">
            <div class="icon">👥</div>
            <h3>Gestion clients</h3>
            <p>Centralisez toutes vos relations clients et suivez votre pipeline commercial</p>
          </div>
          <div class="feature-card">
            <div class="icon">📄</div>
            <h3>Facturation</h3>
            <p>Créez, gérez et suivez vos factures en quelques clics</p>
          </div>
          <div class="feature-card">
            <div class="icon">💰</div>
            <h3>Finance & Caisse</h3>
            <p>Suivi de trésorerie, caisses, budgets et recouvrement</p>
          </div>
          <div class="feature-card">
            <div class="icon">📦</div>
            <h3>Stock & Inventaire</h3>
            <p>Gérez vos stocks, inventaires et recevez des alertes automatiques</p>
          </div>
          <div class="feature-card">
            <div class="icon">🌍</div>
            <h3>Import-Export</h3>
            <p>Douanes, incoterms et réglementations internationales simplifiées</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Solutions par secteur -->
    <section class="solutions">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">SOLUTIONS MÉTIER</span>
          <h2>Adapté à votre secteur</h2>
        </div>

        <div class="solutions-grid">
          <div class="solution-item">🏢 Entreprise</div>
          <div class="solution-item">🏛️ Administration</div>
          <div class="solution-item">📦 Import/Export</div>
          <div class="solution-item">🛍️ Commerce</div>
          <div class="solution-item">🏭 Industrie</div>
          <div class="solution-item">🚚 Transport</div>
          <div class="solution-item">💼 Services</div>
          <div class="solution-item">🌾 Agro-industrie</div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Prêt à transformer votre gestion ?</h2>
        <p>Rejoignez plus de 1 500 entreprises qui nous font confiance</p>
        <a routerLink="/register" class="btn-cta">
          Commencer mon essai gratuit
          <span class="arrow">→</span>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <span class="pulse">PULSE</span><span class="business">BUSINESS</span>
          </div>
          <div class="footer-links">
            <a href="#">À propos</a>
            <a href="#">Contact</a>
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>
          <p class="copyright">© 2026 PulseBusiness. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
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
      background: linear-gradient(135deg, #EC4899, #9D174D);
      color: white;
      padding: 120px 0 80px;
      text-align: center;
    }

    .hero-badge {
      display: inline-block;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 100px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
      letter-spacing: 0.5px;
    }

    h1 {
      font-size: 64px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .highlight {
      color: #FBBF24;
    }

    .subtitle {
      font-size: 24px;
      opacity: 0.9;
      margin-bottom: 24px;
      font-weight: 300;
    }

    .description {
      font-size: 18px;
      opacity: 0.8;
      margin-bottom: 48px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-bottom: 48px;
    }

    .stat-number {
      display: block;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.8;
    }

    .buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 24px;
    }

    .btn-primary, .btn-secondary {
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: white;
      color: #EC4899;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: white;
      color: #EC4899;
    }

    .arrow {
      transition: transform 0.3s;
    }

    .btn-primary:hover .arrow {
      transform: translateX(5px);
    }

    .trial-info {
      font-size: 14px;
      opacity: 0.8;
    }

    /* Features section */
    .features {
      padding: 80px 0;
      background: #F9FAFB;
    }

    .section-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 60px;
    }

    .section-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(236, 72, 153, 0.1);
      color: #EC4899;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }

    h2 {
      color: #1F2937;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 16px;
    }

    .section-header p {
      color: #6B7280;
      font-size: 18px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }

    .feature-card {
      background: white;
      padding: 32px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(236, 72, 153, 0.15);
    }

    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      color: #1F2937;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .feature-card p {
      color: #6B7280;
      line-height: 1.6;
      font-size: 14px;
    }

    /* Solutions section */
    .solutions {
      padding: 60px 0;
      background: white;
    }

    .solutions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 40px;
    }

    .solution-item {
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      color: #4B5563;
      transition: all 0.3s;
      cursor: default;
    }

    .solution-item:hover {
      background: #EC4899;
      color: white;
      transform: scale(1.05);
    }

    /* CTA Section */
    .cta {
      padding: 80px 0;
      background: linear-gradient(135deg, #9D174D, #EC4899);
      color: white;
      text-align: center;
    }

    .cta h2 {
      color: white;
      font-size: 36px;
      margin-bottom: 16px;
    }

    .cta p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 32px;
    }

    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 40px;
      background: white;
      color: #EC4899;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      transition: all 0.3s;
    }

    .btn-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    /* Footer */
    .footer {
      background: #1F2937;
      color: white;
      padding: 40px 0;
    }

    .footer-content {
      text-align: center;
    }

    .footer-logo {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 24px;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 24px;
    }

    .footer-links a {
      color: #9CA3AF;
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: #EC4899;
    }

    .copyright {
      color: #6B7280;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      h1 {
        font-size: 48px;
      }

      .stats {
        flex-direction: column;
        gap: 20px;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .solutions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .footer-links {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class AccueilComponent {}
