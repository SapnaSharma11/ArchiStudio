import { prisma } from '@/lib/prisma'
import PrincipalForm, { type PrincipalDTO } from '@/components/dashboard/principal/PrincipalForm'

export const dynamic = 'force-dynamic'

// Principal architect profile — Profile table (singleton), API /api/admin/profile.
export default async function Page() {
  let initial: PrincipalDTO | null = null
  try {
    const p = await prisma.profile.findUnique({ where: { id: 1 } })
    if (p) {
      initial = {
        photo: p.photo,
        name: p.name,
        designation: p.designation,
        biography: p.biography,
        experience: p.experience,
        education: p.education,
        specializations: p.specializations,
        achievements: p.achievements,
        phone: p.phone,
        email: p.email,
        socials: (p.socials as Record<string, string> | null) ?? null,
      }
    }
  } catch {
    /* DB not ready */
  }
  return <PrincipalForm initial={initial} />
}
