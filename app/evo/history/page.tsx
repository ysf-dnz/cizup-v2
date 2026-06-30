"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { EvoSummary, StatsResponse } from "@/lib/types";
import EvoStatusBadge from "@/components/EvoStatusBadge";
import Spinner from "@/components/Spinner";

export default function EvoHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<EvoSummary[]>([]);
  const [stats, setStats]     = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    Promise.all([api.evos.history(), api.evos.stats()])
      .then(([h, s]) => {
        setHistory(h.evos ?? []);
        setStats(s);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evo Geçmişi</h1>
        <button onClick={() => router.push("/evo")} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          + Yeni Evo
        </button>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
          {[
            { label: "Tamamlanan", value: stats.completed ?? 0, color: "text-green-400" },
            { label: "Ortalama Puan", value: stats.avg_rate != null ? stats.avg_rate.toFixed(0) : "—", color: "text-indigo-400" },
            { label: "Toplam Evo", value: stats.total ?? 0, color: "text-white" },
            { label: "Chapter", value: stats.chapter ?? 1, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-800 border border-gray-700 p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chapter progress */}
      {stats && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Chapter geçiş ilerlemesi</span>
            <span className="text-gray-300">{stats.completed ?? 0} / 2 evo</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.min(((stats.completed ?? 0) / 2) * 100, 100)}%` }}
            />
          </div>
          {stats.avg_rate != null && (
            <p className="text-xs text-gray-500 mt-1.5">
              Ort. puan {stats.avg_rate.toFixed(0)} {stats.avg_rate >= 70 ? <span className="text-green-400">✓ yeterli</span> : <span className="text-yellow-400">⚠ 70+ gerekli</span>}
            </p>
          )}
        </div>
      )}

      {/* History list */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="rounded-xl border border-gray-700 p-10 text-center text-gray-500">
            Henüz tamamlanan evo yok.
          </div>
        ) : (
          history.map((evo) => (
            <button
              key={evo.id}
              onClick={() => router.push(`/evo/session/${evo.id}`)}
              className="w-full rounded-xl bg-gray-800 border border-gray-700 p-4 hover:border-gray-500 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Lv{evo.level}</span>
                  {evo.partner_username && (
                    <span className="text-xs text-gray-500">vs {evo.partner_username}</span>
                  )}
                </div>
                <EvoStatusBadge status={evo.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(evo.scheduled_at).toLocaleDateString("tr-TR")}</span>
                {evo.rate != null && (
                  <span className={`font-semibold ${evo.rate >= 70 ? "text-green-400" : "text-yellow-400"}`}>
                    Puan: {evo.rate}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
