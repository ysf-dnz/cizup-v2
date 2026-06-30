"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { setToken, setTokens } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.auth.register(form);
      const res = await api.auth.login({ username: form.username, password: form.password });
      if (res.refresh_token) {
        setTokens(res.access_token, res.refresh_token);
      } else {
        setToken(res.access_token, res.expires_in);
      }
      router.push("/lessons");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || `Hata kodu: ${err.status}`);
      } else if (err instanceof TypeError) {
        setError("Sunucuya ulaşılamıyor. İnternet bağlantını kontrol et.");
      } else {
        setError(String(err));
      }
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold text-center">Hesap Oluştur</h1>

        <form onSubmit={submit} className="space-y-4">
          {[
            { key: "username", label: "Kullanıcı Adı", type: "text" },
            { key: "email",    label: "E-posta",        type: "email" },
            { key: "password", label: "Şifre (min 8)",  type: "password" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 uppercase mb-1">{label}</label>
              <input
                type={type} value={form[key as keyof typeof form]}
                onChange={set(key)} required minLength={key === "password" ? 8 : 2}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
