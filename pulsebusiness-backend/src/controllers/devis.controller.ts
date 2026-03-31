import { Request, Response } from 'express';

export class DevisController {
  static async getAll(req: Request, res: Response) {
    res.json([]);
  }

  static async getById(req: Request, res: Response) {
    res.json({});
  }

  static async create(req: Request, res: Response) {
    res.status(201).json({});
  }

  static async delete(req: Request, res: Response) {
    res.json({ message: 'Supprimé' });
  }

  static async getArticles(req: Request, res: Response) {
    res.json([]);
  }

  static async addArticle(req: Request, res: Response) {
    res.status(201).json({});
  }
}
