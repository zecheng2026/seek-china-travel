-- SEEK CHINA TRAVEL public website inquiry policy.
-- Website forms write to the existing inquiries schema:
-- full_name, email, phone, whatsapp, destination, message, source, status.
-- Country and trip details are stored in message; no extra columns are required.

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ALTER COLUMN email DROP NOT NULL;

GRANT INSERT ON public.inquiries TO anon, authenticated;

-- Remove both permissive public policies so an older policy cannot bypass validation.
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Public can submit travel inquiries" ON public.inquiries;

CREATE POLICY "Public can submit travel inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  source = 'website'
  AND status = 'new'
  AND assigned_to IS NULL
  AND internal_notes IS NULL
  AND length(trim(coalesce(full_name, ''))) BETWEEN 1 AND 120
  AND (
    length(trim(coalesce(email, ''))) = 0
    OR length(trim(email)) BETWEEN 3 AND 254
  )
  AND phone ~ '^\+[1-9][0-9]{6,14}$'
  AND length(trim(coalesce(message, ''))) BETWEEN 1 AND 5000
);

-- Anonymous website visitors receive INSERT permission only.
-- Do not grant anonymous SELECT, UPDATE or DELETE access.
