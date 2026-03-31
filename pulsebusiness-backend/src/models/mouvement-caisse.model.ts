export interface MouvementCaisse {
  id?: number;
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
  user_id: number;
  created_at?: Date;
}

export interface MouvementCaisseCreate extends Omit<MouvementCaisse, 'id' | 'created_at'> {}
export interface MouvementCaisseUpdate extends Partial<Omit<MouvementCaisse, 'id'>> {}
