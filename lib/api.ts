import { getToken, clearTokens, getRefreshToken, setTokens } from "./auth";

const BASE = "https://cizup-backend-production.up.railway.app/api/v1";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    if (!body?.access_token || !body?.refresh_token) return false;
    setTokens(body.access_token, body.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init: RequestInit = {}, _retry = false): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    if (!_retry && await tryRefresh()) {
      return request<T>(path, init, true);
    }
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "unauthorized", "Oturum süresi doldu");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.code ?? "error", body?.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

const get  = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
const patch= <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del  = <T>(path: string) => request<T>(path, { method: "DELETE" });

export const api = {
  auth: {
    register: (b: { username: string; email: string; password: string }) => post("/auth/register", b),
    login:    (b: { username: string; password: string }) => post<{ access_token: string; refresh_token: string; expires_in: number }>("/auth/login", b),
  },
  user: {
    me:          () => get<{ user: import("./types").UserProfile }>("/users/me"),
    update:      (b: { username?: string; bio?: string }) => patch("/users/me", b),
    leaderboard: () => get<{ leaderboard: import("./types").LeaderboardEntry[] }>("/leaderboard"),
  },
  courses: {
    list:     () => get<{ courses: import("./types").Course[]; total: number }>("/courses"),
    get:      (id: string) => get<import("./types").Course>(`/courses/${id}`),
    enroll:   (id: string) => post(`/courses/${id}/enroll`),
    progress: (id: string) => get(`/courses/${id}/progress`),
  },
  lessons: {
    progress: (id: string, b: { watch_seconds: number; completed: boolean }) => post(`/lessons/${id}/progress`, b),
  },
  quests: {
    list:     () => get<{ quests: import("./types").QuestListItem[] }>("/quests"),
    progress: () => get<import("./types").UserProgress>("/quests/progress"),
    get:      (level: number) => get<import("./types").Quest>(`/quests/${level}`),
    submit:   (level: number, code: string) => post<import("./types").SubmitResult>(`/quests/${level}/submit`, { code }),
    hints:    (level: number) => get<import("./types").HintsResponse>(`/quests/${level}/hints`),
    buyHint:  (level: number) => post(`/quests/${level}/hints/buy`),
  },
  evos: {
    create:   (b: { level: number; code: string }) => post("/evos", b),
    mine:     () => get<import("./types").MineResponse>("/evos/mine"),
    requests: () => get<{ requests: import("./types").RequestItem[] }>("/evos/requests"),
    history:  () => get<{ evos: import("./types").EvoSummary[] }>("/evos/history"),
    stats:    () => get<import("./types").StatsResponse>("/evos/stats"),
    detail:   (id: string) => get<import("./types").Evo>(`/evos/${id}`),
    accept:   (id: string) => post(`/evos/${id}/accept`),
    review:      (id: string, b: { comment: string }) => post(`/evos/${id}/check/server`, b),
    clientCheck: (id: string, b: { comment?: string }) => post(`/evos/${id}/check/client`, b),
    rate:        (id: string, b: { rating: number }) => post(`/evos/${id}/rate`, b),
    cancel:   (id: string) => del(`/evos/${id}`),
  },
  sandbox: {
    compile: (b: { language: string; code: string; stdin: string }) =>
      post<import("./types").CompileResult>("/compile", b),
  },
  notifications: {
    list:        () => get<{ notifications: import("./types").Notification[] }>("/notifications"),
    markRead:    (id: string) => patch(`/notifications/${id}/read`),
    markAllRead: () => patch("/notifications/read-all"),
    unreadCount: () => get<{ unread: number }>("/notifications/unread-count"),
  },
};
