import type { JWTPayload } from "./types";

const COOKIE = "cizup_token";
const RT_COOKIE = "cizup_rt";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  return match ? match.split("=").slice(1).join("=") : null;
}

export function setToken(token: string, expiresIn: number) {
  const expires = new Date(Date.now() + expiresIn * 1000).toUTCString();
  document.cookie = `${COOKIE}=${token}; path=/; expires=${expires}; SameSite=Lax`;
}

export function setTokens(access: string, refresh: string) {
  const exp = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE}=${access}; path=/; expires=${exp}; SameSite=Lax`;
  const rexp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${RT_COOKIE}=${refresh}; path=/; expires=${rexp}; SameSite=Lax`;
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${RT_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function clearTokens() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
  document.cookie = `${RT_COOKIE}=; path=/; max-age=0`;
}

export function clearToken() {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
  document.cookie = `${RT_COOKIE}=; path=/; max-age=0`;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUser(): JWTPayload | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) { clearToken(); return null; }
  return payload;
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}
