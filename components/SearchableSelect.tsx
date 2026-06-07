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
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedLabel = options.find((o) => o.id === value)?.name ?? "";

  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  const items: Option[] = emptyLabel ? [{ id: "", name: emptyLabel }, ...filtered] : filtered;

  // 열릴 때 검색 인풋 포커스
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [open]);

  // 검색어가 바뀌거나 열릴 때 키보드 하이라이트를 초기화
  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  // 하이라이트된 항목을 목록 안에서 보이도록 스크롤
  useEffect(() => {
    itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlighted];
      if (item) select(item.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

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
              onKeyDown={handleKeyDown}
              placeholder="검색..."
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              role="combobox"
              aria-expanded={open}
              aria-controls="searchable-select-listbox"
              aria-activedescendant={items[highlighted] ? `searchable-select-option-${items[highlighted].id || "empty"}` : undefined}
            />
          </div>

          {/* 옵션 목록 */}
          <div ref={listRef} id="searchable-select-listbox" role="listbox" className="max-h-52 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-5 text-sm text-slate-400 text-center">검색 결과 없음</div>
            ) : (
              items.map((o, idx) => {
                const isSelected = value === o.id;
                const isHighlighted = idx === highlighted;
                return (
                  <button
                    key={o.id || "__empty__"}
                    id={`searchable-select-option-${o.id || "empty"}`}
                    ref={(el) => { itemRefs.current[idx] = el; }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(o.id)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      isHighlighted ? "bg-indigo-100" : isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                    } ${
                      isSelected ? "text-indigo-700 font-medium" : o.id === "" ? "text-slate-500" : "text-slate-700"
                    }`}
                  >
                    {o.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
