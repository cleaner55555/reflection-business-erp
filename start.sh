#!/bin/bash
exec &>> /home/z/my-project/dev.log
while true; do
  echo "[$(date)] Starting Next.js..."
  cd /home/z/my-project
  npx next dev -p 3000 -H 0.0.0.0 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Next.js exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
