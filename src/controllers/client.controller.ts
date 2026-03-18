import { Request, Response } from 'express';
import pool from '../db';

// Récupérer tous les clients
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getAllClients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
};

// Récupérer un client par son ID
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getClientById:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du client' });
  }
};

// Créer un nouveau client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, telephone, adresse, entreprise } = req.body;

    // Vérifier si le client existe déjà
    const existingClient = await pool.query(
      'SELECT * FROM clients WHERE email = $1',
      [email]
    );

    if (existingClient.rows.length > 0) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà' });
    }

    const result = await pool.query(
      `INSERT INTO clients (nom, prenom, email, telephone, adresse, entreprise) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nom, prenom || null, email, telephone || null, adresse || null, entreprise || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createClient:', error);
    res.status(500).json({ message: 'Erreur lors de la création du client' });
  }
};

// Mettre à jour un client
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, adresse, entreprise } = req.body;

    // Vérifier si le client existe
    const existingClient = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );

    if (existingClient.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre client
    if (email && email !== existingClient.rows[0].email) {
      const emailExists = await pool.query(
        'SELECT * FROM clients WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const result = await pool.query(
      `UPDATE clients 
       SET nom = COALESCE($1, nom),
           prenom = COALESCE($2, prenom),
           email = COALESCE($3, email),
           telephone = COALESCE($4, telephone),
           adresse = COALESCE($5, adresse),
           entreprise = COALESCE($6, entreprise)
       WHERE id = $7
       RETURNING *`,
      [nom, prenom, email, telephone, adresse, entreprise, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateClient:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du client' });
  }
};

// Supprimer un client
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si le client a des factures associées
    const factures = await pool.query(
      'SELECT * FROM factures WHERE client_id = $1 LIMIT 1',
      [id]
    );

    if (factures.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce client car il a des factures associées' 
      });
    }

    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur deleteClient:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du client' });
  }
};

// Récupérer les statistiques des clients
export const getClientStats = async (req: Request, res: Response) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM clients');
    const actifs = await pool.query(
      "SELECT COUNT(DISTINCT client_id) FROM factures WHERE date_emission > NOW() - INTERVAL '30 days'"
    );
    const nouveaux = await pool.query(
      "SELECT COUNT(*) FROM clients WHERE created_at > NOW() - INTERVAL '30 days'"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      actifs: parseInt(actifs.rows[0].count),
      nouveaux: parseInt(nouveaux.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur getClientStats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};
