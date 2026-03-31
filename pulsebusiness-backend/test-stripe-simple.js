// Copie les IDs directement depuis price-ids.ts
const PRICE_IDS = [
  {
    "plan": "STARTUP",
    "product_id": "prod_UBFt5z9jDp4DvQ",
    "monthly_price_id": "price_1TCtNFDUoeROaJ8s6xYNp6Ef",
    "yearly_price_id": "price_1TCtNFDUoeROaJ8sLwqPB4Ix",
    "features": [
      "3 utilisateurs",
      "Tous les modules de base",
      "Support email",
      "Engagement 6 mois"
    ]
  },
  {
    "plan": "BUSINESS",
    "product_id": "prod_UBFtOX2UN71gHf",
    "monthly_price_id": "price_1TCtNHDUoeROaJ8spU6U09TM",
    "yearly_price_id": "price_1TCtNHDUoeROaJ8ssha0akTB",
    "features": [
      "10 utilisateurs",
      "Tous les modules",
      "Export PDF/Excel",
      "Support prioritaire",
      "Engagement 12 mois"
    ]
  },
  {
    "plan": "ENTERPRISE",
    "product_id": "prod_UBFtAhAv8AkQod",
    "monthly_price_id": "price_1TCtNIDUoeROaJ8s3ciLs4v2",
    "yearly_price_id": "price_1TCtNJDUoeROaJ8syhzrd0eg",
    "features": [
      "25 utilisateurs",
      "Modules avancés (RH, Finance, Production)",
      "Support téléphonique",
      "Formation incluse",
      "Engagement 12 mois"
    ]
  },
  {
    "plan": "CORPORATE",
    "product_id": "prod_UBFtp3suIxFkvQ",
    "monthly_price_id": "price_1TCtNLDUoeROaJ8szjfGDp5o",
    "yearly_price_id": "price_1TCtNLDUoeROaJ8seMFhqR5O",
    "features": [
      "Utilisateurs illimités",
      "Multi-sociétés",
      "API personnalisée",
      "Support dédié 24/7",
      "Audit & conseil",
      "Engagement 24 mois"
    ]
  }
];

console.log('📋 Plans disponibles :');
PRICE_IDS.forEach(plan => {
  console.log(`\n${plan.plan}:`);
  console.log(`  - Mensuel: ${plan.monthly_price_id}`);
  console.log(`  - Annuel:  ${plan.yearly_price_id}`);
  console.log(`  - Features: ${plan.features.length} fonctionnalités`);
});
