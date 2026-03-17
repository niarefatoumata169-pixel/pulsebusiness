export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  role: string;
}

export interface Client {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  entreprise?: string;
  created_at?: Date;
}

export interface Facture {
  id: number;
  numero: string;
  client_id: number;
  client_nom?: string;
  date_emission: string;
  date_echeance?: string;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'impayée' | 'annulée';
  notes?: string;
  created_at?: Date;
}

export interface Contrat {
  id: number;
  numero: string;
  client_id: number;
  client_nom?: string;
  type: string;
  date_debut: string;
  date_fin?: string;
  montant: number;
  statut: 'actif' | 'terminé' | 'suspendu' | 'résilié';
  joursRestants?: number;
  created_at?: Date;
}

export interface Devis {
  id: number;
  numero: string;
  client_id: number;
  client_nom?: string;
  date_creation: string;
  date_validite: string;
  montant_ht: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'expiré';
  notes?: string;
  created_at?: Date;
}
