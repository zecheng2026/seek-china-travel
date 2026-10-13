# Review photos (preview setup and QA)

**Required database migration:** Run `supabase/review-photos.sql` in the Supabase project connected to the PR preview before testing. This creates the `review-photos` bucket, restricted guest upload session, admin upload policies and RPCs. It does not alter existing reviews or delete images.

- Guest: up to 3 JPG/PNG/WebP photos per review, compressed client-side to WebP (long edge <=1600, quality .78, <=2 MiB), uploaded after the review is created as pending. Guests cannot edit other reviews. Review photos only appear in the site's public review UI after approval.
- Admin: up to 6 compressed photos for moderated traveler reviews; existing legacy manual review screenshot uploads are also compressed.
- **Privacy:** The photo bucket is publicly readable by possession of its unguessable URL. Moderation prevents UI publication but does **not** make uploaded photo URLs private. Do not upload sensitive photos. For strict private pre-moderation photos, a private bucket + signed access flow is needed.
- A failed photo upload after review creation can leave a pending text-only review. The UI reports the error; avoid resubmitting blindly.
- Legacy screenshot originals already stored are not recompressed retroactively.

## QA before merge
1. Run migration, ensure no SQL error.
2. Submit review with 1-3 photos on /reviews, tour detail, destination detail.
3. Verify review stays pending and photos do not appear publicly before approval.
4. Admin → 游客评论 → approve: photos show in /reviews and detail page; remove/upload admin photo; check existing avatar and replies.
5. Manual legacy review: upload JPG/PNG screenshots; confirm Storage object is compressed WebP and image displays.
6. Test 4 photos, unsupported files, oversized images, failed network, mobile layout, and existing photo-less reviews.
7. Run Cloudflare build preview and confirm production remains unchanged.

No automatic production migration or merge.