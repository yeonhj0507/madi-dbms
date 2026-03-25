import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { success, error as apiError } from "@/lib/api-response";
import { PaginationSchema, SearchSchema, validateRequest } from "@/lib/schemas";
import { logRequest, logError } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    logRequest('GET', '/api/students');
    
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);
    
    const paginationValidation = validateRequest(PaginationSchema, {
      page: params.page || '1',
      limit: params.limit || '20',
      cursor: params.cursor,
    });
    
    const searchValidation = validateRequest(SearchSchema, {
      query: params.q,
    });
    
    if (!paginationValidation.success) {
      return apiError(paginationValidation.error, 422);
    }
    
    if (!searchValidation.success) {
      return apiError(searchValidation.error, 422);
    }
    
    const { limit, cursor } = paginationValidation.data;
    const { query } = searchValidation.data;
    
    // 검색어가 없으면 빈 배열
    if (!query || query.length < 1) {
      return success({ students: [], hasMore: false });
    }

    const response = await notion.databases.query({
      database_id: DB_IDS.STUDENTS,
      filter: {
        property: "이름",
        title: { contains: query },
      },
      page_size: limit,
      start_cursor: cursor,
    });

    const students = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties["이름"]?.title?.[0]?.plain_text ?? "(이름 없음)",
    }));

    return success({
      students,
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    });
  } catch (err) {
    logError(err, { path: '/api/students' });
    return apiError('학생 조회 중 오류가 발생했습니다', 500);
  }
}
