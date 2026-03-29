import { success, error } from '@/lib/api-response';
import { logRequest, logError } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

const SCHEDULE_FILE = path.join(process.cwd(), 'data', 'clinic-schedules.json');

interface Schedule {
  id: string;
  programId: string;
  programName: string;
  dayOfWeek: number;
  enabled: boolean;
}

async function loadSchedules(): Promise<Schedule[]> {
  try {
    await fs.mkdir(path.dirname(SCHEDULE_FILE), { recursive: true });
    const data = await fs.readFile(SCHEDULE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSchedules(schedules: Schedule[]) {
  await fs.mkdir(path.dirname(SCHEDULE_FILE), { recursive: true });
  await fs.writeFile(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
}

export async function GET() {
  try {
    logRequest('GET', '/api/clinic/schedule');
    const schedules = await loadSchedules();
    return success(schedules);
  } catch (err) {
    logError(err);
    return error('스케줄 조회 실패', 500);
  }
}

export async function POST(req: Request) {
  try {
    logRequest('POST', '/api/clinic/schedule');
    const { programId, programName, dayOfWeek, enabled = true } = await req.json();

    if (!programId || dayOfWeek === undefined) {
      return error('programId와 dayOfWeek가 필요합니다', 400);
    }

    const schedules = await loadSchedules();
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      programId,
      programName: programName || '(이름 없음)',
      dayOfWeek,
      enabled,
    };

    schedules.push(newSchedule);
    await saveSchedules(schedules);

    return success(newSchedule, '스케줄 추가 완료');
  } catch (err) {
    logError(err);
    return error('스케줄 추가 실패', 500);
  }
}
