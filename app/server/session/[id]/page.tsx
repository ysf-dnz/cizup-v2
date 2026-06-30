"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Evo } from "@/lib/types";
import EvoStatusBadge from "@/components/EvoStatusBadge";
import CodeEditor from "@/components/CodeEditor";
import Spinner from "@/components/Spinner";
import { usePolling } from "@/lib/hooks";

type EvoDetail = Evo & { partner?: { username: string; email: string } };

export default function ServerSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [evo, setEvo]         = useState<EvoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvo = useCallback(async () => {
    try {
      const data = await api.evos.detail(id) as EvoDetail;
      setEvo(data);
      if (data.server_comment) setComment(data.server_comment);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Seans yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchEvo(); }, [fetchEvo]);

  // Poll while the client side is acting (server_done → awaiting_rating → completed).
  const polling = evo?.status === "server_done" || evo?.status === "awaiting_rating";
  usePolling(fetchEvo, 15_000, polling);

  // matched → server submits review via check/server → server_done
  async function submitReview() {
    if (!comment.trim()) { setError("Yorum yazmalısın."); return; }
    setSubmitting(true); setError("");
    try {
      await api.evos.review(id, { comment });
      await fetchEvo();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;
  if (error && !evo) return <div className="pt-24 text-center text-red-400">{error}</div>;
  if (!evo) return null;

  const partnerName = evo.partner?.username || evo.partner_username || "—";
  const clientCode = evo.code ?? evo.client_code;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Server Seansı</h1>
          <p className="text-sm text-gray-400 mt-0.5">Client: <span className="text-white">{partnerName}</span></p>
        </div>
        <EvoStatusBadge status={evo.status} />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
          <p className="text-xs text-gray-500 mb-1">Level</p>
          <p className="font-semibold">{evo.level}</p>
        </div>
        <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
          <p className="text-xs text-gray-500 mb-1">Chapter</p>
          <p className="font-semibold">{evo.chapter}</p>
        </div>
        <div className="rounded-lg bg-gray-800 border border-gray-700 p-3">
          <p className="text-xs text-gray-500 mb-1">Tarih</p>
          <p className="font-semibold">{new Date(evo.scheduled_at).toLocaleDateString("tr-TR")}</p>
        </div>
      </div>

      {/* Client code (read-only) */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase">Client Kodu</h2>
        {clientCode ? (
          <div className="rounded-xl overflow-hidden border border-gray-700">
            <CodeEditor value={clientCode} language="python" height="320px" readOnly />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-500 text-sm">
            Client henüz kod göndermedi.
          </div>
        )}
      </div>

      {/* Status: matched → review form */}
      {evo.status === "matched" && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold">Değerlendirme</h2>
          <div>
            <label className="block text-xs text-gray-400 uppercase mb-2">Yorum</label>
            <textarea
              rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Kodu incele ve geri bildirim yaz..."
              className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={submitReview} disabled={submitting || !comment.trim()}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Gönderiliyor..." : "İncelemedim Gönder"}
          </button>
        </div>
      )}

      {/* Server comment (after submitting) */}
      {evo.server_comment && evo.status !== "matched" && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Yorumun</p>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{evo.server_comment}</p>
        </div>
      )}

      {/* Status: server_done → waiting for client comment */}
      {evo.status === "server_done" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
          <Spinner size={8} />
          Client yorumu bekleniyor...
        </div>
      )}

      {/* Status: awaiting_rating → waiting for client rating */}
      {evo.status === "awaiting_rating" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
          <Spinner size={8} />
          Client puan veriyor...
        </div>
      )}

      {/* Status: completed */}
      {evo.status === "completed" && (
        <div className="rounded-xl bg-green-900/20 border border-green-700 p-5 space-y-2">
          <p className="text-green-400 font-semibold">Seans tamamlandı ✓</p>
          {evo.rate != null && <p className="text-sm text-gray-300">Aldığın Puan: <strong>{evo.rate}</strong></p>}
          {evo.client_comment && <p className="text-sm text-gray-400">Client yorumu: {evo.client_comment}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/server")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
        >
          Taleplere Dön
        </button>
        <button
          onClick={() => router.push("/evo/history")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
        >
          Geçmiş
        </button>
      </div>
    </div>
  );
}
