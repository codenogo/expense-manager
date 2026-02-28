create table categorization_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  match_pattern text not null,
  match_type text not null check (match_type in ('contains', 'exact', 'starts_with')),
  category_id uuid not null references categories(id) on delete cascade,
  priority integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_categorization_rules_household on categorization_rules(household_id);

alter table categorization_rules enable row level security;

create policy "Users can manage their household rules"
  on categorization_rules for all
  using (household_id in (select household_id from profiles where id = auth.uid()))
  with check (household_id in (select household_id from profiles where id = auth.uid()));
