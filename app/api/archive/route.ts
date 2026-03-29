import { notion } from "@/lib/notion";
import { DB_IDS } from "@/lib/notion-ids";
import { success, error } from "@/lib/api-response";

const BACKUP_IDS = {
  STUDENTS: process.env.BACKUP_STUDENTS_DB!,
  PROGRAMS: process.env.BACKUP_PROGRAMS_DB!,
  TEST_MGMT: process.env.BACKUP_TEST_MGMT_DB!,
  TEST_RECORDS: process.env.BACKUP_TEST_RECORDS_DB!,
  CLINICS: process.env.BACKUP_CLINICS_DB!,
};

const today = () => new Date().toISOString().split("T")[0];

function oneMonthAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
}

// 배치 처리 (rate limit 대응: N개씩 나눠서 실행)
async function batchRun<T>(items: T[], fn: (item: T) => Promise<any>, batchSize = 10, delayMs = 200) {
  let succeeded = 0;
  const errors: string[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(fn));
    succeeded += results.filter(r => r.status === "fulfilled").length;
    results.forEach(r => {
      if (r.status === "rejected") errors.push(r.reason?.message ?? String(r.reason));
    });
    if (i + batchSize < items.length) await new Promise(r => setTimeout(r, delayMs));
  }
  return { succeeded, errors };
}

// 페이지네이션 처리된 전체 쿼리
async function queryAll(database_id: string, filter: any) {
  let results: any[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await notion.databases.query({
      database_id,
      filter,
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    });
    results = [...results, ...res.results];
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

function text(v: string) {
  return { rich_text: v ? [{ text: { content: v.slice(0, 2000) } }] : [] };
}

// ── 각 DB 아카이브 함수 ──────────────────────────────────────────

async function archiveStudents(dryRun: boolean) {
  const pages = await queryAll(DB_IDS.STUDENTS, {
    property: "상태", status: { equals: "퇴원" },
  });
  if (dryRun || !pages.length) return { count: pages.length, copied: 0, errors: [] };

  const { succeeded, errors } = await batchRun(pages, (p: any) =>
    notion.pages.create({
      parent: { database_id: BACKUP_IDS.STUDENTS },
      properties: {
        이름: { title: [{ text: { content: p.properties["이름"]?.title?.[0]?.plain_text ?? "" } }] },
        상태: text(p.properties["상태"]?.status?.name ?? ""),
        학년: text(p.properties["학년"]?.select?.name ?? ""),
        지점: text(p.properties["지점"]?.select?.name ?? ""),
        등원시작일: p.properties["등원시작일"]?.date?.start ? { date: { start: p.properties["등원시작일"].date.start } } : { date: null },
        아카이브일: { date: { start: today() } },
      },
    })
  );
  return { count: pages.length, copied: succeeded, errors: errors.slice(0, 3) };
}

async function archivePrograms(dryRun: boolean) {
  const pages = await queryAll(DB_IDS.PROGRAMS, {
    property: "상태", status: { equals: "종강" },
  });
  if (dryRun || !pages.length) return { count: pages.length, copied: 0, errors: [] };

  const { succeeded, errors } = await batchRun(pages, (p: any) =>
    notion.pages.create({
      parent: { database_id: BACKUP_IDS.PROGRAMS },
      properties: {
        프로그램명: { title: [{ text: { content: p.properties["프로그램명"]?.title?.[0]?.plain_text ?? "" } }] },
        상태: text(p.properties["상태"]?.status?.name ?? ""),
        캠퍼스: text(p.properties["캠퍼스"]?.select?.name ?? ""),
        수업기간_시작: p.properties["수업기간"]?.date?.start ? { date: { start: p.properties["수업기간"].date.start } } : { date: null },
        아카이브일: { date: { start: today() } },
      },
    })
  );
  return { count: pages.length, copied: succeeded, errors: errors.slice(0, 3) };
}

async function archiveTestMgmt(dryRun: boolean) {
  const cutoff = oneMonthAgo();
  const pages = await queryAll(DB_IDS.TEST_MANAGEMENT, {
    and: [
      { property: "상태", status: { equals: "시험 완료" } },
      { property: "정규시험일", date: { before: cutoff } },
    ],
  });
  if (dryRun || !pages.length) return { count: pages.length, copied: 0, errors: [] };

  const { succeeded, errors } = await batchRun(pages, (p: any) =>
    notion.pages.create({
      parent: { database_id: BACKUP_IDS.TEST_MGMT },
      properties: {
        제목: { title: [{ text: { content: p.properties["시험제목"]?.title?.[0]?.plain_text ?? "" } }] },
        시험제목: text(p.properties["시험제목"]?.title?.[0]?.plain_text ?? ""),
        시험유형: text(p.properties["시험유형"]?.select?.name ?? ""),
        시험구분: text(p.properties["시험구분"]?.select?.name ?? ""),
        정규시험일: p.properties["정규시험일"]?.date?.start ? { date: { start: p.properties["정규시험일"].date.start } } : { date: null },
        상태: text(p.properties["상태"]?.status?.name ?? ""),
        아카이브일: { date: { start: today() } },
      },
    })
  );
  return { count: pages.length, copied: succeeded, errors: errors.slice(0, 3) };
}

async function archiveTestRecords(dryRun: boolean) {
  const cutoff = oneMonthAgo();
  const pages = await queryAll(DB_IDS.TEST_RECORDS, {
    property: "날짜", date: { before: cutoff },
  });
  if (dryRun || !pages.length) return { count: pages.length, copied: 0, errors: [] };

  const { succeeded, errors } = await batchRun(pages, (p: any) =>
    notion.pages.create({
      parent: { database_id: BACKUP_IDS.TEST_RECORDS },
      properties: {
        이름제목: { title: [{ text: { content: p.properties["이름제목"]?.title?.[0]?.plain_text ?? "" } }] },
        학생이름: text(p.properties["학생이름"]?.formula?.string ?? ""),
        TEST제목: text(p.properties["TEST제목"]?.formula?.string ?? ""),
        날짜: p.properties["날짜"]?.date?.start ? { date: { start: p.properties["날짜"].date.start } } : { date: null },
        응시구분: text(p.properties["응시구분"]?.select?.name ?? ""),
        점수: { number: p.properties["점수"]?.number ?? null },
        상태: text(p.properties["상태"]?.status?.name ?? ""),
        아카이브일: { date: { start: today() } },
      },
    })
  );
  return { count: pages.length, copied: succeeded, errors: errors.slice(0, 3) };
}

async function archiveClinics(dryRun: boolean) {
  const cutoff = oneMonthAgo();
  const pages = await queryAll(DB_IDS.CLINICS, {
    property: "날짜", date: { before: cutoff },
  });
  if (dryRun || !pages.length) return { count: pages.length, copied: 0, errors: [] };

  const { succeeded, errors } = await batchRun(pages, (p: any) =>
    notion.pages.create({
      parent: { database_id: BACKUP_IDS.CLINICS },
      properties: {
        제목: { title: [{ text: { content: p.properties["제목"]?.title?.[0]?.plain_text ?? "" } }] },
        학생명: text(p.properties["학생명"]?.rollup?.array?.[0]?.title?.[0]?.plain_text ?? ""),
        날짜: p.properties["날짜"]?.date?.start ? { date: { start: p.properties["날짜"].date.start } } : { date: null },
        클리닉내용: text(p.properties["클리닉내용"]?.rich_text?.[0]?.plain_text ?? ""),
        클리닉결과: text(p.properties["클리닉결과"]?.rich_text?.[0]?.plain_text ?? ""),
        상태: text(p.properties["상태"]?.status?.name ?? ""),
        아카이브일: { date: { start: today() } },
      },
    })
  );
  return { count: pages.length, copied: succeeded, errors: errors.slice(0, 3) };
}

// ── Dry run 조회 ─────────────────────────────────────────────────

export async function GET() {
  try {
    const cutoff = oneMonthAgo();
    const [students, programs, testMgmt, testRecords, clinics] = await Promise.all([
      queryAll(DB_IDS.STUDENTS, { property: "상태", status: { equals: "퇴원" } }),
      queryAll(DB_IDS.PROGRAMS, { property: "상태", status: { equals: "종강" } }),
      queryAll(DB_IDS.TEST_MANAGEMENT, {
        and: [
          { property: "상태", status: { equals: "시험 완료" } },
          { property: "정규시험일", date: { before: cutoff } },
        ],
      }),
      queryAll(DB_IDS.TEST_RECORDS, { property: "날짜", date: { before: cutoff } }),
      queryAll(DB_IDS.CLINICS, { property: "날짜", date: { before: cutoff } }),
    ]);

    return success({
      cutoff,
      preview: {
        students: students.length,
        programs: programs.length,
        testMgmt: testMgmt.length,
        testRecords: testRecords.length,
        clinics: clinics.length,
        total: students.length + programs.length + testMgmt.length + testRecords.length + clinics.length,
      },
    });
  } catch (err: any) {
    return error(err.message, 500);
  }
}

// ── 실제 아카이브 ────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { dryRun = true, targets = ["students", "programs", "testMgmt", "testRecords", "clinics"] } = await req.json();

    const run = async (key: string, fn: (d: boolean) => Promise<any>) =>
      targets.includes(key) ? fn(dryRun) : { count: 0, copied: 0, skipped: true };

    const [students, programs, testMgmt, testRecords, clinics] = await Promise.all([
      run("students", archiveStudents),
      run("programs", archivePrograms),
      run("testMgmt", archiveTestMgmt),
      run("testRecords", archiveTestRecords),
      run("clinics", archiveClinics),
    ]);

    return success({
      dryRun,
      results: { students, programs, testMgmt, testRecords, clinics },
      message: dryRun ? "미리보기 완료 (실제 이관 없음)" : "백업 완료 (원본은 유지됨)",
    });
  } catch (err: any) {
    return error(err.message, 500);
  }
}
