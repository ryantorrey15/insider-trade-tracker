import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Legal — InsiderEdge',
}

export default function LegalPage() {
  const effectiveDate = 'April 14, 2026'

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto px-4 py-6">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">Legal</h1>
      <p className="text-xs text-muted-foreground mb-8">Effective {effectiveDate}</p>

      {/* Disclaimer */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3 pb-2 border-b border-border">
          Disclaimer — Not Financial Advice
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            InsiderEdge is an informational platform only. All data, analysis, signals, and
            content provided through this application are for <strong className="text-foreground">informational and
            educational purposes only</strong> and do not constitute financial advice, investment
            advice, trading advice, or any other form of advice.
          </p>
          <p>
            Nothing on this platform should be construed as a recommendation to buy, sell, or
            hold any security, financial product, or instrument. You should not rely on any
            information provided here as the basis for any investment or financial decision.
          </p>
          <p>
            The data displayed — including congressional trade disclosures, corporate insider
            transactions, and any derived signals — is sourced from public government filings and
            third-party data providers. We do not guarantee its accuracy, completeness, timeliness,
            or fitness for any particular purpose. Filings may contain errors, delays, or
            omissions beyond our control.
          </p>
          <p className="text-foreground font-medium border border-border rounded-lg p-3 bg-card">
            Accordingly, we will not be liable, whether in contract, tort (including negligence)
            or otherwise, in respect of any damage, expense or other loss you may suffer arising
            out of such information or any reliance you may place upon such information. Any
            arrangements between you and any third party contacted via this application are at
            your sole risk.
          </p>
          <p>
            Past performance of any trades shown is not indicative of future results. Trading
            and investing involve significant risk of loss. You should consult a qualified
            financial adviser before making any investment decisions.
          </p>
        </div>
      </section>

      {/* Terms of Use */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3 pb-2 border-b border-border">
          Terms of Use
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            By accessing or using InsiderEdge you agree to these terms. If you do not agree,
            please discontinue use immediately.
          </p>
          <p>
            <strong className="text-foreground">Data sources.</strong> Congressional trade
            disclosures are sourced from the U.S. House of Representatives Clerk&apos;s office
            and the Senate eFDS — both public government databases. Corporate insider transaction
            data is sourced from Finnhub and Financial Modeling Prep. We aggregate and normalise
            this data but do not create or validate the underlying filings.
          </p>
          <p>
            <strong className="text-foreground">No warranty.</strong> This application is
            provided &quot;as is&quot; and &quot;as available&quot; without any warranty of any kind,
            express or implied. We do not warrant that the service will be uninterrupted,
            error-free, or free of viruses or other harmful components.
          </p>
          <p>
            <strong className="text-foreground">Limitation of liability.</strong> To the fullest
            extent permitted by law, InsiderEdge and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your
            use of or inability to use this application.
          </p>
          <p>
            <strong className="text-foreground">Prohibited use.</strong> You may not use this
            application to engage in market manipulation, front-running, or any activity that
            violates applicable securities laws or regulations.
          </p>
          <p>
            We reserve the right to modify these terms at any time. Continued use after changes
            constitutes acceptance of the revised terms.
          </p>
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-3 pb-2 border-b border-border">
          Privacy Policy
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">What we collect.</strong> InsiderEdge does not
            currently require account registration. We do not collect, store, or sell personal
            information. If you contact us by email, we retain only that correspondence.
          </p>
          <p>
            <strong className="text-foreground">Analytics.</strong> We may use anonymised,
            aggregated usage analytics (e.g. page views, feature usage) to improve the product.
            No personally identifiable information is collected.
          </p>
          <p>
            <strong className="text-foreground">Third-party services.</strong> This application
            fetches data from Finnhub, Financial Modeling Prep, and U.S. government portals.
            Your requests to this application may indirectly result in requests to those services.
            Please review their respective privacy policies.
          </p>
          <p>
            <strong className="text-foreground">Cookies.</strong> We do not use tracking cookies.
            Functional cookies may be set by the hosting infrastructure (Vercel) for performance
            and security purposes only.
          </p>
          <p>
            <strong className="text-foreground">Data retention.</strong> No user data is retained
            beyond the current session. Cached financial data is refreshed periodically and is
            not associated with individual users.
          </p>
          <p>
            <strong className="text-foreground">Contact.</strong> Questions about this policy
            can be directed to the InsiderEdge team through the application.
          </p>
        </div>
      </section>

      {/* Data sources */}
      <section className="mb-16">
        <h2 className="text-base font-semibold text-foreground mb-3 pb-2 border-b border-border">
          Data Sources
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Congressional trades: U.S. House Clerk Periodic Transaction Reports (PTRs) and Senate eFDS — public government databases.</p>
          <p>Stock quotes &amp; profiles: Financial Modeling Prep.</p>
          <p>Corporate insider transactions: Finnhub.</p>
          <p>All data is used in compliance with the respective terms of each source.</p>
        </div>
      </section>
    </div>
  )
}
