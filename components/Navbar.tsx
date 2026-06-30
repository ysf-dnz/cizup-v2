"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks";

const LINKS = [
  { href: "/lessons",  label: "Dersler" },
  { href: "/quests",   label: "Görevler" },
  { href: "/practice", label: "Pratik" },
  { href: "/evo",      label: "Evo" },
  { href: "/server",   label: "Server" },
];

export default function Navbar() {
  const { isAuth, ready, logout } = useAuth();
  const path = usePathname();

  if (!ready) return null;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-400 tracking-tight">
          CizUP
        </Link>

        {isAuth && (
          <div className="flex items-center gap-1 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  path.startsWith(l.href)
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-sm">
          {isAuth ? (
            <>
              <Link href="/profile" className={`rounded-md px-3 py-1.5 transition-colors ${path === "/profile" ? "text-white" : "text-gray-400 hover:text-white"}`}>
                Profil
              </Link>
              <button
                onClick={logout}
                className="rounded-md px-3 py-1.5 text-gray-500 hover:text-red-400 transition-colors"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Giriş</Link>
              <Link href="/register" className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500 transition-colors">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
