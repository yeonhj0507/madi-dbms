import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const CACHE_KEY = `program-tests:${id}`;
  const cached = await cacheGet<{ id: string; name: string }[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  }

  try {
    // 1. 프로그램 페이지에서 MADI_TEST 관리 relation ID 목록 읽기
    const programPage = await notion.pages.retrieve({ page_id: id }) as any;
    let testIds: string[] =
      programPage.properties["MADI_TEST 관리"]?.relation?.map((r: any) => r.id) ?? [];

    // has_more일 때 나머지 ID를 페이지네이션으로 추가
    if (programPage.properties["MADI_TEST 관리"]?.has_more) {
      const propId = programPage.properties["MADI_TEST 관리"]?.id;
      let cursor: string | undefined = undefined;
      do {
        const propPage: any = await notion.pages.properties.retrieve({
          page_id: id,
          property_id: propId,
          ...(cursor ? { start_cursor: cursor } : {}),
        });
        const extra = propPage.results?.map((r: any) => r.relation?.id).filter(Boolean) ?? [];
        testIds = [...testIds, ...extra];
        cursor = propPage.has_more ? propPage.next_cursor : undefined;
      } while (cursor);
    }

    if (testIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. 각 test 페이지를 병렬로 조회해 이름 가져오기
    const tests = await Promise.all(
      testIds.map((testId) =>
        notion.pages.retrieve({ page_id: testId })
          .then((p: any) => ({
            id: testId,
            name: p.properties["시험제목"]?.title?.[0]?.plain_text ?? "(이름 없음)",
          }))
          .catch(() => ({ id: testId, name: "(로드 실패)" }))
      )
    );

    await cacheSet(CACHE_KEY, tests);
    return NextResponse.json(tests, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
