#!/bin/bash
# Auto-restart wrapper for Next.js dev server
# Handles Next.js memory threshold restarts gracefully
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=3072" \
  bun run dev 2>&1
  EXIT_CODE=$?
  echo "[wrapper] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
