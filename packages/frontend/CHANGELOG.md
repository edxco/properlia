# Changelog — frontend (properlia.com)

All notable changes to the public website. Newest first. Format: [Keep a Changelog](https://keepachangelog.com/). New work goes under `## [Unreleased]`, grouped by day (`### YYYY-MM-DD`), see the rules in the root `CLAUDE.md`.

## [Unreleased]

### 2026-11-11

#### Added
- Property contact form now creates a lead: it shows a success or error message, blocks double submits, and remembers name, email and phone for 15 days with a "Not you?" action to clear them.

#### Fixed
- Home hero no longer gets clipped at the top and bottom on short mobile screens; it now grows with its content while keeping the full-screen height on larger viewports.

## [1.0.0] - 2026-11-11

First tracked version: everything shipped from the project start (2025-11-10) until 2026-11-11.

### Added
- Next.js 16 / React 19 / Tailwind 4 public site with brand design system (Playfair Display + Inter, `brand-*` tokens, shared UI primitives).
- Internationalization: Spanish at the domain root (`/`, `/propiedades`), English under `/en`; localized segments and slugs; `proxy.ts` rewrites internal folders and 301s legacy, uppercase, `/es/...`, wrong-locale and old-slug URLs in one hop.
- Home page (all server components): hero with a single visible H1 and buy/sell CTAs, featured properties, property types with photo tiles, services, zones with listing counts and a Mexico map, about + process, three verbatim Google reviews with stars and a centered "Ver reseñas en Google" button, guides summaries, 5-question FAQ (`<details>`), and a contact panel with WhatsApp.
- Property listing with filters, category banners, pagination and skeleton loading; property cards with price, location, area, features and categories.
- Property detail page: gallery/carousel, feature pills, contact form (public lead endpoint with honeypot, rate limit and duplicate guard), WhatsApp and call actions, similar properties, public property code.
- SEO-friendly URLs: `/propiedades/{title-slug}-{code}`; geo listing pages `/{state}/{city}/{operation}` with noindex below 3 listings; breadcrumbs.
- Buyer consultation (multi-step wizard), seller consultation form, contact, services, privacy, terms and HTML sitemap pages.
- SEO: per-page metadata, canonical + hreflang (`es`, `en`, `x-default`), Open Graph/Twitter cards with `og-home.jpg`, XML sitemap index (`static`, `geo`, `properties-N`) with home `lastmod`, `robots.txt`, JSON-LD (`RealEstateAgent`, `WebSite`, `WebPage`, `ItemList`, `FAQPage`, `RealEstateListing`, `BreadcrumbList`).
- Crawlable navigation (dropdown and mobile menu links always in the HTML) and a server-rendered footer with contact data from `general_info`; skip link and accessible labels.
- Google Analytics / Tag Manager integration, favicon/app icons, on-demand cache revalidation endpoint (`/api/revalidate`).

### Changed
- Hero and photo images served as AVIF/WebP, hero preloaded and optimized (2400 px source); fonts limited to Inter 400/500 and Playfair 500.
- Removed unverified claims from the home and footer copy.

### Fixed
- Footer WhatsApp link now opens `wa.me` instead of `mailto:`.
