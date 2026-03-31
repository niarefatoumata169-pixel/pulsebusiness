import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({ 
      message: 'Erreur de validation',
      errors: errors.array() 
    });
  };
};

// Validations communes
export const clientValidations = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('telephone').optional().isMobilePhone('any').withMessage('Téléphone invalide'),
];

export const factureValidations = [
  body('client_id').isInt().withMessage('Client invalide'),
  body('montant_ttc').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('date_emission').isISO8601().withMessage('Date invalide'),
];
