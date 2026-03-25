import { success, error } from '@/lib/api-response';
import { logRequest, logError } from '@/lib/logger';
import { notion } from '@/lib/notion';

/**
 * 스마트 클리닉 입력
 * 예: "RC 35, 듣기 좋음" → RC: 35 / 100, 평가: 듣기 좋음
 */
export async function POST(req: Request) {
  try {
    logRequest('POST', '/api/clinic/smart-input');

    const { clinicId, input } = await req.json();

    if (!clinicId || !input) {
      return error('clinicId와 input이 필요합니다', 400);
    }

    // 입력 파싱
    const parsed = parseClinicInput(input);

    if (!parsed) {
      return error(
        '입력 형식을 인식할 수 없습니다. 예: "RC 35, 듣기 좋음"',
        400
      );
    }

    // Notion 업데이트
    const properties: any = {};
    
    if (parsed.rc !== null) {
      properties.RC = { number: parsed.rc };
    }
    
    if (parsed.lc !== null) {
      properties.LC = { number: parsed.lc };
    }
    
    if (parsed.comment) {
      properties.평가 = {
        rich_text: [{ text: { content: parsed.comment } }],
      };
    }
    
    await notion.pages.update({
      page_id: clinicId,
      properties,
    });

    return success(
      {
        parsed,
        message: '클리닉 결과 저장 완료',
      },
      '클리닉 결과 저장 완료'
    );
  } catch (err) {
    logError(err);
    return error('클리닉 입력 실패', 500);
  }
}

/**
 * 입력 파싱 함수
 * 지원 형식:
 * - "RC 35" → { rc: 35 }
 * - "LC 40" → { lc: 40 }
 * - "RC 35, LC 40" → { rc: 35, lc: 40 }
 * - "RC 35, 듣기 좋음" → { rc: 35, comment: "듣기 좋음" }
 * - "35 40 좋음" → { rc: 35, lc: 40, comment: "좋음" }
 */
function parseClinicInput(input: string): {
  rc: number | null;
  lc: number | null;
  comment: string | null;
} | null {
  const result = {
    rc: null as number | null,
    lc: null as number | null,
    comment: null as string | null,
  };

  // 정규화
  input = input.trim();

  // 패턴 1: "RC 35, LC 40, 좋음"
  const pattern1 = /RC\s*(\d+)|LC\s*(\d+)|,\s*([^,\d]+)/gi;
  let match;
  while ((match = pattern1.exec(input)) !== null) {
    if (match[1]) result.rc = parseInt(match[1]);
    if (match[2]) result.lc = parseInt(match[2]);
    if (match[3]) result.comment = match[3].trim();
  }

  // 패턴 2: "35 40 좋음" (숫자 2개 + 텍스트)
  if (result.rc === null && result.lc === null) {
    const pattern2 = /^(\d+)\s+(\d+)\s*(.*)$/;
    const match2 = input.match(pattern2);
    if (match2) {
      result.rc = parseInt(match2[1]);
      result.lc = parseInt(match2[2]);
      result.comment = match2[3].trim() || null;
    }
  }

  // 패턴 3: "35 좋음" (숫자 1개 + 텍스트, RC로 간주)
  if (result.rc === null && result.lc === null) {
    const pattern3 = /^(\d+)\s*(.*)$/;
    const match3 = input.match(pattern3);
    if (match3) {
      result.rc = parseInt(match3[1]);
      result.comment = match3[2].trim() || null;
    }
  }

  // 최소 하나라도 있으면 성공
  if (result.rc !== null || result.lc !== null || result.comment !== null) {
    return result;
  }

  return null;
}
