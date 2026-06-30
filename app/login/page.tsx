"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { setToken, setTokens } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.auth.login({ username, password });
      if (res.refresh_token) {
        setTokens(res.access_token, res.refresh_token);
      } else {
        setToken(res.access_token, res.expires_in);
      }
      router.push(params.get("next") ?? "/lessons");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || `Hata ${err.status}`);
      } else if (err instanceof TypeError) {
        setError("Sunucuya ulaşılamıyor.");
      } else {
        setError(String(err));
      }
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 uppercase mb-1">Kullanıcı adı veya E-posta</label>
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          required autoFocus
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 uppercase mb-1">Şifre</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold text-center">Giriş Yap</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-gray-500">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}
