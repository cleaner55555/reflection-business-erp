#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--require /home/z/my-project/disable-mem-check.cjs --max-old-space-size=2048"
exec npx next dev -p 3000 --webpack
