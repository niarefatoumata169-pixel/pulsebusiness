import { BaseModel } from './base.model';

export interface Vehicule extends BaseModel {
  immatriculation: string;
  marque: string;
  modele: string;
  annee?: number;
  type: 'camion' | 'fourgon' | 'voiture' | 'moto';
  statut: 'disponible' | 'en_cours' | 'maintenance' | 'hors_service';
  kilometrage: number;
  date_achat?: Date;
  date_prochain_entretien?: Date;
  notes?: string;
}

export interface VehiculeCreate extends Omit<Vehicule, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface VehiculeUpdate extends Partial<Omit<Vehicule, 'id' | 'user_id'>> {}
