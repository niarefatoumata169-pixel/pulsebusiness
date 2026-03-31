import { BaseModel } from './base.model';

export interface ContratRH extends BaseModel {
  employe_id: number;
  type: 'CDI' | 'CDD' | 'stage' | 'freelance' | 'interim';
  date_debut: Date;
  date_fin?: Date;
  duree_essai?: number; // en jours
  salaire: number;
  prime?: number;
  avantages?: string;
  poste: string;
  departement?: string;
  statut: 'actif' | 'expire' | 'resilie' | 'renouvele';
  fichier?: string;
  notes?: string;
}

export interface ContratRHCreate extends Omit<ContratRH, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface ContratRHUpdate extends Partial<Omit<ContratRH, 'id' | 'user_id'>> {}
