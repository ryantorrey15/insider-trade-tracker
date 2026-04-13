import { subDays, format } from 'date-fns'
import type {
  Person,
  Trade,
  Stock,
  NewsArticle,
  TradeInvestigation,
  PriceSnapshot,
  TrendingData,
  FilterState,
  TradePerformance,
  PersonPerformanceStats,
  Committee,
  ClusterAlert,
} from '@/types'

// ──────────────────────────────────────────
// STOCKS
// ──────────────────────────────────────────

export const STOCKS: Record<string, Stock> = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    sector: 'Technology',
    currentPrice: 875.42,
    priceChange: 18.73,
    priceChangePercent: 2.19,
    nextEarningsDate: '2025-01-29',
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 213.07,
    priceChange: -1.24,
    priceChangePercent: -0.58,
    nextEarningsDate: '2025-01-30',
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Technology',
    currentPrice: 420.88,
    priceChange: 3.11,
    priceChangePercent: 0.74,
    nextEarningsDate: '2025-01-29',
  },
  AMZN: {
    ticker: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    sector: 'Consumer Discretionary',
    currentPrice: 192.33,
    priceChange: -0.87,
    priceChangePercent: -0.45,
  },
  META: {
    ticker: 'META',
    companyName: 'Meta Platforms, Inc.',
    sector: 'Communication Services',
    currentPrice: 527.14,
    priceChange: 9.42,
    priceChangePercent: 1.82,
    nextEarningsDate: '2025-01-29',
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    sector: 'Consumer Discretionary',
    currentPrice: 248.76,
    priceChange: -4.33,
    priceChangePercent: -1.71,
    nextEarningsDate: '2025-01-29',
  },
  GOOGL: {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    sector: 'Communication Services',
    currentPrice: 176.33,
    priceChange: 2.07,
    priceChangePercent: 1.19,
    nextEarningsDate: '2025-02-04',
  },
  PLTR: {
    ticker: 'PLTR',
    companyName: 'Palantir Technologies Inc.',
    sector: 'Technology',
    currentPrice: 28.14,
    priceChange: 0.93,
    priceChangePercent: 3.42,
    nextEarningsDate: '2025-02-10',
  },
  AMD: {
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    sector: 'Technology',
    currentPrice: 162.87,
    priceChange: 4.21,
    priceChangePercent: 2.65,
    nextEarningsDate: '2025-02-04',
  },
  TSM: {
    ticker: 'TSM',
    companyName: 'Taiwan Semiconductor Manufacturing',
    sector: 'Technology',
    currentPrice: 145.22,
    priceChange: -1.88,
    priceChangePercent: -1.28,
    nextEarningsDate: '2025-01-16',
  },
}

// ──────────────────────────────────────────
// PEOPLE
// ──────────────────────────────────────────

export const PEOPLE: Person[] = [
  {
    id: 'person-1',
    name: 'Nancy Pelosi',
    title: 'U.S. Representative (CA-11)',
    party: 'D',
    state: 'CA',
    chamber: 'House',
    source: 'congressional',
    committeeAssignments: ['House Minority Leader', 'Joint Economic Committee'],
    totalTrades: 47,
    avgReturn: 31.4,
    mostTradedTickers: ['NVDA', 'AAPL', 'MSFT', 'GOOGL'],
    bio: 'Nancy Pelosi is the U.S. Representative for California\'s 11th congressional district and former Speaker of the House. Her husband Paul Pelosi is a venture capitalist and investor.',
  },
  {
    id: 'person-2',
    name: 'Tommy Tuberville',
    title: 'U.S. Senator (R-AL)',
    party: 'R',
    state: 'AL',
    chamber: 'Senate',
    source: 'congressional',
    committeeAssignments: ['Senate Armed Services Committee', 'Senate Agriculture Committee', 'Senate HELP Committee'],
    totalTrades: 132,
    avgReturn: 12.7,
    mostTradedTickers: ['NVDA', 'AMD', 'PLTR', 'TSM'],
    bio: 'Tommy Tuberville is the junior U.S. Senator from Alabama. A former college football coach, he serves on the Senate Armed Services Committee, which oversees defense spending and contracts.',
  },
  {
    id: 'person-3',
    name: 'Dan Crenshaw',
    title: 'U.S. Representative (TX-02)',
    party: 'R',
    state: 'TX',
    chamber: 'House',
    source: 'congressional',
    committeeAssignments: ['House Intelligence Committee', 'House Energy & Commerce Committee', 'House Homeland Security Committee'],
    totalTrades: 28,
    avgReturn: 19.2,
    mostTradedTickers: ['PLTR', 'AMZN', 'META'],
    bio: 'Dan Crenshaw is the U.S. Representative for Texas\'s 2nd congressional district. A former Navy SEAL, he serves on the House Intelligence and Homeland Security Committees.',
  },
  {
    id: 'person-4',
    name: 'Mark Warner',
    title: 'U.S. Senator (D-VA)',
    party: 'D',
    state: 'VA',
    chamber: 'Senate',
    source: 'congressional',
    committeeAssignments: ['Senate Intelligence Committee (Chair)', 'Senate Banking Committee', 'Senate Finance Committee'],
    totalTrades: 19,
    avgReturn: 8.3,
    mostTradedTickers: ['MSFT', 'META', 'GOOGL'],
    bio: 'Mark Warner is the senior U.S. Senator from Virginia. A former technology entrepreneur and venture capitalist, he chairs the Senate Intelligence Committee.',
  },
  {
    id: 'person-5',
    name: 'Marjorie Taylor Greene',
    title: 'U.S. Representative (GA-14)',
    party: 'R',
    state: 'GA',
    chamber: 'House',
    source: 'congressional',
    committeeAssignments: ['House Oversight Committee', 'House Homeland Security Committee'],
    totalTrades: 22,
    avgReturn: 14.1,
    mostTradedTickers: ['TSLA', 'AMZN', 'AAPL'],
    bio: 'Marjorie Taylor Greene is the U.S. Representative for Georgia\'s 14th congressional district, known for her outspoken political positions.',
  },
  {
    id: 'person-6',
    name: 'Jensen Huang',
    title: 'CEO & President, NVIDIA',
    source: 'insider',
    totalTrades: 64,
    avgReturn: 287.3,
    mostTradedTickers: ['NVDA'],
    bio: 'Jensen Huang is the co-founder, president, and CEO of NVIDIA Corporation. He co-founded NVIDIA in 1993 and has led the company through its transformation into an AI computing powerhouse.',
  },
  {
    id: 'person-7',
    name: 'Tim Cook',
    title: 'CEO, Apple Inc.',
    source: 'insider',
    totalTrades: 18,
    avgReturn: 42.1,
    mostTradedTickers: ['AAPL'],
    bio: 'Tim Cook is the CEO of Apple Inc., having taken over from Steve Jobs in 2011. He has overseen Apple\'s growth into one of the most valuable companies in history.',
  },
  {
    id: 'person-8',
    name: 'Satya Nadella',
    title: 'CEO, Microsoft Corporation',
    source: 'insider',
    totalTrades: 23,
    avgReturn: 38.7,
    mostTradedTickers: ['MSFT'],
    bio: 'Satya Nadella is the CEO of Microsoft Corporation. Under his leadership, Microsoft has become a cloud computing and AI leader, with major investments in OpenAI.',
  },
  {
    id: 'person-9',
    name: 'Mark Zuckerberg',
    title: 'CEO & Founder, Meta Platforms',
    source: 'insider',
    totalTrades: 89,
    avgReturn: 156.8,
    mostTradedTickers: ['META'],
    bio: 'Mark Zuckerberg is the co-founder and CEO of Meta Platforms, Inc., the parent company of Facebook, Instagram, and WhatsApp.',
  },
  {
    id: 'person-10',
    name: 'Colette Kress',
    title: 'EVP & CFO, NVIDIA',
    source: 'insider',
    totalTrades: 41,
    avgReturn: 198.4,
    mostTradedTickers: ['NVDA'],
    bio: 'Colette Kress is Executive Vice President and Chief Financial Officer of NVIDIA Corporation, responsible for the company\'s global financial operations.',
  },
  {
    id: 'person-11',
    name: 'Michael Kaplowitz',
    title: 'Independent Director, NVIDIA',
    source: 'insider',
    totalTrades: 4,
    avgReturn: 18.2,
  },
  {
    id: 'person-12',
    name: 'Ajay Puri',
    title: 'EVP Worldwide Field Operations, NVIDIA',
    source: 'insider',
    totalTrades: 6,
    avgReturn: 22.1,
  },
]

// ──────────────────────────────────────────
// TRADES
// ──────────────────────────────────────────

export const TRADES: Trade[] = [
  {
    id: 'trade-1',
    personId: 'person-6',
    person: PEOPLE[5],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'sell',
    source: 'insider',
    amount: 4200000,
    amountMin: 4200000,
    amountMax: 4200000,
    shares: 4800,
    priceAtTrade: 875.0,
    tradeDate: '2025-01-15',
    filedDate: '2025-01-17',
    signals: ['pre_earnings_sale', 'unusual_volume'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    daysToEarnings: 14,
    description: 'Automatic 10b5-1 plan sale. CEO Jensen Huang divests shares pursuant to pre-established trading plan.',
    transactionId: 'NVDA-CEO-2025-0115',
  },
  {
    id: 'trade-2',
    personId: 'person-1',
    person: PEOPLE[0],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'buy',
    source: 'congressional',
    amount: 1250000,
    amountMin: 1000001,
    amountMax: 5000000,
    tradeDate: '2025-01-08',
    filedDate: '2025-01-25',
    signals: ['cluster_buying', 'committee_relevance', 'unusual_volume'],
    daysToEarnings: 21,
    isUnusualSize: true,
    sizeMultiple: 2.8,
    description: 'Call options purchase. Paul Pelosi purchased NVDA call options expiring March 2025.',
    transactionId: 'PELOSI-2025-0108',
  },
  {
    id: 'trade-3',
    personId: 'person-2',
    person: PEOPLE[1],
    ticker: 'PLTR',
    stock: STOCKS.PLTR,
    tradeType: 'buy',
    source: 'congressional',
    amount: 87500,
    amountMin: 50001,
    amountMax: 100000,
    shares: 3108,
    priceAtTrade: 28.16,
    tradeDate: '2025-01-22',
    filedDate: '2025-02-05',
    signals: ['committee_relevance', 'near_contract_award', 'cluster_buying'],
    daysToEarnings: 19,
    description: 'Purchase of common stock. Senator Tuberville bought shares of Palantir while serving on Armed Services Committee.',
    transactionId: 'TUBERVILLE-2025-0122',
  },
  {
    id: 'trade-4',
    personId: 'person-7',
    person: PEOPLE[6],
    ticker: 'AAPL',
    stock: STOCKS.AAPL,
    tradeType: 'sell',
    source: 'insider',
    amount: 560000,
    amountMin: 560000,
    amountMax: 560000,
    shares: 2630,
    priceAtTrade: 213.0,
    tradeDate: '2025-01-10',
    filedDate: '2025-01-13',
    signals: ['pre_earnings_sale'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    daysToEarnings: 20,
    description: 'Sale pursuant to Rule 10b5-1 trading plan adopted November 2024.',
    transactionId: 'AAPL-CEO-2025-0110',
  },
  {
    id: 'trade-5',
    personId: 'person-9',
    person: PEOPLE[8],
    ticker: 'META',
    stock: STOCKS.META,
    tradeType: 'sell',
    source: 'insider',
    amount: 12500000,
    amountMin: 12500000,
    amountMax: 12500000,
    shares: 23720,
    priceAtTrade: 527.0,
    tradeDate: '2025-01-20',
    filedDate: '2025-01-22',
    signals: ['unusual_volume', 'pre_earnings_sale'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    daysToEarnings: 9,
    isUnusualSize: true,
    sizeMultiple: 2.1,
    description: 'Planned divestiture per 10b5-1 plan. Zuckerberg continues regular selling program.',
    transactionId: 'META-CEO-2025-0120',
  },
  {
    id: 'trade-6',
    personId: 'person-3',
    person: PEOPLE[2],
    ticker: 'PLTR',
    stock: STOCKS.PLTR,
    tradeType: 'buy',
    source: 'congressional',
    amount: 42000,
    amountMin: 15001,
    amountMax: 50000,
    shares: 1492,
    priceAtTrade: 28.15,
    tradeDate: '2025-01-23',
    filedDate: '2025-02-06',
    signals: ['committee_relevance', 'near_contract_award', 'cluster_buying'],
    daysToEarnings: 18,
    description: 'Purchase of common stock by Representative Crenshaw while serving on House Intelligence Committee.',
    transactionId: 'CRENSHAW-2025-0123',
  },
  {
    id: 'trade-7',
    personId: 'person-8',
    person: PEOPLE[7],
    ticker: 'MSFT',
    stock: STOCKS.MSFT,
    tradeType: 'sell',
    source: 'insider',
    amount: 3100000,
    amountMin: 3100000,
    amountMax: 3100000,
    shares: 7364,
    priceAtTrade: 421.0,
    tradeDate: '2024-12-18',
    filedDate: '2024-12-20',
    signals: ['unusual_volume'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    description: 'Automatic 10b5-1 plan sale. Satya Nadella reduces position through pre-planned divestiture.',
    transactionId: 'MSFT-CEO-2024-1218',
  },
  {
    id: 'trade-8',
    personId: 'person-4',
    person: PEOPLE[3],
    ticker: 'META',
    stock: STOCKS.META,
    tradeType: 'buy',
    source: 'congressional',
    amount: 165000,
    amountMin: 100001,
    amountMax: 250000,
    tradeDate: '2024-12-10',
    filedDate: '2024-12-27',
    signals: ['committee_relevance', 'near_regulation'],
    description: 'Purchase of common stock. Senator Warner bought META shares while chairing the Intelligence Committee reviewing social media regulation.',
    transactionId: 'WARNER-2024-1210',
  },
  {
    id: 'trade-9',
    personId: 'person-10',
    person: PEOPLE[9],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'sell',
    source: 'insider',
    amount: 2800000,
    amountMin: 2800000,
    amountMax: 2800000,
    shares: 3200,
    priceAtTrade: 875.0,
    tradeDate: '2025-01-16',
    filedDate: '2025-01-18',
    signals: ['pre_earnings_sale', 'cluster_selling'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    daysToEarnings: 13,
    description: 'Automatic 10b5-1 plan sale. CFO Colette Kress divests shares simultaneously with CEO.',
    transactionId: 'NVDA-CFO-2025-0116',
  },
  {
    id: 'trade-10',
    personId: 'person-5',
    person: PEOPLE[4],
    ticker: 'TSLA',
    stock: STOCKS.TSLA,
    tradeType: 'buy',
    source: 'congressional',
    amount: 55000,
    amountMin: 15001,
    amountMax: 50000,
    shares: 221,
    priceAtTrade: 248.87,
    tradeDate: '2025-01-28',
    filedDate: '2025-02-10',
    signals: ['cluster_buying'],
    daysToEarnings: 1,
    description: 'Purchase of Tesla common stock by Representative Greene.',
    transactionId: 'MTG-2025-0128',
  },
  {
    id: 'trade-11',
    personId: 'person-1',
    person: PEOPLE[0],
    ticker: 'AAPL',
    stock: STOCKS.AAPL,
    tradeType: 'buy',
    source: 'congressional',
    amount: 820000,
    amountMin: 500001,
    amountMax: 1000000,
    tradeDate: '2024-12-02',
    filedDate: '2024-12-18',
    signals: ['cluster_buying', 'pre_earnings_buy'],
    description: 'Call options purchase on AAPL. Paul Pelosi acquired call options expiring January 2025.',
    transactionId: 'PELOSI-2024-1202',
  },
  {
    id: 'trade-12',
    personId: 'person-2',
    person: PEOPLE[1],
    ticker: 'AMD',
    stock: STOCKS.AMD,
    tradeType: 'buy',
    source: 'congressional',
    amount: 72000,
    amountMin: 50001,
    amountMax: 100000,
    shares: 442,
    priceAtTrade: 162.9,
    tradeDate: '2025-01-30',
    filedDate: '2025-02-14',
    signals: ['committee_relevance', 'cluster_buying'],
    daysToEarnings: 5,
    isFirstPurchase: true,
    description: 'Purchase of AMD common stock. Senator Tuberville continues semiconductor purchases.',
    transactionId: 'TUBERVILLE-2025-0130',
  },
  {
    id: 'trade-13',
    personId: 'person-6',
    person: PEOPLE[5],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'exercise',
    source: 'insider',
    amount: 980000,
    amountMin: 980000,
    amountMax: 980000,
    shares: 1121,
    priceAtTrade: 874.22,
    tradeDate: '2024-11-20',
    filedDate: '2024-11-22',
    signals: ['executive_buy'],
    signalStrength: 'strong',
    description: 'Exercise of stock options by CEO Jensen Huang with same-day sale of underlying shares.',
    transactionId: 'NVDA-CEO-2024-1120',
  },
  {
    id: 'trade-14',
    personId: 'person-4',
    person: PEOPLE[3],
    ticker: 'MSFT',
    stock: STOCKS.MSFT,
    tradeType: 'buy',
    source: 'congressional',
    amount: 215000,
    amountMin: 100001,
    amountMax: 250000,
    tradeDate: '2024-11-15',
    filedDate: '2024-11-29',
    signals: ['committee_relevance'],
    description: 'Purchase of Microsoft common stock. Senator Warner invested in cloud/AI leader while chairing Intelligence Committee.',
    transactionId: 'WARNER-2024-1115',
  },
  {
    id: 'trade-15',
    personId: 'person-3',
    person: PEOPLE[2],
    ticker: 'AMZN',
    stock: STOCKS.AMZN,
    tradeType: 'sell',
    source: 'congressional',
    amount: 38000,
    amountMin: 15001,
    amountMax: 50000,
    shares: 197,
    priceAtTrade: 192.89,
    tradeDate: '2024-12-20',
    filedDate: '2025-01-07',
    signals: ['pre_earnings_sale'],
    description: 'Sale of Amazon common stock by Representative Crenshaw prior to Q4 2024 earnings.',
    transactionId: 'CRENSHAW-2024-1220',
  },
  {
    id: 'trade-16',
    personId: 'person-9',
    person: PEOPLE[8],
    ticker: 'META',
    stock: STOCKS.META,
    tradeType: 'sell',
    source: 'insider',
    amount: 9800000,
    amountMin: 9800000,
    amountMax: 9800000,
    shares: 18595,
    priceAtTrade: 527.0,
    tradeDate: '2024-12-16',
    filedDate: '2024-12-18',
    signals: ['unusual_volume', 'cluster_selling'],
    signalStrength: 'strong',
    isPlannedTrade: true,
    description: 'Planned divestiture per 10b5-1. Continuation of regular quarterly selling program.',
    transactionId: 'META-CEO-2024-1216',
  },
  {
    id: 'trade-17',
    personId: 'person-2',
    person: PEOPLE[1],
    ticker: 'TSM',
    stock: STOCKS.TSM,
    tradeType: 'buy',
    source: 'congressional',
    amount: 92000,
    amountMin: 50001,
    amountMax: 100000,
    shares: 633,
    priceAtTrade: 145.34,
    tradeDate: '2025-02-03',
    filedDate: '2025-02-17',
    signals: ['committee_relevance', 'near_contract_award'],
    isFirstPurchase: true,
    description: 'Purchase of TSMC American Depositary Receipts. Senator Tuberville buys semiconductor manufacturer during CHIPS Act implementation.',
    transactionId: 'TUBERVILLE-2025-0203',
  },
  {
    id: 'trade-18',
    personId: 'person-1',
    person: PEOPLE[0],
    ticker: 'GOOGL',
    stock: STOCKS.GOOGL,
    tradeType: 'buy',
    source: 'congressional',
    amount: 540000,
    amountMin: 500001,
    amountMax: 1000000,
    tradeDate: '2024-11-25',
    filedDate: '2024-12-12',
    signals: ['pre_earnings_buy', 'cluster_buying'],
    description: 'Call options purchase on GOOGL. Paul Pelosi acquired call options expiring February 2025.',
    transactionId: 'PELOSI-2024-1125',
  },
  {
    id: 'trade-19',
    personId: 'person-8',
    person: PEOPLE[7],
    ticker: 'MSFT',
    stock: STOCKS.MSFT,
    tradeType: 'exercise',
    source: 'insider',
    amount: 5400000,
    amountMin: 5400000,
    amountMax: 5400000,
    shares: 12825,
    priceAtTrade: 421.0,
    tradeDate: '2025-01-06',
    filedDate: '2025-01-08',
    signals: ['executive_buy', 'unusual_volume'],
    signalStrength: 'strong',
    daysToEarnings: 23,
    isUnusualSize: true,
    sizeMultiple: 2.7,
    description: 'Exercise of performance stock awards by CEO Satya Nadella upon vesting.',
    transactionId: 'MSFT-CEO-2025-0106',
  },
  {
    id: 'trade-20',
    personId: 'person-5',
    person: PEOPLE[4],
    ticker: 'AMZN',
    stock: STOCKS.AMZN,
    tradeType: 'buy',
    source: 'congressional',
    amount: 28000,
    amountMin: 15001,
    amountMax: 50000,
    shares: 145,
    priceAtTrade: 193.1,
    tradeDate: '2025-02-05',
    filedDate: '2025-02-19',
    signals: [],
    daysToEarnings: 1,
    isFirstPurchase: true,
    description: 'Purchase of Amazon common stock by Representative Greene.',
    transactionId: 'MTG-2025-0205',
  },
  {
    id: 'trade-21',
    personId: 'person-11',
    person: PEOPLE[10],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'buy',
    source: 'insider',
    amount: 450000,
    amountMin: 450000,
    amountMax: 450000,
    shares: 514,
    priceAtTrade: 875.50,
    tradeDate: '2024-11-21',
    filedDate: '2024-11-25',
    signals: ['cluster_buying', 'executive_buy'],
    signalStrength: 'moderate',
    isPlannedTrade: false,
    isFirstPurchase: true,
    isUnusualSize: true,
    sizeMultiple: 3.0,
    description: 'Open market purchase by Independent Director Michael Kaplowitz. First purchase of NVDA shares on open market.',
    transactionId: 'NVDA-DIR-2024-1121',
  },
  {
    id: 'trade-22',
    personId: 'person-12',
    person: PEOPLE[11],
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    tradeType: 'buy',
    source: 'insider',
    amount: 320000,
    amountMin: 320000,
    amountMax: 320000,
    shares: 365,
    priceAtTrade: 876.20,
    tradeDate: '2024-11-24',
    filedDate: '2024-11-26',
    signals: ['cluster_buying'],
    signalStrength: 'moderate',
    isPlannedTrade: false,
    isFirstPurchase: true,
    isUnusualSize: false,
    description: 'Open market purchase by EVP Ajay Puri. Director-level cluster buy aligns with CEO exercise the same week.',
    transactionId: 'NVDA-EVP-2024-1124',
  },
]

// ──────────────────────────────────────────
// NEWS ARTICLES
// ──────────────────────────────────────────

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'NVIDIA Reports Record Q4 Revenue; Blackwell Demand Exceeds Supply',
    source: 'Reuters',
    url: 'https://reuters.com/technology/nvidia-q4-2025',
    publishedAt: '2025-01-29T21:00:00Z',
    summary: 'NVIDIA reported record quarterly revenue of $39.3 billion, up 78% year-over-year, driven by insatiable demand for its Blackwell AI chips. CEO Jensen Huang said supply constraints are easing heading into fiscal 2026.',
    relatedTickers: ['NVDA', 'AMD', 'TSM'],
    relatedPersonIds: ['person-6', 'person-10'],
  },
  {
    id: 'news-2',
    title: 'Pelosi\'s NVIDIA Options Trade Scrutinized After Explosive Earnings',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/news/pelosi-nvda-2025',
    publishedAt: '2025-01-30T14:30:00Z',
    summary: 'Nancy Pelosi\'s husband Paul Pelosi purchased NVIDIA call options just weeks before the company announced blowout earnings, renewing calls for stricter congressional trading restrictions.',
    relatedTickers: ['NVDA'],
    relatedPersonIds: ['person-1'],
  },
  {
    id: 'news-3',
    title: 'Pentagon Awards $685M AI Contract to Palantir Technologies',
    source: 'Defense News',
    url: 'https://defensenews.com/palantir-pentagon-2025',
    publishedAt: '2025-02-01T10:00:00Z',
    summary: 'The Department of Defense awarded Palantir Technologies a $685 million contract to expand its AI-driven battlefield intelligence platform across all branches of the military.',
    relatedTickers: ['PLTR'],
    relatedPersonIds: ['person-2', 'person-3'],
  },
  {
    id: 'news-4',
    title: 'Tuberville Defends PLTR Purchases: "I Believe in American Defense Tech"',
    source: 'Politico',
    url: 'https://politico.com/tuberville-pltr-2025',
    publishedAt: '2025-02-06T16:00:00Z',
    summary: 'Senator Tommy Tuberville defended his recent Palantir stock purchases, citing belief in American defense technology. Critics note he sits on the Armed Services Committee that oversees Pentagon contracting.',
    relatedTickers: ['PLTR'],
    relatedPersonIds: ['person-2'],
  },
  {
    id: 'news-5',
    title: 'Apple Preps Spring Lineup: iPhone 17 AI Features Detailed in Leak',
    source: 'The Verge',
    url: 'https://theverge.com/apple-iphone-17-ai-2025',
    publishedAt: '2025-01-14T12:00:00Z',
    summary: 'Leaked specifications reveal the iPhone 17 series will feature an on-device AI chip capable of running large language models locally, a first for the industry.',
    relatedTickers: ['AAPL', 'NVDA'],
    relatedPersonIds: ['person-7'],
  },
  {
    id: 'news-6',
    title: 'Microsoft Azure AI Revenue Surpasses $20B Annualized Run Rate',
    source: 'Wall Street Journal',
    url: 'https://wsj.com/microsoft-azure-ai-2025',
    publishedAt: '2025-01-29T22:00:00Z',
    summary: 'Microsoft\'s Azure cloud platform hit a major milestone with AI services now generating over $20 billion in annualized revenue, beating analyst estimates by 23%.',
    relatedTickers: ['MSFT', 'NVDA'],
    relatedPersonIds: ['person-8', 'person-4'],
  },
  {
    id: 'news-7',
    title: 'Meta\'s Llama 4 Stuns Benchmarks, Threatening OpenAI\'s Lead',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/meta-llama4-2025',
    publishedAt: '2025-01-24T18:00:00Z',
    summary: 'Meta released Llama 4, its latest open-source large language model, which scores higher than GPT-4o on multiple industry benchmarks. Shares rose 8% on the news.',
    relatedTickers: ['META', 'MSFT', 'GOOGL'],
    relatedPersonIds: ['person-9', 'person-4'],
  },
  {
    id: 'news-8',
    title: 'CHIPS Act Funds Flowing: TSM Arizona Fab Begins Mass Production',
    source: 'Financial Times',
    url: 'https://ft.com/tsm-arizona-chips-act-2025',
    publishedAt: '2025-01-31T09:00:00Z',
    summary: 'Taiwan Semiconductor\'s Arizona fabrication plant began mass production of 3nm chips, marking a milestone for U.S. semiconductor independence under the CHIPS and Science Act.',
    relatedTickers: ['TSM', 'NVDA', 'AMD'],
    relatedPersonIds: ['person-2'],
  },
  {
    id: 'news-9',
    title: 'Congress Inches Toward STOCK Act Reform as Trading Scandals Mount',
    source: 'NPR',
    url: 'https://npr.org/stock-act-reform-2025',
    publishedAt: '2025-02-10T14:00:00Z',
    summary: 'A bipartisan coalition introduced legislation to ban individual stock trading by members of Congress, as recent disclosures showed dozens of lawmakers holding positions in companies their committees regulate.',
    relatedTickers: ['NVDA', 'PLTR', 'META', 'MSFT'],
    relatedPersonIds: ['person-1', 'person-2', 'person-3', 'person-4'],
  },
  {
    id: 'news-10',
    title: 'Tesla FSD 13.0 Achieves Level 4 Autonomy in Limited Geofenced Zones',
    source: 'Electrek',
    url: 'https://electrek.co/tesla-fsd-level4-2025',
    publishedAt: '2025-02-04T11:00:00Z',
    summary: 'Tesla announced Full Self-Driving version 13.0 has achieved Level 4 autonomous capability in geofenced urban areas across 12 U.S. cities, a breakthrough that sent shares up 14%.',
    relatedTickers: ['TSLA'],
    relatedPersonIds: ['person-5'],
  },
]

// ──────────────────────────────────────────
// TRADE INVESTIGATIONS
// ──────────────────────────────────────────

export const TRADE_INVESTIGATIONS: TradeInvestigation[] = [
  {
    id: 'inv-1',
    tradeId: 'trade-2',
    summary: 'Nancy Pelosi\'s husband purchased NVIDIA call options 21 days before Q4 earnings beat. NVDA surged 24% in the week following the earnings announcement.',
    signals: ['cluster_buying', 'committee_relevance', 'unusual_volume'],
    relevanceScore: 94,
    aiBlurb: 'This trade raises significant questions about information asymmetry. Paul Pelosi purchased NVDA call options on January 8th, just 21 days before NVIDIA reported Q4 earnings that crushed expectations by 18%. The options expired in March 2025, giving maximum leverage to a near-term catalyst. Nancy Pelosi sits on no committee with direct NVIDIA oversight, but her access to classified briefings on AI policy and export controls could be material. Three other Democratic representatives made similar NVDA purchases in the same 30-day window — a cluster signal that historical data shows correlates with outperformance 71% of the time.',
    relatedNewsIds: ['news-1', 'news-2', 'news-9'],
    generatedAt: '2025-01-25T12:00:00Z',
  },
  {
    id: 'inv-2',
    tradeId: 'trade-3',
    summary: 'Senator Tuberville purchased Palantir shares 10 days before the DoD awarded Palantir a $685M AI contract. Tuberville sits on the Armed Services Committee that reviews such contracts.',
    signals: ['committee_relevance', 'near_contract_award', 'cluster_buying'],
    relevanceScore: 97,
    aiBlurb: 'The timing of this trade is exceptionally suspicious. Senator Tuberville bought 3,108 shares of Palantir on January 22nd, and just 10 days later, the Pentagon announced a $685 million contract award to Palantir — the largest defense AI contract in the company\'s history. Tuberville serves on the Senate Armed Services Committee, which has jurisdiction over exactly this type of defense contract. Palantir\'s stock jumped 19% on the contract announcement. Representative Dan Crenshaw made an identical Palantir purchase the very next day, a pattern that falls squarely into the "cluster buying" signal that has historically preceded significant positive catalysts in 68% of identified cases.',
    relatedNewsIds: ['news-3', 'news-4', 'news-9'],
    generatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'inv-3',
    tradeId: 'trade-5',
    summary: 'Mark Zuckerberg sold $12.5M of META shares 9 days before Q4 2024 earnings. While on a 10b5-1 plan, the sale occurred unusually close to the earnings window.',
    signals: ['unusual_volume', 'pre_earnings_sale'],
    relevanceScore: 62,
    aiBlurb: 'Mark Zuckerberg\'s January 20th sale of 23,720 META shares for approximately $12.5 million is consistent with his ongoing 10b5-1 trading plan. However, the proximity to Q4 2024 earnings (reported January 29th) is notable — this sale fell within the typical "quiet period" that most executives observe. META reported earnings that missed advertising revenue estimates, with the stock declining 4.2% after hours. While 10b5-1 plans are designed to establish intent ahead of material information, the timing warrants attention. CFO Susan Li also sold shares in the same window, adding to the cluster selling signal.',
    relatedNewsIds: ['news-7'],
    generatedAt: '2025-01-22T12:00:00Z',
  },
  {
    id: 'inv-4',
    tradeId: 'trade-1',
    summary: 'NVIDIA CEO Jensen Huang sold $4.2M in shares two weeks before Q4 earnings. While via a 10b5-1 plan, this is the largest single sale under his current plan.',
    signals: ['pre_earnings_sale', 'unusual_volume'],
    relevanceScore: 71,
    aiBlurb: 'Jensen Huang\'s January 15th sale of 4,800 NVDA shares for $4.2 million represents his largest single transaction under the current 10b5-1 trading plan, adopted in August 2024. The sale occurred 14 days before NVIDIA\'s fiscal Q4 earnings, which ultimately surprised to the upside. CFO Colette Kress executed an identical plan sale the following day for $2.8M. Insider selling by executives on 10b5-1 plans is common and generally not considered suspicious, but the magnitude of this transaction — 340% larger than his average quarterly plan sale — and the concurrent CFO sale merit monitoring. NVDA was up 24% in the two weeks following earnings.',
    relatedNewsIds: ['news-1', 'news-2'],
    generatedAt: '2025-01-17T12:00:00Z',
  },
  {
    id: 'inv-5',
    tradeId: 'trade-8',
    summary: 'Senator Warner purchased META shares while chairing the Intelligence Committee actively reviewing social media platform regulations that could materially impact Meta.',
    signals: ['committee_relevance', 'near_regulation'],
    relevanceScore: 88,
    aiBlurb: 'Senator Mark Warner purchased META shares on December 10, 2024, while actively chairing the Senate Intelligence Committee\'s review of social media platforms\' handling of foreign influence operations — a probe that directly targets Meta\'s platforms. The committee was considering recommendations that could include mandatory algorithmic audits and content moderation requirements. Warner, a former tech entrepreneur and VC, filed the trade 17 days late, missing the 30-day STOCK Act disclosure window. Meta\'s stock rose 31% in the 60 days following this purchase as the regulatory overhang eased.',
    relatedNewsIds: ['news-7', 'news-9'],
    generatedAt: '2024-12-27T12:00:00Z',
  },
]

// ──────────────────────────────────────────
// PRICE HISTORY GENERATOR
// ──────────────────────────────────────────

function generatePriceHistory(
  ticker: string,
  basePrice: number,
  volatility: number,
  trend: number,
  days: number
): PriceSnapshot[] {
  const snapshots: PriceSnapshot[] = []
  let price = basePrice * (1 - (trend * days) / 365)

  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const dailyReturn = trend / 365 + (Math.random() - 0.48) * volatility
    const open = price
    const closeChange = price * dailyReturn
    const close = Math.max(price + closeChange, 0.01)
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)
    const volume = Math.floor(
      (50_000_000 + Math.random() * 200_000_000) * (1 + Math.abs(dailyReturn) * 10)
    )

    snapshots.push({
      date: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    })

    price = close
  }

  return snapshots
}

export const PRICE_HISTORIES: Record<string, PriceSnapshot[]> = {
  NVDA: generatePriceHistory('NVDA', 875.42, 0.032, 0.42, 365),
  AAPL: generatePriceHistory('AAPL', 213.07, 0.018, 0.08, 365),
  MSFT: generatePriceHistory('MSFT', 420.88, 0.02, 0.14, 365),
  META: generatePriceHistory('META', 527.14, 0.028, 0.38, 365),
  PLTR: generatePriceHistory('PLTR', 28.14, 0.045, 0.52, 365),
  AMZN: generatePriceHistory('AMZN', 192.33, 0.022, 0.18, 365),
  TSLA: generatePriceHistory('TSLA', 248.76, 0.048, 0.24, 365),
  GOOGL: generatePriceHistory('GOOGL', 176.33, 0.021, 0.16, 365),
  AMD: generatePriceHistory('AMD', 162.87, 0.033, 0.28, 365),
  TSM: generatePriceHistory('TSM', 145.22, 0.024, 0.19, 365),
}

// S&P 500 benchmark (simulated, ~12% annual return, low volatility)
export const SP500_HISTORY: PriceSnapshot[] = generatePriceHistory('SPY', 478.5, 0.012, 0.12, 365)

// ──────────────────────────────────────────
// TRADE PERFORMANCE DATA
// ──────────────────────────────────────────

export const TRADE_PERFORMANCE_DATA: Record<string, TradePerformance> = {
  // trade-1: NVDA SELL by Jensen Huang 2025-01-15 — stock went up = bad sell
  'trade-1': { daysSinceTrade: 452, return1w: 4.2, return1m: 24.1, return3m: 18.4, return6m: 35.2, return1y: 51.8, currentReturn: 51.8, currentPrice: 1328.64, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: false },
  // trade-2: NVDA BUY by Pelosi 2025-01-08 — great timing
  'trade-2': { daysSinceTrade: 459, return1w: 3.8, return1m: 26.3, return3m: 21.7, return6m: 38.4, return1y: 57.6, currentReturn: 57.6, currentPrice: 1378.44, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-3: PLTR BUY by Tuberville 2025-01-22 — PLTR went on a massive run
  'trade-3': { daysSinceTrade: 445, return1w: 8.4, return1m: 19.2, return3m: 31.4, return6m: 67.3, return1y: 124.8, currentReturn: 124.8, currentPrice: 63.27, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-4: AAPL SELL by Tim Cook 2025-01-10 — AAPL went up slightly = slight miss
  'trade-4': { daysSinceTrade: 457, return1w: -0.8, return1m: 2.4, return3m: 4.1, return6m: 8.7, return1y: 14.3, currentReturn: 14.3, currentPrice: 243.55, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: false },
  // trade-5: META SELL by Zuckerberg 2025-01-20 — META had a dip then rocketed
  'trade-5': { daysSinceTrade: 447, return1w: -2.1, return1m: -4.2, return3m: 11.8, return6m: 28.4, return1y: 61.2, currentReturn: 61.2, currentPrice: 849.82, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: false },
  // trade-6: PLTR BUY by Crenshaw 2025-01-23
  'trade-6': { daysSinceTrade: 444, return1w: 8.1, return1m: 18.7, return3m: 30.9, return6m: 66.1, return1y: 123.2, currentReturn: 123.2, currentPrice: 63.27, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-7: MSFT SELL by Nadella 2024-12-18
  'trade-7': { daysSinceTrade: 480, return1w: 0.4, return1m: 1.8, return3m: 5.2, return6m: 13.7, return1y: 22.1, currentReturn: 22.1, currentPrice: 513.24, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: false },
  // trade-8: META BUY by Warner 2024-12-10 — excellent timing
  'trade-8': { daysSinceTrade: 488, return1w: 3.2, return1m: 11.4, return3m: 31.2, return6m: 42.8, return1y: 68.4, currentReturn: 68.4, currentPrice: 888.44, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-9: NVDA SELL by Kress 2025-01-16
  'trade-9': { daysSinceTrade: 451, return1w: 4.1, return1m: 22.4, return3m: 17.8, return6m: 34.1, return1y: 50.3, currentReturn: 50.3, currentPrice: 1315.44, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: false },
  // trade-10: TSLA BUY by MTG 2025-01-28 — TSLA volatile but up
  'trade-10': { daysSinceTrade: 439, return1w: 6.2, return1m: 14.3, return3m: 22.8, return6m: -8.4, return1y: 31.7, currentReturn: 31.7, currentPrice: 327.64, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-11: AAPL BUY by Pelosi 2024-12-02
  'trade-11': { daysSinceTrade: 496, return1w: 1.2, return1m: 3.8, return3m: 7.9, return6m: 12.4, return1y: 18.6, currentReturn: 18.6, currentPrice: 252.74, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-12: AMD BUY by Tuberville 2025-01-30
  'trade-12': { daysSinceTrade: 437, return1w: 2.8, return1m: 7.4, return3m: 16.2, return6m: 24.1, return1y: 41.3, currentReturn: 41.3, currentPrice: 230.23, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-13: NVDA EXERCISE by Huang 2024-11-20
  'trade-13': { daysSinceTrade: 508, return1w: 4.8, return1m: 11.2, return3m: 28.4, return6m: 44.1, return1y: 86.7, currentReturn: 86.7, currentPrice: 1634.84, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-14: MSFT BUY by Warner 2024-11-15
  'trade-14': { daysSinceTrade: 513, return1w: 0.9, return1m: 2.3, return3m: 6.4, return6m: 14.2, return1y: 24.1, currentReturn: 24.1, currentPrice: 522.44, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-15: AMZN SELL by Crenshaw 2024-12-20
  'trade-15': { daysSinceTrade: 478, return1w: 1.1, return1m: 3.3, return3m: 11.4, return6m: 22.1, return1y: 38.4, currentReturn: 38.4, currentPrice: 265.74, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: false },
  // trade-16: META SELL by Zuckerberg 2024-12-16
  'trade-16': { daysSinceTrade: 482, return1w: 2.4, return1m: 7.9, return3m: 34.2, return6m: 52.4, return1y: 74.1, currentReturn: 74.1, currentPrice: 917.94, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: false },
  // trade-17: TSM BUY by Tuberville 2025-02-03
  'trade-17': { daysSinceTrade: 433, return1w: 3.4, return1m: 9.2, return3m: 18.4, return6m: 28.1, return1y: 43.7, currentReturn: 43.7, currentPrice: 208.66, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-18: GOOGL BUY by Pelosi 2024-11-25
  'trade-18': { daysSinceTrade: 503, return1w: 2.1, return1m: 6.4, return3m: 13.8, return6m: 22.4, return1y: 33.2, currentReturn: 33.2, currentPrice: 235.06, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-19: MSFT EXERCISE by Nadella 2025-01-06
  'trade-19': { daysSinceTrade: 461, return1w: 0.7, return1m: 2.8, return3m: 6.9, return6m: 15.8, return1y: 25.4, currentReturn: 25.4, currentPrice: 527.94, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-20: AMZN BUY by MTG 2025-02-05
  'trade-20': { daysSinceTrade: 431, return1w: 2.9, return1m: 8.1, return3m: 17.4, return6m: 27.8, return1y: 43.2, currentReturn: 43.2, currentPrice: 274.54, sp500Return1m: 3.1, sp500Return3m: 6.8, sp500Return6m: 9.4, sp500Return1y: 12.2, isWin: true },
  // trade-21: NVDA BUY by Kaplowitz 2024-11-21
  'trade-21': { daysSinceTrade: 507, return1w: 5.1, return1m: 12.4, return3m: 29.7, return6m: 46.2, return1y: 88.1, currentReturn: 88.1, currentPrice: 1648.84, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
  // trade-22: NVDA BUY by Ajay Puri 2024-11-24
  'trade-22': { daysSinceTrade: 504, return1w: 4.9, return1m: 11.8, return3m: 28.9, return6m: 45.1, return1y: 87.2, currentReturn: 87.2, currentPrice: 1640.55, sp500Return1m: 2.8, sp500Return3m: 6.4, sp500Return6m: 9.1, sp500Return1y: 12.2, isWin: true },
}

// ──────────────────────────────────────────
// PERSON PERFORMANCE STATS
// ──────────────────────────────────────────

export const PERSON_PERFORMANCE_STATS: Record<string, PersonPerformanceStats> = {
  'person-1': { // Nancy Pelosi
    winRate: 78, avgReturn: 36.4, medianReturn: 31.2,
    bestTrade: { ticker: 'NVDA', return: 57.6, tradeId: 'trade-2' },
    worstTrade: { ticker: 'AAPL', return: -3.1, tradeId: 'trade-4' },
    totalPnlEstimate: 3_240_000, tradesWithData: 3,
  },
  'person-2': { // Tommy Tuberville
    winRate: 71, avgReturn: 58.6, medianReturn: 43.7,
    bestTrade: { ticker: 'PLTR', return: 124.8, tradeId: 'trade-3' },
    worstTrade: { ticker: 'TSM', return: 9.2, tradeId: 'trade-17' },
    totalPnlEstimate: 486_000, tradesWithData: 4,
  },
  'person-3': { // Dan Crenshaw
    winRate: 67, avgReturn: 42.1, medianReturn: 34.8,
    bestTrade: { ticker: 'PLTR', return: 123.2, tradeId: 'trade-6' },
    worstTrade: { ticker: 'AMZN', return: -8.4, tradeId: 'trade-15' },
    totalPnlEstimate: 62_400, tradesWithData: 2,
  },
  'person-4': { // Mark Warner
    winRate: 75, avgReturn: 46.3, medianReturn: 35.3,
    bestTrade: { ticker: 'META', return: 68.4, tradeId: 'trade-8' },
    worstTrade: { ticker: 'MSFT', return: 24.1, tradeId: 'trade-14' },
    totalPnlEstimate: 178_200, tradesWithData: 2,
  },
  'person-5': { // MTG
    winRate: 60, avgReturn: 37.5, medianReturn: 35.8,
    bestTrade: { ticker: 'AMZN', return: 43.2, tradeId: 'trade-20' },
    worstTrade: { ticker: 'TSLA', return: 31.7, tradeId: 'trade-10' },
    totalPnlEstimate: 22_800, tradesWithData: 2,
  },
  'person-6': { // Jensen Huang (sells - low win rate)
    winRate: 34, avgReturn: -51.8, medianReturn: -48.6,
    bestTrade: { ticker: 'NVDA', return: 86.7, tradeId: 'trade-13' },
    worstTrade: { ticker: 'NVDA', return: -51.8, tradeId: 'trade-1' },
    totalPnlEstimate: -2_175_600, tradesWithData: 3,
  },
  'person-7': { // Tim Cook
    winRate: 32, avgReturn: -14.3, medianReturn: -14.3,
    bestTrade: { ticker: 'AAPL', return: 14.3, tradeId: 'trade-4' },
    worstTrade: { ticker: 'AAPL', return: -14.3, tradeId: 'trade-4' },
    totalPnlEstimate: -80_080, tradesWithData: 1,
  },
  'person-8': { // Satya Nadella
    winRate: 67, avgReturn: 9.2, medianReturn: 9.2,
    bestTrade: { ticker: 'MSFT', return: 25.4, tradeId: 'trade-19' },
    worstTrade: { ticker: 'MSFT', return: -22.1, tradeId: 'trade-7' },
    totalPnlEstimate: -614_400, tradesWithData: 2,
  },
  'person-9': { // Zuckerberg (all sells, stock went up = losses)
    winRate: 8, avgReturn: -67.7, medianReturn: -63.2,
    bestTrade: { ticker: 'META', return: 61.2, tradeId: 'trade-5' },
    worstTrade: { ticker: 'META', return: -74.1, tradeId: 'trade-16' },
    totalPnlEstimate: -14_888_000, tradesWithData: 2,
  },
  'person-10': { // Colette Kress (sells)
    winRate: 28, avgReturn: -50.3, medianReturn: -50.3,
    bestTrade: { ticker: 'NVDA', return: 50.3, tradeId: 'trade-9' },
    worstTrade: { ticker: 'NVDA', return: -50.3, tradeId: 'trade-9' },
    totalPnlEstimate: -1_408_400, tradesWithData: 1,
  },
}

// ──────────────────────────────────────────
// TRENDING DATA
// ──────────────────────────────────────────

export const TRENDING: TrendingData = {
  topTickers: [
    { stock: STOCKS.NVDA, tradeCount: 12, netSentiment: 'bearish' },
    { stock: STOCKS.PLTR, tradeCount: 8, netSentiment: 'bullish' },
    { stock: STOCKS.META, tradeCount: 6, netSentiment: 'bearish' },
    { stock: STOCKS.MSFT, tradeCount: 5, netSentiment: 'bullish' },
    { stock: STOCKS.AAPL, tradeCount: 4, netSentiment: 'bullish' },
  ],
  mostActivePersons: [
    { person: PEOPLE[1], tradeCount: 7 },
    { person: PEOPLE[0], tradeCount: 5 },
    { person: PEOPLE[8], tradeCount: 4 },
    { person: PEOPLE[5], tradeCount: 3 },
    { person: PEOPLE[2], tradeCount: 3 },
  ],
  biggestTrades: [
    TRADES[4],
    TRADES[18],
    TRADES[6],
    TRADES[15],
    TRADES[0],
  ],
  signalHighlights: [
    {
      signal: 'committee_relevance',
      count: 6,
      trades: [TRADES[2], TRADES[5], TRADES[7], TRADES[11]],
    },
    {
      signal: 'pre_earnings_sale',
      count: 4,
      trades: [TRADES[0], TRADES[3], TRADES[4], TRADES[8]],
    },
    {
      signal: 'cluster_buying',
      count: 5,
      trades: [TRADES[1], TRADES[2], TRADES[5], TRADES[10], TRADES[11]],
    },
    {
      signal: 'near_contract_award',
      count: 3,
      trades: [TRADES[2], TRADES[5], TRADES[16]],
    },
  ],
  bestTraders: [
    { person: PEOPLE[0], winRate: 78, avgReturn: 36.4, tradeCount: 47, totalPnlEstimate: 3_240_000 },
    { person: PEOPLE[1], winRate: 71, avgReturn: 58.6, tradeCount: 132, totalPnlEstimate: 486_000 },
    { person: PEOPLE[3], winRate: 75, avgReturn: 46.3, tradeCount: 19, totalPnlEstimate: 178_200 },
    { person: PEOPLE[2], winRate: 67, avgReturn: 42.1, tradeCount: 28, totalPnlEstimate: 62_400 },
    { person: PEOPLE[4], winRate: 60, avgReturn: 37.5, tradeCount: 22, totalPnlEstimate: 22_800 },
  ],
}

// ──────────────────────────────────────────
// CLUSTER ALERTS
// ──────────────────────────────────────────

// trade-13 = TRADES[12], trade-21 = TRADES[20], trade-22 = TRADES[21]
export const CLUSTER_ALERTS: ClusterAlert[] = [
  {
    id: 'cluster-1',
    ticker: 'NVDA',
    stock: STOCKS.NVDA,
    trades: [TRADES[12], TRADES[20], TRADES[21]],
    windowDays: 4,
    totalVolume: 980000 + 450000 + 320000,
    detectedAt: '2024-11-25T00:00:00Z',
    isBuyCluster: true,
  },
]

export function getClusterAlerts(): ClusterAlert[] {
  return CLUSTER_ALERTS
}

export function getClusterAlertsForTicker(ticker: string): ClusterAlert[] {
  return CLUSTER_ALERTS.filter((a) => a.ticker === ticker.toUpperCase())
}

// ──────────────────────────────────────────
// PERFORMANCE HELPERS
// ──────────────────────────────────────────

function withPerformance(trade: Trade): Trade {
  const perf = TRADE_PERFORMANCE_DATA[trade.id]
  if (!perf) return trade
  return { ...trade, performance: perf }
}

export interface LookbackDataPoint {
  date: string
  stockReturn: number   // % return vs trade date price
  sp500Return: number   // % return vs S&P price on trade date
  stockPrice: number
  sp500Price: number
}

export function getLookbackData(ticker: string, tradeDate: string, daysForward = 365): LookbackDataPoint[] {
  const history = PRICE_HISTORIES[ticker.toUpperCase()]
  if (!history) return []

  // Find the index of the trade date in the history
  const tradeDateIdx = history.findIndex((s) => s.date >= tradeDate)
  if (tradeDateIdx === -1) return []

  const sp500History = SP500_HISTORY
  const sp500TradeDateIdx = sp500History.findIndex((s) => s.date >= tradeDate)
  if (sp500TradeDateIdx === -1) return []

  const baseStockPrice = history[tradeDateIdx]?.close ?? 1
  const baseSp500Price = sp500History[sp500TradeDateIdx]?.close ?? 1

  const result: LookbackDataPoint[] = []
  for (let i = tradeDateIdx; i < history.length && i - tradeDateIdx <= daysForward; i++) {
    const sp500Idx = sp500TradeDateIdx + (i - tradeDateIdx)
    const sp500Snap = sp500History[sp500Idx]
    if (!history[i] || !sp500Snap) continue

    result.push({
      date: history[i].date,
      stockPrice: history[i].close,
      sp500Price: sp500Snap.close,
      stockReturn: parseFloat((((history[i].close - baseStockPrice) / baseStockPrice) * 100).toFixed(2)),
      sp500Return: parseFloat((((sp500Snap.close - baseSp500Price) / baseSp500Price) * 100).toFixed(2)),
    })
  }
  return result
}

export function getPersonPerformanceStats(personId: string): PersonPerformanceStats | undefined {
  return PERSON_PERFORMANCE_STATS[personId]
}

// ──────────────────────────────────────────
// QUERY FUNCTIONS
// ──────────────────────────────────────────

// ──────────────────────────────────────────
// COMMITTEES
// ──────────────────────────────────────────

export const COMMITTEES: Committee[] = [
  {
    id: 'armed-services',
    name: 'Armed Services',
    fullName: 'Senate Armed Services Committee',
    chamber: 'Senate',
    description: 'Oversees defense policy, military readiness, and the Pentagon budget. Members have advance knowledge of defense contracts, weapons programs, and military technology procurement.',
    focusSectors: ['Defense', 'Aerospace', 'Technology', 'Cybersecurity'],
    memberIds: ['person-2'],
    color: 'red',
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    fullName: 'Intelligence Committee',
    chamber: 'Both',
    description: 'Receives classified briefings on national security threats, foreign adversaries, and intelligence operations. Members are often first to know about geopolitical risks affecting markets.',
    focusSectors: ['Cybersecurity', 'Defense', 'Technology', 'Surveillance'],
    memberIds: ['person-3', 'person-4'],
    color: 'purple',
  },
  {
    id: 'banking',
    name: 'Banking & Finance',
    fullName: 'Senate Banking, Housing & Urban Affairs Committee',
    chamber: 'Senate',
    description: 'Oversees banking regulation, securities markets, housing policy, and financial institutions. Members shape rules directly affecting Wall Street and the financial sector.',
    focusSectors: ['Financials', 'Banking', 'Real Estate', 'Insurance'],
    memberIds: ['person-4'],
    color: 'blue',
  },
  {
    id: 'energy-commerce',
    name: 'Energy & Commerce',
    fullName: 'House Energy & Commerce Committee',
    chamber: 'House',
    description: 'One of the most powerful House committees. Jurisdiction over energy policy, healthcare, telecommunications, and consumer protection. Oversees FTC, FDA, and FCC rulemaking.',
    focusSectors: ['Energy', 'Healthcare', 'Telecom', 'Technology'],
    memberIds: ['person-3'],
    color: 'orange',
  },
  {
    id: 'homeland-security',
    name: 'Homeland Security',
    fullName: 'Homeland Security Committee',
    chamber: 'Both',
    description: 'Oversees DHS, border security, emergency management, and cybersecurity infrastructure. Members receive briefings on threats to critical infrastructure and national preparedness.',
    focusSectors: ['Cybersecurity', 'Defense', 'Technology', 'Government Contracts'],
    memberIds: ['person-3', 'person-5'],
    color: 'yellow',
  },
  {
    id: 'oversight',
    name: 'Oversight',
    fullName: 'House Committee on Oversight & Accountability',
    chamber: 'House',
    description: 'Investigates government waste, fraud, and abuse. Conducts hearings on federal agencies, contractors, and corporate misconduct. Members often learn of investigations before they go public.',
    focusSectors: ['Government Contracts', 'Pharmaceuticals', 'Technology', 'Finance'],
    memberIds: ['person-5'],
    color: 'zinc',
  },
  {
    id: 'finance',
    name: 'Finance',
    fullName: 'Senate Finance Committee',
    chamber: 'Senate',
    description: 'Writes tax legislation, trade policy, and oversees Social Security, Medicare, and Medicaid. Tax changes directly move markets and sectors. Members shape tariff and trade rules.',
    focusSectors: ['Financials', 'Healthcare', 'Retail', 'Consumer Staples'],
    memberIds: ['person-4'],
    color: 'green',
  },
  {
    id: 'joint-economic',
    name: 'Joint Economic',
    fullName: 'Joint Economic Committee',
    chamber: 'Joint',
    description: 'Analyzes economic conditions and evaluates the economic impact of federal policies. Receives economic reports and data before they become public, with implications for interest rates and markets.',
    focusSectors: ['Financials', 'Real Estate', 'Consumer Discretionary', 'Technology'],
    memberIds: ['person-1'],
    color: 'teal',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    fullName: 'Senate Agriculture, Nutrition & Forestry Committee',
    chamber: 'Senate',
    description: 'Oversees farm policy, food safety, and the USDA. Members shape subsidies, commodity rules, and trade agreements that move agricultural and food sector stocks.',
    focusSectors: ['Agriculture', 'Food & Beverage', 'Chemicals', 'Commodities'],
    memberIds: ['person-2'],
    color: 'lime',
  },
]

export function getCommittees(): Committee[] {
  return COMMITTEES
}

export function getCommitteeById(id: string): Committee | undefined {
  return COMMITTEES.find((c) => c.id === id)
}

export function getCommitteesForPerson(personId: string): Committee[] {
  return COMMITTEES.filter((c) => c.memberIds.includes(personId))
}

export function getTradesByCommittee(committeeId: string): Trade[] {
  const committee = COMMITTEES.find((c) => c.id === committeeId)
  if (!committee) return []
  return TRADES.filter((t) => committee.memberIds.includes(t.personId))
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .map(withPerformance)
}

export function getCommitteeTopTickers(
  committeeId: string,
  topN = 5
): Array<{ stock: Stock; count: number; buyCount: number; sellCount: number }> {
  const trades = getTradesByCommittee(committeeId)
  const tickerMap: Record<string, { stock: Stock; count: number; buyCount: number; sellCount: number }> = {}
  for (const t of trades) {
    if (!tickerMap[t.ticker]) {
      tickerMap[t.ticker] = { stock: t.stock, count: 0, buyCount: 0, sellCount: 0 }
    }
    tickerMap[t.ticker].count++
    if (t.tradeType === 'buy' || t.tradeType === 'exercise') {
      tickerMap[t.ticker].buyCount++
    } else if (t.tradeType === 'sell') {
      tickerMap[t.ticker].sellCount++
    }
  }
  return Object.values(tickerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
}

export function getCommitteeStats(committeeId: string): {
  tradeCount: number
  totalVolume: number
  buyCount: number
  sellCount: number
  topTickers: Array<{ stock: Stock; count: number; buyCount: number; sellCount: number }>
  members: Person[]
} {
  const committee = COMMITTEES.find((c) => c.id === committeeId)
  if (!committee) return { tradeCount: 0, totalVolume: 0, buyCount: 0, sellCount: 0, topTickers: [], members: [] }
  const trades = getTradesByCommittee(committeeId)
  const members = PEOPLE.filter((p) => committee.memberIds.includes(p.id))
  return {
    tradeCount: trades.length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    buyCount: trades.filter((t) => t.tradeType === 'buy' || t.tradeType === 'exercise').length,
    sellCount: trades.filter((t) => t.tradeType === 'sell').length,
    topTickers: getCommitteeTopTickers(committeeId),
    members,
  }
}

export function getRecentTrades(limit = 20, filters?: FilterState): Trade[] {
  let trades = [...TRADES]

  if (filters) {
    if (filters.source && filters.source !== 'all') {
      trades = trades.filter((t) => t.source === filters.source)
    }
    if (filters.tradeType && filters.tradeType !== 'all') {
      trades = trades.filter((t) => t.tradeType === filters.tradeType)
    }
    if (filters.ticker) {
      trades = trades.filter((t) =>
        t.ticker.toLowerCase().includes(filters.ticker!.toLowerCase())
      )
    }
    if (filters.personId) {
      trades = trades.filter((t) => t.personId === filters.personId)
    }
    if (filters.committeeId) {
      const committee = COMMITTEES.find((c) => c.id === filters.committeeId)
      if (committee) {
        trades = trades.filter((t) => committee.memberIds.includes(t.personId))
      }
    }
    if (filters.signals && filters.signals.length > 0) {
      trades = trades.filter((t) =>
        filters.signals!.some((s) => t.signals.includes(s))
      )
    }
    if (filters.minAmount) {
      trades = trades.filter((t) => t.amount >= filters.minAmount!)
    }
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start)
      const end = new Date(filters.dateRange.end)
      trades = trades.filter((t) => {
        const d = new Date(t.tradeDate)
        return d >= start && d <= end
      })
    }
    if (filters.hidePlannedTrades) {
      trades = trades.filter((t) => !t.isPlannedTrade)
    }
  }

  // Sort by trade date descending
  trades.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())

  return trades.slice(0, limit).map(withPerformance)
}

export function getTradeById(id: string): Trade | undefined {
  const trade = TRADES.find((t) => t.id === id)
  return trade ? withPerformance(trade) : undefined
}

export function getPersonById(id: string): Person | undefined {
  const person = PEOPLE.find((p) => p.id === id)
  if (!person) return undefined
  const stats = PERSON_PERFORMANCE_STATS[person.id]
  return stats ? { ...person, performanceStats: stats } : person
}

export function getTradesByPerson(personId: string): Trade[] {
  return TRADES.filter((t) => t.personId === personId)
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .map(withPerformance)
}

export function getTradesByTicker(ticker: string): Trade[] {
  return TRADES.filter((t) => t.ticker === ticker.toUpperCase())
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .map(withPerformance)
}

export function searchTrades(query: string): Trade[] {
  const q = query.toLowerCase()
  return TRADES.filter(
    (t) =>
      t.ticker.toLowerCase().includes(q) ||
      t.person.name.toLowerCase().includes(q) ||
      t.stock.companyName.toLowerCase().includes(q) ||
      t.person.title.toLowerCase().includes(q)
  )
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .map(withPerformance)
}

export function getTrendingData(): TrendingData {
  return TRENDING
}

export function getPriceHistory(ticker: string, days = 90): PriceSnapshot[] {
  const history = PRICE_HISTORIES[ticker.toUpperCase()]
  if (!history) return []
  return history.slice(-days)
}

export function getTradeInvestigation(tradeId: string): TradeInvestigation | undefined {
  return TRADE_INVESTIGATIONS.find((i) => i.tradeId === tradeId)
}

export function getRelatedNews(tradeId: string): NewsArticle[] {
  const investigation = TRADE_INVESTIGATIONS.find((i) => i.tradeId === tradeId)
  if (!investigation?.relatedNewsIds) return []
  return NEWS_ARTICLES.filter((n) => investigation.relatedNewsIds!.includes(n.id))
}

export function getSimilarTrades(tradeId: string): Trade[] {
  const trade = TRADES.find((t) => t.id === tradeId)
  if (!trade) return []

  return TRADES.filter(
    (t) =>
      t.id !== tradeId &&
      (t.ticker === trade.ticker ||
        t.personId === trade.personId ||
        t.signals.some((s) => trade.signals.includes(s)))
  )
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .slice(0, 4)
    .map(withPerformance)
}

export function getNewsForTicker(ticker: string): NewsArticle[] {
  return NEWS_ARTICLES.filter((n) => n.relatedTickers.includes(ticker.toUpperCase())).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getInsiderSentiment(
  ticker: string,
  days?: number
): {
  buyCount: number
  sellCount: number
  totalBuys: number
  totalSells: number
  bullishPercent: number
  totalVolume: number
} {
  let trades = TRADES.filter((t) => t.ticker === ticker.toUpperCase())
  if (days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    trades = trades.filter((t) => new Date(t.tradeDate) >= cutoff)
  }
  const buys = trades.filter((t) => t.tradeType === 'buy' || t.tradeType === 'exercise')
  const sells = trades.filter((t) => t.tradeType === 'sell')
  const total = buys.length + sells.length
  return {
    buyCount: buys.length,
    sellCount: sells.length,
    totalBuys: buys.reduce((sum, t) => sum + t.amount, 0),
    totalSells: sells.reduce((sum, t) => sum + t.amount, 0),
    bullishPercent: total > 0 ? Math.round((buys.length / total) * 100) : 0,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
  }
}

export function getFirstTimeBuyers(days = 30): Trade[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return TRADES.filter(
    (t) => t.isFirstPurchase && (t.tradeType === 'buy' || t.tradeType === 'exercise') && new Date(t.tradeDate) >= cutoff
  )
    .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
    .map(withPerformance)
}

export interface SectorDatum {
  name: string
  tradeCount: number
  buyCount: number
  sellCount: number
  totalVolume: number
  fill: string
}

export function getSectorData(): SectorDatum[] {
  const sectorMap: Record<string, { tradeCount: number; buyCount: number; sellCount: number; totalVolume: number }> = {}

  for (const trade of TRADES) {
    const sector = trade.stock.sector
    if (!sectorMap[sector]) {
      sectorMap[sector] = { tradeCount: 0, buyCount: 0, sellCount: 0, totalVolume: 0 }
    }
    sectorMap[sector].tradeCount++
    sectorMap[sector].totalVolume += trade.amount
    if (trade.tradeType === 'buy' || trade.tradeType === 'exercise') {
      sectorMap[sector].buyCount++
    } else if (trade.tradeType === 'sell') {
      sectorMap[sector].sellCount++
    }
  }

  return Object.entries(sectorMap).map(([name, data]) => {
    const netBuying = data.buyCount > data.sellCount
    const fill = netBuying ? '#10b981' : '#ef4444'
    return { name, ...data, fill }
  })
}

export function getAllStocks(): Stock[] {
  return Object.values(STOCKS)
}

export function getAllPeople(): Person[] {
  return PEOPLE
}
