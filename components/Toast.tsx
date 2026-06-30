"use client";

import type { ToastType } from "@/lib/hooks";

const BG: Record<ToastType, string> = {
  success: "bg-green-800 border-green-600",
  error:   "bg-red-800 border-red-600",
  info:    "bg-indigo-800 border-indigo-600",
};

export default function Toast({ msg, type }: { msg: string; type: ToastType }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm text-white shadow-xl ${BG[type]}`}>
      {msg}
    </div>
  );
}
