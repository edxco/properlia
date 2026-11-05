# Reporte GSC → Claude Code: errores de indexación de properlia.com

> **Instrucciones para Claude Code:** Este reporte combina Google Search Console (propiedad `sc-domain:properlia.com`, datos al 22/10/2026) con una verificación en vivo del HTML que entrega el servidor (sin JS), hecha el 04/11/2026. El sitio es Next.js (página 404 por defecto: "404: This page could not be found."). Trabaja en el repo de Properlia. Para cada problema: (1) localiza el código responsable, (2) aplica el cambio, (3) cumple el criterio de aceptación. Verifica siempre con `curl` (HTML del servidor, **no** el navegador). Al final entrega un resumen con los archivos modificados.

## Resumen

**12 indexadas / 18 sin indexar** en GSC, pero el sitemap tiene **104 URLs** (96 fichas de propiedades ES+EN). La gran mayoría de las fichas no llegan al índice.

| # | Problema (causa raíz confirmada) | Afecta a | Prioridad |
|---|---|---|---|
| A | Los listados y la home renderizan "Loading…" en el servidor: **0 enlaces a propiedades en el HTML** | Soft 404 (4), Rastreada sin indexar (3) y la indexación general | **Crítica** |
| B | Las fichas aceptan cualquier ciudad en la URL y devuelven 200 sin redirigir | Canónica alternativa (≥1) | **Alta** |
| C | Propiedades de prueba publicadas y en el sitemap | Calidad del sitio | **Alta** (fix rápido) |
| D | `lastmod` del sitemap = hora de generación | Señal de rastreo | Media |
| E | Las fichas EN tienen título/contenido en español | Duplicado ES/EN | Media |
| F | Redirecciones de la home | Página con redirección (7) | Baja: esperado, solo verificar |

---

## A. Contenido cargado solo en cliente (CRÍTICO)

**Evidencia (HTML del servidor, sin JS):**

| URL | Palabras | `<h1>` | Enlaces a `/properties/` | Texto visible |
|---|---|---|---|---|
| `/es` (home) | 145 | "Inmobiliaria en Puebla" | **0** | "…Loading properties..." |
| `/en` (home) | 141 | "Real Estate in Puebla" | **0** | "…Loading properties..." |
| `/es/properties` | 64 | **ninguno** | **0** | "Loading..." |
| `/en/properties` (+ `?category=`, `?state_id=`) | 61 | **ninguno** | **0** | "Loading..." |
| Fichas de propiedad | 450–550 | sí | **0** | contenido OK |

Por eso Google marca `/en/properties*` como **Soft 404**: recibe una página casi vacía que solo dice "Loading...". `/es/properties` tiene el mismo problema y puede caer igual. Además, **ninguna página enlaza a las fichas en el HTML del servidor**, así que Google solo las descubre por el sitemap, sin enlaces internos. Eso explica las "Rastreada: actualmente sin indexar" y las pocas fichas indexadas.

URLs en GSC:
- Soft 404: `/en/properties`, `/en/properties?category=residential`, `/en/properties?category=investment`, `/en/properties?state_id=18806e68-2870-4fb3-8294-62448b8bbe8d`
- Rastreada sin indexar: `/es/properties/puebla/puebla/69c57efc-…/residencia-patrimonial-en-privada-con-extenso-terreno-colonia-zavaleta`, `/es/properties/puebla/puebla/6a5924c8-…/terreno-en-venta-780-m-tlaxcalancingo-zona-radial`, `/es/buyer-consultation`

**Cambios:**
1. **Listado `/[locale]/properties`:** obtener las propiedades en el servidor (Server Component / `getServerSideProps` / ISR) y renderizar las tarjetas con `<a href="/[locale]/properties/[state]/[city]/[id]/[slug]">` reales. Los filtros pueden seguir siendo interactivos en cliente, pero la carga inicial debe venir del servidor.
2. Agregar un `<h1>` y un párrafo introductorio en el listado (ej. "Propiedades en venta en Puebla" / "Properties for sale in Puebla"), con variante por `category` si viene en la URL.
3. **Paginación rastreable:** `<a href="?page=2">`, no solo botones con onClick ni scroll infinito sin enlaces.
4. **Home:** renderizar en servidor la sección de propiedades destacadas (la que hoy dice "Loading properties...") con enlaces a las fichas.
5. **Fichas:** agregar en servidor un bloque de "Propiedades similares" (misma ciudad o categoría, 4–6 enlaces) y breadcrumbs con enlaces (Inicio › Propiedades › Ciudad).
6. Revisar el texto "00 transacciones cerradas" en la home ES: el contador se renderiza en 0 en el servidor (en EN dice "200"). Hay que renderizar el valor final en el servidor.
7. Filtros sin resultados → `<meta name="robots" content="noindex, follow">`. Mantener el canonical de los filtros al listado base (ya está así).

**Aceptación:**
```bash
curl -s https://properlia.com/es/properties | grep -o 'href="/es/properties/[^"]*' | sort -u | wc -l   # > 0
curl -s https://properlia.com/en/properties | grep -c 'Loading'                                        # 0
curl -s https://properlia.com/es | grep -o 'href="/es/properties/[^"]*' | sort -u | wc -l              # > 0
curl -s https://properlia.com/es/properties | grep -o '<h1[^>]*>[^<]*'                                 # existe
```

---

## B. Rutas de ficha con ciudad incorrecta devuelven 200 (ALTA)

**Evidencia:** la URL que reporta GSC usa `puebla/puebla`, pero la página responde 200 y su canonical (y el sitemap) usan `puebla/san-andres-cholula`:

| URL solicitada (200) | Canonical que devuelve |
|---|---|
| `/en/properties/puebla/puebla/fb80e155-…/terreno-en-venta-308-m-tlaxcalancingo-zona-radial` | `/en/properties/puebla/san-andres-cholula/fb80e155-…/…` |
| `/es/properties/puebla/puebla/6a5924c8-…/terreno-en-venta-780-m-tlaxcalancingo-zona-radial` | `/es/properties/puebla/san-andres-cholula/6a5924c8-…/…` |

Probablemente la ubicación de la propiedad se editó y la URL vieja sigue viva. La ruta resuelve solo por el ID e ignora `state`, `city` y `slug`. Así se generan duplicados infinitos.

**Cambio:** en la página de detalle `[locale]/properties/[state]/[city]/[id]/[slug]`, después de cargar la propiedad por `id`, compara `state`, `city` y `slug` con los valores canónicos. Si no coinciden → **301/308** a la URL canónica (en Next.js App Router: `permanentRedirect()`; en Pages Router: `redirect: { permanent: true }`). Si el `id` no existe → `notFound()` (404 real; hoy ya funciona bien para rutas inexistentes).

**Aceptación:** `curl -sI https://properlia.com/en/properties/puebla/puebla/fb80e155-2159-493c-a1ad-afdc64d7b484/terreno-en-venta-308-m-tlaxcalancingo-zona-radial` → `308` o `301` con `location` a la ruta `san-andres-cholula`.

Las otras 3 URLs de "canónica alternativa" (`/es/properties?category=industrial`, `/es/properties?category=investment`, `https://www.properlia.com/es/properties`) son **comportamiento esperado**: no hay que cambiar nada.

---

## C. Propiedades de prueba publicadas (ALTA, fix rápido)

En el sitemap hay 4 URLs (están con 200 e indexables):
```
/es/properties/na/na/c5c45265-1ced-4883-8dce-7e25b2c1a64c/prueba
/en/properties/na/na/c5c45265-1ced-4883-8dce-7e25b2c1a64c/prueba
/es/properties/na/na/01b9ca1b-fb08-4f1a-addf-cc0bebbdb231/prueba-123
/en/properties/na/na/01b9ca1b-fb08-4f1a-addf-cc0bebbdb231/prueba-123
```
**Cambio:** despublicar o borrar esos registros en la base de datos/CMS (confirmarlo con el equipo antes de borrar). En el código: excluir del sitemap y del listado las propiedades sin estado/ciudad (`na`) o con estado distinto a "publicada", y que su ficha devuelva 404 o `noindex`.

---

## D. `lastmod` del sitemap falso (MEDIA)

Todas las entradas tienen `lastmod` = momento de la generación (ej. `2026-11-04T19:40:11.379Z`). Google aprende a ignorarlo.
**Cambio:** usar el `updated_at` real de cada propiedad. En las páginas estáticas, omitir `lastmod` o usar la fecha del último cambio real.
(El sitemap ya incluye `hreflang` via `xhtml:link` y `robots.txt` está bien: `Allow: /`, `Disallow: /api/`.)

---

## E. Fichas EN con contenido en español (MEDIA)

`/en/properties/…/terreno-en-venta-308-m-…` tiene `<title>` "TERRENO EN VENTA | 308 m² | TLAXCALANCINGO | ZONA RADIAL | Properlia" y `lang="en"`. Google ve dos páginas casi idénticas (ES y EN) y descarta una.
**Cambio:** si la propiedad tiene traducción, usarla en title, description, H1 y cuerpo. Si no la tiene: (a) generar title y meta description EN desde plantilla con los datos estructurados ("Land for sale – 308 m² – Tlaxcalancingo, San Andrés Cholula"), y/o (b) no generar la versión EN ni su `hreflang en` hasta que exista la traducción. Decisión de producto: preguntar cuál opción prefiere el equipo.

Por cierto, el hreflang ya es recíproco y el canonical es autorreferente por idioma (correcto).

---

## F. Página con redirección — 7 URLs (BAJA, solo verificar)

`/` y `/es/` redirigen a `/es` (confirmar con curl que sea 301/308) (200, autocanónica, `x-default`). `/en/` → `/en`. Es correcto. Las variantes `http://`, `www.` y `/es/` que reporta GSC son variantes de la home y **es normal que no se indexen**.
**Verificar solamente** (desde fuera del navegador):
```bash
for u in http://properlia.com/ http://www.properlia.com/ https://www.properlia.com/ http://properlia.com/es/ https://www.properlia.com/es/; do
  echo "== $u"; curl -sIL "$u" | grep -iE '^(HTTP|location)'; done
```
Ideal: 1 solo salto a `https://properlia.com/es`. Si hay cadenas (http → https → sin www → /es), unificarlas en una regla en el hosting/middleware. Revisar también que los enlaces internos (logo, menú) apunten a `/es` y `/en`, no a `/` ni `/es/`.

---

## Orden sugerido de implementación

1. C (borrar las pruebas) y B (redirect de la ciudad): cambios pequeños y aislados.
2. A: render en servidor del listado y la home, más enlaces internos (el cambio de mayor impacto).
3. D y E.
4. Verificar F.

## Después del deploy (lo hace el equipo en GSC)

1. Reenviar `sitemap.xml`.
2. Inspección de URLs → "Solicitar indexación": `/es`, `/en`, `/es/properties`, `/en/properties`, y las 3 fichas de "Rastreada sin indexar".
3. Indexación de páginas → **Validar corrección** en Soft 404, Rastreada sin indexar y Canónica alternativa.
4. Revisar en 2–4 semanas: el número de páginas indexadas debería acercarse a las ~100 del sitemap.