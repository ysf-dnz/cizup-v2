"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PanelLayout from "@/components/PanelLayout";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1";

function getToken() {
  return document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? "";
}

interface CourseStats {
  course_id: string;
  title: string;
  is_published: boolean;
  total_enrolled: number;
  completion_rate: number;
  thumbnail_url: string;
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`${BASE}/instructor/courses`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => { setCourses(d.courses ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PanelLayout panel="instructor">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Kurslarım <span className="text-gray-500 text-lg font-normal">({total})</span></h1>
          <Link
            href="/instructor/courses/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Yeni Kurs
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : courses.length === 0 ? (
          <div className="bg-[#13131f] rounded-xl border border-dashed border-gray-700 p-16 text-center">
            <p className="text-gray-500 mb-4">Henüz kurs oluşturmadın.</p>
            <Link href="/instructor/courses/new" className="text-indigo-400 hover:underline text-sm">
              İlk kursunu oluştur →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((c) => (
              <div key={c.course_id} className="bg-[#13131f] rounded-xl border border-gray-800 overflow-hidden">
                <div className="aspect-video bg-gray-800">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">📚</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-2">{c.title}</h3>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      c.is_published ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-500"
                    }`}>
                      {c.is_published ? "Yayında" : "Taslak"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>👥 {c.total_enrolled} öğrenci</span>
                    <span>✅ %{c.completion_rate} tamamlama</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/instructor/courses/${c.course_id}/curriculum`}
                      className="flex-1 text-center py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg text-xs transition-colors"
                    >
                      Müfredat
                    </Link>
                    <Link
                      href={`/instructor/courses/${c.course_id}/analytics`}
                      className="flex-1 text-center py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-xs transition-colors"
                    >
                      Analitik
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
