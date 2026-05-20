import { cn } from '@/lib/utils'

interface AIBadgeProps {
  variant: 'response' | 'overridden' | 'badge'
}

const variants = {
  response: 'text-xs text-ai-accent bg-ai-accent/10 px-2 py-0.5 rounded-full',
  overridden: 'text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full',
  badge: 'inline-flex items-center gap-1 text-xs font-medium text-ai-accent bg-ai-accent/10 px-2 py-0.5 rounded-full',
}

const labels = {
  response: '⚡ Réponse automatique — Omni AI',
  overridden: 'Modifié par le vendeur',
  badge: '⚡ IA',
}

export function AIBadge({ variant }: AIBadgeProps) {
  return (
    <span className={cn(variants[variant])}>
      {labels[variant]}
    </span>
  )
}
