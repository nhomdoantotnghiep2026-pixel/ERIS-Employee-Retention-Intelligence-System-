create table if not exists public.employee_requests (
  id uuid primary key default gen_random_uuid(),
  employee_email text not null,
  employee_name text not null,
  request_type text not null check (request_type in ('Annual leave', 'Overtime', 'Shift change', 'Remote work')),
  requested_date date not null,
  detail text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  reviewer_email text,
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists employee_requests_employee_email_idx on public.employee_requests (employee_email);
create index if not exists employee_requests_status_idx on public.employee_requests (status);

alter table public.employee_requests enable row level security;

-- Temporary demo policy: the current frontend uses demo roles stored in sessionStorage,
-- not Supabase Auth. Replace these policies with auth.uid()-based policies when the
-- backend/Auth accounts are ready.
drop policy if exists "demo can read employee requests" on public.employee_requests;
create policy "demo can read employee requests"
  on public.employee_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "demo can create employee requests" on public.employee_requests;
create policy "demo can create employee requests"
  on public.employee_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "demo can review employee requests" on public.employee_requests;
create policy "demo can review employee requests"
  on public.employee_requests for update
  to anon, authenticated
  using (true)
  with check (status in ('Pending', 'Approved', 'Rejected'));
