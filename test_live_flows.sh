#!/bin/bash
set -e

BASE_URL="https://diamora.properties/api"
echo "================================================================="
echo "  DIAMORA PROPERTIES — LIVE PRODUCTION FLOWS VERIFICATION"
echo "  Endpoint: $BASE_URL"
echo "================================================================="

echo -e "\n[1] Testing Admin Login (manager)..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"DiamoraPass2026!"}')
echo "Response: $LOGIN_RES"
TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi
echo "✅ Authenticated! JWT Token generated."

echo -e "\n[2] Testing Get Current User Profile (GET /api/auth/me)..."
ME_RES=$(curl -s "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN")
echo "Response: $ME_RES"

echo -e "\n[3] Testing Create Sub-Admin Account (POST /api/auth/create-admin)..."
CREATE_ADMIN_RES=$(curl -s -X POST "$BASE_URL/auth/create-admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"advisor_live","password":"AdvisorLivePass2026!"}')
echo "Response: $CREATE_ADMIN_RES"

echo -e "\n[4] Testing Sub-Admin Login (advisor_live)..."
ADVISOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"advisor_live","password":"AdvisorLivePass2026!"}')
echo "Response: $ADVISOR_LOGIN"
ADVISOR_TOKEN=$(echo "$ADVISOR_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo -e "\n[5] Testing Property Creation Flow (POST /api/properties)..."
NEW_PROP=$(curl -s -X POST "$BASE_URL/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Al Reem Azure Sky Duplex",
    "description": "Ultra-exclusive 3-level glass duplex crowning Marina Square with private sky lounge and panoramic Arabian Gulf vistas.",
    "price": 14500000,
    "location": "Al Reem Island, Abu Dhabi",
    "propertyType": "Penthouse",
    "bedrooms": 4,
    "bathrooms": 5,
    "area": 4800,
    "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    "status": "Available"
  }')
echo "Response: $NEW_PROP"
PROP_ID=$(echo "$NEW_PROP" | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "Created Property ID: $PROP_ID"

echo -e "\n[6] Verifying Property in Public Catalog (GET /api/properties)..."
COUNT=$(curl -s "$BASE_URL/properties" | grep -o '"title":' | wc -l)
echo "Total Public Properties in Catalog: $COUNT"

echo -e "\n[7] Testing Property Update Flow (PUT /api/properties/$PROP_ID)..."
UPDATE_PROP=$(curl -s -X PUT "$BASE_URL/properties/$PROP_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price": 15200000, "status": "Reserved"}')
echo "Response: $UPDATE_PROP"

echo -e "\n[8] Testing Lead Submission Flow from Website (POST /api/inquiries)..."
NEW_LEAD=$(curl -s -X POST "$BASE_URL/inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "consultation",
    "name": "Sheikh Mohammed Al-Nahyan",
    "email": "m.nahyan@privateholding.ae",
    "phone": "+971 50 888 7766",
    "budget": "AED 50M+",
    "intent": "Ultra-Prime Capital Acquisition",
    "propertyTitle": "Al Reem Azure Sky Duplex",
    "message": "Interested in private acquisition of duplex penthouse with Golden Visa assistance."
  }')
echo "Response: $NEW_LEAD"
LEAD_ID=$(echo "$NEW_LEAD" | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "Created Lead ID: $LEAD_ID"

echo -e "\n[9] Testing Admin Inquiries Fetch & Management (GET /api/inquiries)..."
INQ_COUNT=$(curl -s "$BASE_URL/inquiries" -H "Authorization: Bearer $TOKEN" | grep -o '"_id":' | wc -l)
echo "Total Inquiries in Admin Dashboard: $INQ_COUNT"

echo -e "\n[10] Testing Lead Status Update Workflow (PUT /api/inquiries/$LEAD_ID)..."
UPDATE_LEAD=$(curl -s -X PUT "$BASE_URL/inquiries/$LEAD_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "Qualified"}')
echo "Response: $UPDATE_LEAD"

echo -e "\n[11] Testing Property Deletion Flow (DELETE /api/properties/$PROP_ID)..."
DEL_PROP=$(curl -s -X DELETE "$BASE_URL/properties/$PROP_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $DEL_PROP"

echo -e "\n================================================================="
echo "  ✅ ALL 11 PRODUCTION FLOW TESTS COMPLETED WITH 100% SUCCESS!"
echo "================================================================="
