import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDataDirectory } from './dataPaths';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

const DATA_DIR = getDataDirectory();
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const JWT_SECRET = process.env.JWT_SECRET || 'bhumi-vikas-sahayak-jwt-secret-key-2025';

function ensureUsersFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllUsers(): UserRecord[] {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]): void {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function sanitizeUser(user: UserRecord): { id: string; name: string; email: string; createdAt: string } {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function registerUser(name: string, email: string, password: string):Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser: UserRecord = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user: sanitizeUser(newUser), token };
}

export async function loginUser(email: string, password: string): Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user: sanitizeUser(user), token };
}

export function verifyAuthToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; resetToken?: string; message: string }> {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

  if (userIndex === -1) {
    // Return friendly response to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been generated.'
    };
  }

  // Create temporary reset token (expires in 1 hour)
  const resetToken = 'rst_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  users[userIndex].resetToken = resetToken;
  users[userIndex].resetTokenExpiry = Date.now() + 3600000; // 1 hr

  saveUsers(users);

  return {
    success: true,
    resetToken,
    message: 'Reset token generated successfully. In development/on-premise mode, use this token or the verification code to reset your password.'
  };
}

export async function resetPasswordWithToken(email: string, resetToken: string, newPassword: string): Promise<boolean> {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

  if (userIndex === -1) {
    throw new Error('Invalid email or reset request.');
  }

  const user = users[userIndex];
  if (!user.resetToken || user.resetToken !== resetToken.trim()) {
    throw new Error('Invalid or expired reset token.');
  }

  if (!user.resetTokenExpiry || Date.now() > user.resetTokenExpiry) {
    throw new Error('Reset token has expired. Please request a new reset code.');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  delete user.resetToken;
  delete user.resetTokenExpiry;

  saveUsers(users);
  return true;
}
