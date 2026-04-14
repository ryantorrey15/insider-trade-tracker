/**
 * Vercel Cron endpoint — runs daily at 8 AM ET (13:00 UTC).
 *
 * Fetches both congressional (House PTR) and corporate (SEC Form 4) trades,
 * then stores them in Edge Config so the feed can serve them instantly.
 *
 * maxDuration = 60 gives us enough headroom for:
 *  - 20 House PTR PDFs (~15s)
 *  - 172 Form 4 XMLs at 7.5 req/s rate limit (~35s)
 */

import { NextResponse } from 'next/server'
import { fetchRecentDisclosures } from '@/lib/api/disclosures'
import { fetchSecForm4Trades } from '@/lib/api/sec-form4'
import type { Trade } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EDGE_CONFIG_URL = process.env.EDGE_CONFIG ?? ''
const CRON_SECRET = process.env.CRON_SECRET ?? ''
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID ?? ''
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN ?? ''

/** Write multiple key/value pairs to Edge Config in a single PATCH */
async function writeEdgeConfigItems(items: Array<{ key: string; value: unknown }>): Promise<void> {
  if (!VERCEL_API_TOKEN || !EDGE_CONFIG_URL) return

  const ecId = EDGE_CONFIG_URL.match(/ecfg_[a-z0-9]+/)?.[0]
  if (!ecId) return

  const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  const url = `https://api.vercel.com/v1/edge-config/${ecId}/items${teamParam}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map(({ key, value }) => ({ operation: 'upsert', key, value })),
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[cron] Edge Config write failed ${res.status}: ${text}`)
  }
}

export async function GET(req: Request) {
  // Auth check
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('[cron] starting fetch — congressional + corporate...')
  const startedAt = Date.now()

  // Fetch both sources in parallel (each has its own internal rate limiting)
  const [disclosureResult, corporateTrades] = await Promise.allSettled([
    fetchRecentDisclosures(20),
    fetchSecForm4Trades(30),
  ])

  const congressional: Trade[] =
    disclosureResult.status === 'fulfilled' ? disclosureResult.value.trades : []

  const corporate: Trade[] =
    corporateTrades.status === 'fulfilled' ? corporateTrades.value : []

  console.log(
    `[cron] fetched ${congressional.length} congressional, ${corporate.length} corporate trades in ${Date.now() - startedAt}ms`
  )

  // Store in Edge Config — cap at 50 congressional + 150 corporate to stay under item size limits
  await writeEdgeConfigItems([
    { key: 'congressionalTrades', value: congressional.slice(0, 50) },
    { key: 'corporateTrades', value: corporate.slice(0, 150) },
    { key: 'tradesUpdatedAt', value: new Date().toISOString() },
  ])

  console.log('[cron] Edge Config updated')

  return NextResponse.json({
    ok: true,
    congressional: congressional.length,
    corporate: corporate.length,
    updatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  })
}
