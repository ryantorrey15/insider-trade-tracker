'use client'

import { useState } from 'react'
import { Bell, BellOff, Plus, Trash2, TrendingUp, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SignalBadge } from '@/components/trades/SignalBadge'
import { cn } from '@/lib/utils'
import type { Alert, SignalType } from '@/types'

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    userId: 'user-1',
    type: 'ticker',
    targetId: 'NVDA',
    targetLabel: 'NVIDIA Corporation (NVDA)',
    enabled: true,
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'alert-2',
    userId: 'user-1',
    type: 'person',
    targetId: 'person-1',
    targetLabel: 'Nancy Pelosi',
    enabled: true,
    createdAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'alert-3',
    userId: 'user-1',
    type: 'signal',
    targetId: 'committee_relevance',
    targetLabel: 'Committee Relevance Signal',
    enabled: false,
    createdAt: '2025-01-15T00:00:00Z',
  },
]

const SIGNAL_OPTIONS: SignalType[] = [
  'committee_relevance',
  'pre_earnings_buy',
  'pre_earnings_sale',
  'cluster_buying',
  'unusual_volume',
  'near_contract_award',
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<Alert['type']>('ticker')
  const [addInput, setAddInput] = useState('')

  function toggleAlert(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  function handleAdd() {
    if (!addInput.trim()) return
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      userId: 'user-1',
      type: addType,
      targetId: addInput.trim(),
      targetLabel: addInput.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    setAlerts((prev) => [newAlert, ...prev])
    setAddInput('')
    setAddOpen(false)
  }

  const alertTypeIcon: Record<Alert['type'], React.ReactNode> = {
    ticker: <TrendingUp className="h-4 w-4 text-blue-400" />,
    person: <User className="h-4 w-4 text-purple-400" />,
    signal: <Zap className="h-4 w-4 text-yellow-400" />,
  }

  const alertTypeBg: Record<Alert['type'], string> = {
    ticker: 'bg-blue-500/10',
    person: 'bg-purple-500/10',
    signal: 'bg-yellow-500/10',
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Alerts</h1>
            <p className="text-xs text-muted-foreground">
              {alerts.filter((a) => a.enabled).length} active
            </p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Create Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Alert Type
                  </label>
                  <div className="flex gap-2">
                    {(['ticker', 'person', 'signal'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setAddType(t)}
                        className={cn(
                          'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                          addType === t
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {addType === 'ticker' ? 'Ticker Symbol' : addType === 'person' ? 'Person Name' : 'Signal Type'}
                  </label>
                  {addType === 'signal' ? (
                    <div className="flex flex-wrap gap-2">
                      {SIGNAL_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setAddInput(s)}
                          className={cn(
                            'transition-opacity',
                            addInput !== s && 'opacity-50 hover:opacity-80'
                          )}
                        >
                          <SignalBadge signal={s} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      placeholder={addType === 'ticker' ? 'e.g. NVDA' : 'e.g. Nancy Pelosi'}
                      value={addInput}
                      onChange={(e) => setAddInput(e.target.value)}
                      className={addType === 'ticker' ? 'uppercase' : ''}
                    />
                  )}
                </div>
                <Button className="w-full" onClick={handleAdd} disabled={!addInput.trim()}>
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">No alerts yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Create alerts to be notified when specific tickers, traders, or signals appear.
            </p>
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Push notifications coming in v2. Alerts are currently tracked locally.
            </p>
            {alerts.map((alert) => (
              <Card key={alert.id} className={cn('border-border', !alert.enabled && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        alertTypeBg[alert.type]
                      )}
                    >
                      {alertTypeIcon[alert.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {alert.targetLabel}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {alert.type} alert
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          alert.enabled
                            ? 'text-primary hover:text-primary/80'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                        title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                      >
                        {alert.enabled ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="mt-8 rounded-xl border border-border bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-bold text-foreground">Pro Alerts</span>
            <span className="ml-auto rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-400">
              Coming Soon
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get instant push notifications, email digests, and SMS alerts when high-signal trades are filed. Set custom thresholds and never miss a move.
          </p>
        </div>
      </div>
    </div>
  )
}
