-- Schema for the career guidance recommendation system
-- Supabase / PostgreSQL

-- UUID generation
create extension if not exists pgcrypto;

-- ============================================================
-- Table: admin_users
-- Stores users who have access to the administrative panel.
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper function: is_admin()
-- Checks whether the current authenticated user is an administrator.
-- The function is used by the frontend through supabase.rpc("is_admin")
-- and by RLS policies.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin
    where admin.user_id = auth.uid()
       or lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- Validation function: is_valid_answers()
-- Checks that answers is a JSON array of exactly 12 integer values
-- from 0 to 10.
-- ============================================================

create or replace function public.is_valid_answers(value jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  item jsonb;
  numeric_value numeric;
begin
  if value is null or jsonb_typeof(value) <> 'array' then
    return false;
  end if;

  if jsonb_array_length(value) <> 12 then
    return false;
  end if;

  for item in select * from jsonb_array_elements(value)
  loop
    if jsonb_typeof(item) <> 'number' then
      return false;
    end if;

    numeric_value := (item #>> '{}')::numeric;

    if numeric_value < 0 or numeric_value > 10 then
      return false;
    end if;

    if numeric_value <> floor(numeric_value) then
      return false;
    end if;
  end loop;

  return true;
exception
  when others then
    return false;
end;
$$;

-- ============================================================
-- Table: test_results
-- Stores completed test results.
-- ============================================================

create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),

  education_level text not null
    check (education_level in ('bachelor', 'master')),

  answers jsonb not null
    check (public.is_valid_answers(answers)),

  results jsonb not null
    check (jsonb_typeof(results) = 'array'),

  interest_profile jsonb not null
    check (jsonb_typeof(interest_profile) = 'array'),

  top_program_name text,

  top_program_percent numeric
    check (
      top_program_percent is null
      or (top_program_percent >= 0 and top_program_percent <= 100)
    ),

  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.test_results enable row level security;
alter table public.admin_users enable row level security;

-- Remove old policies before creating new ones.
drop policy if exists "Anyone can insert test results" on public.test_results;
drop policy if exists "Admins can read test results" on public.test_results;
drop policy if exists "Admins can read admin users" on public.admin_users;

-- A visitor can save the result without registration.
-- This is needed because the test is available without a user account.
create policy "Anyone can insert test results"
on public.test_results
for insert
to anon, authenticated
with check (true);

-- Only administrators can read saved results.
create policy "Admins can read test results"
on public.test_results
for select
to authenticated
using (public.is_admin());

-- Only administrators can read the list of admin users.
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- ============================================================
-- Grants
-- ============================================================

grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant insert on public.test_results to anon;
grant insert on public.test_results to authenticated;
grant select on public.test_results to authenticated;

grant select on public.admin_users to authenticated;

-- ============================================================
-- Example of adding an administrator
-- Replace the email with the administrator's email from Supabase Auth.
-- It is better not to commit real personal data into the repository.
-- ============================================================

-- insert into public.admin_users (email)
-- values ('admin@example.com')
-- on conflict (email) do nothing;