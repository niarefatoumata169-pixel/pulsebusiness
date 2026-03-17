import { Request, Response } from 'express';
import { pool } from '../config/database';

export class CaisseController {
  // ==================== CAISSES ====================
  static async getAllCaisses(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await pool.query(
        'SELECT * FROM caisse WHERE user_id = $1 ORDER BY nom',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll caisses:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getCaisseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM caisse WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Caisse non trouvée' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getCaisseById:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async createCaisse(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { nom, type, solde_initial, devise, responsable, notes } = req.body;

      if (!nom) {
        return res.status(400).json({ message: 'Nom de la caisse requis' });
      }

      const result = await pool.query(
        `INSERT INTO caisse (nom, type, solde_initial, solde_actuel, devise, responsable, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [nom, type || 'principale', solde_initial || 0, solde_initial || 0, devise || 'FCFA', responsable, notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur createCaisse:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async updateCaisse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { nom, type, responsable, notes } = req.body;

      const result = await pool.query(
        `UPDATE caisse 
         SET nom = COALESCE($1, nom),
             type = COALESCE($2, type),
             responsable = COALESCE($3, responsable),
             notes = COALESCE($4, notes),
             updated_at = NOW()
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [nom, type, responsable, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Caisse non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur updateCaisse:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async deleteCaisse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Vérifier s'il y a des mouvements
      const mouvements = await pool.query(
        'SELECT id FROM mouvement_caisse WHERE caisse_id = $1',
        [id]
      );

      if (mouvements.rows.length > 0) {
        return res.status(400).json({ message: 'Impossible de supprimer une caisse avec des mouvements' });
      }

      const result = await pool.query(
        'DELETE FROM caisse WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Caisse non trouvée' });
      }

      res.json({ message: 'Caisse supprimée avec succès' });
    } catch (error) {
      console.error('Erreur deleteCaisse:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }

  // ==================== MOUVEMENTS ====================
  static async getMouvements(req: Request, res: Response) {
    try {
      const { caisseId } = req.params;
      const userId = (req as any).user?.id;

      // Vérifier que la caisse appartient à l'utilisateur
      const caisse = await pool.query(
        'SELECT id FROM caisse WHERE id = $1 AND user_id = $2',
        [caisseId, userId]
      );

      if (caisse.rows.length === 0) {
        return res.status(404).json({ message: 'Caisse non trouvée' });
      }

      const result = await pool.query(
        'SELECT * FROM mouvement_caisse WHERE caisse_id = $1 ORDER BY date DESC, id DESC',
        [caisseId]
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
      
      const { caisseId } = req.params;
      const userId = (req as any).user?.id;
      const { date, type, categorie, montant, motif, mode_paiement, reference, beneficiaire, notes } = req.body;

      // Vérifier que la caisse appartient à l'utilisateur
      const caisse = await client.query(
        'SELECT id, solde_actuel FROM caisse WHERE id = $1 AND user_id = $2',
        [caisseId, userId]
      );

      if (caisse.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Caisse non trouvée' });
      }

      // Vérifier le solde pour une sortie
      if (type === 'sortie' && caisse.rows[0].solde_actuel < montant) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Solde insuffisant' });
      }

      // Ajouter le mouvement
      const mouvementResult = await client.query(
        `INSERT INTO mouvement_caisse (caisse_id, date, type, categorie, montant, motif, mode_paiement, reference, beneficiaire, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [caisseId, date || new Date(), type, categorie, montant, motif, mode_paiement || 'especes', reference, beneficiaire, notes, userId]
      );

      // Mettre à jour le solde de la caisse
      await client.query(
        `UPDATE caisse 
         SET solde_actuel = solde_actuel + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [type === 'entree' ? montant : -montant, caisseId]
      );

      await client.query('COMMIT');
      
      res.status(201).json(mouvementResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur addMouvement:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout du mouvement' });
    } finally {
      client.release();
    }
  }

  static async validerMouvement(req: Request, res: Response) {
    try {
      const { mouvementId } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        `UPDATE mouvement_caisse 
         SET valide = true, 
             date_validation = NOW(), 
             valide_par = $1
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [(req as any).user?.email || 'utilisateur', mouvementId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Mouvement non trouvé' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur validerMouvement:', error);
      res.status(500).json({ message: 'Erreur lors de la validation' });
    }
  }

  static async deleteMouvement(req: Request, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { mouvementId } = req.params;
      const userId = (req as any).user?.id;

      // Récupérer le mouvement
      const mouvement = await client.query(
        'SELECT * FROM mouvement_caisse WHERE id = $1 AND user_id = $2',
        [mouvementId, userId]
      );

      if (mouvement.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Mouvement non trouvé' });
      }

      // Si le mouvement était validé, mettre à jour le solde
      if (mouvement.rows[0].valide) {
        await client.query(
          `UPDATE caisse 
           SET solde_actuel = solde_actuel - $1,
               updated_at = NOW()
           WHERE id = $2`,
          [mouvement.rows[0].type === 'entree' ? mouvement.rows[0].montant : -mouvement.rows[0].montant, mouvement.rows[0].caisse_id]
        );
      }

      // Supprimer le mouvement
      await client.query(
        'DELETE FROM mouvement_caisse WHERE id = $1',
        [mouvementId]
      );

      await client.query('COMMIT');
      
      res.json({ message: 'Mouvement supprimé avec succès' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur deleteMouvement:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    } finally {
      client.release();
    }
  }
}
