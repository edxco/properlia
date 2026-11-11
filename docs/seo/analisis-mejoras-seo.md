# Análisis SEO de properlia.com: mejoras pendientes

> **Estado:** 10/11/2026, rama `property-public-code` (`f9e0a19`, sobre `main` `62c8f36`). Analiza `packages/frontend` después de tres cambios: el PR #6 (renderizado en servidor de listados y fichas), la normalización de estados y ciudades, y los códigos públicos de propiedad (`f42bfb7`, `7944b75`, `f9e0a19`). Complementa `docs/seo/google-search-console.md`, que describe el sitio antes de esos cambios.
> **Actualizado 11/11/2026:** las secciones 0, 1, 2, 3, 4, 7 y 10 están implementadas en el código (todavía sin commit). La columna "Estado actual" del resumen refleja ese avance.
> Las rutas son relativas a `packages/frontend/` salvo que se indique otra cosa. `shared/` equivale a `packages/shared/src/`.

## Resumen

| # | Problema | Estado actual | Prioridad |
|---|---|---|---|
| 0 | Arquitectura de URLs: reglas y migración con 301 | ✅ Implementado (sin commit) | **Crítica** |
| 1 | URLs de ficha dependientes de ciudad y UUID | ✅ Implementado: búsqueda por código, 301 desde las URLs antiguas, sin canónica en fichas inexistentes y 500 (no 404) si la API falla, comprobado con el backend detenido | Alta |
| 2 | Sitemap con URLs falsas o incompletas | ✅ Implementado: índice `/sitemap.xml` con `/sitemaps/static.xml`, `/sitemaps/geo.xml` y `/sitemaps/properties-N.xml` (5000 propiedades por archivo), solo URLs nuevas e indexables, con alternativas es/en/x-default, sin propiedades ocultas, y error 500 en lugar de un sitemap vacío si la API falla | Alta |
| 3 | No hay páginas geográficas indexables | ✅ Implementado: páginas `/estado`, `/estado/ciudad` y `/estado/ciudad/operacion` con H1, intro, breadcrumbs visibles, enlaces a ciudades y operaciones, canónica, `hreflang`, JSON-LD `ItemList` y `BreadcrumbList`, y `noindex` con menos de 3 propiedades. Cuando no hay resultados, muestran el nivel superior (operación → ciudad → estado → todas) con un aviso y un enlace | **Crítica** |
| 4 | Filtros, breadcrumbs y enlaces internos a URLs no indexables | ✅ Implementado: `noindex` en filtros, breadcrumbs geográficos, todos los enlaces con `localizedPath`, selector de idioma y chips del Hero como `<a href>`, y columna "Ciudades" en el footer con las ciudades indexables con más propiedades (renderizada en el servidor). Fuera de alcance por decisión: nombres de parámetros de filtro en español (las URLs con filtros son `noindex`) | Alta |
| 5 | Sin `metadataBase`, OpenGraph, Twitter ni imágenes OG | Pendiente | Alta |
| 6 | Sin `not-found.tsx` ni `error.tsx` | Pendiente | Media |
| 7 | Redirección 307 en URLs sin idioma | ✅ Implementado: 301 en `proxy.ts` y 404 directo para `/fr/...` | Media |
| 8 | Datos de contacto del footer solo en cliente | Pendiente | Media |
| 9 | Fichas EN con descripción en español | Parcial | Media |
| 10 | Ficha sin caché ni etiqueta `properties` | ✅ Implementado: `by_code` con `PROPERTIES_CACHE` | Media |
| 11 | Errores en JSON-LD (`addressLocality`, `sameAs`, idioma) | Pendiente (solo se actualizaron `url` e `identifier` de la ficha) | Baja |
| 12 | Dominio de imágenes de producción en `next.config.js` | Por verificar | Media |

---

## 0. Arquitectura de URLs

### Reglas

1. **Páginas geográficas:** `/estado/ciudad`.
2. **Listados SEO específicos:** `/estado/ciudad/operacion`.
3. **Fichas individuales:** `/propiedades/slug-codigo`.
4. Todo en minúsculas.
5. Sin acentos: `terrenos`, no `terrenós`.
6. Guiones para separar palabras.
7. Slugs permanentes para estados y ciudades.
8. Códigos públicos permanentes para propiedades.
9. Canónica en cada página.
10. Redirección **301** cuando cambie una URL existente.
11. No se indexan combinaciones arbitrarias de filtros.

Todas las URLs llevan prefijo de idioma. En `/es` los segmentos fijos y los slugs van en español; en `/en`, en inglés. `hreflang` enlaza cada par.

### Mapa de URLs

| Tipo | `/es` | `/en` | Indexable |
|---|---|---|---|
| Inicio | `/es` | `/en` | Sí |
| Estado (página central) | `/es/puebla` | `/en/puebla` | Sí, si tiene propiedades |
| Ciudad | `/es/puebla/san-andres-cholula` | `/en/puebla/san-andres-cholula` | Sí, si tiene ≥ N propiedades |
| Ciudad + operación | `/es/puebla/san-andres-cholula/venta` | `/en/puebla/san-andres-cholula/sale` | Sí, si tiene ≥ N propiedades |
| Listado general | `/es/propiedades` | `/en/properties` | Sí, incluido `?page=N` |
| Listado con filtros | `/es/propiedades?recamaras=3&precio_max=…` | `/en/properties?rooms=3…` | **No** (`noindex, follow`) |
| Ficha | `/es/propiedades/casa-en-venta-en-zavaleta-pue-r0012` | `/en/properties/house-for-sale-in-zavaleta-pue-r0012` | Sí |
| Consulta de comprador | `/es/consulta-comprador` | `/en/buyer-consultation` | Sí |
| Consulta de vendedor | `/es/consulta-vendedor` | `/en/seller-consultation` | Sí |
| Otras páginas fijas | `/es/contacto`, `/es/servicios`, `/es/aviso-de-privacidad`, `/es/terminos-y-condiciones`, `/es/mapa-del-sitio` | `/en/contact`, `/en/services`, `/en/privacy`, `/en/terms`, `/en/sitemap` | Sí (mapa del sitio: opcional) |

- **Operaciones:** `venta` y `renta` en español, `sale` y `rent` en inglés. Se mapean a `listing_type` (`sale`, `rent`).
- **Página de estado:** la regla 1 empieza en ciudad. La página de estado se incluye como página central que enlaza a sus ciudades, y se puede quitar si no se quiere.
- **Tipo de propiedad** (casas, terrenos…): no forma parte de las reglas, así que queda como filtro no indexable. Si en el futuro se quiere `/estado/ciudad/operacion/tipo`, sigue las mismas reglas.
- **Slugs de páginas fijas:** `consulta-comprador` y `consulta-vendedor` están confirmados. Los demás son una propuesta que hay que confirmar antes de publicar. Una vez publicados, no deben cambiar.

### Slugs permanentes de estados y ciudades (backend)

- **Columnas nuevas:** `slug` (desde `es_name`) y `slug_en` (desde `name`) en `states` y `cities`. Ejemplo: `ciudad-de-mexico` / `mexico-city`. En la mayoría coinciden (`puebla`/`puebla`).
- **Unicidad:** `states.slug` es único. `cities.slug` es único dentro de su estado.
- **Formato:** se generan una sola vez con `slugify` (minúsculas, sin acentos, guiones) y **no cambian si se edita el nombre**.
- **Si alguna vez hay que cambiar uno:** el slug anterior se guarda en `previous_slugs` (array), y el frontend responde con 301 a la URL nueva.
- **Slugs reservados:** como `/es/{estado}` comparte nivel con las páginas fijas, el backend rechaza slugs de estado que coincidan con un segmento fijo: `propiedades`, `properties`, `contacto`, `contact`, `servicios`, `services`, `consulta-comprador`, `buyer-consultation`, `consulta-vendedor`, `seller-consultation`, `aviso-de-privacidad`, `privacy`, `terminos-y-condiciones`, `terms`, `mapa-del-sitio`, `sitemap`, `api`.
- **Serializer:** expone `slug` y `slug_en` en `State` y `City` (`shared/types/index.ts`, `CommonEntity`).

### Códigos públicos permanentes de propiedades (ya existen)

El código ya existe en el backend (`f42bfb7`).
- **Columna:** `properties.code`, con índice único. El modelo la declara `attr_readonly`, así que no cambia nunca, ni siquiera si cambian la ciudad o el tipo de la propiedad.
- **Formato:** `{CIUDAD}-{TIPO}{NNNN}` (`app/services/property_code_generator.rb`). Ejemplo: `PUE-R0012`.
  - `CIUDAD`: el `cities.code` de 3 caracteres (`A-Z0-9`), o `GEN` si la propiedad no tiene ciudad.
  - `TIPO`: `R`, `C`, `I` o `T` (`PropertyType::CODE_LETTERS`).
  - `NNNN`: secuencia global de al menos 4 dígitos. Pasa a 5 o más cuando supere 9999.
- **Ya se usa** en la API (`code` en el payload, `shared/types/index.ts`), en la ficha (`PropertyDetailView`), en el dashboard y en el PDF.

**En la URL:**
- **Forma:** `/{locale}/propiedades/{slug-del-titulo}-{code en minúsculas}`. Ejemplo: `/es/propiedades/casa-en-venta-en-zavaleta-pue-r0012`.
- **Slug del título:** sale de `title` en `/es` y de `title_en` (o la plantilla en inglés) en `/en`.
- **Lectura del código:** como el código contiene un guion, se toma con la expresión regular `/-([a-z0-9]{3}-[a-z]\d{4,})$/` sobre el último segmento, y se pasa a mayúsculas para la búsqueda.
- **Búsqueda:** la ficha busca la propiedad **solo por el código**. Si el slug del título no coincide con el actual (por ejemplo, porque se editó el título), responde con 301 a la URL correcta. Cambiar el título, la ciudad o el estado nunca rompe una URL.

**Lo que falta en el backend:**
- **Búsqueda exacta por código.** `show` solo busca por UUID (`Property.find(params[:id])`), y `?search=` usa `LIKE`, que no sirve como búsqueda exacta: `pue-r1234` también encuentra `PUE-R12345`. Hay que añadir `GET /api/v1/properties/by_code/:code`, sin distinguir mayúsculas y solo para propiedades públicas.
- **Campo `public_url`** (`es` / `en`) en el payload. Lo usarían los correos, el PDF y el enlace "Ver en el sitio" del dashboard.
- **`GET /properties/public_paths`**: devuelve `{ id, code, slug_es, slug_en }` para el mapa de redirecciones del proxy.

**`buildPropertyUrl(property, locale)`** (`shared/lib/slugify.ts`) pasa a generar `/propiedades/{slug}-{code}` o `/properties/{slug}-{code}`, sin estado ni ciudad.

**Nota:** el `cities.code` de 3 letras (`f42bfb7`) no sustituye al slug de ciudad. El slug sigue siendo necesario para las URLs geográficas (`san-andres-cholula`, no `sac`).

### Implementación en Next

- **Carpetas internas** (los nombres no se ven en la URL):

  | Carpeta | Página |
  |---|---|
  | `app/[locale]/[state]/page.tsx` | Estado |
  | `app/[locale]/[state]/[city]/page.tsx` | Ciudad |
  | `app/[locale]/[state]/[city]/[operation]/page.tsx` | Ciudad + operación |
  | `app/[locale]/properties/page.tsx` | Listado general |
  | `app/[locale]/properties/[slugCode]/page.tsx` | Ficha |
  | `contact`, `services`, `buyer-consultation`… | Páginas fijas, con su carpeta actual |

  La ficha actual en `properties/[state]/[city]/[id]/[slug]` se elimina.

- **Mapa de rutas central (`src/lib/routes.ts`).** Contiene:
  - Una tabla `clave → { es, en }` para los segmentos fijos y las operaciones.
  - `localizedPath(locale, key, params)` para generar rutas.
  - `alternatePaths(key, params)` para `hreflang`.

  Todo enlace, canónica, `hreflang` y entrada del sitemap sale de ahí. Ningún componente vuelve a escribir rutas a mano.

- **`proxy.ts`** (renombrar `middleware.ts`) hace todo el enrutamiento por idioma:
  1. **Reescribe** (`NextResponse.rewrite`) los segmentos públicos a las carpetas internas. Por ejemplo, `/es/propiedades/...` → `/es/properties/...` y `/es/contacto` → `/es/contact`. La reescritura no vuelve a pasar por el proxy, así que no hay bucles.
  2. **Redirige con 301** (`NextResponse.redirect(url, 301)`) todas las URLs antiguas a la nueva, **en un solo salto** (tabla en la siguiente subsección).
  3. **Resuelve las redirecciones de fichas** con un mapa en memoria `{ id, public_code, slug_es, slug_en }`. El mapa sale de un endpoint ligero del backend (`GET /properties/public_paths`), se refresca cada 5 minutos y se invalida desde `app/api/revalidate`. El proxy usa el mismo mapa para:
     - Pasar de una URL antigua (UUID) a la URL con código.
     - Corregir un slug de título desactualizado.

     Así las fichas también responden 301 y no 308. Desde una página, `permanentRedirect` de Next solo puede responder 308.
- **Canónica y `hreflang`.** `buildMetadata` (`src/lib/metadata.ts`) hoy supone la misma ruta en los dos idiomas. Debe recibir la clave de ruta y los parámetros, y generar la ruta de cada idioma (`/es/puebla/san-andres-cholula/venta` ↔ `/en/puebla/san-andres-cholula/sale`). Cada página tiene su canónica a sí misma; `x-default` apunta a ES.

### Redirecciones 301 de URLs existentes

| URL actual | Destino (301, un solo salto) |
|---|---|
| `/properties`, `/` sin idioma | `/es/propiedades`, `/es` (o `/en/...` según la cookie) |
| `/es/properties` | `/es/propiedades` |
| `/es/properties?page=N` | `/es/propiedades?page=N` |
| `/{locale}/properties?state_id=X` (solo ese filtro) | `/{locale}/{estado}` |
| `/{locale}/properties?state_id=X&city_id=Y` | `/{locale}/{estado}/{ciudad}` |
| `/{locale}/properties?state_id=X&city_id=Y&type=buy` | `/{locale}/{estado}/{ciudad}/venta` (`sale` en EN) |
| `/{locale}/properties?<otras combinaciones>` | `/es/propiedades?<mismos filtros>` (EN no cambia), con `noindex` |
| `/{locale}/properties/{state}/{city}/{uuid}/{slug}` | `/{locale}/propiedades/{slug}-{code}` (`properties` en EN) |
| Ficha con slug de título desactualizado | Misma ficha con el slug actual |
| Ficha con el código en mayúsculas (`...-PUE-R0012`) | La misma URL en minúsculas |
| `/es/buyer-consultation` | `/es/consulta-comprador` |
| `/es/seller-consultation` | `/es/consulta-vendedor` |
| `/es/contact`, `/es/services`, `/es/privacy`, `/es/terms`, `/es/sitemap` | Su equivalente en español |
| Estado o ciudad con slug anterior (`previous_slugs`) | URL con el slug actual |
| Ficha vendida, vencida o inexistente | Sin redirección: **404** (o 410 si se prefiere) |

Las redirecciones se mantienen de forma indefinida: hay enlaces externos, mensajes de WhatsApp y resultados de Google con las URLs actuales. Ninguna URL antigua puede quedar en el sitemap ni en los enlaces internos.

### Riesgos

- **Caída temporal de posiciones.** Google tarda unas semanas en consolidar las señales en las URLs nuevas. Conviene migrarlo todo en un solo despliegue, con el sitemap ya actualizado, y no por partes.
- **Cadenas de redirecciones.** El proxy calcula el destino final antes de redirigir. Por ejemplo, `/properties/...` sin idioma va directo a la ficha final, no `/properties` → `/es/properties` → `/es/propiedades`.
- **Colisiones con páginas fijas.** Las cubre la lista de slugs reservados. Además, `app/[locale]/[state]/page.tsx` responde `notFound()` para cualquier slug que no sea un estado existente.

---

## 1. URLs de ficha dependientes de ciudad y UUID

Hoy la ficha vive en `/es/properties/{state}/{city}/{uuid}/{slug}`:
- Comprueba la URL canónica y redirige con 308 (`app/[locale]/properties/[state]/[city]/[id]/[slug]/page.tsx:22-25`).
- Cada cambio de ciudad, estado o nombre genera una URL nueva.
- Expone el UUID interno.

El esquema `/propiedades/slug-codigo` de la sección 0 elimina el problema de raíz. Casos borde que hay que cubrir en la nueva ficha:
- **Ficha inexistente.** Hoy `generateMetadata` genera una canónica `/properties/{id}` aunque la página responda 404 (`.../[slug]/layout.tsx:89-90`). En la ficha nueva, sin propiedad no hay canónica.
- **Caída de la API.** Hoy `getProperty` convierte cualquier error en `null` y la ficha responde **404** (`.../[slug]/getProperty.ts`, `page.tsx:20`), así que una caída del backend puede desindexar fichas válidas. Solo el "no encontrado" de la API debe llevar a `notFound()`; los demás errores deben responder 5xx.

---

## 2. Sitemap con URLs falsas o incompletas

**Ya corregido:** `lastmod` usa el `updated_at` real de cada propiedad.

**Pendiente (`app/sitemap.ts`):**
1. **Solo URLs indexables y nuevas.** Debe incluir:
   - Inicio, páginas fijas y listado general
   - Estados, ciudades y ciudad + operación con ≥ N propiedades
   - Fichas `/propiedades/slug-codigo`

   Todas generadas con `localizedPath`, con sus alternativas `es`/`en`. No debe incluir URLs con filtros, URLs antiguas ni páginas con `noindex`.
2. **Propiedades no visibles.** Hoy filtra con `hasPublicLocation` (línea 53), pero no con `isPubliclyVisible` (`shared/lib/propertyVisibility.ts`). Puede listar propiedades vendidas o vencidas cuya ficha responde 404. Hay que aplicar el mismo filtro que la ficha.
3. **Fallos silenciosos.** El bucle de paginación (líneas 26-37) devuelve una lista parcial ante cualquier error, sin registrarlo, y la deja en caché una hora. Debe registrar el error y lanzar una excepción para conservar el sitemap anterior.
4. **Faltan** `/services`, `/terms` y `/privacy`.
5. **Cliente duplicado.** El sitemap usa su propio `fetch` y su propia `BASE_URL` (línea 4). Debe usar `propertyApi` y una constante compartida.
6. **Divisiones.** Con muchas fichas, separar el sitemap (`generateSitemaps`) en páginas fijas, geografía y propiedades.
7. **robots.** `app/robots.ts` está bien. **No** hay que bloquear los parámetros de filtro en `robots.txt`: Google tiene que poder rastrearlos para ver el `noindex`.

---

## 3. No hay páginas geográficas indexables (CRÍTICO)

**Situación:**
- Los filtros usan UUID (`?state_id=…&city_id=…`, en `app/[locale]/properties/listingFilters.ts:21-33`) y su canónica es `/properties`. GSC ya marca cuatro de ellas como Soft 404.
- `/es/puebla` y `/es/puebla/san-andres-cholula` no existen.

Las búsquedas con más volumen son por ubicación y operación ("casas en venta en Cholula", "renta en Puebla"). Hoy solo pueden posicionar las fichas, que desaparecen al venderse.

**Páginas nuevas** (sección 0): `/{estado}`, `/{estado}/{ciudad}` y `/{estado}/{ciudad}/{operacion}`.

**Requisitos de cada una:**
- **Datos:** renderizado en servidor con `getStates`/`getCities` y `getPublicProperties` (`src/lib/propertyQueries.ts`). El slug se resuelve contra `slug` o `slug_en`, o contra `previous_slugs` (en ese caso, 301).
- **Contenido único.** `<h1>` propio ("Casas y terrenos en venta en San Andrés Cholula" / "Properties for sale in San Andrés Cholula"), un párrafo introductorio y su propio `title` y `description`. Textos en `shared/src/messages/es.json` y `en.json`.
- **Enlaces:**
  - La página de estado enlaza a sus ciudades.
  - La de ciudad enlaza a venta y renta, y a ciudades cercanas.
  - Ciudad + operación enlaza de vuelta a la ciudad.
- **Canónica y paginación.** Canónica a sí misma y `hreflang`. Paginación con `<a href="?page=2">`; cada página lleva su propia canónica.
- **JSON-LD:** `ItemList` (fichas) y `BreadcrumbList`.
- **Errores y contenido escaso.**
  - Slug desconocido u operación no válida → `notFound()`.
  - Menos de N propiedades (p. ej. 3) → `noindex, follow`, y fuera del sitemap.
  - Cero propiedades → mostrar las propiedades del estado o de ciudades cercanas, con `noindex`.
- **Caché.** `LOCATIONS_CACHE` (`src/lib/propertyQueries.ts`) es `{ revalidate: 3600 }`, sin la etiqueta `properties`. Hay que integrar `f9dee4f` (rama `merge-main-into-stage`, todavía fuera de `main`), que la añade.

---

## 4. Filtros, breadcrumbs y enlaces internos

**Combinaciones de filtros (regla 11):**
- `generateMetadata` del listado (`app/[locale]/properties/page.tsx`) hoy deja indexables las URLs con filtros (con la canónica en la base). Ahora:
  - **Cualquier** parámetro distinto de `page` → `robots: { index: false, follow: true }`.
  - La canónica apunta a la base `/es/propiedades`.
- Las combinaciones que equivalen exactamente a una página geográfica no se quedan en el listado: se redirigen con 301 (tabla de la sección 0).
- Los filtros adicionales dentro de una página geográfica (recámaras, precio…) añaden parámetros a esa URL y llevan `noindex, follow`, con la canónica en la página geográfica.
- Parámetros en español en `/es`, para que la URL sea coherente: `recamaras`, `banos`, `precio_min`, `precio_max`, `tipo`, `buscar`. Hay que actualizar `URL_KEYS` en `listingFilters.ts`.

**Breadcrumbs:**
- `breadcrumbs.ts` y el JSON-LD `BreadcrumbList` (`.../[slug]/layout.tsx`, `buildBreadcrumbJsonLd`) enlazan hoy a `?state_id=…&city_id=…`.
- Pasan a ser: Inicio › Propiedades › `/{estado}` › `/{estado}/{ciudad}` › `/{estado}/{ciudad}/{operacion}` › Ficha.

**Enlaces que hay que sustituir por `localizedPath`:**
- Navegación: `src/components/Navigation.tsx:91`, `:153`
- Footer: `src/components/Footer.tsx:139-155`. Además, se añade un bloque de enlaces a las ciudades principales.
- `app/[locale]/sitemap/page.tsx:32-34`
- `src/components/ServiceTiles.tsx:34`: `"/properties?category=investment"` **no lleva prefijo de idioma**, así que hoy cada clic pasa por una redirección 307.
- Chips de categoría del Hero (`src/components/Hero.tsx:25-28`): son un `<button>` con `router.push`; deben ser `<Link>`.
- `LanguageSwitcher` (`src/components/LanguageSwitcher.tsx:36`): debe traducir la ruta completa con `alternatePaths` (`/es/contacto` ↔ `/en/contact`, `/es/.../venta` ↔ `/en/.../sale`), no solo el prefijo de idioma. Debe ser un `<a href>`.
- La tarjeta de propiedad (`components/ui/propertyCard.tsx`), las propiedades similares, las páginas de consulta, `contact`, `services`, `privacy`, `terms` y `MainAbout`.
- **Backend:**
  - `packages/backend/app/services/email_service.rb:327` genera `FRONTEND_URL/properties/{id}`, que **ya responde 404 hoy**. Debe usar `public_url`.
  - Revisar también el PDF (`app/services/pdf/generator_service.rb`) y el enlace "Ver en el sitio" del dashboard.

---

## 5. Sin `metadataBase`, OpenGraph, Twitter ni imágenes OG

- **Situación:** `buildMetadata` (`src/lib/metadata.ts`) solo genera `title`, `description`, la canónica y `hreflang`. No hay `openGraph`, `twitter` ni `opengraph-image`. Al compartir en WhatsApp, Facebook o LinkedIn, el enlace sale sin imagen ni tarjeta.
- **`BASE_URL` en un solo sitio.** Hoy se repite en `src/lib/metadata.ts`, `app/sitemap.ts`, `.../[slug]/layout.tsx` y `app/[locale]/layout.tsx`. Hay que dejar una sola constante, y usarla también para `metadataBase`.
- **OpenGraph y Twitter.** `openGraph` (`title`, `description`, `url`, `siteName`, `locale` `es_MX`/`en_US`, `type`) y `twitter: { card: "summary_large_image" }` en `buildMetadata`.
- **Imágenes OG.** Una imagen por defecto. La ficha usa la foto principal; las páginas geográficas, la foto de su primera propiedad.

## 6. Sin `not-found.tsx` ni `error.tsx`

- **Situación:** un 404 muestra la página por defecto de Next, en inglés y sin navegación.
- **`not-found.tsx`:** crear `app/[locale]/not-found.tsx` traducido, con enlaces a propiedades y a las ciudades principales.
- **`error.tsx`:** crear `app/[locale]/error.tsx`.
- **Verificar** que un 404 responde con el estado 404.

## 7. Redirección 307 en URLs sin idioma

- **Código:** `middleware.ts` (líneas 63, 71 y 76) responde 307. Debe pasar a 301 dentro del nuevo `proxy.ts` (sección 0). Googlebot llega sin cookie, así que siempre aterriza en `/es` (x-default).
- **Idioma no soportado:** `/fr/...` hoy salta a `/es/fr/...` y acaba en 404. Debe responder 404 directamente.

## 8. Datos de contacto del footer solo en cliente

- **Situación:** `src/components/Footer.tsx:65` y `BuyerConsultationClient.tsx:147` usan `useGeneralInfo()` en el navegador. El NAP (nombre, dirección, teléfono) no aparece en el HTML del servidor.
- **Cambio:** obtener `generalInfo` en el servidor desde `app/[locale]/layout.tsx`, pasarlo como prop y usarlo en el JSON-LD `RealEstateAgent`.
- **Fallbacks de carga:** quitar los `<Suspense fallback="Loading...">` de `buyer-consultation/page.tsx:17` y `seller-consultation/page.tsx:17`.

## 9. Fichas en inglés con descripción en español

`localizedDescription` (`shared/lib/propertyText.ts`) muestra el texto en español si falta `description_en`.

- **Opción A (recomendada):** hacer obligatorio `description_en` y rellenar las fichas existentes con la IA que ya tiene el dashboard (`c8002e4`).
- **Opción B:** las fichas EN sin traducción llevan `noindex`, y se quitan del sitemap y del `hreflang`.

El slug EN de la ficha sale de `title_en` (o de la plantilla en inglés), así que también necesita traducción.

## 10. Ficha sin caché ni etiqueta `properties`

`getProperty.ts` llama a `getById` sin caché. La nueva búsqueda por código (`by_code`) debe usar `PROPERTIES_CACHE` (`{ revalidate: 300, tags: ["properties"] }`). Opcional: pregenerar las fichas públicas con `generateStaticParams`.

## 11. Errores en el JSON-LD

**`RealEstateListing` (`buildPropertyJsonLd`):**
- La colonia (línea 44) se sobrescribe con la ciudad (líneas 45-47). Debe quedar así:
  - `addressLocality`: la ciudad
  - `addressRegion`: el estado
  - La colonia: en `streetAddress` o `containedInPlace`
- `availability` siempre es `InStock` (línea 36).
- Falta `datePosted`.
- `url` debe ser la URL nueva con el código.

**Organización (`app/[locale]/layout.tsx`):**
- `sameAs: []` está vacío (línea 54).
- La descripción (líneas 41-42) está en inglés también en `/es`.

Validar con [Rich Results Test](https://search.google.com/test/rich-results).

## 12. Imágenes

`next.config.js` → `images.remotePatterns` no incluye el dominio de imágenes de producción. Hay que verificar que `next/image` optimiza las fotos, porque afecta al LCP y a Google Imágenes.

---

## Orden de trabajo sugerido

1. **Backend (unos 2 días; `properties.code` ya existe):**
   - Migraciones: `states.slug`/`slug_en`, `cities.slug`/`slug_en` y `previous_slugs`, rellenadas con `slugify` (minúsculas, sin acentos, con guiones)
   - Validación de slugs reservados
   - Endpoints `by_code` (búsqueda exacta) y `public_paths`
   - `public_url` en el payload
   - Correos (`email_service.rb:327`) y PDF
2. **Frontend: arquitectura de URLs (unos 4 días)**, todo en un solo despliegue:
   - `src/lib/routes.ts`
   - `proxy.ts` con las reescrituras y las 301 (incluidas las secciones 0 y 7)
   - `buildPropertyUrl` por idioma y la ficha nueva
   - Las páginas geográficas (sección 3)
   - Las reglas de `noindex` de los filtros, los breadcrumbs y los enlaces internos (sección 4)
   - Canónica y `hreflang`
   - El sitemap (sección 2)
   - Integrar `f9dee4f`
3. **Correcciones rápidas:** secciones 1 (5xx), 10, 11 y 12.
4. **Presentación y contenido:** secciones 5, 6, 8 y 9.
5. **Después del despliegue:**
   - Reenviar el sitemap en GSC.
   - Pedir la indexación de inicio, listado y ciudades principales.
   - Revisar cada semana "Páginas" → "Página con redirección" (debe crecer con las URLs viejas) y las indexadas nuevas.

## Verificación (HTML del servidor, sin JS)

```bash
BASE=https://properlia.com
# Redirecciones 301 en un solo salto
curl -sI $BASE/es/properties | grep -iE '^(HTTP|location)'                                  # 301 → /es/propiedades
curl -sI $BASE/properties | grep -iE '^(HTTP|location)'                                     # 301 → /es/propiedades
curl -sI "$BASE/es/properties/<state>/<city>/<uuid>/<slug>" | grep -iE '^(HTTP|location)'  # 301 → /es/propiedades/<slug>-pue-r0012
curl -sI "$BASE/es/properties?state_id=<id>" | grep -iE '^(HTTP|location)'                 # 301 → /es/puebla
curl -sI "$BASE/es/propiedades/titulo-viejo-pue-r0012" | grep -iE '^(HTTP|location)'       # 301 → slug actual
curl -sI "$BASE/es/propiedades/<slug>-PUE-R0012" | grep -iE '^(HTTP|location)'             # 301 → código en minúsculas
curl -sI $BASE/es/contact | grep -iE '^(HTTP|location)'                                     # 301 → /es/contacto
curl -sI $BASE/es/buyer-consultation | grep -iE '^(HTTP|location)'                          # 301 → /es/consulta-comprador
curl -sI $BASE/es/seller-consultation | grep -iE '^(HTTP|location)'                         # 301 → /es/consulta-vendedor
curl -s -o /dev/null -w '%{http_code}\n' $BASE/en/buyer-consultation                        # 200 (EN sin cambios)
# Páginas nuevas
curl -s $BASE/es/puebla/san-andres-cholula | grep -o '<h1[^>]*>[^<]*'                       # h1 propio
curl -s $BASE/es/puebla/san-andres-cholula/venta | grep -o 'rel="canonical"[^>]*'           # canónica a sí misma
curl -s $BASE/es/puebla/san-andres-cholula/venta | grep -o 'hreflang="en"[^>]*'             # → /en/puebla/san-andres-cholula/sale
curl -s "$BASE/es/propiedades?recamaras=3" | grep -o 'name="robots"[^>]*'                   # noindex, follow
curl -s -o /dev/null -w '%{http_code}\n' $BASE/es/no-existe                                 # 404
# Limpieza
curl -s $BASE/sitemap.xml | grep -cE '/es/properties|state_id|city_id|[A-Z]'                # 0
curl -s $BASE/es | grep -oE 'href="/es/(properties|contact|services)[/"?]' | wc -l          # 0
curl -s $BASE/es | grep -o 'property="og:image"[^>]*'                                       # OG presente
curl -s $BASE/es | grep -c 'tel:'                                                            # > 0 (NAP en el HTML)
```
