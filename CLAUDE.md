# Properlia project
Properlia is a real estate platform built as a monorepo using Docker Compose for local development and deployment, with the following structure:

# Stack
- Ruby on Rails
- Next.js

# Structure
- Backend: Ruby on Rails API serving property data and handling business logic.

- Frontend packages (Next.js): 
  - Frontend: Main client-facing application for property browsing
  - Dashboard: Admin/agent dashboard
  - Shared: Common utilities and types


# Design system (brand book v1.0)
Source of truth: `docs/design-system.md` (system-wide rules: tokens, type scale, controls, status colors, layout) `docs/brand/properlia-brand-guidelines.md` (brand book) and `design-guidelines/README.md` (property card spec, local only). Read both before building or restyling any UI.

- Colors:
  - Azul Properlia `#214C9B`: actions, links, accents
  - Azul marino `#1A3A5C`: headings, authority
  - Azul pálido `#E8F0F8`: soft surfaces
  - Carbón `#2C2C2A`: primary text
  - Gris `#888780`: secondary text, icons
  - Fondo `#F6F6F2`: page background
  - Border `#EAEAE3`
  - Dorado `#C4A44A`: prices/value ONLY, never as a fill or banner
  - Forbidden: sky blue `#47C5FB`
- Typography:
  - Page titles: Playfair Display 500
  - Everything else: Inter, weights 400 and 500 only (no `font-semibold`/`font-bold`)
  - Numbers and prices: `tabular-nums`
  - Fonts are loaded once in each app's root `layout.tsx` (`--font-editorial-display`, `--font-editorial-body`). Use `font-sans` (default) and `font-display`; never load fonts per page. `font-poppins`/`font-lexend` are deprecated aliases.
- Build UI with the primitives in `shared/src/components/ui` (`Button`/`buttonClasses`, `Input`/`PasswordInput`/`Select`/`Textarea`/`Field`, `Card`, `Badge`, `PageTitle`/`SectionTitle`/`DashboardTitle`/`Eyebrow`/`Price`, `Container`/`Section`), imported from `@properlia/shared/components/ui`. Extend a primitive instead of hand-styling one-offs.
- Tokens live in `shared/src/styles/globals.css`. Use them instead of hex values:
  - Colors: `brand-blue`, `brand-navy`, `brand-pale`, `brand-gold`, `brand-carbon`, `brand-gray`, `brand-bg`, `brand-border` (e.g. `text-brand-navy`); shadcn tokens (`primary`, `border`, `muted-foreground`…) map to the same palette
  - Card: `rounded-card shadow-card`; pills: `shadow-pill`, `shadow-pill-strong`; area badge: `shadow-badge`
- Cards: `rounded-2xl` (16px), border `#EAEAE3`, shadow `0 1px 2px rgba(20,30,50,.06), 0 14px 30px -22px rgba(20,30,50,.38)`
- Pills and badges: fully rounded
- Icons: outline style, 1.5–2px stroke. Tabler per the brand book; Lucide with `strokeWidth={1.75}` is accepted in the frontend.
- Primary language is Spanish. Every UI string goes in both `shared/src/messages/es.json` and `en.json`.

# Considerations
- Always reply in english (code in english) even input spanish
- Not use large (simplify) explanatory comments unless requested
- When asking for creating commits message, never add any claude co-author comments