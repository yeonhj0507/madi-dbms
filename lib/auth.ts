/**
 * Simple authentication system
 * For production, use a proper auth solution
 */

export type UserRole = 'teacher' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

const users: Record<string, { password: string; user: User }> = {
  teacher: {
    password: 'madi123',
    user: {
      id: '1',
      username: 'teacher',
      name: '강사',
      role: 'teacher',
    },
  },
  staff: {
    password: 'madi123',
    user: {
      id: '2',
      username: 'staff',
      name: '알바',
      role: 'staff',
    },
  },
};

export function authenticate(username: string, password: string): User | null {
  const userData = users[username];
  
  if (!userData || userData.password !== password) {
    return null;
  }
  
  return userData.user;
}

export function getUserByToken(token: string): User | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userData = users[decoded.username];
    
    if (!userData || decoded.password !== userData.password) {
      return null;
    }
    
    return userData.user;
  } catch {
    return null;
  }
}

export function createToken(username: string, password: string): string {
  return Buffer.from(JSON.stringify({ username, password })).toString('base64');
}
