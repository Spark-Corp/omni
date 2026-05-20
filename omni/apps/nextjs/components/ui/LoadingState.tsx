interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton'
  count?: number
}

export function LoadingState({ variant = 'spinner', count = 3 }: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
