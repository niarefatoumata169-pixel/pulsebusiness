import { Request, Response } from 'express';
import pool from '../db';

// Fonctions individuelles
export const getAllFactures = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.nom as client_nom 
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      ORDER BY f.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getAllFactures:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
};

export const getFactureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT f.*, c.nom as client_nom 
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getFactureById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
  }
};

export const createFacture = async (req: Request, res: Response) => {
  try {
    const { client_id, numero, date_emission, date_echeance, montant_ht, montant_ttc, statut, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO factures (client_id, numero, date_emission, date_echeance, montant_ht, montant_ttc, statut, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [client_id, numero, date_emission, date_echeance, montant_ht, montant_ttc, statut || 'brouillon', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createFacture:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la facture' });
  }
};

export const updateFacture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { client_id, numero, date_emission, date_echeance, montant_ht, montant_ttc, statut, notes } = req.body;

    const result = await pool.query(
      `UPDATE factures 
       SET client_id = COALESCE($1, client_id),
           numero = COALESCE($2, numero),
           date_emission = COALESCE($3, date_emission),
           date_echeance = COALESCE($4, date_echeance),
           montant_ht = COALESCE($5, montant_ht),
           montant_ttc = COALESCE($6, montant_ttc),
           statut = COALESCE($7, statut),
           notes = COALESCE($8, notes)
       WHERE id = $9
       RETURNING *`,
      [client_id, numero, date_emission, date_echeance, montant_ht, montant_ttc, statut, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateFacture:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture' });
  }
};

export const deleteFacture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM factures WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteFacture:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la facture' });
  }
};

// Export d'un objet regroupant toutes les fonctions
export const FactureController = {
  getAllFactures,
  getFactureById,
  createFacture,
  updateFacture,
  deleteFacture
};
