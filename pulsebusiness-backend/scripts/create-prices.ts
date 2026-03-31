import Stripe from 'stripe';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// Version API dynamique
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: null as any, // Utilise la version par défaut de Stripe
});

// ... reste du code identique
