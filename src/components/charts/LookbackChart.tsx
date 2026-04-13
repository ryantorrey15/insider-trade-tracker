'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { LookbackDataPoint } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface LookbackChartProps {
  data: LookbackDataPoint[]
  ticker: string
  tradeType: 'buy' | 'sell' | 'exercise' | 'gift' | 'exchange'
  height?: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg min-w-[140px]">
      <p className="text-xs text-muted-foreground mb-2">
        {label ? format(parseISO(label as string), 'MMM d, yyyy') : ''}
      </p>
      {payload.map((entry) => {
        const val = entry.value as number
        const isPositive = val >= 0
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            <span
              className={cn(
                'text-xs font-bold',
                isPositive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {isPositive ? '+' : ''}{val.toFixed(2)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function LookbackChart({ data, ticker, tradeType, height = 240 }: LookbackChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-muted/30"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No lookback data available</p>
      </div>
    )
  }

  const finalStockReturn = data[data.length - 1]?.stockReturn ?? 0
  const isBuy = tradeType === 'buy' || tradeType === 'exercise'
  // For buys: stock going up is good (green). For sells: stock going down is good.
  const stockColor = isBuy
    ? finalStockReturn >= 0 ? '#10b981' : '#ef4444'
    : finalStockReturn <= 0 ? '#10b981' : '#ef4444'

  // Show every ~30 days for ticks
  const tickIndexes = data.reduce<number[]>((acc, _, i) => {
    if (i === 0 || i % Math.max(1, Math.floor(data.length / 6)) === 0) acc.push(i)
    return acc
  }, [])
  const ticks = tickIndexes.map((i) => data[i]?.date).filter(Boolean) as string[]

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(val: string) => format(parseISO(val), 'MMM d')}
            tick={{ fontSize: 10, fill: 'hsl(240 5% 64.9%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(0)}%`}
            tick={{ fontSize: 10, fill: 'hsl(240 5% 64.9%)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) =>
              value === 'stockReturn' ? ticker : 'S&P 500'
            }
          />
          {/* Zero baseline */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 2" />
          {/* Stock return line */}
          <Line
            type="monotone"
            dataKey="stockReturn"
            name={ticker}
            stroke={stockColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: stockColor, stroke: 'none' }}
          />
          {/* S&P 500 benchmark */}
          <Line
            type="monotone"
            dataKey="sp500Return"
            name="S&P 500"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: '#6366f1', stroke: 'none' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
