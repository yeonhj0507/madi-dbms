import { authenticate, createToken } from '@/lib/auth-v2';
import { success, error } from '@/lib/api-response';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    const user = authenticate(username, password);
    
    if (!user) {
      return error('아이디 또는 비밀번호가 올바르지 않습니다', 401);
    }
    
    const token = createToken(user);
    const cookieStore = await cookies();
    
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Vercel HTTPS 지원
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // 모든 경로에서 접근 가능
    });
    
    return success({ user }, '로그인 성공');
  } catch (err) {
    return error('로그인 처리 중 오류가 발생했습니다', 500);
  }
}
