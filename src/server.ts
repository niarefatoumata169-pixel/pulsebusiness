import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { pool } from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes/index'; // Chemin explicite

export const app = express();
const PORT = env.port;

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur PulseBusiness en ligne',
    database: pool ? 'connectée' : 'non connectée',
    environment: env.nodeEnv
  });
});

// Gestion des erreurs
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📝 Environnement: ${env.nodeEnv}`);
  });
}
