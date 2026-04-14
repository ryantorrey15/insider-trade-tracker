import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockHeader } from '@/components/stock/StockHeader'
import { PriceChart } from '@/components/charts/PriceChart'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator'
import {
  getTradesByTicker,
  getPriceHistory,
  getNewsForTicker,
  getInsiderSentiment,
  getClusterAlertsForTicker,
  STOCKS,
} from '@/lib/mock-data'
import { fetchTickerDetail } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Stock } from '@/types'

interface StockDetailPageProps {
  params: Promise<{ ticker: string }>
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { ticker: rawTicker } = await params
  const ticker = rawTicker.toUpperCase()

  // Fetch real data (with implicit fallback on error inside fetchTickerDetail)
  const liveDetail = await fetchTickerDetail(ticker).catch(() => null)

  // Build stock object: prefer live, fall back to mock
  const mockStock = STOCKS[ticker]
  const liveStock = liveDetail?.stock

  // If ticker has no data in either source, 404
  if (!liveStock && !mockStock) notFound()

  const stock: Stock = liveStock?.companyName && liveStock.companyName !== ticker
    ? liveStock
    : (mockStock ?? liveStock!)

  // Trades: prefer live combined, fall back to mock
  const liveTrades = liveDetail
    ? [...(liveDetail.insiderTrades), ...(liveDetail.relatedCongressionalTrades)]
        .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    : []
  const trades = liveTrades.length > 0 ? liveTrades : getTradesByTicker(ticker)

  // Sentiment: compute from live trades if available, else mock
  const buyTrades = trades.filter((t) => t.tradeType === 'buy')
  const sellTrades = trades.filter((t) => t.tradeType === 'sell')
  const totalVolume = trades.reduce((s, t) => s + t.amount, 0)
  const bullishPercent = trades.length > 0
    ? Math.round((buyTrades.length / trades.length) * 100)
    : 50

  const mockSentiment = getInsiderSentiment(ticker)
  const sentiment = liveTrades.length > 0
    ? { buyCount: buyTrades.length, sellCount: sellTrades.length, bullishPercent, totalVolume }
    : mockSentiment

  // Cluster alerts: from live detection or mock
  const liveClusterAlerts = liveDetail?.convictionMatch
    ? [{
        id: `conv-${ticker}`,
        ticker,
        stock,
        trades: [
          ...liveDetail.relatedCongressionalTrades.slice(0, 3),
          ...liveDetail.insiderTrades.slice(0, 3),
        ],
        windowDays: liveDetail.convictionMatch.windowDays,
        totalVolume: [...liveDetail.relatedCongressionalTrades, ...liveDetail.insiderTrades]
          .reduce((s, t) => s + t.amount, 0),
        detectedAt: liveDetail.fetchedAt,
        isBuyCluster: true,
      }]
    : []
  const clusterAlerts = liveClusterAlerts.length > 0
    ? liveClusterAlerts
    : getClusterAlertsForTicker(ticker)

  // Price history always from mock (Finnhub candles not on free tier)
  const priceHistory = getPriceHistory(ticker, 90)

  // News: real from Finnhub if available in future; use mock for now
  const news = getNewsForTicker(ticker)

  const fetchedAt = liveDetail?.fetchedAt ?? new Date().toISOString()
  const isLive = liveTrades.length > 0

  return (
    <div className="min-h-screen">
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/feed">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <FreshnessIndicator
            fetchedAt={fetchedAt}
            source={isLive ? 'live' : 'fallback'}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stock header */}
        <StockHeader stock={stock} />

        {/* Conviction Match Banner */}
        {liveDetail?.convictionMatch && liveDetail.convictionMatch.label !== 'low' && (
          <div className={`rounded-xl border p-4 space-y-2 ${
            liveDetail.convictionMatch.label === 'high'
              ? 'border-blue-500/40 bg-blue-500/5'
              : 'border-violet-500/40 bg-violet-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wide ${
                liveDetail.convictionMatch.label === 'high' ? 'text-blue-400' : 'text-violet-400'
              }`}>
                {liveDetail.convictionMatch.label === 'high' ? 'High' : 'Medium'} Conviction Signal
              </span>
              <span className="text-xs font-bold text-foreground">
                Score: {liveDetail.convictionMatch.score}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {liveDetail.convictionMatch.congressionalTrades.length} politician{liveDetail.convictionMatch.congressionalTrades.length > 1 ? 's' : ''} and{' '}
              {liveDetail.convictionMatch.insiderTrades.length} corporate insider{liveDetail.convictionMatch.insiderTrades.length > 1 ? 's' : ''} both traded {ticker} within a {liveDetail.convictionMatch.windowDays}-day window.
            </p>
          </div>
        )}

        {/* Insider Sentiment */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Insider Sentiment
          </p>
          <div className="space-y-1.5">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${sentiment.bullishPercent}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${100 - sentiment.bullishPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-emerald-400">{sentiment.buyCount} buys</span>
                {' / '}
                <span className="font-semibold text-red-400">{sentiment.sellCount} sells</span>
                {' — '}
                <span className="font-semibold text-foreground">{sentiment.bullishPercent}% bullish</span>
              </span>
              <span>{formatCurrency(sentiment.totalVolume)} total vol</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{trades.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Trades</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{sentiment.buyCount}</p>
              <p className="text-[10px] text-muted-foreground">Buys</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">{sentiment.sellCount}</p>
              <p className="text-[10px] text-muted-foreground">Sells</p>
            </div>
          </div>
        </div>

        {/* Cluster / Conviction Alerts */}
        {clusterAlerts.filter((a) => a.isBuyCluster).map((alert) => (
          <div
            key={alert.id}
            className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Cluster Buy Alert
              </span>
              <span className="text-[10px] text-muted-foreground">
                {alert.trades.length} insiders in {alert.windowDays} days
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {alert.trades.map((t) => t.person.name).join(', ')} all bought {alert.ticker} within a {alert.windowDays}-day window — total {formatCurrency(alert.totalVolume)}.
            </p>
          </div>
        ))}

        {/* Price chart */}
        {priceHistory.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">90-Day Price History</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <PriceChart data={priceHistory} height={220} />
            </CardContent>
          </Card>
        )}

        {/* News */}
        {news.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Related News
            </p>
            <div className="space-y-3">
              {news.slice(0, 4).map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{article.source}</span>
                      <span className="text-xs text-muted-foreground">
                        &bull;{' '}
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Trade feed */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            All Trades ({trades.length})
          </p>
          <TradeFeed
            trades={trades}
            emptyMessage={`No trades found for ${ticker}.`}
          />
        </div>
      </div>
    </div>
  )
}
