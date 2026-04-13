'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getAllPeople, getAllStocks } from '@/lib/mock-data'
import type { Person, Stock } from '@/types'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

interface Suggestion {
  type: 'person' | 'ticker'
  label: string
  sublabel: string
  value: string
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchBar({ onSearch, placeholder = 'Search tickers, politicians, CEOs...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setSuggestions([])
      return
    }

    const q = debouncedQuery.toLowerCase()
    const people = getAllPeople()
    const stocks = getAllStocks()

    const personSuggestions: Suggestion[] = people
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((p) => ({
        type: 'person' as const,
        label: p.name,
        sublabel: p.title,
        value: p.name,
      }))

    const tickerSuggestions: Suggestion[] = stocks
      .filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((s) => ({
        type: 'ticker' as const,
        label: s.ticker,
        sublabel: s.companyName,
        value: s.ticker,
      }))

    setSuggestions([...tickerSuggestions, ...personSuggestions])
    setShowSuggestions(true)
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  function handleSelect(suggestion: Suggestion) {
    setQuery(suggestion.value)
    onSearch(suggestion.value)
    setShowSuggestions(false)
  }

  function handleClear() {
    setQuery('')
    onSearch('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className="pl-9 pr-9 h-11 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                {s.type === 'ticker' ? (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground truncate">{s.sublabel}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground capitalize shrink-0">
                {s.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
