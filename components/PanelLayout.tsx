"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";

type NavItem = { label: string; href: string; icon: string };

const INSTRUCTOR_NAV: NavItem[] = [
  { label: "Pano", href: "/instructor", icon: "🏠" },
  { label: "Kurslarım", href: "/instructor/courses", icon: "📚" },
  { label: "Analitik", href: "/instructor/analytics", icon: "📊" },
  { label: "Öğrenciler", href: "/instructor/students", icon: "👥" },
  { label: "Pratik Stüdyo", href: "/instructor/practice", icon: "⚡" },
  { label: "Evo Oturumları", href: "/instructor/evo", icon: "🤝" },
  { label: "Kazançlar", href: "/instructor/earnings", icon: "💰" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Genel Bakış", href: "/admin", icon: "🏠" },
  { label: "Başvurular", href: "/admin/applications", icon: "📋" },
  { label: "Kullanıcılar", href: "/admin/users", icon: "👥" },
  { label: "Moderasyon", href: "/admin/moderation", icon: "🛡️" },
  { label: "Analitik", href: "/admin/analytics", icon: "📊" },
  { label: "Finans", href: "/admin/finance", icon: "💳" },
  { label: "Pazarlama", href: "/admin/marketing", icon: "🎯" },
  { label: "XP Ekonomisi", href: "/admin/economy", icon: "⚙️" },
];

interface Props {
  panel: "instructor" | "admin";
  children: React.ReactNode;
}

export default function PanelLayout({ panel, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = panel === "instructor" ? INSTRUCTOR_NAV : ADMIN_NAV;
  const title = panel === "instructor" ? "Eğitmen Paneli" : "Admin Paneli";

  function logout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d14]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#13131f] border-r border-gray-800 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-800">
          <Link href="/" className="text-lg font-bold text-indigo-400">CizUP</Link>
          <p className="text-xs text-gray-500 mt-0.5">{title}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href ||
              (item.href !== `/${panel}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="block text-xs text-gray-500 hover:text-gray-300 mb-2">
            ← Ana Siteye Dön
          </Link>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-red-400 hover:text-red-300"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
