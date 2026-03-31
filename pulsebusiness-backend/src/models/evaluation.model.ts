import { BaseModel } from './base.model';

export interface Evaluation extends BaseModel {
  employe_id: number;
  evaluateur_id?: number;
  date_evaluation: Date;
  type: 'annuelle' | 'semestrielle' | 'trimestrielle' | 'projet';
  criteres: any; // JSON object
  note_globale?: number;
  commentaire?: string;
  objectifs?: string;
  statut: 'planifiee' | 'realisee' | 'annulee';
}

export interface EvaluationCreate extends Omit<Evaluation, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}
export interface EvaluationUpdate extends Partial<Omit<Evaluation, 'id' | 'user_id'>> {}
