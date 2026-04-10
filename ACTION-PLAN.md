# Properlia SEO — Action Plan

**Generated:** April 9, 2026
**Overall Score:** 52 / 100
**Target Score:** 75 / 100

---

## Critical — Fix Immediately

These block indexing, cause ranking penalties, or corrupt live structured data.

### 1. Fix `addressRegion` / `addressLocality` bug in property JSON-LD
**File:** `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx` lines 38–39
**Impact:** Structured data on every listing page is malformed — city is always lost

```ts
// Replace:
...(property.city && { addressRegion: property.city }),
...(property.state && { addressRegion: property.state }),

// With:
...(property.city && { addressLocality: property.city }),
...(property.state && { addressRegion: property.state }),
```

---

### 2. Add HTTP→HTTPS and www→non-www redirects in Nginx
**File:** `nginx/nginx.conf`
**Impact:** Prevents indexing of HTTP and www duplicate content

```nginx
# Add before the main HTTPS server block:
server {
    listen 80;
    server_name properlia.com www.properlia.com;
    return 301 https://properlia.com$request_uri;
}

server {
    listen 443 ssl;
    server_name www.properlia.com;
    return 301 https://properlia.com$request_uri;
}
```

Also verify Cloudflare SSL mode is set to **Full (Strict)**.

---

### 3. Add security headers to Nginx
**File:** `nginx/nginx.conf` — inside the main HTTPS server block
**Impact:** Removes security header failures; Google factors HTTPS/security into trust signals

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

### 4. Add `priority` + `sizes` to hero `<Image>` and replace the source asset
**File:** `packages/frontend/src/components/Hero.tsx`
**Impact:** Estimated -1.5s to -3s on LCP (most impactful single code change)

```tsx
// Step 1: Replace public/properlia-bg.png with a WebP at ≤200 KB, 1920px wide
// Step 2:
<Image
  src={ProperliaBg}
  alt=""
  priority
  sizes="100vw"
  className="absolute inset-0 w-full h-full object-cover"
/>
```

---

### 5. Add a stable static H1 — move animation below it
**File:** `packages/frontend/src/components/Hero.tsx` lines 54–64
**Impact:** Google currently has no stable primary heading for the homepage

```tsx
// Before: <h1><TypingAnimation texts={[...]} /></h1>

// After:
<h1 className="sr-only">Inmobiliaria en Puebla — Encuentra tu Propiedad Ideal</h1>
<p aria-hidden="true"><TypingAnimation texts={[...]} /></p>
// Or make the H1 visible with your existing style and keep animation as decorative only
```

For English: `"Real Estate in Puebla — Find Your Ideal Property"`

---

### 6. Remove or fix the `/services` navigation link
**File:** `packages/frontend/src/components/Navigation.tsx` lines 54, 98
**Impact:** Dead nav link → 404, wastes crawl budget, harms UX

Remove the link from both desktop and mobile nav until the page is created, or point it to `/properties` temporarily.

---

## High — Fix Within 1 Week

### 7. Convert property detail `page.tsx` to a Server Component
**File:** `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx`
**Impact:** All visible property content currently invisible to Googlebot

```tsx
// Remove: 'use client' directive + useProperty() hook
// Add: server-side fetch using propertyApi.getById(id)
// Keep: interactive sub-components (gallery, contact form) as separate client components
```

---

### 8. Replace CSS `@import` fonts with `next/font/google`
**File:** `packages/shared/src/styles/globals.css` → `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Eliminates render-blocking font chain, removes FOUT (CLS contributor)

```tsx
// In layout.tsx:
import { Poppins, Lexend } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '700'] });
const lexend = Lexend({ subsets: ['latin'] });
```

Remove the `@import` from `globals.css`.

---

### 9. Convert `FeaturedProperties` to a Server Component
**File:** `packages/frontend/src/components/FeaturedProperties.tsx`
**Impact:** Fixes LCP (content renders with page HTML), fixes CLS (no loading → loaded height shift), removes `console.log`

1. Move the `useProperties()` fetch to `page.tsx` (Server Component) — fetch 3 featured properties server-side
2. Pass properties as props to `FeaturedProperties`
3. Remove `"use client"` directive
4. Add section H2 heading and "Ver todas las propiedades →" CTA link
5. Remove `console.log("propertiesData", propertiesData)` on line 16

---

### 10. Replace `TypingAnimation` Framer Motion dependency with CSS animation
**File:** `packages/frontend/components/ui/typing-animation.tsx`
**Impact:** Removes ~31 KB gzipped from hero bundle, eliminates infinite `setTimeout` loop degrading INP

Use a CSS `@keyframes` typing effect or a minimal `requestAnimationFrame`-based implementation without Framer Motion.

---

### 11. Add `x-default` hreflang everywhere
**Files:** `packages/frontend/src/lib/metadata.ts` and `packages/frontend/app/sitemap.ts`
**Impact:** Google correctly identifies fallback URL for unsupported languages

In `metadata.ts`:
```ts
"x-default": `${BASE_URL}/es${cleanPath}`,
```

In `sitemap.ts` alternates maps — same addition.

---

### 12. Add `SearchAction` to `WebSite` schema
**File:** `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Eligibility for Sitelinks Search Box in Google SERPs

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

### 13. Fix `lastModified` in sitemap for static routes
**File:** `packages/frontend/app/sitemap.ts`
**Impact:** Google stops trusting `lastmod` when it always equals "now"

Replace `lastModified: new Date()` with real hardcoded dates per static route. Update manually when page content changes meaningfully.

---

### 14. Populate `sameAs` in organization schema
**File:** `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Entity disambiguation — helps Google connect Properlia to its social profiles

The layout already fetches `generalInfo` server-side. Use those social URLs:
```ts
sameAs: [generalInfo.linkedin, generalInfo.instagram, generalInfo.facebook, generalInfo.tiktok].filter(Boolean)
```

---

### 15. Add Open Graph and Twitter Card meta tags
**File:** `packages/frontend/src/lib/metadata.ts`
**Impact:** Social shares get proper image/title/description unfurling

Extend `buildMetadata` return:
```ts
openGraph: {
  title: dict[titleKey],
  description: dict[descriptionKey],
  url: `${BASE_URL}/${locale}${cleanPath}`,
  siteName: "Properlia",
  images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  locale: locale === "es" ? "es_MX" : "en_US",
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: dict[titleKey],
  description: dict[descriptionKey],
}
```

---

## Medium — Fix Within 1 Month

### 16. Create `/es/about` and `/en/about` pages
**Impact:** Critical E-E-A-T gap for YMYL-adjacent real estate service

Include: team bios, professional credentials (AMPI license if applicable), founding story, methodology behind the "200 operaciones" and "90 días" claims.

---

### 17. Add H1 and editorial content to the Properties listing page
**File:** `packages/frontend/app/[locale]/properties/PropertiesClient.tsx`
**Impact:** Currently has no H1 and ~80 words of static text (minimum is ~800 words)

Add a server-rendered block above the filter bar:
```
<h1>Propiedades en Venta en Puebla</h1>
<p>Explora casas, departamentos, terrenos y locales comerciales. Filtra por colonia, precio y tipo para encontrar tu propiedad ideal en Puebla.</p>
```

---

### 18. Add `BreadcrumbList` JSON-LD to property detail layout
**File:** `packages/frontend/app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`
**Impact:** Rich breadcrumb results in SERPs for deep property URLs

Build dynamically using property fields + absolute URLs with locale prefix. Visual breadcrumbs in `PropertyDetail.tsx` should also use absolute `href` values.

---

### 19. Fix `areaServed` type in organization schema
**File:** `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Schema validation error — `"State"` is not a Schema.org type

```json
"areaServed": {
  "@type": "AdministrativeArea",
  "name": "Puebla"
}
```

---

### 20. Add `telephone` and `email` to `RealEstateAgent` schema
**File:** `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Required for Local Business knowledge panel display

Populate from the `generalInfo` API call already made in the layout.

---

### 21. Implement server-side pagination on the Properties page
**File:** `packages/frontend/app/[locale]/properties/PropertiesClient.tsx`
**Impact:** Current `{ items: 100 }` causes high LCP + high INP; paginated URLs are not crawlable

Replace client-side pagination with URL-param-based pagination (`?page=2`) fetching one page at a time.

---

### 22. Add hardcoded fallback contact info to the Footer
**File:** `packages/frontend/src/components/Footer.tsx`
**Impact:** Contact info disappears if API is down — trust signal loss

Add static fallback values for phone, WhatsApp, and email that render when `generalInfo` is unavailable.

---

### 23. Fix placeholder image domain in `next.config.js`
**File:** `packages/frontend/next.config.js`
**Impact:** Property images may not be optimized by `next/image`

Replace `your-domain.com` with the actual production hostname(s) for Rails Active Storage.

---

### 24. Add `logo` as `ImageObject` in organization schema
**File:** `packages/frontend/app/[locale]/layout.tsx`
**Impact:** Google prefers `ImageObject` with explicit dimensions

```json
"logo": {
  "@type": "ImageObject",
  "url": "https://properlia.com/properlia.png",
  "width": 200,
  "height": 50
}
```

---

### 25. Add `FeaturedProperties` section heading and CTA
**File:** `packages/frontend/src/components/FeaturedProperties.tsx`
**Impact:** Section is crawlable context-free; no link to `/properties`

Add an H2 (`"Propiedades Destacadas"`) and a "Ver todas →" link to `/properties`.

---

## Low — Backlog

- **L1.** Trim title tags from 70–72 characters to ≤60 characters (safe SERP display on mobile)
- **L2.** Add `height` prop to Navigation logo `<Image>` (fragile CLS guard)
- **L3.** Move `@tanstack/react-query-devtools` to `devDependencies`
- **L4.** Remove commented-out JSX blocks in `Hero.tsx` (lines 74–116, 142–164)
- **L5.** Fix untranslated keys in `en.json`: `"contactMe"` and `"hi"`
- **L6.** Add `console.warn` in development when `NEXT_PUBLIC_GA_ID` is undefined
- **L7.** Consider `next.config.js` `redirects` for root `/` → `/es` to enable CDN caching of the redirect
- **L8.** Add `landSize` (from `land_area`) to `RealEstateListing` JSON-LD
- **L9.** Add `ItemList` schema on the `/properties` collection page
- **L10.** Add neighbourhood/colonia landing pages for high-intent queries (Angelópolis, Zavaleta, La Vista)
- **L11.** Create `llms.txt` at `https://properlia.com/llms.txt` for AI crawler transparency
- **L12.** Add social proof (testimonials, client reviews) — consider a Testimonials component on the homepage
- **L13.** Add sources or methodology notes to investment claims ("8-12% anual", "90 días promedio")

---

## Effort vs Impact Matrix

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| Critical | Fix `addressRegion` bug | 5 min | High |
| Critical | Hero `<Image>` priority + sizes | 5 min | High |
| Critical | Static H1 in Hero | 15 min | High |
| Critical | Remove /services dead link | 5 min | Medium |
| Critical | Nginx HTTP→HTTPS + www redirects | 30 min | High |
| Critical | Nginx security headers | 15 min | Medium |
| High | `x-default` hreflang | 15 min | Medium |
| High | Sitemap `lastModified` fix | 15 min | Medium |
| High | `sameAs` populate from API | 30 min | Medium |
| High | OG / Twitter Card tags | 45 min | Medium |
| High | Font: replace @import with next/font | 1 hr | High |
| High | `FeaturedProperties` → Server Component | 2 hr | High |
| High | `SearchAction` on WebSite schema | 30 min | Medium |
| High | Replace TypingAnimation Framer Motion | 2 hr | High |
| High | Property page → Server Component | 4 hr | High |
| Medium | About page | 4 hr | High |
| Medium | Properties page H1 + editorial | 1 hr | Medium |
| Medium | Server-side pagination | 1 day | Medium |
| Medium | BreadcrumbList JSON-LD | 1 hr | Medium |
