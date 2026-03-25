"use client";

import { useMemo, useState } from "react";

interface Column<T> {
  header: string;
  key: keyof T;
  render?: (value: any) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchableColumns?: (keyof T)[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

import { ReactNode } from "react";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchableColumns = [],
  onRowClick,
  emptyMessage = "데이터가 없습니다",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // Filter by search term
    if (searchTerm && searchableColumns.length) {
      result = result.filter((row) =>
        searchableColumns.some((col) =>
          String(row[col]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortAsc ? cmp : -cmp;
      });
    }

    return result;
  }, [data, sortKey, sortAsc, searchTerm, searchableColumns]);

  const toggleSort = (col: keyof T) => {
    if (sortKey === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {searchableColumns.length > 0 && (
        <input
          type="text"
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="테이블 검색"
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{ width: col.width }}
                  role="columnheader"
                  aria-sort={
                    sortKey === col.key ? (sortAsc ? "ascending" : "descending") : "none"
                  }
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span>{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-slate-200 ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                  role="row"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      {col.render ? col.render(row[col.key]) : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 text-right">
        {filteredAndSorted.length}개 항목
      </p>
    </div>
  );
}
