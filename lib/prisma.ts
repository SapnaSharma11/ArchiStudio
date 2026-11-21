import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Resolve a direct Postgres connection string. Works with a plain DATABASE_URL
 * (local, Neon, Prisma Postgres "direct" URL) and with the variables Vercel's
 * database integrations inject. `prisma+postgres://` (Accelerate) URLs are
 * skipped because the `pg` driver needs a direct TCP connection.
 */
export function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
  return candidates.find((u) => u && /^postgres(ql)?:\/\//.test(u))
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new Pool({
    connectionString: resolveDatabaseUrl(),
    // Serverless functions each hold their own pool — keep it small in production.
    max: process.env.NODE_ENV === 'production' ? 3 : 10,
    idleTimeoutMillis: 10_000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter, log: ['error'] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Reuse one client per warm instance (dev hot-reload and serverless alike).
globalForPrisma.prisma = prisma
