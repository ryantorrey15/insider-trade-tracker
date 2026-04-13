import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Shield, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { PersonCard } from '@/components/person/PersonCard'
import {
  getCommitteeById,
  getCommitteeStats,
  getTradesByCommittee,
} from '@/lib/mock-data'
import { cn, formatCurrency, getPartyBg } from '@/lib/utils'

interface CommitteeDetailPageProps {
  params: { id: string }
}

const COMMITTEE_COLOR_MAP: Record<string, {
  bg: string; text: string; border: string; icon: string; badgeBg: string
}> = {
  red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    icon: 'text-red-400',    badgeBg: 'bg-red-500/15 border-red-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'text-purple-400', badgeBg: 'bg-purple-500/15 border-purple-500/30' },
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   icon: 'text-blue-400',   badgeBg: 'bg-blue-500/15 border-blue-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: 'text-orange-400', badgeBg: 'bg-orange-500/15 border-orange-500/30' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: 'text-yellow-400', badgeBg: 'bg-yellow-500/15 border-yellow-500/30' },
  zinc:   { bg: 'bg-zinc-500/10',   text: 'text-zinc-400',   border: 'border-zinc-500/20',   icon: 'text-zinc-400',   badgeBg: 'bg-zinc-500/15 border-zinc-500/30' },
  green:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  icon: 'text-green-400',  badgeBg: 'bg-green-500/15 border-green-500/30' },
  teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   icon: 'text-teal-400',   badgeBg: 'bg-teal-500/15 border-teal-500/30' },
  lime:   { bg: 'bg-lime-500/10',   text: 'text-lime-400',   border: 'border-lime-500/20',   icon: 'text-lime-400',   badgeBg: 'bg-lime-500/15 border-lime-500/30' },
}

export default function CommitteeDetailPage({ params }: CommitteeDetailPageProps) {
  const committee = getCommitteeById(params.id)
  if (!committee) notFound()

  const stats = getCommitteeStats(committee.id)
  const trades = getTradesByCommittee(committee.id)
  const colors = COMMITTEE_COLOR_MAP[committee.color] ?? COMMITTEE_COLOR_MAP.zinc

  // Detect cluster trades: same ticker, multiple members, within 30 days
  const clusterMap: Record<string, typeof trades> = {}
  for (const trade of trades) {
    if (!clusterMap[trade.ticker]) clusterMap[trade.ticker] = []
    clusterMap[trade.ticker].push(trade)
  }
  const clusters = Object.entries(clusterMap)
    .filter(([, tickerTrades]) => {
      if (tickerTrades.length < 2) return false
      const uniquePersons = new Set(tickerTrades.map((t) => t.personId))
      return uniquePersons.size >= 2
    })
    .map(([ticker, tickerTrades]) => ({ ticker, trades: tickerTrades }))
    .sort((a, b) => b.trades.length - a.trades.length)

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/trending">
            <ArrowLeft className="h-4 w-4" />
            Back to Trending
          </Link>
        </Button>
      </div>

      <div className="p-4 space-y-5">
        {/* Committee Header */}
        <div className={cn('rounded-2xl border p-4', colors.border)}>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', colors.bg)}>
              <Shield className={cn('h-5 w-5', colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-foreground">{committee.name}</h1>
                <span className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase',
                  colors.badgeBg, colors.text
                )}>
                  {committee.chamber}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{committee.fullName}</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed mt-3">
            {committee.description}
          </p>

          {/* Focus sectors */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {committee.focusSectors.map((sector) => (
              <span
                key={sector}
                className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Members', value: stats.members.length, color: 'text-foreground' },
            { label: 'Total Trades', value: stats.tradeCount, color: 'text-foreground' },
            { label: 'Buys', value: stats.buyCount, color: 'text-emerald-400' },
            { label: 'Sells', value: stats.sellCount, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className={cn('text-xl font-bold', color)}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Members */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Members ({stats.members.length})
          </h2>
          <div className="space-y-2">
            {stats.members.map((person) => (
              <PersonCard key={person.id} person={person} showLink={true} />
            ))}
          </div>
        </section>

        {/* Top Traded Tickers */}
        {stats.topTickers.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Most Traded Stocks
            </h2>
            <div className="space-y-2">
              {stats.topTickers.map(({ stock, count, buyCount, sellCount }, i) => (
                <Link key={stock.ticker} href={`/stock/${stock.ticker}`}>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
                    <span className="text-base font-black text-muted-foreground w-5 text-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-foreground">
                          {stock.ticker}
                        </span>
                        {stock.priceChangePercent !== undefined && (
                          <span className={cn(
                            'inline-flex items-center gap-0.5 text-[11px] font-semibold',
                            stock.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {stock.priceChangePercent >= 0
                              ? <TrendingUp className="h-3 w-3" />
                              : <TrendingDown className="h-3 w-3" />
                            }
                            {stock.priceChangePercent >= 0 ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{stock.companyName}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-sm font-bold text-foreground">{count} trade{count !== 1 ? 's' : ''}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        {buyCount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-400">{buyCount}B</span>
                        )}
                        {sellCount > 0 && (
                          <span className="text-[10px] font-semibold text-red-400">{sellCount}S</span>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cluster Alerts — multiple members buying same stock */}
        {clusters.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10">
                <span className="text-sm">⚡</span>
              </div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Cluster Activity
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3 -mt-1">
              Multiple members of this committee traded the same stock — a potential coordination signal.
            </p>
            <div className="space-y-3">
              {clusters.map(({ ticker, trades: clusterTrades }) => {
                const uniquePersons = Array.from(new Set(clusterTrades.map((t) => t.personId)))
                const buyCount = clusterTrades.filter((t) => t.tradeType === 'buy' || t.tradeType === 'exercise').length
                const sellCount = clusterTrades.filter((t) => t.tradeType === 'sell').length
                const totalVolume = clusterTrades.reduce((s, t) => s + t.amount, 0)
                return (
                  <Card key={ticker} className={cn('border', colors.border)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link href={`/stock/${ticker}`}>
                            <span className={cn('font-mono text-lg font-black hover:underline', colors.text)}>
                              {ticker}
                            </span>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {uniquePersons.length} members · {clusterTrades.length} trades
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {formatCurrency(totalVolume)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {buyCount > 0 && (
                          <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                            {buyCount} buy{buyCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {sellCount > 0 && (
                          <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                            {sellCount} sell{sellCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {clusterTrades.slice(0, 4).map((trade) => (
                          <Link key={trade.id} href={`/trade/${trade.id}`}>
                            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 hover:bg-muted/80 transition-colors">
                              <span className="text-xs text-foreground font-medium">
                                {trade.person.name.split(' ').slice(-1)[0]}
                              </span>
                              <span className={cn(
                                'text-[10px] font-semibold',
                                trade.tradeType === 'sell' ? 'text-red-400' : 'text-emerald-400'
                              )}>
                                {trade.tradeType === 'sell' ? 'S' : 'B'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* All Trades */}
        {trades.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              All Trades ({trades.length})
            </h2>
            <TradeFeed trades={trades} />
          </section>
        )}

        {trades.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No trades recorded for this committee yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
