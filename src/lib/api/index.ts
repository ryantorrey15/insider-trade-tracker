/**
 * Unified data layer
 *
 * Congressional: House PTR disclosures scraped directly from disclosures-clerk.house.gov
 * Corporate:     SEC EDGAR Form 4 filings (no API key required)
 * Enrichment:    FMP batch profile/quote lookups for company names and prices
 */

import { createClient } from '@vercel/edge-config'
import type { Trade, ClusterAlert, Stock, SignalType } from '@/types'
import { fetchCongressionalTrades } from './congressional'
import { fetchInsiderTransactions, fetchProfile, fetchQuote, enrichStock } from './stocks'
import { getRecentTrades } from '@/lib/mock-data'

// ─── Cross-source conviction matching ────────────────────

export interface ConvictionMatch {
  ticker: string
  stock: Stock
  congressionalTrades: Trade[]
  insiderTrades: Trade[]
  score: number          // 0-100
  label: 'high' | 'medium' | 'low'
  windowDays: number
  detectedAt: string
}

/**
 * Returns true if two trade dates are within windowDays of each other.
 * Congressional trades have a 45+ day disclosure lag, so we use a wide window.
 */
function withinWindow(dateA: string, dateB: string, windowDays = 90): boolean {
  const msA = new Date(dateA).getTime()
  const msB = new Date(dateB).getTime()
  return Math.abs(msA - msB) <= windowDays * 24 * 60 * 60 * 1000
}

function scoreMatch(congressional: Trade[], insider: Trade[]): number {
  let score = 0

  // Base: number of corroborating parties (capped at 50 pts)
  score += Math.min(congressional.length * 10, 30)
  score += Math.min(insider.length * 10, 20)

  // Amount weight (up to 30 pts)
  const totalAmount = [...congressional, ...insider].reduce((s, t) => s + t.amount, 0)
  if (totalAmount >= 1_000_000) score += 30
  else if (totalAmount >= 500_000) score += 20
  else if (totalAmount >= 100_000) score += 10

  // All same direction (buy or sell) = +20
  const allBuys = [...congressional, ...insider].every((t) => t.tradeType === 'buy')
  const allSells = [...congressional, ...insider].every((t) => t.tradeType === 'sell')
  if (allBuys || allSells) score += 20

  return Math.min(score, 100)
}

export function findConvictionMatches(
  congressionalTrades: Trade[],
  insiderTrades: Trade[],
  windowDays = 90
): ConvictionMatch[] {
  // Group by ticker
  const byTicker = new Map<string, { congressional: Trade[]; insider: Trade[] }>()

  for (const t of congressionalTrades) {
    if (!byTicker.has(t.ticker)) byTicker.set(t.ticker, { congressional: [], insider: [] })
    byTicker.get(t.ticker)!.congressional.push(t)
  }
  for (const t of insiderTrades) {
    if (!byTicker.has(t.ticker)) continue // only tickers that also have congressional trades
    byTicker.get(t.ticker)!.insider.push(t)
  }

  const matches: ConvictionMatch[] = []

  Array.from(byTicker.entries()).forEach(([ticker, { congressional, insider }]) => {
    if (insider.length === 0) return

    // Keep only trades that are within the window of at least one trade from the other side
    const matchedCong = congressional.filter((c) =>
      insider.some((ins) => withinWindow(c.tradeDate, ins.tradeDate, windowDays))
    )
    const matchedIns = insider.filter((ins) =>
      congressional.some((c) => withinWindow(c.tradeDate, ins.tradeDate, windowDays))
    )

    if (matchedCong.length === 0 || matchedIns.length === 0) return

    const score = scoreMatch(matchedCong, matchedIns)
    const label: ConvictionMatch['label'] =
      score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

    matches.push({
      ticker,
      stock: matchedCong[0]?.stock ?? matchedIns[0]?.stock,
      congressionalTrades: matchedCong,
      insiderTrades: matchedIns,
      score,
      label,
      windowDays,
      detectedAt: new Date().toISOString(),
    })
  })

  return matches.sort((a, b) => b.score - a.score)
}

// ─── Cluster alert detection ──────────────────────────────

export function detectClusterAlerts(
  trades: Trade[],
  windowDays = 30,
  minCount = 2
): ClusterAlert[] {
  const byTicker = new Map<string, Trade[]>()
  for (const t of trades) {
    if (!byTicker.has(t.ticker)) byTicker.set(t.ticker, [])
    byTicker.get(t.ticker)!.push(t)
  }

  const alerts: ClusterAlert[] = []

  Array.from(byTicker.entries()).forEach(([ticker, tickerTrades]) => {
    // Check buy clusters
    const buys = tickerTrades.filter((t) => t.tradeType === 'buy')
    if (buys.length >= minCount) {
      const sorted = buys.sort(
        (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
      )
      // Sliding window
      for (let i = 0; i < sorted.length; i++) {
        const clusterWindow = sorted.filter((t) =>
          withinWindow(sorted[i].tradeDate, t.tradeDate, windowDays)
        )
        if (clusterWindow.length >= minCount) {
          alerts.push({
            id: `cluster-buy-${ticker}-${sorted[i].tradeDate}`,
            ticker,
            stock: clusterWindow[0].stock,
            trades: clusterWindow,
            windowDays,
            totalVolume: clusterWindow.reduce((s, t) => s + t.amount, 0),
            detectedAt: new Date().toISOString(),
            isBuyCluster: true,
          })
          break // one alert per ticker
        }
      }
    }
  })

  // Deduplicate by ticker
  const seen = new Set<string>()
  return alerts.filter((a) => {
    if (seen.has(a.ticker)) return false
    seen.add(a.ticker)
    return true
  })
}

// ─── Tag conviction on trades ─────────────────────────────

function tagConviction(trades: Trade[], matches: ConvictionMatch[]): Trade[] {
  const convictionTickers = new Set(
    matches.filter((m) => m.label === 'high' || m.label === 'medium').map((m) => m.ticker)
  )

  return trades.map((t) => {
    if (!convictionTickers.has(t.ticker)) return t
    const addedSignals: SignalType[] = t.signals.includes('cluster_buying')
      ? t.signals
      : [...t.signals, 'cluster_buying']
    return { ...t, signals: addedSignals, signalStrength: 'strong' as const }
  })
}

// ─── Unified feed ─────────────────────────────────────────

export interface UnifiedFeedResult {
  trades: Trade[]
  convictionMatches: ConvictionMatch[]
  clusterAlerts: ClusterAlert[]
  fetchedAt: string
  sources: { congressional: 'live' | 'fallback'; insider: 'live' | 'fallback' }
}

/** Read pre-fetched trades from Edge Config (written by the daily cron job) */
async function readCachedTrades(): Promise<{ congressional: Trade[] | null; corporate: Trade[] | null }> {
  try {
    const url = process.env.EDGE_CONFIG
    if (!url) return { congressional: null, corporate: null }
    const client = createClient(url)
    const [congressional, corporate] = await Promise.all([
      client.get<Trade[]>('congressionalTrades'),
      client.get<Trade[]>('corporateTrades'),
    ])
    return {
      congressional: Array.isArray(congressional) && congressional.length > 0 ? congressional : null,
      corporate: Array.isArray(corporate) && corporate.length > 0 ? corporate : null,
    }
  } catch {
    return { congressional: null, corporate: null }
  }
}

/** Batch-enrich a list of trades with FMP company names/prices (top N unique tickers) */
async function enrichTradeBatch(trades: Trade[], maxTickers = 15): Promise<Trade[]> {
  if (!process.env.FMP_API_KEY) return trades

  const tickers = Array.from(new Set(trades.map((t) => t.ticker))).slice(0, maxTickers)

  const [quotes, profiles] = await Promise.all([
    Promise.allSettled(tickers.map((t) => fetchQuote(t))),
    Promise.allSettled(tickers.map((t) => fetchProfile(t))),
  ])

  const stockMap = new Map<string, Partial<Stock>>()
  tickers.forEach((ticker, i) => {
    const quote = quotes[i].status === 'fulfilled' ? quotes[i].value : null
    const profile = profiles[i].status === 'fulfilled' ? profiles[i].value : null
    stockMap.set(ticker, {
      companyName: (profile as { companyName?: string } | null)?.companyName || quote?.name || ticker,
      sector: (profile as { sector?: string; industry?: string } | null)?.sector || (profile as { industry?: string } | null)?.industry || 'Unknown',
      logoUrl: (profile as { image?: string } | null)?.image || undefined,
      currentPrice: quote?.price || undefined,
      priceChange: quote?.change || undefined,
      priceChangePercent: quote?.changePercentage || undefined,
    })
  })

  return trades.map((t) => {
    const enrichment = stockMap.get(t.ticker)
    if (!enrichment) return t
    return { ...t, stock: { ...t.stock, ...enrichment } }
  })
}

/**
 * Fetches congressional trades from House PTR disclosures (real data),
 * corporate insider trades from SEC EDGAR Form 4, then cross-matches them.
 */
export async function fetchUnifiedFeed(): Promise<UnifiedFeedResult> {
  const fetchedAt = new Date().toISOString()

  // 1. Read pre-fetched trades from Edge Config (written by daily cron, ~0ms)
  const cached = await readCachedTrades()

  // Congressional — use Edge Config cache, fall back to mock
  const congTrades: Trade[] = cached.congressional ?? getRecentTrades(100, { source: 'congressional', tradeType: 'all' })
  const congSource: 'live' | 'fallback' = cached.congressional ? 'live' : 'fallback'

  // Corporate — use Edge Config cache, fall back to mock
  const allInsiderTrades: Trade[] = cached.corporate ?? getRecentTrades(50, { source: 'insider', tradeType: 'all' })
  const insiderSource: 'live' | 'fallback' = cached.corporate ? 'live' : 'fallback'

  // 2. Enrich company names/prices for both feeds via FMP
  const [enrichedCong, enrichedInsider] = await Promise.all([
    enrichTradeBatch(congTrades, 10),
    enrichTradeBatch(allInsiderTrades, 15),
  ])

  // 3. Conviction matching — same ticker traded by politician + corporate insider within 90 days
  const convictionMatches = findConvictionMatches(enrichedCong, enrichedInsider)

  // 4. Tag strong conviction onto trades
  const taggedCong = tagConviction(enrichedCong, convictionMatches)
  const taggedInsider = tagConviction(enrichedInsider, convictionMatches)

  // 5. Cluster alerts across both sources
  const allTrades = [...taggedCong, ...taggedInsider]
  const clusterAlerts = detectClusterAlerts(allTrades)

  // 6. Combined feed — freshest trades first
  const trades = allTrades.sort(
    (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
  )

  return {
    trades,
    convictionMatches,
    clusterAlerts,
    fetchedAt,
    sources: { congressional: congSource, insider: insiderSource },
  }
}

// ─── Per-ticker detail ────────────────────────────────────

export interface TickerDetailResult {
  stock: Stock
  insiderTrades: Trade[]
  relatedCongressionalTrades: Trade[]
  convictionMatch: ConvictionMatch | null
  fetchedAt: string
}

export async function fetchTickerDetail(ticker: string): Promise<TickerDetailResult> {
  const t = ticker.toUpperCase()
  const fetchedAt = new Date().toISOString()

  const [stock, insiderTrades, congResult] = await Promise.all([
    enrichStock(t),
    fetchInsiderTransactions(t),
    fetchCongressionalTrades(),
  ])

  const relatedCong = congResult.trades.filter((trade) => trade.ticker === t)
  const matches = findConvictionMatches(relatedCong, insiderTrades)

  return {
    stock,
    insiderTrades,
    relatedCongressionalTrades: relatedCong,
    convictionMatch: matches[0] ?? null,
    fetchedAt,
  }
}
