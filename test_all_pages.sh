#!/bin/bash
set -e

PAGES=(
  "https://diamora.properties/"
  "https://diamora.properties/css/style.css"
  "https://diamora.properties/js/main.js"
  "https://diamora.properties/properties"
  "https://diamora.properties/privacy"
  "https://diamora.properties/terms"
  "https://diamora.properties/aml"
  "https://diamora.properties/cookies"
  "https://diamora.properties/css/legal.css"
  "https://diamora.properties/dashboard/"
  "https://diamora.properties/dashboard/dashboard.css?v=2.1"
  "https://diamora.properties/dashboard/dashboard.js?v=2.1"
  "https://diamora.properties/api/health"
  "https://diamora.properties/api/properties"
)

echo "=========================================================================="
echo "  DIAMORA PROPERTIES — COMPLETE PRODUCTION URL & ASSET AUDIT"
echo "=========================================================================="

FAILED=0
for url in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  CONTENT_TYPE=$(curl -s -I "$url" | grep -i "content-type:" | tr -d '\r' | cut -d':' -f2-)
  
  if [ "$STATUS" -eq 200 ]; then
    echo -e "✅ [200 OK] $url \n   Content-Type:$CONTENT_TYPE"
  else
    echo -e "❌ [HTTP $STATUS] $url"
    FAILED=$((FAILED + 1))
  fi
  echo "--------------------------------------------------------------------------"
done

if [ "$FAILED" -eq 0 ]; then
  echo -e "\n🎉 ALL PAGES AND ASSETS ARE FULLY OPERATIONAL WITH 200 OK!"
else
  echo -e "\n⚠️ $FAILED URLs failed inspection."
  exit 1
fi
