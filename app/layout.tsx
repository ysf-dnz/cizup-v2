import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CizUP — Python Öğrenme Platformu",
  description: "Görevler, Evo peer review ve derslerle Python öğren.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-900 text-gray-100 antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
