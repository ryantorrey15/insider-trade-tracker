'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { PriceSnapshot } from '@/types'

interface PriceChartProps {
  data: PriceSnapshot[]
  tradeDate?: string
  height?: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]
  const value = item?.value as number | undefined

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {label ? format(parseISO(label as string), 'MMM d, yyyy') : ''}
      </p>
      {value !== undefined && (
        <p className="text-sm font-bold text-foreground">
          ${value.toFixed(2)}
        </p>
      )}
      {payload[0]?.payload && (
        <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
          <div>O: ${(payload[0].payload as PriceSnapshot).open?.toFixed(2)}</div>
          <div>H: ${(payload[0].payload as PriceSnapshot).high?.toFixed(2)}</div>
          <div>L: ${(payload[0].payload as PriceSnapshot).low?.toFixed(2)}</div>
          <div>
            Vol:{' '}
            {((payload[0].payload as PriceSnapshot).volume / 1_000_000).toFixed(1)}M
          </div>
        </div>
      )}
    </div>
  )
}

export function PriceChart({ data, tradeDate, height = 220 }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-muted/30"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No price data available</p>
      </div>
    )
  }

  const prices = data.map((d) => d.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const firstPrice = data[0]?.close ?? 0
  const lastPrice = data[data.length - 1]?.close ?? 0
  const isPositive = lastPrice >= firstPrice

  const gradientId = `price-gradient-${Math.random().toString(36).slice(2, 7)}`

  // Show every ~15 days for tick marks
  const tickIndexes = data.reduce<number[]>((acc, _, i) => {
    if (i % Math.max(1, Math.floor(data.length / 6)) === 0) acc.push(i)
    return acc
  }, [])
  const ticks = tickIndexes.map((i) => data[i]?.date).filter(Boolean) as string[]

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
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
            domain={[minPrice * 0.98, maxPrice * 1.02]}
            tickFormatter={(val: number) => `$${val.toFixed(0)}`}
            tick={{ fontSize: 10, fill: 'hsl(240 5% 64.9%)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          {tradeDate && (
            <ReferenceLine
              x={tradeDate}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{
                value: 'Trade',
                position: 'top',
                fontSize: 10,
                fill: '#f59e0b',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="close"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: isPositive ? '#10b981' : '#ef4444',
              stroke: 'none',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
