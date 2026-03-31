import { BaseModel } from './base.model';

export interface Candidature extends BaseModel {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste: string;
  date_candidature: Date;
  cv_path?: string;
  lettre_motivation?: string;
  experience?: number; // en années
  formation?: string;
  competences?: string[];
  statut: 'nouvelle' | 'a_traiter' | 'entretien' | 'test' | 'acceptee' | 'refusee';
  notes?: string;
}

export interface CandidatureCreate extends Omit<Candidature, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface CandidatureUpdate extends Partial<Omit<Candidature, 'id' | 'user_id'>> {}
