-- POL core schema (blueprint 9.2). Runs on local Postgres 14+ and Aurora PostgreSQL 16.
-- Keep one statement per ";" line ending and no $$ function bodies: the Data API runner
-- sends statements one at a time.

-- Geography ---------------------------------------------------------------

create table states (
  id text primary key,
  name text not null,
  zone text not null
);

create table lgas (
  id text primary key,
  state_id text not null references states(id),
  name text not null
);
create index lgas_state_idx on lgas(state_id);

create table wards (
  id text primary key,
  lga_id text not null references lgas(id),
  name text not null
);
create index wards_lga_idx on wards(lga_id);

-- Senatorial districts, federal constituencies and state constituencies.
create table constituencies (
  id text primary key,
  kind text not null check (kind in ('senatorial', 'federal', 'state')),
  state_id text not null references states(id),
  name text not null
);

create table constituency_wards (
  constituency_id text not null references constituencies(id),
  ward_id text not null references wards(id),
  primary key (constituency_id, ward_id)
);
create index constituency_wards_ward_idx on constituency_wards(ward_id);

-- Offices and people -----------------------------------------------------------

create table offices (
  id text primary key,
  office_type text not null,
  level text not null check (level in ('federal', 'state', 'lga', 'ward')),
  title text not null,
  state_id text references states(id),
  lga_id text references lgas(id),
  ward_id text references wards(id),
  constituency_id text references constituencies(id)
);
create index offices_type_idx on offices(office_type);

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  bio text,
  gender text,
  education text,
  is_fictional boolean not null default false,
  created_at timestamptz not null default now()
);

create table tenures (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id),
  office_id text not null references offices(id),
  party text not null,
  start_date date not null,
  end_date date,
  how_obtained text not null default 'elected' check (how_obtained in ('elected', 'appointed', 'court'))
);
create index tenures_office_idx on tenures(office_id);
create index tenures_person_idx on tenures(person_id);

-- Record ----------------------------------------------------------------------

create table promises (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid not null references tenures(id),
  text text not null,
  source_url text,
  made_on date,
  category text,
  status text not null default 'not_rated' check (status in ('kept', 'in_progress', 'stalled', 'broken', 'not_rated')),
  updated_at timestamptz not null default now()
);
create index promises_tenure_idx on promises(tenure_id);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  topic text,
  state_id text references states(id),
  lga_id text references lgas(id),
  ward_id text references wards(id),
  lat double precision,
  lng double precision,
  budget_amount numeric(18, 2),
  value_tier int not null default 1 check (value_tier between 1 and 5),
  funding_source text,
  contractor text,
  status text not null check (status in ('completed_working', 'completed_not_working', 'ongoing', 'stalled', 'abandoned', 'never_started')),
  verification_level text not null default 'announced' check (verification_level in ('announced', 'reported', 'verified', 'disputed')),
  started_on date,
  created_at timestamptz not null default now()
);

create table project_tenures (
  project_id uuid not null references projects(id),
  tenure_id uuid not null references tenures(id),
  primary key (project_id, tenure_id)
);
create index project_tenures_tenure_idx on project_tenures(tenure_id);

create table legislative_records (
  tenure_id uuid primary key references tenures(id),
  bills_sponsored int not null default 0,
  bills_passed int not null default 0,
  motions int not null default 0,
  attendance_pct numeric(5, 2)
);

create table budget_records (
  tenure_id uuid not null references tenures(id),
  year int not null,
  published boolean not null,
  capital_implementation_pct numeric(5, 2),
  primary key (tenure_id, year)
);

create table foi_requests (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid not null references tenures(id),
  subject text not null,
  sent_on date not null,
  responded_on date
);
create index foi_requests_tenure_idx on foi_requests(tenure_id);

create table engagements (
  tenure_id uuid primary key references tenures(id),
  town_halls int not null default 0
);

-- News ------------------------------------------------------------------------

create table news_items (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text not null,
  topic text not null,
  claim_type text not null check (claim_type in ('announcement', 'contract_awarded', 'completed', 'disputed', 'general')),
  confidence_label text not null check (confidence_label in ('announced', 'reported', 'verified', 'disputed')),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  affects_score boolean not null default false,
  ai_generated boolean not null default false,
  editor_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index news_items_status_idx on news_items(status, published_at desc);

create table news_sources (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references news_items(id) on delete cascade,
  outlet text not null,
  url text not null,
  published_at timestamptz
);
create index news_sources_news_idx on news_sources(news_id);

create table news_tenures (
  news_id uuid not null references news_items(id) on delete cascade,
  tenure_id uuid not null references tenures(id),
  primary key (news_id, tenure_id)
);
create index news_tenures_tenure_idx on news_tenures(tenure_id);

create table news_projects (
  news_id uuid not null references news_items(id) on delete cascade,
  project_id uuid not null references projects(id),
  primary key (news_id, project_id)
);

-- Right of reply (blueprint 6.5).
create table replies (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid not null references tenures(id),
  news_id uuid references news_items(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- Users and reactions ---------------------------------------------------------

create table users (
  id uuid primary key default gen_random_uuid(),
  cognito_sub text unique not null,
  phone_hash text,
  verification_level text not null default 'unverified' check (verification_level in ('unverified', 'phone', 'kyc')),
  home_ward_id text references wards(id),
  language text not null default 'en',
  trust_score numeric(5, 2) not null default 0,
  flagged boolean not null default false,
  role text not null default 'citizen' check (role in ('citizen', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

create table reactions (
  user_id uuid not null references users(id),
  news_id uuid not null references news_items(id) on delete cascade,
  type text not null check (type in ('up', 'down', 'impactful', 'disputed', 'evidence')),
  created_at timestamptz not null default now(),
  primary key (user_id, news_id, type)
);
create index reactions_news_idx on reactions(news_id);

-- One active rating per user per official (blueprint 8.3).
create table official_ratings (
  user_id uuid not null references users(id),
  tenure_id uuid not null references tenures(id),
  value smallint not null check (value in (-1, 1)),
  updated_at timestamptz not null default now(),
  primary key (user_id, tenure_id)
);
create index official_ratings_tenure_idx on official_ratings(tenure_id);

-- Scores ------------------------------------------------------------------------

-- Latest scorecard per tenure, rewritten by the score engine.
create table scorecards (
  tenure_id uuid primary key references tenures(id),
  method_version text not null,
  performance numeric(5, 2),
  confidence text not null,
  components jsonb not null,
  approve_pct numeric(5, 2),
  verified_residents int not null default 0,
  unverified_reactions int not null default 0,
  approval_low_sample boolean not null default true,
  computed_at timestamptz not null default now()
);

-- Every computed score is kept so changes can be traced (blueprint 8.5).
create table score_history (
  id bigserial primary key,
  tenure_id uuid not null references tenures(id),
  method_version text not null,
  performance numeric(5, 2),
  confidence text not null,
  components jsonb not null,
  approve_pct numeric(5, 2),
  computed_at timestamptz not null default now()
);
create index score_history_tenure_idx on score_history(tenure_id, computed_at desc);

-- Audit log of every editorial and score change, kept permanently.
create table audit_log (
  id bigserial primary key,
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  at timestamptz not null default now()
);
