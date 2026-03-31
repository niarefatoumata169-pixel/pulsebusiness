import { BaseModel } from './base.model';

export interface Caisse extends BaseModel {
  nom: string;
  type: 'principale' | 'secondaire' | 'projet';
  solde_initial: number;
  solde_actuel: number;
  devise: string;
  responsable?: string;
  notes?: string;
}

export interface CaisseCreate extends Omit<Caisse, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface CaisseUpdate extends Partial<Omit<Caisse, 'id' | 'user_id'>> {}

export interface MouvementCaisse extends BaseModel {
  caisse_id: number;
  date: Date;
  type: 'entree' | 'sortie';
  categorie: 'vente' | 'achat' | 'salaire' | 'frais' | 'investissement' | 'autre';
  montant: number;
  motif: string;
  mode_paiement: 'especes' | 'cheque' | 'virement' | 'mobile_money';
  reference?: string;
  beneficiaire?: string;
  valide: boolean;
  date_validation?: Date;
  valide_par?: string;
  notes?: string;
}

export interface MouvementCreate extends Omit<MouvementCaisse, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
