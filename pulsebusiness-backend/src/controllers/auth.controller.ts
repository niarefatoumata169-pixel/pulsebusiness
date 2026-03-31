import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database';
import { sendWelcomeEmail, sendResetPasswordEmail } from '../services/email.service';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      type = 'particulier',
      nom,
      prenom,
      raison_sociale,
      registre_commerce,
      nif,
      forme_juridique,
      telephone,
      adresse,
      ville,
      pays
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    if (type === 'particulier' && (!nom || !prenom)) {
      return res.status(400).json({ message: 'Nom et prénom requis pour un particulier' });
    }
    if (type === 'entreprise' && !raison_sociale) {
      return res.status(400).json({ message: 'Raison sociale requise pour une entreprise' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        email, password, type, nom, prenom, raison_sociale,
        registre_commerce, nif, forme_juridique, telephone,
        adresse, ville, pays, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id, email, type, nom, prenom, raison_sociale, registre_commerce, nif, telephone, adresse, ville, pays`,
      [
        email, hashedPassword, type,
        nom || null, prenom || null, raison_sociale || null,
        registre_commerce || null, nif || null, forme_juridique || null,
        telephone || null, adresse || null, ville || null,
        pays || null
      ]
    );

    const user = result.rows[0];
    await sendWelcomeEmail(user.email, user.nom || user.raison_sociale);

    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      // Créer un utilisateur automatiquement avec l'email fourni
      const hashedPassword = await bcrypt.hash(password || 'default123', 10);
      const insertResult = await pool.query(
        `INSERT INTO users (email, password, type, created_at, updated_at)
         VALUES ($1, $2, 'particulier', NOW(), NOW())
         RETURNING id, email, type, nom, prenom, raison_sociale, telephone, adresse, ville, pays`,
        [email, hashedPassword]
      );
      user = insertResult.rows[0];
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        type: user.type,
        nom: user.nom,
        prenom: user.prenom,
        raison_sociale: user.raison_sociale
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Déconnexion réussie' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT id, email, type, nom, prenom, raison_sociale, registre_commerce, nif, telephone, adresse, ville, pays FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getActiveSessionsController = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const revokeSession = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const setupTwoFactor = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const disableTwoFactorController = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  res.json({ message: 'Email vérifié' });
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Non implémenté' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis.' });

  try {
    const result = await pool.query('SELECT id, email, nom, raison_sociale FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000);
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetToken, expires, user.id]
      );
      await sendResetPasswordEmail(user.email, resetToken);
    }
    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};