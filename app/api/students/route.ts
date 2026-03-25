import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.STUDENTS,
      filter: {
        property: "이름",
        title: { contains: q },
      },
      page_size: 20,
    });

    const students = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties["이름"]?.title?.[0]?.plain_text ?? "(이름 없음)",
    }));

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
