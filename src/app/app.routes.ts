import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { authGuard } from './auth/auth-guard';

// ===== PAGES PUBLIQUES =====
import { AccueilComponent } from './features/accueil/accueil';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';

// ===== PARTENAIRES ===
import { Partenariats } from './features/partenariats/partenariats';

// ===== CLIENTS =====
import { Clients } from './features/clients/clients';
import { NouveauClient } from './features/clients/nouveau/nouveau';

// ===== FACTURES =====
import { Factures } from './features/factures/factures';

// ===== CHANTIERS =====
import { Chantiers } from './features/chantiers/chantiers';
import { NouveauChantier } from './features/chantiers/nouveau/nouveau';

// ===== COMMERCIAL =====
import { CommercialDashboard } from './features/commercial/commercial-dashboard';
import { Devis } from './features/commercial/devis/devis';
import { Contrats } from './features/commercial/contrats/contrats';
import { Recouvrements } from './features/commercial/recouvrement/recouvrement';
import { Ventes } from './features/pointdevente/ventes';

// ===== FINANCE =====
import { FinanceDashboard } from './features/finance/finance-dashboard';
import { Recouvrement as FinanceRecouvrement } from './features/finance/recouvrement';
import { Tresorerie } from './features/finance/tresorerie';
import { Banque } from './features/finance/banque';
import { Caisse } from './features/finance/caisse';
import { MobileMoney } from './features/finance/mobile-money';
import { Od } from './features/finance/od';
import { Budgets } from './features/finance/budgets';
import { Comptabilite } from './features/finance/comptabilite';

// ===== RESSOURCES HUMAINES =====
import { RhDashboard } from './features/rh/rh-dashboard';
import { Effectifs } from './features/rh/effectifs';
import { Paie } from './features/rh/paie';
import { Securite } from './features/rh/securite';
import { Candidatures } from './features/rh/candidatures';
import { Entretiens } from './features/rh/entretiens';
import { Formations } from './features/rh/formations';
import { Evaluations } from './features/rh/evaluations';
import { Competences } from './features/rh/competences';

// ===== STOCK =====
import { StockDashboard } from './features/stock/stock-dashboard';
import { Articles } from './features/stock/articles';
import { Categories } from './features/stock/categories';
import { Mouvements } from './features/stock/mouvements';
import { Inventaire } from './features/stock/inventaire';
import { Fournisseurs } from './features/stock/fournisseurs';

// ===== TRANSPORT =====
import { TransportDashboard } from './features/transport/transport-dashboard';
import { Vehicules } from './features/transport/vehicules';
import { NouveauVehicule } from './features/transport/nouveau-vehicule';
import { Chauffeurs } from './features/transport/chauffeurs';
import { NouveauChauffeur } from './features/transport/nouveau-chauffeur';
import { Trajets } from './features/transport/trajets';
import { NouveauTrajet } from './features/transport/nouveau-trajet';
import { Maintenance } from './features/transport/maintenance';
import { NouvelleMaintenance } from './features/transport/nouvelle-maintenance';
import { Carburants } from './features/transport/carburant';
import { NouveauCarburant } from './features/transport/nouveau-carburant';

// ===== ADMINISTRATION =====
import { AdminDashboard } from './features/administration/admin-dashboard';
import { Entites } from './features/administration/entites';
import { Filiales } from './features/administration/filiales';
import { Departements } from './features/administration/departements';
import { Postes } from './features/administration/postes';

// ===== PRODUCTION =====
import { ProductionDashboard } from './features/production/production-dashboard';
import { Equipements } from './features/production/equipements';
import { Plannings } from './features/production/plannings';
import { Ordres } from './features/production/ordres';
import { Qualite } from './features/production/qualite';

// ===== INTERNATIONAL =====
import { InternationalDashboard } from './features/international/international-dashboard';
import { Douanes } from './features/international/douanes';
import { NouvelleDeclaration } from './features/international/nouvelle-declaration';
import { Transitaires } from './features/international/transitaires';
import { NouveauTransitaire } from './features/international/nouveau-transitaire';
import { Incoterms } from './features/international/incoterms';
import { NouvelIncoterm } from './features/international/nouvel-incoterm';
import { Reglements } from './features/international/reglements';
import { NouveauReglement } from './features/international/nouveau-reglement';

// ===== PARAMÈTRES & PROFIL =====
import { Parametres } from './features/parametres/parametres';
import { Profil } from './features/profil/profil';

// ===== CALENDRIER =====
import { CalendarComponent } from './features/calendar/calendar.component';

export const routes: Routes = [
  // Routes publiques
  { path: '', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes protégées
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: Clients },
      { path: 'partenariats', component: Partenariats },
      { path: 'clients/nouveau', component: NouveauClient },
      { path: 'factures', component: Factures },
      { path: 'chantiers', component: Chantiers },
      { path: 'chantiers/nouveau', component: NouveauChantier },
      { path: 'commercial/dashboard', component: CommercialDashboard },
      { path: 'commercial/devis', component: Devis },
      { path: 'commercial/ventes', component: Ventes },
      { path: 'commercial/contrats', component: Contrats },
      { path: 'commercial/recouvrement', component: Recouvrements },
      { path: 'finance/dashboard', component: FinanceDashboard },
      { path: 'finance/recouvrement', component: FinanceRecouvrement },
      { path: 'finance/tresorerie', component: Tresorerie },
      { path: 'finance/banque', component: Banque },
      { path: 'finance/caisse', component: Caisse },
      { path: 'finance/mobile-money', component: MobileMoney },
      { path: 'finance/od', component: Od },
      { path: 'finance/budgets', component: Budgets },
      { path: 'finance/comptabilite', component: Comptabilite },
      { path: 'rh/dashboard', component: RhDashboard },
      { path: 'rh/effectifs', component: Effectifs },
      { path: 'rh/paie', component: Paie },
      { path: 'rh/securite', component: Securite },
      { path: 'rh/candidatures', component: Candidatures },
      { path: 'rh/entretiens', component: Entretiens },
      { path: 'rh/formations', component: Formations },
      { path: 'rh/evaluations', component: Evaluations },
      { path: 'rh/competences', component: Competences },
      { path: 'stock/dashboard', component: StockDashboard },
      { path: 'stock/articles', component: Articles },
      { path: 'stock/categories', component: Categories },
      { path: 'stock/mouvements', component: Mouvements },
      { path: 'stock/inventaire', component: Inventaire },
      { path: 'stock/fournisseurs', component: Fournisseurs },
      { path: 'transport/dashboard', component: TransportDashboard },
      { path: 'transport/vehicules', component: Vehicules },
      { path: 'transport/vehicules/nouveau', component: NouveauVehicule },
      { path: 'transport/chauffeurs', component: Chauffeurs },
      { path: 'transport/chauffeurs/nouveau', component: NouveauChauffeur },
      { path: 'transport/trajets', component: Trajets },
      { path: 'transport/trajets/nouveau', component: NouveauTrajet },
      { path: 'transport/maintenance', component: Maintenance },
      { path: 'transport/maintenance/nouveau', component: NouvelleMaintenance },
      { path: 'transport/carburant', component: Carburants },
      { path: 'transport/carburant/nouveau', component: NouveauCarburant },
      { path: 'administration/dashboard', component: AdminDashboard },
      { path: 'administration/entites', component: Entites },
      { path: 'administration/filiales', component: Filiales },
      { path: 'administration/departements', component: Departements },
      { path: 'administration/postes', component: Postes },
      { path: 'production/dashboard', component: ProductionDashboard },
      { path: 'production/equipements', component: Equipements },
      { path: 'production/plannings', component: Plannings },
      { path: 'production/ordres', component: Ordres },
      { path: 'production/qualite', component: Qualite },
      { path: 'international/dashboard', component: InternationalDashboard },
      { path: 'international/douanes', component: Douanes },
      { path: 'international/douanes/nouvelle', component: NouvelleDeclaration },
      { path: 'international/transitaires', component: Transitaires },
      { path: 'international/transitaires/nouveau', component: NouveauTransitaire },
      { path: 'international/incoterms', component: Incoterms },
      { path: 'international/incoterms/nouveau', component: NouvelIncoterm },
      { path: 'international/reglements', component: Reglements },
      { path: 'international/reglements/nouveau', component: NouveauReglement },
      { path: 'parametres', component: Parametres },
      { path: 'profil', component: Profil },
      { path: 'calendar', component: CalendarComponent } // Nouvelle route pour le calendrier
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];