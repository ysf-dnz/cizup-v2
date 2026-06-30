"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Course } from "@/lib/types";
import Spinner from "@/components/Spinner";

export default function LessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.courses.list()
      .then((r) => setCourses(r.courses ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Dersler yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;
  if (error)   return <div className="pt-24 text-center text-red-400">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Dersler</h1>

      {courses.length === 0 ? (
        <div className="rounded-xl bg-gray-800 p-12 text-center text-gray-500">
          Henüz ders eklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/lessons/${c.id}`}
              className="group rounded-xl bg-gray-800 border border-gray-700 overflow-hidden hover:border-indigo-600 transition-colors"
            >
              <div className="aspect-video bg-gray-700 overflow-hidden">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">📚</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {c.title}
                </h2>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {c.sections?.length ?? 0} bölüm
                  </span>
                  <span className={`text-xs font-medium ${c.price === 0 ? "text-green-400" : "text-yellow-400"}`}>
                    {c.price === 0 ? "Ücretsiz" : `₺${c.price}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
