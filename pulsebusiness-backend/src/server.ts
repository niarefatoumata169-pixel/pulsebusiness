import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';
import * as authRoutesModule from './routes/auth.routes'; // import du module entier
import { apiLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Récupération du routeur : priorité à l'export default, sinon le module lui-même
const authRoutes = (authRoutesModule as any).default ?? authRoutesModule;
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('📦 Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();