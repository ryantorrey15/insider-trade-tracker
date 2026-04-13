import { InboxIcon } from 'lucide-react'
import { TradeCard } from './TradeCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Trade } from '@/types'

interface TradeFeedProps {
  trades: Trade[]
  isLoading?: boolean
  emptyMessage?: string
}

function TradeSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-1.5 px-1">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
      </div>
    </div>
  )
}

export function TradeFeed({ trades, isLoading, emptyMessage }: TradeFeedProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <TradeSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <InboxIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground mb-1">No trades found</p>
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? 'Try adjusting your filters to see more results.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {trades.map((trade) => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  )
}
