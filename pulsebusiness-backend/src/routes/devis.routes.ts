import { Router } from 'express';
import { DevisController } from '../controllers/devis.controller';

const router = Router();

router.get('/', DevisController.getAll);
router.get('/:id', DevisController.getById);
router.post('/', DevisController.create);
router.delete('/:id', DevisController.delete);
router.get('/:id/articles', DevisController.getArticles);
router.post('/:id/articles', DevisController.addArticle);

export default router;
