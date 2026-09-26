-- SEEK CHINA TRAVEL inquiry form policy
-- The website now writes to the existing inquiries schema:
-- full_name, email, phone, whatsapp, destination, message, source, status.
-- No duplicate name/travel_dates/travelers/tour_name columns are required.

alter table public.inquiries enable row level security;

grant insert on public.inquiries to anon, authenticated;

drop policy if exists "Public can submit travel inquiries" on public.inquiries;

create policy "Public can submit travel inquiries"
on public.inquiries
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'new'
  and length(trim(coalesce(full_name, ''))) between 1 and 120
  and length(trim(coalesce(email, ''))) between 3 and 254
  and length(trim(coalesce(message, ''))) between 1 and 5000
);

-- Anonymous website visitors receive INSERT permission only.
-- Do not grant anonymous SELECT, UPDATE or DELETE access.
