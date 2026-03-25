import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  const CACHE_KEY = programId ? `tests:${programId}` : "tests";
  const cached = cacheGet<{ id: string; name: string }[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  }

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.TEST_MANAGEMENT,
      ...(programId
        ? { filter: { property: "프로그램", relation: { contains: programId } } }
        : {}),
    });

    const tests = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties["시험제목"]?.title?.[0]?.plain_text ?? "(이름 없음)",
    }));

    cacheSet(CACHE_KEY, tests);
    return NextResponse.json(tests, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { name, type, category, date, programId } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "시험제목은 필수입니다" }, { status: 400 });
  }

  const properties: Record<string, any> = {
    시험제목: { title: [{ text: { content: name.trim() } }] },
  };
  if (type) properties["시험유형"] = { select: { name: type } };
  if (category) properties["시험구분"] = { select: { name: category } };
  if (date) properties["정규시험일"] = { date: { start: date } };
  if (programId) properties["프로그램"] = { relation: [{ id: programId }] };

  try {
    const page = await notion.pages.create({
      parent: { database_id: DB_IDS.TEST_MANAGEMENT },
      properties,
    }) as any;

    // 관련 캐시 무효화
    cacheDel("tests");
    if (programId) {
      cacheDel(`tests:${programId}`);
      cacheDel(`program-tests:${programId}`);
    }

    return NextResponse.json({
      id: page.id,
      name: page.properties["시험제목"]?.title?.[0]?.plain_text ?? name.trim(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
