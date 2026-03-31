import { BaseModel } from './base.model';

export interface DeclarationDouane extends BaseModel {
  numero_dossier: string;
  numero_acquit?: string;
  type: 'import' | 'export' | 'transit';
  date_declaration: Date;
  bureau_douane: string;
  regime_douanier: string;
  valeur_marchandise: number;
  devise: string;
  montant_droits: number;
  montant_tva: number;
  montant_total: number;
  statut: 'brouillon' | 'en_cours' | 'soumise' | 'debloquee' | 'refusee';
  marchandises: string;
  pays_origine: string;
  pays_destination: string;
  transporteur?: string;
  conteneurs?: string;
  numero_vin?: string;
  date_validation?: Date;
  date_acquit?: Date;
  agent_douanier?: string;
  notes?: string;
}

export interface DeclarationDouaneCreate extends Omit<DeclarationDouane, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface DeclarationDouaneUpdate extends Partial<Omit<DeclarationDouane, 'id' | 'user_id'>> {}
