import Link from 'next/link'
import { Building2, MapPin, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getPartyBg } from '@/lib/utils'
import type { Person } from '@/types'

interface PersonCardProps {
  person: Person
  showLink?: boolean
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getAvatarBg(name: string): string {
  const colors = [
    'bg-blue-500/20 text-blue-300',
    'bg-purple-500/20 text-purple-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-orange-500/20 text-orange-300',
    'bg-red-500/20 text-red-300',
    'bg-yellow-500/20 text-yellow-300',
    'bg-pink-500/20 text-pink-300',
    'bg-cyan-500/20 text-cyan-300',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

function PersonCardContent({ person }: { person: Person }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
      <Avatar className={cn('h-14 w-14 shrink-0 text-lg font-bold', getAvatarBg(person.name))}>
        <AvatarFallback className={cn('font-bold text-base', getAvatarBg(person.name))}>
          {getInitials(person.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-base text-foreground">{person.name}</h3>
          {person.party && (
            <span
              className={cn(
                'inline-flex items-center rounded border px-1.5 py-0 text-xs font-bold',
                getPartyBg(person.party)
              )}
            >
              {person.party}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
          {person.source === 'congressional' ? (
            <Users className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Building2 className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{person.title}</span>
        </p>
        {person.state && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            {person.state} &bull; {person.chamber}
          </p>
        )}
        {person.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {person.bio}
          </p>
        )}
      </div>
    </div>
  )
}

export function PersonCard({ person, showLink = true, className }: PersonCardProps) {
  if (showLink) {
    return (
      <Link href={`/person/${person.id}`} className={cn('block', className)}>
        <PersonCardContent person={person} />
      </Link>
    )
  }
  return (
    <div className={className}>
      <PersonCardContent person={person} />
    </div>
  )
}
