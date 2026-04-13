import { Activity, Award, BarChart2, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import type { Person } from '@/types'

interface PersonStatsProps {
  person: Person
}

export function PersonStats({ person }: PersonStatsProps) {
  const stats = person.performanceStats

  return (
    <div className="space-y-3">
      {/* Top row: core counts */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <div className="flex justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-foreground">{person.totalTrades}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Trades</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {stats ? (
                <span className={stats.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}>
                  {stats.winRate}%
                </span>
              ) : person.avgReturn !== undefined ? (
                <span className={person.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {person.avgReturn >= 0 ? '+' : ''}
                  {person.avgReturn.toFixed(1)}%
                </span>
              ) : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats ? 'Win Rate' : 'Avg Return'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-3 text-center">
            <div className="flex justify-center mb-2">
              <BarChart2 className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {person.mostTradedTickers?.slice(0, 2).join(', ') ?? 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Top Tickers</p>
          </CardContent>
        </Card>
      </div>

      {/* Extended performance stats */}
      {stats && (
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Performance Stats ({stats.tradesWithData} tracked trades)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Avg Return */}
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Avg Return
                </p>
                <p className={cn(
                  'text-base font-bold',
                  stats.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(1)}%
                </p>
              </div>

              {/* Median Return */}
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Median Return
                </p>
                <p className={cn(
                  'text-base font-bold',
                  stats.medianReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stats.medianReturn >= 0 ? '+' : ''}{stats.medianReturn.toFixed(1)}%
                </p>
              </div>

              {/* Best Trade */}
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Best Trade
                  </p>
                </div>
                <p className="font-mono text-xs font-bold text-foreground">
                  {stats.bestTrade.ticker}
                </p>
                <p className="text-base font-bold text-emerald-400">
                  +{stats.bestTrade.return.toFixed(1)}%
                </p>
              </div>

              {/* Worst Trade */}
              <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Worst Trade
                  </p>
                </div>
                <p className="font-mono text-xs font-bold text-foreground">
                  {stats.worstTrade.ticker}
                </p>
                <p className={cn(
                  'text-base font-bold',
                  stats.worstTrade.return >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stats.worstTrade.return >= 0 ? '+' : ''}
                  {stats.worstTrade.return.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Total P&L estimate */}
            <div className="mt-3 rounded-lg bg-muted/40 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className={cn(
                  'h-4 w-4',
                  stats.totalPnlEstimate >= 0 ? 'text-emerald-400' : 'text-red-400'
                )} />
                <p className="text-xs text-muted-foreground">Est. P&L (tracked trades)</p>
              </div>
              <p className={cn(
                'text-sm font-bold',
                stats.totalPnlEstimate >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stats.totalPnlEstimate >= 0 ? '+' : ''}
                {formatCurrency(Math.abs(stats.totalPnlEstimate))}
                {stats.totalPnlEstimate < 0 ? ' missed' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
