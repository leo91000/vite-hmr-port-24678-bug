#!/bin/bash

echo "=========================================="
echo "Testing Vite Bug: hmr: false Port Conflict"
echo "=========================================="
echo ""

# Check if port 24678 is in use
if lsof -i :24678 >/dev/null 2>&1; then
  echo "⚠️  WARNING: Port 24678 is already in use!"
  echo "Please kill the process using this port first:"
  lsof -i :24678
  echo ""
  exit 1
fi

echo "✅ Port 24678 is available"
echo ""
echo "Starting both apps with 'hmr: false'..."
echo "Expected: Both apps start successfully"
echo "Actual: Second app will fail with port conflict"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start both apps and capture output
pnpm dev 2>&1 | grep -E "ready in|ERROR|Port.*already in use|Local:"
