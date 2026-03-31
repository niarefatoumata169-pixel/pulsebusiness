import validator from 'validator';

export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true
  });
};

export const isValidPhone = (phone: string): boolean => {
  return validator.isMobilePhone(phone, 'any', { strictMode: true });
};

export const isValidPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }
  return { valid: true, message: '' };
};

export const isValidMontant = (montant: number): boolean => {
  return montant > 0 && montant < 1000000000000;
};

export const isValidDate = (date: string): boolean => {
  return validator.isISO8601(date);
};
