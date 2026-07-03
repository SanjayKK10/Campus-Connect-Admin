-- CampusConnect Admin Panel RLS policies
-- Run in the Supabase SQL editor for your existing users table.

alter table public.users enable row level security;

-- Allow authenticated admin reads and updates on the users table.
create policy "Admins can read users"
  on public.users
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') = 'admin@campusconnect.com'
  );

create policy "Admins can update users"
  on public.users
  for update
  to authenticated
  using (
    (auth.jwt() ->> 'email') = 'admin@campusconnect.com'
  )
  with check (
    (auth.jwt() ->> 'email') = 'admin@campusconnect.com'
  );

-- Deny insert/delete from the admin panel client unless explicitly required.
revoke insert, delete on public.users from anon, authenticated;
