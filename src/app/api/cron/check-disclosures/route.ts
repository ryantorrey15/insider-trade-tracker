/**
 * Vercel Cron endpoint — runs daily at 8 AM ET (13:00 UTC).
 *
 * Algorithm:
 * 1. Read lastDocId from Edge Config (persisted across runs)
 * 2. Fetch full House PTR filing list
 * 3. Filter to DocIds strictly greater than lastDocId → genuinely new filings
 * 4. Parse each new PDF for trade data
 * 5. Write new lastDocId back to Edge Config
 *
 * First run (no stored lastDocId): processes the 20 most recent filings
 * to bootstrap the cache, then stores the current max DocId.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@vercel/edge-config'
import { getRecentHouseFilings, parsePtrPdf } from '@/lib/api/disclosures'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EDGE_CONFIG_URL = process.env.EDGE_CONFIG ?? ''
const CRON_SECRET = process.env.CRON_SECRET ?? ''

// Edge Config only supports reads via the SDK; writes go through the Vercel API.
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID ?? ''
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN ?? ''

/** Read lastDocId from Edge Config */
async function readLastDocId(): Promise<number> {
  try {
    if (!EDGE_CONFIG_URL) return 0
    const client = createClient(EDGE_CONFIG_URL)
    const val = await client.get<number>('lastDocId')
    return typeof val === 'number' ? val : 0
  } catch {
    return 0
  }
}

/** Write lastDocId to Edge Config via the Vercel API */
async function writeLastDocId(docId: number): Promise<void> {
  if (!VERCEL_API_TOKEN || !EDGE_CONFIG_URL) return

  // Extract the Edge Config ID from the connection string
  const ecId = EDGE_CONFIG_URL.match(/ecfg_[a-z0-9]+/)?.[0]
  if (!ecId) return

  const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  const url = `https://api.vercel.com/v1/edge-config/${ecId}/items${teamParam}`

  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'lastDocId', value: docId }],
    }),
  })
}

export async function GET(req: Request) {
  // Auth check
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('[cron] starting disclosure check...')

  // 1. Get last known DocId
  const lastDocId = await readLastDocId()
  console.log(`[cron] lastDocId from Edge Config: ${lastDocId}`)

  // 2. Fetch the full filing list for the current year
  const year = new Date().getFullYear()
  const allFilings = await getRecentHouseFilings(200, year)

  // 3. Filter to new filings only
  const newFilings = lastDocId === 0
    ? allFilings.slice(0, 20)  // bootstrap: parse most recent 20
    : allFilings.filter(f => parseInt(f.docId) > lastDocId)

  console.log(`[cron] ${allFilings.length} total filings, ${newFilings.length} new since DocId ${lastDocId}`)

  if (newFilings.length === 0) {
    return NextResponse.json({
      ok: true,
      message: 'No new filings since last run',
      lastDocId,
      checkedAt: new Date().toISOString(),
    })
  }

  // 4. Parse each new PDF
  const results = await Promise.allSettled(newFilings.map(f => parsePtrPdf(f)))
  let totalTrades = 0
  for (const r of results) {
    if (r.status === 'fulfilled') totalTrades += r.value.length
  }

  // 5. Update lastDocId to the highest DocId we just processed
  const maxDocId = Math.max(...newFilings.map(f => parseInt(f.docId)))
  await writeLastDocId(maxDocId)
  console.log(`[cron] done — ${totalTrades} trades from ${newFilings.length} new filings. Updated lastDocId → ${maxDocId}`)

  return NextResponse.json({
    ok: true,
    newFilings: newFilings.length,
    totalTrades,
    previousDocId: lastDocId,
    newLastDocId: maxDocId,
    checkedAt: new Date().toISOString(),
  })
}
