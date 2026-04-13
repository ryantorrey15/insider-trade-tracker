import Link from 'next/link'
import { ArrowUpRight, Award, Shield, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignalBadge } from '@/components/trades/SignalBadge'
import { TradeCard } from '@/components/trades/TradeCard'
import { SectorHeatmap } from '@/components/charts/SectorHeatmap'
import { getTrendingData, getCommittees, getCommitteeStats, getFirstTimeBuyers, getSectorData } from '@/lib/mock-data'
import { formatCurrency, cn, getPartyBg } from '@/lib/utils'

const COMMITTEE_COLOR_MAP: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    icon: 'text-red-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'text-purple-400' },
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   icon: 'text-blue-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: 'text-orange-400' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: 'text-yellow-400' },
  zinc:   { bg: 'bg-zinc-500/10',   text: 'text-zinc-400',   border: 'border-zinc-500/20',   icon: 'text-zinc-400' },
  green:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  icon: 'text-green-400' },
  teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   icon: 'text-teal-400' },
  lime:   { bg: 'bg-lime-500/10',   text: 'text-lime-400',   border: 'border-lime-500/20',   icon: 'text-lime-400' },
}

export default function TrendingPage() {
  const trending = getTrendingData()
  const committees = getCommittees()
  const firstTimeBuyers = getFirstTimeBuyers(30)
  const sectorData = getSectorData()

  return (
    <div className="min-h-screen">
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Trending</h1>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Top Tickers */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Most Traded Tickers
          </h2>
          <div className="space-y-2">
            {trending.topTickers.map(({ stock, tradeCount, netSentiment }, i) => (
              <Link key={stock.ticker} href={`/stock/${stock.ticker}`}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
                  <span className="text-lg font-black text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-foreground">
                        {stock.ticker}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold',
                          netSentiment === 'bullish'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}
                      >
                        {netSentiment === 'bullish' ? (
                          <TrendingUp className="h-2.5 w-2.5" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5" />
                        )}
                        {netSentiment}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {stock.companyName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{tradeCount}</p>
                    <p className="text-[10px] text-muted-foreground">trades</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Most Active Persons */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Most Active Traders
          </h2>
          <div className="space-y-2">
            {trending.mostActivePersons.map(({ person, tradeCount }, i) => (
              <Link key={person.id} href={`/person/${person.id}`}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
                  <span className="text-lg font-black text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {person.name}
                      </span>
                      {person.party && (
                        <span
                          className={cn(
                            'inline-flex items-center rounded border px-1 text-[10px] font-bold',
                            getPartyBg(person.party)
                          )}
                        >
                          {person.party}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {person.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{tradeCount}</p>
                    <p className="text-[10px] text-muted-foreground">trades</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Biggest Trades */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Biggest Trades This Month
          </h2>
          <div className="space-y-3">
            {trending.biggestTrades.slice(0, 4).map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        </section>

        {/* Best Traders Leaderboard */}
        {trending.bestTraders && trending.bestTraders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Best Traders
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3 -mt-1">
              Ranked by win rate on tracked trades
            </p>
            <div className="space-y-2">
              {trending.bestTraders.map(({ person, winRate, avgReturn, tradeCount, totalPnlEstimate }, i) => (
                <Link key={person.id} href={`/person/${person.id}`}>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
                    {/* Rank */}
                    <span
                      className={cn(
                        'text-base font-black w-6 text-center shrink-0',
                        i === 0
                          ? 'text-yellow-400'
                          : i === 1
                            ? 'text-zinc-300'
                            : i === 2
                              ? 'text-amber-600'
                              : 'text-muted-foreground'
                      )}
                    >
                      {i + 1}
                    </span>

                    {/* Person info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {person.name}
                        </span>
                        {person.party && (
                          <span
                            className={cn(
                              'inline-flex items-center rounded border px-1 text-[10px] font-bold shrink-0',
                              getPartyBg(person.party)
                            )}
                          >
                            {person.party}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{person.title}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            'text-sm font-bold',
                            winRate >= 60 ? 'text-emerald-400' : 'text-red-400'
                          )}
                        >
                          {winRate}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">win</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}
                        >
                          {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">avg</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <span
                          className={cn(
                            'text-[10px] font-medium',
                            totalPnlEstimate >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
                          )}
                        >
                          {totalPnlEstimate >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(totalPnlEstimate))}
                        </span>
                      </div>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Committee */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Browse by Committee
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 -mt-1">
            See which committees are most active — and what stocks their members are trading.
          </p>
          <div className="space-y-2">
            {committees.map((committee) => {
              const stats = getCommitteeStats(committee.id)
              const colors = COMMITTEE_COLOR_MAP[committee.color] ?? COMMITTEE_COLOR_MAP.zinc
              const topTicker = stats.topTickers[0]
              return (
                <Link key={committee.id} href={`/committee/${committee.id}`}>
                  <div className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 hover:opacity-90 transition-all',
                    colors.border,
                    'bg-card'
                  )}>
                    {/* Icon */}
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      colors.bg
                    )}>
                      <Shield className={cn('h-4 w-4', colors.icon)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {committee.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {committee.chamber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {stats.members.length} member{stats.members.length !== 1 ? 's' : ''}
                        </span>
                        {stats.tradeCount > 0 && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-xs text-muted-foreground">
                              {stats.tradeCount} trade{stats.tradeCount !== 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                        {topTicker && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className={cn('text-xs font-mono font-bold', colors.text)}>
                              #{topTicker.stock.ticker}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Trade counts */}
                    <div className="text-right shrink-0 space-y-0.5">
                      {stats.buyCount > 0 && (
                        <p className="text-xs font-semibold text-emerald-400">
                          {stats.buyCount} buy{stats.buyCount !== 1 ? 's' : ''}
                        </p>
                      )}
                      {stats.sellCount > 0 && (
                        <p className="text-xs font-semibold text-red-400">
                          {stats.sellCount} sell{stats.sellCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* First-Time Buyers This Week */}
        {firstTimeBuyers.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wide">
              First-Time Buyers This Week
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Insiders making their first open-market purchase in the last 30 days
            </p>
            <div className="space-y-3">
              {firstTimeBuyers.map((trade) => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          </section>
        )}

        {/* Sector Activity Heatmap */}
        {sectorData.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wide">
              Sector Activity
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Sized by trade count. Green = net buying, red = net selling.
            </p>
            <div className="rounded-xl border border-border bg-card p-3">
              <SectorHeatmap data={sectorData} />
            </div>
          </section>
        )}

        {/* Signal Highlights */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Signal Highlights
          </h2>
          <div className="space-y-3">
            {trending.signalHighlights.map(({ signal, count, trades }) => (
              <Card key={signal} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <SignalBadge signal={signal} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {count} trades
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {trades.slice(0, 3).map((trade) => (
                      <Link key={trade.id} href={`/trade/${trade.id}`}>
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 hover:bg-muted/80 transition-colors">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {trade.ticker}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {trade.person.name.split(' ').pop()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
