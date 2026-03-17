import { Router } from 'express';
import { 
  CategorieController, 
  FournisseurController, 
  ArticleController 
} from '../controllers/stock.controller';

const router = Router();

// Catégories
router.get('/categories', CategorieController.getAll);
router.get('/categories/:id', CategorieController.getById);
router.post('/categories', CategorieController.create);
router.put('/categories/:id', CategorieController.update);
router.delete('/categories/:id', CategorieController.delete);

// Fournisseurs
router.get('/fournisseurs', FournisseurController.getAll);
router.get('/fournisseurs/:id', FournisseurController.getById);
router.post('/fournisseurs', FournisseurController.create);
router.put('/fournisseurs/:id', FournisseurController.update);
router.delete('/fournisseurs/:id', FournisseurController.delete);

// Articles
router.get('/articles', ArticleController.getAll);
router.get('/articles/:id', ArticleController.getById);
router.post('/articles', ArticleController.create);
router.put('/articles/:id', ArticleController.update);
router.delete('/articles/:id', ArticleController.delete);
router.get('/articles/:articleId/mouvements', ArticleController.getMouvements);
router.post('/articles/:articleId/mouvements', ArticleController.addMouvement);

export default router;
