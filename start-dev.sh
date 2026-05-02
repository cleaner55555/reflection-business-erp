#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting server..." >> dev.log
  node node_modules/.bin/next dev -p 3000 >> dev.log 2>&1
  echo "[$(date)] Exited (code=$?), restart in 3s..." >> dev.log
  sleep 3
done
