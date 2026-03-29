import { NextResponse } from "next/server";
import { notion } from "@/lib/notion";
import { cacheDel } from "@/lib/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  // body may contain: status, result, needsReview

  const properties: Record<string, any> = {};

  if (body.status !== undefined) {
    properties["상태"] = { status: { name: body.status } };
  }

  if (body.result !== undefined || body.needsReview !== undefined) {
    const currentPage = await notion.pages.retrieve({ page_id: id }) as any;
    let existingResult =
      currentPage.properties["클리닉결과"]?.rich_text?.[0]?.plain_text ?? "";

    // Strip existing [보충] tag
    existingResult = existingResult.replace(/^\[보충\]\s*/, "");

    let finalResult = body.result !== undefined ? body.result : existingResult;

    if (body.needsReview) {
      finalResult = `[보충] ${finalResult}`;
    }

    properties["클리닉결과"] = {
      rich_text: finalResult ? [{ text: { content: finalResult } }] : [],
    };
  }

  try {
    await notion.pages.update({ page_id: id, properties });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await notion.pages.update({ page_id: id, archived: true });
    await cacheDel("clinics:today");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
