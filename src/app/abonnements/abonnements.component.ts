import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AbonnementService } from '../services/abonnement.service';

@Component({
  selector: 'app-abonnements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="abonnements-page">
      <div class="header">
        <h1>Investissez dans votre croissance</h1>
        <p class="subtitle">Des solutions professionnelles pour les entreprises qui veulent performer</p>
      </div>

      <!-- Plans -->
      <div class="plans-grid">
        <div *ngFor="let plan of plans" class="plan-card" [class.premium]="plan.id === 'corporate'">
          <div class="plan-badge" *ngIf="plan.id === 'business'">POPULAIRE</div>
          <div class="plan-badge premium-badge" *ngIf="plan.id === 'corporate'">PREMIUM</div>
          
          <div class="plan-header">
            <h2>{{ plan.nom }}</h2>
            <div class="plan-price">
              <span class="price">{{ plan.prix | number }} FCFA</span>
              <span class="period">/mois</span>
            </div>
            <p class="plan-desc">{{ plan.description }}</p>
          </div>

          <div class="plan-features">
            <div class="feature highlight">
              <span class="feature-icon">👥</span>
              <span class="feature-text">
                {{ plan.utilisateurs === -1 ? '👑 Utilisateurs illimités' : '👥 ' + plan.utilisateurs + ' utilisateurs' }}
              </span>
            </div>
            
            <div class="feature">
              <span class="feature-icon">⏱️</span>
              <span class="feature-text">Engagement {{ plan.engagement }} mois</span>
            </div>

            <div class="feature-divider">Modules inclus :</div>

            <div class="feature" *ngFor="let module of getModulesLibelles(plan.modules)">
              <span class="feature-icon">✓</span>
              <span class="feature-text">{{ module }}</span>
            </div>

            <div class="feature premium-feature" *ngIf="plan.id === 'corporate'">
              <span class="feature-icon">⭐</span>
              <span class="feature-text">Support dédié 24/7</span>
            </div>
            <div class="feature premium-feature" *ngIf="plan.id === 'corporate'">
              <span class="feature-icon">⭐</span>
              <span class="feature-text">API personnalisée</span>
            </div>
          </div>

          <div class="plan-action">
            <button 
              class="btn-choisir" 
              [class.btn-premium]="plan.id === 'corporate'"
              (click)="preparerPaiement(plan.id)">
              {{ plan.id === 'corporate' ? 'CONTACTER LES VENTES' : 'COMMENCER' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section paiement -->
      <div class="payment-section" *ngIf="selectedPlan && selectedPlan !== 'corporate'">
        <h2>Finaliser votre investissement</h2>
        
        <div class="payment-card">
          <div class="plan-recap">
            <h3>{{ getPlanNom(selectedPlan) }}</h3>
            <p class="plan-recap-price">{{ getPlanPrix(selectedPlan) | number }} FCFA/mois</p>
          </div>

          <div class="payment-details">
            <div class="form-group">
              <label>Durée d'engagement</label>
              <select [(ngModel)]="dureeMois" class="form-control">
                <option [value]="getPlanDureeMin(selectedPlan)">{{ getPlanDureeMin(selectedPlan) }} mois (engagement minimum)</option>
                <option [value]="12">12 mois (économie de 5%)</option>
                <option [value]="24">24 mois (économie de 10%)</option>
                <option [value]="36">36 mois (économie de 15%)</option>
              </select>
              <p class="help-text" *ngIf="dureeMois > getPlanDureeMin(selectedPlan)">
                Économie : {{ getPlanPrix(selectedPlan) * dureeMois * 0.05 | number }} FCFA
              </p>
            </div>

            <div class="total-box">
              <div class="total-row">
                <span>Prix mensuel:</span>
                <span>{{ getPlanPrix(selectedPlan) | number }} FCFA</span>
              </div>
              <div class="total-row">
                <span>Durée:</span>
                <span>{{ dureeMois }} mois</span>
              </div>
              <div class="total-row discount" *ngIf="dureeMois > getPlanDureeMin(selectedPlan)">
                <span>Réduction:</span>
                <span>-{{ getPlanPrix(selectedPlan) * dureeMois * 0.05 | number }} FCFA</span>
              </div>
              <div class="total-row grand-total">
                <span>Total à payer:</span>
                <span>{{ calculerTotal(selectedPlan, dureeMois) | number }} FCFA</span>
              </div>
            </div>
          </div>

          <div class="payment-methods">
            <h3>Mode de paiement</h3>
            <div class="method-options">
              <label class="method-option">
                <input type="radio" name="paiement" value="virement" [(ngModel)]="modePaiement">
                <span>🏦 Virement bancaire</span>
              </label>
              <label class="method-option">
                <input type="radio" name="paiement" value="carte" [(ngModel)]="modePaiement">
                <span>💳 Carte bancaire</span>
              </label>
              <label class="method-option">
                <input type="radio" name="paiement" value="orange" [(ngModel)]="modePaiement">
                <span>📱 Orange Money Pro</span>
              </label>
            </div>
          </div>

          <div class="payment-actions">
            <button class="btn-annuler" (click)="annulerPaiement()">Annuler</button>
            <button class="btn-payer" (click)="payer()" [disabled]="!modePaiement">
              Confirmer le paiement
            </button>
          </div>
        </div>
      </div>

      <!-- Contact pour plan Corporate -->
      <div class="corporate-contact" *ngIf="selectedPlan === 'corporate'">
        <div class="corporate-card">
          <h2>Plan Corporate - Solution sur mesure</h2>
          <p>Notre équipe commerciale vous contactera dans les 24h pour étudier vos besoins spécifiques.</p>
          
          <div class="contact-form">
            <div class="form-group">
              <label>Nom de l'entreprise</label>
              <input type="text" [(ngModel)]="corporateInfo.nom" placeholder="Votre entreprise">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="corporateInfo.email" placeholder="contact@entreprise.com">
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" [(ngModel)]="corporateInfo.telephone" placeholder="+225 00 00 00 00">
            </div>
            <div class="form-group">
              <label>Nombre d'utilisateurs souhaité</label>
              <input type="number" [(ngModel)]="corporateInfo.utilisateurs" placeholder="50">
            </div>
            <div class="form-group">
              <label>Message (optionnel)</label>
              <textarea [(ngModel)]="corporateInfo.message" rows="3" placeholder="Décrivez vos besoins..."></textarea>
            </div>
            
            <div class="contact-actions">
              <button class="btn-annuler" (click)="annulerPaiement()">Annuler</button>
              <button class="btn-payer" (click)="demanderContact()">Envoyer la demande</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Témoignage de réussite -->
      <div class="success-story">
        <h3>Ils nous font confiance</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">150+</span>
            <span class="stat-label">Entreprises clientes</span>
          </div>
          <div class="stat">
            <span class="stat-value">2,5 Mds</span>
            <span class="stat-label">FCFA de CA géré</span>
          </div>
          <div class="stat">
            <span class="stat-value">98%</span>
            <span class="stat-label">Satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .abonnements-page {
      padding: 40px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 48px;
    }

    h1 {
      color: #1F2937;
      font-size: 42px;
      margin: 0 0 16px;
      font-weight: 800;
    }

    .subtitle {
      color: #6B7280;
      font-size: 18px;
    }

    /* Grille des plans */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 48px;
    }

    .plan-card {
      background: white;
      border-radius: 24px;
      padding: 40px 24px;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      border: 2px solid transparent;
    }

    .plan-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(37,99,235,0.2);
    }

    .plan-card.premium {
      background: linear-gradient(135deg, #1F2937, #111827);
      color: white;
    }

    .plan-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #EC4899;
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .premium-badge {
      background: #F59E0B;
    }

    .plan-header {
      text-align: center;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 28px;
      margin-bottom: 16px;
    }

    .plan-price {
      margin-bottom: 12px;
    }

    .price {
      font-size: 42px;
      font-weight: 800;
      color: #EC4899;
    }

    .premium .price {
      color: #F59E0B;
    }

    .period {
      color: #6B7280;
      font-size: 14px;
    }

    .premium .period {
      color: #9CA3AF;
    }

    .plan-desc {
      color: #6B7280;
      font-size: 14px;
      line-height: 1.5;
    }

    .premium .plan-desc {
      color: #D1D5DB;
    }

    .feature-divider {
      font-weight: 600;
      margin: 16px 0 8px;
      color: #EC4899;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      color: #4B5563;
    }

    .premium .feature {
      color: #D1D5DB;
    }

    .feature.highlight {
      background: #F0F9FF;
      padding: 8px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .premium .feature.highlight {
      background: #374151;
    }

    .premium-feature {
      color: #F59E0B !important;
    }

    .plan-action {
      text-align: center;
      margin-top: 32px;
    }

    .btn-choisir {
      background: #EC4899;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      width: 100%;
    }

    .btn-choisir:hover {
      background: #DB2777;
    }

    .btn-premium {
      background: #F59E0B;
    }

    .btn-premium:hover {
      background: #D97706;
    }

    /* Section paiement */
    .payment-section, .corporate-contact {
      max-width: 600px;
      margin: 40px auto;
    }

    .payment-card, .corporate-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .plan-recap {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #F3F4F6;
    }

    .plan-recap h3 {
      color: #EC4899;
      font-size: 24px;
      margin-bottom: 8px;
    }

    .plan-recap-price {
      font-size: 32px;
      font-weight: 700;
      color: #1F2937;
    }

    .help-text {
      color: #10B981;
      font-size: 12px;
      margin-top: 4px;
    }

    .total-box {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #4B5563;
    }

    .discount {
      color: #10B981;
    }

    .grand-total {
      font-weight: 700;
      color: #1F2937;
      font-size: 18px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #E5E7EB;
    }

    .payment-methods {
      margin-bottom: 24px;
    }

    h3 {
      color: #1F2937;
      margin-bottom: 16px;
    }

    .method-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .method-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 12px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .method-option:hover {
      border-color: #EC4899;
      background: #F0F9FF;
    }

    .payment-actions, .contact-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-payer {
      background: #10B981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 16px;
    }

    .btn-payer:hover {
      background: #10B981;
    }

    .btn-annuler {
      background: #EF4444;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Formulaire corporate */
    .corporate-card h2 {
      color: #1F2937;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      color: #4B5563;
      margin-bottom: 4px;
    }

    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
    }

    /* Success story */
    .success-story {
      text-align: center;
      margin-top: 48px;
      padding: 32px;
      background: #F9FAFB;
      border-radius: 16px;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 24px;
    }

    .stat-value {
      display: block;
      font-size: 36px;
      font-weight: 800;
      color: #EC4899;
    }

    .stat-label {
      color: #6B7280;
    }

    @media (max-width: 1024px) {
      .plans-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AbonnementsComponent implements OnInit {
  plans: any[] = [];
  selectedPlan: string | null = null;
  dureeMois: number = 6;
  modePaiement: string = '';
  
  corporateInfo = {
    nom: '',
    email: '',
    telephone: '',
    utilisateurs: 50,
    message: ''
  };

  constructor(
    private abonnementService: AbonnementService,
    private router: Router
  ) {}

  ngOnInit() {
    this.plans = this.abonnementService.plans;
  }

  getModulesLibelles(modules: string[]): string[] {
    const libelles: {[key: string]: string} = {
      'dashboard': 'Tableau de bord',
      'clients': 'Gestion clients',
      'factures': 'Gestion factures',
      'chantiers': 'Suivi chantiers',
      'commercial': 'Module commercial',
      'finance': 'Module finance',
      'rh': 'Ressources humaines',
      'stock': 'Gestion de stock',
      'transport': 'Transport',
      'administration': 'Administration',
      'production': 'Production',
      'international': 'International',
      'api': 'API personnalisée'
    };
    
    return modules.map(m => libelles[m] || m);
  }

  getPlanNom(planId: string): string {
    const plan = this.plans.find(p => p.id === planId);
    return plan ? plan.nom : '';
  }

  getPlanPrix(planId: string): number {
    const plan = this.plans.find(p => p.id === planId);
    return plan ? plan.prix : 0;
  }

  getPlanDureeMin(planId: string): number {
    const plan = this.plans.find(p => p.id === planId);
    return plan ? plan.engagement : 6;
  }

  calculerTotal(planId: string, duree: number): number {
    const prix = this.getPlanPrix(planId);
    let total = prix * duree;
    
    // Réduction pour engagement long
    if (duree >= 24) total *= 0.9;  // -10%
    else if (duree >= 12) total *= 0.95; // -5%
    
    return total;
  }

  preparerPaiement(planId: string) {
    this.selectedPlan = planId;
    if (planId !== 'corporate') {
      this.dureeMois = this.getPlanDureeMin(planId);
    }
  }

  annulerPaiement() {
    this.selectedPlan = null;
    this.modePaiement = '';
  }

  payer() {
    if (this.selectedPlan && this.modePaiement) {
      const total = this.calculerTotal(this.selectedPlan, this.dureeMois);
      this.abonnementService.setAbonnement(this.selectedPlan as any, this.dureeMois);
      
      alert(`✅ Paiement de ${total.toLocaleString()} FCFA effectué avec succès !\nMerci pour votre confiance.`);
      this.router.navigate(['/dashboard']);
    }
  }

  demanderContact() {
    alert(`✅ Demande envoyée ! Notre équipe vous contactera dans les 24h.`);
    this.router.navigate(['/']);
  }
}