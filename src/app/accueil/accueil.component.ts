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
        <h1>PULSEBUSINESS</h1>
        <p class="subtitle">Le pouls de votre entreprise</p>
        <p class="description">
          La plateforme qui centralise et simplifie la gestion de votre entreprise
        </p>
        <div class="buttons">
          <a routerLink="/login" class="btn-primary">Se connecter</a>
          <a routerLink="/login" class="btn-secondary">Découvrir</a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <h2>Une solution complète</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon">📊</div>
            <h3>Tableau de bord</h3>
            <p>Visualisez vos indicateurs clés en temps réel</p>
          </div>
          <div class="feature-card">
            <div class="icon">👥</div>
            <h3>Gestion clients</h3>
            <p>Centralisez toutes vos relations clients</p>
          </div>
          <div class="feature-card">
            <div class="icon">📄</div>
            <h3>Facturation</h3>
            <p>Créez et gérez vos factures facilement</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .accueil {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero section */
    .hero {
      background: linear-gradient(135deg, #EC4899, #DB2777);
      color: white;
      padding: 100px 0;
      text-align: center;
    }

    h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .subtitle {
      font-size: 24px;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .description {
      font-size: 18px;
      opacity: 0.8;
      margin-bottom: 32px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary {
      background: white;
      color: #EC4899;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.3);
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

    /* Features section */
    .features {
      padding: 60px 0;
      background: #F9FAFB;
    }

    h2 {
      text-align: center;
      color: #1F2937;
      font-size: 32px;
      margin-bottom: 48px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }

    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(37,99,235,0.15);
    }

    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      color: #1F2937;
      font-size: 20px;
      margin-bottom: 12px;
    }

    .feature-card p {
      color: #6B7280;
      line-height: 1.6;
    }
  `]
})
export class AccueilComponent {}