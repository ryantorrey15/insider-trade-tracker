import Link from 'next/link'
import { Building2, Calendar, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TradeTypeBadge } from './TradeTypeBadge'
import { SignalBadge } from './SignalBadge'
import { SignalStrengthIndicator } from './SignalStrengthIndicator'
import { formatCurrency, formatAmountRange, formatRelativeDate, getPartyBg, cn } from '@/lib/utils'
import type { Trade } from '@/types'

interface TradeCardProps {
  trade: Trade
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500/20 text-blue-300',
    'bg-purple-500/20 text-purple-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-orange-500/20 text-orange-300',
    'bg-red-500/20 text-red-300',
    'bg-yellow-500/20 text-yellow-300',
    'bg-pink-500/20 text-pink-300',
    'bg-cyan-500/20 text-cyan-300',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function TradeCard({ trade, className }: TradeCardProps) {
  const { person, stock } = trade

  return (
    <Link href={`/trade/${trade.id}`}>
      <div
        className={cn(
          'group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-card/80 active:scale-[0.99]',
          className
        )}
      >
        {/* Top row: person + trade type + amount */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className={cn('h-10 w-10 shrink-0', getAvatarColor(person.name))}>
            <AvatarFallback className={cn('text-xs font-bold', getAvatarColor(person.name))}>
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>

          {/* Person info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate">
                {person.name}
              </span>
              {person.party && (
                <span
                  className={cn(
                    'inline-flex items-center rounded border px-1 py-0 text-[10px] font-bold',
                    getPartyBg(person.party)
                  )}
                >
                  {person.party}
                </span>
              )}
              <TradeTypeBadge type={trade.tradeType} />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {person.title}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-foreground">
              {trade.amountMin && trade.amountMax
                ? formatAmountRange(trade.amountMin, trade.amountMax)
                : formatCurrency(trade.amount)}
            </div>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeDate(trade.tradeDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle row: stock info */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-mono text-sm font-bold text-foreground">
                {stock.ticker}
              </span>
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {stock.companyName}
            </span>
          </div>
          {stock.currentPrice && (
            <div className="text-right shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                ${stock.currentPrice.toFixed(2)}
              </span>
              {stock.priceChangePercent !== undefined && (
                <span
                  className={cn(
                    'text-[10px] ml-1',
                    stock.priceChangePercent >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                >
                  {stock.priceChangePercent >= 0 ? '+' : ''}
                  {stock.priceChangePercent.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Return scorecard + signal badges */}
        <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
          {/* Signals */}
          <div className="flex flex-wrap gap-1.5">
            {trade.signals.map((signal) => (
              <SignalBadge key={signal} signal={signal} />
            ))}
          </div>

          {/* Return since trade */}
          {trade.performance?.currentReturn !== undefined && (
            <div
              className={cn(
                'shrink-0 flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold',
                trade.performance.isWin
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              )}
            >
              {trade.performance.isWin ? (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
                </svg>
              ) : (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />
                </svg>
              )}
              {trade.performance.currentReturn >= 0 ? '+' : ''}
              {trade.performance.currentReturn.toFixed(1)}%
              <span className="font-normal opacity-70">
                {trade.performance.daysSinceTrade < 30
                  ? `${trade.performance.daysSinceTrade}d`
                  : trade.performance.daysSinceTrade < 365
                    ? `${Math.round(trade.performance.daysSinceTrade / 30)}mo`
                    : `${(trade.performance.daysSinceTrade / 365).toFixed(1)}yr`}
              </span>
            </div>
          )}
        </div>

        {/* Extra badges row */}
        {(
          (trade.signalStrength && trade.source === 'insider') ||
          trade.isPlannedTrade ||
          (trade.daysToEarnings !== undefined && trade.daysToEarnings <= 30) ||
          trade.isUnusualSize ||
          trade.isFirstPurchase
        ) && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            {trade.signalStrength && trade.source === 'insider' && (
              <SignalStrengthIndicator strength={trade.signalStrength} />
            )}
            {trade.isPlannedTrade && (
              <span className="inline-flex items-center rounded border border-zinc-500/30 bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                Scheduled
              </span>
            )}
            {trade.daysToEarnings !== undefined && trade.daysToEarnings <= 30 && (
              <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                {trade.daysToEarnings}d to earnings
              </span>
            )}
            {trade.isUnusualSize && trade.sizeMultiple !== undefined && (
              <span className="inline-flex items-center rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">
                {trade.sizeMultiple}x size
              </span>
            )}
            {trade.isFirstPurchase && (
              <span className="inline-flex items-center rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">
                First Purchase
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
