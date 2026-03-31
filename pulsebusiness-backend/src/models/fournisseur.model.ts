import { BaseModel } from './base.model';

export interface Fournisseur extends BaseModel {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  notes?: string;
}

export interface FournisseurCreate extends Omit<Fournisseur, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface FournisseurUpdate extends Partial<Omit<Fournisseur, 'id' | 'user_id'>> {}
