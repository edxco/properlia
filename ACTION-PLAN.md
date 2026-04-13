# Properlia SEO — Action Plan

**Generated:** April 2026
**Overall Score:** 63 / 100
**Target Score:** 80 / 100

---

## Critical — Fix Immediately

### 1. Convert property detail page to Server Component
**File:** `app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx`
**Impact:** All property listing content currently invisible to crawlers

Remove `'use client'` + `useParams()` + `useProperty()`. The `propertyApi.getById(id)` call is already made in the sibling `layout.tsx` — extract into a shared server fetch or repeat it. Pass the property data as props to a thin client sub-component only for locale-aware routing.

---

### 2. Replace animated H1 with a static heading
**File:** `src/components/Hero.tsx:54–64`
**Impact:** Homepage has no stable H1 keyword target

Replace the `<TypingAnimation>` inside the `<h1>` with a static primary phrase. Move the animation to a decorative `<p>` below.
```tsx
<h1 className="font-bold text-2xl md:text-5xl lg:text-6xl font-lexend text-white">
  {t("heroStaticH1")}  {/* e.g. "Inmobiliaria en Puebla" */}
</h1>
<p aria-hidden="true">
  <TypingAnimation words={[...]} loop />
</p>
```
Add `"heroStaticH1"` key to both `en.json` and `es.json`.

---

### 3. Fix all broken internal links in Navigation and Footer

| Location | Broken URL | Fix |
|----------|-----------|-----|
| `Navigation.tsx:54,98` | `/${locale}/services` | Remove link until page is created |
| `Footer.tsx:178` | `/${locale}/sell` | Change to `/${locale}/seller-consultation` |
| `Footer.tsx:260` | `/${locale}/terms` | Create page or remove link |
| `Footer.tsx:266` | `/${locale}/privacy` | Create page or remove link |
| `Footer.tsx:272` | `/${locale}/sitemap` | Remove link (sitemap.xml ≠ HTML sitemap page) |

---

## High — Fix Within 1 Week

### 4. Add OpenGraph and Twitter Card metadata
**File:** `src/lib/metadata.ts`
**Impact:** All social shares have no preview image or description

Add to `buildMetadata()`:
```ts
openGraph: {
  title: dict[titleKey],
  description: dict[descriptionKey],
  url: `${BASE_URL}/${normalizedLocale}${cleanPath}`,
  siteName: "Properlia",
  images: [{ url: `${BASE_URL}/properlia.png`, width: 1200, height: 630 }],
  locale: normalizedLocale === "es" ? "es_MX" : "en_US",
  type: "website",
},
twitter: { card: "summary_large_image" },
```
Override `images` on property detail pages to use the first property photo.

---

### 5. Create `/terms` and `/privacy` pages
**Files:** Create `app/[locale]/terms/page.tsx` and `app/[locale]/privacy/page.tsx`
**Impact:** Broken links in footer, missing legal compliance pages

Minimum viable pages with proper metadata. Also required for legal compliance (LFPDPPP — Mexico's data protection law).

---

### 6. Fix `sameAs` in RealEstateAgent schema
**File:** `app/[locale]/layout.tsx:40`
**Impact:** No entity disambiguation for knowledge panel

Fetch `generalInfo` server-side in `layout.tsx` and populate `sameAs` with social profile URLs.

---

### 7. Fix WhatsApp contact link
**File:** `src/components/Footer.tsx:201`
**Impact:** WhatsApp link opens email client instead of WhatsApp

```tsx
// Change:
href={`mailto:${generalInfo.whatsapp}`}
// To:
href={`https://wa.me/${generalInfo.whatsapp.replace(/\D/g, '')}`}
```

---

### 8. Fix `areaServed` schema type
**File:** `app/[locale]/layout.tsx`
**Impact:** Invalid Schema.org type causes validation warnings

```ts
areaServed: { "@type": "AdministrativeArea", name: "Puebla" }
```

---

### 9. Remove `console.log` from FeaturedProperties
**File:** `src/components/FeaturedProperties.tsx:16`
**Impact:** Leaks data shapes in production console

Delete: `console.log("propertiesData", propertiesData);`

---

## Medium — Fix Within 1 Month

### 10. Add section headings to FeaturedProperties and ServiceTiles
**Files:** `src/components/FeaturedProperties.tsx`, `src/components/ServiceTiles.tsx`

FeaturedProperties needs an `<h2>` (e.g., `{t("featuredProperties")}`). ServiceTiles needs an `<h2>` above the three `<h3>` cards.

---

### 11. Add OpenGraph image to `buildMetadata` and use property photo on listings
**Covered in item 4 above** — listed separately to track property-specific override.

---

### 12. Replace Google Fonts CSS import with `next/font/google`
**File:** `packages/shared/src/styles/globals.css`
**Impact:** Render-blocking cross-origin font request hurts LCP

```ts
// In layout or _app:
import { Poppins, Lexend } from 'next/font/google';
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '700'] });
const lexend = Lexend({ subsets: ['latin'] });
```
Remove `@import` from globals.css.

---

### 13. Fix loading state CLS in FeaturedProperties
**File:** `src/components/FeaturedProperties.tsx`
**Impact:** Layout shift when cards load

Replace loading text with a skeleton grid matching the card grid dimensions:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1,2,3].map(i => <div key={i} className="h-96 bg-stone-100 rounded-lg animate-pulse" />)}
</div>
```

---

### 14. Update `next.config.js` image domain
**File:** `next.config.js`
**Impact:** Property images from production backend may not be optimized

Replace `'your-domain.com'` placeholder with the actual Rails production hostname.

---

### 15. Add `SearchAction` to WebSite schema
**File:** `app/[locale]/layout.tsx`
**Impact:** Enables Sitelinks Search Box in Google SERPs

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

### 16. Fix static route `lastModified` in sitemap
**File:** `app/sitemap.ts:64`

Replace `new Date()` with a hardcoded date for static routes:
```ts
lastModified: new Date("2026-01-15"),
```

---

### 17. Fix translation file issues
**File:** `packages/shared/src/messages/en.json`

- `"contactMe": "contact"` (was `"contactar"`)
- `"propertyDetails"` — add a real value or remove the key
- `"hi"` and `"modernApartmentInLomas"` — remove test data keys

---

### 18. Add HTTP→HTTPS redirect for dashboard subdomain
**File:** `nginx/nginx.conf`

The dashboard server block listens on port 80 without redirecting. Add:
```nginx
server {
    listen 80;
    server_name dashboard.properlia.com;
    return 301 https://$host$request_uri;
}
```

---

## Low — Backlog

### 19. Create an About page
**Path:** `app/[locale]/about/page.tsx`

Include: team bios, agent credentials (AMPI membership if applicable), founding story, methodology behind the "+200 deals" claim. This is the single highest-impact E-E-A-T improvement.

### 20. Add `BreadcrumbList` schema to property pages
**File:** `app/[locale]/properties/[state]/[city]/[id]/[slug]/layout.tsx`

Add breadcrumb JSON-LD: Home → Properties → [State] → [City] → [Property Title].

### 21. Add `telephone` and `email` to `RealEstateAgent` schema
**File:** `app/[locale]/layout.tsx`

Fetch contact info from `generalInfo` API server-side and populate `telephone` and `email` in the schema.

### 22. Convert `ServiceTiles` and `MainAbout` to Server Components
**Files:** `src/components/ServiceTiles.tsx`, `src/components/MainAbout.tsx`

Neither uses any client-side API or state. Removing `"use client"` reduces the JS bundle shipped on the homepage.

### 23. Create `public/llms.txt`
For AI search readiness — list key URLs and describe the site's content and purpose for AI crawlers.

### 24. Add neighborhood/colonia landing pages
Highest long-term SEO opportunity. Static or server-rendered pages like `/es/properties/puebla/angelopolis` targeting high-intent local queries. Implement after fixing the above.

### 25. Add `ItemList` schema to properties listing page
**File:** `app/[locale]/properties/page.tsx`

When properties are fetched server-side (depends on fix from item 1 cascade), add `ItemList` JSON-LD for the first page of results.

---

## Score Projection

| Fix | Score Gain |
|-----|------------|
| Property detail → SSR | +5 |
| Static H1 | +3 |
| Fix broken links | +3 |
| OpenGraph / Twitter | +3 |
| Terms + Privacy pages | +2 |
| Schema fixes (sameAs, areaServed, SearchAction) | +3 |
| Font + CLS fixes | +2 |
| About page + E-E-A-T content | +4 |
| **Total projected** | **+25 → ~88** |
