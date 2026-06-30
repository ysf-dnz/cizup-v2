"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { RequestItem } from "@/lib/types";
import Spinner from "@/components/Spinner";
import { usePolling } from "@/lib/hooks";

export default function ServerPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError]       = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.evos.requests();
      setRequests(data.requests ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  usePolling(fetchRequests, 30_000, true);

  async function accept(evoId: string) {
    setAccepting(evoId); setError("");
    try {
      await api.evos.accept(evoId);
      router.push(`/server/session/${evoId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Kabul edilemedi.");
      setAccepting(null);
    }
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Açık Talepler</h1>
        <div className="text-xs text-gray-500">30s&apos;de bir yenilenir</div>
      </div>

      <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4 text-sm text-gray-400 space-y-1">
        <p>🎯 Bir talebi kabul ederek server rolü üstlen</p>
        <p>📝 Kodu incele, yorum yap ve 0–100 puan ver</p>
        <p>⚡ Server olarak XP ve deneyim kazan</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-700 p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-400">Şu an açık talep yok.</p>
          <p className="text-xs text-gray-600 mt-1">Yeni talepler otomatik görüntülenecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl bg-gray-800 border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold">Level {req.level}</span>
                  <span className="mx-2 text-gray-600">·</span>
                  <span className="text-sm text-gray-400">@{req.client_username}</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(req.scheduled_at).toLocaleString("tr-TR")}</span>
              </div>

              {req.code_preview && (
                <pre className="mb-3 rounded-lg bg-gray-900 border border-gray-700 p-3 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap line-clamp-4">
                  {req.code_preview}
                </pre>
              )}

              <button
                onClick={() => accept(req.id)}
                disabled={accepting === req.id}
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {accepting === req.id ? "Kabul ediliyor..." : "Kabul Et"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
