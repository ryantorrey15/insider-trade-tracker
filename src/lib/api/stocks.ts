import type {
  FinnhubNewsArticle,
  FinnhubInsiderTransaction,
  FinnhubInsiderTransactionsResponse,
  FinnhubInsiderSentimentResponse,
} from './types'
import type { Trade, Person, Stock, TradeType, SignalType } from '@/types'

// ─── FMP (quotes + profiles) ──────────────────────────────
const FMP_BASE = 'https://financialmodelingprep.com/stable'
const FMP_KEY = process.env.FMP_API_KEY ?? ''

function fmpUrl(path: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams({ ...params, apikey: FMP_KEY })
  return `${FMP_BASE}${path}?${search.toString()}`
}

// ─── Finnhub (insider transactions + sentiment) ───────────
const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const FINNHUB_KEY = process.env.FINNHUB_API_KEY ?? ''

function finnhubUrl(path: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams({ ...params, token: FINNHUB_KEY })
  return `${FINNHUB_BASE}${path}?${search.toString()}`
}

interface FmpQuote {
  symbol: string
  price: number
  change: number
  changePercentage: number
  volume: number
  marketCap: number
  name: string
}

interface FmpProfile {
  symbol: string
  companyName: string
  industry: string
  sector: string
  image: string
  website: string
}

// ─── Quote (FMP) ─────────────────────────────────────────
export async function fetchQuote(ticker: string): Promise<FmpQuote | null> {
  if (!FMP_KEY) return null
  try {
    const res = await fetch(fmpUrl('/quote', { symbol: ticker }), {
      next: { revalidate: 5 * 60 }, // 5 min
    })
    if (!res.ok) return null
    const data: FmpQuote[] = await res.json()
    return data?.[0] ?? null
  } catch {
    return null
  }
}

// ─── Profile (FMP) ───────────────────────────────────────
export async function fetchProfile(ticker: string): Promise<FmpProfile | null> {
  if (!FMP_KEY) return null
  try {
    const res = await fetch(fmpUrl('/profile', { symbol: ticker }), {
      next: { revalidate: 24 * 60 * 60 }, // 24h
    })
    if (!res.ok) return null
    const data: FmpProfile[] = await res.json()
    return data?.[0] ?? null
  } catch {
    return null
  }
}

// ─── News ─────────────────────────────────────────────────
export async function fetchCompanyNews(
  ticker: string,
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<FinnhubNewsArticle[]> {
  try {
    const res = await fetch(finnhubUrl('/company-news', { symbol: ticker, from, to }), {
      next: { revalidate: 60 * 60 }, // 1h
    })
    if (!res.ok) return []
    const data: FinnhubNewsArticle[] = await res.json()
    return Array.isArray(data) ? data.slice(0, 10) : []
  } catch {
    return []
  }
}

// ─── Insider transactions ─────────────────────────────────
function normalizeInsiderTransactionType(code: string): TradeType {
  switch (code) {
    case 'P': return 'buy'
    case 'S': return 'sell'
    case 'M': return 'exercise' // option exercise
    case 'A': return 'buy'      // granted/awarded
    case 'D': return 'sell'     // returned/disposed
    case 'F': return 'sell'     // tax withholding
    case 'G': return 'gift'
    default: return 'buy'
  }
}

function inferInsiderSignals(tx: FinnhubInsiderTransaction, totalShares: number): SignalType[] {
  const signals: SignalType[] = []
  const absChange = Math.abs(tx.change)
  if (absChange > 0 && tx.share > 0) {
    const pct = absChange / tx.share
    if (pct > 0.05) signals.push('unusual_volume') // >5% of holdings
  }
  if (totalShares > 100_000 && tx.transactionPrice > 0) {
    const value = totalShares * tx.transactionPrice
    if (value >= 500_000) signals.push('executive_buy')
  }
  return signals
}

export async function fetchInsiderTransactions(ticker: string): Promise<Trade[]> {
  try {
    const res = await fetch(
      finnhubUrl('/stock/insider-transactions', { symbol: ticker }),
      { next: { revalidate: 4 * 60 * 60 } } // 4h
    )
    if (!res.ok) return []

    const body: FinnhubInsiderTransactionsResponse = await res.json()
    if (!body.data || !Array.isArray(body.data)) return []

    const stock: Stock = {
      ticker: ticker.toUpperCase(),
      companyName: ticker.toUpperCase(),
      sector: 'Unknown',
    }

    return body.data
      .filter((tx) => tx.transactionDate && tx.change !== 0 && !tx.isDerivative)
      .slice(0, 100)
      .map((tx, i): Trade => {
        const tradeType = normalizeInsiderTransactionType(tx.transactionCode)
        const absChange = Math.abs(tx.change)
        const amount = absChange * (tx.transactionPrice || 0)
        const personId = `insider-${ticker}-${tx.name.replace(/\s+/g, '-').toLowerCase()}`

        const person: Person = {
          id: personId,
          name: toTitleCase(tx.name),
          title: 'Corporate Insider',
          source: 'insider',
          totalTrades: 0,
        }

        const signals = inferInsiderSignals(tx, absChange)

        return {
          id: `ins-${ticker}-${tx.id || i}-${tx.transactionDate}`,
          personId,
          person,
          ticker: ticker.toUpperCase(),
          stock,
          tradeType,
          source: 'insider',
          amount,
          shares: absChange,
          priceAtTrade: tx.transactionPrice || undefined,
          tradeDate: tx.transactionDate,
          filedDate: tx.filingDate,
          signals,
          transactionId: tx.id,
        }
      })
  } catch {
    return []
  }
}

// ─── Insider sentiment ────────────────────────────────────
export interface InsiderSentimentSummary {
  ticker: string
  latestMspr: number   // -100 to 100, monthly
  avgMspr3m: number
  netChange: number    // net share change last 3 months
  label: 'bullish' | 'bearish' | 'neutral'
}

export async function fetchInsiderSentiment(ticker: string): Promise<InsiderSentimentSummary | null> {
  try {
    const to = new Date().toISOString().slice(0, 10)
    const fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - 6)
    const from = fromDate.toISOString().slice(0, 10)

    const res = await fetch(
      finnhubUrl('/stock/insider-sentiment', { symbol: ticker, from, to }),
      { next: { revalidate: 24 * 60 * 60 } }
    )
    if (!res.ok) return null

    const body: FinnhubInsiderSentimentResponse = await res.json()
    if (!body.data || body.data.length === 0) return null

    const recent = body.data.slice(-3)
    const latestMspr = recent[recent.length - 1]?.mspr ?? 0
    const avgMspr3m = recent.reduce((s, d) => s + d.mspr, 0) / recent.length
    const netChange = recent.reduce((s, d) => s + d.change, 0)

    return {
      ticker: ticker.toUpperCase(),
      latestMspr,
      avgMspr3m,
      netChange,
      label: avgMspr3m > 10 ? 'bullish' : avgMspr3m < -10 ? 'bearish' : 'neutral',
    }
  } catch {
    return null
  }
}

// ─── Enrich stock stub with live data ─────────────────────
export async function enrichStock(ticker: string): Promise<Stock> {
  const [quote, profile] = await Promise.all([fetchQuote(ticker), fetchProfile(ticker)])

  return {
    ticker: ticker.toUpperCase(),
    companyName: profile?.companyName || quote?.name || ticker.toUpperCase(),
    sector: profile?.sector || profile?.industry || 'Unknown',
    logoUrl: profile?.image || undefined,
    currentPrice: quote?.price || undefined,
    priceChange: quote?.change || undefined,
    priceChangePercent: quote?.changePercentage || undefined,
  }
}

// ─── Helpers ──────────────────────────────────────────────
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
