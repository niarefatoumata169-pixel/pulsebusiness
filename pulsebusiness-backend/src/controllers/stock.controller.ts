import { Request, Response } from 'express';

// ========== Articles ==========
export const getArticles = async (req: Request, res: Response) => {
  res.json([]);
};
export const getArticleById = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Non implémenté' });
};
export const createArticle = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};
export const updateArticle = async (req: Request, res: Response) => {
  res.json({ message: 'Non implémenté' });
};
export const deleteArticle = async (req: Request, res: Response) => {
  res.status(204).send();
};

// ========== Catégories ==========
export const CategorieController = {
  getAll: async (req: Request, res: Response) => {
    res.json([]);
  },
  getById: async (req: Request, res: Response) => {
    res.status(404).json({ message: 'Non implémenté' });
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json({ message: 'Non implémenté' });
  },
  update: async (req: Request, res: Response) => {
    res.json({ message: 'Non implémenté' });
  },
  delete: async (req: Request, res: Response) => {
    res.status(204).send();
  },
};

// ========== Fournisseurs ==========
export const FournisseurController = {
  getAll: async (req: Request, res: Response) => {
    res.json([]);
  },
  getById: async (req: Request, res: Response) => {
    res.status(404).json({ message: 'Non implémenté' });
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json({ message: 'Non implémenté' });
  },
  update: async (req: Request, res: Response) => {
    res.json({ message: 'Non implémenté' });
  },
  delete: async (req: Request, res: Response) => {
    res.status(204).send();
  },
};

// ========== ArticleController avec méthodes nécessaires ==========
export const ArticleController = {
  getAll: async (req: Request, res: Response) => {
    res.json([]);
  },
  getById: async (req: Request, res: Response) => {
    res.status(404).json({ message: 'Non implémenté' });
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json({ message: 'Non implémenté' });
  },
  update: async (req: Request, res: Response) => {
    res.json({ message: 'Non implémenté' });
  },
  delete: async (req: Request, res: Response) => {
    res.status(204).send();
  },
  getMouvements: async (req: Request, res: Response) => {
    res.json([]);
  },
  addMouvement: async (req: Request, res: Response) => {
    res.status(201).json({ message: 'Mouvement ajouté (simulation)' });
  },
};
