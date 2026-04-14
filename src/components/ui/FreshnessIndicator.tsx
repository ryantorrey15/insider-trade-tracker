'use client'

import { cn } from '@/lib/utils'

interface FreshnessIndicatorProps {
  fetchedAt: string
  source?: 'live' | 'fallback'
  className?: string
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function FreshnessIndicator({ fetchedAt, source, className }: FreshnessIndicatorProps) {
  const label = source === 'fallback' ? 'Demo data' : `Updated ${timeAgo(fetchedAt)}`
  const isLive = source !== 'fallback'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          isLive ? 'bg-emerald-500' : 'bg-amber-500'
        )}
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
