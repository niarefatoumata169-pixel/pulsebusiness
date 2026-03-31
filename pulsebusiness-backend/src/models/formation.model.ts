import { BaseModel } from './base.model';

export interface Formation extends BaseModel {
  titre: string;
  organisme?: string;
  date_debut: Date;
  date_fin: Date;
  duree?: number; // en heures
  lieu?: string;
  cout?: number;
  employes?: number[]; // IDs des employés
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  evaluation?: string;
  notes?: string;
}

export interface FormationCreate extends Omit<Formation, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface FormationUpdate extends Partial<Omit<Formation, 'id' | 'user_id'>> {}
