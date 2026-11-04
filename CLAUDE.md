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
Source of truth: `design-guidelines/README.md`. Read it before building or restyling any UI.

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
  - Load fonts with `next/font` in the route's `page.tsx` using the variables `--font-editorial-display` and `--font-editorial-body` (see `seller-consultation/page.tsx`)
- Cards: `rounded-2xl` (16px), border `#EAEAE3`, shadow `0 1px 2px rgba(20,30,50,.06), 0 14px 30px -22px rgba(20,30,50,.38)`
- Pills and badges: fully rounded
- Icons: outline style, 1.5–2px stroke. Tabler per the brand book; Lucide with `strokeWidth={1.75}` is accepted in the frontend.
- Primary language is Spanish. Every UI string goes in both `shared/src/messages/es.json` and `en.json`.

# Considerations
- Always reply in english (code in english) even input spanish
- Not use large (simplify) explanatory comments unless requested
- When asking for creating commits message, never add any claude co-author comments