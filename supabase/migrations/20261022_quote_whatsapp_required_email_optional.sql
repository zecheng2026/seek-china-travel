-- Standardize public website inquiries: require country context and an international phone number,
-- allow email to be omitted, and keep the public insert policy from being bypassed by older permissive policies.
ALTER TABLE public.inquiries
  ALTER COLUMN email DROP NOT NULL;

-- PostgreSQL permissive INSERT policies are ORed together. Remove the older broad policy
-- so it cannot bypass the phone/email validation in the travel inquiry policy.
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
  AND phone ~ '^\+[1-9][0-9]{6,14}  AND length(trim(coalesce(message, ''))) BETWEEN 1 AND 5000
);

  AND position('Country: ' IN coalesce(message, '')) > 0
  AND length(trim(coalesce(message, ''))) BETWEEN 1 AND 5000
);
