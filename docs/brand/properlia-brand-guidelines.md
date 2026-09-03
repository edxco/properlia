# Properlia — Brand Guidelines for Frontend Development

> **Brand Book v1.0** · Keller Williams affiliate · Puebla, México  
> Tagline: *"Tu patrimonio, con certeza."*  
> Archetypes: Ruler + Sage — calm, consultive, data-backed. Never alarmist.

---

## 1. Color Tokens

### CSS Custom Properties

```css
:root {
  /* Primary */
  --color-navy:        #1A3A5C; /* Headers, backgrounds, footer */
  --color-blue:        #214C9B; /* CTAs, links, interactive elements */

  /* Accent */
  --color-gold:        #C4A44A; /* Prices, badges, key accents ONLY */
  --color-gold-light:  #F0E4B8; /* Testimonial backgrounds */
  --color-gold-dark:   #7A6228; /* Text on gold-light backgrounds */

  /* Surfaces */
  --color-blue-light:  #E8F0F8; /* Badges, hover cards, filter chips */
  --color-bg:          #F6F6F2; /* Page background */

  /* Text */
  --color-text-primary:   #2C2C2A; /* Body, card titles, form labels */
  --color-text-secondary: #888780; /* Meta, m², dates, placeholders */
  --color-text-body:      #444441; /* Running paragraphs */

  /* Borders */
  --color-border:      #E8E8E4; /* Cards, inputs, dividers */

  /* ❌ ELIMINATED — never use in client-facing materials */
  /* --color-sky: #47C5FB; */
}
```

### Tailwind Config (if applicable)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy:       '#1A3A5C',
        blue:       '#214C9B',
        gold:       '#C4A44A',
        'gold-light': '#F0E4B8',
        'gold-dark':  '#7A6228',
        'blue-light': '#E8F0F8',
        bg:         '#F6F6F2',
        carbon:     '#2C2C2A',
        gray:       '#888780',
        border:     '#E8E8E4',
      },
    },
  },
}
```

### Color Role Reference

| Token | Hex | Use |
|---|---|---|
| `--color-navy` | `#1A3A5C` | Navbar, hero, footer, formal headers |
| `--color-blue` | `#214C9B` | Primary CTA buttons, links, focus rings |
| `--color-gold` | `#C4A44A` | Prices, "Destacada" badge, key CTA on dark bg |
| `--color-gold-light` | `#F0E4B8` | Testimonial card background |
| `--color-gold-dark` | `#7A6228` | Text placed on `gold-light` surfaces |
| `--color-blue-light` | `#E8F0F8` | Status badges, chips, card hover surface |
| `--color-bg` | `#F6F6F2` | Page/section background |
| `--color-text-primary` | `#2C2C2A` | Card titles, form labels, nav items |
| `--color-text-secondary` | `#888780` | m², dates, secondary info |
| `--color-text-body` | `#444441` | Paragraphs, descriptions |
| `--color-border` | `#E8E8E4` | Card borders, input borders, dividers |
| ~~`#47C5FB`~~ | — | ❌ Eliminated. Do not use. |

---

## 2. Typography

### Font Imports

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

### CSS Base

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-ui:      'Inter', system-ui, sans-serif;

  /* Weights — ONLY these two. Never 600, 700, or Black. */
  --weight-regular: 400;
  --weight-medium:  500;
}

body {
  font-family: var(--font-ui);
  font-weight: var(--weight-regular);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
```

### Type Scale

```css
/* H1 — Editorial hero. Playfair only. */
.text-h1 {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: var(--weight-regular); /* 400 */
  line-height: 1.15;
  color: var(--color-navy);
}

/* H2 — Section titles. Playfair only. */
.text-h2 {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: var(--weight-regular);
  line-height: 1.2;
  color: var(--color-navy);
}

/* H3 — Card titles, sub-sections. Inter. */
.text-h3 {
  font-family: var(--font-ui);
  font-size: 18px;
  font-weight: var(--weight-medium); /* 500 */
  line-height: 1.3;
  color: var(--color-text-primary);
}

/* Price — Always gold. Inter medium. */
.text-price {
  font-family: var(--font-ui);
  font-size: 22px;
  font-weight: var(--weight-medium);
  color: var(--color-gold);
  font-variant-numeric: tabular-nums;
}

/* Body — Running paragraphs. */
.text-body {
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: var(--weight-regular);
  line-height: 1.7;
  color: var(--color-text-body);
}

/* Meta — Secondary info (m², dates, location). */
.text-meta {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: var(--weight-regular);
  color: var(--color-text-secondary);
}

/* Label — UI labels, field names, categories. */
.text-label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* Button text */
.text-btn {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
}
```

### TypeScript Type Definitions (if using a design token system)

```ts
export type FontFamily = 'display' | 'ui';
export type FontWeight = 400 | 500; // Never 600 or 700

export type TextVariant =
  | 'h1'       // Playfair 400 36px navy — hero only
  | 'h2'       // Playfair 400 26px navy — section titles
  | 'h3'       // Inter 500 18px carbon — card titles
  | 'price'    // Inter 500 22px gold — prices only
  | 'body'     // Inter 400 15px #444441
  | 'meta'     // Inter 400 13px gray — m², dates
  | 'label'    // Inter 500 11px gray uppercase — UI labels
  | 'btn';     // Inter 500 13px — button text
```

---

## 3. Spacing & Layout

```css
:root {
  /* Page margins */
  --spacing-page-margin: 48px;       /* Desktop content margin */
  --spacing-page-margin-mobile: 20px;

  /* Component internals */
  --spacing-card-padding: 14px 16px;
  --spacing-section-gap: 64px;
  --spacing-card-gap: 16px;

  /* Border radius */
  --radius-card: 8px;
  --radius-badge: 3px;
  --radius-btn: 4px;
  --radius-input: 4px;
}
```

---

## 4. Component Specs

### Property Card

```
┌───────────────────────────────────┐
│  [PHOTO — 100% width, 200px h]    │
│  [badge: operation] [badge: cat]  │  ← absolute, over photo
├───────────────────────────────────┤
│  TIPO DE PROPIEDAD  (label 11px)  │
│  $4,200,000 MXN     (price 22px)  │
│  Colonia, Ciudad, Estado (meta)   │
└───────────────────────────────────┘
```

```css
.property-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.property-card:hover {
  box-shadow: 0 4px 16px rgba(26, 58, 92, 0.12);
  transform: translateY(-2px);
}

.property-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  position: relative;
}

.property-card__badges {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
}

.property-card__body {
  padding: var(--spacing-card-padding);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

### Badges

```css
/* Base badge */
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: var(--radius-badge);
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.4;
}

/* Operation type */
.badge--venta    { background: var(--color-blue);  color: #ffffff; }
.badge--renta    { background: var(--color-blue);  color: #ffffff; }
.badge--preventa { background: var(--color-navy);  color: var(--color-gold); }

/* Property category */
.badge--residencial { background: var(--color-blue-light); color: var(--color-navy); }
.badge--comercial   { background: var(--color-gold-light); color: var(--color-gold-dark); }
.badge--industrial  { background: var(--color-text-primary); color: #ffffff; }
```

### Buttons

```css
/* Primary */
.btn-primary {
  background: var(--color-blue);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-btn);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover { background: var(--color-navy); }

/* Secondary (gold — dark backgrounds only) */
.btn-secondary {
  background: var(--color-gold);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-btn);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: var(--weight-medium);
  cursor: pointer;
}

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--color-blue);
  border: 1px solid var(--color-blue);
  padding: 9px 20px;
  border-radius: var(--radius-btn);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-outline:hover { background: var(--color-blue-light); }
```

### Price Formatter

```ts
// utils/formatPrice.ts
export function formatPrice(
  amount: number,
  currency: 'MXN' | 'USD' = 'MXN'
): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
// formatPrice(4200000) → "$4,200,000"
```

---

## 5. Property Data Model

```ts
// types/property.ts

export type PropertyType =
  | 'casa'
  | 'departamento'
  | 'terreno'
  | 'local_comercial'
  | 'oficina'
  | 'bodega'
  | 'almacen'
  | 'edificio';

export type OperationType = 'venta' | 'renta' | 'preventa';

export type PropertyCategory = 'residencial' | 'comercial' | 'industrial';

export interface PropertyLocation {
  colonia: string;
  ciudad:  string;
  estado:  string;
}

export interface Property {
  id:            string;
  slug:          string;
  title:         string;
  propertyType:  PropertyType;
  operationType: OperationType;
  category:      PropertyCategory;
  price:         number;
  currency:      'MXN' | 'USD';
  location:      PropertyLocation;
  images:        string[];  // URLs, first = cover
  featured:      boolean;
  available:     boolean;
  createdAt:     string;    // ISO 8601
}
```

---

## 6. Absolute Rules

### Never do this

| Rule | Reason |
|---|---|
| Never use `#47C5FB` | Eliminated from brand — reads as consumer tech startup |
| Never use font-weight 600 or 700 | Makes the brand feel aggressive, not authoritative |
| Never use Playfair Display in buttons, inputs, or below 16px | Reserved for editorial headings only |
| Never use `--color-gold` in body text | Gold is a signal of value — diluted if overused |
| Never use gradients or drop shadows | Explicitly prohibited by Brand Book |
| Never center paragraphs longer than 2 lines | Breaks reading flow and feels informal |
| Never pair gold + blue-light as dominant colors | Flattens hierarchy, loses premium tension |

### Always do this

| Rule | Reason |
|---|---|
| Use `font-variant-numeric: tabular-nums` on all prices | Prevents price column jitter |
| Provide WCAG AA contrast (4.5:1) on all text on color | Accessibility + brand credibility |
| Use exact hex values, never named CSS colors | "navy" ≠ `#1A3A5C` in browsers |
| Build hierarchy with size and color, not weight | Two weights only — that is the system |
| Respect 48px page margin on desktop | Consistent editorial feel across all pages |

---

## 7. Accessibility

```css
/* Focus ring — always visible, brand-colored */
:focus-visible {
  outline: 2px solid var(--color-blue);
  outline-offset: 3px;
  border-radius: 2px;
}

/* Minimum touch target */
.btn-primary,
.btn-secondary,
.btn-outline {
  min-height: 44px;
  min-width: 44px;
}
```

Minimum contrast ratios:
- `#2C2C2A` on `#F6F6F2` → 14.5:1 ✓
- `#C4A44A` on `#1A3A5C` → 5.1:1 ✓
- `#ffffff` on `#214C9B` → 5.7:1 ✓
- `#1A3A5C` on `#E8F0F8` → 9.2:1 ✓

---

*Properlia Brand Book v1.0 · properlia.mx · Updated 2024*
