import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllChantiers,
  getChantierById,
  createChantier,
  updateChantier,
  deleteChantier
} from '../controllers/chantier.controller';

const router = Router();

router.get('/', authenticateToken, getAllChantiers);
router.get('/:id', authenticateToken, getChantierById);
router.post('/', authenticateToken, createChantier);
router.put('/:id', authenticateToken, updateChantier);
router.delete('/:id', authenticateToken, deleteChantier);

export default router;
