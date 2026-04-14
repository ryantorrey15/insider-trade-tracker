'use client'

import Link from 'next/link'
import { ChevronRight, Crown, Eye, FileText, HelpCircle, Lock, LogOut, Moon, Settings, Shield, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { icon: Settings, label: 'Account Settings', href: '#' },
      { icon: Shield, label: 'Privacy & Security', href: '#' },
      { icon: Moon, label: 'Appearance', href: '#' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & FAQ', href: '#' },
      { icon: Eye, label: 'About InsiderEdge', href: '#' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: FileText, label: 'Disclaimer & Terms of Use', href: '/legal' },
      { icon: Lock, label: 'Privacy Policy', href: '/legal#privacy' },
    ],
  },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* User info */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <Avatar className="h-16 w-16 bg-blue-500/20">
            <AvatarFallback className="text-lg font-bold text-blue-300 bg-blue-500/20">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">John Doe</h2>
            <p className="text-sm text-muted-foreground">john@example.com</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                Free Plan
              </span>
            </div>
          </div>
        </div>

        {/* Subscription upgrade */}
        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/20">
              <Crown className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-foreground">Upgrade to Pro</h3>
                <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-400">
                  $9/mo
                </span>
              </div>
              <ul className="space-y-1 mb-3">
                {[
                  'Unlimited trade alerts',
                  'AI investigation for every trade',
                  'Historical pattern analysis',
                  'CSV export',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold" size="sm">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">47</p>
              <p className="text-xs text-muted-foreground">Viewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings groups */}
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {group.title}
            </p>
            <Card className="border-border">
              <CardContent className="p-0">
                {group.items.map((item, i) => {
                  const Icon = item.icon
                  const isLink = item.href !== '#'
                  const inner = (
                    <>
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  )
                  return (
                    <div key={item.label}>
                      {i > 0 && <Separator />}
                      {isLink ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/50 transition-colors"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/50 transition-colors text-left">
                          {inner}
                        </button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full gap-2 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        <div className="text-center space-y-1 pb-2">
          <p className="text-xs text-muted-foreground">InsiderEdge v0.1.0</p>
          <p className="text-[10px] text-muted-foreground/50">
            For informational purposes only. Not financial advice.{' '}
            <Link href="/legal" className="underline underline-offset-2">Legal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
