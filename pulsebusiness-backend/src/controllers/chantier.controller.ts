import { Request, Response } from 'express';
import pool from '../db';

export const getAllChantiers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, cl.nom as client_nom 
      FROM chantiers c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getAllChantiers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des chantiers' });
  }
};

export const getChantierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, cl.nom as client_nom 
      FROM chantiers c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getChantierById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du chantier' });
  }
};

export const createChantier = async (req: Request, res: Response) => {
  try {
    const { nom, client_id, date_debut, date_fin_prevue, montant, adresse, description } = req.body;
    
    const result = await pool.query(
      `INSERT INTO chantiers (nom, client_id, date_debut, date_fin_prevue, montant, adresse, description, statut, avancement) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nom, client_id, date_debut, date_fin_prevue, montant, adresse, description, 'en_cours', 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createChantier:', error);
    res.status(500).json({ message: 'Erreur lors de la création du chantier' });
  }
};

export const updateChantier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, client_id, date_debut, date_fin_prevue, montant, adresse, description, statut, avancement } = req.body;
    
    const result = await pool.query(
      `UPDATE chantiers 
       SET nom = COALESCE($1, nom),
           client_id = COALESCE($2, client_id),
           date_debut = COALESCE($3, date_debut),
           date_fin_prevue = COALESCE($4, date_fin_prevue),
           montant = COALESCE($5, montant),
           adresse = COALESCE($6, adresse),
           description = COALESCE($7, description),
           statut = COALESCE($8, statut),
           avancement = COALESCE($9, avancement),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [nom, client_id, date_debut, date_fin_prevue, montant, adresse, description, statut, avancement, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateChantier:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du chantier' });
  }
};

export const deleteChantier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM chantiers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chantier non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteChantier:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du chantier' });
  }
};
