'use client'

import { useEffect, useState } from 'react'
import { Clock, X } from 'lucide-react'

const STORAGE_KEY = 'insider-recent-searches'
const MAX_RECENT = 8

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSearches(JSON.parse(stored) as string[])
    } catch {
      // ignore
    }
  }, [])

  function addSearch(query: string) {
    if (!query.trim()) return
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== query)
      const next = [query, ...filtered].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  function removeSearch(query: string) {
    setSearches((prev) => {
      const next = prev.filter((s) => s !== query)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  function clearAll() {
    setSearches([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return { searches, addSearch, removeSearch, clearAll }
}

interface RecentSearchesProps {
  searches: string[]
  onSelect: (query: string) => void
  onRemove: (query: string) => void
  onClearAll: () => void
}

export function RecentSearches({
  searches,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  if (searches.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Searches
        </span>
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {searches.map((s) => (
          <div
            key={s}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors group"
          >
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => onSelect(s)}
              className="flex-1 text-sm text-left text-foreground"
            >
              {s}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(s)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
