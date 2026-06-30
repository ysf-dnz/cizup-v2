export default function Spinner({ size = 6 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full border-2 border-gray-600 border-t-indigo-400 animate-spin`}
    />
  );
}
