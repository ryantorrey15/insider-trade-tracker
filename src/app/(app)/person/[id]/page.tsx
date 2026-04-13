import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PersonCard } from '@/components/person/PersonCard'
import { PersonStats } from '@/components/person/PersonStats'
import { TradeFeed } from '@/components/trades/TradeFeed'
import { getPersonById, getTradesByPerson } from '@/lib/mock-data'

interface PersonDetailPageProps {
  params: { id: string }
}

export default function PersonDetailPage({ params }: PersonDetailPageProps) {
  const person = getPersonById(params.id)
  if (!person) notFound()

  const trades = getTradesByPerson(person.id)

  return (
    <div className="min-h-screen">
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/feed">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Person card */}
        <PersonCard person={person} showLink={false} />

        {/* Stats */}
        <PersonStats person={person} />

        {/* Committee assignments (for politicians) */}
        {person.committeeAssignments && person.committeeAssignments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Committee Assignments
            </p>
            <div className="space-y-2">
              {person.committeeAssignments.map((committee) => (
                <Card key={committee} className="border-border">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 shrink-0">
                      <Shield className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{committee}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top tickers */}
        {person.mostTradedTickers && person.mostTradedTickers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Most Traded Tickers
            </p>
            <div className="flex flex-wrap gap-2">
              {person.mostTradedTickers.map((ticker) => (
                <Link key={ticker} href={`/stock/${ticker}`}>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted transition-colors">
                    <span className="font-mono text-sm font-black text-foreground">
                      {ticker}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trade history */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Trade History ({trades.length})
          </p>
          <TradeFeed
            trades={trades}
            emptyMessage="No trades found for this person."
          />
        </div>
      </div>
    </div>
  )
}
