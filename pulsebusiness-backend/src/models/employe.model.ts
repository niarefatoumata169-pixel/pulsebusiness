import { BaseModel } from './base.model';

export interface Employe extends BaseModel {
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance?: Date;
  lieu_naissance?: string;
  nationalite?: string;
  sexe: 'M' | 'F';
  situation_familiale: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  nombre_enfants?: number;
  
  // Contact
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;  
  // Professionnel
  poste: string;
  departement?: string;
  date_embauche: Date;
  type_contrat: 'CDI' | 'CDD' | 'stage' | 'freelance' | 'interim';
  salaire_base: number;
  mode_paiement: 'virement' | 'cheque' | 'especes';
  numero_compte?: string;
  
  // Statut
  statut: 'actif' | 'inactif' | 'conge' | 'suspendu';
  date_sortie?: Date;
  motif_sortie?: string;
  
  // Documents
  numero_cnss?: string;
  numero_secu?: string;
  
  notes?: string;
}

export interface EmployeCreate extends Omit<Employe, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface EmployeUpdate extends Partial<Omit<Employe, 'id' | 'user_id'>> {}
