"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1";
function getToken() { return document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? ""; }

interface App {
  id: string;
  user_id: string;
  username: string;
  email: string;
  status: string;
  motivation: string;
  expertise: string[];
  portfolio_url: string;
  created_at: string;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<App | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/admin/instructor-applications?status=pending`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function decide(action: "approve" | "reject") {
    if (!selected) return;
    setBusy(true);
    await fetch(`${BASE}/admin/instructor-applications/${selected.id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setBusy(false);
    setSelected(null);
    setNotes("");
    load();
  }

  return (
    <PanelLayout panel="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Eğitmen Başvuruları</h1>

        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : apps.length === 0 ? (
          <div className="bg-[#13131f] border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            Bekleyen başvuru yok.
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => (
              <div
                key={a.id}
                className="bg-[#13131f] border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => { setSelected(a); setNotes(""); }}
              >
                <div>
                  <p className="font-medium text-white">{a.username} <span className="text-gray-500 font-normal text-sm">({a.email})</span></p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{a.motivation}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {a.expertise?.map((e) => (
                      <span key={e} className="text-xs bg-indigo-900/40 text-indigo-400 px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(a.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-[#13131f] border-l border-gray-800 w-full max-w-lg p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-1">{selected.username}</h2>
            <p className="text-sm text-gray-400 mb-6">{selected.email}</p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Motivasyon</p>
                <p className="text-sm text-gray-300">{selected.motivation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Uzmanlık Alanları</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.expertise?.map((e) => (
                    <span key={e} className="text-xs bg-indigo-900/40 text-indigo-400 px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
              {selected.portfolio_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Portföy</p>
                  <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="text-indigo-400 text-sm hover:underline">
                    {selected.portfolio_url}
                  </a>
                </div>
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Karar notu (opsiyonel)"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-4 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => decide("approve")}
                disabled={busy}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✅ Onayla
              </button>
              <button
                onClick={() => decide("reject")}
                disabled={busy}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ❌ Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
