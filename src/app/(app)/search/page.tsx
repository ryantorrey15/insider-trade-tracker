'use client'

import { useState, useCallback, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { RecentSearches, useRecentSearches } from '@/components/search/RecentSearches'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { searchTrades } from '@/lib/mock-data'
import type { Trade } from '@/types'

const SUGGESTED_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'META', 'PLTR', 'AMZN', 'TSLA', 'AMD']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Trade[]>([])
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches()

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q)
      if (q.trim().length > 0) {
        const found = searchTrades(q)
        setResults(found)
        if (q.trim().length >= 2) addSearch(q.trim())
      } else {
        setResults([])
      }
    },
    [addSearch]
  )

  function handleRecentSelect(q: string) {
    handleSearch(q)
  }

  return (
    <div className="min-h-screen">
      {/* Sticky search bar */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground mb-3">Search</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="p-4 space-y-6">
        {/* No query: show recent + suggested */}
        {!query && (
          <>
            <RecentSearches
              searches={searches}
              onSelect={handleRecentSelect}
              onRemove={removeSearch}
              onClearAll={clearAll}
            />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Trending Tickers
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TICKERS.map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => handleSearch(ticker)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    {ticker}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Popular Searches
              </p>
              <div className="flex flex-col gap-1">
                {[
                  'Nancy Pelosi',
                  'Tommy Tuberville',
                  'Jensen Huang',
                  'Mark Zuckerberg',
                  'Dan Crenshaw',
                ].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSearch(name)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-left text-foreground hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground">&rarr;</span>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Query results */}
        {query && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            <TradeFeed
              trades={results}
              emptyMessage={`No trades found for "${query}". Try a different ticker or name.`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
