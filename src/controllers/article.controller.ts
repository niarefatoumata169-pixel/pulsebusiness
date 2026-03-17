import { Request, Response } from 'express';
import { pool } from '../server';
import { ArticleCreate, ArticleUpdate } from '../models/article.model';

export class ArticleController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `SELECT a.*, c.nom as categorie_nom, f.nom as fournisseur_nom
         FROM articles a
         LEFT JOIN categories c ON a.categorie_id = c.id
         LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
         WHERE a.user_id = $1 
         ORDER BY a.nom`,
        [userId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll articles:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des articles' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const articleData: ArticleCreate = req.body;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `INSERT INTO articles (reference, nom, description, categorie_id, categorie_nom, prix_achat, prix_vente, stock_actuel, stock_mini, stock_maxi, emplacement, fournisseur_id, fournisseur_nom, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [articleData.reference, articleData.nom, articleData.description,
         articleData.categorie_id, articleData.categorie_nom, articleData.prix_achat || 0,
         articleData.prix_vente || 0, articleData.stock_actuel || 0,
         articleData.stock_mini || 5, articleData.stock_maxi, articleData.emplacement,
         articleData.fournisseur_id, articleData.fournisseur_nom, userId]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create article:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'article' });
    }
  }
}
