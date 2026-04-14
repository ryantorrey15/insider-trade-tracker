'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { FilterDrawer } from '@/components/trades/FilterDrawer'
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator'
import { getRecentTrades, getCommitteeById, COMMITTEES } from '@/lib/mock-data'
import type { FilterState, Trade } from '@/types'
import type { UnifiedFeedResult } from '@/lib/api'

const SOURCE_TABS: Array<{ label: string; value: FilterState['source'] }> = [
  { label: 'All', value: 'all' },
  { label: 'Corporate', value: 'insider' },
  { label: 'Congress', value: 'congressional' },
]

function applyFilters(trades: Trade[], filters: FilterState): Trade[] {
  let result = [...trades]

  if (filters.source && filters.source !== 'all') {
    result = result.filter((t) => t.source === filters.source)
  }
  if (filters.tradeType && filters.tradeType !== 'all') {
    result = result.filter((t) => t.tradeType === filters.tradeType)
  }
  if (filters.ticker) {
    result = result.filter((t) =>
      t.ticker.toLowerCase().includes(filters.ticker!.toLowerCase())
    )
  }
  if (filters.personId) {
    result = result.filter((t) => t.personId === filters.personId)
  }
  if (filters.committeeId) {
    const committee = COMMITTEES.find((c) => c.id === filters.committeeId)
    if (committee) {
      result = result.filter((t) => committee.memberIds.includes(t.personId))
    }
  }
  if (filters.signals && filters.signals.length > 0) {
    result = result.filter((t) =>
      filters.signals!.some((s) => t.signals.includes(s))
    )
  }
  if (filters.minAmount) {
    result = result.filter((t) => t.amount >= filters.minAmount!)
  }
  if (filters.hidePlannedTrades) {
    result = result.filter((t) => !t.isPlannedTrade)
  }

  return result.slice(0, 100)
}

export default function FeedPage() {
  const [filters, setFilters] = useState<FilterState>({
    source: 'all',
    tradeType: 'all',
  })

  // Live data state
  const [liveResult, setLiveResult] = useState<UnifiedFeedResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch('/api/trades')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: UnifiedFeedResult = await res.json()
      setLiveResult(data)
    } catch (err) {
      console.warn('[feed] live fetch failed, using mock data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveData()
  }, [fetchLiveData])

  // Use live trades if available, else fall back to mock
  const allTrades = useMemo(() => {
    if (liveResult && liveResult.trades.length > 0) return liveResult.trades
    return getRecentTrades(100)
  }, [liveResult])

  const trades = useMemo(() => applyFilters(allTrades, filters), [allTrades, filters])

  const activeCommittee = filters.committeeId ? getCommitteeById(filters.committeeId) : undefined

  function handleSourceChange(source: FilterState['source']) {
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
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : `${trades.length} recent trades`}
                </p>
                {!loading && liveResult && (
                  <FreshnessIndicator
                    fetchedAt={liveResult.fetchedAt}
                    source={liveResult.sources.congressional}
                  />
                )}
              </div>
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

      {/* Conviction Matches Banner */}
      {liveResult && liveResult.convictionMatches.filter((m) => m.label === 'high').length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {liveResult.convictionMatches
            .filter((m) => m.label === 'high')
            .slice(0, 2)
            .map((match) => (
              <Link key={match.ticker} href={`/stock/${match.ticker}`}>
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/5 p-4 hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                      High Conviction Signal
                    </span>
                    <span className="font-mono text-sm font-black text-foreground">
                      {match.ticker}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {match.congressionalTrades.length} politician{match.congressionalTrades.length > 1 ? 's' : ''} +{' '}
                    {match.insiderTrades.length} corporate insider{match.insiderTrades.length > 1 ? 's' : ''} both traded within {match.windowDays} days — score {match.score}/100
                  </p>
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
