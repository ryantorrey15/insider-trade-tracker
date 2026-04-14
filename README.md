# InsiderTrack

Congressional and corporate insider trade intelligence with AI signal analysis.

## Tech Stack

- **Frontend**: Next.js 14+ App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL via Supabase
- **Cache**: Redis via Upstash
- **Deployment**: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and Upstash credentials in `.env.local`.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (app)/           # App routes with AppShell layout
│   │   ├── feed/        # Main trade feed
│   │   ├── search/      # Search page
│   │   ├── trending/    # Trending tickers & traders
│   │   ├── alerts/      # User alerts
│   │   ├── profile/     # User profile
│   │   ├── trade/[id]/  # Trade detail
│   │   ├── person/[id]/ # Person detail
│   │   └── stock/[ticker]/ # Stock detail
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # AppShell, Header, BottomNav
│   ├── trades/          # TradeCard, TradeFeed, FilterDrawer, etc.
│   ├── charts/          # PriceChart (Recharts)
│   ├── search/          # SearchBar, RecentSearches
│   ├── person/          # PersonCard, PersonStats
│   └── stock/           # StockHeader
├── lib/
│   ├── mock-data.ts     # Complete mock data layer
│   ├── utils.ts         # Utility functions
│   └── supabase.ts      # Supabase client
└── types/
    ├── index.ts         # Domain types
    └── database.ts      # Supabase DB types
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

## Database Setup

```bash
# Push migrations to Supabase
npm run db:migrate
```

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Set the environment variables in your Vercel project settings.
