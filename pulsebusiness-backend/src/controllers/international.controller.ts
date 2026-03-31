import { Request, Response } from 'express';
import pool from '../db';

export const getAllDeclarations = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM douanes ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getAll declarations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

export const getDeclarationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM douanes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Déclaration non trouvée' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getDeclarationById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

export const createDeclaration = async (req: Request, res: Response) => {
  try {
    const { numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, transporteur, statut, documents } = req.body;
    const result = await pool.query(
      `INSERT INTO douanes (numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, transporteur, statut, documents) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, transporteur, statut, documents]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createDeclaration:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

export const updateDeclaration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, transporteur, statut, documents } = req.body;
    const result = await pool.query(
      `UPDATE douanes 
       SET numero_declaration = $1, date_declaration = $2, type_marchandise = $3, valeur = $4, pays_origine = $5, pays_destination = $6, transporteur = $7, statut = $8, documents = $9 
       WHERE id = $10 RETURNING *`,
      [numero_declaration, date_declaration, type_marchandise, valeur, pays_origine, pays_destination, transporteur, statut, documents, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Déclaration non trouvée' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateDeclaration:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

export const deleteDeclaration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM douanes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Déclaration non trouvée' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteDeclaration:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
