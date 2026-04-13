import { AlertTriangle, Brain, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignalBadge } from './SignalBadge'
import { cn } from '@/lib/utils'
import type { TradeInvestigation } from '@/types'

interface TradeInvestigationCardProps {
  investigation: TradeInvestigation
}

function RelevanceIndicator({ score }: { score: number }) {
  const level = score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low'
  const config = {
    high: {
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      icon: AlertTriangle,
      label: 'High Relevance',
    },
    medium: {
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      icon: AlertTriangle,
      label: 'Medium Relevance',
    },
    low: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      icon: CheckCircle,
      label: 'Low Relevance',
    },
  }[level]

  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5',
        config.bg
      )}
    >
      <Icon className={cn('h-4 w-4', config.color)} />
      <span className={cn('text-sm font-semibold', config.color)}>
        {config.label}
      </span>
      <span className={cn('text-xs font-bold ml-auto', config.color)}>
        {score}/100
      </span>
    </div>
  )
}

export function TradeInvestigationCard({
  investigation,
}: TradeInvestigationCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
            <Brain className="h-4 w-4 text-purple-400" />
          </div>
          <CardTitle className="text-sm font-semibold text-purple-400">
            AI Investigation
          </CardTitle>
        </div>
        <RelevanceIndicator score={investigation.relevanceScore} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {investigation.summary}
        </p>

        {/* Signals */}
        {investigation.signals.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Detected Signals
            </p>
            <div className="flex flex-wrap gap-1.5">
              {investigation.signals.map((signal) => (
                <SignalBadge key={signal} signal={signal} />
              ))}
            </div>
          </div>
        )}

        {/* AI Blurb */}
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Full Analysis
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {investigation.aiBlurb}
          </p>
        </div>

        {/* Generated timestamp */}
        <p className="text-[11px] text-muted-foreground text-right">
          Analysis generated{' '}
          {new Date(investigation.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </CardContent>
    </Card>
  )
}
