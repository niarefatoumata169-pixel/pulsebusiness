import { Request, Response, NextFunction } from 'express';
import pool from '../db';

// Ajouter l'ID de l'utilisateur/entreprise à chaque requête
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  
  if (userId) {
    // Récupérer l'entreprise de l'utilisateur
    const result = await pool.query(
      'SELECT entreprise_id FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length > 0) {
      (req as any).tenantId = result.rows[0].entreprise_id || userId;
    }
  }
  
  next();
};

// Vérifier que l'utilisateur a accès à la ressource
export const checkOwnership = (tableName: string, userIdField: string = 'user_id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const resourceId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND ${userIdField} = $2`,
        [resourceId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Accès non autorisé à cette ressource' });
      }
      
      next();
    } catch (error) {
      console.error('Erreur vérification propriété:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};
