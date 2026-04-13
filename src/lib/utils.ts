import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { TradeType, SignalType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

export function formatAmountRange(min?: number, max?: number): string {
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`
  if (min) return `~${formatCurrency(min)}`
  return 'Unknown'
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
}

export function getTradeTypeColor(type: TradeType): string {
  switch (type) {
    case 'buy':
    case 'exercise':
      return 'text-emerald-400'
    case 'sell':
      return 'text-red-400'
    default:
      return 'text-zinc-400'
  }
}

export function getTradeTypeBg(type: TradeType): string {
  switch (type) {
    case 'buy':
    case 'exercise':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'sell':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

export function getSignalLabel(signal: SignalType): string {
  const labels: Record<SignalType, string> = {
    pre_earnings_sale: 'Pre-Earnings Sale',
    pre_earnings_buy: 'Pre-Earnings Buy',
    committee_relevance: 'Committee Relevance',
    cluster_buying: 'Cluster Buying',
    cluster_selling: 'Cluster Selling',
    unusual_volume: 'Unusual Volume',
    executive_buy: 'Executive Buy',
    near_contract_award: 'Near Contract Award',
    near_regulation: 'Near Regulation',
  }
  return labels[signal] ?? signal
}

export function getSignalColor(signal: SignalType): string {
  const colors: Record<SignalType, string> = {
    pre_earnings_sale: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    pre_earnings_buy: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    committee_relevance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cluster_buying: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cluster_selling: 'bg-red-500/10 text-red-400 border-red-500/20',
    unusual_volume: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    executive_buy: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    near_contract_award: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    near_regulation: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return colors[signal] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}

export function getPartyColor(party?: 'D' | 'R' | 'I'): string {
  switch (party) {
    case 'D':
      return 'text-blue-400'
    case 'R':
      return 'text-red-400'
    case 'I':
      return 'text-yellow-400'
    default:
      return 'text-zinc-400'
  }
}

export function getPartyBg(party?: 'D' | 'R' | 'I'): string {
  switch (party) {
    case 'D':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'R':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'I':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
