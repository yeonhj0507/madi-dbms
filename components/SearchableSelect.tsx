"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  id: string;
  name: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 빈 값 선택지 텍스트. 지정하면 목록 상단에 표시 */
  emptyLabel?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  disabled,
  emptyLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.id === value)?.name ?? "";

  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  // 열릴 때 검색 인풋 포커스
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [open]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-400 bg-white"
      >
        <span className={value ? "text-slate-800 truncate" : "text-slate-400"}>
          {value ? selectedLabel : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* 검색 입력 */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색..."
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* 옵션 목록 */}
          <div ref={listRef} className="max-h-52 overflow-y-auto">
            {emptyLabel && (
              <button
                type="button"
                onClick={() => select("")}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition ${
                  !value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-500"
                }`}
              >
                {emptyLabel}
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-4 py-5 text-sm text-slate-400 text-center">검색 결과 없음</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => select(o.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition ${
                    value === o.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
                  }`}
                >
                  {o.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
