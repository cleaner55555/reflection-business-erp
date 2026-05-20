#!/bin/bash
# Reflection Business ERP - Dev Server Launcher
# Usage: ./start.sh
# This script starts the Next.js dev server with memory-optimized settings

set -e

cd "$(dirname "$0")"

echo "🚀 Starting Reflection Business ERP Dev Server..."
echo "   Memory optimization: No prewarm, CDN Tailwind, HMR disabled"
echo ""

# Kill any existing dev server
pkill -f "next-server" 2>/dev/null || true
sleep 1

# Clean build cache if needed
if [ "$1" = "--clean" ]; then
  echo "🧹 Cleaning .next cache..."
  rm -rf .next
fi

# Start with optimized settings
NEXT_HMR_DISABLED=1 \
NODE_OPTIONS="--max-old-space-size=2048" \
npx next dev -p 3000 2>&1 | tee dev.log
