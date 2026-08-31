#!/bin/sh
set -e

echo "🚀 [Diamora API] Starting Container Initialization..."

# Check if auto-seed is enabled (default: true)
if [ "${AUTO_SEED:-true}" = "true" ]; then
  echo "🌱 [Diamora API] Checking database initial seeding..."
  node seed_data.js || echo "⚠️ [Diamora API] Initial seeding note: Database already initialized or seeding skipped."
fi

echo "✨ [Diamora API] Launching Express Server on port ${PORT:-5000}..."
exec "$@"
