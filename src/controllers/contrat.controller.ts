import { Request, Response } from 'express';
import { pool } from '../server';
import { ContratCreate, ContratUpdate } from '../models/contrat.model';

export class ContratController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `SELECT c.*, cl.nom as client_nom 
         FROM contrats c
         LEFT JOIN clients cl ON c.client_id = cl.id
         WHERE c.user_id = $1 
         ORDER BY c.date_debut DESC`,
        [userId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll contrats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des contrats' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const contratData: ContratCreate = req.body;
      const userId = (req as any).user?.id;
      
      const year = new Date().getFullYear();
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM contrats WHERE EXTRACT(YEAR FROM created_at) = $1',
        [year]
      );
      const count = parseInt(countResult.rows[0].count) + 1;
      const numero = `CT-${year}-${count.toString().padStart(4, '0')}`;
      
      const result = await pool.query(
        `INSERT INTO contrats (numero, client_id, client_nom, type, date_debut, date_fin, montant, periodicite, statut, renouvelable, conditions, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [numero, contratData.client_id, contratData.client_nom, contratData.type,
         contratData.date_debut, contratData.date_fin, contratData.montant,
         contratData.periodicite || 'mensuel', contratData.statut || 'en_negociation',
         contratData.renouvelable || false, contratData.conditions, contratData.notes, userId]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create contrat:', error);
      res.status(500).json({ message: 'Erreur lors de la création du contrat' });
    }
  }
}
