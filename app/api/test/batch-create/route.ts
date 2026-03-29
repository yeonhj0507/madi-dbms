import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { CreateTestSchema, validateRequest } from "@/lib/schemas";
import { success, error, validationError } from "@/lib/api-response";
import { logRequest, logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logRequest('POST', '/api/test/batch-create');
    
    const body = await req.json();
    
    const validation = validateRequest(CreateTestSchema, {
      students: body.students,
      programId: body.programId,
      testId: body.testId,
      date: body.date,
    });
    
    if (!validation.success) {
      return validationError(validation.error);
    }
    
    const { students, testId, date } = validation.data;
    const category = body.category;
    
    if (!category) {
      return validationError('Category is required');
    }

    // TEST 관리 페이지에서 시험구분/시험유형 가져오기
    let testDivision = "";
    let testType = "";
    try {
      const testPage = await notion.pages.retrieve({ page_id: testId }) as any;
      testDivision = testPage.properties["시험구분"]?.select?.name ?? "";
      testType = testPage.properties["시험유형"]?.select?.name ?? "";
    } catch (err) {
      logError(err, { context: 'Fetching test division/type' });
    }

    const results = await Promise.allSettled(
      students.map(({ id: studentId, name: studentName }) => {
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

    if (failures.length) {
      logError(new Error('Some test records failed'), { failures });
    }

    return success({
      succeeded,
      failed: failures.length,
      errors: failures,
    }, `TEST ${succeeded}개 생성, ${failures.length}개 실패`);
  } catch (err) {
    logError(err, { path: '/api/test/batch-create' });
    return error('TEST 생성 중 오류가 발생했습니다');
  }
}
