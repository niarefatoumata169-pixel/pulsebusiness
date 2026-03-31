import rateLimit from 'express-rate-limit';

// Limiteur général API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict pour auth
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: {
    message: 'Trop de tentatives de connexion, réessayez dans 1 heure.',
    code: 'AUTH_RATE_LIMIT'
  },
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
});

// Limiteur pour création de comptes
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: {
    message: 'Trop de tentatives d\'inscription, réessayez plus tard.',
    code: 'REGISTER_RATE_LIMIT'
  }
});

// Limiteur pour les routes sensibles (API clés)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    message: 'Trop de requêtes sur cette route sensible.',
    code: 'SENSITIVE_RATE_LIMIT'
  }
});
