"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { CompileResult } from "@/lib/types";
import CodeEditor from "@/components/CodeEditor";

const LANGUAGES = [
  { value: "python3",     label: "Python 3" },
  { value: "javascript",  label: "JavaScript" },
  { value: "go",          label: "Go" },
];

const DEFAULT_CODE: Record<string, string> = {
  python3:    '# Python 3\nprint("Merhaba, Dünya!")\n',
  javascript: '// JavaScript\nconsole.log("Merhaba, Dünya!");\n',
  go:         'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Merhaba, Dünya!")\n}\n',
};

export default function PracticePage() {
  const [lang, setLang]     = useState("python3");
  const [code, setCode]     = useState(DEFAULT_CODE["python3"]);
  const [stdin, setStdin]   = useState("");
  const [result, setResult] = useState<CompileResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError]   = useState("");

  function switchLang(l: string) {
    setLang(l);
    setCode(DEFAULT_CODE[l] ?? "");
    setResult(null);
  }

  async function run() {
    setRunning(true); setError(""); setResult(null);
    try {
      const r = await api.sandbox.compile({ language: lang, code, stdin });
      setResult(r);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Çalıştırılamadı.");
    } finally { setRunning(false); }
  }

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 py-2">
        <select
          value={lang} onChange={(e) => switchLang(e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        <span className="text-xs text-gray-500 ml-2">Sandbox — güvenli izole çalışma ortamı</span>

        <button
          onClick={run} disabled={running}
          className="ml-auto rounded-lg bg-green-700 px-5 py-1.5 text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {running ? <><span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> Çalışıyor...</> : "▶ Çalıştır"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1">
            <CodeEditor value={code} onChange={setCode} language={lang === "python3" ? "python" : lang} height="100%" />
          </div>

          {/* Stdin */}
          <div className="border-t border-gray-800 bg-gray-900 p-3">
            <label className="block text-xs text-gray-500 uppercase mb-1">Stdin (isteğe bağlı)</label>
            <textarea
              rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)}
              placeholder="Program girdisi..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Output panel */}
        <div className="w-96 flex-shrink-0 border-l border-gray-800 flex flex-col bg-gray-950 overflow-y-auto">
          <div className="border-b border-gray-800 px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Çıktı</div>

          {error && <div className="p-4 text-sm text-red-400">{error}</div>}

          {result ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {result.timed_out && <span className="text-red-400 font-semibold">⏱ Zaman aşımı</span>}
                {result.error ? <span className="text-red-400">Hata</span> : <span className="text-green-400">Başarılı</span>}
                <span>{result.time_ms}ms</span>
              </div>

              <pre className={`rounded-lg p-3 text-sm font-mono whitespace-pre-wrap leading-relaxed ${
                result.error ? "bg-red-900/20 text-red-300 border border-red-800" : "bg-gray-800 text-gray-200"
              }`}>
                {result.output || result.error || "(boş)"}
              </pre>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-600 text-sm">
              Çalıştır butonuna bas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
