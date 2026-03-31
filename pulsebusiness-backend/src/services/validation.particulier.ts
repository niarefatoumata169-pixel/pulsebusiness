import validator from 'validator';

// ==================== VALIDATION PARTICULIER ====================

// 1. Date de naissance - Validation stricte
export const isValidDateNaissance = (date: string): { valid: boolean; message: string } => {
  if (!date) {
    return { valid: false, message: 'La date de naissance est obligatoire' };
  }

  const birthDate = new Date(date);
  const now = new Date();
  
  // Vérifier si la date est valide
  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: 'Format de date invalide (JJ/MM/AAAA)' };
  }
  
  // Ne peut pas être dans le futur
  if (birthDate > now) {
    return { valid: false, message: 'La date de naissance ne peut pas être dans le futur' };
  }
  
  // Calculer l'âge exact
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Âge minimum 18 ans
  if (age < 18) {
    return { valid: false, message: 'Vous devez avoir au moins 18 ans pour vous inscrire' };
  }
  
  // Âge maximum 120 ans
  if (age > 120) {
    return { valid: false, message: 'Âge invalide' };
  }
  
  return { valid: true, message: '' };
};

// 2. Lieu de naissance
export const isValidLieuNaissance = (lieu: string): { valid: boolean; message: string } => {
  if (!lieu) {
    return { valid: false, message: 'Le lieu de naissance est obligatoire' };
  }
  
  if (lieu.length < 2) {
    return { valid: false, message: 'Le lieu de naissance doit contenir au moins 2 caractères' };
  }
  
  if (lieu.length > 100) {
    return { valid: false, message: 'Le lieu de naissance est trop long' };
  }
  
  // Vérifier qu'il n'y a pas de caractères spéciaux indésirables
  const cleanLieu = lieu.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '');
  if (cleanLieu !== lieu) {
    return { valid: false, message: 'Le lieu de naissance ne doit contenir que des lettres' };
  }
  
  return { valid: true, message: '' };
};

// 3. Nationalité
export const isValidNationalite = (nationalite: string): { valid: boolean; message: string } => {
  if (!nationalite) {
    return { valid: false, message: 'La nationalité est obligatoire' };
  }
  
  const nationalitesValides = [
    'Ivoirienne', 'Burkinabé', 'Malienne', 'Sénégalaise', 'Guinéenne',
    'Française', 'Canadienne', 'Belge', 'Suisse', 'Américaine',
    'Nigériane', 'Ghanéenne', 'Béninoise', 'Togolaise', 'Libérienne',
    'Mauritanienne', 'Marocaine', 'Algérienne', 'Tunisienne', 'Égyptienne'
  ];
  
  if (!nationalitesValides.includes(nationalite) && nationalite.length < 3) {
    return { valid: false, message: 'Nationalité non reconnue ou invalide' };
  }
  
  return { valid: true, message: '' };
};

// 4. Numéro CNI (Carte Nationale d'Identité)
export const isValidCNI = (cni: string): { valid: boolean; message: string } => {
  if (!cni) {
    return { valid: false, message: 'Le numéro de CNI est obligatoire' };
  }
  
  // Format Côte d'Ivoire: C-12345678 ou 12345678
  const cniPatternCI = /^C-\d{8}$|^\d{8}$/;
  
  // Format Mali: 123456789
  const cniPatternML = /^\d{9}$/;
  
  // Format Sénégal: 123456789012
  const cniPatternSN = /^\d{12}$/;
  
  // Format général
  const generalPattern = /^[A-Z0-9\-]{6,20}$/;
  
  if (!cniPatternCI.test(cni) && !cniPatternML.test(cni) && 
      !cniPatternSN.test(cni) && !generalPattern.test(cni)) {
    return { valid: false, message: 'Format de CNI invalide (ex: C-12345678 ou 12345678)' };
  }
  
  return { valid: true, message: '' };
};

// 5. Numéro Passeport
export const isValidPasseport = (passeport: string): { valid: boolean; message: string } => {
  if (!passeport) {
    return { valid: false, message: 'Le numéro de passeport est obligatoire' };
  }
  
  // Format passeport: AA123456 ou A123456
  const passeportPattern = /^[A-Z]{2}\d{6}$|^[A-Z]\d{6,8}$/;
  
  if (!passeportPattern.test(passeport)) {
    return { valid: false, message: 'Format de passeport invalide (ex: AA123456 ou A1234567)' };
  }
  
  return { valid: true, message: '' };
};

// 6. Numéro de pièce (CNI ou Passeport) - Détection automatique
export const isValidNumeroPiece = (numPiece: string, type: string = 'auto'): { valid: boolean; message: string } => {
  if (!numPiece) {
    return { valid: false, message: 'Le numéro de pièce d\'identité est obligatoire' };
  }
  
  if (type === 'cni') {
    return isValidCNI(numPiece);
  } else if (type === 'passeport') {
    return isValidPasseport(numPiece);
  } else {
    // Détection automatique
    if (/^[A-Z]{2}\d{6}$|^[A-Z]\d{6,8}$/.test(numPiece)) {
      return isValidPasseport(numPiece);
    } else {
      return isValidCNI(numPiece);
    }
  }
};

// 7. Profession
export const isValidProfession = (profession: string): { valid: boolean; message: string } => {
  if (!profession) {
    return { valid: false, message: 'La profession est obligatoire' };
  }
  
  if (profession.length < 2) {
    return { valid: false, message: 'La profession doit contenir au moins 2 caractères' };
  }
  
  if (profession.length > 100) {
    return { valid: false, message: 'La profession est trop longue' };
  }
  
  const professionsValides = [
    'Commerçant', 'Agriculteur', 'Éleveur', 'Fonctionnaire', 'Enseignant',
    'Médecin', 'Infirmier', 'Avocat', 'Ingénieur', 'Architecte',
    'Informaticien', 'Comptable', 'Consultant', 'Artisan', 'Transporteur',
    'Étudiant', 'Retraité', 'Sans emploi', 'Homme d\'affaires', 'Entrepreneur'
  ];
  
  // Vérification optionnelle - liste de professions courantes
  if (!professionsValides.includes(profession) && profession.length > 3) {
    // Accepte quand même les professions personnalisées
    return { valid: true, message: '' };
  }
  
  return { valid: true, message: '' };
};

// 8. Adresse
export const isValidAdresse = (adresse: string): { valid: boolean; message: string } => {
  if (!adresse) return { valid: true, message: '' };
  
  if (adresse.length < 5) {
    return { valid: false, message: 'L\'adresse doit contenir au moins 5 caractères' };
  }
  
  if (adresse.length > 200) {
    return { valid: false, message: 'L\'adresse est trop longue' };
  }
  
  return { valid: true, message: '' };
};

// 9. Code postal
export const isValidCodePostal = (codePostal: string, pays: string = 'CI'): { valid: boolean; message: string } => {
  if (!codePostal) return { valid: true, message: '' };
  
  const patterns: Record<string, RegExp> = {
    CI: /^\d{5}$/,      // Côte d'Ivoire: 5 chiffres
    FR: /^\d{5}$/,      // France: 5 chiffres
    SN: /^\d{5}$/,      // Sénégal: 5 chiffres
    ML: /^\d{5}$/,      // Mali: 5 chiffres
    BF: /^\d{5}$/,      // Burkina: 5 chiffres
    US: /^\d{5}(-\d{4})?$/ // USA: 5 chiffres ou 5+4
  };
  
  const pattern = patterns[pays] || /^\d{4,6}$/;
  
  if (!pattern.test(codePostal)) {
    return { valid: false, message: 'Code postal invalide' };
  }
  
  return { valid: true, message: '' };
};

// 10. Vérification de l'âge pour les services spécifiques
export const isAgeSufficient = (dateNaissance: string, ageMin: number = 18): boolean => {
  const birthDate = new Date(dateNaissance);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= ageMin;
};

// 11. Validation complète pour particulier
export const validateParticulier = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Date de naissance
  const dateCheck = isValidDateNaissance(data.dateNaissance);
  if (!dateCheck.valid) errors.push(dateCheck.message);
  
  // Lieu de naissance
  const lieuCheck = isValidLieuNaissance(data.lieuNaissance);
  if (!lieuCheck.valid) errors.push(lieuCheck.message);
  
  // Nationalité
  const nationaliteCheck = isValidNationalite(data.nationalite);
  if (!nationaliteCheck.valid) errors.push(nationaliteCheck.message);
  
  // Numéro de pièce
  const pieceCheck = isValidNumeroPiece(data.numPiece, data.typePiece || 'auto');
  if (!pieceCheck.valid) errors.push(pieceCheck.message);
  
  // Profession
  const professionCheck = isValidProfession(data.profession);
  if (!professionCheck.valid) errors.push(professionCheck.message);
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  isValidDateNaissance,
  isValidLieuNaissance,
  isValidNationalite,
  isValidCNI,
  isValidPasseport,
  isValidNumeroPiece,
  isValidProfession,
  isValidAdresse,
  isValidCodePostal,
  isAgeSufficient,
  validateParticulier
};
