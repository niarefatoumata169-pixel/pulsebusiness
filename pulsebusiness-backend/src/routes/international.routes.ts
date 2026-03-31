import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllDeclarations,
  getDeclarationById,
  createDeclaration,
  updateDeclaration,
  deleteDeclaration
} from '../controllers/international.controller';

const router = Router();

// Routes International
router.get('/douanes', authenticateToken, getAllDeclarations);
router.get('/douanes/:id', authenticateToken, getDeclarationById);
router.post('/douanes', authenticateToken, createDeclaration);
router.put('/douanes/:id', authenticateToken, updateDeclaration);
router.delete('/douanes/:id', authenticateToken, deleteDeclaration);

// Autres routes
router.get('/transitaires', authenticateToken, (req, res) => {
  res.json({ message: 'Module transitaires en cours de développement', data: [] });
});

router.get('/incoterms', authenticateToken, (req, res) => {
  res.json({ message: 'Module incoterms en cours de développement', data: [] });
});

router.get('/reglements', authenticateToken, (req, res) => {
  res.json({ message: 'Module reglements en cours de développement', data: [] });
});

export default router;
