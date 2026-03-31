# ...existing code...

echo -e "${YELLOW}2. Test d'inscription (email unique: ${UNIQUE_EMAIL})${NC}"
REGISTER_RESULT=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${UNIQUE_EMAIL}\",\"password\":\"123456\",\"nom\":\"Test\"}")
# try to extract token if returned (jq preferred)
if command -v jq >/dev/null 2>&1; then
  REGISTER_TOKEN=$(echo "$REGISTER_RESULT" | jq -r '.token // empty')
else
  REGISTER_TOKEN=$(echo "$REGISTER_RESULT" | sed -nE 's/.*"token"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p')
fi
if [ -n "$REGISTER_TOKEN" ]; then
  echo -e "${GREEN}✅ Inscription OK (token reçu)${NC}"
else
  echo -e "${RED}❌ Échec inscription — réponse serveur:${NC}"
  echo "$REGISTER_RESULT"
fi
echo ""

echo -e "${YELLOW}3. Test de connexion${NC}"
LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${UNIQUE_EMAIL}\",\"password\":\"123456\"}")

if command -v jq >/dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.token // empty')
else
  TOKEN=$(echo "$LOGIN_RESULT" | sed -nE 's/.*"token"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p')
fi

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Token obtenu${NC}"
else
  echo -e "${RED}❌ Échec de connexion — réponse serveur:${NC}"
  echo "$LOGIN_RESULT"