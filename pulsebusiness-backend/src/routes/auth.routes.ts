import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  getActiveSessionsController,
  revokeSession,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactorController,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Routes protégées
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.post('/resend-verification', authenticateToken, resendVerificationEmail);

// Sessions
router.get('/sessions', authenticateToken, getActiveSessionsController);
router.delete('/sessions/:sessionId', authenticateToken, revokeSession);

// 2FA
router.post('/2fa/setup', authenticateToken, setupTwoFactor);
router.post('/2fa/verify', authenticateToken, verifyTwoFactor);
router.post('/2fa/disable', authenticateToken, disableTwoFactorController);

export default router;