import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { CreateClinicSchema, validateRequest } from "@/lib/schemas";
import { success, error, validationError } from "@/lib/api-response";
import { logRequest, logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logRequest('POST', '/api/clinic/batch-create');
    
    const body = await req.json();
    const validation = validateRequest(CreateClinicSchema, body);
    
    if (!validation.success) {
      return validationError(validation.error);
    }
    
    const { students, programId, date, contentDefault, contentsPerStudent } = validation.data;

  // YYMMDD 형식 날짜
  const [y, m, d] = date.split("-");
  const dateShort = `${y.slice(2)}${m}${d}`;

  const results = await Promise.allSettled(
    students.map(({ id: studentId, name: studentName }: { id: string; name: string }) => {
      const content = contentsPerStudent?.[studentId] ?? contentDefault ?? "";
      const title = `${studentName}_${dateShort} 클리닉`;

      return notion.pages.create({
        parent: { database_id: DB_IDS.CLINICS },
        properties: {
          제목: { title: [{ text: { content: title } }] },
          "학생 관리": { relation: [{ id: studentId }] },
          프로그램: { relation: [{ id: programId }] },
          날짜: { date: { start: date } },
          클리닉내용: {
            rich_text: content ? [{ text: { content } }] : [],
          },
          상태: { status: { name: "클리닉 전" } },
        },
      });
    })
  );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return success({ succeeded, failed }, `클리닉 ${succeeded}개 생성, ${failed}개 실패`);
  } catch (err) {
    logError(err, { path: '/api/clinic/batch-create' });
    return error('클리닉 생성 중 오류가 발생했습니다');
  }
}
