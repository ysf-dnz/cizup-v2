"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks";

export default function LandingPage() {
  const { isAuth, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && isAuth) router.push("/lessons");
  }, [ready, isAuth, router]);

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl font-black tracking-tight text-indigo-400">
        Ciz<span className="text-white">UP</span>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-white">
        Python öğrenmenin en eğlenceli yolu
      </h1>

      <p className="mb-8 max-w-md text-gray-400">
        Görevleri çöz, XP kazan, Evo ile peer review yap ve seviye atla.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Başla — Ücretsiz
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-gray-700 px-6 py-3 font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          Giriş Yap
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-2xl w-full text-left">
        {[
          { icon: "🎯", title: "Görevler", desc: "10 levelden oluşan chapter'lar, artan zorluk, Python pratik" },
          { icon: "🤝", title: "Evo", desc: "Kodunu bir başkasına incelet, peer review ile öğren" },
          { icon: "📚", title: "Dersler", desc: "Video dersler ve YouTube içerikleri ile öğren" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl bg-gray-800 p-5 border border-gray-700">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-semibold text-white mb-1">{f.title}</div>
            <div className="text-sm text-gray-400">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
