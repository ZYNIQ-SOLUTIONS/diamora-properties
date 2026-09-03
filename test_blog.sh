#!/bin/bash
# test_blog.sh
# E2E test for the new Diamora Properties Blog API.

API_URL="http://localhost:5000/api"
echo "Running Blog API Tests..."

# Wait for API to be up
until curl -s $API_URL/health | grep -q "online"; do
  echo "Waiting for API to start..."
  sleep 1
done
echo "API is online."

# 1. Login to get token
LOGIN_RES=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "FAIL: Could not authenticate. (Is seed_admin.js run?)"
  exit 1
fi
echo "✅ Authenticated successfully"

# 2. Create Blog Post
CREATE_RES=$(curl -s -X POST $API_URL/blog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dubai Luxury Market 2026",
    "category": "Market Insights",
    "status": "published",
    "excerpt": "A deep dive into ultra-luxury trends.",
    "content": "<p>Content goes here.</p>"
  }')

SLUG=$(echo $CREATE_RES | grep -o '"slug":"[^"]*' | grep -o '[^"]*$')
POST_ID=$(echo $CREATE_RES | grep -o '"_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$SLUG" ]; then
  echo "FAIL: Post creation failed."
  echo $CREATE_RES
  exit 1
fi
echo "✅ Post Created. Slug: $SLUG"

# 3. Read single post by slug
GET_RES=$(curl -s $API_URL/blog/$SLUG)
if echo $GET_RES | grep -q '"title":"Dubai Luxury Market 2026"'; then
  echo "✅ Single Post retrieval successful"
else
  echo "FAIL: Post retrieval failed"
  exit 1
fi

# 4. List posts (filtering)
LIST_RES=$(curl -s "$API_URL/blog?category=Market%20Insights")
if echo $LIST_RES | grep -q "$SLUG"; then
  echo "✅ Post listing & filtering successful"
else
  echo "FAIL: Post listing failed"
  exit 1
fi

# 5. Delete post
DELETE_RES=$(curl -s -X DELETE $API_URL/blog/$POST_ID -H "Authorization: Bearer $TOKEN")
if echo $DELETE_RES | grep -q "removed"; then
  echo "✅ Post deleted successfully"
else
  echo "FAIL: Post deletion failed"
  exit 1
fi

echo "🎉 All Blog API Tests Passed!"
exit 0
