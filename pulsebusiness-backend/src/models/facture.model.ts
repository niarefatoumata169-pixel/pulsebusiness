import { BaseModel } from './base.model';

export interface Facture extends BaseModel {
  numero: string;
  client_id?: number;
  client_nom?: string;
  date_facture: Date;
  date_echeance: Date;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'impayee' | 'annulee';
  notes?: string;
}

export interface FactureCreate extends Omit<Facture, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface FactureUpdate extends Partial<Omit<Facture, 'id' | 'user_id'>> {}
