-- Make email optional and require a valid international WhatsApp/phone number for website inquiries.
alter table public.inquiries alter column email drop not null;

drop policy if exists "Public can submit travel inquiries" on public.inquiries;

create policy "Public can submit travel inquiries"
on public.inquiries
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'new'
  and length(trim(coalesce(full_name, ''))) between 1 and 120
  and (length(trim(coalesce(email, ''))) = 0 or length(trim(email)) between 3 and 254)
  and phone ~ '^\+[1-9][0-9]{6,14}$'
  and length(trim(coalesce(message, ''))) between 1 and 5000
);
