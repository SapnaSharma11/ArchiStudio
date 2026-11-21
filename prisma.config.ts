import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Load .env.local first (takes priority — dotenv won't overwrite set vars), then .env.
loadEnv({ path: '.env.local' })
loadEnv()

// Prisma 7 reads its CLI config from here. `import 'dotenv/config'` above makes
// the DATABASE_URL in .env / .env.local available to `prisma migrate`/`db seed`.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // No `tsx` dependency needed — Node 22 strips the TS types itself.
    seed: 'node --experimental-strip-types prisma/seed.mts',
  },
})
