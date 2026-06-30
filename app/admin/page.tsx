"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PanelLayout from "@/components/PanelLayout";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1";
function getToken() {
  return document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? "";
}

interface Overview {
  total_users: number;
  total_instructors: number;
  total_courses: number;
  published_courses: number;
  total_enrollments: number;
  lessons_completed: number;
  evos_completed: number;
  open_reports: number;
  pending_payouts: number;
  gross_revenue: number;
  pending_applications: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE}/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PanelLayout panel="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Paneli</h1>

        {loading && <div className="text-gray-400">Yükleniyor...</div>}
        {error && <div className="text-red-400 text-sm">Hata: {error}</div>}

        {data && (
          <>
            {/* Alert badges */}
            {(data.pending_applications > 0 || data.open_reports > 0) && (
              <div className="flex gap-3 mb-6">
                {data.pending_applications > 0 && (
                  <Link href="/admin/applications"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-400 text-sm hover:bg-yellow-900/50 transition-colors"
                  >
                    📋 {data.pending_applications} bekleyen başvuru
                  </Link>
                )}
                {data.open_reports > 0 && (
                  <Link href="/admin/moderation"
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm hover:bg-red-900/50 transition-colors"
                  >
                    🛡️ {data.open_reports} açık şikayet
                  </Link>
                )}
              </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPI label="Toplam Kullanıcı" value={data.total_users} icon="👤" />
              <KPI label="Eğitmen" value={data.total_instructors} icon="👨‍🏫" />
              <KPI label="Yayında Kurs" value={data.published_courses} icon="📚" />
              <KPI label="Toplam Kayıt" value={data.total_enrollments} icon="✅" />
              <KPI label="Ders Tamamlama" value={data.lessons_completed} icon="🎯" />
              <KPI label="Evo Tamamlama" value={data.evos_completed} icon="🤝" />
              <KPI label="Brüt Gelir" value={`₺${data.gross_revenue.toFixed(0)}`} icon="💰" />
              <KPI label="Bekleyen Ödeme" value={data.pending_payouts} icon="💳" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Başvuruları Onayla", href: "/admin/applications", icon: "📋", color: "indigo" },
                { label: "Kullanıcı Yönetimi", href: "/admin/users", icon: "👥", color: "purple" },
                { label: "Moderasyon", href: "/admin/moderation", icon: "🛡️", color: "red" },
                { label: "XP Ekonomisi", href: "/admin/economy", icon: "⚙️", color: "yellow" },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex flex-col items-center gap-2 p-5 bg-[#13131f] border border-gray-800 rounded-xl hover:border-indigo-700 transition-colors text-center"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-sm text-gray-300">{a.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PanelLayout>
  );
}

function KPI({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-[#13131f] border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
