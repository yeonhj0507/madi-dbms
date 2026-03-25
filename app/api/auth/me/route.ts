import { getUserByToken } from '@/lib/auth';
import { success, unauthorized } from '@/lib/api-response';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return unauthorized();
  }
  
  const user = getUserByToken(token);
  
  if (!user) {
    return unauthorized();
  }
  
  return success({ user });
}
