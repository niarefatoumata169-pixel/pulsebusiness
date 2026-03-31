import Stripe from 'stripe';
import { PRICE_IDS } from './price-ids';

// Pas de version fixe - Stripe utilise la dernière version compatible
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Réexporter les IDs pour les utiliser ailleurs
export { PRICE_IDS };

// Helper pour récupérer un prix par nom de plan et intervalle
export const getPriceId = (plan: string, interval: 'month' | 'year'): string => {
  const planData = PRICE_IDS.find(p => p.plan.toLowerCase() === plan.toLowerCase());
  if (!planData) throw new Error(`Plan ${plan} non trouvé`);
  return interval === 'month' ? planData.monthly_price_id : planData.yearly_price_id;
};

// Helper pour récupérer les infos d'un plan
export const getPlanInfo = (plan: string) => {
  return PRICE_IDS.find(p => p.plan.toLowerCase() === plan.toLowerCase());
};

// Prix en FCFA
const PRICES = {
  STARTUP: { monthly: 150000, yearly: 1500000 },
  BUSINESS: { monthly: 350000, yearly: 3500000 },
  ENTERPRISE: { monthly: 750000, yearly: 7500000 },
  CORPORATE: { monthly: 1500000, yearly: 15000000 }
};

// Liste des plans disponibles
export const AVAILABLE_PLANS = PRICE_IDS.map(p => ({
  id: p.plan.toLowerCase(),
  name: p.plan,
  monthly_price_id: p.monthly_price_id,
  yearly_price_id: p.yearly_price_id,
  features: p.features,
  monthly_price: PRICES[p.plan as keyof typeof PRICES].monthly,
  yearly_price: PRICES[p.plan as keyof typeof PRICES].yearly
}));
