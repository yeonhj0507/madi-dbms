import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

// GET: fetch test records by date (optionally filtered by testId)
// Uses formula properties (학생이름, TEST제목) to avoid N+1 page fetches
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("testId"); // optional
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date 필수" }, { status: 400 });
  }

  const filter: any = testId
    ? {
        and: [
          { property: "TEST", relation: { contains: testId } },
          { property: "날짜", date: { equals: date } },
        ],
      }
    : { property: "날짜", date: { equals: date } };

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.TEST_RECORDS,
      filter,
    });

    // formula 프로퍼티를 직접 읽어 추가 API 호출 없이 처리
    const records = response.results.map((page: any) => ({
      id: page.id,
      studentId: page.properties["학생"]?.relation?.[0]?.id ?? null,
      studentName: page.properties["학생이름"]?.formula?.string ?? "(알 수 없음)",
      testId: page.properties["TEST"]?.relation?.[0]?.id ?? null,
      testName: page.properties["TEST제목"]?.formula?.string ?? "(알 수 없음)",
      score: page.properties["점수"]?.number ?? null,
    }));

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: update scores
export async function PATCH(req: Request) {
  const { scores } = await req.json();

  if (!scores?.length) {
    return NextResponse.json({ error: "scores 필수" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    scores.map(({ recordId, score }: { recordId: string; score: number }) =>
      notion.pages.update({
        page_id: recordId,
        properties: {
          점수: { number: score },
          상태: { status: { name: "테스트 완료" } },
        },
      })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ succeeded, failed });
}
