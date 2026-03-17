import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorMiddleware = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('❌ Erreur:', err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur interne';
  
  res.status(status).json({ 
    message, 
    error: env.nodeEnv === 'development' ? err.stack : undefined 
  });
};
