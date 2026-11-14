"use client";

import React from "react";

interface StructuredChatContentProps {
  content: string;
}

// Inline formatting helper for bold, code, and links
function renderInline(text: string): React.ReactNode {
  // Split on bold markdown **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-extrabold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Also handle *italic*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function StructuredChatContent({ content }: StructuredChatContentProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // 1. Detect Markdown Table
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      // Check if it's a valid table (has header + separator)
      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0]
          .split("|")
          .map((s) => s.trim())
          .filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);

        // Filter out separator line (e.g. |---|---|)
        const dataRows = tableLines.slice(1).filter((row) => !row.replace(/[\s|:-]/g, "").length === false || !row.includes("---"));

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                  {rawHeaders.map((h, hIdx) => (
                    <th key={hIdx} className="p-2.5 font-extrabold text-slate-900 bg-slate-100 border-r border-slate-200 last:border-r-0">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataRows.map((row, rIdx) => {
                  const cells = row
                    .split("|")
                    .map((s) => s.trim())
                    .filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
                  return (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/50 hover:bg-slate-50"}>
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-slate-700 leading-relaxed border-r border-slate-100 last:border-r-0 font-medium">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Section Headers (e.g. ### Header or **Header**)
    if (line.startsWith("### ") || line.startsWith("## ")) {
      const title = line.replace(/^#{2,3}\s+/, "");
      elements.push(
        <h4 key={`h-${i}`} className="text-sm font-extrabold text-slate-900 mt-3 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {renderInline(title)}
        </h4>
      );
      i++;
      continue;
    }

    // 3. Standalone bold title line (e.g. **Why Strategy B rose to top**)
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4 && !line.includes("|")) {
      const title = line.slice(2, -2);
      elements.push(
        <div key={`title-${i}`} className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 font-extrabold text-emerald-900 text-xs my-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
          <span>{title}</span>
        </div>
      );
      i++;
      continue;
    }

    // 4. Bullet Points
    if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      const bulletText = line.replace(/^[•\-*]\s*/, "");
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-1 text-xs text-slate-700 leading-relaxed pl-1">
          <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">•</span>
          <span className="flex-1">{renderInline(bulletText)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 5. Empty Line
    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 6. Normal Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 text-xs text-slate-700 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}
