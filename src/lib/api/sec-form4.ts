/**
 * SEC EDGAR Form 4 scraper — company-targeted approach
 *
 * Instead of querying random recent Form 4 filings (which are mostly grants/awards),
 * we query the submissions API for a curated list of major US companies to find
 * actual open-market purchases (P) and sales (S) by corporate insiders.
 *
 * SEC fair-use policy: identify yourself in User-Agent, ≤10 req/s.
 */

import type { Trade, Person, Stock, TradeType, SignalType } from '@/types'

const SUBMISSIONS = 'https://data.sec.gov/submissions'
const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data'
const UA = 'InsiderEdge/1.0 (github.com/insideredge; contact: admin@insideredge.app)'

// ─── Major US companies to monitor (CIK → ticker) ────────
// Covers S&P 500 mega/large caps across all sectors
const COMPANY_CIKS: Record<string, string> = {
  '0000320193': 'AAPL',
  '0000789019': 'MSFT',
  '0001652044': 'GOOGL',
  '0001018724': 'AMZN',
  '0001326801': 'META',
  '0001318605': 'TSLA',
  '0001045810': 'NVDA',
  '0000019617': 'JPM',
  '0001403161': 'V',
  '0000072971': 'UNH',
  '0000200406': 'JNJ',
  '0000104169': 'WMT',
  '0001141391': 'MA',
  '0000080424': 'PG',
  '0000354950': 'HD',
  '0000070858': 'BAC',
  '0000034088': 'XOM',
  '0000093410': 'CVX',
  '0001551152': 'ABBV',
  '0000021344': 'KO',
  '0000077476': 'PEP',
  '0000909832': 'COST',
  '0000310158': 'MRK',
  '0001730168': 'AVGO',
  '0001341439': 'ORCL',
  '0000858877': 'CSCO',
  '0001108524': 'CRM',
  '0000002488': 'AMD',
  '0000050863': 'INTC',
  '0000051143': 'IBM',
  '0000040533': 'GE',
  '0000886982': 'GS',
  '0000895421': 'MS',
  '0001067983': 'BRK-B',
  '0000037996': 'F',
  '0000101829': 'GM',
  '0000012927': 'BA',
  '0000040987': 'CAT',
  '0000101830': 'RTX',
  '0000078814': 'LMT',
  '0000310764': 'NOC',
  '0001011006': 'NFLX',
  '0001090012': 'BKNG',
  '0001090727': 'UBER',
  '0001467858': 'LYFT',
  '0001559720': 'SNAP',
  '0001418819': 'ZM',
  '0001702510': 'COIN',
  '0001792789': 'ABNB',
}

// ─── Types ────────────────────────────────────────────────

interface FilingMeta {
  cik: string
  ticker: string
  companyName: string
  accessionNumber: string
  filingDate: string
  primaryDocument: string  // actual XML filename (may have xslF345X06/ prefix)
}

interface Form4Trade {
  ticker: string
  companyName: string
  insiderName: string
  insiderTitle: string
  tradeDate: string
  code: string
  shares: number
  price: number
}

// ─── XML helpers ──────────────────────────────────────────

function xmlScalar(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function xmlVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>[\\s\\S]*?<value>([^<]+)</value>`, 'i'))
  return m ? m[1].trim() : ''
}

function xmlBool(xml: string, tag: string): boolean {
  return new RegExp(`<${tag}>\\s*true\\s*</${tag}>`, 'i').test(xml)
}

// ─── Submissions API ─────────────────────────────────────

interface Submissions {
  name: string
  filings: {
    recent: {
      form: string[]
      filingDate: string[]
      accessionNumber: string[]
      primaryDocument: string[]
      primaryDocDescription: string[]
    }
  }
}

async function getRecentForm4s(cik: string, ticker: string, lookbackDays: number): Promise<FilingMeta[]> {
  try {
    const res = await fetch(`${SUBMISSIONS}/CIK${cik}.json`, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 4 * 60 * 60 }, // 4h — refresh submissions list
    })
    if (!res.ok) return []

    const data: Submissions = await res.json()
    const { form, filingDate, accessionNumber, primaryDocument } = data.filings.recent
    const companyName = data.name || ticker

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - lookbackDays)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const results: FilingMeta[] = []
    for (let i = 0; i < form.length; i++) {
      if ((form[i] === '4' || form[i] === '4/A') && filingDate[i] >= cutoffStr) {
        // primaryDocument may have an xslF345X06/ viewer prefix — strip it
        const doc = (primaryDocument[i] || '').replace(/^[^/]+\//, '')
        results.push({
          cik: cik.replace(/^0+/, ''),
          ticker,
          companyName,
          accessionNumber: accessionNumber[i],
          filingDate: filingDate[i],
          primaryDocument: doc || 'ownership.xml',
        })
      }
    }
    return results
  } catch {
    return []
  }
}

// ─── Form 4 XML parser ────────────────────────────────────

async function parseForm4(meta: FilingMeta): Promise<Form4Trade[]> {
  try {
    const adshNoDash = meta.accessionNumber.replace(/-/g, '')
    const url = `${ARCHIVES}/${meta.cik}/${adshNoDash}/${meta.primaryDocument}`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      next: { revalidate: 24 * 60 * 60 }, // permanent — filings never change
    })
    if (!res.ok) return []
    const xml = await res.text()

    const insiderName = xmlScalar(xml, 'rptOwnerName')
    if (!insiderName) return []

    let title = xmlScalar(xml, 'officerTitle')
    if (!title) {
      if (xmlBool(xml, 'isDirector')) title = 'Director'
      else if (xmlBool(xml, 'isOfficer')) title = 'Officer'
      else if (xmlBool(xml, 'isTenPercentOwner')) title = '10% Owner'
      else title = 'Insider'
    }

    const blocks = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/g) ?? []

    return blocks.flatMap((block): Form4Trade[] => {
      const date = xmlVal(block, 'transactionDate') || meta.filingDate
      const code = xmlScalar(block, 'transactionCode')
      const shares = parseFloat(xmlVal(block, 'transactionShares') || '0')
      const price = parseFloat(xmlVal(block, 'transactionPricePerShare') || '0')

      if (code !== 'P' && code !== 'S') return []
      if (!price || price <= 0 || !shares || shares <= 0) return []

      return [{
        ticker: meta.ticker,
        companyName: toTitleCase(meta.companyName),
        insiderName,
        insiderTitle: title,
        tradeDate: date,
        code,
        shares,
        price,
      }]
    })
  } catch {
    return []
  }
}

// ─── Main export ──────────────────────────────────────────

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Fetches recent open-market insider purchases (P) and sales (S) from SEC EDGAR
 * for a curated list of major US public companies. Always current, no API key required.
 *
 * @param lookbackDays  Days back to search for Form 4 filings (default 30)
 */
export async function fetchSecForm4Trades(lookbackDays = 30): Promise<Trade[]> {
  try {
    const entries = Object.entries(COMPANY_CIKS)

    // 1. Fetch submissions for all companies in parallel
    const submissionBatches = await Promise.allSettled(
      entries.map(([cik, ticker]) => getRecentForm4s(cik, ticker, lookbackDays))
    )

    const allFilings: FilingMeta[] = []
    for (const result of submissionBatches) {
      if (result.status === 'fulfilled') allFilings.push(...result.value)
    }

    if (allFilings.length === 0) return []

    // 2. Parse Form 4 XMLs — batch of 3 with delay to respect SEC's ≤10 req/s policy
    const BATCH = 3
    const DELAY_MS = 400  // 3 req / 0.4s = 7.5 req/s — safely under the limit
    const allForm4Trades: Form4Trade[] = []

    for (let i = 0; i < allFilings.length; i += BATCH) {
      const batch = allFilings.slice(i, i + BATCH)
      const results = await Promise.allSettled(batch.map(parseForm4))
      for (const r of results) {
        if (r.status === 'fulfilled') allForm4Trades.push(...r.value)
      }
      // Rate-limit delay between batches (skip after last batch)
      if (i + BATCH < allFilings.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
      }
    }

    // 3. Convert to Trade objects, filter trivial trades (<$10K)
    const trades: Trade[] = allForm4Trades
      .filter((f) => f.shares * f.price >= 10_000)
      .map((f, i): Trade => {
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
          companyName: f.companyName,
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
