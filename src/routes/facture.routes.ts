import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllFactures,
  getFactureById,
  createFacture,
  updateFacture,
  deleteFacture
} from '../controllers/facture.controller';

const router = Router();

// Routes factures
router.get('/', authenticateToken, getAllFactures);
router.get('/:id', authenticateToken, getFactureById);
router.post('/', authenticateToken, createFacture);
router.put('/:id', authenticateToken, updateFacture);
router.delete('/:id', authenticateToken, deleteFacture);

export default router;
