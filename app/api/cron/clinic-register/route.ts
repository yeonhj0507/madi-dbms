import { NextResponse } from 'next/server';
import { logRequest } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

const SCHEDULE_FILE = path.join(process.cwd(), 'data', 'clinic-schedules.json');

/**
 * 매일 자정 실행 - 정기 클리닉 자동 등록
 */
export async function GET(req: Request) {
  try {
    logRequest('GET', '/api/cron/clinic-register');

    // Cron Secret 확인
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 오늘 요일 (0=일, 1=월, ..., 6=토)
    const today = new Date();
    const dayOfWeek = today.getDay();

    // 스케줄 로드
    let schedules = [];
    try {
      const data = await fs.readFile(SCHEDULE_FILE, 'utf-8');
      schedules = JSON.parse(data);
    } catch {
      return NextResponse.json({
        ok: true,
        message: '등록된 스케줄 없음',
      });
    }

    // 오늘 실행할 스케줄 필터
    const todaySchedules = schedules.filter(
      (s: any) => s.enabled && s.dayOfWeek === dayOfWeek
    );

    if (todaySchedules.length === 0) {
      return NextResponse.json({
        ok: true,
        message: `오늘(${['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}요일)은 실행할 스케줄 없음`,
      });
    }

    // 각 스케줄별로 클리닉 등록
    const results = [];
    for (const schedule of todaySchedules) {
      const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/clinic/bulk-register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: schedule.programId,
            date: today.toISOString().split('T')[0],
          }),
        }
      );

      const data = await res.json();
      results.push({
        programName: schedule.programName,
        success: data.ok,
        message: data.message,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `${todaySchedules.length}개 프로그램 자동 등록 완료`,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
