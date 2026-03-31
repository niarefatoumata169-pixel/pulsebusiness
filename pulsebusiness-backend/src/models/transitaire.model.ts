import { BaseModel } from './base.model';

export interface Transitaire extends BaseModel {
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  numero_agrement?: string;
  notes?: string;
}

export interface TransitaireCreate extends Omit<Transitaire, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface TransitaireUpdate extends Partial<Omit<Transitaire, 'id' | 'user_id'>> {}
