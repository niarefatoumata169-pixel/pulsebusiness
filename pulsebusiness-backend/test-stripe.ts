import { stripe, AVAILABLE_PLANS } from './src/config/stripe';

console.log('📋 Plans disponibles :');
AVAILABLE_PLANS.forEach(plan => {
  console.log(`\n${plan.name}:`);
  console.log(`  - Mensuel: ${plan.monthly_price.toLocaleString()} FCFA (${plan.monthly_price_id})`);
  console.log(`  - Annuel:  ${plan.yearly_price.toLocaleString()} FCFA (${plan.yearly_price_id})`);
});
