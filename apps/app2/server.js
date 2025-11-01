import express from 'express'
import { createServer } from 'vite'

const app = express()

// Create Vite server with environment API (like Nuxt does)
const vite = await createServer({
  server: {
    middlewareMode: true,
  },
  builder: {
    async buildApp(builder) {
      const environments = Object.values(builder.environments)
      for (const environment of environments) {
        await builder.build(environment)
      }
    },
  },
  environments: {
    client: {
      consumer: 'client',
    },
    ssr: {
      consumer: 'server',
      // This is the bug: hmr: false still creates WebSocket on port 24678
      server: {
        hmr: false,
      },
    },
  },
})

app.use(vite.middlewares)

app.listen(3002, () => {
  console.log('App2 running on http://localhost:3002')
})
