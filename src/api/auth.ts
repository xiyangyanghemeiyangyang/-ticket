import { z } from 'zod';
import { UserProfile } from '../types/user';

const STORAGE_KEYS = {
  USERS: 'app_users',
  TOKEN: 'app_token',
  CURRENT_USER_ID: 'app_current_user_id',
  TOKEN_EXPIRES_AT: 'app_token_expires_at',//过期时间
} as const;//作为loacalStorage的Key保存。

const registerSchema = z.object({
  phoneNumber: z.string().min(11),
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
}//模拟数据库

function writeUsers(users: Record<string, UserProfile & { password: string }>): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}//模拟数据库

function generateId(): string {
  if(typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'u_' + crypto.randomUUID();
  }else{
    console.warn('%c浏览器不支持crypto.randomUUID，使用Math.random()生成ID', 'color: orange; font-weight: bold; font-size: 12px;');
    return 'u_' + Math.random().toString(36).slice(2, 10);
  }
  // return 'u_' + Math.random().toString(36).slice(2, 10);
}//唯一token

function setAuth(token: string, userId: string, expiresInM =  24 * 60 * 60 * 1000){
  const expiration = Date.now() + expiresInM;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiration.toString());
}

export function isLoggedIn(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);

  if (!token || !expiresAt) return false;
  if (Date.now() > Number(expiresAt)) {
    logout();
    return false;
  }
  return true;
}//新增的判断是否过期的逻辑
export async function register(input: RegisterInput): Promise<{ token: string; user: UserProfile }>
{
  const data = registerSchema.parse(input);
  const users = readUsers();
  const exists = Object.values(users).some((u) => u.phoneNumber === data.phoneNumber);
  if (exists) {
    throw new Error('该手机号已注册');
  }//regist logic
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
  // localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  // localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  setAuth(token, id, 30 * 60 * 1000);
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


