import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllEmployes,
  getEmployeById,
  createEmploye,
  updateEmploye,
  deleteEmploye
} from '../controllers/rh.controller';

const router = Router();

// Routes RH
router.get('/employes', authenticateToken, getAllEmployes);
router.get('/employes/:id', authenticateToken, getEmployeById);
router.post('/employes', authenticateToken, createEmploye);
router.put('/employes/:id', authenticateToken, updateEmploye);
router.delete('/employes/:id', authenticateToken, deleteEmploye);

// Routes additionnelles (à développer)
router.get('/paie', authenticateToken, (req, res) => {
  res.json({ message: 'Module paie en cours de développement', data: [] });
});

router.get('/candidatures', authenticateToken, (req, res) => {
  res.json({ message: 'Module candidatures en cours de développement', data: [] });
});

export default router;
