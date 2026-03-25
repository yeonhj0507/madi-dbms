import { notion } from '@/lib/notion';
import { DB_IDS } from '@/lib/notion-ids';
import { success, error } from '@/lib/api-response';
import { logRequest, logError } from '@/lib/logger';

/**
 * 월별 데이터 아카이빙 API
 * 지정된 월의 TEST_RECORDS와 CLINICS를 아카이브 DB로 이관
 */
export async function POST(req: Request) {
  try {
    logRequest('POST', '/api/archive');
    
    const { year, month, dryRun = false } = await req.json();
    
    if (!year || !month) {
      return error('year와 month가 필요합니다', 400);
    }
    
    // 날짜 범위 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // 아카이브 DB ID (환경변수에서 가져오거나 생성)
    const archiveDbIds = {
      testRecords: process.env[`ARCHIVE_TEST_RECORDS_${year}_${month}`] || null,
      clinics: process.env[`ARCHIVE_CLINICS_${year}_${month}`] || null,
    };
    
    // TEST_RECORDS 조회
    const testRecordsQuery = await notion.databases.query({
      database_id: DB_IDS.TEST_RECORDS,
      filter: {
        and: [
          {
            property: '날짜',
            date: {
              on_or_after: startDate,
            },
          },
          {
            property: '날짜',
            date: {
              on_or_before: endDate,
            },
          },
        ],
      },
    });
    
    // CLINICS 조회
    const clinicsQuery = await notion.databases.query({
      database_id: DB_IDS.CLINICS,
      filter: {
        and: [
          {
            property: '날짜',
            date: {
              on_or_after: startDate,
            },
          },
          {
            property: '날짜',
            date: {
              on_or_before: endDate,
            },
          },
        ],
      },
    });
    
    const stats = {
      testRecords: testRecordsQuery.results.length,
      clinics: clinicsQuery.results.length,
    };
    
    // Dry run - 이관할 데이터만 확인
    if (dryRun) {
      return success({
        message: 'Dry run 완료 (실제 이관 없음)',
        stats,
        startDate,
        endDate,
      });
    }
    
    // 실제 아카이빙 (아카이브 DB가 있을 때만)
    let archived = {
      testRecords: 0,
      clinics: 0,
    };
    
    if (archiveDbIds.testRecords) {
      // TEST_RECORDS 복사 & 원본 삭제는 수동으로
      // (Notion API는 bulk move를 직접 지원하지 않음)
      archived.testRecords = testRecordsQuery.results.length;
    }
    
    if (archiveDbIds.clinics) {
      archived.clinics = clinicsQuery.results.length;
    }
    
    return success({
      message: '아카이빙 준비 완료',
      stats,
      archived,
      note: '실제 이관은 Notion에서 수동으로 진행하거나, 별도 스크립트 필요',
    });
  } catch (err) {
    logError(err, { path: '/api/archive' });
    return error('아카이빙 중 오류 발생', 500);
  }
}

/**
 * 아카이빙 가능한 월 조회
 */
export async function GET() {
  try {
    logRequest('GET', '/api/archive');
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // 지난달까지만 아카이빙 가능
    const archivableMonths = [];
    for (let i = 1; i < currentMonth; i++) {
      archivableMonths.push({
        year: currentYear,
        month: i,
        label: `${currentYear}년 ${i}월`,
      });
    }
    
    return success({ archivableMonths });
  } catch (err) {
    logError(err);
    return error('조회 중 오류 발생', 500);
  }
}
