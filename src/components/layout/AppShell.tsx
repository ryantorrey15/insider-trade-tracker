import Link from 'next/link'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24 max-w-lg mx-auto">{children}</main>

      {/* Persistent disclaimer strip above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-20 max-w-lg mx-auto px-3 pb-1 pointer-events-none">
        <p className="text-center text-[10px] text-muted-foreground/60 leading-tight pointer-events-auto">
          For informational purposes only. Not financial advice.{' '}
          <Link href="/legal" className="underline underline-offset-2 hover:text-muted-foreground">
            Legal &amp; Privacy
          </Link>
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
