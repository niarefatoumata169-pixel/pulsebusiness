import { Request, Response } from 'express';

// Véhicules
export const getVehicules = async (req: Request, res: Response) => {
  res.json([]);
};
export const getVehiculeById = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Non implémenté' });
};
export const createVehicule = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};
export const updateVehicule = async (req: Request, res: Response) => {
  res.json({ message: 'Non implémenté' });
};
export const deleteVehicule = async (req: Request, res: Response) => {
  res.status(204).send();
};

// Chauffeurs
export const getChauffeurs = async (req: Request, res: Response) => {
  res.json([]);
};
export const getChauffeurById = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Non implémenté' });
};
export const createChauffeur = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};
export const updateChauffeur = async (req: Request, res: Response) => {
  res.json({ message: 'Non implémenté' });
};
export const deleteChauffeur = async (req: Request, res: Response) => {
  res.status(204).send();
};

// Trajets
export const getTrajets = async (req: Request, res: Response) => {
  res.json([]);
};
export const getTrajetById = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Non implémenté' });
};
export const createTrajet = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};
export const updateTrajet = async (req: Request, res: Response) => {
  res.json({ message: 'Non implémenté' });
};
export const deleteTrajet = async (req: Request, res: Response) => {
  res.status(204).send();
};

// Maintenance
export const getMaintenances = async (req: Request, res: Response) => {
  res.json([]);
};
export const getMaintenanceById = async (req: Request, res: Response) => {
  res.status(404).json({ message: 'Non implémenté' });
};
export const createMaintenance = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};
export const updateMaintenance = async (req: Request, res: Response) => {
  res.json({ message: 'Non implémenté' });
};
export const deleteMaintenance = async (req: Request, res: Response) => {
  res.status(204).send();
};

// Carburant
export const getCarburant = async (req: Request, res: Response) => {
  res.json([]);
};
export const createCarburant = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Non implémenté' });
};

// Contrôleurs objets pour les routes qui les attendent
export const VehiculeController = {
  getAll: getVehicules,
  getById: getVehiculeById,
  create: createVehicule,
  update: updateVehicule,
  delete: deleteVehicule,
};

export const ChauffeurController = {
  getAll: getChauffeurs,
  getById: getChauffeurById,
  create: createChauffeur,
  update: updateChauffeur,
  delete: deleteChauffeur,
};
