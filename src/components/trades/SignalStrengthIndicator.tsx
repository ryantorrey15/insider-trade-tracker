import { cn } from '@/lib/utils'

interface SignalStrengthIndicatorProps {
  strength: 'strong' | 'moderate' | 'weak'
  className?: string
}

export function SignalStrengthIndicator({ strength, className }: SignalStrengthIndicatorProps) {
  const filledBars = strength === 'strong' ? 3 : strength === 'moderate' ? 2 : 1

  const barColor =
    strength === 'strong'
      ? 'bg-emerald-400'
      : strength === 'moderate'
        ? 'bg-yellow-400'
        : 'bg-zinc-400'

  const textColor =
    strength === 'strong'
      ? 'text-emerald-400'
      : strength === 'moderate'
        ? 'text-yellow-400'
        : 'text-zinc-400'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'rounded-sm transition-colors',
              bar <= filledBars ? barColor : 'bg-muted-foreground/20',
              bar === 1 ? 'w-1 h-2' : bar === 2 ? 'w-1 h-3' : 'w-1 h-4'
            )}
          />
        ))}
      </div>
      <span className={cn('text-[10px] font-semibold capitalize', textColor)}>
        {strength}
      </span>
    </div>
  )
}
