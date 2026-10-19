#!/usr/bin/env bash
# Starts the production build on :3002 exactly like production wiring where possible:
#  - DATABASE_URL switched to the transaction pooler (port 6543, pgbouncer=true), as in Vercel prod
#  - RESEND_API_KEY blanked so no real email is ever sent by test flows
#  - Anthropic usage logger preloaded (does not modify app code)
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
export DATABASE_URL="$(echo "$DATABASE_URL" | sed -E 's/:5432/:6543/; s/\?.*$//')?pgbouncer=true"
export RESEND_API_KEY=""
export NODE_OPTIONS="--require ./eval/preload-usage-logger.cjs"
exec npx next start -p 3002
