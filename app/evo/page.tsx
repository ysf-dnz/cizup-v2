"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { MineResponse } from "@/lib/types";
import EvoStatusBadge from "@/components/EvoStatusBadge";
import CodeEditor from "@/components/CodeEditor";
import Spinner from "@/components/Spinner";
import { usePolling } from "@/lib/hooks";

export default function EvoPage() {
  const router = useRouter();
  const [mine, setMine]       = useState<MineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel]     = useState(1);
  const [code, setCode]       = useState("# Göndermek istediğin kodu buraya yaz\n");
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]     = useState("");

  const fetchMine = useCallback(async () => {
    try {
      const data = await api.evos.mine();
      setMine(data);
      if (data.has_evo && data.evo && !["pending", "cancelled", "expired"].includes(data.evo.status)) {
        router.push(`/evo/session/${data.evo.id}`);
      }
    } catch { setMine({ has_evo: false }); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchMine(); }, [fetchMine]);

  usePolling(fetchMine, 10_000, mine?.has_evo === true && mine.evo?.status === "pending");

  async function create() {
    if (!code.trim()) { setError("Kod gerekli."); return; }
    setCreating(true); setError("");
    try {
      await api.evos.create({ level, code });
      await fetchMine();
    } catch (e) { setError(e instanceof ApiError ? e.message : "Hata."); }
    finally { setCreating(false); }
  }

  async function cancel() {
    if (!mine?.evo?.id) return;
    setCancelling(true);
    try {
      await api.evos.cancel(mine.evo.id);
      setMine({ has_evo: false });
    } catch (e) { setError(e instanceof ApiError ? e.message : "İptal edilemedi."); }
    finally { setCancelling(false); }
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evo</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/server" className="text-gray-400 hover:text-white transition-colors">Server Ol</Link>
          <Link href="/evo/history" className="text-gray-400 hover:text-white transition-colors">Geçmiş</Link>
        </div>
      </div>

      {!mine?.has_evo ? (
        <div className="space-y-5">
          <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Quest Level</label>
              <input
                type="number" min={1} value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-32 rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Kodun</label>
              <div className="rounded-lg overflow-hidden border border-gray-700">
                <CodeEditor value={code} onChange={setCode} language="python" height="280px" />
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={create} disabled={creating}
              className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {creating ? "Oluşturuluyor..." : "Evo Talep Et"}
            </button>
          </div>

          <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4 text-sm text-gray-400 space-y-1">
            <p>📋 <strong className="text-white">Chapter geçiş şartı:</strong> min 2 evo tamamla · ort puan ≥70</p>
            <p>⏱ Talep 48 saat içinde eşleşmezse otomatik sona erer</p>
          </div>
        </div>
      ) : mine.evo?.status === "pending" ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Talep Bekliyor</h2>
            <EvoStatusBadge status="pending" />
          </div>

          {/* Waiting animation */}
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60"
                  style={{ animation: `ping 2s cubic-bezier(0,0,0.2,1) ${i * 0.6}s infinite` }}
                />
              ))}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-2xl">🔍</span>
            </div>
            <p className="text-gray-400">Server aranıyor...</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full bg-indigo-400"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">Level</span><span>{mine.evo.level}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Talep tarihi</span><span>{new Date(mine.evo.scheduled_at).toLocaleString("tr-TR")}</span></div>
            {mine.evo.expires_at && (
              <div className="flex justify-between"><span className="text-gray-400">Son geçerlilik</span><span>{new Date(mine.evo.expires_at).toLocaleString("tr-TR")}</span></div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={cancel} disabled={cancelling}
            className="w-full rounded-lg border border-red-700 py-2 text-sm text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            {cancelling ? "İptal ediliyor..." : "Talebi İptal Et"}
          </button>
        </div>
      ) : null}

      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
