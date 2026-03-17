import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'pulsebusiness',
    user: process.env.DB_USER || 'mac',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'ton_secret_jwt_tres_long_et_securise',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
};
