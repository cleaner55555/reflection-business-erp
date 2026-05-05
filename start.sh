#!/bin/bash
exec &>> /home/z/my-project/dev.log

# Start tax-update-service in background
cd /home/z/my-project/mini-services/tax-update-service
echo "[$(date)] Starting tax-update-service..."
nohup bun --hot index.ts > /home/z/my-project/tax-update-service.log 2>&1 &
TAX_PID=$!
echo "[$(date)] Tax-update-service started (PID: $TAX_PID)"

# Start Next.js main server
while true; do
  echo "[$(date)] Starting Next.js..."
  cd /home/z/my-project
  npx next dev -p 3000 -H 0.0.0.0 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Next.js exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
