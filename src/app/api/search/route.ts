import { NextResponse } from 'next/server'
import { fetchCongressionalTrades } from '@/lib/api/congressional'
import { enrichStock } from '@/lib/api/stocks'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim().toUpperCase()

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    const { trades } = await fetchCongressionalTrades()

    // Find matching tickers
    const tickerSet = new Set<string>()
    for (const t of trades) {
      if (t.ticker.includes(q) || t.person.name.toUpperCase().includes(q)) {
        tickerSet.add(t.ticker)
      }
    }
    const matchedTickers = Array.from(tickerSet).slice(0, 5)

    const stocks = await Promise.all(matchedTickers.map((ticker) => enrichStock(ticker)))

    // Find matching people
    const seenPersons = new Set<string>()
    const people = trades
      .filter((t) => t.person.name.toUpperCase().includes(q))
      .filter((t) => {
        if (seenPersons.has(t.personId)) return false
        seenPersons.add(t.personId)
        return true
      })
      .map((t) => t.person)
      .slice(0, 5)

    return NextResponse.json({ stocks, people, query: q })
  } catch (err) {
    console.error('[api/search] error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
