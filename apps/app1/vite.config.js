import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    middlewareMode: true,
  },
  builder: {
    async buildApp(builder) {
      // Simplified build - just to trigger environment creation
      await builder.build(builder.environments.client)
      await builder.build(builder.environments.ssr)
    },
  },
  environments: {
    client: {
      dev: {
        // Client needs HMR on a specific port
        createIdleServer: true,
      },
    },
    ssr: {
      dev: {
        createIdleServer: true,
      },
      // SSR environment with hmr: false - this triggers the bug!
      server: {
        hmr: false,
      },
    },
  },
})
