/**
 * SEC EDGAR Form 4 scraper
 *
 * Fetches recent corporate insider trade disclosures directly from the SEC.
 * No API key required — uses two public SEC endpoints:
 *   1. EFTS full-text search  → list of recent Form 4 filings (adsh + CIKs)
 *   2. SEC Archives           → raw XML for each filing (ticker, shares, price)
 *
 * SEC fair-use policy: identify yourself in User-Agent, ≤10 req/s.
 */

import type { Trade, Person, Stock, TradeType, SignalType } from '@/types'

const EFTS_URL = 'https://efts.sec.gov/LATEST/search-index'
const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data'
const UA = 'InsiderEdge/1.0 (github.com/insideredge; contact: admin@insideredge.app)'

// ─── EFTS types ───────────────────────────────────────────

interface EftsHit {
  _id: string                 // "{adsh}:{filename}"
  _source: {
    ciks: string[]
    file_date: string
    display_names?: string[]
  }
}

// ─── XML helpers ──────────────────────────────────────────

/** Extract first <value> inside a tag, e.g. <transactionDate><value>…</value> */
function xmlVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>[\\s\\S]*?<value>([^<]+)<\\/value>`, 'i'))
  return m ? m[1].trim() : ''
}

/** Extract a simple scalar tag, e.g. <issuerTradingSymbol>AAPL</issuerTradingSymbol> */
function xmlScalar(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]+)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function xmlBool(xml: string, tag: string): boolean {
  return new RegExp(`<${tag}>\\s*true\\s*<\\/${tag}>`, 'i').test(xml)
}

// ─── Form 4 XML parser ────────────────────────────────────

interface Form4Trade {
  ticker: string
  insiderName: string
  insiderTitle: string
  tradeDate: string
  code: string     // P = purchase, S = sale
  shares: number
  price: number
}

function parseForm4Xml(xml: string, fileDate: string): Form4Trade[] {
  const ticker = xmlScalar(xml, 'issuerTradingSymbol')
  const insiderName = xmlScalar(xml, 'rptOwnerName')

  // Skip filings without a US exchange ticker
  if (!ticker || ticker.includes(' ') || ticker.length > 5) return []
  if (!insiderName) return []

  // Best-effort title
  let title = xmlScalar(xml, 'officerTitle')
  if (!title) {
    if (xmlBool(xml, 'isDirector')) title = 'Director'
    else if (xmlBool(xml, 'isOfficer')) title = 'Officer'
    else if (xmlBool(xml, 'isTenPercentOwner')) title = '10% Owner'
    else title = 'Insider'
  }

  // Each nonDerivativeTransaction block
  const blocks = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/g) ?? []

  return blocks.flatMap((block): Form4Trade[] => {
    const date = xmlVal(block, 'transactionDate') || fileDate
    // transactionCode is a plain scalar (no <value> wrapper) — use xmlScalar
    const code = xmlScalar(block, 'transactionCode')
    const sharesStr = xmlVal(block, 'transactionShares')
    const priceStr = xmlVal(block, 'transactionPricePerShare')

    // Only open-market purchases (P) and sales (S) with a real price
    if (code !== 'P' && code !== 'S') return []

    const shares = parseFloat(sharesStr)
    const price = parseFloat(priceStr)

    if (!shares || shares <= 0 || !price || price <= 0) return []

    return [{ ticker: ticker.toUpperCase(), insiderName, insiderTitle: title, tradeDate: date, code, shares, price }]
  })
}

// ─── Fetch single filing XML ──────────────────────────────

async function fetchFilingXml(hit: EftsHit): Promise<string | null> {
  try {
    const [adsh, filename] = hit._id.split(':')
    if (!adsh || !filename) return null

    const adshNoDash = adsh.replace(/-/g, '')
    const cik = hit._source.ciks[0]?.replace(/^0+/, '') // strip leading zeros
    if (!cik) return null

    const url = `${ARCHIVES}/${cik}/${adshNoDash}/${filename}`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 24 * 60 * 60 }, // filing XMLs never change
    })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

// ─── EFTS query ───────────────────────────────────────────

async function fetchRecentFilings(lookbackDays: number, limit: number): Promise<EftsHit[]> {
  try {
    const from = new Date()
    from.setDate(from.getDate() - lookbackDays)
    const startdt = from.toISOString().split('T')[0]

    // EFTS caps at 100 results per page; sort by file_date desc for freshest first
    const url = `${EFTS_URL}?forms=4&dateRange=custom&startdt=${startdt}&hits.hits._source.ciks=true&hits.hits._source.file_date=true&_source=ciks,file_date`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 4 * 60 * 60 }, // 4h — refresh quarterly
    })
    if (!res.ok) return []
    const data = await res.json()
    const hits: EftsHit[] = data?.hits?.hits ?? []
    return hits.slice(0, limit)
  } catch {
    return []
  }
}

// ─── Main export ──────────────────────────────────────────

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Returns recent corporate insider trades (Form 4 purchases + sales)
 * sourced directly from SEC EDGAR. Always fresh — no API key required.
 *
 * @param lookbackDays  How many calendar days back to search (default 14)
 * @param maxFilings    Max Form 4 filings to process (default 100)
 */
export async function fetchSecForm4Trades(
  lookbackDays = 14,
  maxFilings = 100
): Promise<Trade[]> {
  try {
    const hits = await fetchRecentFilings(lookbackDays, maxFilings)
    if (hits.length === 0) return []

    // Fetch XMLs in batches of 10 to stay within SEC rate limits
    const BATCH = 10
    const allForm4Trades: Form4Trade[] = []

    for (let i = 0; i < hits.length; i += BATCH) {
      const batch = hits.slice(i, i + BATCH)
      const xmlResults = await Promise.allSettled(batch.map(fetchFilingXml))

      for (let j = 0; j < batch.length; j++) {
        const result = xmlResults[j]
        if (result.status !== 'fulfilled' || !result.value) continue
        const parsed = parseForm4Xml(result.value, batch[j]._source.file_date)
        allForm4Trades.push(...parsed)
      }
    }

    // Convert to Trade objects
    const trades: Trade[] = allForm4Trades.map((f, i): Trade => {
      const tradeType: TradeType = f.code === 'P' ? 'buy' : 'sell'
      const amount = f.shares * f.price
      const personId = `sec4-${f.ticker}-${f.insiderName.replace(/\s+/g, '-').toLowerCase()}`

      const person: Person = {
        id: personId,
        name: toTitleCase(f.insiderName),
        title: toTitleCase(f.insiderTitle),
        source: 'insider',
        totalTrades: 0,
      }

      const stock: Stock = {
        ticker: f.ticker,
        companyName: f.ticker,
        sector: 'Unknown',
      }

      const signals: SignalType[] = []
      if (amount >= 500_000) signals.push('executive_buy')

      return {
        id: `sec4-${f.ticker}-${i}-${f.tradeDate}`,
        personId,
        person,
        ticker: f.ticker,
        stock,
        tradeType,
        source: 'insider',
        amount,
        shares: f.shares,
        priceAtTrade: f.price,
        tradeDate: f.tradeDate,
        filedDate: f.tradeDate,
        signals,
        transactionId: `${f.ticker}-${f.insiderName}-${f.tradeDate}`.replace(/\s+/g, '-').toLowerCase(),
      }
    })

    return trades.sort(
      (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
    )
  } catch {
    return []
  }
}
