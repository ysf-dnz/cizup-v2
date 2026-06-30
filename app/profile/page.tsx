"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { UserProfile, LeaderboardEntry } from "@/lib/types";
import Spinner from "@/components/Spinner";
import { useAuth } from "@/lib/hooks";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [bio, setBio]         = useState("");
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    Promise.all([api.user.me(), api.user.leaderboard()])
      .then(([me, lb]) => {
        setProfile(me.user);
        setBio(me.user.bio ?? "");
        setLeaderboard(lb.leaderboard ?? []);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Profil yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  async function saveBio() {
    setSaving(true);
    try {
      await api.user.update({ bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Kaydedilemedi.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center pt-24"><Spinner size={10} /></div>;
  if (error)   return <div className="pt-24 text-center text-red-400">{error}</div>;
  if (!profile) return null;

  const xpForNextLevel = profile.level * 100;
  const xpProgress = Math.min((profile.xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Profile card */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-700 text-2xl font-bold uppercase">
            {profile.username[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.username}</h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <span className="text-xs text-indigo-400 capitalize">{profile.role}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Level {profile.level}</span>
            <span className="text-indigo-400 font-semibold">{profile.xp} XP</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Chapter {profile.chapter}</p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase">Hakkında</label>
          <textarea
            rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinden bahset..."
            className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={saveBio} disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {saved ? "✓ Kaydedildi" : saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
        <div className="border-b border-gray-700 px-5 py-3 font-semibold text-sm">Liderlik Tablosu</div>
        <div className="divide-y divide-gray-700/50">
          {leaderboard.slice(0, 10).map((e, i) => (
            <div
              key={e.user_id}
              className={`flex items-center px-5 py-3 text-sm ${e.user_id === authUser?.uid ? "bg-indigo-900/20" : ""}`}
            >
              <span className={`w-7 font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                {i + 1}
              </span>
              <span className="flex-1 font-medium">
                {e.username}
                {e.user_id === authUser?.uid && <span className="ml-2 text-xs text-indigo-400">(sen)</span>}
              </span>
              <span className="text-indigo-400 font-semibold">{e.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
