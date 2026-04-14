import { NextResponse } from 'next/server'
import { fetchRecentDisclosures } from '@/lib/api/disclosures'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 20)

  try {
    const result = await fetchRecentDisclosures(limit)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/disclosures]', err)
    return NextResponse.json({ error: 'Failed to fetch disclosures' }, { status: 500 })
  }
}
