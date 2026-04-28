#!/bin/bash
while true; do
  echo "$(date) Starting Next.js..."
  cd /home/z/my-project
  npx next dev -p 3000 -H 0.0.0.0 2>&1
  echo "$(date) Next.js died, restarting in 3s..."
  sleep 3
done
