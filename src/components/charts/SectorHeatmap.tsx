'use client'

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import type { SectorDatum } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

interface SectorHeatmapProps {
  data: SectorDatum[]
}

interface CustomContentProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  tradeCount?: number
  fill?: string
}

function CustomContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, tradeCount, fill } = props
  if (width < 40 || height < 30) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill, opacity: 0.8, stroke: '#0f172a', strokeWidth: 2 }} rx={6} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
        {name}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>
        {tradeCount} trade{tradeCount !== 1 ? 's' : ''}
      </text>
    </g>
  )
}

interface TooltipPayloadItem {
  payload?: SectorDatum
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  if (!d) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-bold text-foreground">{d.name}</p>
      <p className="text-emerald-400">{d.buyCount} buys</p>
      <p className="text-red-400">{d.sellCount} sells</p>
      <p className="text-muted-foreground">Vol: {formatCurrency(d.totalVolume)}</p>
    </div>
  )
}

export function SectorHeatmap({ data }: SectorHeatmapProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <Treemap
        data={data}
        dataKey="tradeCount"
        nameKey="name"
        content={<CustomContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  )
}
