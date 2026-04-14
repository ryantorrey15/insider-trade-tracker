import { NextResponse } from 'next/server'
import { fetchTickerDetail } from '@/lib/api'

export const revalidate = 60 * 60 // 1 hour

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  if (!ticker || ticker.length > 10) {
    return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 })
  }

  try {
    const result = await fetchTickerDetail(ticker.toUpperCase())
    return NextResponse.json(result)
  } catch (err) {
    console.error(`[api/stocks/${ticker}] error:`, err)
    return NextResponse.json(
      { error: 'Failed to fetch stock detail' },
      { status: 500 }
    )
  }
}
