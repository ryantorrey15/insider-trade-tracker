import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'InsiderEdge/1.0 (github.com/insideredge; contact: admin@insideredge.app)'
const SUBMISSIONS = 'https://data.sec.gov/submissions'
const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data'

// Test with just Apple (CIK 0000320193)
export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Test submissions API
  try {
    const res = await fetch(`${SUBMISSIONS}/CIK0000320193.json`, {
      headers: { 'User-Agent': UA },
      cache: 'no-store',
    })
    results.submissions_status = res.status
    results.submissions_ok = res.ok

    if (res.ok) {
      const data = await res.json()
      const { form, filingDate, accessionNumber, primaryDocument } = data.filings.recent

      // Find Form 4s in last 90 days
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      const cutoffStr = cutoff.toISOString().split('T')[0]

      const form4s = []
      for (let i = 0; i < form.length; i++) {
        if ((form[i] === '4' || form[i] === '4/A') && filingDate[i] >= cutoffStr) {
          form4s.push({ form: form[i], filingDate: filingDate[i], accessionNumber: accessionNumber[i], primaryDocument: primaryDocument[i] })
        }
      }
      results.company = data.name
      results.form4s_last_90_days = form4s.length
      results.first_filing = form4s[0] ?? null

      // 2. Test fetching the first Form 4 XML
      if (form4s.length > 0) {
        const f = form4s[0]
        const adshNoDash = f.accessionNumber.replace(/-/g, '')
        const cik = '320193'
        const doc = (f.primaryDocument || '').replace(/^[^/]+\//, '') || 'ownership.xml'
        const xmlUrl = `${ARCHIVES}/${cik}/${adshNoDash}/${doc}`
        results.xml_url = xmlUrl

        try {
          const xmlRes = await fetch(xmlUrl, {
            headers: { 'User-Agent': UA },
            cache: 'no-store',
          })
          results.xml_status = xmlRes.status
          results.xml_ok = xmlRes.ok
          if (xmlRes.ok) {
            const text = await xmlRes.text()
            results.xml_length = text.length
            results.has_nonDerivativeTransaction = text.includes('<nonDerivativeTransaction>')
            const codeMatch = text.match(/<transactionCode>([^<]+)<\/transactionCode>/)
            results.transaction_codes = text.match(/<transactionCode>([^<]+)<\/transactionCode>/g)?.slice(0, 5)
          }
        } catch (e) {
          results.xml_error = String(e)
        }
      }
    } else {
      results.submissions_body = await res.text().then(t => t.slice(0, 200))
    }
  } catch (e) {
    results.submissions_error = String(e)
  }

  return NextResponse.json(results)
}
