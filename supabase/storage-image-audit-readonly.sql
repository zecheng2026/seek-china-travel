-- SCT Storage audit: READ ONLY. Never delete based on this report alone.
WITH refs AS (
 SELECT to_jsonb(t)::text AS body FROM public.homepage_sections t
 UNION ALL SELECT to_jsonb(t)::text FROM public.destinations t
 UNION ALL SELECT to_jsonb(t)::text FROM public.tours t
 UNION ALL SELECT to_jsonb(t)::text FROM public.tour_days t
 UNION ALL SELECT to_jsonb(t)::text FROM public.travel_guides t
 UNION ALL SELECT to_jsonb(t)::text FROM public.traveler_reviews t
), objects AS (
 SELECT name AS object_key, created_at, updated_at,
        COALESCE((metadata->>'size')::bigint,0) AS bytes,
        split_part(name,'/',1) AS folder
 FROM storage.objects WHERE bucket_id='website-media'
), audit AS (
 SELECT o.*, EXISTS (SELECT 1 FROM refs r WHERE strpos(r.body,o.object_key)>0) AS has_reference
 FROM objects o
)
SELECT folder, object_key, created_at, updated_at, bytes,
       round(bytes::numeric/1048576,2) AS size_mb,
       CASE WHEN has_reference THEN 'REFERENCED - KEEP'
            WHEN created_at > now()-interval '30 days' THEN 'RECENT - REVIEW LATER'
            ELSE 'CANDIDATE - MANUAL REVIEW ONLY' END AS audit_status
FROM audit
ORDER BY has_reference, bytes DESC, object_key;
