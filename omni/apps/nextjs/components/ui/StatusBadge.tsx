import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  variant: 'online' | 'offline' | 'pending' | 'responded' | 'expired'
}

const variants = {
  online: 'bg-success/10 text-success',
  offline: 'bg-neutral-100 text-neutral-500',
  pending: 'bg-warning/10 text-warning',
  responded: 'bg-success/10 text-success',
  expired: 'bg-neutral-100 text-neutral-400',
}

const labels = {
  online: 'En ligne',
  offline: 'Hors ligne',
  pending: 'En attente',
  responded: 'Répondu',
  expired: 'Expiré',
}

export function StatusBadge({ variant }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant])}>
      {labels[variant]}
    </span>
  )
}
