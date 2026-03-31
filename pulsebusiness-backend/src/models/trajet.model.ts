import { BaseModel } from './base.model';

export interface Trajet extends BaseModel {
  vehicule_id: number;
  chauffeur_id: number;
  date_depart: Date;
  date_arrivee?: Date;
  lieu_depart: string;
  lieu_arrivee: string;
  distance?: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  notes?: string;
}

export interface TrajetCreate extends Omit<Trajet, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface TrajetUpdate extends Partial<Omit<Trajet, 'id' | 'user_id'>> {}
