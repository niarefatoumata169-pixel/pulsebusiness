export interface Client {
  id: number;
  nom: string;
  prenom?: string;
  entreprise?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  created_at?: Date;
}

export interface Facture {
  id: number;
  numero: string;
  client_id: number;
  date_emission: Date;
  date_echeance?: Date;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'impayée';
}

export interface Contrat {
  id: number;
  client_id: number;
  type: string;
  date_debut: Date;
  date_fin?: Date;
  montant: number;
  statut: 'actif' | 'terminé' | 'suspendu';
  joursRestants?: number;
}
