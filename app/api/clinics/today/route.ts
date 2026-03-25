import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.CLINICS,
      filter: {
        property: "날짜",
        date: { equals: today },
      },
    });

    // rollup(학생명)을 직접 읽어 추가 API 호출 없이 처리
    const clinics = response.results.map((page: any) => {
      const result = page.properties["클리닉결과"]?.rich_text?.[0]?.plain_text ?? "";
      const studentName =
        page.properties["학생명"]?.rollup?.array?.[0]?.title?.[0]?.plain_text ?? "(알 수 없음)";

      return {
        id: page.id,
        studentId: page.properties["학생 관리"]?.relation?.[0]?.id ?? null,
        studentName,
        programId: page.properties["프로그램"]?.relation?.[0]?.id ?? null,
        date: page.properties["날짜"]?.date?.start ?? null,
        content: page.properties["클리닉내용"]?.rich_text?.[0]?.plain_text ?? "",
        result,
        status: page.properties["상태"]?.status?.name ?? "클리닉 전",
        needsReview: result.startsWith("[보충]"),
      };
    });

    return NextResponse.json(clinics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
