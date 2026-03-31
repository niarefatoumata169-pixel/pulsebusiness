import { Request, Response } from 'express';
import { Facture } from '../models/Facture';

export const getAllFactures = async (req: Request, res: Response) => {
  try {
    const factures = await Facture.findAll();
    res.json(factures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getFactureById = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createFacture = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.create(req.body);
    res.status(201).json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateFacture = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
    await facture.update(req.body);
    res.json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteFacture = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
    await facture.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
