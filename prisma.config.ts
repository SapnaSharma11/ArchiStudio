import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Load .env.local first (takes priority — dotenv won't overwrite set vars), then .env.
loadEnv({ path: '.env.local' })
loadEnv()

// Prisma 7 reads its CLI config from here. `import 'dotenv/config'` above makes
// the DATABASE_URL in .env / .env.local available to `prisma migrate`/`db seed`.
// Same resolution as lib/prisma.ts: first direct postgres:// URL wins
// (Vercel integrations may inject POSTGRES_URL instead of DATABASE_URL).
const databaseUrl = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
].find((u) => u && /^postgres(ql)?:\/\//.test(u))

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    // No `tsx` dependency needed — Node 22 strips the TS types itself.
    seed: 'node --experimental-strip-types prisma/seed.mts',
  },
})
