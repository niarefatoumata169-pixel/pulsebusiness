import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pricing-container">
      <h1>Choisissez votre formule</h1>
      <div class="plans">
        <div *ngFor="let plan of plans" class="plan-card">
          <h2>{{ plan.name }}</h2>
          <p class="price">{{ formatPrice(plan) }}</p>
          <button (click)="selectPlan(plan.id)">Choisir</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pricing-container { padding: 24px; }
    .plans { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .plan-card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
  `]
})
export class PricingComponent implements OnInit {
  plans = [
    { id: 'startup', name: 'STARTUP', monthly_price: 150000 },
    { id: 'business', name: 'BUSINESS', monthly_price: 350000 },
    { id: 'enterprise', name: 'ENTERPRISE', monthly_price: 750000 },
    { id: 'corporate', name: 'CORPORATE', monthly_price: 1500000 }
  ];

  ngOnInit() {}

  formatPrice(plan: any): string {
    return plan.monthly_price.toLocaleString() + ' FCFA/mois';
  }

  selectPlan(planId: string) {
    alert('Plan sélectionné: ' + planId);
  }
}
