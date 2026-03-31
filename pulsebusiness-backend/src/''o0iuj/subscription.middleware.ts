import { Request, Response, NextFunction } from 'express';
import pool from '../db';

// Vérifier si l'utilisateur a un abonnement actif
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    const subscription = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' 
       AND current_period_end > NOW()`,
      [userId]
    );

    if (subscription.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Abonnement requis pour accéder à cette fonctionnalité',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    (req as any).subscription = subscription.rows[0];
    next();
  } catch (error) {
    console.error('Erreur vérification abonnement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Vérifier si l'utilisateur a un plan spécifique
export const requirePlan = (allowedPlans: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      const subscription = await pool.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 AND status = 'active' 
         AND current_period_end > NOW()`,
        [userId]
      );

      if (subscription.rows.length === 0) {
        return res.status(403).json({ message: 'Abonnement requis' });
      }

      if (!allowedPlans.includes(subscription.rows[0].plan_name)) {
        return res.status(403).json({ 
          message: 'Votre plan ne permet pas d\'accéder à cette fonctionnalité',
          required: allowedPlans,
          current: subscription.rows[0].plan_name
        });
      }

      next();
    } catch (error) {
      console.error('Erreur vérification plan:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};
