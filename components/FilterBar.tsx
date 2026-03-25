"use client";

import { Input } from "./ui/Input";

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  programId?: string;
  onProgramChange?: (value: string) => void;
  date?: string;
  onDateChange?: (value: string) => void;
  programs?: Array<{ id: string; name: string }>;
  showSearch?: boolean;
  showProgram?: boolean;
  showDate?: boolean;
}

export function FilterBar({
  search = "",
  onSearchChange,
  programId = "",
  onProgramChange,
  date = "",
  onDateChange,
  programs = [],
  showSearch = true,
  showProgram = true,
  showDate = true,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showSearch && (
          <Input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            label="검색"
          />
        )}

        {showProgram && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              프로그램
            </label>
            <select
              value={programId}
              onChange={(e) => onProgramChange?.(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">전체</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showDate && (
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange?.(e.target.value)}
            label="날짜"
          />
        )}
      </div>
    </div>
  );
}
