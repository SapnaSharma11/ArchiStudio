import { MessageCircle } from 'lucide-react'

/** Discreet WhatsApp shortcut — only rendered when a WhatsApp number is set in Studio Settings. */
export default function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  const number = whatsapp.replace(/\D/g, '')
  const url = `https://wa.me/${number}?text=${encodeURIComponent('Hello, I would like to discuss a project with the studio.')}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-ink text-ivory border border-white/10 flex items-center justify-center hover:bg-bronze-deep transition-colors"
      aria-label="Message the studio on WhatsApp"
    >
      <MessageCircle size={20} strokeWidth={1.5} />
    </a>
  )
}
