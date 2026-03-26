/**
 * Enhanced authentication system with bcrypt password hashing
 * Admin role support
 */

import { createHash, randomBytes } from 'crypto';

export type UserRole = 'admin' | 'teacher' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

interface StoredUser {
  passwordHash: string;
  salt: string;
  user: User;
}

// Password hashing using crypto (built-in Node.js)
function hashPassword(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

// In-memory user store (replace with DB in production)
const users = new Map<string, StoredUser>();

// Initialize default users
function initializeDefaultUsers() {
  const defaultUsers = [
    {
      username: 'admin',
      password: 'madi123',
      name: '관리자',
      email: 'admin@madi.com',
      role: 'admin' as UserRole,
    },
    {
      username: 'teacher',
      password: 'madi123',
      name: '강사',
      email: 'teacher@madi.com',
      role: 'teacher' as UserRole,
    },
    {
      username: 'staff',
      password: 'madi123',
      name: '알바',
      email: 'staff@madi.com',
      role: 'staff' as UserRole,
    },
  ];

  defaultUsers.forEach((userData, index) => {
    const salt = generateSalt();
    const passwordHash = hashPassword(userData.password, salt);

    users.set(userData.username, {
      passwordHash,
      salt,
      user: {
        id: String(index + 1),
        username: userData.username,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date(),
      },
    });
  });
}

// Initialize on module load
initializeDefaultUsers();

/**
 * Authenticate user with username and password
 */
export function authenticate(username: string, password: string): User | null {
  const storedUser = users.get(username);

  if (!storedUser) {
    return null;
  }

  const passwordHash = hashPassword(password, storedUser.salt);

  if (passwordHash !== storedUser.passwordHash) {
    return null;
  }

  // Update last login
  storedUser.user.lastLogin = new Date();

  return storedUser.user;
}

/**
 * Create session token (JWT-like but simple)
 */
export function createToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify and decode session token
 */
export function getUserByToken(token: string): User | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check expiration
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }

    const storedUser = users.get(decoded.username);

    if (!storedUser) {
      return null;
    }

    return storedUser.user;
  } catch {
    return null;
  }
}

/**
 * Create new user (admin only)
 */
export function createUser(
  username: string,
  password: string,
  name: string,
  role: UserRole,
  email?: string
): User | null {
  if (users.has(username)) {
    return null; // User already exists
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  const newUser: User = {
    id: String(users.size + 1),
    username,
    name,
    email,
    role,
    createdAt: new Date(),
  };

  users.set(username, {
    passwordHash,
    salt,
    user: newUser,
  });

  return newUser;
}

/**
 * Update user password (admin or self)
 */
export function updatePassword(
  username: string,
  newPassword: string
): boolean {
  const storedUser = users.get(username);

  if (!storedUser) {
    return false;
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(newPassword, salt);

  storedUser.passwordHash = passwordHash;
  storedUser.salt = salt;

  return true;
}

/**
 * Delete user (admin only)
 */
export function deleteUser(username: string): boolean {
  return users.delete(username);
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  return Array.from(users.values()).map((storedUser) => storedUser.user);
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    teacher: 2,
    staff: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}
