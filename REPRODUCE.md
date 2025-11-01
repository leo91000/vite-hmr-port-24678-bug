# Steps to Reproduce the Bug

## Prerequisites

This bug requires using Vite's **Environment API** with middleware mode, which is how Nuxt 4.x runs Vite.

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Run Both Apps Simultaneously

```bash
pnpm dev
```

## 3. Observe the Error

You should see output similar to:

```
app1  | App1 running on http://localhost:3001
app2  | App2 running on http://localhost:3002
app2  | ERROR WebSocket server error: Port 24678 is already in use
```

## What's Happening

Each app uses the **Environment API** with two environments:
- **client environment:** Normal HMR (uses configured port)
- **ssr environment:** `server.hmr: false` (SSR doesn't need HMR)

1. **App1's SSR environment** starts first with `server.hmr: false`
   - Vite creates a WebSocket server on default port **24678**
   - App1 succeeds

2. **App2's SSR environment** starts second with `server.hmr: false`
   - Vite tries to create a WebSocket server on default port **24678**
   - **Fails** because App1's SSR environment is already using it

## Why This is Different from Regular Vite

In regular Vite (without environment API), `server.hmr: false` works fine because there's only one Vite server per app. But with the **Environment API**, each environment creates its own WebSocket server, and SSR environments with `hmr: false` all conflict on port 24678.

## Debugging

To see what's happening internally, add this log to `node_modules/vite/dist/node/chunks/config.js` around line 23766:

```javascript
const hmr = isObject(config$2.server.hmr) && config$2.server.hmr;
console.log('DEBUG: config.server.hmr =', config$2.server.hmr);
console.log('DEBUG: hmr =', hmr);
const hmrPort = hmr && hmr.port;
console.log('DEBUG: hmrPort =', hmrPort);
const port = hmrPort || 24678;
console.log('DEBUG: Final WebSocket port =', port);
```

You'll see:

```
DEBUG: config.server.hmr = false
DEBUG: hmr = false
DEBUG: hmrPort = false
DEBUG: Final WebSocket port = 24678  ← BUG: Should not create server at all!
```

## The Fix

Add this check at the start of `createWebSocketServer()` in `vite/dist/node/chunks/config.js`:

```javascript
function createWebSocketServer(server, config$2, httpsOptions) {
  if (config$2.server.ws === false) return { /* no-op stub */ };

  // Add this:
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

After applying this fix, both apps will start successfully without port conflicts.
