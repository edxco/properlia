# Properlia.com — Full SEO Audit Report

**Audit Date:** April 14, 2026
**URL:** https://properlia.com
**Stack:** Next.js 16 (App Router) + Ruby on Rails API + Nginx + Cloudflare
**Locales:** `es` (default), `en`
**Method:** Full codebase review — all pages, components, configs, nginx, schemas

---

## Overall SEO Health Score: 53 / 100

| Category | Weight | Score | Weighted Score |
|---|---|---|---|
| Technical SEO | 25% | 61 | 15.25 |
| Content Quality | 25% | 54 | 13.50 |
| On-Page SEO | 20% | 50 | 10.00 |
| Schema / Structured Data | 10% | 55 | 5.50 |
| Performance (Core Web Vitals) | 10% | 40 | 4.00 |
| Images | 5% | 60 | 3.00 |
| AI Search Readiness | 5% | 38 | 1.90 |
| **Total** | **100%** | | **53.15** |

---

## Executive Summary

The site has solid structural bones — server-side rendering on most routes, a working dynamic sitemap, canonical and hreflang tags on all key pages, correct HTTPS/www redirect chains, and well-formed property JSON-LD. The primary gaps fall into three clusters:

1. **No social meta** — `buildMetadata()` never sets Open Graph or Twitter Card tags. Every share of any Properlia URL produces a blank preview on WhatsApp, Facebook, LinkedIn, and iMessage.
2. **Homepage performance crisis** — the Hero component is marked `"use client"`, which prevents the browser's preload scanner from discovering the LCP image during server render. Combined with a render-blocking Google Fonts `@import`, LCP is likely in the "Poor" range (>4s).
3. **Thin content and missing E-E-A-T signals** — the homepage renders ~180 words, there are no testimonials, no team bios, no real market data, and the investment return claim (8–12% annual) is unattributed.

There are also several **Critical bugs** that need immediate attention: a WhatsApp link incorrectly using `mailto:`, `addressLocality` silently overwritten in property JSON-LD, and `"@type": "State"` in the organization schema (invalid Schema.org type causing validation errors in Google's Rich Results Test).

---

## Top 5 Critical Issues

1. **No Open Graph / Twitter Card meta tags** — affects every page; breaks social sharing entirely
2. **Hero `"use client"` blocks LCP preload** — likely "Poor" LCP score site-wide
3. **`@type: "State"` in RealEstateAgent schema** — invalid, fails Google's Rich Results validator
4. **`addressLocality` key overwritten in property JSON-LD** — neighborhood data silently lost
5. **WhatsApp `mailto:` bug in Footer** — primary contact channel is broken

## Top 5 Quick Wins

1. Add `openGraph` and `twitter` objects to `buildMetadata()` — ~30 min, affects all pages
2. Add `/services`, `/privacy`, `/terms` to `app/sitemap.ts` — ~10 min
3. Fix `"@type": "State"` → `"@type": "AdministrativeArea"` in `layout.tsx` JSON-LD — ~2 min
4. Fix Footer WhatsApp href from `mailto:` to `https://wa.me/` — ~2 min
5. Replace CSS `@import` fonts with `next/font/google` in `layout.tsx` — ~1 hour, eliminates render-blocking request chain

---

## Section 1 — Technical SEO

**Score: 61 / 100**

### 1.1 Crawlability

| Check | Result | Severity |
|---|---|---|
| robots.ts served via Next.js | Pass | — |
| `/api/` disallowed | Pass | — |
| Sitemap URL declared in robots.txt | Pass | — |
| Middleware locale redirect | Pass | — |
| robots.txt/sitemap.xml not excluded from middleware matcher | Warn | Medium |
| No AI crawler rules (GPTBot, CCBot, ClaudeBot, Google-Extended) | Fail | Low |

**Middleware matcher gap:** `middleware.ts` matcher pattern `/((?!_next|static|images|favicon.ico|api).*)` does not explicitly exclude `robots.txt` or `sitemap.xml`. In practice Next.js route handlers take precedence, but this is fragile.

### 1.2 Indexability & Canonicals

| Check | Result | Severity |
|---|---|---|
| `buildMetadata()` emits canonical and hreflang | Pass | — |
| Homepage relies on layout-level metadata only | Warn | Medium |
| `/services`, `/privacy`, `/terms` missing from XML sitemap | Fail | High |
| `lastModified: new Date()` on all static sitemap entries | Warn | Medium |
| No root `/` fallback page (middleware handles it) | Warn | Low |

### 1.3 Security Headers

**Nginx config: `/nginx/nginx.conf`**

| Header | Status | Severity |
|---|---|---|
| `Strict-Transport-Security` | Present (1yr) | Pass |
| `X-Content-Type-Options` | Present | Pass |
| `X-Frame-Options` | Present | Pass |
| `Referrer-Policy` | Present | Pass |
| `Permissions-Policy` | Present | Pass |
| `Content-Security-Policy` | **Missing** | High |
| HSTS `preload` directive | Missing | Medium |
| HSTS `max-age` < 2yr preload threshold | Warn | Medium |
| Security headers absent on subdomains | Fail | Medium |

### 1.4 URL Structure & Redirects

| Check | Result |
|---|---|
| HTTP → HTTPS 301 | Pass |
| www → non-www 301 | Pass |
| Root `/` → locale 301 (middleware) | Pass |
| Property URL pattern `/{locale}/properties/{state}/{city}/{id}/{slug}` | Pass |
| Property page ignores `state`, `city`, `slug` params (only `id` used) | Warn — stale URLs always resolve without canonical correction |

### 1.5 Mobile Friendliness

| Check | Result | Severity |
|---|---|---|
| Responsive grid layouts | Pass | — |
| Mobile navigation menu | Pass | — |
| Explicit `<meta name="viewport">` | **Missing** | High |
| Touch target size (mobile menu spacing) | Marginal | Low |

### 1.6 Open Graph & Social Meta

**Score: 10 / 100 — FAIL**

`buildMetadata()` (`src/lib/metadata.ts`) returns only `title`, `description`, `alternates.canonical`, and `alternates.languages`. No `openGraph` or `twitter` properties are set on any page.

Impact: All social shares produce blank previews. Property listing pages cannot show listing photos when shared.

### 1.7 Hreflang

| Check | Result | Severity |
|---|---|---|
| `alternates.languages` on all `buildMetadata()` pages | Pass | — |
| `x-default` points to `/es` instead of root `/` | Warn | High |
| Hreflang URLs on property pages may diverge from canonicals due to slugification | Warn | High |
| Pages with hreflang but absent from XML sitemap (`services`, `privacy`, `terms`) | Inconsistency | Low |

---

## Section 2 — Content Quality

**Score: 54 / 100**

### 2.1 E-E-A-T Assessment

| Factor | Score | Key Issues |
|---|---|---|
| Experience (20%) | 18/20 | "+200 deals" claim unattributed; zero testimonials; zero case studies |
| Expertise (25%) | 20/25 | No team bios or named agents; 8–12% return claim has no source |
| Authoritativeness (25%) | 15/25 | `sameAs: []` in schema; no blog; no press; no AMPI certification |
| Trustworthiness (30%) | 30/30 | Strong legal pages (LFPDPPP compliant); physical address in footer; ARCO rights |

**Normalized E-E-A-T: 53 / 100**

### 2.2 Word Count by Page

| Page | Estimated Words | Minimum Target | Status |
|---|---|---|---|
| Homepage | ~180 | 500 | **FAIL** |
| Properties listing | ~50 (UI only) | 800 | **FAIL** |
| Seller consultation | ~350 | 800 | **FAIL** |
| Services | ~480 | 800 | Borderline |
| Buyer consultation | ~600 | 800 | Borderline |
| Privacy, Terms | ~650 | N/A | Pass |

### 2.3 Translation / EN Parity

| Issue | Severity |
|---|---|
| `contactMe` key has Spanish value in `en.json` | High |
| `"hi": "hola"` test key value reversed in `en.json` | Low |
| `propertyDetails` empty string in both locale files | Low |
| ~17 form/validation keys present in `es.json` but absent from `en.json` | **High** — English form pages will render broken states |
| Hardcoded English strings in `FeaturedProperties.tsx` ("Loading properties...") | Medium |

### 2.4 Key Content Issues

- **Services page H1** is "Servicios" — no geo-modifier. Should be "Servicios Inmobiliarios en Puebla"
- **`MainAbout` section** renders one 40-word paragraph with non-functional buttons (no `href`/`onClick`)
- **Investment return claim** ("8–12% anual en Puebla") is a financial/YMYL claim with no source
- **`properliaBriefDescription`** promises "datos de mercado reales" but no actual data is surfaced on any page

---

## Section 3 — Schema / Structured Data

**Score: 55 / 100**

### 3.1 Current Implementation

| File | Schema Types | Status |
|---|---|---|
| `app/[locale]/layout.tsx` | `RealEstateAgent`, `WebSite` | Present with issues |
| `app/[locale]/properties/.../layout.tsx` | `RealEstateListing` | Present with issues |
| All other pages | None | Missing |

### 3.2 Validation Issues

| Issue | Severity |
|---|---|
| `areaServed: { "@type": "State" }` — `State` is not a valid Schema.org type | **Critical** |
| `addressLocality` key overwritten twice in property JSON-LD | **Critical** |
| `sameAs: []` empty array in `RealEstateAgent` | High |
| `WebSite` missing `SearchAction` (Sitelinks Searchbox eligibility lost) | High |
| `numberOfBathroomsTotal` includes half baths (semantic inaccuracy) | Low |
| No `datePosted` on `RealEstateListing` | Low |

### 3.3 Missing Schema Opportunities

| Page | Missing Schema | Priority |
|---|---|---|
| Property detail | `BreadcrumbList` | High |
| Properties listing | `ItemList` | Medium |
| Services | `Service` + `OfferCatalog` | Medium |
| Buyer/Seller consultation | `ContactPage` | Low |
| Privacy/Terms | `WebPage` | Low |

---

## Section 4 — Performance / Core Web Vitals

**Score: 40 / 100** *(static code analysis — validate with real CrUX data)*

### 4.1 LCP (Estimated: Poor — likely >4s)

| Root Cause | File | Severity |
|---|---|---|
| `Hero.tsx` is `"use client"` — LCP image not server-rendered, `priority` preload tag not emitted | `src/components/Hero.tsx:1` | **Critical** |
| Google Fonts loaded via CSS `@import` — render-blocking external request chain | `packages/shared/src/styles/globals.css:1` | **Critical** |
| Hero background image `properlia-bg.webp` is 392 KB — oversized | `public/properlia-bg.webp` | High |
| No `<link rel="preconnect" href="https://fonts.gstatic.com">` in layout | `app/[locale]/layout.tsx` | High |

### 4.2 INP (Estimated: Needs Improvement)

| Root Cause | Severity |
|---|---|
| `TypingAnimation` drives a 10Hz `setState` loop indefinitely via `setTimeout` — competes with user interactions | High |
| Framer Motion (`motion/react` v12) imported for typing animation — ~30–50 KB gzipped bundle cost | High |
| `useGeneralInfo()` called independently in each `PropertyCard` (3 separate React Query subscribers) | Medium |
| `PropertiesClient.tsx` — entire properties page is client-rendered; heavy filter/pagination state | Medium |

### 4.3 CLS (Estimated: Needs Improvement)

| Root Cause | Severity |
|---|---|
| `FeaturedProperties` has no height-matched skeleton — cards appear after hydration, shifting content below | Medium |
| Footer renders social/contact data conditionally via API call — empty slots expand after fetch | Medium |
| Navigation logo missing `height` prop | Low |
| Google Fonts FOUT — fallback font metrics differ from loaded font | Medium |

### 4.4 Bundle / Configuration

| Issue | Severity |
|---|---|
| `motion` (Framer Motion) imported solely for a typing cursor effect | High |
| No `experimental.optimizePackageImports` in `next.config.js` | Low |
| `placeholder.com` / `your-domain.com` still listed in image `remotePatterns` | Low |

---

## Section 5 — Sitemap

**Score: 76 / 100**

| Check | Status | Severity |
|---|---|---|
| Dynamic sitemap via `app/sitemap.ts` | Pass | — |
| `robots.ts` references sitemap URL | Pass | — |
| hreflang alternates in sitemap entries | Pass | — |
| `/services`, `/terms`, `/privacy` missing from sitemap | **Fail** | High |
| `priority` and `changeFrequency` fields used (deprecated by Google) | Info | Low |
| `lastModified: new Date()` on static routes | Warn | Low |
| Properties with null `state`/`city` generate `/na/na/` paths in sitemap | Warn | Medium |
| Single sitemap file (<50k URL limit — fine for current catalog size) | Pass | — |

---

## Section 6 — Images

**Score: 60 / 100**

| Image | Format | Size | Issues |
|---|---|---|---|
| `properlia-bg.webp` (hero) | WebP | 392 KB | Oversized — target <150 KB |
| `properlia.png` (logo) | PNG | 68 KB | Should be WebP; `height` missing on `<Image>` |
| Property card images | Dynamic | Unknown | `unoptimized={true}` for localhost; correct for production |
| Hero `<Image>` alt attribute | `alt=""` | — | Intentional/decorative — Pass |

---

## Section 7 — AI Search Readiness

**Score: 38 / 100**

| Criterion | Status |
|---|---|
| Quotable factual statements | Weak — "+200 operations" unattributed |
| Clear H1 > H2 > H3 hierarchy | Partial — ServiceTiles/FeaturedProperties have no headings |
| FAQ or Q&A structure | None |
| Named entities (people, locations) | Partial — Puebla referenced; no named agents |
| Schema completeness for AI disambiguation | Partial — `sameAs: []`, no `AggregateRating` |
| `llms.txt` file | Missing |
| AI training crawler rules in `robots.txt` | Missing |
| Content freshness signals (publication dates) | Only on legal pages |
| Structural data density (verifiable claims) | Very low |

---

## Files Referenced

### Files with Critical Issues

- [`src/lib/metadata.ts`](packages/frontend/src/lib/metadata.ts) — missing Open Graph and Twitter Card
- [`src/components/Hero.tsx`](packages/frontend/src/components/Hero.tsx) — `"use client"` blocks LCP preload
- [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx) — invalid `areaServed` type, empty `sameAs`, missing viewport
- [`app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`](packages/frontend/app/%5Blocale%5D/properties/%5Bstate%5D/%5Bcity%5D/%5Bid%5D/%5Bslug%5D/layout.tsx) — duplicate `addressLocality`
- [`src/components/Footer.tsx`](packages/frontend/src/components/Footer.tsx) — WhatsApp `mailto:` bug
- [`packages/shared/src/messages/en.json`](packages/shared/src/messages/en.json) — ~17 missing form keys
- [`packages/shared/src/styles/globals.css`](packages/shared/src/styles/globals.css) — render-blocking `@import` fonts

### Files Needing Updates

- [`app/sitemap.ts`](packages/frontend/app/sitemap.ts) — add `/services`, `/privacy`, `/terms`
- [`app/robots.ts`](packages/frontend/app/robots.ts) — add AI crawler rules
- [`middleware.ts`](packages/frontend/middleware.ts) — exclude robots.txt/sitemap.xml from matcher
- [`nginx/nginx.conf`](nginx/nginx.conf) — add CSP header, update HSTS
- [`next.config.js`](packages/frontend/next.config.js) — remove placeholder image domains
- [`components/ui/typing-animation.tsx`](packages/frontend/components/ui/typing-animation.tsx) — replace Framer Motion with CSS animation
