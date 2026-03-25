import { success, error } from '@/lib/api-response';
import { logRequest, logError } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

const SCHEDULE_FILE = path.join(process.cwd(), 'data', 'clinic-schedules.json');

async function loadSchedules() {
  try {
    const data = await fs.readFile(SCHEDULE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSchedules(schedules: any[]) {
  await fs.mkdir(path.dirname(SCHEDULE_FILE), { recursive: true });
  await fs.writeFile(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logRequest('PATCH', `/api/clinic/schedule/${id}`);

    const { enabled } = await req.json();
    const schedules = await loadSchedules();

    const index = schedules.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return error('스케줄을 찾을 수 없습니다', 404);
    }

    schedules[index].enabled = enabled;
    await saveSchedules(schedules);

    return success({ data: schedules[index] }, '스케줄 업데이트 완료');
  } catch (err) {
    logError(err);
    return error('스케줄 업데이트 실패', 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logRequest('DELETE', `/api/clinic/schedule/${id}`);

    const schedules = await loadSchedules();
    const filtered = schedules.filter((s: any) => s.id !== id);

    await saveSchedules(filtered);
    return success(null, '스케줄 삭제 완료');
  } catch (err) {
    logError(err);
    return error('스케줄 삭제 실패', 500);
  }
}
