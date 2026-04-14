/**
 * Congressional disclosure scraper
 *
 * House source: disclosures-clerk.house.gov (POST search → HTML, then PDF download)
 * Senate source: efds.senate.gov (frequently unreachable; retried on each run)
 *
 * Both are official government portals — same sources used by Capitol Trades.
 */

import type { Trade, Person, Stock, TradeType } from '@/types'

const HOUSE_SEARCH_URL =
  'https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearchResult'
const HOUSE_PDF_BASE =
  'https://disclosures-clerk.house.gov/public_disc/ptr-pdfs'

// ─── Types ────────────────────────────────────────────────

export interface DisclosureFiling {
  docId: string
  memberName: string
  office: string          // e.g. "IL01"
  chamber: 'House' | 'Senate'
  filingYear: string
  pdfUrl: string
}

export interface ParsedDisclosureTrade {
  ticker: string
  tradeType: TradeType
  tradeDate: string       // ISO YYYY-MM-DD
  filedDate: string
  amount: number
  amountMin: number
  amountMax: number
  memberName: string
  chamber: 'House' | 'Senate'
  office: string
  docId: string
  pdfUrl: string
}

// ─── House HTML parser ────────────────────────────────────

/** POST to the House search portal and parse the returned HTML table */
async function fetchHouseFilings(year: number): Promise<DisclosureFiling[]> {
  const res = await fetch(HOUSE_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
    },
    body: `LastName=&State=&District=&FilingYear=${year}&SearchBtn=Search`,
    next: { revalidate: 6 * 60 * 60 }, // 6h cache
  })

  if (!res.ok) throw new Error(`House search returned ${res.status}`)

  const html = await res.text()

  // Extract rows from the table
  const rowRegex =
    /<a href="(public_disc\/ptr-pdfs\/\d{4}\/(\d+)\.pdf)"[^>]*>([^<]+)<\/a>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*>(\d{4})<\/td>[\s\S]*?<td[^>]*>PTR/g

  const filings: DisclosureFiling[] = []
  let match: RegExpExecArray | null

  while ((match = rowRegex.exec(html)) !== null) {
    const [, path, docId, rawName, office, filingYear] = match
    filings.push({
      docId,
      memberName: rawName.trim().replace(/Hon\.\s*/i, ''),
      office: office.trim(),
      chamber: 'House',
      filingYear,
      pdfUrl: `https://disclosures-clerk.house.gov/${path}`,
    })
  }

  return filings
}

/**
 * Get PTRs sorted by DocId descending (highest = most recent).
 * Pass count=Infinity or a large number to get all filings.
 */
export async function getRecentHouseFilings(
  count = 30,
  year = new Date().getFullYear()
): Promise<DisclosureFiling[]> {
  const filings = await fetchHouseFilings(year)
  const sorted = filings.sort((a, b) => parseInt(b.docId) - parseInt(a.docId))
  return count >= sorted.length ? sorted : sorted.slice(0, count)
}

// ─── PDF parser ───────────────────────────────────────────

function parseAmountRange(raw: string): { min: number; max: number; mid: number } {
  // "$1,001 - $15,000" or "$1,001 -\n$15,000" or "$1,000,001 +"
  const clean = raw.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  const parts = clean
    .replace(/\+/g, '')
    .split('-')
    .map((p) => parseFloat(p.replace(/[$,\s]/g, '')))
    .filter((n) => !isNaN(n))

  if (parts.length >= 2) {
    return { min: parts[0], max: parts[1], mid: (parts[0] + parts[1]) / 2 }
  }
  if (parts.length === 1) {
    return { min: parts[0], max: parts[0], mid: parts[0] }
  }
  return { min: 0, max: 0, mid: 0 }
}

function mmddyyyyToIso(date: string): string {
  // "03/09/2026" → "2026-03-09"
  const [m, d, y] = date.split('/')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function parsePtrText(
  text: string,
  filing: DisclosureFiling
): ParsedDisclosureTrade[] {
  const trades: ParsedDisclosureTrade[] = []

  // unpdf merges pages into one string with spaces.
  // Pattern: (TICKER) [ST] {S|P} MM/DD/YYYY MM/DD/YYYY $X - $Y
  const tradeRegex =
    /\(([A-Z]{1,5})\)\s*\[(?:ST|OP|OT)\]\s+([PSE])\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\$[\d,]+(?:\s*[-–]\s*\$?[\d,]+|\s*\+)?)/g

  let match: RegExpExecArray | null
  while ((match = tradeRegex.exec(text)) !== null) {
    const [, ticker, txType, tradeDate, notifDate, amountRaw] = match
    const amount = parseAmountRange(amountRaw)
    if (amount.mid === 0) continue

    trades.push({
      ticker,
      tradeType: txType === 'P' ? 'buy' : 'sell',
      tradeDate: mmddyyyyToIso(tradeDate),
      filedDate: mmddyyyyToIso(notifDate),
      amount: amount.mid,
      amountMin: amount.min,
      amountMax: amount.max,
      memberName: filing.memberName,
      chamber: filing.chamber,
      office: filing.office,
      docId: filing.docId,
      pdfUrl: filing.pdfUrl,
    })
  }

  return trades
}

/** Download and parse a single PTR PDF → array of trades */
export async function parsePtrPdf(
  filing: DisclosureFiling
): Promise<ParsedDisclosureTrade[]> {
  try {
    const res = await fetch(filing.pdfUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return []
    const arrayBuffer = await res.arrayBuffer()
    const { extractText } = await import('unpdf')
    const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })
    const fullText = Array.isArray(text) ? text.join(' ') : text
    return parsePtrText(fullText, filing)
  } catch {
    return []
  }
}

// ─── Normalise to app Trade type ─────────────────────────

function disclosureToTrade(d: ParsedDisclosureTrade, index: number): Trade {
  const personId = `house-${d.office}-${d.memberName.replace(/\s+/g, '-').toLowerCase()}`

  const [lastName, firstName] = d.memberName.includes(',')
    ? d.memberName.split(',').map((s) => s.trim())
    : [d.memberName, '']

  const person: Person = {
    id: personId,
    name: firstName ? `${firstName} ${lastName}` : lastName,
    title: 'U.S. Representative',
    chamber: 'House',
    source: 'congressional',
    totalTrades: 0,
  }

  const stock: Stock = {
    ticker: d.ticker,
    companyName: d.ticker,
    sector: 'Unknown',
  }

  return {
    id: `house-ptr-${d.docId}-${d.ticker}-${index}`,
    personId,
    person,
    ticker: d.ticker,
    stock,
    tradeType: d.tradeType,
    source: 'congressional',
    amount: d.amount,
    amountMin: d.amountMin,
    amountMax: d.amountMax,
    tradeDate: d.tradeDate,
    filedDate: d.filedDate,
    signals: [],
    transactionId: d.docId,
    metadata: { pdfUrl: d.pdfUrl, office: d.office },
  }
}

// ─── Main export ──────────────────────────────────────────

export interface DisclosureResult {
  trades: Trade[]
  filings: DisclosureFiling[]
  parsedCount: number
  fetchedAt: string
  source: 'live' | 'partial' | 'unavailable'
}

/**
 * Fetches the most recent House PTR filings, parses each PDF,
 * and returns trades ready for the app feed.
 *
 * Limit pdfLimit to avoid timeouts on serverless (default: 10).
 */
export async function fetchRecentDisclosures(
  pdfLimit = 10
): Promise<DisclosureResult> {
  const fetchedAt = new Date().toISOString()

  try {
    const filings = await getRecentHouseFilings(pdfLimit)

    if (filings.length === 0) {
      return { trades: [], filings: [], parsedCount: 0, fetchedAt, source: 'unavailable' }
    }

    // Parse PDFs in parallel (bounded)
    const results = await Promise.allSettled(filings.map((f) => parsePtrPdf(f)))

    const allDisclosureTrades: ParsedDisclosureTrade[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') allDisclosureTrades.push(...r.value)
    }

    const trades = allDisclosureTrades.map((d, i) => disclosureToTrade(d, i))

    return {
      trades,
      filings,
      parsedCount: allDisclosureTrades.length,
      fetchedAt,
      source: trades.length > 0 ? 'live' : 'partial',
    }
  } catch (err) {
    console.error('[disclosures] fetch failed:', err)
    return { trades: [], filings: [], parsedCount: 0, fetchedAt, source: 'unavailable' }
  }
}
