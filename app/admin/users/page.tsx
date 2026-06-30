"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://cizup-backend-production.up.railway.app/api/v1";
function getToken() { return document.cookie.split("cizup_token=")[1]?.split(";")[0] ?? ""; }

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  instructor_status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ q, role, page: String(page), limit: "50" });
    fetch(`${BASE}/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [q, role, page]);

  async function ban(id: string) {
    if (!confirm("Bu kullanıcıyı banlamak istiyor musun?")) return;
    await fetch(`${BASE}/admin/users/${id}/ban`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    load();
  }

  const ROLE_COLORS: Record<string, string> = {
    student: "text-gray-400",
    instructor: "text-indigo-400",
    admin: "text-yellow-400",
    super_admin: "text-red-400",
  };

  return (
    <PanelLayout panel="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Kullanıcılar <span className="text-gray-500 text-lg font-normal">({total})</span></h1>

        <div className="flex gap-3 mb-5">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Kullanıcı veya e-posta ara..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">Tüm roller</option>
            <option value="student">Öğrenci</option>
            <option value="instructor">Eğitmen</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="bg-[#13131f] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">E-posta</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Kayıt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-900/40">
                    <td className="px-4 py-3 text-white font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={ROLE_COLORS[u.role] ?? "text-gray-400"}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => ban(u.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Ban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 50 && (
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-gray-800 rounded-lg disabled:opacity-40 text-gray-300">←</button>
            <span className="px-3 py-1.5 text-sm text-gray-400">Sayfa {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={users.length < 50}
              className="px-3 py-1.5 text-sm bg-gray-800 rounded-lg disabled:opacity-40 text-gray-300">→</button>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
