import { success } from '@/lib/api-response';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  
  return success(null, '로그아웃 성공');
}
