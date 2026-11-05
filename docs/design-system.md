# Properlia Design System Rules

System-wide rules that extend the brand book (v1.0) and the property-card spec in `design-guidelines/README.md` (local brand handoff). They cover the frontend, dashboard and links apps. All tokens live in `packages/shared/src/styles/globals.css`.

## 0. Components first
Before writing classes, use the shared primitives in `packages/shared/src/components/ui` (import from `@properlia/shared/components/ui`). They encode the rules below.

| Need | Use |
|---|---|
| Button | `<Button variant size>`; for `Link`/`a` use `className={buttonClasses({ variant, size })}`. Variants: `primary`, `secondary`, `ghost`, `destructive`, `inverse` (white on navy), `outlineInverse` (white outline on navy), `link`. Sizes: `xs`, `sm`, `md`, `lg`, `icon` |
| Form control | `Input`, `Select`, `Textarea` (`invalid` for errors, `controlSize="sm"` for toolbars and filters), `PasswordInput` (show/hide toggle; pass `visible`/`onVisibleChange` to sync with a confirmation field), `Label`, `Field` (label + hint/error); `controlClasses()` for custom controls |
| Toggle | `Switch` (on/off setting); `Chip` (`selected`) for filters and multi-select pills |
| Feedback | `<Alert tone>` for inline messages: `info`, `success`, `warning`, `danger` |
| Card / panel | `<Card padding="none" or "sm" or "md" interactive>` or `cardClasses()` |
| Pill / badge | `<Badge tone size>` for read-only labels. Tones: `neutral`, `muted`, `info`, `navy`, `success`, `warning`, `danger`, `onPhoto` |
| Headings | `PageTitle` (h1), `SectionTitle` (h2), `CardTitle` (h3 inside cards), `DashboardTitle`, `Eyebrow`, `Price` |
| Layout | `Container`, `Section` (`tone`: white, base, pale, navy) |

Pass layout classes (margin, width, grid placement) through `className`. `cn` merges conflicts, including the custom `rounded-card` and `shadow-*` tokens. If a primitive can't express what you need, extend the primitive rather than hand-styling a one-off.

**Never use** raw hex values in class names, Tailwind palette colors (`gray-*`, `stone-*`, `slate-*`, `blue-*`, `indigo-*`, `sky-*`…), `font-semibold`/`font-bold`, or sky blue `#47C5FB`.

## 1. Color

### Brand tokens
| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#214C9B` | Primary actions, links, focus rings, active states |
| `brand-navy` | `#1A3A5C` | Page and section titles, secondary buttons, dark sections |
| `brand-pale` | `#E8F0F8` | Soft surfaces, selected rows, info callouts, photo fallback |
| `brand-gold` | `#C4A44A` | **Prices and value figures only.** Never a fill, banner or button |
| `brand-carbon` | `#2C2C2A` | Body text |
| `brand-gray` | `#888780` | Metadata, labels, icons, placeholders |
| `brand-bg` | `#F6F6F2` | Page background, subtle fills inside white cards |
| `brand-border` | `#EAEAE3` | Card borders, dividers |
| `input` | `#D6D5CC` | Form-control borders (needs 3:1 against white) |

### Text hierarchy
| Role | Class |
|---|---|
| Page / section title | `text-brand-navy` |
| Body | `text-brand-carbon` |
| Secondary paragraph | `text-brand-carbon/70` |
| Metadata, captions, icons | `text-brand-gray` (never for paragraphs: contrast is too low) |
| Link | `text-brand-blue hover:text-brand-navy` |
| On dark (`bg-brand-navy`) | `text-white`, secondary `text-white/70` |

### Status colors
Gold must never be used for status. Use the soft background with the matching text, and add the border only when the element needs separation.

| Status | Text / solid | Soft bg | Border |
|---|---|---|---|
| Danger / error | `danger` | `danger-soft` | `border-danger/30` |
| Success | `success` | `success-soft` | `border-success/30` |
| Warning / pending | `warning` | `warning-soft` | `border-warning/30` |
| Info / neutral highlight | `brand-blue` | `brand-pale` | `border-brand-blue/20` |

### Property status badges
| Status | Background | Text |
|---|---|---|
| Active | `brand-pale` | `brand-blue` |
| On hold | `warning-soft` | `warning` |
| Sold / Leased | `success-soft` | `success` |
| Suspended | `danger-soft` | `danger` |
| Expired | `brand-bg` | `brand-gray` |

Property type pills are always `bg-brand-navy text-white`. Operation pills (sale, rent, pre-sale) are always `bg-brand-pale text-brand-blue`.

## 2. Typography
Fonts are loaded once per app in the root `layout.tsx`. `font-sans` (Inter) is the default; `font-display` is Playfair Display.

| Role | Classes |
|---|---|
| Page title (h1) | `font-display font-medium text-4xl md:text-5xl text-brand-navy tracking-tight` |
| Section title (h2) | `font-display font-medium text-3xl md:text-4xl text-brand-navy` |
| Dashboard page title | `font-display font-medium text-2xl text-brand-navy` |
| Card / subsection title (h3) | `font-medium text-lg text-brand-carbon` |
| Eyebrow | `text-xs font-medium uppercase tracking-[0.14em] text-brand-blue` |
| Body | `text-base leading-relaxed text-brand-carbon` |
| Small / meta | `text-sm text-brand-gray` |
| Price | `font-medium tabular-nums text-brand-gold` |

- Weights: `font-normal` and `font-medium` only. Emphasis comes from size, color or font family, not weight.
- Any number (price, area, count, date in a table) gets `tabular-nums`.

## 3. Shape and elevation
| Element | Radius | Shadow |
|---|---|---|
| Card, panel, modal, image block | `rounded-card` (16px) | `shadow-card` |
| Button, input, select, textarea, dropdown | `rounded-lg` (10px) | none |
| Pill, badge, avatar, icon button | `rounded-full` | `shadow-pill` when on a photo |
| Modal, popover, floating panel, hero form | `rounded-card` | `shadow-overlay` |

Card hover (clickable cards only): `transition hover:-translate-y-0.5 hover:shadow-overlay`.

Don't use `shadow-sm/md/lg/xl` or arbitrary shadows.

## 4. Controls
All controls share `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2` and `disabled:opacity-50 disabled:pointer-events-none`.

| Variant | Classes |
|---|---|
| Primary | `bg-brand-blue text-white hover:bg-brand-navy` |
| Secondary | `border border-brand-navy/25 text-brand-navy hover:border-brand-navy hover:bg-brand-navy/[0.04]` |
| Ghost | `text-brand-navy hover:bg-brand-pale` |
| Destructive | `bg-danger text-white hover:bg-danger/90` |
| Link | `text-brand-blue underline-offset-4 hover:underline` |

| Size | Classes |
|---|---|
| sm | `h-9 px-4 text-sm` |
| md (default) | `h-11 px-6 text-sm` |
| lg | `h-12 px-8 text-base` |

Buttons are `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors`.

**Inputs:** `h-11 w-full rounded-lg border border-input bg-white px-3.5 text-sm text-brand-carbon placeholder:text-brand-gray focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20`. Textareas use the same classes with `py-2.5` and no fixed height. Checkboxes and radios use `accent-brand-blue`.

- Label: `mb-1.5 block text-sm font-medium text-brand-carbon`
- Helper text: `mt-1.5 text-sm text-brand-gray`
- Error text: `mt-1.5 text-sm text-danger`, and the input gets `border-danger`

## 5. Layout and spacing
- Container: `mx-auto max-w-[1180px] px-4 md:px-10`
- Section vertical rhythm: `py-16 md:py-24`; the gap between a section header and its content is `mb-10`
- Card grid: `grid gap-7` (28px), `grid-cols-[repeat(auto-fill,minmax(330px,1fr))]` for property cards
- Card padding: `p-5` for compact cards, `p-6 md:p-8` for content panels
- Dashboard: page background `brand-bg`, content in white `rounded-card` panels; tables sit inside a panel with `divide-y divide-brand-border` and header text `text-xs uppercase tracking-wide text-brand-gray`

## 6. Icons and imagery
- Tabler outline icons (`@tabler/icons-react`); Lucide is accepted with `strokeWidth={1.75}`. Sizes 16 (inline), 20 (buttons), 24 (features). Color `currentColor`, usually `text-brand-gray` or the parent text color.
- Photography: real listing photos with natural light. Image fallback background is `brand-pale`.
- Dark photo overlays use navy, not black: `bg-gradient-to-t from-brand-navy/80 to-transparent`.

## 7. Motion
`transition-colors` or `transition` at the default duration (150ms) up to `duration-200`. No bounces or spring effects. Respect `motion-reduce:` for anything that moves.
