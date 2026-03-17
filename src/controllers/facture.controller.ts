import { Request, Response } from 'express';
import { pool } from '../config/database';

export class FactureController {
  // Récupérer toutes les factures
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const result = await pool.query(
        `SELECT f.*, c.nom as client_nom 
         FROM factures f
         LEFT JOIN clients c ON f.client_id = c.id
         WHERE f.user_id = $1 
         ORDER BY f.date_facture DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll factures:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
    }
  }

  // Récupérer une facture par ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        `SELECT f.*, c.nom as client_nom 
         FROM factures f
         LEFT JOIN clients c ON f.client_id = c.id
         WHERE f.id = $1 AND f.user_id = $2`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById facture:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
    }
  }

  // Créer une facture
  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { client_id, client_nom, date_facture, date_echeance, montant_ht, montant_ttc, statut, notes } = req.body;

      if (!client_id && !client_nom) {
        return res.status(400).json({ message: 'Client requis' });
      }

      // Générer un numéro de facture
      const year = new Date().getFullYear();
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM factures WHERE EXTRACT(YEAR FROM date_facture) = $1',
        [year]
      );
      const count = parseInt(countResult.rows[0].count) + 1;
      const numero = `FACT-${year}-${count.toString().padStart(4, '0')}`;

      const result = await pool.query(
        `INSERT INTO factures (numero, client_id, client_nom, date_facture, date_echeance, montant_ht, montant_ttc, statut, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [numero, client_id, client_nom, date_facture, date_echeance, montant_ht, montant_ttc, statut || 'brouillon', notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create facture:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la facture' });
    }
  }

  // Mettre à jour une facture
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { client_id, client_nom, date_facture, date_echeance, montant_ht, montant_ttc, statut, notes } = req.body;

      const result = await pool.query(
        `UPDATE factures 
         SET client_id = COALESCE($1, client_id),
             client_nom = COALESCE($2, client_nom),
             date_facture = COALESCE($3, date_facture),
             date_echeance = COALESCE($4, date_echeance),
             montant_ht = COALESCE($5, montant_ht),
             montant_ttc = COALESCE($6, montant_ttc),
             statut = COALESCE($7, statut),
             notes = COALESCE($8, notes),
             updated_at = NOW()
         WHERE id = $9 AND user_id = $10
         RETURNING *`,
        [client_id, client_nom, date_facture, date_echeance, montant_ht, montant_ttc, statut, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update facture:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  // Supprimer une facture
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'DELETE FROM factures WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      res.json({ message: 'Facture supprimée avec succès' });
    } catch (error) {
      console.error('Erreur delete facture:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }

  // Changer le statut d'une facture
  static async updateStatut(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'UPDATE factures SET statut = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [statut, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur updateStatut facture:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
  }
}
