import { BaseModel } from './base.model';

export interface Categorie extends BaseModel {
  nom: string;
  description?: string;
}

export interface CategorieCreate extends Omit<Categorie, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface CategorieUpdate extends Partial<Omit<Categorie, 'id' | 'user_id'>> {}
