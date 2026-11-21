import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import teamJson from '@/data/team.json'

export type PublicMember = {
  id: number | string
  name: string
  role: string
  discipline: string
  photo: string | null
  bio: string | null
}

/** Published team members (DB, falling back to data/team.json). */
export const getTeam = cache(async (): Promise<PublicMember[]> => {
  try {
    const rows = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return rows.map((m) => ({ id: m.id, name: m.name, role: m.role, discipline: m.discipline, photo: m.photo, bio: m.bio }))
  } catch {
    return teamJson.map((m, i) => ({ id: i, photo: null, ...m }))
  }
})

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}
