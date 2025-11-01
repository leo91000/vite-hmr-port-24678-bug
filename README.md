# Vite Bug Reproduction: Environment API with `server.hmr: false` Creates WebSocket on Port 24678

This repository demonstrates a bug in Vite 7.1.12 where using the **Environment API** with `server.hmr: false` for SSR environments still creates a WebSocket server on port 24678, causing port conflicts in monorepos.

## The Bug

When using Vite's Environment API with multiple environments (client + SSR), setting `server.hmr: false` for the SSR environment should prevent WebSocket server creation. However, Vite still creates a WebSocket server and tries to bind to the default port 24678, causing `EADDRINUSE` errors when multiple apps run simultaneously.

## Reproduction Steps

```bash
# Install dependencies
pnpm install

# Run both apps in parallel
pnpm dev
```

### Expected Result

Both apps should start successfully without errors.

### Actual Result

```
apps/app1 dev: App1 running on http://localhost:3001
apps/app2 dev: WebSocket server error: Port 24678 is already in use ❌
apps/app2 dev: App2 running on http://localhost:3002
```

## Impact

This bug affects:
- **Nuxt 4.x monorepos** (Nuxt uses environment API and sets `hmr: false` for SSR builds)
- Any framework using Vite's environment API with SSR
- Monorepos where multiple apps use environment API with disabled HMR

## Environment

- **Vite version:** 7.1.12
- **Node version:** 20+
- **Package manager:** pnpm
- **OS:** Linux

## Related Documentation

- [Vite Environment API](https://vite.dev/guide/api-environment)
- [Vite HMR Configuration](https://vite.dev/config/server-options.html#server-hmr)
