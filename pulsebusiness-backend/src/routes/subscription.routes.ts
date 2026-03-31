import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createCheckoutSession,
  getUserSubscriptions,
  cancelSubscription,
  getPlans,
  checkSubscriptionStatus
} from '../controllers/subscription.controller';

const router = Router();

// Routes publiques
router.get('/plans', getPlans);

// Routes protégées
router.post('/create-checkout', authenticateToken, createCheckoutSession);
router.get('/my-subscriptions', authenticateToken, getUserSubscriptions);
router.get('/status', authenticateToken, checkSubscriptionStatus);
router.post('/:subscriptionId/cancel', authenticateToken, cancelSubscription);

export default router;
