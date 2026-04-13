# Properlia.com — Full SEO Audit Report

**Audit Date:** April 2026
**URL:** https://properlia.com
**Stack:** Next.js (App Router) + Ruby on Rails API + Nginx + Cloudflare
**Locales:** `es` (default), `en`
**Method:** Full codebase review — all pages, components, configs, nginx, schemas

---

## SEO Health Score: 63 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 72 | 18.0 |
| Content Quality | 25% | 52 | 13.0 |
| On-Page SEO | 20% | 65 | 13.0 |
| Schema / Structured Data | 10% | 68 | 6.8 |
| Performance (CWV) | 10% | 70 | 7.0 |
| Images | 5% | 78 | 3.9 |
| AI Search Readiness | 5% | 35 | 1.75 |
| **Total** | | | **63 / 100** |

---

## What Has Improved Since Last Audit

The previous audit (April 9, 2026, score: 52/100) identified several issues that have since been fixed:

| Fix | File |
|-----|------|
| Hero image replaced with WebP, `priority` and `sizes="100vw"` added | `Hero.tsx` |
| Security headers added to Nginx (HSTS, X-Content-Type-Options, etc.) | `nginx.conf` |
| HTTP→HTTPS redirect configured in Nginx | `nginx.conf` |
| www→non-www redirect configured | `nginx.conf` |
| `x-default` hreflang added to `buildMetadata` and sitemap | `metadata.ts`, `sitemap.ts` |
| Property schema `addressLocality`/`addressRegion` bug fixed | `[slug]/layout.tsx` |
| Property JSON-LD now rendered server-side | `[slug]/layout.tsx` |
| Dynamic sitemap with hreflang alternates | `sitemap.ts` |

---

## Top 5 Critical Issues

1. **Property detail page is fully client-side** — body content is invisible to crawlers on first HTML load
2. **Hero H1 cycles through 4 phrases via TypingAnimation** — no stable keyword target for the homepage
3. **Nav links to `/services`** → 404 on every page
4. **Footer `/sell` link** → 404 (correct URL is `/seller-consultation`)
5. **Footer `/terms`, `/privacy`, `/sitemap` links** → all 404 (pages do not exist)

## Top 5 Quick Wins

1. Fix nav `/services` link — either remove it or redirect to `/properties`
2. Fix footer `/sell` → `/seller-consultation`
3. Add OG metadata to `buildMetadata()` — one change covers all pages
4. Replace H1 `TypingAnimation` with a static phrase; move animation to a `<p>` below
5. Remove `console.log("propertiesData", ...)` from `FeaturedProperties.tsx`

---

## 1. Technical SEO — Score: 72 / 100

### 1.1 Crawlability

| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | ✅ | Allows all, disallows `/api/`. Declared in robots.ts |
| Sitemap | ✅ | Dynamic at `/sitemap.xml`. Static + all properties, hreflang alternates |
| HTTP→HTTPS (properlia.com) | ✅ | Nginx `return 301 https://properlia.com$request_uri` |
| www→non-www | ✅ | Dedicated server block with 301 |
| Broken nav link: `/services` | ❌ | `Navigation.tsx:54` — page does not exist |
| Broken footer link: `/sell` | ❌ | `Footer.tsx:178` — should be `/seller-consultation` |
| Broken footer link: `/terms` | ❌ | `Footer.tsx:260` — no page exists |
| Broken footer link: `/privacy` | ❌ | `Footer.tsx:266` — no page exists |
| Broken footer link: `/sitemap` | ❌ | `Footer.tsx:272` — no HTML sitemap page; only XML at `/sitemap.xml` |
| Dashboard HTTP redirect | ⚠️ | `dashboard.properlia.com` listens on port 80 without HTTPS redirect |

### 1.2 Indexability

| Check | Status | Notes |
|-------|--------|-------|
| Canonical tags | ✅ | Set via `buildMetadata()` for all pages |
| Hreflang `es`/`en` | ✅ | Both metadata and sitemap |
| Hreflang `x-default` | ✅ | Points to `/es/...` |
| Meta robots | ✅ | No noindex directives found |
| **Property detail page CSR** | ❌ CRITICAL | Full client-side render — no body content in first HTML |

**Property pages CSR issue — `app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx:1`**

The page is marked `'use client'` and fetches via `useProperty()`. Googlebot receives an HTML shell. The server-side `layout.tsx` correctly injects JSON-LD and metadata — but all visible content (title, price, description, specs, images) only appears after JS hydration. Googlebot may or may not execute the fetch.

**Fix:** Convert `page.tsx` to a Server Component. `propertyApi.getById(id)` is already used in `layout.tsx` — reuse it and pass data down. Only the locale-aware router interactions need to stay client-side.

### 1.3 Security Headers

| Header | Status | Notes |
|--------|--------|-------|
| `Strict-Transport-Security` | ✅ | Set in nginx properlia.com block |
| `X-Content-Type-Options` | ✅ | Set |
| `X-Frame-Options` | ✅ | Set |
| `Referrer-Policy` | ✅ | Set |
| `Permissions-Policy` | ✅ | Set |
| `Content-Security-Policy` | ❌ | Missing — relevant for XSS mitigation |
| Headers on subdomains | ⚠️ | Dashboard, links, api subdomains have no security headers |

### 1.4 URL Structure

| Check | Status |
|-------|--------|
| Locale prefix | ✅ `/es/...` and `/en/...` |
| Property URL depth | ⚠️ 5 levels: `/[locale]/properties/[state]/[city]/[id]/[slug]` |
| Slug generation | ✅ `slugify()` from title |
| Consistent canonical chain | ✅ Canonical → canonical in metadata |

### 1.5 Image Configuration

`next.config.js` still has a placeholder image domain:
```js
{ hostname: 'your-domain.com' }  // placeholder never updated
```
Property images served from the Rails backend (`/rails/active_storage/...`) may not be covered. If the production host is not in `remotePatterns`, `<Image>` falls back to unoptimized rendering.

---

## 2. Content Quality — Score: 52 / 100

### 2.1 Page-by-Page Assessment

| Page | Static Words | Heading Structure | Notes |
|------|-------------|-------------------|-------|
| Homepage | ~320 | H1 (animated), H2 (MainAbout) | Below 500-word floor; H1 unstable |
| `/properties` | ~60 | None | Client-rendered; near zero static content |
| `/buyer-consultation` | ~200 | H2 (page title) | Form-heavy; thin for SEO |
| `/seller-consultation` | ~200 | H2 (page title) | Form-heavy; thin for SEO |
| Property detail | 0 (CSR) | Depends on JS | No static crawlable content |

### 2.2 E-E-A-T Signals

| Signal | Status |
|--------|--------|
| Physical address | ✅ Footer hardcoded + schema |
| Contact info | ⚠️ Footer is API-dependent (absent if API fails) |
| "+200 deals closed" claim | ⚠️ Present but unverified, no source |
| Agent profiles / bios | ❌ Missing |
| Testimonials / reviews | ❌ Missing |
| Professional credentials | ❌ Missing |
| External citations | ❌ None |
| About page | ❌ No `/about` page exists |
| Social media links | ⚠️ In footer but `sameAs` in schema is empty array |

### 2.3 Heading Hierarchy (Homepage)

```
H1: [TypingAnimation — unstable]
  H2: "Buying, selling, and investing in Puebla properties…" (MainAbout)
  H3: "LOOKING TO BUY" / "LOOKING TO SELL" / "LOOKING TO INVEST" (ServiceTiles — no H2 parent)
  [FeaturedProperties — NO heading at all]
```

Issues:
- H1 is animated and keyword-unstable
- FeaturedProperties section has no heading
- ServiceTiles H3s have no H2 parent

### 2.4 Translation Issues

| Key | File | Issue |
|-----|------|-------|
| `"contactMe": "contactar"` | `en.json:80` | Spanish value in English file |
| `"propertyDetails": ""` | `en.json:105` | Empty string |
| `"hi": "hola"` | `en.json:10` | Test data / Spanish in English file |
| `"modernApartmentInLomas"` | `en.json:16` | Appears to be test data |

---

## 3. On-Page SEO — Score: 65 / 100

### 3.1 Title Tags

| Page | Title |
|------|-------|
| Homepage EN | `Properlia \| Real Estate in Puebla — Houses, Apartments & Investments` |
| Properties EN | `Properties for Sale in Puebla \| Properlia` |
| Buyer Consultation EN | `Buyer Consultation \| Properlia Puebla` |
| Seller Consultation EN | `Sell Your Property in Puebla \| Properlia` |
| Property Detail | `{property.title} \| Properlia` |

All well-formed. Character lengths are borderline (~65–72 chars) — monitor for truncation in SERPs.

### 3.2 Meta Descriptions

All pages have distinct, keyword-rich descriptions via `buildMetadata()`. Property detail uses `property.description.slice(0, 160)`. Good.

### 3.3 Missing: OpenGraph / Twitter Cards

`buildMetadata()` in `src/lib/metadata.ts` returns only `title`, `description`, `alternates`. No `openGraph` or `twitter` objects. All pages share to social media with no image, no proper title tag, and no description in unfurl previews.

**Fix:** Extend `buildMetadata()`:
```ts
openGraph: {
  title: dict[titleKey],
  description: dict[descriptionKey],
  url: `${BASE_URL}/${normalizedLocale}${cleanPath}`,
  siteName: "Properlia",
  locale: normalizedLocale === "es" ? "es_MX" : "en_US",
  type: "website",
  images: [{ url: `${BASE_URL}/properlia.png`, width: 1200, height: 630 }],
},
twitter: { card: "summary_large_image" },
```
On property pages, override `images` with the first property photo.

### 3.4 Broken Internal Links

| Link | Location | Issue |
|------|----------|-------|
| `/${locale}/services` | `Navigation.tsx:54,98` | No page |
| `/${locale}/sell` | `Footer.tsx:178` | Should be `/seller-consultation` |
| `/${locale}/terms` | `Footer.tsx:260` | No page |
| `/${locale}/privacy` | `Footer.tsx:266` | No page |
| `/${locale}/sitemap` | `Footer.tsx:272` | No HTML sitemap page |

### 3.5 WhatsApp Contact Bug

`Footer.tsx:201` — the WhatsApp link uses `mailto:` protocol:
```tsx
<a href={`mailto:${generalInfo.whatsapp}`}>
```
Should be `https://wa.me/${generalInfo.whatsapp}`.

---

## 4. Schema / Structured Data — Score: 68 / 100

### 4.1 Current Implementation

**Site-wide (`app/[locale]/layout.tsx`):**
- `RealEstateAgent` — name, url, logo, address, areaServed, sameAs
- `WebSite` — url, name, publisher, inLanguage

**Property pages (`[slug]/layout.tsx`):**
- `RealEstateListing` — name, description, url, image, offers, address, rooms, bathrooms, floorSize, broker

Address fields are now correctly mapped (`addressLocality` for city/neighborhood, `addressRegion` for state) — previous bug is fixed.

### 4.2 Issues

| Issue | Severity |
|-------|----------|
| `sameAs: []` — no social profile URLs | High |
| `areaServed: { "@type": "State" }` — not a Schema.org type | Medium |
| No `telephone`/`email` on `RealEstateAgent` | Medium |
| No `potentialAction` / `SearchAction` on `WebSite` | Medium |
| Logo is a plain URL string instead of `ImageObject` | Low |
| No `BreadcrumbList` on property pages | Medium |
| No `ItemList` on `/properties` listing page | Low |

**`sameAs` fix (`app/[locale]/layout.tsx`):**
Social URLs exist in `generalInfo` API. Fetch them in the server layout and populate `sameAs` dynamically.

**`areaServed` fix:**
```ts
areaServed: { "@type": "AdministrativeArea", name: "Puebla" }
```

**`SearchAction` addition to `WebSite` node:**
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

---

## 5. Performance — Score: 70 / 100

*Based on code analysis. No live Lighthouse run performed.*

| Metric | Estimated | Status |
|--------|-----------|--------|
| LCP | 1.5–2.5s | Improved (WebP + priority) |
| INP | 200–350ms | Needs improvement (CSR + animation) |
| CLS | 0.05–0.15 | Borderline (FeaturedProperties collapse) |

### Improvements Already In Place
- Hero: WebP image, `priority`, `sizes="100vw"` — LCP significantly improved
- Next.js standalone output mode

### Remaining Concerns

**FeaturedProperties CLS:** Loading state renders a small text block, then expands to a full card grid. Height shift after paint = layout shift.

**Fix:** Skeleton grid during loading:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1,2,3].map(i => <div key={i} className="h-96 bg-stone-100 rounded-lg animate-pulse" />)}
</div>
```

**Client-heavy page composition:** Every homepage section (Hero, ServiceTiles, FeaturedProperties, MainAbout) is `"use client"`. Only `Hero` (router + state) and `FeaturedProperties` (query) truly need to be. `ServiceTiles` and `MainAbout` could be Server Components.

**Google Fonts via CSS `@import`:** `packages/shared/src/styles/globals.css` imports from `fonts.googleapis.com` — this is render-blocking and cross-origin. Replace with `next/font/google` for self-hosted fonts with automatic preload.

**`console.log` in production:** `FeaturedProperties.tsx:16` logs full property data to the browser console.

---

## 6. Images — Score: 78 / 100

| Asset | Status |
|-------|--------|
| Hero background | ✅ WebP, priority, 100vw sizes |
| Hero `alt=""` | ✅ Acceptable for decorative background |
| Logo (nav) | ✅ `alt="Properlia logo"` |
| Logo (footer) | ✅ `alt="Properlia - Real Estate"` |
| Property images | ❓ Domain not in `next.config.js` remotePatterns |
| Property card alt text | Unknown (PropertyCard from shared — not reviewed) |

---

## 7. AI Search Readiness — Score: 35 / 100

| Check | Status |
|-------|--------|
| Passage-level citable content | ❌ No quotable body paragraphs |
| FAQ / Q&A content | ❌ None |
| Sourced statistics | ❌ Claims exist, no sources |
| Named experts / authors | ❌ None |
| `llms.txt` | ❌ Not implemented |
| AI bot accessibility (robots.txt) | ✅ No blocking rules |
| Schema markup | ✅ Basic RealEstateAgent present |
| `sameAs` entity signals | ❌ Empty array |

The entire public site is UI (forms, property cards, translated short strings). There is no publishable, citeable reference content. AI systems (ChatGPT, Perplexity, Google AI Overviews) cannot extract useful passages.

**Recommended additions:**
1. "Puebla Real Estate Market" section on homepage — 3–5 sentences with sourced data
2. FAQ sections on buyer/seller pages with `FAQPage` schema
3. Neighborhood / colonia guide pages (e.g., `/es/properties/puebla/angelopolis`)
4. Named advisor profiles on an About page
5. `public/llms.txt` listing key pages and their purpose for AI crawlers

---

## File Index

| File | Issues |
|------|--------|
| `nginx/nginx.conf` | Dashboard HTTP no redirect, no CSP header |
| `app/[locale]/layout.tsx` | `sameAs: []`, `areaServed` @type, no SearchAction |
| `app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx` | CSR — no static content |
| `src/lib/metadata.ts` | No OpenGraph / Twitter Card |
| `src/components/Hero.tsx` | Animated H1 |
| `src/components/FeaturedProperties.tsx` | No H2, console.log, CLS loading state |
| `src/components/Navigation.tsx` | Broken `/services` link |
| `src/components/Footer.tsx` | `/sell`, `/terms`, `/privacy`, `/sitemap` all 404; WhatsApp uses mailto |
| `next.config.js` | Placeholder image domain |
| `shared/src/styles/globals.css` | Google Fonts via render-blocking CSS import |
| `shared/src/messages/en.json` | Mixed-language values, empty keys |
