import * as SecureStore from 'expo-secure-store';
import { AuthSession } from '../types/auth.types';

const SESSION_KEY = 'rebook.auth.session';

let inMemorySession: AuthSession | null = null;
let refreshHandler: ((currentSession: AuthSession) => Promise<AuthSession>) | null = null;
let refreshPromise: Promise<AuthSession> | null = null;

export function registerRefreshHandler(handler: (currentSession: AuthSession) => Promise<AuthSession>) {
  refreshHandler = handler;
}

export function getAccessToken(): string | null {
  return inMemorySession?.accessToken ?? null;
}

export function getSession(): AuthSession | null {
  return inMemorySession;
}

export async function setSession(session: AuthSession): Promise<void> {
  inMemorySession = session;
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  inMemorySession = null;
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function hydrateSession(): Promise<AuthSession | null> {
  if (inMemorySession) {
    return inMemorySession;
  }

  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    inMemorySession = parsed;
    return parsed;
  } catch {
    await clearSession();
    return null;
  }
}

export async function refreshSessionSingleFlight(): Promise<AuthSession> {
  if (!inMemorySession?.refreshToken) {
    throw new Error('리프레시 토큰이 없어 재로그인이 필요해요.');
  }

  if (!refreshHandler) {
    throw new Error('리프레시 핸들러가 등록되지 않았어요.');
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const nextSession = await refreshHandler(inMemorySession as AuthSession);
    await setSession(nextSession);
    return nextSession;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
