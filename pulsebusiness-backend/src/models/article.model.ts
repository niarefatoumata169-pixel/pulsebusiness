import { BaseModel } from './base.model';

export interface Article extends BaseModel {
  reference: string;
  nom: string;
  description?: string;
  categorie_id?: number;
  categorie_nom?: string;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  stock_mini: number;
  stock_maxi?: number;
  emplacement?: string;
  fournisseur_id?: number;
  fournisseur_nom?: string;
}

export interface ArticleCreate extends Omit<Article, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface ArticleUpdate extends Partial<Omit<Article, 'id' | 'user_id'>> {}
