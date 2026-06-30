"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Course, Lesson, Section } from "@/lib/types";
import Spinner from "@/components/Spinner";

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse]   = useState<Course | null>(null);
  const [active, setActive]   = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.courses.get(id)
      .then((c) => {
        setCourse(c);
        const first = c.sections?.[0]?.lessons?.[0];
        if (first) setActive(first);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Kurs yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  function markComplete(lesson: Lesson) {
    api.lessons.progress(lesson.id, { watch_seconds: lesson.duration_sec ?? 0, completed: true }).catch(() => {});
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;
  if (error || !course) return <div className="pt-24 text-center text-red-400">{error || "Kurs bulunamadı."}</div>;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900 p-3">
        <h2 className="mb-3 px-2 text-sm font-semibold text-gray-400 uppercase">{course.title}</h2>
        {course.sections?.map((sec: Section) => (
          <div key={sec.id} className="mb-3">
            <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{sec.title}</p>
            {sec.lessons?.map((l: Lesson) => (
              <button
                key={l.id}
                onClick={() => { setActive(l); markComplete(l); }}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                  active?.id === l.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xs">{l.type === "video" ? "▶" : l.type === "live" ? "🔴" : "📄"}</span>
                <span className="flex-1 truncate">{l.title}</span>
                {l.duration_sec && (
                  <span className="text-xs opacity-60">{Math.floor(l.duration_sec / 60)}d</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-950">
        {active ? (
          <div className="mx-auto max-w-3xl px-6 py-8">
            <h1 className="mb-4 text-xl font-bold">{active.title}</h1>

            {active.youtube_video_id && (
              <div className="mb-6 aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${active.youtube_video_id}`}
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}

            {active.content && (
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                {active.content}
              </div>
            )}

            {!active.youtube_video_id && !active.content && (
              <div className="rounded-xl bg-gray-800 p-10 text-center text-gray-500">
                İçerik henüz eklenmemiş.
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Sol taraftan bir ders seç.
          </div>
        )}
      </div>
    </div>
  );
}
