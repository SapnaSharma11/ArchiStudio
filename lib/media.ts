import { createHash } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * Media upload abstraction. Uses Cloudinary when configured (recommended for
 * production — it optimizes/transcodes images & video and serves over a CDN),
 * otherwise falls back to writing into /public/uploads for local development.
 *
 * Swapping providers later is a change to this one file only.
 */

export type UploadResult = { url: string; publicId?: string }

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )
}

export async function uploadMedia(file: File, folder = 'studio'): Promise<UploadResult> {
  return cloudinaryConfigured()
    ? uploadToCloudinary(file, folder)
    : uploadToLocal(file, folder)
}

async function uploadToCloudinary(file: File, folder: string): Promise<UploadResult> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!
  const apiKey = process.env.CLOUDINARY_API_KEY!
  const apiSecret = process.env.CLOUDINARY_API_SECRET!
  const timestamp = Math.floor(Date.now() / 1000)

  // Signature: all signed params sorted alphabetically, joined by '&', then the
  // api_secret appended, hashed with SHA-1. We only sign `folder` and `timestamp`.
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('folder', folder)
  form.append('signature', signature)

  // `auto` lets Cloudinary detect image vs video.
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status} ${await res.text()}`)
  }
  const data = (await res.json()) as { secure_url: string; public_id: string }
  return { url: data.secure_url, publicId: data.public_id }
}

async function uploadToLocal(file: File, folder: string): Promise<UploadResult> {
  const bytes = Buffer.from(await file.arrayBuffer())
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${Date.now()}-${safe}`
  const dir = path.join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), bytes)
  return { url: `/uploads/${folder}/${filename}` }
}
