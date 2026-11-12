# Content expansion after the home redesign: services + About, zones, blog, testimonials

## Context
The 5-PR home redesign is delivered (PRs #10–#14). It left four items as "alternative plans" because they need new pages or data: individual **service pages + About** (C), **zone pages** (A), **blog/guides** (B) and **testimonials** (D). The home already promises all of them and several links are placeholders: `HomeServices` links the investor service to `/servicios`, `HomeInsights` has 4 cards with no links, `HomeZones` only links to listing pages, `HomeAbout` has no About page, and `HomeReviews` shows 3 hardcoded Google reviews (`homeContent.ts`). Goal: give Google and users real destination pages for the target queries (*inmobiliaria en Puebla/Cholula, asesores inmobiliarios en Puebla, venta de casas en Puebla*, zone and guide searches) without cannibalizing the existing listing pages.

## Decisions (from the user)
1. **Content location: hybrid.** Services, zones and About live in the repo (typed content files). Blog and testimonials live in the backend and are edited in the dashboard (admin/staff).
2. **Zones: editorial pages with no backend change.** Six `/zonas/{slug}` pages (Puebla, San Andrés Cholula, San Pedro Cholula, Cuautlancingo, Lomas de Angelópolis, Tlaxcalancingo). Lomas and Tlaxcalancingo are **not** added as cities: that would be geographically inexact (Tlaxcalancingo is a locality of San Andrés Cholula, Lomas a subdivision), split inventory between city pages and leave them `noindex` below `MIN_INDEXABLE_LISTINGS` (3). Properties are linked by `neighborhood` aliases (approximate, free text); a `zones` table is a later option.
3. **Order: C → A → B → D.**
4. **Languages: Spanish and English** for every new page (slug per locale, hreflang, translated copy).

## Delivery workflow (same as the home redesign)
- One PR at a time on its own branch off updated `main`; after opening a PR, **stop** and wait for the user to say it is merged; never start the next one on my own.
- Commits: conventional, one line, **no Claude co-author lines** (project rule). Verify real state with `gh pr list` / `git log` on resume.
- Progress tracker saved in memory (`content-expansion-progress`) and updated at every state change; branch names `content/<id>-<slug>`.
- Copy: I draft es/en from existing site copy; the user reviews it in each PR. **Never reuse unverified claims** ("90 días", "8-12% anual", "+200 operaciones") and never invent statistics, credentials or team data.

| PR | Scope | Stack |
|---|---|---|
| C1 | Content foundation + About page | frontend |
| C2 | 3 service pages + `/servicios` hub | frontend |
| A1 | Zone content, `/zonas` hub + 6 zone pages | frontend |
| A2 | Home/footer wiring, sitemap, `areaServed` links | frontend |
| B1 | `posts` model + public/admin API | backend |
| B2 | Posts section in the dashboard (Tiptap) | dashboard + shared |
| B3 | `/blog` index + article pages | frontend |
| B4 | First 4 pillar guides + home links | content |
| D1 | `testimonials` model + API + seed of the 3 Google reviews | backend |
| D2 | Dashboard CRUD + home/service/zone reviews from the API | dashboard + frontend |

## Shared foundation (built in C1, reused by every later PR)
- **Routes** (`packages/shared/src/lib/routes.ts` → `ROUTES`): add `about` (`nosotros` / `about`), `zones` (`zonas` / `areas`), `blog` (`blog` / `blog`); service children live under the existing `services` route (`/servicios/{slug}`, `/en/services/{slug}`). Also add these segments to the backend reserved-slug list so no state/city/property slug can collide.
- **Per-locale slugs for dynamic pages:** extend `frontend/proxy.ts` with a content branch modeled on `resolveProperties` (slug lookup in a content index → 301 wrong-locale/old slug to the canonical one in one hop). The language switcher already relies on that 301 (`switchLocalePath` only translates fixed segments). For repo content the index is a static import; for blog it is read from `public_paths` via `src/lib/pathIndex.ts` (5-min TTL + `invalidatePathIndex`).
- **Content layer:** `packages/frontend/content/{about,services,zones}.ts` with a typed schema (bilingual title, description, slug, sections of heading/paragraphs/list, FAQ items, related links, updatedAt). No MDX dependency needed for these structured pages. Access through `getService(slug, locale)`-style functions so a backend swap later does not touch the pages.
- **SEO plumbing to extend:** `buildMetadata` (`src/lib/metadata.ts`) gets optional `image`, `type: "article"`, `publishedTime/modifiedTime`, `noindex`; `src/lib/sitemap.ts` gets `contentEntries()` (+ line in `app/sitemap.xml/route.ts` and a branch in `app/sitemaps/[name]/route.ts`); `src/lib/structuredData.ts` / `jsonLd.tsx` get `Service`, `AboutPage`, `Place`, `BlogPosting` builders (export `ORGANIZATION_ID` and reference it as provider/publisher; reuse `breadcrumbJsonLd`, `faqJsonLd`, `itemListJsonLd`, `JsonLdScripts`). Update the HTML sitemap page (`app/[locale]/sitemap/page.tsx`).
- **UI:** build with `Section`, `Container`, `PageTitle`, `SectionTitle`, `Card`, `Eyebrow`, `buttonClasses`, `Breadcrumbs`, `SectionHeader`/`SplitLayout`, `TextLink`. Extract two reusable pieces from the home: `FaqList` (from `HomeInsights`) and `CtaPanel` (from `HomeCta`). Each page type gets distinct compositions (no repeated template), per the earlier design feedback; brand rules unchanged (Playfair 500, Inter 400/500, gold only for prices, `lining-nums` on Playfair counters).
- **Tests:** frontend has no runner; add **Vitest** in C1 for the pure logic (content slug resolution, `switchLocalePath` with content slugs, sitemap entries). Backend uses RSpec (`spec/models`, `spec/requests`, factories); dashboard already has Vitest.

## C — Services + About (frontend, 2 PRs)
**C1 `content/c1-foundation-about`:** foundation above + `/nosotros` (`/en/about`). Sections: who we are, approach (process from `HomeAbout`), Keller Williams affiliation (only wording already approved), zones served, link to reviews, CTA. Fills the `sameAs`/About gap noted in the audit; `AboutPage` JSON-LD. Team/credentials sections render **only with real data** supplied by the user. `HomeAbout` CTA points to `/nosotros`.
**C2 `content/c2-services`:** three pages with distinct, longer content: `/servicios/compra-y-venta`, `/servicios/asesoria-para-inversionistas`, `/servicios/comercializacion-de-inmuebles` (proposed slugs, en equivalents; confirm in review). Each: intro, who it is for, step-by-step, what is included, FAQ (+`FAQPage`), `Service` JSON-LD (provider = organization, `areaServed` = zones), breadcrumbs, related links, CTA. `/servicios` becomes a hub: H1 "Servicios Inmobiliarios en Puebla" (audit M2), links to the three pages, keeps the 5 existing blocks as "how we work". Avoid duplicating `sellerMethod*`/`buyerBenefit*` copy of the consultation pages (those stay form-first and link to the services). `HomeServices` links updated (investor card no longer points to the hub).

## A — Zones (frontend, 2 PRs)
**A1 `content/a1-zones`:** `content/zones.ts` with six zones: slug (es/en), name, summary, sections (about the area, property types, who it suits), FAQ, `cityRef` (city slug when it exists, for the geo link), `neighborhoodAliases`. Facts must be verifiable; unknown facts are left out or flagged for the user, not invented. Reuses the unused `homeZone*` keys as card summaries. Pages: `/zonas` hub (6 zone cards) and `/zonas/{slug}` with H1 "Inmobiliaria en {zona}", editorial content, a listings block (use the properties API `neighborhood` param if it does case-insensitive matching, otherwise filter `getPublicPropertiesPool()` by normalized aliases; verify in `properties_controller.rb` while implementing), link to the geo listing page when a city exists, related zones, FAQ, CTA; empty state with CTA when there are no listings. JSON-LD: `Place`/`City`, `FAQPage`, breadcrumbs, `ItemList` when listings exist. Titles/H1 stay distinct from geo pages (zone = "inmobiliaria/zona", geo = "propiedades en venta") and each links to the other to prevent cannibalization. Zone pages are always indexable (they stand on editorial content, ≥ ~500 words each).
**A2 `content/a2-zone-wiring`:** `homeZones()` and `HomeZones` link to the zone pages (keep the listing links), footer zone links, sitemap + HTML sitemap entries, `AREA_SERVED` in `structuredData.ts` derived from zones content with links to zone pages.

## B — Blog / guides (backend + dashboard + frontend, 4 PRs)
**B1 `content/b1-posts-backend`:** `posts` (uuid, timestamps): `title`/`title_en`, `slug`/`slug_en`/`previous_slugs` (reuse the `PublicSlugs` concern, adapting `assign_slugs` to `title`), `excerpt`/`excerpt_en`, `body`/`body_en` (HTML sanitized server-side, headings limited to h2/h3), `category` (guide-buy, tips-sell, investment, market), `status` (draft/published), `published_at`, `author_name`, `has_one_attached :cover_image` + bilingual `cover_alt`. API: public `index`/`show` for published posts (pagy, same `{data, metadata}` shape), writes with `authorize_any!(:admin, :staff)` (do not copy the open-write controllers), posts added to `public_paths`, `after_commit` revalidation with a new `posts` tag (add to `ALLOWED_TAGS` in `app/api/revalidate/route.ts`, and call `invalidatePathIndex`). RSpec: model (slugs, validations), requests (public vs admin), `public_paths`.
**B2 `content/b2-posts-dashboard`:** new "Blog" section: shared `services/posts/api.ts` + types, dashboard `services/posts/queries.ts`, list + create/edit pages, Tiptap editor (already installed; add heading/link extensions and a toolbar based on `EditorToolbar.tsx`), cover upload (reuse the WebP→PNG conversion logic extracted from `PropertyForm`), es/en tabs, publish toggle, nav entry, i18n keys. v1 has no inline images (cover only).
**B3 `content/b3-blog-frontend`:** `/blog` index (category links crawlable, pagination), `/blog/{slug}` article page (styled `ArticleBody` with brand tokens, byline, dates, related posts, CTA), proxy slug 301, `buildMetadata` as article (`BlogPosting` + breadcrumbs JSON-LD), fetch with the `posts` cache tag, sitemap entries (`blog.xml`).
**B4 `content/b4-first-guides`:** the 4 pillar guides matching `HomeInsights` (buy, sell, invest in Puebla, local market) drafted es/en, loaded through the dashboard or a seed script; `HomeInsights` cards link to them; footer/HTML sitemap links. Author byline is "Equipo Properlia" unless the user provides a named author.

## D — Testimonials (backend + dashboard + frontend, 2 PRs)
**D1 `content/d1-testimonials-backend`:** `testimonials`: `author_name`, `author_detail` (optional), `body` + `body_en` (nullable, translation), `original_locale`, `rating` 1–5, `source` (google/direct), `source_url`, `reviewed_on` (nullable date; the 3 existing reviews only say "hace un año"), `featured`, `position`, `published`. Public `index` (published only, tagged `testimonials`), admin/staff writes, RSpec. Data migration/seed loads the 3 Google reviews verbatim (Marco A Velázquez-Albo, Gabriela Rodríguez, Adriana Guadalupe Gomez Espinosa, 5 stars each) so nothing is lost when the home switches source.
**D2 `content/d2-testimonials-ui`:** dashboard CRUD (reorder, feature, publish). `HomeReviews` reads the API server-side and falls back to `HOME_REVIEWS` if the API fails or returns nothing; optionally show 1–2 relevant testimonials on service and zone pages. The "Ver reseñas en Google" button stays. **No `Review`/`AggregateRating` JSON-LD** (Google ignores self-serving markup).

## Inputs needed from the user (non-blocking, asked in each PR)
Confirm service page slugs; factual zone information and any local data worth citing; About content (team, years, credentials, photos) and the exact Keller Williams/KW México wording; author byline for the blog; review of English copy; real dates for testimonials if available; real photos (office, team, zones) for About, zones and CTA.

## Risks
- **Thin or duplicated content:** each service/zone page needs its own sections and ≥ ~500 words; check titles/H1/meta uniqueness across pages.
- **Cannibalization** between `/zonas/{slug}` and `/{estado}/{ciudad}`: distinct intent and titles, cross-links, one canonical each.
- **Slug collisions** with state/city/property slugs: reserved list on the backend + `ROUTES` registration.
- **Stale path index:** new posts must trigger revalidation and `invalidatePathIndex` or the proxy will 404/redirect wrongly for up to 5 minutes.
- **Sitemap discipline:** only indexable URLs, with es/en alternates; no draft posts.
- **Unverified claims** from older copy must not propagate.

## Verification (every PR, adapted to its scope)
1. `tsc --noEmit` (frontend/dashboard), `rspec` for backend PRs, Vitest for the new pure logic; lint clean.
2. `curl`: new URLs return 200 in es and en; wrong-locale or old slugs 301 in one hop; unknown slugs 404; canonical/hreflang/x-default correct; no accidental `noindex`.
3. Parse the rendered JSON-LD (script as used for the home): valid JSON, no unresolved `@id`, FAQ/Breadcrumb text equals visible text, no review markup.
4. Sitemap: `/sitemap.xml` index and the new file list the new URLs with alternates; HTML sitemap updated.
5. Internal links: every new page reachable within 2 clicks from the home; no dead links on the home or footer.
6. Screenshots at 1280 px and 390 px for each new page; keyboard navigation and contrast spot checks.
7. Backend/dashboard PRs: create/edit/publish a record from the dashboard, confirm the public API and the frontend revalidation, and confirm a non-admin user cannot write.
8. After deploy: submit the sitemap and request indexing for the hub pages in Search Console; run Rich Results Test; measure LCP/CLS/INP on the new templates.
