export type TradeType = 'buy' | 'sell' | 'exercise' | 'gift' | 'exchange'
export type TradeSource = 'insider' | 'congressional'
export type SignalType =
  | 'pre_earnings_sale'
  | 'pre_earnings_buy'
  | 'committee_relevance'
  | 'cluster_buying'
  | 'cluster_selling'
  | 'unusual_volume'
  | 'executive_buy'
  | 'near_contract_award'
  | 'near_regulation'

export interface Stock {
  ticker: string
  companyName: string
  sector: string
  logoUrl?: string
  currentPrice?: number
  priceChange?: number
  priceChangePercent?: number
  nextEarningsDate?: string
}

export interface Person {
  id: string
  name: string
  title: string
  party?: 'D' | 'R' | 'I'
  state?: string
  chamber?: 'Senate' | 'House'
  source: TradeSource
  committeeAssignments?: string[]
  avatarUrl?: string
  totalTrades: number
  avgReturn?: number
  mostTradedTickers?: string[]
  bio?: string
  performanceStats?: PersonPerformanceStats
}

export interface Trade {
  id: string
  personId: string
  person: Person
  ticker: string
  stock: Stock
  tradeType: TradeType
  source: TradeSource
  amount: number
  amountMin?: number
  amountMax?: number
  shares?: number
  priceAtTrade?: number
  tradeDate: string
  filedDate: string
  signals: SignalType[]
  signalStrength?: 'strong' | 'moderate' | 'weak'
  isPlannedTrade?: boolean
  daysToEarnings?: number
  isUnusualSize?: boolean
  sizeMultiple?: number
  isFirstPurchase?: boolean
  description?: string
  transactionId?: string
  metadata?: Record<string, unknown>
  performance?: TradePerformance
}

export interface ClusterAlert {
  id: string
  ticker: string
  stock: Stock
  trades: Trade[]
  windowDays: number
  totalVolume: number
  detectedAt: string
  isBuyCluster: boolean
}

export interface TradeInvestigation {
  id: string
  tradeId: string
  summary: string
  signals: SignalType[]
  relevanceScore: number
  aiBlurb: string
  relatedNewsIds?: string[]
  generatedAt: string
}

export interface PriceSnapshot {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsArticle {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
  relatedTickers: string[]
  relatedPersonIds: string[]
}

export interface Alert {
  id: string
  userId: string
  type: 'ticker' | 'person' | 'signal'
  targetId: string
  targetLabel: string
  enabled: boolean
  createdAt: string
}

export interface TradePerformance {
  /** Return % at each lookback interval (positive = gain, negative = loss for buys; inverted for sells) */
  return1w?: number
  return1m?: number
  return3m?: number
  return6m?: number
  return1y?: number
  /** Days since the trade was made (for "X% in N days" display on card) */
  daysSinceTrade: number
  /** Best available return across measured intervals */
  currentReturn?: number
  /** Price of the stock today (or at last available snapshot) */
  currentPrice?: number
  /** S&P 500 return over the same period for benchmark comparison */
  sp500Return1m?: number
  sp500Return3m?: number
  sp500Return6m?: number
  sp500Return1y?: number
  /** Whether this trade was profitable (for win/loss calculation) */
  isWin?: boolean
}

export interface PersonPerformanceStats {
  winRate: number          // 0-100 %
  avgReturn: number        // mean return across all trades
  medianReturn: number     // median return
  bestTrade: { ticker: string; return: number; tradeId: string }
  worstTrade: { ticker: string; return: number; tradeId: string }
  totalPnlEstimate: number // rough dollar estimate
  tradesWithData: number   // how many trades have performance data
}

export interface Committee {
  id: string
  name: string        // short name e.g. "Armed Services"
  fullName: string    // e.g. "Senate Armed Services Committee"
  chamber: 'Senate' | 'House' | 'Joint' | 'Both'
  description: string
  focusSectors: string[]
  memberIds: string[]
  color: string       // tailwind color prefix e.g. 'purple', 'blue'
}

export interface FilterState {
  source: 'all' | TradeSource
  tradeType: 'all' | TradeType
  ticker?: string
  personId?: string
  committeeId?: string
  dateRange?: { start: string; end: string }
  signals?: SignalType[]
  minAmount?: number
  hidePlannedTrades?: boolean
}

export interface TrendingData {
  topTickers: Array<{ stock: Stock; tradeCount: number; netSentiment: 'bullish' | 'bearish' }>
  mostActivePersons: Array<{ person: Person; tradeCount: number }>
  biggestTrades: Trade[]
  signalHighlights: Array<{ signal: SignalType; count: number; trades: Trade[] }>
  bestTraders: Array<{
    person: Person
    winRate: number
    avgReturn: number
    tradeCount: number
    totalPnlEstimate: number
  }>
}
