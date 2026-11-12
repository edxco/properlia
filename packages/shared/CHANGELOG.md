# Changelog — shared (`@properlia/shared`)

All notable changes to the code shared by frontend, dashboard and links. Newest first. Format: [Keep a Changelog](https://keepachangelog.com/). New work goes under `## [Unreleased]`, grouped by day (`### YYYY-MM-DD`), see the rules in the root `CLAUDE.md`.

## [Unreleased]

### 2026-11-11

#### Added
- Leads service: `createForProperty` for the property contact form, sort parameters for the leads list, and the `property_form` lead source.
- Spanish and English strings for the property contact form feedback and the sortable leads table.

## [1.0.0] - 2026-11-11

First tracked version: everything shipped from the start (2025-12-19) until 2026-11-11.

### Added
- API layer: `apiClient` class (auth token, FormData, Next fetch cache options and tags, `ApiError`) and per-resource services for properties, states, cities, leads, general info, users, statuses, listing types, property types and property features, plus shared TypeScript types.
- i18n: Spanish and English message files, `TranslationProvider` with `useT()` / `useLocale()`.
- Route and URL helpers: `ROUTES`, `localizedPath`, `routePaths`, `geoPath`, `localePrefix`, `switchLocalePath` (Spanish unprefixed, English under `/en`), `slugify`, `buildPropertyUrl`, `parsePropertyCode`, `getAbsoluteImageUrl`.
- UI primitives: `Button`/`buttonClasses`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Field`, `Card`, `Badge`, `Chip`, `Alert`, `Switch`, typography (`PageTitle`, `SectionTitle`, `CardTitle`, `Eyebrow`, `Price`), layout (`Container`, `Section`), `Breadcrumbs` and `ImageCarousel`.
- Design tokens in `styles/globals.css`: brand colors, card and pill shadows, Playfair/Inter font variables.
- Utilities: currency and large-number formatting, UUID-based badge color assignment, Google Analytics and Tag Manager components.

### Changed
- Brand tokens and fonts replaced the old Poppins/Lexend setup (deprecated aliases kept).
- General-info API accepts optional cache options for server-side fetching.

### Fixed
- Internal Docker image URLs are rebased to the public API root; image carousel guards against missing images.
