import { BaseModel } from './base.model';

export interface ReglementInternational extends BaseModel {
  reference: string;
  date_execution: Date;
  type: 'import' | 'export';
  montant: number;
  devise: string;
  taux_change: number;
  montant_fcfa: number;
  date_reglement: Date;
  mode_paiement: 'virement' | 'carte' | 'cheque' | 'lettre_credit' | 'remise_documentaire' | 'encaissement';
  statut: 'en_attente' | 'execute' | 'refuse' | 'annule';
  dossier_douane_id?: number;
  dossier_douane_ref?: string;
  banque_emetteur?: string;
  banque_receptrice?: string;
  compte_bancaire?: string;
  lettre_credit_numero?: string;
  lettre_credit_date?: Date;
  lettre_credit_expiration?: Date;
  commission?: number;
  frais?: number;
  notes?: string;
}

export interface ReglementInternationalCreate extends Omit<ReglementInternational, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface ReglementInternationalUpdate extends Partial<Omit<ReglementInternational, 'id' | 'user_id'>> {}
