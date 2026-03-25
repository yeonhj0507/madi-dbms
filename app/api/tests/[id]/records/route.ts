import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let allResults: any[] = [];
    let cursor: string | undefined;

    do {
      const response: any = await notion.databases.query({
        database_id: DB_IDS.TEST_RECORDS,
        filter: { property: "TEST", relation: { contains: id } },
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      allResults = [...allResults, ...response.results];
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const records = allResults.map((page: any) => ({
      id: page.id,
      studentId: page.properties["학생"]?.relation?.[0]?.id ?? null,
      studentName: page.properties["학생이름"]?.formula?.string ?? "(알 수 없음)",
      score: page.properties["점수"]?.number ?? null,
      status: page.properties["상태"]?.status?.name ?? "테스트 예정",
      category: page.properties["응시구분"]?.select?.name ?? null,
      date: page.properties["날짜"]?.date?.start ?? null,
    }));

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
