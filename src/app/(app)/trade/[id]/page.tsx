'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, ExternalLink, FileText, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TradeInvestigationCard } from '@/components/trades/TradeInvestigationCard'
import { TradeTypeBadge } from '@/components/trades/TradeTypeBadge'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { PerformanceIntervals } from '@/components/trades/PerformanceIntervals'
import { PersonCard } from '@/components/person/PersonCard'
import { PriceChart } from '@/components/charts/PriceChart'
import { LookbackChart } from '@/components/charts/LookbackChart'
import {
  getTradeById,
  getTradeInvestigation,
  getRelatedNews,
  getSimilarTrades,
  getPriceHistory,
  getLookbackData,
} from '@/lib/mock-data'
import { formatCurrency, formatAmountRange, formatDate, formatRelativeDate, cn } from '@/lib/utils'

interface TradeDetailPageProps {
  params: { id: string }
}

export default function TradeDetailPage({ params }: TradeDetailPageProps) {
  const trade = getTradeById(params.id)
  if (!trade) notFound()

  const investigation = getTradeInvestigation(trade.id)
  const relatedNews = getRelatedNews(trade.id)
  const similarTrades = getSimilarTrades(trade.id)
  const priceHistory = getPriceHistory(trade.ticker, 90)
  const lookbackData = getLookbackData(trade.ticker, trade.tradeDate, 365)

  const daysToFiling = Math.round(
    (new Date(trade.filedDate).getTime() - new Date(trade.tradeDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/feed">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Link>
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {/* Trade header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-3xl font-black text-foreground">
                {trade.ticker}
              </span>
              <TradeTypeBadge type={trade.tradeType} />
            </div>
            <p className="text-sm text-muted-foreground">{trade.stock.companyName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {trade.amountMin && trade.amountMax
                ? formatAmountRange(trade.amountMin, trade.amountMax)
                : formatCurrency(trade.amount)}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeDate(trade.tradeDate)}</p>
          </div>
        </div>

        {/* AI Investigation */}
        {investigation && <TradeInvestigationCard investigation={investigation} />}

        {/* Performance Intervals */}
        {trade.performance && (
          <Card className="border-border">
            <CardContent className="p-4">
              <PerformanceIntervals
                performance={trade.performance}
                tradeType={trade.tradeType}
              />
            </CardContent>
          </Card>
        )}

        {/* Lookback Chart — price from trade date forward vs S&P 500 */}
        {lookbackData.length > 1 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Return Since Trade Date</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {trade.ticker} vs S&P 500 benchmark
                  </p>
                </div>
                {trade.performance?.currentReturn !== undefined && (
                  <div
                    className={cn(
                      'rounded-md border px-2 py-1 text-xs font-bold',
                      trade.performance.isWin
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    )}
                  >
                    {trade.performance.currentReturn >= 0 ? '+' : ''}
                    {trade.performance.currentReturn.toFixed(1)}%
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <LookbackChart
                data={lookbackData}
                ticker={trade.ticker}
                tradeType={trade.tradeType}
                height={240}
              />
            </CardContent>
          </Card>
        )}

        {/* 90-Day Price Chart (context around trade) */}
        {priceHistory.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">90-Day Price History</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <PriceChart
                data={priceHistory}
                tradeDate={trade.tradeDate}
                height={200}
              />
            </CardContent>
          </Card>
        )}

        {/* Trade Details */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Trade Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                  Trade Date
                </p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(trade.tradeDate)}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                  Filed Date
                </p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(trade.filedDate)}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                  Amount
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {trade.amountMin && trade.amountMax
                    ? formatAmountRange(trade.amountMin, trade.amountMax)
                    : formatCurrency(trade.amount)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                  Days to File
                </p>
                <p className={cn(
                  'text-sm font-semibold',
                  daysToFiling > 30 ? 'text-red-400' : daysToFiling > 10 ? 'text-orange-400' : 'text-foreground'
                )}>
                  {daysToFiling} days
                  {daysToFiling > 30 && <span className="text-[10px] ml-1">(late)</span>}
                </p>
              </div>
              {trade.shares && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    Shares
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {trade.shares.toLocaleString()}
                  </p>
                </div>
              )}
              {trade.priceAtTrade && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    Price at Trade
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    ${trade.priceAtTrade.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {trade.description && (
              <>
                <Separator />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
                    Description
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {trade.description}
                  </p>
                </div>
              </>
            )}

            {trade.transactionId && (
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-mono">
                  {trade.transactionId}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Person card */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Trader Profile
          </p>
          <PersonCard person={trade.person} showLink={true} />
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Related News
            </p>
            <div className="space-y-3">
              {relatedNews.map((article) => (
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{article.source}</span>
                      <span className="text-xs text-muted-foreground">
                        &bull; {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Similar Trades */}
        {similarTrades.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Similar Trades
            </p>
            <TradeFeed trades={similarTrades} />
          </div>
        )}
      </div>
    </div>
  )
}
