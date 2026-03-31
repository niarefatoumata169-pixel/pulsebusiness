import { Request, Response } from 'express';
import { stripe, getPriceId, AVAILABLE_PLANS } from '../config/stripe';
import pool from '../db';

// Créer une session de checkout
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { plan, interval } = req.body;
    const userId = (req as any).user.id;

    // Récupérer l'utilisateur
    const user = await pool.query('SELECT email, nom FROM users WHERE id = $1', [userId]);
    
    // Obtenir le price ID
    const priceId = getPriceId(plan, interval);

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: user.rows[0].email,
      metadata: {
        userId: userId.toString(),
        plan: plan,
        interval: interval
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          plan: plan
        }
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
};

// Récupérer les abonnements de l'utilisateur
export const getUserSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const subscriptions = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(subscriptions.rows);
  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Annuler un abonnement
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const userId = (req as any).user.id;

    // Vérifier que l'abonnement appartient à l'utilisateur
    const sub = await pool.query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1 AND user_id = $2',
      [subscriptionId, userId]
    );

    if (sub.rows.length === 0) {
      return res.status(404).json({ error: 'Abonnement non trouvé' });
    }

    // Annuler sur Stripe (à la fin de la période)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Mettre à jour en base
    await pool.query(
      'UPDATE subscriptions SET cancel_at_period_end = true, updated_at = NOW() WHERE stripe_subscription_id = $1',
      [subscriptionId]
    );

    res.json({ message: 'Abonnement annulé avec succès' });
  } catch (error) {
    console.error('Erreur annulation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation' });
  }
};

// Récupérer les plans disponibles
export const getPlans = (req: Request, res: Response) => {
  res.json(AVAILABLE_PLANS);
};

// Vérifier le statut de l'abonnement
export const checkSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const activeSub = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' 
       AND current_period_end > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (activeSub.rows.length > 0) {
      res.json({
        hasActiveSubscription: true,
        subscription: activeSub.rows[0]
      });
    } else {
      res.json({
        hasActiveSubscription: false,
        subscription: null
      });
    }
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
