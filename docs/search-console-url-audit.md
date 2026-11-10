# Search Console URL audit — 2026-11-10

## Verified renamed URLs

`public/_redirects` sends these paths directly to the current published pages with
HTTP 301. The destination and tour slugs were checked against the live catalog;
the guide list is the current `/travel-guide` route. No canonical detail page is
rewritten to a generic client shell.

| Reported URL path | Target |
| --- | --- |
| `/guides` | `/travel-guide` |
| `/guides.html` | `/travel-guide` |
| `/destinations/beijing` | `/destinations/beijing-travel-guide` |
| `/destinations/guilin` | `/destinations/guilin-travel-guide` |
| `/tours/zhangjiajie-5-day` | `/tours/zhangjiajie-5-day-tour` |

## URLs intentionally left as 404

There is no verified old-ID migration map in repository history or the current
catalog. Current numeric database IDs must not be equated with old prefixed IDs:
the existing verified `D003` mapping is Chengdu, while current destination row 3
is Zhangjiajie. Add mappings only when original content or an export establishes
the match. Query-ID redirects belong in Pages Functions, since `_redirects`
cannot match individual query parameters.

| Reported URL path | Disposition |
| --- | --- |
| `/route-detail.html?id=R001` | Original tour identity unverified; retain 404 |
| `/route-detail.html?id=R003` | Original tour identity unverified; retain 404 |
| `/dest-detail.html?id=D001` | Original destination identity unverified; retain 404 |
| `/dest-detail.html?id=D004` | Original destination identity unverified; retain 404 |
| `/guide-detail.html?id=G001` | Original article identity unverified; retain 404 |
| `/guide-detail.html?id=G329227` | Original article identity unverified; retain 404 |
| `/guide-detail.html?id=G074689` | Original article identity unverified; retain 404 |
| `/tours/10-day-china-scenic-wonders-guilin-zhangjiajie-chengdu` | No matching published itinerary; retain 404 |
| `/rest/v1/homepage_sections?section_key=eq.hero:home&select=content,image_url&limit=1` | API-shaped path on the website origin, not a content page; retain 404 |

The homepage currently embeds an absolute Supabase project URL for its Hero
bootstrap request, not the website origin. No relative REST anchor was found in
the fetched homepage HTML. The checked public destination, tour and guide copy
contained none of the reported old detail paths. This does not establish how the
historical API-shaped URL was discovered. Do not proxy it or redirect it to a
tourism page to clear the report.

## Destination tour lists are still in use

`/tour-destinations?slug=…` and `/tour-destinations?multi=1` are linked from the
current Tours catalog. They list tours, whereas `/destinations/<slug>` describes
a destination. They are not interchangeable legacy detail pages and must not be
redirected to destination articles as part of this repair. Their rendering and
indexing require a separate decision if those lists should appear in search.

## Sitemap and follow-up

The current sitemap generator lists canonical published detail slugs and excludes
the reported legacy paths. Keep it that way; a redirect source should not be
submitted as the preferred URL.

After the PR is merged and Cloudflare Pages deployment succeeds:

1. Check all five source paths return 301 with the expected `Location`.
2. Follow each redirect and confirm a 200 response, matching content and canonical.
3. Check an unmapped old ID and a nonexistent detail slug still return 404.
4. Request indexing for important canonical targets only if needed. Expected
   deleted-page 404s do not have to disappear from Search Console.

The owner has separately checked live self-canonicals for the Xi'an five-day tour
and Yunnan destination, and complete rendered content for Nanjing. Those live
tests and indexing requests do not guarantee subsequent indexing.
