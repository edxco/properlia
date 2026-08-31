# Properlia SEO Action Plan

**Generated:** 2026-05-05  
**Overall SEO Health Score:** 47/100  
**Target:** 70+ within 60 days

---

## CRITICAL — Fix Immediately (Blocking Indexing)

### C1. Fix robots.txt and sitemap.xml returning 404
**File:** `packages/frontend/src/middleware.ts`  
**Effort:** 30 minutes  
**Impact:** Google currently has no robots.txt and cannot access the sitemap. This is the single most damaging issue on the site.

Add `robots.txt` and `sitemap.xml` to the middleware bypass list:

```typescript
if (
  pathname.startsWith("/_next") ||
  pathname.startsWith("/static") ||
  pathname.startsWith("/images") ||
  pathname === "/favicon.ico" ||
  pathname === "/robots.txt" ||   // ADD
  pathname === "/sitemap.xml"     // ADD
) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|images|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
```

After deploying, verify:
```bash
curl -sI https://properlia.com/robots.txt   # expect 200
curl -sI https://properlia.com/sitemap.xml  # expect 200
```

---

## HIGH — Fix Within 1 Week (Significant Ranking Impact)

### H1. Re-enable the MainAbout section on the homepage
**File:** `packages/frontend/app/[locale]/page.tsx`  
**Effort:** 5 minutes (uncomment) + 1–2 hours (content improvement)  
**Impact:** Restores the only prose content. Brings homepage from ~120 words to 350+ words.

Step 1 — Uncomment `<MainAbout />` in page.tsx.

Step 2 — Fix non-functional buttons in `MainAbout.tsx` (no href/onClick). Link to `/${locale}/buyer-consultation` and `/${locale}/properties`.

Step 3 — Expand `properliaBriefDescription` in translation files to ~100–150 words covering zones served, founding context, and advisory methodology.

### H2. Add H1 to the properties listing page
**File:** `packages/frontend/app/[locale]/properties/PropertiesClient.tsx`  
**Effort:** 15 minutes  

```tsx
<h1 className="sr-only">
  {t("propertiesMetaTitle")}
</h1>
```

### H3. Populate sameAs in the JSON-LD schema
**File:** `packages/frontend/app/[locale]/layout.tsx`  
**Effort:** 30 minutes  

```typescript
sameAs: [
  "https://www.instagram.com/properlia",
  "https://www.facebook.com/properlia",
  "https://www.linkedin.com/company/properlia",
  "https://www.tiktok.com/@properlia",
],
```

### H4. Add SearchAction to WebSite schema
**File:** `packages/frontend/app/[locale]/layout.tsx`  
**Effort:** 20 minutes  
**Impact:** Enables Google sitelinks search box in branded SERPs.

Add `potentialAction` to the WebSite node in the existing `jsonLd` object:
```typescript
potentialAction: {
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://properlia.com/es/properties?search={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
```

### H5. Add /services to sitemap.ts
**File:** `packages/frontend/app/sitemap.ts`  
**Effort:** 5 minutes  

```typescript
const staticRoutes = [
  { path: "", lastMod: "2025-10-01" },
  { path: "/properties", lastMod: "2026-01-15" },
  { path: "/services", lastMod: "2026-04-01" },       // ADD
  { path: "/buyer-consultation", lastMod: "2025-11-20" },
  { path: "/seller-consultation", lastMod: "2025-11-20" },
];
```

### H6. Add BreadcrumbList schema to inner pages
**Files:** `properties/page.tsx`, `services/page.tsx`, `buyer-consultation/page.tsx`, `seller-consultation/page.tsx`  
**Effort:** 2 hours  

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Properlia", "item": `https://properlia.com/${locale}` },
    { "@type": "ListItem", "position": 2, "name": pageTitle, "item": `https://properlia.com/${locale}/properties` }
  ]
};
```

### H7. Add telephone to RealEstateAgent schema
**File:** `packages/frontend/app/[locale]/layout.tsx`  
**Effort:** 10 minutes  

```typescript
telephone: "+52 222 XXX XXXX",
```

### H8. Fix filter input font sizes (iOS zoom prevention)
**File:** `packages/frontend/app/[locale]/properties/PropertyFiltersBar.tsx`  
**Effort:** 30 minutes  

Change all `<input>` and `<select>` from `text-xs` to at least `text-sm`. Inputs must have `font-size: 16px` minimum to prevent Safari iOS from auto-zooming.

---

## MEDIUM — Fix Within 1 Month

### M1. Add testimonials section
**Effort:** 4–8 hours  
**Impact:** Largest single E-E-A-T gap. Transforms trust profile.

Add a `Testimonials` component to the homepage (between ServiceTiles and FeaturedProperties) and both consultation pages. Start with 3 hardcoded testimonials in translation files.

```json
{
  "testimonials": [
    {
      "name": "Ana G.",
      "location": "Puebla",
      "type": "Compra",
      "text": "Encontramos el depa que buscábamos en 3 semanas. El proceso fue claro y sin sorpresas."
    }
  ]
}
```

### M2. Fix Services page H1 keyword
**Files:** `packages/shared/src/messages/es.json`, `en.json`  
**Effort:** 15 minutes  

Change `"servicesPageTitle"` from `"Servicios"` to `"Servicios Inmobiliarios en Puebla"` / `"Real Estate Services in Puebla"`.

### M3. Add FAQ section + FAQPage schema to consultation pages
**Files:** `buyer-consultation/BuyerConsultationClient.tsx`, `seller-consultation/SellPropertyClient.tsx`  
**Effort:** 3–4 hours  
**Impact:** Most accessible path to featured snippets and AI overview inclusion.

Example buyer FAQ:
- "¿Cuánto dura la consulta?" → "30 minutos sin costo."
- "¿Qué información necesito?" → "Solo tu presupuesto y características que buscas."
- "¿Cuánto tarda el proceso de compra?" → "En promedio 30–90 días."
- "¿Trabajan con financiamiento?" → response

### M4. Add geo coordinates to RealEstateAgent schema
**File:** `packages/frontend/app/[locale]/layout.tsx`  

```typescript
geo: {
  "@type": "GeoCoordinates",
  "latitude": 19.0024,
  "longitude": -98.2294
}
```

### M5. Add ItemList schema to properties page
**File:** `packages/frontend/app/[locale]/properties/page.tsx`  
**Effort:** 2 hours  

Generate server-side from prefetched first page of properties.

### M6. Fix lastmod dates in sitemap.ts
**File:** `packages/frontend/app/sitemap.ts`  

Replace `lastModified: new Date()` with real hardcoded ISO dates for all static routes.

### M7. Remove priority and changeFrequency from sitemap
**File:** `packages/frontend/app/sitemap.ts`  

Google ignores both fields. Remove from all entries.

### M8. Migrate Google Fonts to next/font
**File:** `packages/shared/src/styles/globals.css`  
**Effort:** 2–3 hours  

Replace CSS `@import` with `next/font/google` in the layout for automatic subsetting, preloading, and zero layout shift.

### M9. Add phone number / WhatsApp to navigation or hero
**Files:** `Navigation.tsx` or `Hero.tsx`  
**Effort:** 1–2 hours  

Contact info above the fold is a critical trust signal for real estate in Mexico.

### M10. Add Service schema to services page
**File:** `packages/frontend/app/[locale]/services/page.tsx`  

One `Service` JSON-LD block per service section.

### M11. Add Content-Security-Policy header
**Effort:** 4–6 hours (policy needs tuning per inline scripts)

### M12. Fix hamburger menu tap target
**File:** `packages/frontend/src/components/Navigation.tsx`  

Add `p-2` or `min-w-[44px] min-h-[44px]` to meet 44px touch target minimum.

---

## LOW — Backlog

### L1. Add FeaturedProperties skeleton loading state
Replace plain text fallback with CSS skeleton grid to prevent CLS.

### L2. Fix investment category filter link
ServiceTiles "invest" tile links to `/properties?category=investment` but the parameter is not handled in `PropertiesClient.tsx`.

### L3. Fix English translation bugs
- `"contactMe": "contactar"` → "Contact me"
- `"hi": "hola"` → remove or correct

### L4. Add llms.txt
Guide AI crawlers (ChatGPT, Claude, Perplexity) via `/public/llms.txt`.

### L5. Plan sitemap index for scale
Split into `sitemap-static.xml` + `sitemap-properties.xml` when property count approaches 10,000.

### L6. Remove unused alternates block from sitemap.ts
`alternates.languages` in `MetadataRoute.Sitemap` is silently discarded by Next.js — remove to reduce code confusion.

### L7. Add openingHours and priceRange to RealEstateAgent schema

---

## Priority Matrix

| Priority | Item | Effort | Score Impact |
|---|---|---|---|
| 🔴 Critical | C1. Fix robots.txt/sitemap middleware | 30 min | Unblocks indexing |
| 🟠 High | H1. Re-enable MainAbout | 5 min + 2h | +12 pts content |
| 🟠 High | H2. H1 on /properties | 15 min | +5 pts on-page |
| 🟠 High | H3. Populate sameAs | 30 min | +8 pts schema |
| 🟠 High | H4. SearchAction schema | 20 min | +5 pts schema |
| 🟠 High | H5. /services to sitemap | 5 min | +3 pts technical |
| 🟠 High | H6. BreadcrumbList schema | 2h | +5 pts schema |
| 🟠 High | H7. telephone on schema | 10 min | +2 pts schema |
| 🟠 High | H8. iOS input font size | 30 min | +4 pts performance |
| 🟡 Medium | M1. Testimonials | 4–8h | +10 pts E-E-A-T |
| 🟡 Medium | M3. FAQ schema | 3–4h | +5 pts AI/schema |
| 🟡 Medium | M2, M4–M12 | varies | incremental |
| 🟢 Low | L1–L7 | varies | polish |

**Projected score after Critical + High:** 47 → ~66  
**Projected score after all Medium:** ~75
