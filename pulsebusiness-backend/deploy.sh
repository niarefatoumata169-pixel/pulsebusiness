#!/bin/bash

echo "🚀 Déploiement de l'application..."

# Build
./build.sh

# Lancer avec PM2 (si installé)
if command -v pm2 &> /dev/null; then
  pm2 stop pulsebusiness-backend 2>/dev/null
  pm2 delete pulsebusiness-backend 2>/dev/null
  pm2 start dist/server.js --name pulsebusiness-backend
  pm2 save
  echo "✅ Application lancée avec PM2"
else
  echo "⚠️ PM2 non installé. Pour l'installer : npm install -g pm2"
  echo "Pour lancer manuellement : node dist/server.js"
fi
