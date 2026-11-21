// Vercel build: generate the Prisma client, apply migrations when a database is
// connected, then build Next.js. With no database URL yet (first deploy, before
// Storage is attached) migrations are skipped and the site builds on its JSON
// fallback content. A failing migration with a URL present still fails the build.
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const dbUrl = [
  process.env.DATABASE_URL,
  process.env.DATABASE_POSTGRES_URL,
  process.env.POSTGRES_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
].find((u) => u && /^postgres(ql)?:\/\//.test(u))

run('npx prisma generate')
if (dbUrl) run('npx prisma migrate deploy')
else console.warn('\n⚠  No direct postgres:// database URL set — skipping migrations. Connect a database and redeploy.\n')
run('npx next build')
