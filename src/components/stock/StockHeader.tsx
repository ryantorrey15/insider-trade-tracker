import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stock } from '@/types'

interface StockHeaderProps {
  stock: Stock
}

export function StockHeader({ stock }: StockHeaderProps) {
  const isPositive = (stock.priceChangePercent ?? 0) >= 0

  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-card">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-2xl font-black text-foreground">
            {stock.ticker}
          </span>
          <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {stock.sector}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{stock.companyName}</p>
      </div>

      {stock.currentPrice && (
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            ${stock.currentPrice.toFixed(2)}
          </p>
          <div
            className={cn(
              'flex items-center gap-1 justify-end',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? '+' : ''}
              {stock.priceChange?.toFixed(2)} ({isPositive ? '+' : ''}
              {stock.priceChangePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
