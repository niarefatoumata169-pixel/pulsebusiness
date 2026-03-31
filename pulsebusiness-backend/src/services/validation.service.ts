import validator from 'validator';
import axios from 'axios';

// utilitaires
const safeTrim = (v?: string) => (v == null ? '' : String(v).trim());
const parseDate = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};
const getAge = (birthDate: Date): number => {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
};

// ==================== VALIDATION ENTREPRISE ====================

// Validation de la forme juridique
export const isValidFormeJuridique = (forme?: string): boolean => {
  const f = safeTrim(forme).toUpperCase();
  if (!f) return true;
  const formesValides = ['SA', 'SARL', 'SAS', 'EURL', 'EI', 'SNC', 'SASU'];
  return formesValides.includes(f);
};

// Validation de la date de création (ne peut pas être dans le futur)
export const isValidDateCreation = (date?: string): { valid: boolean; message: string } => {
  const v = safeTrim(date);
  if (!v) return { valid: true, message: '' };

  // Accept ISO strings or other parseable dates
  if (!validator.isISO8601(v) && isNaN(Date.parse(v))) {
    return { valid: false, message: 'Date invalide' };
  }

  const creationDate = parseDate(v)!;
  const now = new Date();

  if (creationDate > now) {
    return { valid: false, message: 'La date de création ne peut pas être dans le futur' };
  }

  if (creationDate.getFullYear() < 1900) {
    return { valid: false, message: 'Date de création trop ancienne' };
  }

  return { valid: true, message: '' };
};

// Validation du numéro RC (Registre de Commerce)
export const isValidRC = (rc?: string): { valid: boolean; message: string } => {
  const v = safeTrim(rc).toUpperCase();
  if (!v) return { valid: true, message: '' };

  // Format: CI-ABJ-2025-B-12345 (Côte d'Ivoire) or generic alnum/hyphen
  const rcPattern = /^[A-Z]{2}-[A-Z]{3}-\d{4}-[A-Z]-\d{5}$/;
  const genericPattern = /^[A-Z0-9\-]{5,30}$/;

  if (!rcPattern.test(v) && !genericPattern.test(v)) {
    return { valid: false, message: 'Format RC invalide (ex: CI-ABJ-2025-B-12345)' };
  }

  return { valid: true, message: '' };
};

// Validation du numéro IFU (Identifiant Fiscal Unique)
export const isValidIFU = (ifu?: string): { valid: boolean; message: string } => {
  const v = safeTrim(ifu);
  if (!v) return { valid: true, message: '' };

  // Default: 13 chiffres pour UEMOA, mais accepter variations (12-15) si besoin
  const ifuPattern = /^\d{13}$/;
  if (!ifuPattern.test(v)) {
    return { valid: false, message: 'IFU doit contenir 13 chiffres' };
  }

  return { valid: true, message: '' };
};

// Validation du capital social
export const isValidCapital = (capital?: number | null): { valid: boolean; message: string } => {
  if (capital == null) return { valid: true, message: '' };
  if (!Number.isFinite(capital)) return { valid: false, message: 'Capital invalide' };

  if (capital < 1000) {
    return { valid: false, message: 'Le capital minimum est de 1 000 FCFA' };
  }

  if (capital > 1e10) {
    return { valid: false, message: 'Capital trop élevé' };
  }

  return { valid: true, message: '' };
};

// ==================== VALIDATION PARTICULIER ====================

// Validation de la date de naissance
export const isValidDateNaissance = (date?: string): { valid: boolean; message: string } => {
  const v = safeTrim(date);
  if (!v) return { valid: true, message: '' };

  // Accept ISO or other parseable
  if (!validator.isISO8601(v) && isNaN(Date.parse(v))) {
    return { valid: false, message: 'Date de naissance invalide' };
  }

  const birthDate = parseDate(v)!;
  const now = new Date();

  if (birthDate > now) {
    return { valid: false, message: 'La date de naissance ne peut pas être dans le futur' };
  }

  const age = getAge(birthDate);

  if (age < 18) {
    return { valid: false, message: 'Vous devez avoir au moins 18 ans' };
  }

  if (age > 120) {
    return { valid: false, message: 'Âge invalide' };
  }

  return { valid: true, message: '' };
};

// Validation du lieu de naissance
export const isValidLieuNaissance = (lieu?: string): { valid: boolean; message: string } => {
  const v = safeTrim(lieu);
  if (!v) return { valid: true, message: '' };

  if (v.length < 2) {
    return { valid: false, message: 'Le lieu de naissance doit contenir au moins 2 caractères' };
  }

  if (v.length > 100) {
    return { valid: false, message: 'Lieu trop long' };
  }

  return { valid: true, message: '' };
};

// Validation de la nationalité
export const isValidNationalite = (nationalite?: string): { valid: boolean; message: string } => {
  const v = safeTrim(nationalite);
  if (!v) return { valid: true, message: '' };

  const nationalitesValides = [
    'Ivoirienne', 'Burkinabé', 'Malgache', 'Sénégalaise', 'Malienne',
    'Française', 'Canadienne', 'Belge', 'Suisse', 'Américaine'
  ].map(n => n.toLowerCase());

  if (!nationalitesValides.includes(v.toLowerCase()) && v.length < 3) {
    return { valid: false, message: 'Nationalité invalide' };
  }

  return { valid: true, message: '' };
};

// Validation du numéro CNI/Passeport
export const isValidNumeroPiece = (numPiece?: string, type: 'cni' | 'passeport' = 'cni'): { valid: boolean; message: string } => {
  const v = safeTrim(numPiece).toUpperCase();
  if (!v) return { valid: true, message: '' };

  if (type === 'cni') {
    // Format CNI: C-12345678 ou 12345678
    const cniPattern = /^[A-Z]-\d{8}$|^\d{8}$/;
    if (!cniPattern.test(v)) {
      return { valid: false, message: 'Format CNI invalide (ex: C-12345678)' };
    }
  } else {
    // Format Passeport: AA123456 ou A123456
    const passeportPattern = /^[A-Z]{2}\d{6}$|^[A-Z]\d{6,8}$/;
    if (!passeportPattern.test(v)) {
      return { valid: false, message: 'Format passeport invalide' };
    }
  }

  return { valid: true, message: '' };
};

// Validation de la profession
export const isValidProfession = (profession?: string): { valid: boolean; message: string } => {
  const v = safeTrim(profession);
  if (!v) return { valid: true, message: '' };

  if (v.length < 2) {
    return { valid: false, message: 'Profession invalide' };
  }

  return { valid: true, message: '' };
};

// ==================== VALIDATION SECTEUR ====================

export const isValidSecteur = (secteur?: string): boolean => {
  const s = safeTrim(secteur).toLowerCase();
  if (!s) return true;
  const secteursValides = [
    'btp', 'commerce', 'transport', 'service', 'industrie',
    'agriculture', 'tech', 'sante', 'education', 'autre'
  ];
  return secteursValides.includes(s);
};

// ==================== VÉRIFICATION EXTERNE (API) ====================

// Vérification du numéro IFU via API externe (à configurer avec le service fiscal)
export const verifyIFUExternal = async (ifu: string, pays: string = 'CI'): Promise<{ valid: boolean; message: string }> => {
  try {
    // Implémenter si API disponible
    // const response = await axios.get(`https://api-fiscale.${pays}/verify-ifu/${ifu}`);
    // return { valid: response.data.valid, message: response.data.message };
    return { valid: true, message: '' };
  } catch (error: unknown) {
    return { valid: false, message: 'Impossible de vérifier l\'IFU' };
  }
};

// Vérification du numéro RC via API externe
export const verifyRCExternal = async (rc: string, pays: string = 'CI'): Promise<{ valid: boolean; message: string }> => {
  try {
    // Implémenter si API disponible
    // const response = await axios.get(`https://api-registre.${pays}/verify-rc/${rc}`);
    // return { valid: response.data.valid, message: response.data.message };
    return { valid: true, message: '' };
  } catch (error: unknown) {
    return { valid: false, message: 'Impossible de vérifier le RC' };
  }
};