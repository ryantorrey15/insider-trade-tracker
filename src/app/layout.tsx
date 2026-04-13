import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InsiderTrack - Congressional & Corporate Trade Intelligence',
  description:
    'Track insider trades and congressional stock disclosures with AI-powered signal analysis. Follow the smart money.',
  keywords: ['insider trading', 'congressional trades', 'stock tracker', 'STOCK Act', 'SEC filings'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
