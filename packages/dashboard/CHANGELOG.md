# Changelog — dashboard (admin panel)

All notable changes to the internal admin panel. Newest first. Format: [Keep a Changelog](https://keepachangelog.com/). New work goes under `## [Unreleased]`, grouped by day (`### YYYY-MM-DD`), see the rules in the root `CLAUDE.md`.

## [Unreleased]

### 2026-11-13

#### Added
- Admins can permanently delete a lead from the leads table (with confirmation).

### 2026-11-11

#### Added
- Leads list is now a sortable table (date, name, contact, property, source, interest, status) with server-side sorting and a filter by property.
- Properties show how many contact requests they received.

## [1.0.0] - 2026-11-11

First tracked version: everything shipped from the start (2025-12-19) until 2026-11-11.

### Added
- Authentication with JWT login page (brand typography, logo, password toggle), auth context and redirect to login without a session; `noindex` so search engines skip the panel.
- Properties management: filterable and paginated table (page-size selector, combined filter bar), dedicated new/edit pages, property detail after save, listing types and status, public property code.
- Property form with validation and required-field indicators, categories and searchable feature autocomplete, image upload with drag and drop, drag-and-drop reordering, delete-all with confirmation, WebP-to-PNG conversion (covered by Vitest).
- PDF fact sheet generation with preview, custom templates and a toggle for Properlia branding.
- Leads table for CRM visualization.
- General information page (phone, WhatsApp, emails, social networks), editable by admins only.
- Property features management and admin users management (CRUD).
- Image generator page with a Tiptap rich-text editor.
- Toast notifications, admin dropdown menu, es/en translations, brand tokens and shared UI primitives.

### Changed
- Properties moved from modals to dedicated pages; image reordering optimized (memoized components, URL cache) and persisted on submit.
