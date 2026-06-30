"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUser, clearToken } from "./auth";
import type { JWTPayload } from "./types";

export function useAuth() {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    window.location.href = "/login";
  }, []);

  return { user, ready, isAuth: !!user, role: user?.role, logout };
}

export function usePolling(fn: () => Promise<void>, intervalMs: number, active = true) {
  const saved = useRef(fn);
  useEffect(() => { saved.current = fn; }, [fn]);

  useEffect(() => {
    if (!active) return;
    const tick = () => { if (document.visibilityState === "visible") saved.current(); };
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [intervalMs, active]);
}

export type ToastType = "success" | "error" | "info";

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const show = useCallback((msg: string, type: ToastType = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}
