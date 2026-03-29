import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const CACHE_KEY = `students:${id}`;
  const cached = await cacheGet<{ id: string; name: string }[]>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.STUDENTS,
      filter: {
        property: "수업프로그램",
        relation: { contains: id },
      },
    });

    const students = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties["이름"]?.title?.[0]?.plain_text ?? "(이름 없음)",
    }));

    await cacheSet(CACHE_KEY, students);
    return NextResponse.json(students, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
