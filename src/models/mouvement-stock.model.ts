import { BaseModel } from './base.model';

export interface MouvementStock extends BaseModel {
  article_id: number;
  type: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
  quantite: number;
  motif: string;
  reference?: string;
  date_mouvement: Date;
  notes?: string;
}

export interface MouvementStockCreate extends Omit<MouvementStock, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
