# Changelog — links (links.properlia.com)

All notable changes to the link-in-bio site. Newest first. Format: [Keep a Changelog](https://keepachangelog.com/). New work goes under `## [Unreleased]`, grouped by day (`### YYYY-MM-DD`), see the rules in the root `CLAUDE.md`.

## [Unreleased]

### 2026-11-17

#### Changed
- Upgraded Next.js to 16.4.5 and React to 19.2.9 to patch the October and November 2026 security advisories.

## [1.0.0] - 2026-11-11

First tracked version: everything shipped from the start (2026-02-13) until 2026-11-11.

### Added
- Next.js package for `links.properlia.com` with a linktree-style landing page.
- Locale routing with i18n middleware (es/en).
- Google Analytics (GA4) tracking for link clicks.
- Social network links.
- SEO basics: `robots.txt`, metadata, favicon and app icons.
- Brand design tokens and fonts loaded once in the root layout, using the shared UI primitives.
