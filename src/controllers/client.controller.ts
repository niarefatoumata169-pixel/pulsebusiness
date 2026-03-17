import { Request, Response } from 'express';
import { pool } from '../config/database';
import { BaseController } from './base.controller';

export class ClientController extends BaseController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }
      
      const result = await pool.query(
        'SELECT * FROM clients WHERE user_id = $1 ORDER BY nom',
        [userId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll clients:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById client:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { nom, email, telephone, adresse, ville, code_postal, pays, secteur, notes } = req.body;
      
      if (!nom || !email) {
        return res.status(400).json({ message: 'Nom et email requis' });
      }

      const result = await pool.query(
        `INSERT INTO clients (nom, email, telephone, adresse, ville, code_postal, pays, secteur, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [nom, email, telephone, adresse, ville, code_postal, pays, secteur, notes, userId]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create client:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { nom, email, telephone, adresse, ville, code_postal, pays, secteur, notes } = req.body;

      const result = await pool.query(
        `UPDATE clients 
         SET nom = COALESCE($1, nom),
             email = COALESCE($2, email),
             telephone = COALESCE($3, telephone),
             adresse = COALESCE($4, adresse),
             ville = COALESCE($5, ville),
             code_postal = COALESCE($6, code_postal),
             pays = COALESCE($7, pays),
             secteur = COALESCE($8, secteur),
             notes = COALESCE($9, notes),
             updated_at = NOW()
         WHERE id = $10 AND user_id = $11
         RETURNING *`,
        [nom, email, telephone, adresse, ville, code_postal, pays, secteur, notes, id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update client:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }
      
      res.json({ message: 'Supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete client:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}
