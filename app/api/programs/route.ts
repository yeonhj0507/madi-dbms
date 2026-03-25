import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET() {
  const CACHE_KEY = "programs";
  const cached = cacheGet<{ id: string; name: string }[]>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.PROGRAMS,
    });

    const programs = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties["프로그램명"]?.title?.[0]?.plain_text ?? "(이름 없음)",
    }));

    cacheSet(CACHE_KEY, programs);
    return NextResponse.json(programs, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
