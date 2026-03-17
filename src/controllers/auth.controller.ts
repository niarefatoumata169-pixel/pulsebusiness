import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { env } from '../config/env';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, nom, prenom, entreprise } = req.body;
      
      // Vérifier si l'utilisateur existe
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (email, password, nom, prenom, entreprise, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, nom, prenom, entreprise, role, created_at`,
        [email, hashedPassword, nom, prenom, entreprise, 'user']
      );
      
      const user = result.rows[0];
      
      // CORRECTION : Typage explicite pour jwt.sign
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn as any }
      );
      
      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Erreur register:', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
      
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
      
      // CORRECTION : Typage explicite pour jwt.sign
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn as any }
      );
      
      delete user.password;
      
      res.json({ user, token });
    } catch (error) {
      console.error('Erreur login:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
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
  }
}
