import { BaseModel } from './base.model';

export interface Chauffeur extends BaseModel {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  permis: string;
  date_embauche?: Date;
  statut: 'actif' | 'inactif' | 'conge';
  notes?: string;
}

export interface ChauffeurCreate extends Omit<Chauffeur, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface ChauffeurUpdate extends Partial<Omit<Chauffeur, 'id' | 'user_id'>> {}
