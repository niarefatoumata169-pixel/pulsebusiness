import { BaseModel } from './base.model';

export interface Incoterm extends BaseModel {
  code: string;
  libelle: string;
  description: string;
  categorie: 'E' | 'F' | 'C' | 'D';
  transport: 'tous' | 'maritime' | 'terrestre' | 'aerien';
  lieu_transfert_risques: string;
  repartition_frais: string;
  assurance: boolean;
  douane_export: 'vendeur' | 'acheteur';
  douane_import: 'vendeur' | 'acheteur';
  transport_principal: 'vendeur' | 'acheteur';
  version: string;
  date_version: Date;
  notes?: string;
}

export interface IncotermCreate extends Omit<Incoterm, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface IncotermUpdate extends Partial<Omit<Incoterm, 'id' | 'user_id'>> {}
