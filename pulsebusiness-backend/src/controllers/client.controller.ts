import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getAll = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const result = await pool.query('SELECT * FROM clients WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { nom, email, telephone, adresse, ville, pays } = req.body;
  if (!nom || !email) return res.status(400).json({ message: 'Nom et email requis' });
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const result = await pool.query(
      'INSERT INTO clients (nom, email, telephone, adresse, ville, pays, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nom, email, telephone, adresse, ville, pays, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse, ville, pays } = req.body;
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const result = await pool.query(
      'UPDATE clients SET nom = $1, email = $2, telephone = $3, adresse = $4, ville = $5, pays = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [nom, email, telephone, adresse, ville, pays, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Exporter un objet ClientController pour les tests
export const ClientController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteClient,
};