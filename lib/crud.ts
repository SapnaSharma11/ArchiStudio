import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/auth'

/**
 * Generic, auth-guarded CRUD route handlers for a Prisma model.
 * Keeps every admin resource (sessions, videos, workshops, …) consistent and DRY.
 */

// Loosely-typed Prisma model delegate so any model assigns cleanly under strict mode.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Delegate = {
  findMany: (args?: any) => Promise<any[]>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type Options = {
  orderBy?: unknown
  publishable?: boolean
}

const defaultOrder = [{ displayOrder: 'asc' }, { createdAt: 'asc' }]

/** Convert Prisma rows (with Date objects) into plain JSON-safe objects for client components. */
export function serialize<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const out: Record<string, unknown> = {}
    for (const k in r) {
      const v = r[k]
      out[k] = v instanceof Date ? v.toISOString() : v
    }
    return out
  })
}

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  return Number.isInteger(id) && id > 0 ? id : null
}

function zodError(err: unknown): NextResponse | null {
  if (err instanceof z.ZodError) {
    return NextResponse.json({ error: err.issues.map((e) => e.message).join(', ') }, { status: 400 })
  }
  return null
}

export function listCreate(model: Delegate, schema: z.ZodTypeAny, opts: Options = {}) {
  const GET = async () => {
    const denied = await requireAdminApi()
    if (denied) return denied
    const rows = await model.findMany({ orderBy: opts.orderBy ?? defaultOrder })
    return NextResponse.json(rows)
  }

  const POST = async (req: NextRequest) => {
    const denied = await requireAdminApi()
    if (denied) return denied
    try {
      const data = schema.parse(await req.json())
      const created = await model.create({ data })
      return NextResponse.json(created, { status: 201 })
    } catch (err) {
      const z = zodError(err)
      if (z) return z
      console.error('Create error:', err)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }
  }

  return { GET, POST }
}

export function item(model: Delegate, schema: z.ZodTypeAny, opts: Options = {}) {
  type Ctx = { params: Promise<{ id: string }> }

  const PUT = async (req: NextRequest, ctx: Ctx) => {
    const denied = await requireAdminApi()
    if (denied) return denied
    const id = parseId((await ctx.params).id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    try {
      const data = schema.parse(await req.json())
      const updated = await model.update({ where: { id }, data })
      return NextResponse.json(updated)
    } catch (err) {
      const z = zodError(err)
      if (z) return z
      console.error('Update error:', err)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }
  }

  const PATCH = async (req: NextRequest, ctx: Ctx) => {
    const denied = await requireAdminApi()
    if (denied) return denied
    if (!opts.publishable) return NextResponse.json({ error: 'Not supported' }, { status: 400 })
    const id = parseId((await ctx.params).id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    try {
      const { published } = z.object({ published: z.boolean() }).parse(await req.json())
      const updated = await model.update({ where: { id }, data: { published } })
      return NextResponse.json(updated)
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
  }

  const DELETE = async (_req: NextRequest, ctx: Ctx) => {
    const denied = await requireAdminApi()
    if (denied) return denied
    const id = parseId((await ctx.params).id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    try {
      await model.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error('Delete error:', err)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }
  }

  return { PUT, PATCH, DELETE }
}
