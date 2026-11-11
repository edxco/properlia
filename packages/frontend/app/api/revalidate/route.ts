import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { invalidatePathIndex } from "@/src/lib/pathIndex";

const ALLOWED_TAGS = ["properties"];

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tag = typeof body.tag === "string" ? body.tag : "properties";
  if (!ALLOWED_TAGS.includes(tag)) {
    return NextResponse.json({ error: "Unknown tag" }, { status: 400 });
  }

  revalidateTag(tag, { expire: 0 });
  invalidatePathIndex();
  return NextResponse.json({ revalidated: tag });
}
