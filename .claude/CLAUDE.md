# Properlia — Claude Code Instructions

## Design System
All frontend and dashboard UI work MUST follow the design system:
→ `docs/design-system.md` (tokens, shared components, rules) and `docs/brand/properlia-brand-guidelines.md` (brand book) before making any UI changes.

## Scope
- `packages/frontend` — public-facing site (properlia.com)
- `packages/dashboard` — internal admin panel
- `packages/backend` — API only, brand guidelines do not apply here

## Rules
- Never hardcode colors — use the `brand-*` Tailwind tokens from `packages/shared/src/styles/globals.css`
- Build UI with the shared primitives in `packages/shared/src/components/ui`
- Never use font-weight 600 or 700
- Never use #47C5FB
- Price formatting: use `formatPriceDisplay()` from `@properlia/shared` and render prices with `<Price>` (gold, tabular-nums)
