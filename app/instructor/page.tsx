"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";
import { api } from "@/lib/api";

interface Overview {
  total_students: number;
  total_courses: number;
  published_courses: number;
  completion_rate: number;
  top_courses: { course_id: string; title: string; total_enrolled: number }[];
}

export default function InstructorDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1"}/instructor/analytics/overview`, {
      headers: { Authorization: `Bearer ${document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? ""}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PanelLayout panel="instructor">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Eğitmen Panosu</h1>

        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Toplam Öğrenci" value={data.total_students} color="indigo" />
              <StatCard label="Toplam Kurs" value={data.total_courses} color="purple" />
              <StatCard label="Yayında" value={data.published_courses} color="green" />
              <StatCard label="Tamamlanma %" value={`${data.completion_rate}%`} color="yellow" />
            </div>

            <div className="bg-[#13131f] rounded-xl border border-gray-800 p-6">
              <h2 className="font-semibold text-white mb-4">En Popüler Kurslar</h2>
              {data.top_courses?.length ? (
                <div className="space-y-3">
                  {data.top_courses.map((c) => (
                    <div key={c.course_id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <span className="text-gray-300 text-sm">{c.title}</span>
                      <span className="text-indigo-400 text-sm font-medium">{c.total_enrolled} öğrenci</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Henüz kurs yok.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-[#13131f] rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">Veriler yüklenemedi.</p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
  };
  return (
    <div className="bg-[#13131f] rounded-xl border border-gray-800 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color] ?? "text-white"}`}>{value}</p>
    </div>
  );
}
