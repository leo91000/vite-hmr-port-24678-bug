# Quick Setup Guide

## Prerequisites

- Node.js 18+
- pnpm 8+

## Setup

```bash
# Install dependencies
pnpm install

# Verify the bug exists
pnpm dev
```

## What You'll See

**First app (app1):**
```
apps/app1 dev: App1 running on http://localhost:3001
```

**Second app (app2):**
```
apps/app2 dev: WebSocket server error: Port 24678 is already in use
apps/app2 dev: App2 running on http://localhost:3002
```

The second app fails to create its WebSocket server because the first app's SSR environment already bound to port 24678.

## Explanation

Both apps have `server.hmr: false` in their vite.config.js, which should prevent WebSocket server creation. However, Vite still creates a WebSocket server on the default port 24678 for each app, causing the second one to fail.

## Testing the Fix

To test the proposed fix, modify `node_modules/vite/dist/node/chunks/config.js` around line 23747:

```javascript
function createWebSocketServer(server, config$2, httpsOptions) {
  if (config$2.server.ws === false) return { /* no-op stub */ };

  // Add this check:
  if (config$2.server.hmr === false) return {
    [isWebSocketServer]: true,
    get clients() { return new Set(); },
    async close() {},
    on: noop$2,
    off: noop$2,
    setInvokeHandler: noop$2,
    handleInvoke: async () => ({ error: {
      name: "TransportError",
      message: "handleInvoke not implemented",
      stack: new Error().stack
    } }),
    listen: noop$2,
    send: noop$2
  };

  // ... rest of function
}
```

After applying the fix, run `pnpm dev` again. Both apps should start successfully without errors.

## Clean Up

```bash
# Stop the dev servers
Press Ctrl+C

# Clean up
pnpm --parallel -r exec -- rm -rf node_modules dist
rm -rf node_modules
```
