-- FAIRWAY DYNASTY — PHASE 2 DATABASE SETUP
-- Run this entire file once in Supabase:
-- SQL Editor → New query → paste → Run

create extension if not exists pgcrypto;

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 50),
  invite_code text not null unique,
  commissioner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.league_members (
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('commissioner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index if not exists league_members_user_id_idx
  on public.league_members(user_id);

create index if not exists leagues_commissioner_id_idx
  on public.leagues(commissioner_id);

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

drop policy if exists "Members can view their leagues" on public.leagues;
create policy "Members can view their leagues"
on public.leagues
for select
to authenticated
using (
  exists (
    select 1
    from public.league_members
    where league_members.league_id = leagues.id
      and league_members.user_id = (select auth.uid())
  )
);

drop policy if exists "Members can view league memberships" on public.league_members;
create policy "Members can view league memberships"
on public.league_members
for select
to authenticated
using (
  exists (
    select 1
    from public.league_members as viewer
    where viewer.league_id = league_members.league_id
      and viewer.user_id = (select auth.uid())
  )
);

create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  generated_code text;
begin
  loop
    generated_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (
      select 1 from public.leagues where invite_code = generated_code
    );
  end loop;

  return generated_code;
end;
$$;

create or replace function public.create_league(p_name text)
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_league public.leagues;
  clean_name text := trim(p_name);
begin
  if current_user_id is null then
    raise exception 'You must be logged in.';
  end if;

  if char_length(clean_name) < 3 or char_length(clean_name) > 50 then
    raise exception 'League names must be between 3 and 50 characters.';
  end if;

  insert into public.leagues (name, invite_code, commissioner_id)
  values (clean_name, public.generate_invite_code(), current_user_id)
  returning * into new_league;

  insert into public.league_members (league_id, user_id, role)
  values (new_league.id, current_user_id, 'commissioner');

  return new_league;
end;
$$;

create or replace function public.join_league_by_code(p_code text)
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  found_league public.leagues;
  clean_code text := upper(trim(p_code));
begin
  if current_user_id is null then
    raise exception 'You must be logged in.';
  end if;

  select *
  into found_league
  from public.leagues
  where invite_code = clean_code;

  if found_league.id is null then
    raise exception 'No league was found with that invite code.';
  end if;

  insert into public.league_members (league_id, user_id, role)
  values (found_league.id, current_user_id, 'member')
  on conflict (league_id, user_id) do nothing;

  return found_league;
end;
$$;

revoke all on function public.create_league(text) from public;
revoke all on function public.join_league_by_code(text) from public;
grant execute on function public.create_league(text) to authenticated;
grant execute on function public.join_league_by_code(text) to authenticated;
