import { cn } from '@/lib/utils'
import type { TradePerformance, TradeType } from '@/types'

interface PerformanceIntervalsProps {
  performance: TradePerformance
  tradeType: TradeType
}

interface Interval {
  label: string
  shortLabel: string
  value?: number
  sp500?: number
  available: boolean
}

function ReturnCell({
  value,
  sp500,
  isBuy,
  available,
}: {
  value?: number
  sp500?: number
  isBuy: boolean
  available: boolean
}) {
  if (!available || value === undefined) {
    return (
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground/40">—</p>
        <p className="text-[10px] text-muted-foreground/30 mt-0.5">pending</p>
      </div>
    )
  }

  // Win = buy with positive return OR sell with negative return (stock went down = good exit)
  const isWin = isBuy ? value >= 0 : value <= 0
  const alpha = sp500 !== undefined ? value - sp500 : undefined

  return (
    <div className="text-center">
      <p
        className={cn(
          'text-sm font-bold',
          isWin ? 'text-emerald-400' : 'text-red-400'
        )}
      >
        {value >= 0 ? '+' : ''}
        {value.toFixed(1)}%
      </p>
      {alpha !== undefined && (
        <p
          className={cn(
            'text-[10px] mt-0.5',
            alpha >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
          )}
        >
          {alpha >= 0 ? '+' : ''}
          {alpha.toFixed(1)}% vs SPY
        </p>
      )}
    </div>
  )
}

export function PerformanceIntervals({ performance, tradeType }: PerformanceIntervalsProps) {
  const isBuy = tradeType === 'buy' || tradeType === 'exercise'
  const days = performance.daysSinceTrade

  const intervals: Interval[] = [
    {
      label: '1 Week',
      shortLabel: '1W',
      value: performance.return1w,
      available: days >= 7,
    },
    {
      label: '1 Month',
      shortLabel: '1M',
      value: performance.return1m,
      sp500: performance.sp500Return1m,
      available: days >= 30,
    },
    {
      label: '3 Months',
      shortLabel: '3M',
      value: performance.return3m,
      sp500: performance.sp500Return3m,
      available: days >= 90,
    },
    {
      label: '6 Months',
      shortLabel: '6M',
      value: performance.return6m,
      sp500: performance.sp500Return6m,
      available: days >= 180,
    },
    {
      label: '1 Year',
      shortLabel: '1Y',
      value: performance.return1y,
      sp500: performance.sp500Return1y,
      available: days >= 365,
    },
  ]

  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-3 font-semibold">
        Performance Since Trade
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {intervals.map((interval) => (
          <div
            key={interval.shortLabel}
            className={cn(
              'rounded-lg border p-2',
              interval.available
                ? 'border-border bg-muted/30'
                : 'border-border/30 bg-muted/10'
            )}
          >
            <p className="text-[10px] text-muted-foreground text-center mb-1.5 font-medium">
              {interval.shortLabel}
            </p>
            <ReturnCell
              value={interval.value}
              sp500={interval.sp500}
              isBuy={isBuy}
              available={interval.available}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        {isBuy
          ? 'Green = stock gained after buy. vs SPY shows alpha over S&P 500.'
          : 'Green = stock fell after sell (good exit). vs SPY shows relative move.'}
      </p>
    </div>
  )
}
