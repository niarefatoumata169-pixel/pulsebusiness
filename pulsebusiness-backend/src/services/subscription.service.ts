import { stripe } from '../config/stripe';
import pool from '../db';

export const createCheckoutSession = async (userId: number, priceId: string, successUrl: string, cancelUrl: string) => {
  try {
    // Récupérer l'utilisateur
    const user = await pool.query('SELECT email, nom, stripe_customer_id FROM users WHERE id = $1', [userId]);
    
    let customerId = user.rows[0].stripe_customer_id;
    
    // Créer un customer Stripe si pas encore existant
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.rows[0].email,
        name: user.rows[0].nom,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
      
      // Sauvegarder l'ID Stripe dans la base
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
    }

    // Créer une session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { userId: userId.toString() }
      },
      // Activer les taxes automatiques
      automatic_tax: { enabled: true },
      // Collecter l'adresse pour les taxes
      customer_update: { address: 'auto' },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Erreur création session:', error);
    throw error;
  }
};

export const handleSubscriptionWebhook = async (event: any) => {
  const subscription = event.data.object;
  
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Abonnement créé:', subscription.id);
      break;
      
    case 'customer.subscription.updated':
      console.log('Abonnement mis à jour:', subscription.id);
      break;
      
    case 'customer.subscription.deleted':
      console.log('Abonnement annulé:', subscription.id);
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = subscription;
      const customerId = invoice.customer;
      const user = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [customerId]);
      
      if (user.rows.length > 0) {
        // Mettre à jour le statut de l'utilisateur
        await pool.query('UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2', 
          ['active', user.rows[0].id]);
        
        // Enregistrer la facture
        await pool.query(
          'INSERT INTO invoices (user_id, stripe_invoice_id, amount, status, invoice_date, invoice_pdf) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.rows[0].id, invoice.id, invoice.amount_paid / 100, 'paid', new Date(invoice.created * 1000), invoice.invoice_pdf]
        );
      }
      break;
      
    case 'invoice.payment_failed':
      // Gérer l'échec de paiement
      const failedInvoice = subscription;
      const failedCustomer = failedInvoice.customer;
      const failedUser = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [failedCustomer]);
      
      if (failedUser.rows.length > 0) {
        await pool.query('UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2', 
          ['past_due', failedUser.rows[0].id]);
      }
      break;
  }
};
