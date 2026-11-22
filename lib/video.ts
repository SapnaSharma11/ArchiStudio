/** Video helpers with no server dependencies — safe in client components. */
export const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url)

export function videoPoster(url: string): string {
  const m = url.match(/^\/videos\/apn\/([a-z0-9-]+)\.mp4$/)
  return m ? `/images/apn/films/${m[1]}.jpg` : ''
}
