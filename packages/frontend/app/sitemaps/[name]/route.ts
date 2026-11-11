import {
  fetchSitemapPaths,
  geoEntries,
  propertyChunk,
  propertyChunkCount,
  propertyEntries,
  renderUrlSet,
  staticEntries,
  xmlResponse,
} from "@/src/lib/sitemap";

export const dynamic = "force-dynamic";

/** /sitemaps/static.xml, /sitemaps/geo.xml and /sitemaps/properties-{n}.xml */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const paths = await fetchSitemapPaths();

  if (name === "static.xml") return xmlResponse(renderUrlSet(staticEntries(paths)));
  if (name === "geo.xml") return xmlResponse(renderUrlSet(geoEntries(paths)));

  const page = Number(name.match(/^properties-(\d+)\.xml$/)?.[1]);
  if (Number.isInteger(page) && page >= 1 && page <= propertyChunkCount(paths)) {
    return xmlResponse(renderUrlSet(propertyEntries(propertyChunk(paths, page))));
  }
  return new Response("Not Found", { status: 404 });
}
