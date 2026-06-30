import type { EvoStatus } from "@/lib/types";

const MAP: Record<string, { label: string; cls: string }> = {
  pending:         { label: "Bekleniyor",       cls: "bg-yellow-700/40 text-yellow-300 ring-yellow-600" },
  matched:         { label: "Eşleşildi",        cls: "bg-blue-700/40 text-blue-300 ring-blue-600" },
  active:          { label: "Aktif",            cls: "bg-green-700/40 text-green-300 ring-green-600" },
  server_done:     { label: "Server Tamamladı", cls: "bg-indigo-700/40 text-indigo-300 ring-indigo-600" },
  awaiting_rating: { label: "Değerlendirme",    cls: "bg-purple-700/40 text-purple-300 ring-purple-600" },
  completed:       { label: "Tamamlandı",       cls: "bg-emerald-700/40 text-emerald-300 ring-emerald-600" },
  expired:         { label: "Süresi Doldu",     cls: "bg-red-800/40 text-red-300 ring-red-700" },
  cancelled:       { label: "İptal",            cls: "bg-gray-700/40 text-gray-400 ring-gray-600" },
};

export default function EvoStatusBadge({ status }: { status: EvoStatus | string }) {
  const cfg = MAP[status] ?? { label: status, cls: "bg-gray-700/40 text-gray-300 ring-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
