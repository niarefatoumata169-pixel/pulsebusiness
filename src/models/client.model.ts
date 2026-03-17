import { BaseModel } from './base.model';

export interface Client extends BaseModel {
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  secteur?: string;
  notes?: string;
}

export interface ClientCreate extends Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface ClientUpdate extends Partial<Omit<Client, 'id' | 'user_id'>> {}
