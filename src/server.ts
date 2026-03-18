import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger';
import logger, { morganMiddleware } from './logger';
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import factureRoutes from './routes/facture.routes';
import devisRoutes from './routes/devis.routes';
import rhRoutes from './routes/rh.routes';
import stockRoutes from './routes/stock.routes';
import transportRoutes from './routes/transport.routes';
import internationalRoutes from './routes/international.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(morganMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/rh', rhRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/international', internationalRoutes);

// Swagger
setupSwagger(app);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
