import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getUserByToken,
  isAdmin,
  getAllUsers,
  createUser,
} from '@/lib/auth-v2';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserByToken(token);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = getAllUsers();

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserByToken(token);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, name, role, email } = body;

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newUser = createUser(username, password, name, role, email);

    if (!newUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
