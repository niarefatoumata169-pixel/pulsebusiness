import { Injectable } from '@angular/core';

export type PlanType = 'startup' | 'business' | 'enterprise' | 'corporate';

export interface Abonnement {
  plan: PlanType;
  dateDebut: Date;
  dateFin: Date;
  actif: boolean;
  utilisateursMax: number;
  modules: string[];
  prixMensuel: number;
  engagementMois: number;
}

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private abonnementKey = 'pulsebusiness_abonnement';

  // Plans disponibles (version HAUT DE GAMME)
  plans = [
    {
      id: 'startup',
      nom: 'Startup',
      prix: 150000,
      utilisateurs: 3,
      engagement: 6,
      modules: [
        'dashboard', 'clients', 'factures', 'chantiers', 
        'commercial', 'stock'
      ],
      description: 'Pour les jeunes entreprises ambitieuses'
    },
    {
      id: 'business',
      nom: 'Business',
      prix: 350000,
      utilisateurs: 10,
      engagement: 12,
      modules: [
        'dashboard', 'clients', 'factures', 'chantiers', 
        'commercial', 'finance', 'rh', 'stock', 'transport'
      ],
      description: 'Solution complète pour PME performantes'
    },
    {
      id: 'enterprise',
      nom: 'Enterprise',
      prix: 750000,
      utilisateurs: 25,
      engagement: 12,
      modules: [
        'dashboard', 'clients', 'factures', 'chantiers', 
        'commercial', 'finance', 'rh', 'stock', 'transport',
        'administration', 'production'
      ],
      description: 'Pour les entreprises structurées'
    },
    {
      id: 'corporate',
      nom: 'Corporate',
      prix: 1500000,
      utilisateurs: -1, // illimité
      engagement: 24,
      modules: [
        'dashboard', 'clients', 'factures', 'chantiers', 
        'commercial', 'finance', 'rh', 'stock', 'transport',
        'administration', 'production', 'international', 'api'
      ],
      description: 'Solution sur-mesure pour grands groupes'
    }
  ];

  constructor() {
    // Pas de plan gratuit
  }

  getAbonnement(): Abonnement | null {
    const saved = localStorage.getItem(this.abonnementKey);
    return saved ? JSON.parse(saved) : null;
  }

  setAbonnement(planId: PlanType, dureeMois?: number) {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return;

    const dateDebut = new Date();
    const dateFin = new Date(dateDebut);
    dateFin.setMonth(dateFin.getMonth() + (dureeMois || plan.engagement));

    const abonnement: Abonnement = {
      plan: planId,
      dateDebut: dateDebut,
      dateFin: dateFin,
      actif: true,
      utilisateursMax: plan.utilisateurs,
      modules: plan.modules,
      prixMensuel: plan.prix,
      engagementMois: plan.engagement
    };

    localStorage.setItem(this.abonnementKey, JSON.stringify(abonnement));
    return abonnement;
  }

  peutAcceder(module: string): boolean {
    const abonnement = this.getAbonnement();
    if (!abonnement || !abonnement.actif) return false;
    
    // Vérifier expiration
    if (new Date() > new Date(abonnement.dateFin)) {
      return false;
    }
    
    return abonnement.modules.includes(module);
  }

  calculerChiffreAffaires(): number {
    // Simulation du CA potentiel
    const abonnements = [
      { plan: 'startup', count: 50 },
      { plan: 'business', count: 30 },
      { plan: 'enterprise', count: 15 },
      { plan: 'corporate', count: 5 }
    ];
    
    let ca = 0;
    abonnements.forEach(a => {
      const plan = this.plans.find(p => p.id === a.plan);
      if (plan) {
        ca += plan.prix * a.count;
      }
    });
    
    return ca;
  }
}