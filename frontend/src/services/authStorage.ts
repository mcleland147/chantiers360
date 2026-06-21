import type { User } from "../types/domain";

const AUTH_STORAGE_KEY = "chantiers360_auth";

export interface StoredAuthSession {
  token: string;
  user: User;
}

export function loadAuthSession(): StoredAuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed.token || !parsed.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return loadAuthSession()?.token ?? null;
}

export function getStoredUser(): User | null {
  return loadAuthSession()?.user ?? null;
}
