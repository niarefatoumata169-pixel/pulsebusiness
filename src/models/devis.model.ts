import { BaseModel } from './base.model';
import { DevisArticle } from './devis-article.model';

export interface Devis extends BaseModel {
  numero: string;
  client_id?: number;
  client_nom?: string;
  date_creation: Date;
  date_validite: Date;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  notes?: string;
  articles?: DevisArticle[];
}

export interface DevisCreate extends Omit<Devis, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'articles'> {}
export interface DevisUpdate extends Partial<Omit<Devis, 'id' | 'user_id'>> {}
