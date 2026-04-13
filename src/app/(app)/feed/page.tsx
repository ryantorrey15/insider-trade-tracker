'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { FilterDrawer } from '@/components/trades/FilterDrawer'
import { getRecentTrades, getCommitteeById, getClusterAlerts } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import type { FilterState } from '@/types'

const SOURCE_TABS: Array<{ label: string; value: FilterState['source'] }> = [
  { label: 'All', value: 'all' },
  { label: 'Corporate', value: 'insider' },
  { label: 'Congress', value: 'congressional' },
]

export default function FeedPage() {
  const [filters, setFilters] = useState<FilterState>({
    source: 'all',
    tradeType: 'all',
  })

  const trades = useMemo(() => getRecentTrades(50, filters), [filters])
  const activeCommittee = filters.committeeId ? getCommitteeById(filters.committeeId) : undefined
  const buyClusterAlerts = useMemo(() => getClusterAlerts().filter((a) => a.isBuyCluster), [])

  function handleSourceChange(source: FilterState['source']) {
    // Changing source tab clears committee filter if switching away from congressional
    const next: FilterState = { ...filters, source }
    if (source === 'insider') next.committeeId = undefined
    setFilters(next)
  }

  function handleFiltersChange(newFilters: FilterState) {
    setFilters(newFilters)
  }

  function clearCommitteeFilter() {
    setFilters((prev) => ({ ...prev, committeeId: undefined }))
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">Insider Feed</h1>
              <p className="text-xs text-muted-foreground">
                {trades.length} recent trades
              </p>
            </div>
            <FilterDrawer filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Source tabs */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {SOURCE_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleSourceChange(value)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-xs font-semibold transition-all',
                  filters.source === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Active committee filter pill */}
          {activeCommittee && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 pl-2.5 pr-1.5 py-1 text-xs font-medium text-purple-400">
                <Shield className="h-3 w-3" />
                {activeCommittee.name} Committee
                <button
                  onClick={clearCommitteeFilter}
                  className="ml-1 rounded-full p-0.5 hover:bg-purple-500/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Link
                href={`/committee/${activeCommittee.id}`}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                View committee
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Cluster Buy Alerts */}
      {buyClusterAlerts.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {buyClusterAlerts.map((alert) => (
            <Link key={alert.id} href={`/stock/${alert.ticker}`}>
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Cluster Buy Alert
                  </span>
                  <span className="font-mono text-sm font-black text-foreground">
                    {alert.ticker}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.trades.length} insiders purchased {alert.ticker} within {alert.windowDays} days — total {formatCurrency(alert.totalVolume)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {alert.trades.map((t) => (
                    <span key={t.id} className="text-[10px] font-medium text-amber-300/80 bg-amber-500/10 rounded px-1.5 py-0.5">
                      {t.person.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="py-3">
        <TradeFeed
          trades={trades}
          emptyMessage="No trades match your current filters. Try adjusting the source or removing signal filters."
        />
      </div>
    </div>
  )
}
