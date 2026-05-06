# Properlia SEO Action Plan

**Generated:** April 14, 2026
**Overall SEO Health Score:** 53 / 100
**Target Score:** 75+ / 100

---

## Priority Definitions

- **Critical** — Blocks indexing, breaks user experience, or causes validator failures (fix immediately)
- **High** — Significantly impacts rankings or CWV (fix within current sprint)
- **Medium** — Meaningful optimization opportunity (fix within 1 month)
- **Low** — Nice to have (backlog)

---

## CRITICAL — Fix Immediately

### C-1. Fix WhatsApp `mailto:` Bug
**File:** [`src/components/Footer.tsx`](packages/frontend/src/components/Footer.tsx)
**Issue:** `href="mailto:${generalInfo.whatsapp}"` should be `href="https://wa.me/${generalInfo.whatsapp}"`
**Impact:** Primary contact channel completely broken for all users
**Effort:** ~5 min

### C-2. Fix Invalid Schema.org `areaServed` Type
**File:** [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx)
**Issue:** `"@type": "State"` is not a valid Schema.org type — fails Google Rich Results validator
**Fix:** Change to `"@type": "AdministrativeArea"` or use plain string `"areaServed": "Puebla"`
**Effort:** ~2 min

### C-3. Fix `addressLocality` Silent Overwrite in Property JSON-LD
**File:** [`app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`](packages/frontend/app/%5Blocale%5D/properties/%5Bstate%5D/%5Bcity%5D/%5Bid%5D/%5Bslug%5D/layout.tsx)
**Issue:** Both `property.neighborhood` and `property.city` spread into `addressLocality` — second overwrites first. City data survives; neighborhood is silently lost.
**Fix:** Remove the neighborhood spread from `addressLocality`. Use `addressLocality` for city only.
**Effort:** ~5 min

### C-4. Add Missing EN Translation Keys
**File:** [`packages/shared/src/messages/en.json`](packages/shared/src/messages/en.json)
**Issue:** ~17 form/validation keys exist in `es.json` but absent from `en.json`. English-locale form pages render broken states (undefined labels, missing error messages).
**Missing keys:** `consentMarketing`, `submitForm`, `submitting`, `formSuccess`, `formError`, `requiredField`, `emailOrPhoneRequired`, `cancel`, `saving`, `creating`, `create`, `newUser`, `createNewUser`, `enterName`, `password`, `enterPassword`, `searchByEmailOrName`
**Also fix:** `contactMe` has Spanish value "contactar" in `en.json`; `"hi": "hola"` test key reversed
**Effort:** ~30 min

---

## HIGH — Fix This Sprint

### H-1. Add Open Graph and Twitter Card Meta Tags
**File:** [`src/lib/metadata.ts`](packages/frontend/src/lib/metadata.ts)
**Issue:** `buildMetadata()` never sets `openGraph` or `twitter` properties. Every social share produces a blank preview.
**Fix:** Add `openGraph` (title, description, type, images, locale, siteName) and `twitter` (card, title, description, images) to the returned `Metadata` object. For property detail pages, include the first property image.
**Impact:** Affects every page; high conversion impact on WhatsApp/social sharing
**Effort:** ~2 hours

### H-2. Fix LCP: Extract LCP Image from Client Component
**File:** [`src/components/Hero.tsx`](packages/frontend/src/components/Hero.tsx)
**Issue:** `Hero.tsx` is `"use client"` — the LCP image (`properlia-bg.webp`) is not server-rendered. The `priority` prop does not emit a `<link rel="preload">` server-side. LCP is likely in the "Poor" range.
**Fix:** Split Hero into a server-rendered wrapper (containing the `<Image>`) and a nested client component (for the search form and typing animation). Background image must be in the server part.
**Effort:** ~3 hours

### H-3. Replace CSS `@import` Fonts with `next/font`
**Files:** [`packages/shared/src/styles/globals.css`](packages/shared/src/styles/globals.css) + [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx)
**Issue:** `@import url('https://fonts.googleapis.com/...')` is render-blocking. Browser must complete a serial DNS + TCP + TLS + CSS + font-file request chain before first paint.
**Fix:**
1. Remove the `@import` line from `globals.css`
2. Add `next/font/google` imports for `Poppins` and `Lexend` in `layout.tsx`
3. Apply font class names to `<html>` element via `className`
**Effort:** ~1 hour

### H-4. Add Missing Pages to Sitemap
**File:** [`app/sitemap.ts`](packages/frontend/app/sitemap.ts)
**Issue:** `/services`, `/privacy`, `/terms` are indexable pages with metadata but absent from XML sitemap
**Fix:** Add to `staticRoutes` array. Also replace `lastModified: new Date()` with fixed dates for static routes.
**Effort:** ~15 min

### H-5. Add `SearchAction` to `WebSite` Schema
**File:** [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx)
**Issue:** Missing `potentialAction: SearchAction` on `WebSite` entity — site is ineligible for Google Sitelinks Searchbox
**Effort:** ~10 min

### H-6. Populate `sameAs` in Organization Schema
**File:** [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx)
**Issue:** `sameAs: [] as string[]` — no social profiles linked; entity cannot be disambiguated
**Fix:** Hardcode known social URLs (Instagram, Facebook, LinkedIn, TikTok)
**Effort:** ~15 min

### H-7. Add Explicit `<meta name="viewport">` Tag
**File:** [`app/[locale]/layout.tsx`](packages/frontend/app/%5Blocale%5D/layout.tsx)
**Fix:** Export `viewport` constant from layout:
```ts
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
```
**Effort:** ~5 min

### H-8. Fix `x-default` Hreflang Target
**File:** [`src/lib/metadata.ts`](packages/frontend/src/lib/metadata.ts)
**Issue:** `x-default` points to `/es`, forcing English-speaking users into Spanish locale
**Fix:** Point `x-default` to root `/`
**Effort:** ~10 min

### H-9. Add `BreadcrumbList` Schema to Property Detail Pages
**File:** [`app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`](packages/frontend/app/%5Blocale%5D/properties/%5Bstate%5D/%5Bcity%5D/%5Bid%5D/%5Bslug%5D/layout.tsx)
**Issue:** 4-segment URL with no breadcrumb schema signal
**Fix:** Add `BreadcrumbList` to the `@graph` array: Home → Properties → State → City → Property Title
**Effort:** ~30 min

---

## MEDIUM — Fix Within 1 Month

### M-1. Replace `TypingAnimation` / Framer Motion with CSS Animation
**File:** [`components/ui/typing-animation.tsx`](packages/frontend/components/ui/typing-animation.tsx)
**Issue:** Framer Motion (~30–50 KB gzipped) imported solely for a typing cursor. A 10Hz `setState` loop runs indefinitely, degrading INP.
**Fix:** Replace with a pure CSS `@keyframes steps()` animation
**Effort:** ~2 hours

### M-2. Add Content Depth to Homepage
**Files:** [`src/components/MainAbout.tsx`](packages/frontend/src/components/MainAbout.tsx), translation files
**Issue:** Homepage renders ~180 words — well below 500-word minimum. `MainAbout` buttons have no `href`/`onClick`.
**Fix:** Expand `MainAbout` with neighborhoods served, market context, wire up CTA buttons. Target 400+ total words.
**Effort:** ~3 hours (copy + dev)

### M-3. Fix `FeaturedProperties` Loading Skeleton for CLS
**File:** [`src/components/FeaturedProperties.tsx`](packages/frontend/src/components/FeaturedProperties.tsx)
**Issue:** Loading state renders short text; card grid appears after hydration, shifting all downstream content
**Fix:** Replace loading text with a 3-column skeleton matching the card grid height
**Effort:** ~1 hour

### M-4. Fix Footer CLS from Conditional API Content
**File:** [`src/components/Footer.tsx`](packages/frontend/src/components/Footer.tsx)
**Issue:** Social links and contact info slots are empty on initial render, expand after `useGeneralInfo()` resolves
**Fix:** Reserve space for footer slots with CSS `min-height` or render a skeleton placeholder
**Effort:** ~1 hour

### M-5. Add Content Security Policy Header
**File:** [`nginx/nginx.conf`](nginx/nginx.conf)
**Issue:** No CSP header — fails Lighthouse security audit
**Fix:** Deploy `Content-Security-Policy-Report-Only` first to audit violations, then enforce
**Effort:** ~3 hours (testing/validation)

### M-6. Update Services Page H1 with Geo-Modifier
**File:** [`app/[locale]/services/page.tsx`](packages/frontend/app/%5Blocale%5D/services/page.tsx)
**Issue:** H1 is just "Servicios" — no keyword or geographic context
**Fix:** "Servicios Inmobiliarios en Puebla" (ES) / "Real Estate Services in Puebla" (EN)
**Effort:** ~15 min

### M-7. Add `ItemList` Schema to Properties Listing Page
**File:** [`app/[locale]/properties/page.tsx`](packages/frontend/app/%5Blocale%5D/properties/page.tsx)
**Effort:** ~2 hours

### M-8. Add `Service` Schema to Services Page
**File:** [`app/[locale]/services/page.tsx`](packages/frontend/app/%5Blocale%5D/services/page.tsx)
**Effort:** ~30 min

### M-9. Fix `datePosted` and Bathroom Count in Property JSON-LD
**File:** [`app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`](packages/frontend/app/%5Bocale%5D/properties/%5Bstate%5D/%5Bcity%5D/%5Bid%5D/%5Bslug%5D/layout.tsx)
**Fix:** Separate `numberOfBathroomsFull` and `numberOfBathroomsTotal`. Add `datePosted: property.created_at`.
**Effort:** ~20 min

### M-10. Remove Deprecated Fields from Sitemap
**File:** [`app/sitemap.ts`](packages/frontend/app/sitemap.ts)
**Fix:** Remove `priority` and `changeFrequency` from all entries — Google ignores both
**Effort:** ~10 min

### M-11. Update HSTS Header for Preload Eligibility
**File:** [`nginx/nginx.conf`](nginx/nginx.conf)
**Fix:** `max-age=63072000; includeSubDomains; preload` then submit to hstspreload.org
**Effort:** ~10 min

### M-12. Compress Hero Background Image
**File:** `packages/frontend/public/properlia-bg.webp` (currently 392 KB)
**Fix:** Recompress to WebP quality 75–80. Target: <150 KB at 1920px width
**Effort:** ~30 min

### M-13. Source Investment Return Claim
**Files:** Translation files + `services/page.tsx`
**Issue:** "8–12% annual returns in Puebla" is an unattributed financial/YMYL claim
**Fix:** Add source attribution or rephrase as a qualified range
**Effort:** ~30 min

### M-14. Fix Middleware Matcher
**File:** [`middleware.ts`](packages/frontend/middleware.ts)
**Fix:** Add `robots.txt` and `sitemap.xml` to the matcher exclusion pattern
**Effort:** ~5 min

---

## LOW — Backlog

| # | Item | Est. Effort |
|---|---|---|
| L-1 | Add team/agent bios page (highest E-E-A-T impact) | 1–2 days |
| L-2 | Add testimonials section + `AggregateRating` schema | 1 day |
| L-3 | Add market data blog / quarterly price reports | Ongoing |
| L-4 | Add `ContactPage` schema to consultation pages | 30 min each |
| L-5 | Add AI crawler rules to `robots.ts` (GPTBot, CCBot, etc.) | 15 min |
| L-6 | Create `llms.txt` at site root | 30 min |
| L-7 | Add default OG image (1200×630) to `buildMetadata()` | 1 hour |
| L-8 | Fix hardcoded English error strings in `FeaturedProperties.tsx` | 15 min |
| L-9 | Remove placeholder image domains from `next.config.js` | 5 min |
| L-10 | Convert `properlia.png` logo to WebP | 15 min |
| L-11 | Add security headers to all subdomains in nginx | 30 min |
| L-12 | Add `size-adjust` fallback font (after H-3 is done) | 15 min |

---

## Summary Checklist

### Critical (do today)
- [ ] C-1: Fix WhatsApp `mailto:` bug in Footer
- [ ] C-2: Fix `"@type": "State"` → `"AdministrativeArea"` in layout JSON-LD
- [ ] C-3: Fix `addressLocality` silent overwrite in property JSON-LD
- [ ] C-4: Add missing EN translation keys + fix reversed values

### High (this sprint)
- [ ] H-1: Add Open Graph + Twitter Card to `buildMetadata()`
- [ ] H-2: Split Hero into server/client to restore LCP preload
- [ ] H-3: Replace CSS `@import` fonts with `next/font/google`
- [ ] H-4: Add `/services`, `/privacy`, `/terms` to sitemap
- [ ] H-5: Add `SearchAction` to `WebSite` schema
- [ ] H-6: Populate `sameAs` in organization schema
- [ ] H-7: Add explicit `viewport` export to layout
- [ ] H-8: Fix `x-default` hreflang target
- [ ] H-9: Add `BreadcrumbList` schema to property detail pages

### Medium (this month)
- [ ] M-1: Replace Framer Motion typing animation with CSS
- [ ] M-2: Expand homepage content to 400+ words
- [ ] M-3: Fix `FeaturedProperties` skeleton height for CLS
- [ ] M-4: Fix Footer CLS from conditional API content
- [ ] M-5: Add Content Security Policy (report-only first)
- [ ] M-6: Services page H1 with geo-modifier
- [ ] M-7: `ItemList` schema on properties listing page
- [ ] M-8: `Service` schema on services page
- [ ] M-9: Fix `datePosted` and bathroom count in property JSON-LD
- [ ] M-10: Remove deprecated `priority`/`changeFrequency` from sitemap
- [ ] M-11: Update HSTS for preload eligibility
- [ ] M-12: Compress hero image (392 KB → <150 KB)
- [ ] M-13: Source investment return claim
- [ ] M-14: Fix middleware matcher exclusions
