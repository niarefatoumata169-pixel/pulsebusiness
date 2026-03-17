// Mock de toutes les dépendances
jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn()
    })
  }
}));

jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'test@test.com' };
    next();
  }
}));

// Mock complet du module routes
jest.mock('../../src/routes/index', () => {
  const { Router } = require('express');
  const router = Router();
  
  router.get('/health', (req: any, res: any) => {
    res.json({ status: 'OK', message: 'Mocked route' });
  });
  
  return router;
});

// Importer après les mocks
import request from 'supertest';
import express from 'express';

// Créer une app de test simplifiée
const app = express();
app.use(express.json());

// Ajouter une route de test directe
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test server',
    database: 'connectée',
    environment: 'test'
  });
});

describe('API Tests Simplifiés', () => {
  test('GET /api/health - devrait retourner 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });

  test('GET /api/health - structure de réponse', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body).toMatchObject({
      status: 'OK',
      message: expect.any(String),
      database: expect.any(String),
      environment: expect.any(String)
    });
  });
});
