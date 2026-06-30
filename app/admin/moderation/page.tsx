"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1";
function getToken() { return document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? ""; }

interface Report {
  id: string;
  reporter_name: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);
  const [resolution, setResolution] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/admin/moderation/reports?status=open`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function resolve() {
    if (!selected) return;
    await fetch(`${BASE}/admin/moderation/reports/${selected.id}/resolve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    setSelected(null);
    setResolution("");
    load();
  }

  const REASON_LABELS: Record<string, string> = {
    spam: "Spam", abuse: "İstismar", inappropriate: "Uygunsuz",
    copyright: "Telif İhlali", other: "Diğer",
  };

  return (
    <PanelLayout panel="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Moderasyon Kuyruğu</h1>

        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : reports.length === 0 ? (
          <div className="bg-[#13131f] border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            🎉 Açık şikayet yok.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-[#13131f] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-700 transition-colors"
                onClick={() => { setSelected(r); setResolution(""); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">
                      {REASON_LABELS[r.reason] ?? r.reason}
                    </span>
                    <span className="text-xs text-gray-500">{r.target_type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{r.reporter_name} tarafından raporlandı</p>
                {r.details && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.details}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-[#13131f] border-l border-gray-800 w-full max-w-lg p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Şikayet Detayı</h2>
            <div className="space-y-3 mb-6 text-sm">
              <Row label="Şikayetçi" value={selected.reporter_name} />
              <Row label="Hedef Tür" value={selected.target_type} />
              <Row label="Hedef ID" value={selected.target_id} />
              <Row label="Sebep" value={REASON_LABELS[selected.reason] ?? selected.reason} />
              {selected.details && <Row label="Detay" value={selected.details} />}
            </div>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Karar açıklaması..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-4 resize-none"
            />
            <button
              onClick={resolve}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Çözümlendi Olarak İşaretle
            </button>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
