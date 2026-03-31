// ...existing code...
import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:4200',
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connecté:', socket.id);

    // Authentification
    socket.on('authenticate', (token: string) => {
      // Vérifier le token et joindre la room utilisateur
      try {
        if (!token || !process.env.JWT_SECRET) {
          throw new Error('Token or JWT_SECRET missing');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        if (decoded && decoded.id) {
          socket.join(`user:${decoded.id}`);
          console.log(`✅ Utilisateur ${decoded.id} authentifié`);
        } else {
          console.warn('Token décodé ne contient pas d\'id utilisateur');
        }
      } catch (error: unknown) {
        console.error('❌ Erreur auth socket:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client déconnecté:', socket.id);
    });
  });

  return io;
};

export const emitToUser = (userId: number, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitNotification = (userId: number, notification: any) => {
  emitToUser(userId, 'notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};

export default { initSocket, emitToUser, emitNotification };