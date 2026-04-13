'use client'

import Link from 'next/link'
import { Bell, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  className?: string
}

export function Header({ title, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-4 w-4 text-primary-foreground" />
          </div>
          {!title && (
            <span className="text-base font-bold tracking-tight">
              InsiderTrack
            </span>
          )}
          {title && (
            <span className="text-base font-semibold">{title}</span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/alerts">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
