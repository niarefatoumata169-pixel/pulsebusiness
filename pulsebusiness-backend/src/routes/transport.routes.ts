import { Router } from 'express';
import { VehiculeController, ChauffeurController } from '../controllers/transport.controller';

const router = Router();

// Routes pour les véhicules
router.get('/vehicules', VehiculeController.getAll);
router.get('/vehicules/:id', VehiculeController.getById);
router.post('/vehicules', VehiculeController.create);
router.put('/vehicules/:id', VehiculeController.update);
router.delete('/vehicules/:id', VehiculeController.delete);

// Routes pour les chauffeurs
router.get('/chauffeurs', ChauffeurController.getAll);
router.get('/chauffeurs/:id', ChauffeurController.getById);
router.post('/chauffeurs', ChauffeurController.create);
router.put('/chauffeurs/:id', ChauffeurController.update);
router.delete('/chauffeurs/:id', ChauffeurController.delete);

export default router;
