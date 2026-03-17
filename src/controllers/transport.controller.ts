import { Request, Response } from 'express';
import { pool } from '../config/database';

// ==================== VÉHICULES ====================
export class VehiculeController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await pool.query(
        'SELECT * FROM vehicules WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll vehicules:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM vehicules WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById vehicule:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { immatriculation, marque, modele, annee, type, statut, kilometrage, date_achat, notes } = req.body;

      if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ message: 'Immatriculation, marque et modèle requis' });
      }

      const result = await pool.query(
        `INSERT INTO vehicules (immatriculation, marque, modele, annee, type, statut, kilometrage, date_achat, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [immatriculation, marque, modele, annee, type || 'voiture', statut || 'disponible', kilometrage || 0, date_achat, notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create vehicule:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { immatriculation, marque, modele, annee, type, statut, kilometrage, notes } = req.body;

      const result = await pool.query(
        `UPDATE vehicules 
         SET immatriculation = COALESCE($1, immatriculation),
             marque = COALESCE($2, marque),
             modele = COALESCE($3, modele),
             annee = COALESCE($4, annee),
             type = COALESCE($5, type),
             statut = COALESCE($6, statut),
             kilometrage = COALESCE($7, kilometrage),
             notes = COALESCE($8, notes),
             updated_at = NOW()
         WHERE id = $9 AND user_id = $10
         RETURNING *`,
        [immatriculation, marque, modele, annee, type, statut, kilometrage, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update vehicule:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'DELETE FROM vehicules WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Véhicule non trouvé' });
      }

      res.json({ message: 'Véhicule supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete vehicule:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}

// ==================== CHAUFFEURS ====================
export class ChauffeurController {
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await pool.query(
        'SELECT * FROM chauffeurs WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAll chauffeurs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        'SELECT * FROM chauffeurs WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Chauffeur non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getById chauffeur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { nom, prenom, telephone, email, permis, date_embauche, statut, notes } = req.body;

      if (!nom || !prenom || !permis) {
        return res.status(400).json({ message: 'Nom, prénom et permis requis' });
      }

      const result = await pool.query(
        `INSERT INTO chauffeurs (nom, prenom, telephone, email, permis, date_embauche, statut, notes, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nom, prenom, telephone, email, permis, date_embauche, statut || 'actif', notes, userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur create chauffeur:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { nom, prenom, telephone, email, permis, statut, notes } = req.body;

      const result = await pool.query(
        `UPDATE chauffeurs 
         SET nom = COALESCE($1, nom),
             prenom = COALESCE($2, prenom),
             telephone = COALESCE($3, telephone),
             email = COALESCE($4, email),
             permis = COALESCE($5, permis),
             statut = COALESCE($6, statut),
             notes = COALESCE($7, notes),
             updated_at = NOW()
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [nom, prenom, telephone, email, permis, statut, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Chauffeur non trouvé' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur update chauffeur:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const result = await pool.query(
        'DELETE FROM chauffeurs WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Chauffeur non trouvé' });
      }

      res.json({ message: 'Chauffeur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur delete chauffeur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}
