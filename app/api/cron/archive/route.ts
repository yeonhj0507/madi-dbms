import { NextResponse } from 'next/server';
import { logRequest } from '@/lib/logger';

/**
 * Vercel Cron으로 월초에 자동 실행
 * vercel.json에 스케줄 설정 필요
 */
export async function GET(req: Request) {
  try {
    logRequest('GET', '/api/cron/archive');
    
    // Vercel Cron Secret 확인
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    // 아카이빙 API 호출
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/archive`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month: lastMonth, dryRun: false }),
      }
    );
    
    const result = await response.json();
    
    return NextResponse.json({
      ok: true,
      message: `${year}년 ${lastMonth}월 자동 아카이빙 완료`,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
