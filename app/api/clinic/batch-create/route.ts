import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

export async function POST(req: Request) {
  const { students, programId, date, contentDefault, contentsPerStudent } =
    await req.json();
  // students: { id: string; name: string }[]
  // contentsPerStudent: Record<studentId, string> — optional, for individual content

  if (!students?.length || !programId || !date) {
    return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
  }

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

  return NextResponse.json({ succeeded, failed });
}
