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
      const buf = new Uint8Array(await fetchRes.arrayBuffer())
      const { extractText } = await import('unpdf')
      const { text } = await extractText(buf, { mergePages: true })
      const full = Array.isArray(text) ? text.join(' ') : text
      parseResult = full.substring(0, 400)
    } catch(e) {
      parseError = e instanceof Error ? e.message : String(e)
    }
  }
  return NextResponse.json({ fetchStatus, parseResult, parseError })
}
