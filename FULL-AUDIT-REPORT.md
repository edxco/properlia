# Properlia.com — Full SEO Audit Report

**Date:** 2026-05-05  
**Site:** https://properlia.com  
**Platform:** Next.js 14 + Rails API, Cloudflare CDN  
**Market:** Real estate, Puebla Mexico, bilingual (es/en)

---

## SEO Health Score: 47 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 25% | 30/100 | 7.5 |
| Content Quality | 25% | 49/100 | 12.3 |
| On-Page SEO | 20% | 55/100 | 11.0 |
| Schema / Structured Data | 10% | 35/100 | 3.5 |
| Performance (CWV) | 10% | 62/100 | 6.2 |
| Images | 5% | 75/100 | 3.8 |
| AI Search Readiness | 5% | 28/100 | 1.4 |
| **Total** | | | **47** |

---

## Executive Summary

### Business Type
Real estate advisory platform serving buyers, sellers, and investors in Puebla, Mexico. Bilingual (Spanish primary, English secondary). Primary revenue: buyer/seller consultation lead generation.

### Top 5 Critical Issues

1. **robots.txt returns 404** — The Next.js middleware redirects `/robots.txt` → `/es/robots.txt` (404). Google has no crawl instructions for this site.
2. **sitemap.xml returns 404** — Same middleware bug: `/sitemap.xml` → `/es/sitemap.xml` (404). Google cannot discover property URLs via sitemap.
3. **Homepage has ~80–120 words of indexable content** — The MainAbout section is commented out. Google sees a nearly empty page for "inmobiliaria en Puebla".
4. **No H1 on the properties listing page** — The most commercially important page has no page-level heading.
5. **Zero testimonials or social proof anywhere** — A real estate platform with no verified client reviews is a critical E-E-A-T failure.

### Top 5 Quick Wins

1. Fix middleware to bypass `robots.txt` and `sitemap.xml` from locale routing (30-min fix, immediate Google impact)
2. Re-enable `<MainAbout />` on the homepage (1-line uncomment)
3. Add `<h1>` to the properties page
4. Add `/services` to `sitemap.ts` static routes
5. Populate `sameAs` array in JSON-LD with social profile URLs

---

## Technical SEO — Score: 30/100

### CRITICAL: robots.txt and sitemap.xml return 404

**Confirmed live:** Both files return HTTP 307 redirects to locale-prefixed paths that do not exist.

```
GET /robots.txt   → HTTP 307 → /es/robots.txt   → HTTP 404 (noindex)
GET /sitemap.xml  → HTTP 307 → /es/sitemap.xml  → HTTP 404 (noindex)
```

**Root cause:** `packages/frontend/src/middleware.ts` — the matcher `/((?!_next|static|images|favicon.ico|api).*)` does not exclude `robots.txt` or `sitemap.xml`. Every request without a locale prefix is redirected to `/{defaultLocale}{path}`.

**Impact:** Google Googlebot fetches `/robots.txt`, follows the 307 to `/es/robots.txt`, gets a 404 with `noindex`. Without robots.txt, Google applies default crawl behavior. The sitemap cannot be submitted to or verified in Google Search Console.

**Fix** (`middleware.ts`):
```typescript
if (
  pathname.startsWith("/_next") ||
  pathname.startsWith("/static") ||
  pathname.startsWith("/images") ||
  pathname === "/favicon.ico" ||
  pathname === "/robots.txt" ||  // ADD
  pathname === "/sitemap.xml"    // ADD
) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|images|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
```

---

### Redirect Behavior

| URL | Status | Notes |
|---|---|---|
| `https://properlia.com/` | 307 → `/es/` | Locale detection redirect (acceptable) |
| `https://properlia.com/es` | 200 | Works directly |
| `https://properlia.com/en` | 200 | Works directly |
| `https://properlia.com/robots.txt` | 307 → 404 | **Critical bug** |
| `https://properlia.com/sitemap.xml` | 307 → 404 | **Critical bug** |

### Security Headers (Confirmed Live)

| Header | Status | Value |
|---|---|---|
| HTTPS | ✅ | Enforced by Cloudflare |
| HSTS | ✅ | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | ✅ | `nosniff` |
| X-Frame-Options | ✅ | `SAMEORIGIN` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ | `camera=(), microphone=(), geolocation=()` |
| Content-Security-Policy | ❌ | Missing |

### Hreflang

Correctly implemented per-page via `buildMetadata()`:
- `hreflang="es"` → `/es{path}`
- `hreflang="en"` → `/en{path}`
- `hreflang="x-default"` → `/es{path}` (correct for MX-primary audience)

### Canonical

Correctly implemented. Each locale+path combination has a self-referencing canonical.

### JavaScript Rendering

All key pages are server-rendered (Next.js SSR). The properties listing is a client component wrapped in `<Suspense>` — property grid is not available to crawlers on first render. Page structure and filters are server-rendered.

---

## Content Quality — Score: 49/100

### E-E-A-T Assessment

| Signal | Score | Notes |
|---|---|---|
| Experience | 4/10 | "+200 deals closed" is the only claim; no testimonials, no case studies |
| Expertise | 5/10 | Services page has structure; no named credentials or agent profiles |
| Authoritativeness | 3/10 | Physical address present; `sameAs` empty; no external citations |
| Trustworthiness | 6/10 | HTTPS, legal pages, canonical/hreflang correct; no visible phone in hero |
| **Overall E-E-A-T** | **4.5/10** | |

### Thin Content

**Homepage word count: ~80–120 words** (minimum floor: 500).

The MainAbout section is commented out in `packages/frontend/app/[locale]/page.tsx`:
```tsx
{/* <MainAbout /> */}
```
This was the only prose content section. The homepage now has: H1 + hero subheadline + search widget + micro-trust line + 3 service tiles + dynamic property cards (not indexable on first render).

**Properties page: ~40–60 words.** No editorial framing, no H1.

**Consultation pages: ~150–250 words** each. Minimal editorial content around the form.

### Heading Structure

| Page | H1 | Notes |
|---|---|---|
| `/es` homepage | ✅ "Inmobiliaria en Puebla" | Correct keyword targeting |
| `/es/properties` | ❌ Missing | No H1 anywhere on the page |
| `/es/services` | ⚠️ "Servicios" | Present but no keyword; should be "Servicios Inmobiliarios en Puebla" |
| `/es/buyer-consultation` | ✅ "Encuentra tu propiedad ideal en Puebla" | Good |
| `/es/seller-consultation` | ✅ "Vende tu propiedad con Properlia" | Acceptable |

### AI Citation Readiness — 28/100

- No article-format or FAQ-format content for AI extraction.
- No author attribution on any non-legal page.
- `sameAs` empty weakens entity recognition in AI knowledge graphs.
- Specific quotable claims exist (`8–12% projected returns`, `90-day average sale`) but are isolated in micro-copy.

---

## On-Page SEO — Score: 55/100

### Title Tags

| Page | Title | Length | Issues |
|---|---|---|---|
| Homepage (es) | "Properlia \| Inmobiliaria en Puebla — Casas, Departamentos e Inversiones" | 71 chars | Slightly over 60-char ideal |
| Homepage (en) | "Properlia \| Real Estate in Puebla — Houses, Apartments & Investments" | 69 chars | Slightly over 60-char ideal |
| Properties (es) | "Propiedades en Venta en Puebla \| Properlia" | 43 chars | Good |
| Services (es) | "Servicios Inmobiliarios en Puebla \| Properlia" | 47 chars | Good |

### Internal Linking Issues

- ServiceTiles "invest" tile links to `/properties?category=investment` — this URL parameter is not handled by the filter logic in `PropertiesClient.tsx`. Users land on an unfiltered list.
- No breadcrumb navigation on any page.
- Footer contact links are conditional on API `generalInfo` data — if the API call fails, no contact links render.

---

## Schema / Structured Data — Score: 35/100

### Current Implementation

One JSON-LD block injected globally in `layout.tsx`:
- `RealEstateAgent` with address, logo, areaServed
- `WebSite` with publisher cross-reference
- `sameAs: []` — **empty array, no social profiles linked**

### Validation Gaps

| Schema | Status | Priority |
|---|---|---|
| `sameAs` array populated | ❌ | Critical |
| `WebSite.potentialAction` SearchAction | ❌ | Critical |
| `telephone` on RealEstateAgent | ❌ | High |
| `BreadcrumbList` on inner pages | ❌ | High |
| `ItemList` on properties page | ❌ | High |
| `RealEstateListing` on property detail | ❌ (page doesn't exist yet) | High |
| `Service` nodes on services page | ❌ | Medium |
| `ContactPage` on consultation pages | ❌ | Medium |
| `geo` on RealEstateAgent | ❌ | Medium |
| `openingHours`, `priceRange` | ❌ | Low |

---

## Performance — Score: 62/100

### Confirmed Live

- **CDN:** Cloudflare, `s-maxage=31536000` on homepage — excellent caching.
- **Compression:** Present via Cloudflare + Next.js.
- **Image format:** WebP confirmed, responsive srcset present.
- **LCP candidate:** Hero background correctly preloaded with `<link rel="preload">`.

### Issues

1. **Google Fonts via CSS `@import`** (`packages/shared/src/styles/globals.css` line 1) — render-blocking. Should use `next/font/google`.
2. **No skeleton loading states** — `FeaturedProperties` and `PropertiesClient` use plain text fallbacks. CLS risk.
3. **Filter inputs `text-xs` (12px)** — triggers automatic iOS Safari page zoom. All filter `<input>` and `<select>` must have `font-size: 16px` minimum.

---

## Images — Score: 75/100

- WebP format in use ✅
- Hero LCP image preloaded with priority ✅
- Decorative images: correct empty alt text ✅
- Logo images: descriptive alt text ✅
- Missing: skeleton placeholders for property card images (CLS risk) ⚠️

---

## Sitemap Analysis

- `sitemap.ts` generates valid Next.js sitemap.
- **Live sitemap 404s** due to middleware bug (fix in C1).
- Missing from sitemap: `/services` (has dedicated metadata and content).
- `priority` and `changeFrequency` present — Google ignores both; remove.
- Static routes use `lastModified: new Date()` — fake timestamps reduce crawl trust.
- `alternates.languages` in sitemap entries is silently discarded by Next.js.
- Properties with null `state`/`city` generate `/properties/na/na/{id}/{slug}` URLs.

---

## Key Files Reference

| File | Issues |
|---|---|
| `packages/frontend/src/middleware.ts` | Does not exclude robots.txt/sitemap.xml |
| `packages/frontend/app/[locale]/page.tsx` | MainAbout commented out |
| `packages/frontend/app/[locale]/properties/PropertiesClient.tsx` | Missing H1, 12px inputs, no skeleton |
| `packages/frontend/app/[locale]/layout.tsx` | sameAs empty, missing SearchAction + telephone |
| `packages/frontend/app/sitemap.ts` | Missing /services, fake lastmod, unused alternates block |
| `packages/shared/src/styles/globals.css` | CSS @import for fonts (render-blocking) |
| `packages/frontend/app/[locale]/services/page.tsx` | H1 lacks keyword, no schema |
| `packages/frontend/app/[locale]/buyer-consultation/BuyerConsultationClient.tsx` | No FAQ, thin editorial content |
| `packages/frontend/app/[locale]/seller-consultation/SellPropertyClient.tsx` | Generic benefit copy, thin content |
