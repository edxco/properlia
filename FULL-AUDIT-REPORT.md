# Properlia.com — Full SEO Audit Report

**Audit Date:** April 9, 2026
**URL:** https://properlia.com
**Stack:** Next.js 16 (App Router) + Ruby on Rails API + Nginx + Cloudflare
**Locales:** `es` (default), `en`

---

## SEO Health Score: 51 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 61 | 15.3 |
| Content Quality | 25% | 54 | 13.5 |
| On-Page SEO | 20% | 50 | 10.0 |
| Schema / Structured Data | 10% | 60 | 6.0 |
| Performance (CWV) | 10% | 48 | 4.8 |
| Images | 5% | 20 | 1.0 |
| AI Search Readiness | 5% | 31 | 1.6 |
| **Total** | | | **52 / 100** |

---

## Top 5 Critical Issues

1. **Property detail pages are fully client-side rendered** — Googlebot receives an empty HTML shell; all visible content loads after JS hydration
2. **Cycling animated H1 with no static fallback** — `TypingAnimation` rotates 4 text values; Google cannot determine a stable primary heading
3. **7.5 MB hero PNG with no `priority` prop** — LCP is estimated at 3–5s; largest above-the-fold asset is not preloaded
4. **No HTTP→HTTPS or www→non-www redirect at Nginx** — duplicate content risk and potential indexing of HTTP URLs
5. **`addressRegion` set twice in property JSON-LD** — city is always silently overwritten by state in every listing's structured data

## Top 5 Quick Wins

1. Add `priority` + `sizes="100vw"` to the hero `<Image>` — 2 lines of code, immediate LCP gain
2. Fix `addressRegion` / `addressLocality` bug in property layout — 1-line fix, repairs structured data on all listings
3. Remove the broken `/services` navigation link — prevents crawl budget waste on a 404
4. Add `x-default` hreflang to `alternates.languages` in `buildMetadata` and `sitemap.ts`
5. Replace `console.log` in `FeaturedProperties.tsx` and move `react-query-devtools` to `devDependencies`

---

## Technical SEO — Score: 61 / 100

### Critical

#### T1. Property detail page is fully client-side rendered
**File:** `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx`

The page is marked `'use client'` and fetches data via `useProperty()` (TanStack Query). Googlebot receives an empty shell. The `layout.tsx` injects JSON-LD and `generateMetadata` server-side, so title/schema are present — but all visible body content (description, specs, price, images) is invisible until JS executes.

**Fix:** Convert `page.tsx` to a Server Component. Call `propertyApi.getById(id)` server-side (already used in `layout.tsx`) and pass data as props to a client sub-component for interactive elements only.

---

#### T2. No HTTP→HTTPS redirect at Nginx
**File:** `nginx/nginx.conf`

The server block listens on both `listen 80` and `listen 443 ssl` with no redirect. `http://properlia.com` serves content directly. If Cloudflare SSL mode is "Flexible," origin traffic is HTTP and the redirect is never enforced end-to-end.

**Fix:** Split into two server blocks — one for port 80 returning `301 https://$host$request_uri`, one for port 443. Set Cloudflare SSL mode to "Full (Strict)."

---

#### T3. No www→non-www redirect
**File:** `nginx/nginx.conf` — `server_name properlia.com www.properlia.com`

Both are served as valid hosts with identical content. Canonical tags point to the non-www version but Googlebot can crawl and index `www.properlia.com` as a separate site.

**Fix:** Add a dedicated server block redirecting `www.properlia.com → https://properlia.com` with a 301.

---

#### T4. Backend robots.txt can conflict with Next.js robots.ts
**File:** `packages/backend/public/robots.txt`

The Rails public directory contains a `robots.txt`. If any Nginx route or misconfiguration serves it at the root domain, it overrides the Next.js-generated `robots.txt`.

**Fix:** Delete the content of `packages/backend/public/robots.txt` or add an explicit comment that it is intentionally empty and must stay empty.

---

### High

#### T5. Missing critical security headers
**File:** `nginx/nginx.conf` — no `add_header` directives present

None of the following are set: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`.

**Fix:** Add a security headers block to the Nginx server block:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

#### T6. Homepage `FeaturedProperties` is client-side rendered, harms LCP
**File:** `packages/frontend/src/components/FeaturedProperties.tsx`

Marked `"use client"`, fetches via `useProperties()`. The largest content block on the homepage loads only after a client-side API call. Includes a `console.log("propertiesData", propertiesData)` on line 16 leaking data shapes in production.

**Fix:** Convert to a Server Component. Fetch 3 featured properties server-side in `page.tsx` and pass as props. Remove the `console.log`.

---

#### T7. Properties listing page fetches 100 items client-side then paginates in browser
**File:** `packages/frontend/app/[locale]/properties/PropertiesClient.tsx` line 50 — `{ items: 100 }`

Causes high LCP (waiting for large payload) and high INP (JS-heavy re-rendering on every filter interaction). Individual property URLs are only discoverable when the client renders each card.

**Fix:** Implement true server-side pagination with URL-based page params (`?page=2`), fetching one page at a time from the API.

---

#### T8. Hero LCP image missing `priority` prop
**File:** `packages/frontend/src/components/Hero.tsx` lines 43–46

```tsx
<Image src={ProperliaBg} alt="" className="..." />
```

Without `priority`, Next.js lazy-loads the above-the-fold hero image. No `<link rel="preload">` is injected. This is the LCP element.

**Fix:** Add `priority` and `sizes="100vw"`:
```tsx
<Image src={ProperliaBg} alt="" priority sizes="100vw" className="..." />
```

---

#### T9. Sitemap `lastModified` always resolves to current timestamp for static routes
**File:** `packages/frontend/app/sitemap.ts` lines 63–75

```ts
lastModified: new Date(), // fires at every request
```

Google uses `lastmod` as a freshness signal. Constant timestamp changes make Google distrust the signal entirely.

**Fix:** Replace with a hardcoded ISO date matching when the page last changed meaningfully:
```ts
lastModified: new Date("2026-01-15"),
```

---

#### T10. Missing `x-default` hreflang
**File:** `packages/frontend/src/lib/metadata.ts` and `app/sitemap.ts`

No `x-default` hreflang entry in the `alternates.languages` map. Google cannot determine the fallback URL for unsupported languages.

**Fix:**
```ts
alternates: {
  languages: {
    es: `${BASE_URL}/es${cleanPath}`,
    en: `${BASE_URL}/en${cleanPath}`,
    "x-default": `${BASE_URL}/es${cleanPath}`,
  },
},
```

---

### Medium

#### T11. `/services` navigation link leads to 404
**File:** `packages/frontend/src/components/Navigation.tsx` lines 54, 98

Both desktop and mobile nav link to `/${locale}/services`. No `app/[locale]/services/page.tsx` exists.

**Fix:** Remove the link from the nav until the page is created, or redirect it to `/properties`.

---

#### T12. `next.config.js` has placeholder image domain
**File:** `packages/frontend/next.config.js` lines 22–27 — `hostname: 'your-domain.com'`

The placeholder is still present. Production images from `properlia.com/rails/active_storage/...` may not be optimized by `next/image`.

**Fix:** Replace the placeholder with the actual production hostname(s).

---

#### T13. No Open Graph or Twitter Card meta tags
**File:** `packages/frontend/src/lib/metadata.ts`

`buildMetadata` returns only `title`, `description`, `alternates`. Social shares produce unfurled cards with no image or description.

**Fix:** Add `openGraph` and `twitter` fields to `buildMetadata`. Use the first property image as OG image on listing pages.

---

#### T14. Google Analytics ID has no build-time warning when undefined
**File:** `packages/shared/src/components/GoogleAnalytics.tsx`

If `NEXT_PUBLIC_GA_ID` is unset, the component returns `null` silently. No analytics data is collected without any visible error.

**Fix:** Add `console.warn` in development when `gaId` is undefined.

---

### Low

- **T15.** Crawler locale always defaults to `es` — confirm this is intentional (Googlebot does not persist cookies or send predictable `Accept-Language`)
- **T16.** `changeFrequency` values undermined by dynamic `lastModified` (they compound each other)
- **T17.** Commented-out JSX in `Hero.tsx` (lines 74–116, 142–164) — code debt, remove or put behind feature flag

---

## Content Quality — Score: 54 / 100

### E-E-A-T Assessment

| Factor | Score | Assessment |
|--------|-------|------------|
| Experience | 28/100 | No first-hand signals, agent bios, case studies, or transaction narratives |
| Expertise | 45/100 | Market data language exists but no credentials, licenses, or named advisors |
| Authoritativeness | 38/100 | No external citations, press mentions, or industry affiliations |
| Trustworthiness | 62/100 | Physical address + schema present; WhatsApp/email in footer; Terms/Privacy pages exist |
| **Composite** | **45/100** | |

### AI Citation Readiness: 31 / 100

Almost no passage-level content an AI model or featured snippet could cite. All user-facing copy lives in JSON translation files as short strings — no body paragraphs, no structured Q&A, no statistics with sources.

---

### Critical

#### C1. Animated H1 with no static fallback
**File:** `packages/frontend/src/components/Hero.tsx` lines 54–64

`TypingAnimation` cycles through four H1 values. Google needs a single, stable, descriptive H1. A cycling H1 is both a crawlability problem and a signal quality problem.

**Fix:** Set a static H1 (`<h1>Inmobiliaria en Puebla — Encuentra tu Propiedad Ideal</h1>`). Move the animation into a decorative `<span>` or `<p>` below the H1.

---

#### C2. Properties listing page has no H1 and ~80 words of static text
**File:** `packages/frontend/app/[locale]/properties/PropertiesClient.tsx`

No H1 exists. The only static text is two Banner components (~60 words combined). The minimum for a listing page is ~800 words.

**Fix:** Add a server-rendered introduction block with an H1, 2–3 sentences about the listings, and internal links to category-filtered pages.

---

#### C3. `/services` nav link is a dead link
See T11 above — dead nav link harms UX and crawl budget.

---

### High

#### C4. No About page — significant E-E-A-T gap
No `app/[locale]/about/page.tsx` exists. `MainAbout` on the homepage is a single paragraph. For a YMYL-adjacent real estate service, absence of team credentials is a critical trust signal gap.

**Fix:** Create `/es/about` and `/en/about` with team information, professional credentials (AMPI membership if applicable), founding story, and methodology behind the "200 operaciones" claim.

---

#### C5. Homepage under 500 words
Estimated ~320 words of visible, crawlable static text. Below the 500-word floor for homepages.

**Fix:** Expand `MainAbout` content, add a brief "Puebla Real Estate Market" explainer (3–5 sentences with a stat), and add section headings to `FeaturedProperties`.

---

#### C6. Contact information conditionally rendered — trust signal at risk
**File:** `packages/frontend/src/components/Footer.tsx`

WhatsApp, phone, and email render only if the `generalInfo` API call succeeds. If the API is down, the footer contact section is empty.

**Fix:** Add hardcoded fallback contact values for the footer so critical trust signals are always visible.

---

#### C7. `sameAs` is an empty array in organization schema
**File:** `packages/frontend/app/[locale]/layout.tsx` line 40 — `sameAs: []`

Provides no entity disambiguation. Footer already loads LinkedIn, Instagram, Facebook, TikTok URLs from `generalInfo`.

**Fix:** Populate `sameAs` with actual social profile URLs from the `generalInfo` API call in the layout's server fetch.

---

### Medium

- **C8.** No testimonials or social proof beyond "+200 operaciones" — insufficient for YMYL-adjacent conversion
- **C9.** Investment claims ("8-12% annual returns", "sell in 90 days") lack any supporting data, source, or methodology note
- **C10.** No neighborhood/colonia content — zero indexed content for high-intent queries like "casas en venta en Angelópolis"
- **C11.** `FeaturedProperties` has no section heading and no "view all" link to `/properties`
- **C12.** `en.json` has untranslated keys: `"contactMe": "contactar"` and `"hi": "hola"`
- **C13.** Title tags are 70–72 characters — trim by ~10 characters for safe SERP display

---

## Schema / Structured Data — Score: 60 / 100

### Critical

#### S1. `addressRegion` assigned twice in property JSON-LD — city always lost
**File:** `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx` lines 38–39

```ts
...(property.city && { addressRegion: property.city }),   // line 38 — wrong key
...(property.state && { addressRegion: property.state }), // line 39 — overwrites line 38
```

City is always dropped from every listing's structured data. Google's validator will flag the address as malformed.

**Fix:**
```ts
...(property.neighborhood && { addressLocality: property.neighborhood }),
...(property.city && { addressLocality: property.city }),  // city → addressLocality
...(property.state && { addressRegion: property.state }),  // state → addressRegion
```

---

### High

#### S2. No `potentialAction` / SearchAction on WebSite schema
**File:** `packages/frontend/app/[locale]/layout.tsx`

The site has a hero search bar routing to `/properties?search=`. Without `SearchAction`, Google cannot offer a Sitelinks Search Box in SERPs.

**Fix:** Add to the `WebSite` block:
```json
"potentialAction": {
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://properlia.com/es/properties?search={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
```

#### S3. `areaServed` uses invalid `@type: "State"`
**File:** `packages/frontend/app/[locale]/layout.tsx`

`"State"` is not a Schema.org type.

**Fix:** Use `"@type": "AdministrativeArea"`.

---

### Medium

- **S4.** No `BreadcrumbList` JSON-LD despite visual breadcrumbs on property pages — visual-only breadcrumbs produce no rich results
- **S5.** Missing `telephone` and `email` on `RealEstateAgent` — required for Local Business knowledge panel
- **S6.** `logo` value is a plain string — Google prefers `ImageObject` with `width`/`height`
- **S7.** `land_area` field exists on Property type but is not included in `RealEstateListing` schema

### Low

- **S8.** No `ItemList` schema on the properties listing page (`/properties`) for collection indexability

---

## Performance / Core Web Vitals — Score: 48 / 100

### Estimated CWV

| Metric | Estimated | Status |
|--------|-----------|--------|
| LCP | 3.0–5.0s | Needs Improvement |
| INP | 200–400ms | Needs Improvement |
| CLS | 0.05–0.15 | Borderline |
| TTFB | +1 redirect round-trip | Degraded |

---

### Critical

#### P1. 7.5 MB hero PNG source asset
**File:** `packages/frontend/public/properlia-bg.png`

The largest asset on the site by far. Even with Next.js image optimization, a 7.5 MB source causes slow optimization on cold CDN nodes and inflates all responsive variants.

**Fix:** Replace with a pre-compressed WebP at 1920px wide, targeting ≤200 KB. Add `priority` and `sizes="100vw"` to the `<Image>` component.

---

#### P2. `TypingAnimation` runs an infinite `setTimeout` loop on the main thread
**File:** `packages/frontend/components/ui/typing-animation.tsx`

Framer Motion (~31 KB gzipped) powers a character-by-character animation with `loop: true`. This fires chained `setTimeout` callbacks indefinitely, each triggering a React state update — directly competing with user interactions and raising INP.

**Fix:** Replace with a CSS `@keyframes` animation or a lightweight custom implementation using `requestAnimationFrame`. Remove the `motion` dependency if it's only used here.

---

#### P3. Hero component is `"use client"` — entire above-the-fold area requires hydration before paint
**File:** `packages/frontend/src/components/Hero.tsx`

`useState` + `useRouter` forces the entire hero into a client bundle. React hydration must complete before the LCP image container paints. On mid-range mobile this adds 300–800ms.

**Fix:** Extract only the interactive search bar into a client sub-component. Keep the Hero wrapper as a Server Component.

---

### High

#### P4. Google Fonts loaded via CSS `@import` — render-blocking chain
**File:** `packages/shared/src/styles/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Poppins:wght@200;400;500;700;800;900&display=swap');
```

CSS `@import` blocks rendering. 6 Poppins weights + Lexend variable font = large font payload. No `<link rel="preconnect">` hints in the layout head.

**Fix:** Replace with `next/font/google`:
```tsx
import { Poppins, Lexend } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '700'] });
const lexend = Lexend({ subsets: ['latin'] });
```

This self-hosts fonts, adds preload automatically, eliminates the cross-origin request chain, and eliminates FOUT.

---

#### P5. `FeaturedProperties` loading state collapses then expands — causes CLS
**File:** `packages/frontend/src/components/FeaturedProperties.tsx`

Loading state renders a small text block; loaded state expands to a full 3-column grid. Height change after paint = layout shift.

**Fix:** Reserve height with a skeleton grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1,2,3].map(i => <div key={i} className="h-96 bg-stone-100 rounded-lg animate-pulse" />)}
</div>
```

---

#### P6. Middleware locale redirect adds one full round-trip to every root visit
**File:** `packages/frontend/middleware.ts`

Every visit to `https://properlia.com` triggers middleware and issues a `307 redirect` to `/es` or `/en`, adding 50–200ms before any HTML is served.

**Fix:** For the root `/` → `/es` case, use `next.config.js` `redirects` with `permanent: true` so CDNs can cache the redirect for repeat visitors.

---

### Medium

- **P7.** `useGeneralInfo` called per `PropertyCard` instance — lift to parent `FeaturedProperties` and pass as props
- **P8.** No `Cache-Control` headers configured in `next.config.js` for HTML pages
- **P9.** Navigation logo `<Image>` missing `height` prop (fragile CLS)
- **P10.** `@tanstack/react-query-devtools` in `dependencies` instead of `devDependencies`

---

## Sitemap — Score: 65 / 100

### Summary

Sitemap is generated correctly via Next.js App Router (`app/sitemap.ts`). Format is valid. Declared in `robots.ts`. Key issues:

| Finding | Severity |
|---------|----------|
| `lastModified: new Date()` on static routes — false freshness | Medium |
| Missing `x-default` in `alternates.languages` | Medium |
| `priority` and `changeFrequency` present — Google ignores both | Low |
| No `/about` or `/contact` pages (they don't exist yet) | Medium |
| Sitemap index not needed at current scale; plan for 25k+ properties | Info |

---

## Images — Score: 20 / 100

| Asset | Size | Issue |
|-------|------|-------|
| `public/properlia-bg.png` | 7.5 MB | Replace with WebP ≤200 KB |
| `public/properlia.png` (logo) | 65 KB | Acceptable; WebP saves ~50% |
| Hero `<Image>` | — | Missing `priority`, `sizes`, `alt` should be descriptive or truly decorative |

Most property images are loaded from the Rails backend (Active Storage). The `next.config.js` placeholder hostname (`your-domain.com`) means these may not be served via the Next.js image optimizer.

---

## AI Search Readiness — Score: 31 / 100

| Check | Status |
|-------|--------|
| Passage-level citability | Fail — no quotable body paragraphs |
| Structured Q&A / FAQ content | Fail — none present |
| Statistic claims with sources | Fail — claims exist but no sources |
| Author / expert attribution | Fail — no named advisors |
| `llms.txt` | Fail — not implemented |
| Brand mention signals | Partial — social profiles exist but `sameAs` is empty |
| AI crawler accessibility | Pass — no blocking rules in robots.txt |

**Recommended content additions for AI citation readiness:**
1. A "How It Works" section on buyer/seller consultation pages (3–5 steps with prose)
2. A "Puebla Real Estate Market" explainer on the homepage with sourced statistics
3. FAQ sections on buyer/seller pages with Schema.org `FAQPage` markup
4. Named agent profiles on an About page

---

## Relevant Files Index

| File | Issues |
|------|--------|
| `nginx/nginx.conf` | T2, T3, T5 |
| `packages/frontend/app/robots.ts` | (correct) |
| `packages/frontend/app/sitemap.ts` | T9, T10, sitemap lastModified |
| `packages/frontend/app/[locale]/layout.tsx` | S2, S3, S7, C7 |
| `packages/frontend/app/[locale]/page.tsx` | (Server Component — correct) |
| `packages/frontend/app/[locale]/properties/PropertiesClient.tsx` | T7, C2 |
| `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx` | T1, C3 |
| `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx` | S1, S4 |
| `packages/frontend/src/lib/metadata.ts` | T10, T13 |
| `packages/frontend/src/components/Hero.tsx` | T8, C1, P1, P3 |
| `packages/frontend/src/components/FeaturedProperties.tsx` | T6, C11, P5 |
| `packages/frontend/src/components/Navigation.tsx` | T11, C3 |
| `packages/frontend/src/components/MainAbout.tsx` | C4, C5 |
| `packages/frontend/components/ui/typing-animation.tsx` | P2 |
| `packages/frontend/next.config.js` | T12, P8 |
| `packages/frontend/public/properlia-bg.png` | P1 |
| `packages/shared/src/styles/globals.css` | P4 |
| `packages/shared/src/messages/en.json` | C12 |
| `packages/backend/public/robots.txt` | T4 |
