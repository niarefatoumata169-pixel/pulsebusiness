import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import devisRoutes from './devis.routes';
import factureRoutes from './facture.routes';
import caisseRoutes from './caisse.routes';
import transportRoutes from './transport.routes';
import stockRoutes from './stock.routes';
import rhRoutes from './rh.routes';
import internationalRoutes from './international.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.use('/auth', authRoutes);

// Routes protégées
router.use('/clients', authMiddleware, clientRoutes);
router.use('/devis', authMiddleware, devisRoutes);
router.use('/factures', authMiddleware, factureRoutes);
router.use('/caisses', authMiddleware, caisseRoutes);
router.use('/transport', authMiddleware, transportRoutes);
router.use('/stock', authMiddleware, stockRoutes);
router.use('/rh', authMiddleware, rhRoutes);
router.use('/international', authMiddleware, internationalRoutes);

export default router;
