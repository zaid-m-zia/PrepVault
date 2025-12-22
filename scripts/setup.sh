#!/usr/bin/env bash
set -euo pipefail

# Idempotent setup script for PrepVault
# - Installs node dependencies
# - Initializes Tailwind config if missing
# - Runs Prisma generate (no-op if prisma schema is absent)

echo "Starting PrepVault setup (idempotent)"

if [ -f package-lock.json ] || [ -f pnpm-lock.yaml ]; then
  echo "Lockfile detected; using 'npm ci'"
  npm ci
else
  echo "No lockfile detected; running 'npm install'"
  npm install
fi

# Initialize Tailwind config if not present
if [ ! -f tailwind.config.cjs ] && [ -f node_modules/.bin/tailwindcss ]; then
  echo "Initializing Tailwind config..."
  npx tailwindcss init -p || true
fi

# Generate Prisma client if schema exists
if [ -f prisma/schema.prisma ]; then
  echo "Prisma schema detected — generating client"
  npx prisma generate || true
else
  echo "No prisma schema found — skipping prisma generate"
fi

echo "Setup complete"
