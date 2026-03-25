import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

export async function POST(req: Request) {
  const { students, testId, date, category } = await req.json();
  // students: { id: string; name: string }[]

  if (!students?.length || !testId || !date || !category) {
    return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
  }

  // TEST 관리 페이지에서 시험구분/시험유형 가져오기
  let testDivision = "";
  let testType = "";
  try {
    const testPage = await notion.pages.retrieve({ page_id: testId }) as any;
    testDivision = testPage.properties["시험구분"]?.select?.name ?? "";
    testType = testPage.properties["시험유형"]?.select?.name ?? "";
  } catch {
    // 제목 생성 실패해도 등록은 계속 진행
  }

  const results = await Promise.allSettled(
    students.map(({ id: studentId, name: studentName }: { id: string; name: string }) => {
      const titleParts = [studentName, testDivision, testType, category].filter(Boolean);
      const title = titleParts.join("_");

      return notion.pages.create({
        parent: { database_id: DB_IDS.TEST_RECORDS },
        properties: {
          이름제목: { title: [{ text: { content: title } }] },
          학생: { relation: [{ id: studentId }] },
          TEST: { relation: [{ id: testId }] },
          날짜: { date: { start: date } },
          응시구분: { select: { name: category } },
          상태: { status: { name: "테스트 예정" } },
        },
      });
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failures = results
    .filter((r) => r.status === "rejected")
    .map((r) => (r as PromiseRejectedResult).reason?.message ?? String((r as PromiseRejectedResult).reason));

  if (failures.length) console.error("[batch-create] 실패:", failures);

  return NextResponse.json({ succeeded, failed: failures.length, errors: failures });
}
