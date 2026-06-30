"use client";

const RATINGS = [0, 20, 40, 60, 80, 100];

const COLOR = (r: number) => {
  if (r >= 80) return "bg-green-600 text-white";
  if (r >= 60) return "bg-emerald-700 text-white";
  if (r >= 40) return "bg-yellow-600 text-white";
  if (r >= 20) return "bg-orange-600 text-white";
  return "bg-red-700 text-white";
};

export default function RatingPicker({ value, onChange }: { value: number | null; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {RATINGS.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`w-14 rounded-lg py-2 text-sm font-bold ring-2 transition-all ${
            value === r
              ? COLOR(r) + " ring-white scale-105"
              : "bg-gray-700 text-gray-300 ring-transparent hover:ring-gray-500"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
