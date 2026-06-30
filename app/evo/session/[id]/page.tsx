"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Evo } from "@/lib/types";
import EvoStatusBadge from "@/components/EvoStatusBadge";
import CodeEditor from "@/components/CodeEditor";
import RatingPicker from "@/components/RatingPicker";
import Spinner from "@/components/Spinner";
import { usePolling } from "@/lib/hooks";

type EvoDetail = Evo & { partner?: { username: string; email: string } };

export default function EvoSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [evo, setEvo]         = useState<EvoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [rating, setRating]   = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvo = useCallback(async () => {
    try {
      const data = await api.evos.detail(id) as EvoDetail;
      setEvo(data);
      if (data.client_comment) setComment(data.client_comment);
      if (["cancelled", "expired"].includes(data.status)) router.push("/evo");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Evo yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchEvo(); }, [fetchEvo]);

  // Poll while waiting for the server to finish their review.
  const polling = evo?.status === "matched";
  usePolling(fetchEvo, 10_000, polling);

  // server_done → submit client comment via check/client → moves to awaiting_rating
  async function submitClientCheck() {
    setSubmitting(true); setError("");
    try {
      await api.evos.clientCheck(id, { comment: comment.trim() });
      await fetchEvo();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  // awaiting_rating → submit rating → completed
  async function submitRating() {
    if (rating == null) return;
    setSubmitting(true); setError("");
    try {
      await api.evos.rate(id, { rating });
      await fetchEvo();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Puan gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;
  if (error && !evo) return <div className="pt-24 text-center text-red-400">{error}</div>;
  if (!evo)    return null;

  const partnerName = evo.partner?.username || evo.partner_username || "—";
  // Client views the server's code (server_code) if provided; otherwise their own code.
  const partnerCode = evo.server_code;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Evo Seansı</h1>
          <p className="text-sm text-gray-400 mt-0.5">Partner: <span className="text-white">{partnerName}</span></p>
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

      {/* Status: matched → waiting for server */}
      {evo.status === "matched" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
          <Spinner size={8} />
          Server kodunu inceliyor, bekleniyor...
        </div>
      )}

      {/* Server comment (visible from server_done onwards) */}
      {evo.server_comment && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Server Yorumu</p>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{evo.server_comment}</p>
        </div>
      )}

      {/* Optional: server code if present */}
      {partnerCode && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase">Server Kodu</h2>
          <div className="rounded-xl overflow-hidden border border-gray-700">
            <CodeEditor value={partnerCode} language="python" height="240px" readOnly />
          </div>
        </div>
      )}

      {/* Status: server_done → client writes comment + sends (check/client) */}
      {evo.status === "server_done" && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold">Yorumunu Yaz</h2>
          <textarea
            rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Server'ın geri bildirimi hakkında yorumun (opsiyonel)..."
            className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={submitClientCheck} disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Gönderiliyor..." : "Gönder ve Puanlamaya Geç"}
          </button>
        </div>
      )}

      {/* Status: awaiting_rating → rating UI */}
      {evo.status === "awaiting_rating" && (
        <div className="rounded-xl bg-gray-800 border border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold">Bu seansı değerlendir</h2>
          <RatingPicker value={rating} onChange={setRating} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={submitRating} disabled={submitting || rating == null}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Gönderiliyor..." : "Puanla"}
          </button>
        </div>
      )}

      {/* Status: completed */}
      {evo.status === "completed" && (
        <div className="rounded-xl bg-green-900/20 border border-green-700 p-4 text-center">
          <p className="text-green-400 font-semibold">Seans tamamlandı ✓</p>
          {evo.rate != null && <p className="text-sm text-gray-400 mt-1">Puan: <strong className="text-white">{evo.rate}</strong></p>}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/evo/history")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
        >
          Geçmişe Git
        </button>
        <button
          onClick={() => router.push("/evo")}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
        >
          Yeni Evo
        </button>
      </div>
    </div>
  );
}
