import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByToken, isAdmin, deleteUser } from '@/lib/auth-v2';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserByToken(token);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { username } = await params;

  // Prevent deleting self
  if (username === user.username) {
    return NextResponse.json(
      { error: 'Cannot delete yourself' },
      { status: 400 }
    );
  }

  const success = deleteUser(username);

  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'User deleted successfully' });
}
