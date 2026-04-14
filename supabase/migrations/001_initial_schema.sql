-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Stocks table
create table public.stocks (
  ticker text primary key,
  company_name text not null,
  sector text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- People table (insiders + politicians unified)
create table public.people (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  source text not null check (source in ('insider', 'congressional')),
  party text check (party in ('D', 'R', 'I')),
  state text,
  chamber text check (chamber in ('Senate', 'House')),
  committee_assignments text[],
  avatar_url text,
  bio text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trades table (unified insider + congressional)
create table public.trades (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid references public.people(id) on delete cascade,
  ticker text references public.stocks(ticker) on delete cascade,
  trade_type text not null check (trade_type in ('buy', 'sell', 'exercise', 'gift', 'exchange')),
  source text not null check (source in ('insider', 'congressional')),
  amount numeric,
  amount_min numeric,
  amount_max numeric,
  shares numeric,
  price_at_trade numeric,
  trade_date date not null,
  filed_date date not null,
  signals text[],
  description text,
  transaction_id text unique,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Price snapshots
create table public.price_snapshots (
  id uuid primary key default uuid_generate_v4(),
  ticker text references public.stocks(ticker) on delete cascade,
  date date not null,
  open numeric not null,
  high numeric not null,
  low numeric not null,
  close numeric not null,
  volume bigint not null,
  unique(ticker, date)
);

-- News articles
create table public.news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  source text not null,
  url text not null,
  published_at timestamptz not null,
  summary text,
  related_tickers text[],
  related_person_ids uuid[],
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Trade investigations (AI-generated analysis)
create table public.trade_investigations (
  id uuid primary key default uuid_generate_v4(),
  trade_id uuid references public.trades(id) on delete cascade unique,
  summary text not null,
  signals text[],
  relevance_score numeric check (relevance_score between 0 and 100),
  ai_blurb text not null,
  related_news_ids uuid[],
  generated_at timestamptz default now()
);

-- Alerts
create table public.alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  type text not null check (type in ('ticker', 'person', 'signal')),
  target_id text not null,
  target_label text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);

-- Indexes
create index idx_trades_person_id on public.trades(person_id);
create index idx_trades_ticker on public.trades(ticker);
create index idx_trades_trade_date on public.trades(trade_date desc);
create index idx_trades_source on public.trades(source);
create index idx_trades_signals on public.trades using gin(signals);
create index idx_price_snapshots_ticker_date on public.price_snapshots(ticker, date desc);
create index idx_news_related_tickers on public.news_articles using gin(related_tickers);
create index idx_people_source on public.people(source);

-- RLS
alter table public.stocks enable row level security;
alter table public.people enable row level security;
alter table public.trades enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.news_articles enable row level security;
alter table public.trade_investigations enable row level security;
alter table public.alerts enable row level security;

-- Public read policies for trade data
create policy "trades_public_read" on public.trades for select using (true);
create policy "stocks_public_read" on public.stocks for select using (true);
create policy "people_public_read" on public.people for select using (true);
create policy "price_snapshots_public_read" on public.price_snapshots for select using (true);
create policy "news_public_read" on public.news_articles for select using (true);
create policy "investigations_public_read" on public.trade_investigations for select using (true);

-- Alerts only accessible by owner
create policy "alerts_owner_only" on public.alerts using (user_id = auth.uid());
