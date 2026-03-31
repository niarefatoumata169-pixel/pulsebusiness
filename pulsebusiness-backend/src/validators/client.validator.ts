import Joi from 'joi';

export const clientCreateSchema = Joi.object({
  nom: Joi.string().required().max(200),
  email: Joi.string().email().required().max(255),
  telephone: Joi.string().allow('').optional().max(50),
  adresse: Joi.string().allow('').optional(),
  ville: Joi.string().allow('').optional().max(100),
  code_postal: Joi.string().allow('').optional().max(20),
  pays: Joi.string().allow('').optional().max(100),
  secteur: Joi.string().allow('').optional().max(100),
  notes: Joi.string().allow('').optional()
});

export const clientUpdateSchema = Joi.object({
  nom: Joi.string().max(200).optional(),
  email: Joi.string().email().max(255).optional(),
  telephone: Joi.string().allow('').max(50).optional(),
  adresse: Joi.string().allow('').optional(),
  ville: Joi.string().allow('').max(100).optional(),
  code_postal: Joi.string().allow('').max(20).optional(),
  pays: Joi.string().allow('').max(100).optional(),
  secteur: Joi.string().allow('').max(100).optional(),
  notes: Joi.string().allow('').optional()
});
