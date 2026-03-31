import { BaseModel } from './base.model';

export interface Paie extends BaseModel {
  employe_id: number;
  periode: Date; // premier jour du mois
  salaire_base: number;
  primes?: number;
  indemnites?: number;
  heures_sup?: number;
  taux_horaire?: number;
  avantages_nature?: number;
  brut: number;
  cotisations_salariales: number;
  cotisations_patronales: number;
  net_avant_impot: number;
  impot_revenu?: number;
  net_a_payer: number;
  date_paiement?: Date;
  mode_paiement: 'virement' | 'cheque' | 'especes';
  statut: 'calcule' | 'valide' | 'paye';
  notes?: string;
}

export interface PaieCreate extends Omit<Paie, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface PaieUpdate extends Partial<Omit<Paie, 'id' | 'user_id'>> {}
