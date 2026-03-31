export interface DevisArticle {
  id?: number;
  devis_id: number;
  article_id?: number;
  article_nom: string;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  montant_ht: number;
  montant_ttc: number;
  created_at?: Date;
}

export interface DevisArticleCreate extends Omit<DevisArticle, 'id' | 'created_at'> {}
export interface DevisArticleUpdate extends Partial<Omit<DevisArticle, 'id'>> {}
