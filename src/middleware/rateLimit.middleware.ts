import rateLimit from 'express-rate-limit';

// Limiteur général pour l'API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 tentatives par heure
  message: {
    message: 'Trop de tentatives de connexion, réessayez plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les routes sensibles
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 requêtes par heure
  message: {
    message: 'Trop de requêtes sur cette route sensible.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
