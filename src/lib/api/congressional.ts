import type { QuiverCongressTrade } from './types'
import type { Trade, Person, Stock, TradeType, SignalType } from '@/types'
import { getRecentTrades } from '@/lib/mock-data'

const QUIVER_URL = 'https://api.quiverquant.com/beta/live/congresstrading'
const QUIVER_KEY = process.env.QUIVER_API_KEY ?? ''

// ─── Range parser ────────────────────────────────────────
// "$50,001 - $100,000" → { min: 50001, max: 100000, mid: 75000 }
function parseRange(range: string): { min: number; max: number; mid: number } {
  const clean = range.replace(/[$,]/g, '')
  const parts = clean.split(' - ').map((p) => parseFloat(p.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1], mid: (parts[0] + parts[1]) / 2 }
  }
  const single = parseFloat(clean)
  return { min: single, max: single, mid: single }
}

// ─── Transaction type normalizer ─────────────────────────
function normalizeTransactionType(tx: string): TradeType {
  const t = tx.toLowerCase()
  if (t.includes('purchase')) return 'buy'
  if (t.includes('sale') || t.includes('sell')) return 'sell'
  if (t.includes('exchange')) return 'exchange'
  if (t.includes('gift')) return 'gift'
  return 'buy'
}

// ─── Party normalizer ────────────────────────────────────
function normalizeParty(party: string): 'D' | 'R' | 'I' | undefined {
  if (party === 'D') return 'D'
  if (party === 'R') return 'R'
  if (party === 'I') return 'I'
  return undefined
}

// ─── Signal inference ────────────────────────────────────
// We compute signals heuristically from what we have.
// Full committee-relevance matching happens in the index layer.
function inferSignals(
  trade: QuiverCongressTrade,
  amount: number
): SignalType[] {
  const signals: SignalType[] = []
  if (amount >= 250_000) signals.push('unusual_volume')
  if (trade.TickerType === 'OP') signals.push('pre_earnings_buy') // options = speculative
  return signals
}

// ─── Stock stub ─────────────────────────────────────────
// We return a minimal Stock — the stocks layer will enrich these
// with live prices when requested per-ticker.
function makeStockStub(ticker: string): Stock {
  return {
    ticker: ticker.toUpperCase(),
    companyName: ticker.toUpperCase(), // enriched later by Finnhub
    sector: 'Unknown',
  }
}

// ─── Normalize one Quiver record → app Trade ─────────────
export function normalizeCongressTrade(raw: QuiverCongressTrade, index: number): Trade {
  const ticker = raw.Ticker.toUpperCase()
  const range = parseRange(raw.Range)
  const tradeType = normalizeTransactionType(raw.Transaction)
  const personId = raw.BioGuideID || `congress-${raw.Representative.replace(/\s+/g, '-').toLowerCase()}`

  const person: Person = {
    id: personId,
    name: raw.Representative,
    title: raw.House === 'Senate' ? 'U.S. Senator' : 'U.S. Representative',
    party: normalizeParty(raw.Party),
    chamber: raw.House === 'Senate' ? 'Senate' : 'House',
    source: 'congressional',
    totalTrades: 0, // enriched in aggregation
  }

  const signals = inferSignals(raw, range.mid)

  return {
    id: `cong-${personId}-${raw.TransactionDate}-${ticker}-${index}`,
    personId,
    person,
    ticker,
    stock: makeStockStub(ticker),
    tradeType,
    source: 'congressional',
    amount: range.mid,
    amountMin: range.min,
    amountMax: range.max,
    tradeDate: raw.TransactionDate,
    filedDate: raw.ReportDate,
    signals,
    description: raw.Description ?? undefined,
    metadata: {
      tickerType: raw.TickerType,
      excessReturn: raw.ExcessReturn,
      priceChange: raw.PriceChange,
      spyChange: raw.SPYChange,
    },
  }
}

// ─── Main fetcher ────────────────────────────────────────
export interface CongressionalTradesResult {
  trades: Trade[]
  fetchedAt: string
  source: 'live' | 'fallback'
}

export async function fetchCongressionalTrades(): Promise<CongressionalTradesResult> {
  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (QUIVER_KEY) headers['Authorization'] = `Bearer ${QUIVER_KEY}`

    const res = await fetch(QUIVER_URL, {
      next: { revalidate: 4 * 60 * 60 }, // cache 4 hours
      headers,
    })

    if (!res.ok) throw new Error(`Quiver Quant returned ${res.status}`)

    const raw: QuiverCongressTrade[] = await res.json()

    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error('Empty response from Quiver Quant')
    }

    // Sort by TransactionDate descending, take most recent 200
    const sorted = raw
      .filter((t) => t.Ticker && t.Ticker.length <= 5 && t.TickerType !== 'OT')
      .sort((a, b) => new Date(b.TransactionDate).getTime() - new Date(a.TransactionDate).getTime())
      .slice(0, 200)

    const trades = sorted.map((t, i) => normalizeCongressTrade(t, i))

    return { trades, fetchedAt: new Date().toISOString(), source: 'live' }
  } catch (err) {
    console.error('[congressional] fetch failed:', err)
    // Fall back to mock congressional trades so the UI is never empty
    const mockTrades = getRecentTrades(100, { source: 'congressional', tradeType: 'all' })
    return { trades: mockTrades, fetchedAt: new Date().toISOString(), source: 'fallback' }
  }
}
