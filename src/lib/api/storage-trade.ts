/**
 * Compact Trade format for Edge Config storage.
 *
 * Full Trade objects are ~600 bytes each. With 200+ congressional trades
 * we'd exceed Edge Config's Hobby limit (512KB total).
 *
 * StoredTrade strips nested objects (person, stock, metadata) down to
 * ~220 bytes — a ~65% reduction — then reconstitutes them on read.
 */

import type { Trade, TradeType, TradeSource, SignalType } from '@/types'

export interface StoredTrade {
  id: string
  ticker: string
  tt: TradeType          // tradeType
  td: string             // tradeDate
  fd: string             // filedDate
  a: number              // amount
  amin?: number          // amountMin
  amax?: number          // amountMax
  sh?: number            // shares
  p?: number             // priceAtTrade
  pn: string             // person name
  pt: string             // person title
  src: TradeSource       // source
  ch?: 'House' | 'Senate' // chamber (congressional only)
  cn: string             // company name
  sg: SignalType[]       // signals
  tid?: string           // transactionId
}

export function toStoredTrade(t: Trade): StoredTrade {
  const s: StoredTrade = {
    id: t.id,
    ticker: t.ticker,
    tt: t.tradeType,
    td: t.tradeDate,
    fd: t.filedDate,
    a: t.amount,
    pn: t.person.name,
    pt: t.person.title,
    src: t.source,
    cn: t.stock.companyName || t.ticker,
    sg: t.signals,
  }
  if (t.amountMin != null) s.amin = t.amountMin
  if (t.amountMax != null) s.amax = t.amountMax
  if (t.shares != null) s.sh = t.shares
  if (t.priceAtTrade != null) s.p = t.priceAtTrade
  if (t.person.chamber) s.ch = t.person.chamber
  if (t.transactionId) s.tid = t.transactionId
  return s
}

export function fromStoredTrade(s: StoredTrade): Trade {
  const personId = `stored-${s.src}-${s.pn.replace(/\s+/g, '-').toLowerCase()}`
  return {
    id: s.id,
    personId,
    person: {
      id: personId,
      name: s.pn,
      title: s.pt,
      source: s.src,
      chamber: s.ch,
      totalTrades: 0,
    },
    ticker: s.ticker,
    stock: {
      ticker: s.ticker,
      companyName: s.cn,
      sector: 'Unknown',
    },
    tradeType: s.tt,
    source: s.src,
    amount: s.a,
    amountMin: s.amin,
    amountMax: s.amax,
    shares: s.sh,
    priceAtTrade: s.p,
    tradeDate: s.td,
    filedDate: s.fd,
    signals: s.sg,
    transactionId: s.tid,
  }
}
