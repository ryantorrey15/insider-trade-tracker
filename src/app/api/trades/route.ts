import { NextResponse } from 'next/server'
import { fetchUnifiedFeed } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  try {
    const result = await fetchUnifiedFeed()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/trades] error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  }
}
