import { Router } from 'express';
import { FactureController } from '../controllers/facture.controller';

const router = Router();

router.get('/', FactureController.getAll);
router.get('/:id', FactureController.getById);
router.post('/', FactureController.create);
router.put('/:id', FactureController.update);
router.patch('/:id/statut', FactureController.updateStatut);
router.delete('/:id', FactureController.delete);

export default router;
