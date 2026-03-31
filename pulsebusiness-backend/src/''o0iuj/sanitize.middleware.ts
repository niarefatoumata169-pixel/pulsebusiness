import xss from 'xss';
import { Request, Response, NextFunction } from 'express';

// Sanitise tous les champs texte
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any) => {
    if (!obj) return obj;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key].trim());
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};
