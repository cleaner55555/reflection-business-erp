#!/bin/bash
# Persistent Next.js dev server watchdog
# Starts the server and restarts it if it crashes
# Designed to be started via bun --hot for persistence

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"
PID_FILE="$PROJECT_DIR/.zscripts/dev.pid"

cd "$PROJECT_DIR"

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Next.js dev server..." >> "$LOG_FILE"
  
  NODE_OPTIONS="--require $PROJECT_DIR/disable-mem-check.cjs --max-old-space-size=4096" \
  npx next dev -p 3000 >> "$LOG_FILE" 2>&1 &
  
  CHILD_PID=$!
  echo $CHILD_PID > "$PID_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server PID: $CHILD_PID" >> "$LOG_FILE"
  
  # Wait for the child process
  wait $CHILD_PID
  EXIT_CODE=$?
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server exited with code $EXIT_CODE" >> "$LOG_FILE"
  
  # Don't restart immediately - wait a bit
  sleep 5
done
