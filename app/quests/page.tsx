"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { QuestListItem, Quest, SubmitResult, HintsResponse } from "@/lib/types";
import CodeEditor from "@/components/CodeEditor";
import Spinner from "@/components/Spinner";

export default function QuestsPage() {
  const [quests, setQuests]   = useState<QuestListItem[]>([]);
  const [progress, setProgress] = useState<{ xp: number; level: number; chapter: number } | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [quest, setQuest]     = useState<Quest | null>(null);
  const [hints, setHints]     = useState<HintsResponse | null>(null);
  const [code, setCode]       = useState("# Kodunu buraya yaz\n");
  const [result, setResult]   = useState<SubmitResult | null>(null);
  const [tab, setTab]         = useState<"task" | "output" | "hints">("task");
  const [submitting, setSubmitting] = useState(false);
  const [buying, setBuying]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    Promise.all([
      api.quests.list(),
      api.quests.progress(),
    ])
      .then(([ql, qp]) => {
        setQuests(ql.quests ?? []);
        setProgress(qp);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const selectQuest = useCallback(async (level: number) => {
    setActiveLevel(level);
    setResult(null);
    setTab("task");
    try {
      const [q, h] = await Promise.all([api.quests.get(level), api.quests.hints(level)]);
      setQuest(q);
      setHints(h);
      setCode("# Kodunu buraya yaz\n");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Quest yüklenemedi.");
    }
  }, []);

  async function submit() {
    if (!activeLevel) return;
    setSubmitting(true); setResult(null); setTab("output");
    try {
      const r = await api.quests.submit(activeLevel, code);
      setResult(r);
      if (r.passed) {
        setProgress((p) => p ? { ...p, xp: r.new_xp, level: r.new_level } : p);
        setQuests((qs) => qs.map((q) => q.level === activeLevel ? { ...q, passed: true } : q));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Hata.");
    } finally { setSubmitting(false); }
  }

  async function buyHint() {
    if (!activeLevel) return;
    setBuying(true);
    try {
      await api.quests.buyHint(activeLevel);
      const h = await api.quests.hints(activeLevel);
      setHints(h);
      setTab("hints");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "İpucu alınamadı.");
    } finally { setBuying(false); }
  }

  // Group quests by chapter
  const chapters = quests.reduce<Record<number, QuestListItem[]>>((acc, q) => {
    (acc[q.chapter] ??= []).push(q);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900 p-3">
        {progress && (
          <div className="mb-4 rounded-lg bg-gray-800 p-3 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">XP</span>
              <span className="font-semibold text-indigo-400">{progress.xp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chapter</span>
              <span className="font-semibold">{progress.chapter}</span>
            </div>
          </div>
        )}

        {Object.entries(chapters).map(([chapter, qs]) => (
          <div key={chapter} className="mb-4">
            <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Chapter {chapter}
            </p>
            {qs.map((q) => (
              <button
                key={q.level}
                onClick={() => !q.locked && selectQuest(q.level)}
                disabled={q.locked}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 mb-0.5 ${
                  activeLevel === q.level
                    ? "bg-indigo-600 text-white"
                    : q.locked
                    ? "text-gray-600 cursor-not-allowed"
                    : q.passed
                    ? "text-green-400 hover:bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-xs">{q.locked ? "🔒" : q.passed ? "✓" : "▶"}</span>
                <span className="flex-1 truncate">Lv{q.level} — {q.name}</span>
                <span className="text-xs opacity-60">{q.xp}xp</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Editor area */}
      {quest ? (
        <div className="flex flex-1 overflow-hidden flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-gray-900">
            {(["task", "output", "hints"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t ? "border-b-2 border-indigo-500 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "task" ? "Görev" : t === "output" ? "Çıktı" : `İpuçları (${hints?.hints?.filter(h=>h.unlocked).length ?? 0})`}
              </button>
            ))}
            <div className="ml-auto flex items-center px-3 text-sm text-gray-500">
              Lv{quest.level} · {quest.xp}xp
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left panel */}
            <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-800 p-4 text-sm">
              {tab === "task" && (
                <div className="space-y-3">
                  <h2 className="font-bold text-white">{quest.name}</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{quest.description}</p>
                  {quest.allowed_functions?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">İzin verilen fonksiyonlar</p>
                      <div className="flex flex-wrap gap-1">
                        {quest.allowed_functions.map((f) => (
                          <span key={f} className="rounded bg-gray-700 px-2 py-0.5 text-xs font-mono text-indigo-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "output" && (
                <div className="space-y-3">
                  {result ? (
                    <>
                      <div className={`rounded-lg p-3 text-sm font-semibold ${result.passed ? "bg-green-900/30 text-green-400 border border-green-700" : "bg-red-900/30 text-red-400 border border-red-700"}`}>
                        {result.passed ? `✓ Başarılı! +${result.xp_gained} XP` : "✗ Yanlış çıktı"}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Çıktı</p>
                        <pre className="rounded-lg bg-gray-800 p-3 text-xs text-gray-200 whitespace-pre-wrap font-mono">{result.output || "(boş)"}</pre>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Henüz gönderilmedi.</p>
                  )}
                </div>
              )}

              {tab === "hints" && (
                <div className="space-y-3">
                  {hints?.hints?.filter(h => h.unlocked).map((h) => (
                    <div key={h.id} className="rounded-lg bg-gray-800 p-3">
                      <p className="text-xs text-gray-500 mb-1">İpucu {h.step}</p>
                      <p className="text-gray-200 text-sm">{h.text}</p>
                    </div>
                  ))}
                  {hints?.hints?.some(h => !h.unlocked) && (
                    <button
                      onClick={buyHint} disabled={buying}
                      className="w-full rounded-lg border border-yellow-700 py-2 text-sm text-yellow-400 hover:bg-yellow-900/20 disabled:opacity-50 transition-colors"
                    >
                      {buying ? "..." : `Sonraki İpucu Al (${hints?.hints?.find(h => !h.unlocked)?.xp_cost ?? 0} XP)`}
                    </button>
                  )}
                  {hints?.hints?.every(h => h.unlocked) && <p className="text-gray-500 text-xs">Tüm ipuçları açık.</p>}
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1">
                <CodeEditor value={code} onChange={setCode} language="python" height="100%" />
              </div>
              {error && <div className="px-4 py-2 text-sm text-red-400 bg-red-900/20">{error}</div>}
              <div className="flex items-center gap-3 border-t border-gray-800 bg-gray-900 px-4 py-2">
                <span className="text-xs text-gray-500">Ctrl+Enter ile gönder</span>
                <div className="ml-auto">
                  <button
                    onClick={submit} disabled={submitting}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Çalıştırılıyor..." : "Gönder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-500">
          Sol taraftan bir görev seç.
        </div>
      )}
    </div>
  );
}
