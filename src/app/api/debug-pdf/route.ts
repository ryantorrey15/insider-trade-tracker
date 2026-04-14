import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const url = 'https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/2026/20034301.pdf'
  const fetchRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const fetchStatus = fetchRes.status
  let parseResult = 'not attempted'
  let parseError = ''
  if (fetchRes.ok) {
    try {
      const buf = Buffer.from(await fetchRes.arrayBuffer())
      const { default: pdfParse } = await import('pdf-parse')
      const parsed = await pdfParse(buf)
      parseResult = parsed.text.substring(0, 300)
    } catch(e: unknown) {
      parseError = e instanceof Error ? e.message : String(e)
    }
  }
  return NextResponse.json({ fetchStatus, parseResult, parseError })
}
