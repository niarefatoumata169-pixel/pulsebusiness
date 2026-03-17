import { Router } from 'express';
import { CaisseController } from '../controllers/caisse.controller';

const router = Router();

// Routes pour les caisses
router.get('/', CaisseController.getAllCaisses);
router.get('/:id', CaisseController.getCaisseById);
router.post('/', CaisseController.createCaisse);
router.put('/:id', CaisseController.updateCaisse);
router.delete('/:id', CaisseController.deleteCaisse);

// Routes pour les mouvements
router.get('/:caisseId/mouvements', CaisseController.getMouvements);
router.post('/:caisseId/mouvements', CaisseController.addMouvement);
router.patch('/mouvements/:mouvementId/valider', CaisseController.validerMouvement);
router.delete('/mouvements/:mouvementId', CaisseController.deleteMouvement);

export default router;
