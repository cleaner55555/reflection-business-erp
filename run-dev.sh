#!/bin/bash
cd /home/z/my-project
while true; do
  echo "$(date) - Starting dev server..." >> /home/z/my-project/dev-server.log
  npx next dev --turbopack -p 3000 >> /home/z/my-project/dev-server.log 2>&1
  echo "$(date) - Server crashed, restarting in 3s..." >> /home/z/my-project/dev-server.log
  sleep 3
done
