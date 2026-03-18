import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nom, prenom, entreprise } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, password, nom, prenom, entreprise, role) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, nom, prenom, entreprise, role, created_at`,
      [email, hashedPassword, nom, prenom, entreprise || null, 'user']
    );

    const user = result.rows[0];

    // Générer le token JWT - Version corrigée
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { 
        expiresIn: '7d' 
      } as jwt.SignOptions
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT - Version corrigée
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { 
        expiresIn: '7d' 
      } as jwt.SignOptions
    );

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const result = await pool.query(
      'SELECT id, email, nom, prenom, entreprise, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { nom, prenom, entreprise } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET nom = COALESCE($1, nom), 
           prenom = COALESCE($2, prenom), 
           entreprise = COALESCE($3, entreprise)
       WHERE id = $4 
       RETURNING id, email, nom, prenom, entreprise, role, created_at`,
      [nom, prenom, entreprise, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { oldPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec son mot de passe
    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const validPassword = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
  }
};
