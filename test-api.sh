#!/bin/bash

echo "🔍 TEST DE L'API PULSEBUSINESS"
echo "================================"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3004/api"
TIMESTAMP=$(date +%s)
UNIQUE_EMAIL="test-${TIMESTAMP}@test.com"

echo -e "${YELLOW}1. Test de santé du serveur${NC}"
curl -s "$BASE_URL/health" | grep -q "OK" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
echo ""

echo -e "${YELLOW}2. Test d'inscription (email unique: ${UNIQUE_EMAIL})${NC}"
REGISTER_RESULT=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${UNIQUE_EMAIL}\",\"password\":\"123456\",\"nom\":\"Test\"}")
echo $REGISTER_RESULT | grep -q "token" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
echo ""

echo -e "${YELLOW}3. Test de connexion${NC}"
LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${UNIQUE_EMAIL}\",\"password\":\"123456\"}")
TOKEN=$(echo $LOGIN_RESULT | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ Token obtenu${NC}"
else
  echo -e "${RED}❌ Échec de connexion${NC}"
fi
echo ""

# ... (reste du script inchangé) ...

echo -e "${YELLOW}4. Test clients (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/clients" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}5. Test devis (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/devis" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}6. Test factures (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/factures" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}7. Test transport (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/transport/vehicules" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}8. Test stock (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/stock/articles" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}9. Test RH (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/rh/employes" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${YELLOW}10. Test international (protégé)${NC}"
if [ ! -z "$TOKEN" ]; then
  curl -s -X GET "$BASE_URL/international/douanes" \
    -H "Authorization: Bearer $TOKEN" | grep -q "\[\|\]" && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ Échec${NC}"
else
  echo -e "${RED}❌ Pas de token${NC}"
fi
echo ""

echo -e "${GREEN}✅ Tests terminés !${NC}"
