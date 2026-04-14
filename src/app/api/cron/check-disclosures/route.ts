/**
 * Vercel Cron endpoint — runs daily at 8 AM ET.
 * Fetches the latest House PTR filings and warms the cache.
 *
 * Secured with CRON_SECRET env var (set in Vercel dashboard).
 */
import { NextResponse } from 'next/server'
import { fetchRecentDisclosures } from '@/lib/api/disclosures'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds — requires Vercel Pro for >10s; free tier will use 10s

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/check-disclosures] starting daily check...')

  const result = await fetchRecentDisclosures(15)

  console.log(
    `[cron/check-disclosures] done — ${result.parsedCount} trades from ${result.filings.length} filings (${result.source})`
  )

  return NextResponse.json({
    ok: true,
    parsedCount: result.parsedCount,
    filingCount: result.filings.length,
    source: result.source,
    fetchedAt: result.fetchedAt,
  })
}
