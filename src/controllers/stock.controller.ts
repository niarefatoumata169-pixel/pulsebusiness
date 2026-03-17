import { Request, Response } from 'express';
import { pool } from '../config/database';

// ==================== CATÉGORIES ====================
export class CategorieController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await pool.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY nom',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll categories:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById categorie:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { nom, description } = req.body;

      if (!nom) {
        return res.status(400).json({ message: 'Nom de la catégorie requis' });
      }

      const result = await pool.query(
        `INSERT INTO categories (nom, description, user_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [nom, description, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create categorie:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { nom, description } = req.body;

      const result = await pool.query(
        `UPDATE categories 
         SET nom = COALESCE($1, nom),
             description = COALESCE($2, description),
             updated_at = NOW()
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [nom, description, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update categorie:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Vérifier si des articles utilisent cette catégorie
      const articles = await pool.query(
        'SELECT id FROM articles WHERE categorie_id = $1',
        [id]
      );

      if (articles.rows.length > 0) {
        return res.status(400).json({ message: 'Impossible de supprimer une catégorie avec des articles' });
      }

      const result = await pool.query(
        'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
      console.error('Erreur delete categorie:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}

// ==================== FOURNISSEURS ====================
export class FournisseurController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await pool.query(
        'SELECT * FROM fournisseurs WHERE user_id = $1 ORDER BY nom',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll fournisseurs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM fournisseurs WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById fournisseur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { nom, email, telephone, adresse, ville, pays, notes } = req.body;

      if (!nom) {
        return res.status(400).json({ message: 'Nom du fournisseur requis' });
      }

      const result = await pool.query(
        `INSERT INTO fournisseurs (nom, email, telephone, adresse, ville, pays, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [nom, email, telephone, adresse, ville, pays, notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create fournisseur:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { nom, email, telephone, adresse, ville, pays, notes } = req.body;

      const result = await pool.query(
        `UPDATE fournisseurs 
         SET nom = COALESCE($1, nom),
             email = COALESCE($2, email),
             telephone = COALESCE($3, telephone),
             adresse = COALESCE($4, adresse),
             ville = COALESCE($5, ville),
             pays = COALESCE($6, pays),
             notes = COALESCE($7, notes),
             updated_at = NOW()
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [nom, email, telephone, adresse, ville, pays, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update fournisseur:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Vérifier si des articles utilisent ce fournisseur
      const articles = await pool.query(
        'SELECT id FROM articles WHERE fournisseur_id = $1',
        [id]
      );

      if (articles.rows.length > 0) {
        return res.status(400).json({ message: 'Impossible de supprimer un fournisseur avec des articles' });
      }

      const result = await pool.query(
        'DELETE FROM fournisseurs WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      res.json({ message: 'Fournisseur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete fournisseur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}

// ==================== ARTICLES ====================
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
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `SELECT a.*, c.nom as categorie_nom, f.nom as fournisseur_nom
         FROM articles a
         LEFT JOIN categories c ON a.categorie_id = c.id
         LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
         WHERE a.id = $1 AND a.user_id = $2`,
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById article:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { reference, nom, description, categorie_id, prix_achat, prix_vente, stock_actuel, stock_mini, stock_maxi, emplacement, fournisseur_id } = req.body;

      if (!reference || !nom) {
        return res.status(400).json({ message: 'Référence et nom requis' });
      }

      // Récupérer les noms
      let categorie_nom = null;
      if (categorie_id) {
        const cat = await pool.query('SELECT nom FROM categories WHERE id = $1 AND user_id = $2', [categorie_id, userId]);
        categorie_nom = cat.rows[0]?.nom;
      }

      let fournisseur_nom = null;
      if (fournisseur_id) {
        const four = await pool.query('SELECT nom FROM fournisseurs WHERE id = $1 AND user_id = $2', [fournisseur_id, userId]);
        fournisseur_nom = four.rows[0]?.nom;
      }

      const result = await pool.query(
        `INSERT INTO articles (reference, nom, description, categorie_id, categorie_nom, prix_achat, prix_vente, stock_actuel, stock_mini, stock_maxi, emplacement, fournisseur_id, fournisseur_nom, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [reference, nom, description, categorie_id, categorie_nom, prix_achat || 0, prix_vente || 0, stock_actuel || 0, stock_mini || 5, stock_maxi, emplacement, fournisseur_id, fournisseur_nom, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create article:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { reference, nom, description, categorie_id, prix_achat, prix_vente, stock_mini, stock_maxi, emplacement, fournisseur_id } = req.body;

      // Récupérer les noms si nécessaire
      let categorie_nom = null;
      if (categorie_id) {
        const cat = await pool.query('SELECT nom FROM categories WHERE id = $1 AND user_id = $2', [categorie_id, userId]);
        categorie_nom = cat.rows[0]?.nom;
      }

      let fournisseur_nom = null;
      if (fournisseur_id) {
        const four = await pool.query('SELECT nom FROM fournisseurs WHERE id = $1 AND user_id = $2', [fournisseur_id, userId]);
        fournisseur_nom = four.rows[0]?.nom;
      }

      const result = await pool.query(
        `UPDATE articles 
         SET reference = COALESCE($1, reference),
             nom = COALESCE($2, nom),
             description = COALESCE($3, description),
             categorie_id = COALESCE($4, categorie_id),
             categorie_nom = COALESCE($5, categorie_nom),
             prix_achat = COALESCE($6, prix_achat),
             prix_vente = COALESCE($7, prix_vente),
             stock_mini = COALESCE($8, stock_mini),
             stock_maxi = COALESCE($9, stock_maxi),
             emplacement = COALESCE($10, emplacement),
             fournisseur_id = COALESCE($11, fournisseur_id),
             fournisseur_nom = COALESCE($12, fournisseur_nom),
             updated_at = NOW()
         WHERE id = $13 AND user_id = $14
         RETURNING *`,
        [reference, nom, description, categorie_id, categorie_nom, prix_achat, prix_vente, stock_mini, stock_maxi, emplacement, fournisseur_id, fournisseur_nom, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update article:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'DELETE FROM articles WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      res.json({ message: 'Article supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete article:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }

  // Mouvements de stock
  static async getMouvements(req: Request, res: Response) {
    try {
      const { articleId } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'SELECT * FROM mouvement_stock WHERE article_id = $1 AND user_id = $2 ORDER BY date_mouvement DESC',
        [articleId, userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getMouvements:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async addMouvement(req: Request, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { articleId } = req.params;
      const userId = (req as any).user?.id;
      const { type, quantite, motif, reference, notes } = req.body;

      // Récupérer l'article
      const article = await client.query(
        'SELECT * FROM articles WHERE id = $1 AND user_id = $2',
        [articleId, userId]
      );

      if (article.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      // Vérifier le stock pour une sortie
      if (type === 'sortie' && article.rows[0].stock_actuel < quantite) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Stock insuffisant' });
      }

      // Ajouter le mouvement
      const mouvementResult = await client.query(
        `INSERT INTO mouvement_stock (article_id, type, quantite, motif, reference, date_mouvement, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
         RETURNING *`,
        [articleId, type, quantite, motif, reference, notes, userId]
      );

      // Mettre à jour le stock
      const newStock = type === 'entree' 
        ? article.rows[0].stock_actuel + quantite
        : article.rows[0].stock_actuel - quantite;

      await client.query(
        'UPDATE articles SET stock_actuel = $1, updated_at = NOW() WHERE id = $2',
        [newStock, articleId]
      );

      await client.query('COMMIT');
      
      res.status(201).json(mouvementResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur addMouvement stock:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout du mouvement' });
    } finally {
      client.release();
    }
  }
}
