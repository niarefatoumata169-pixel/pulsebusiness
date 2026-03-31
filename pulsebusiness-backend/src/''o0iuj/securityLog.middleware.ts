import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger.service';

export const securityLog = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log les tentatives suspectes
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.socket.remoteAddress;
  
  // Détecter les patterns suspects
  const suspiciousPatterns = [
    /(\'|\")(\s*)(or|and)(\s*)(\d+)(\s*)(=)(\s*)(\d+)/i, // SQL injection
    /<script/i, // XSS
    /\.\.\/|\.\.\\/i, // Path traversal
    /\/etc\/passwd|windows\/win.ini/i // LFI
  ];
  
  const body = JSON.stringify(req.body);
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(body));
  
  if (isSuspicious) {
    logger.warn(`⚠️ Attaque suspecte détectée - IP: ${ip}, Path: ${req.path}, Body: ${body.substring(0, 200)}`);
  }
  
  // Log des requêtes sensibles
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    logger.info(`🔐 Tentative d'auth - IP: ${ip}, Path: ${req.path}`);
  }
  
  // Capture la réponse
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - start;
    
    // Log les erreurs 4xx et 5xx
    if (res.statusCode >= 400) {
      logger.error(`❌ Erreur ${res.statusCode} - ${req.method} ${req.path} - ${duration}ms - IP: ${ip}`);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};
