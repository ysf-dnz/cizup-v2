"use client";

import dynamic from "next/dynamic";
import Spinner from "./Spinner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
  value: string;
  onChange?: (v: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({ value, onChange, language = "python", readOnly = false, height = "400px" }: Props) {
  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      loading={<div className="flex h-full items-center justify-center"><Spinner size={8} /></div>}
      onChange={(v) => onChange?.(v ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        wordWrap: "on",
        folding: true,
        renderLineHighlight: readOnly ? "none" : "line",
        contextmenu: !readOnly,
      }}
    />
  );
}
