# Properlia — Claude Code Instructions

## Design System
All frontend and dashboard UI work MUST follow the brand guidelines:
→ See /docs/brand/BRAND.md before making any UI changes.

## Scope
- `packages/frontend` — public-facing site (properlia.com)
- `packages/dashboard` — internal admin panel
- `packages/backend` — API only, brand guidelines do not apply here

## Rules
- Never hardcode colors — use CSS custom properties from BRAND.md
- Never use font-weight 600 or 700
- Never use #47C5FB
- Price formatting: always use the formatPrice() utility from BRAND.md