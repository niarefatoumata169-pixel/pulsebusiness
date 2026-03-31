import { Request, Response } from 'express';
import * as clientController from '../../src/controllers/client.controller'; // Import as namespace

// Mock database pool
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  pool: {
    query: (...args: any[]) => mockQuery(...args)
  }
}));

describe('ClientController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {}
    };
    (mockRequest as any).user = { id: 1 };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation(result => {
        responseObject = result;
        return mockResponse;
      })
    };
    
    jest.clearAllMocks();
  });

  test('getAll devrait retourner une liste', async () => {
    const mockRows = [{ id: 1, nom: 'Test' }];
    mockQuery.mockResolvedValue({ rows: mockRows });

    await clientController.getAll(mockRequest as Request, mockResponse as Response);
    
    expect(mockQuery).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockRows);
  });

  test('create avec données valides', async () => {
    mockRequest.body = {
      nom: 'Test Client',
      email: 'test@test.com'
    };
    
    const mockNewClient = { id: 1, ...mockRequest.body };
    mockQuery.mockResolvedValue({ rows: [mockNewClient] });

    await clientController.create(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(mockNewClient);
  });

  test('create sans données requises', async () => {
    mockRequest.body = {};
    
    await clientController.create(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: 'Nom et email requis' 
    });
  });

  test('getById avec ID valide', async () => {
    mockRequest.params = { id: '1' };
    const mockClient = { id: 1, nom: 'Test', user_id: 1 };
    mockQuery.mockResolvedValue({ rows: [mockClient] });

    await clientController.getById(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.json).toHaveBeenCalledWith(mockClient);
  });

  test('getById avec ID invalide', async () => {
    mockRequest.params = { id: '999' };
    mockQuery.mockResolvedValue({ rows: [] });

    await clientController.getById(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  test('delete avec ID valide', async () => {
    mockRequest.params = { id: '1' };
    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

    await clientController.deleteClient(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supprimé avec succès' });
  });

  test('delete avec ID invalide', async () => {
    mockRequest.params = { id: '999' };
    mockQuery.mockResolvedValue({ rows: [] });

    await clientController.deleteClient(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Client non trouvé' });
  });
});