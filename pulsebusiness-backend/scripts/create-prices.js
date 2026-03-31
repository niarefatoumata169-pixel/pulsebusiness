const Stripe = require('stripe');
require('dotenv').config();
const fs = require('fs');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    name: 'STARTUP',
    description: 'Idéal pour les petites structures',
    monthly_price: 150000,
    features: ['3 utilisateurs', 'Tous les modules de base', 'Support email', 'Engagement 6 mois'],
    metadata: { users: '3', engagement: '6', type: 'startup' }
  },
  {
    name: 'BUSINESS',
    description: 'Pour les entreprises en croissance',
    monthly_price: 350000,
    features: ['10 utilisateurs', 'Tous les modules', 'Export PDF/Excel', 'Support prioritaire', 'Engagement 12 mois'],
    metadata: { users: '10', engagement: '12', type: 'business' }
  },
  {
    name: 'ENTERPRISE',
    description: 'Solution complète pour grandes entreprises',
    monthly_price: 750000,
    features: ['25 utilisateurs', 'Modules avancés (RH, Finance, Production)', 'Support téléphonique', 'Formation incluse', 'Engagement 12 mois'],
    metadata: { users: '25', engagement: '12', type: 'enterprise' }
  },
  {
    name: 'CORPORATE',
    description: 'Sur-mesure pour grands groupes',
    monthly_price: 1500000,
    features: ['Utilisateurs illimités', 'Multi-sociétés', 'API personnalisée', 'Support dédié 24/7', 'Audit & conseil', 'Engagement 24 mois'],
    metadata: { users: 'unlimited', engagement: '24', type: 'corporate' }
  }
];

async function createPrices() {
  console.log('🚀 Création des plans dans Stripe...\n');

  const results = [];

  for (const plan of plans) {
    try {
      // 1. Créer le produit
      const product = await stripe.products.create({
        name: `PulseBusiness - ${plan.name}`,
        description: plan.description,
        metadata: plan.metadata,
      });
      
      console.log(`✅ Produit créé: ${product.name}`);

      // 2. Créer le prix mensuel
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly_price,
        currency: 'xof',
        recurring: { interval: 'month' },
        metadata: { 
          plan: plan.name.toLowerCase(), 
          interval: 'month',
          ...plan.metadata 
        }
      });

      console.log(`   💰 Mensuel: ${plan.monthly_price.toLocaleString()} FCFA (${monthlyPrice.id})`);

      // 3. Créer le prix annuel
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly_price * 10,
        currency: 'xof',
        recurring: { interval: 'year' },
        metadata: { 
          plan: plan.name.toLowerCase(), 
          interval: 'year',
          ...plan.metadata
        }
      });

      console.log(`   💰 Annuel: ${(plan.monthly_price * 10).toLocaleString()} FCFA (${yearlyPrice.id})`);
      console.log(`   ✨ Économie: 2 mois offerts\n`);

      results.push({
        plan: plan.name,
        product_id: product.id,
        monthly_price_id: monthlyPrice.id,
        yearly_price_id: yearlyPrice.id,
        features: plan.features
      });

    } catch (error) {
      console.error(`❌ Erreur pour ${plan.name}:`, error.message);
    }
  }

  // Sauvegarder les IDs
  const output = `// Fichier généré automatiquement le ${new Date().toLocaleString()}\n\n` +
    `export const PRICE_IDS = ${JSON.stringify(results, null, 2)};\n`;
  
  fs.writeFileSync('./src/config/price-ids.ts', output);
  console.log('\n✅ IDs sauvegardés dans src/config/price-ids.ts');
  
  // Résumé
  console.log('\n📋 RÉSUMÉ DES PLANS :');
  results.forEach(r => {
    console.log(`\n${r.plan}:`);
    console.log(`  - Mensuel: ${r.monthly_price_id}`);
    console.log(`  - Annuel:  ${r.yearly_price_id}`);
  });
}

createPrices().catch(console.error);
