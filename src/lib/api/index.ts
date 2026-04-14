/**
 * Unified data layer
 *
 * Combines congressional trades (Quiver Quant) and corporate insider trades
 * (Finnhub). Cross-matches same-ticker trades within a 90-day window to
 * generate conviction signals.
 */

import type { Trade, ClusterAlert, Stock, SignalType } from '@/types'
import { fetchCongressionalTrades } from './congressional'
import { fetchInsiderTransactions, enrichStock } from './stocks'

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

/**
 * Fetches congressional trades (all) plus insider trades for any tickers
 * that appear in the congressional feed, then cross-matches them.
 */
export async function fetchUnifiedFeed(): Promise<UnifiedFeedResult> {
  const fetchedAt = new Date().toISOString()

  // 1. Congressional trades
  const congResult = await fetchCongressionalTrades()
  const congTrades = congResult.trades

  // 2. Unique tickers in congressional feed (limit to 20 to stay within rate limits)
  const uniqueTickers = Array.from(new Set(congTrades.map((t) => t.ticker))).slice(0, 20)

  // 3. Insider trades for those tickers (parallel, but rate-limit-aware)
  let allInsiderTrades: Trade[] = []
  let insiderSource: 'live' | 'fallback' = 'fallback'

  if (process.env.FINNHUB_API_KEY) {
    const insiderBatches = await Promise.allSettled(
      uniqueTickers.map((ticker) => fetchInsiderTransactions(ticker))
    )
    for (const result of insiderBatches) {
      if (result.status === 'fulfilled') {
        allInsiderTrades = allInsiderTrades.concat(result.value)
      }
    }
    if (allInsiderTrades.length > 0) insiderSource = 'live'
  }

  // 4. Conviction matching
  const convictionMatches = findConvictionMatches(congTrades, allInsiderTrades)

  // 5. Tag strong conviction onto trades
  const taggedCong = tagConviction(congTrades, convictionMatches)
  const taggedInsider = tagConviction(allInsiderTrades, convictionMatches)

  // 6. Cluster alerts across combined trades
  const allTrades = [...taggedCong, ...taggedInsider]
  const clusterAlerts = detectClusterAlerts(allTrades)

  // 7. Combined feed sorted by trade date
  const trades = allTrades.sort(
    (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
  )

  return {
    trades,
    convictionMatches,
    clusterAlerts,
    fetchedAt,
    sources: { congressional: congResult.source, insider: insiderSource },
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
