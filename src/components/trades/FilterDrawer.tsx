'use client'

import { useState } from 'react'
import { Filter, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SignalBadge } from './SignalBadge'
import { cn } from '@/lib/utils'
import { COMMITTEES } from '@/lib/mock-data'
import type { FilterState, SignalType } from '@/types'

const SIGNAL_OPTIONS: SignalType[] = [
  'committee_relevance',
  'pre_earnings_buy',
  'pre_earnings_sale',
  'cluster_buying',
  'cluster_selling',
  'unusual_volume',
  'executive_buy',
  'near_contract_award',
  'near_regulation',
]

const COMMITTEE_COLORS: Record<string, string> = {
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  zinc: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  lime: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
}

interface FilterDrawerProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function FilterDrawer({ filters, onFiltersChange }: FilterDrawerProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const activeFilterCount = [
    filters.source !== 'all',
    filters.tradeType !== 'all',
    !!filters.ticker,
    filters.signals && filters.signals.length > 0,
    !!filters.minAmount,
    !!filters.dateRange,
    !!filters.committeeId,
    !!filters.hidePlannedTrades,
  ].filter(Boolean).length

  // When source changes away from congressional, clear committee filter
  function handleSourceChange(source: FilterState['source']) {
    const next = { ...localFilters, source }
    if (source === 'insider') next.committeeId = undefined
    setLocalFilters(next)
  }

  function handleApply() {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  function handleReset() {
    const reset: FilterState = { source: 'all', tradeType: 'all' }
    setLocalFilters(reset)
    onFiltersChange(reset)
    setOpen(false)
  }

  function toggleSignal(signal: SignalType) {
    const current = localFilters.signals ?? []
    const next = current.includes(signal)
      ? current.filter((s) => s !== signal)
      : [...current, signal]
    setLocalFilters({ ...localFilters, signals: next })
  }

  function handleCommitteeSelect(id: string) {
    setLocalFilters({
      ...localFilters,
      committeeId: localFilters.committeeId === id ? undefined : id,
      // selecting a committee implies congressional source
      source: localFilters.committeeId === id ? localFilters.source : 'congressional',
    })
  }

  const showCommitteeFilter = localFilters.source !== 'insider'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Filter Trades</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Source */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Source
            </label>
            <div className="flex gap-2">
              {(['all', 'insider', 'congressional'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSourceChange(s)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                    localFilters.source === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                  )}
                >
                  {s === 'all' ? 'All' : s === 'insider' ? 'Corporate' : 'Congress'}
                </button>
              ))}
            </div>
          </div>

          {/* Hide Planned Trades — only for all/insider */}
          {localFilters.source !== 'congressional' && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      hidePlannedTrades: !localFilters.hidePlannedTrades,
                    })
                  }
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors cursor-pointer',
                    localFilters.hidePlannedTrades
                      ? 'bg-primary border-primary'
                      : 'bg-muted border-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                      localFilters.hidePlannedTrades ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Hide 10b5-1 / Scheduled trades
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Filter out pre-planned automatic trades
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Committee Filter — only for congressional / all */}
          {showCommitteeFilter && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Committee
                </label>
                {localFilters.committeeId && (
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, committeeId: undefined })}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Filter to trades by members of a specific committee
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COMMITTEES.map((committee) => {
                  const isActive = localFilters.committeeId === committee.id
                  const colorClass = COMMITTEE_COLORS[committee.color] ?? COMMITTEE_COLORS.zinc
                  return (
                    <button
                      key={committee.id}
                      onClick={() => handleCommitteeSelect(committee.id)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left transition-all',
                        isActive
                          ? colorClass
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-transparent'
                      )}
                    >
                      <p className="text-xs font-semibold leading-tight">{committee.name}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{committee.memberIds.length} member{committee.memberIds.length !== 1 ? 's' : ''}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trade Type */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Trade Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'buy', 'sell', 'exercise'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLocalFilters({ ...localFilters, tradeType: t as FilterState['tradeType'] })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                    localFilters.tradeType === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Ticker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Ticker Symbol
            </label>
            <div className="relative">
              <Input
                placeholder="e.g. NVDA, AAPL"
                value={localFilters.ticker ?? ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    ticker: e.target.value.toUpperCase() || undefined,
                  })
                }
                className="uppercase"
              />
              {localFilters.ticker && (
                <button
                  onClick={() => setLocalFilters({ ...localFilters, ticker: undefined })}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Min Amount */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Minimum Trade Amount
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Any', value: undefined },
                { label: '$15K+', value: 15000 },
                { label: '$50K+', value: 50000 },
                { label: '$250K+', value: 250000 },
                { label: '$1M+', value: 1000000 },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() =>
                    setLocalFilters({ ...localFilters, minAmount: value })
                  }
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    localFilters.minAmount === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Signals
            </label>
            <div className="flex flex-wrap gap-2">
              {SIGNAL_OPTIONS.map((signal) => {
                const isActive = (localFilters.signals ?? []).includes(signal)
                return (
                  <button
                    key={signal}
                    onClick={() => toggleSignal(signal)}
                    className={cn(
                      'transition-opacity',
                      !isActive && 'opacity-50 hover:opacity-80'
                    )}
                  >
                    <SignalBadge signal={signal} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 mt-8">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
