import { Request, Response } from 'express';
import { pool } from '../config/database';

export class BaseController {
  protected static async getAll(
    req: Request, 
    res: Response, 
    tableName: string,
    orderBy: string = 'id DESC'
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }
      
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY ${orderBy}`,
        [userId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error(`Erreur getAll ${tableName}:`, error);
      res.status(500).json({ message: `Erreur lors de la récupération` });
    }
  }

  protected static async getById(
    req: Request, 
    res: Response, 
    tableName: string
  ) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Élément non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Erreur getById ${tableName}:`, error);
      res.status(500).json({ message: `Erreur lors de la récupération` });
    }
  }

  protected static async delete(
    req: Request, 
    res: Response, 
    tableName: string
  ) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Élément non trouvé' });
      }
      
      res.json({ message: 'Supprimé avec succès' });
    } catch (error) {
      console.error(`Erreur delete ${tableName}:`, error);
      res.status(500).json({ message: `Erreur lors de la suppression` });
    }
  }
}
