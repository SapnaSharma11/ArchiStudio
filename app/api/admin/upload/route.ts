import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { uploadMedia } from '@/lib/media'

// Local-disk fallback needs the Node runtime (fs).
export const runtime = 'nodejs'

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const form = await req.formData()
    const file = form.get('file')
    const folder = (form.get('folder') as string) || 'studio'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }
    if (!/^(image|video)\//.test(file.type)) {
      return NextResponse.json({ error: 'Only image or video files are allowed' }, { status: 400 })
    }

    const result = await uploadMedia(file, folder)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
