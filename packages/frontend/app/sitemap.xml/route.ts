import {
  fetchSitemapPaths,
  latestUpdate,
  propertyChunk,
  propertyChunkCount,
  renderSitemapIndex,
  xmlResponse,
} from "@/src/lib/sitemap";

// Rendered on request (data cached via PROPERTIES_CACHE) so builds never depend on the API.
export const dynamic = "force-dynamic";

/** Sitemap index: fixed pages, geo pages and properties in chunks. */
export async function GET() {
  const paths = await fetchSitemapPaths();
  const chunks = Array.from({ length: propertyChunkCount(paths) }, (_, i) => i + 1);

  return xmlResponse(
    renderSitemapIndex([
      { path: "/sitemaps/static.xml" },
      { path: "/sitemaps/geo.xml", lastModified: latestUpdate(paths) },
      ...chunks.map((page) => ({
        path: `/sitemaps/properties-${page}.xml`,
        lastModified: latestUpdate(paths, new Set(propertyChunk(paths, page).map((p) => p.id))),
      })),
    ])
  );
}
