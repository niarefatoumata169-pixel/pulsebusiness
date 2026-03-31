import { Request, Response, NextFunction } from 'express';
import pool from '../db';
import useragent from 'useragent';

export const auditMiddleware = (action: string, entityType?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const userId = (req as any).user?.id;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const agent = useragent.parse(userAgent || '');
    
    // Capturer les données avant modification
    let oldData: any = null;
    if (req.params.id && entityType) {
      const tableName = getTableName(entityType);
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length > 0) {
        oldData = result.rows[0];
      }
    }
    
    // Intercepter la réponse
    const originalSend = res.send;
    res.send = function(body: any) {
      const duration = Date.now() - start;
      
      // Log dans la base de données
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let newData = null;
        if (req.method === 'POST' || req.method === 'PUT') {
          newData = req.body;
        }
        
        pool.query(
          `INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_data, new_data, ip, user_agent, 
            device, browser, os, duration, status_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            userId, action, entityType, req.params.id,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            ip, userAgent,
            agent.device.toString(), agent.family, agent.os.toString(),
            duration, res.statusCode
          ]
        ).catch(err => console.error('Erreur audit log:', err));
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

const getTableName = (entityType: string): string => {
  const tables: Record<string, string> = {
    'client': 'clients',
    'facture': 'factures',
    'devis': 'devis',
    'chantier': 'chantiers',
    'user': 'users'
  };
  return tables[entityType] || entityType;
};
