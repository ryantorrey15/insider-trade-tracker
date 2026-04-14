// ─────────────────────────────────────────────────────
// Raw API response shapes — do not use in UI directly,
// normalize to app types via the fetcher functions.
// ─────────────────────────────────────────────────────

// Quiver Quant — congressional trading
// GET https://api.quiverquant.com/beta/live/congresstrading
export interface QuiverCongressTrade {
  Representative: string
  BioGuideID: string
  ReportDate: string         // "2026-04-08"
  TransactionDate: string    // "2026-03-30"
  Ticker: string
  Transaction: string        // "Purchase" | "Sale (Full)" | "Sale (Partial)" | "Exchange"
  Range: string              // "$1,001 - $15,000"
  House: string              // "Senate" | "Representatives"
  Amount: string             // "1001.0"
  Party: string              // "D" | "R" | "I"
  last_modified: string
  TickerType: string         // "ST" = stock, "OP" = options
  Description: string | null
  ExcessReturn: number | null
  PriceChange: number | null
  SPYChange: number | null
}

// Finnhub — insider transactions
// GET https://finnhub.io/api/v1/stock/insider-transactions?symbol={ticker}
export interface FinnhubInsiderTransaction {
  change: number             // negative = sell, positive = buy (shares)
  currency: string
  filingDate: string         // "2026-03-24"
  id: string                 // accession number
  isDerivative: boolean
  name: string               // "STEVENS MARK A"
  share: number              // shares owned after transaction
  source: string             // "sec"
  symbol: string
  transactionCode: string    // "S" | "P" | "M" | "A" | "D" | "F" | "G"
  transactionDate: string    // "2026-03-20"
  transactionPrice: number
}

export interface FinnhubInsiderTransactionsResponse {
  data: FinnhubInsiderTransaction[]
  symbol: string
}

// Finnhub — stock quote
// GET https://finnhub.io/api/v1/quote?symbol={ticker}
export interface FinnhubQuote {
  c: number    // current price
  d: number    // change
  dp: number   // change percent
  h: number    // high
  l: number    // low
  o: number    // open
  pc: number   // previous close
  t: number    // timestamp (unix)
}

// Finnhub — company profile
// GET https://finnhub.io/api/v1/stock/profile2?symbol={ticker}
export interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  finnhubIndustry: string    // "Semiconductors"
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
}

// Finnhub — company news
// GET https://finnhub.io/api/v1/company-news?symbol={ticker}&from={date}&to={date}
export interface FinnhubNewsArticle {
  category: string
  datetime: number           // unix timestamp
  headline: string
  id: number
  image: string
  related: string            // ticker
  source: string
  summary: string
  url: string
}

// Finnhub — insider sentiment (monthly MSPR)
// GET https://finnhub.io/api/v1/stock/insider-sentiment?symbol={ticker}&from={date}&to={date}
export interface FinnhubInsiderSentimentMonth {
  symbol: string
  year: number
  month: number
  change: number             // net share change
  mspr: number               // monthly share purchase ratio (-100 to 100)
}

export interface FinnhubInsiderSentimentResponse {
  data: FinnhubInsiderSentimentMonth[]
  symbol: string
}
