import { cn, getTradeTypeBg } from '@/lib/utils'
import type { TradeType } from '@/types'

interface TradeTypeBadgeProps {
  type: TradeType
  className?: string
}

const labels: Record<TradeType, string> = {
  buy: 'BUY',
  sell: 'SELL',
  exercise: 'EXERCISE',
  gift: 'GIFT',
  exchange: 'EXCHANGE',
}

export function TradeTypeBadge({ type, className }: TradeTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide',
        getTradeTypeBg(type),
        className
      )}
    >
      {labels[type]}
    </span>
  )
}
