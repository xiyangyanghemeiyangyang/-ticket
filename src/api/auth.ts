import { z } from 'zod';
import { UserProfile } from '../types/user';

const STORAGE_KEYS = {
  USERS: 'app_users',
  TOKEN: 'app_token',
  CURRENT_USER_ID: 'app_current_user_id',
} as const;

const registerSchema = z.object({
  phoneNumber: z.string().min(6),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  account: z.string().min(3), // phone or username
  password: z.string().min(6),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

function readUsers(): Record<string, UserProfile & { password: string }> {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? JSON.parse(raw) : {};
}

function writeUsers(users: Record<string, UserProfile & { password: string }>): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function generateId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

export async function register(input: RegisterInput): Promise<{ token: string; user: UserProfile }>
{
  const data = registerSchema.parse(input);
  const users = readUsers();
  const exists = Object.values(users).some((u) => u.phoneNumber === data.phoneNumber);
  if (exists) {
    throw new Error('该手机号已注册');
  }
  const id = generateId();
  const user: UserProfile & { password: string } = {
    id,
    name: data.name,
    phoneNumber: data.phoneNumber,
    identityNumber: '',
    isVerified: false,
    password: data.password,
  };
  users[id] = user;
  writeUsers(users);
  const token = 't_' + Math.random().toString(36).slice(2);
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  return { token, user };
}

export async function login(input: LoginInput): Promise<{ token: string; user: UserProfile }>
{
  const data = loginSchema.parse(input);
  const users = readUsers();
  const found = Object.values(users).find(
    (u) => (u.phoneNumber === data.account || u.name === data.account) && u.password === data.password
  );
  if (!found) {
    throw new Error('账号或密码错误');
  }
  const token = 't_' + Math.random().toString(36).slice(2);
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
  const { password: _pw, ...publicUser } = found;
  return { token, user: publicUser };
}

export async function logout(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!id) return null;
  const users = readUsers();
  const u = users[id];
  if (!u) return null;
  const { password: _pw, ...publicUser } = u;
  return publicUser;
}

export async function updateProfile(partial: Partial<Pick<UserProfile, 'name' | 'phoneNumber' | 'identityNumber'>>): Promise<UserProfile>
{
  const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!id) throw new Error('未登录');
  const users = readUsers();
  const user = users[id];
  if (!user) throw new Error('用户不存在');
  const updated = { ...user, ...partial };
  users[id] = updated;
  writeUsers(users);
  const { password: _pw, ...publicUser } = updated;
  return publicUser;
}

export async function verifyIdentityMock(): Promise<UserProfile> {
  const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!id) throw new Error('未登录');
  const users = readUsers();
  const user = users[id];
  if (!user) throw new Error('用户不存在');
  user.isVerified = true;
  users[id] = user;
  writeUsers(users);
  const { password: _pw, ...publicUser } = user;
  return publicUser;
}


