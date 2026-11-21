/** Upload one file through the existing admin upload API. Returns the URL. */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
  return data.url as string
}
