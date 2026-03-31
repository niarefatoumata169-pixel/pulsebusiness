const { AVAILABLE_PLANS } = require('./src/config/price-ids');

console.log('📋 Plans disponibles :');
AVAILABLE_PLANS.forEach(plan => {
  console.log(`\n${plan.plan}:`);
  console.log(`  - Mensuel: ${plan.monthly_price_id}`);
  console.log(`  - Annuel:  ${plan.yearly_price_id}`);
});
