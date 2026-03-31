import { Request, Response } from 'express';
import pool from '../db';

export const getAllEmployes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM employes ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getAll employes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

export const getEmployeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM employes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getEmployeById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

export const createEmploye = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, telephone, poste, date_embauche, salaire } = req.body;
    const result = await pool.query(
      `INSERT INTO employes (nom, prenom, email, telephone, poste, date_embauche, salaire) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nom, prenom, email, telephone, poste, date_embauche, salaire]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createEmploye:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

export const updateEmploye = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, poste, date_embauche, salaire } = req.body;
    const result = await pool.query(
      `UPDATE employes 
       SET nom = $1, prenom = $2, email = $3, telephone = $4, poste = $5, date_embauche = $6, salaire = $7 
       WHERE id = $8 RETURNING *`,
      [nom, prenom, email, telephone, poste, date_embauche, salaire, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateEmploye:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

export const deleteEmploye = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM employes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteEmploye:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
