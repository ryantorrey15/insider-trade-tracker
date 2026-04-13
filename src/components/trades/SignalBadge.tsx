import { cn, getSignalColor, getSignalLabel } from '@/lib/utils'
import type { SignalType } from '@/types'

interface SignalBadgeProps {
  signal: SignalType
  className?: string
}

export function SignalBadge({ signal, className }: SignalBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
        getSignalColor(signal),
        className
      )}
    >
      {getSignalLabel(signal)}
    </span>
  )
}
