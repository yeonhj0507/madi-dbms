"use client";

import { useEffect, useState, useRef } from "react";
import Toast from "./Toast";
import SearchableSelect from "./SearchableSelect";
import type { TestRecord } from "@/lib/types";
import { swrGet, swrSet } from "@/lib/swr-cache";

export default function ScoreInputPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [allRecords, setAllRecords] = useState<TestRecord[]>([]);
  const [testFilter, setTestFilter] = useState(""); // "" = 전체

  const [scores, setScores] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // date가 바뀌면 해당 날짜의 모든 TEST 기록을 자동 로드 (SWR: 캐시 즉시 표시 후 백그라운드 갱신)
  const loadRecords = (d: string) => {
    const url = `/api/test/batch-score?date=${d}`;
    setApiError(null);
    setScores({});
    setDirty(false);
    setTestFilter("");

    // 캐시된 데이터가 있으면 즉시 표시 (로딩 없음)
    const cached = swrGet<TestRecord[]>(url);
    if (cached) {
      setAllRecords(cached);
      setFetching(false);
    } else {
      setFetching(true);
    }

    // 항상 백그라운드에서 최신 데이터 가져오기
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllRecords(data);
          swrSet(url, data);
        } else {
          setApiError(data.error ?? "조회 실패");
        }
      })
      .finally(() => setFetching(false));
  };

  useEffect(() => { loadRecords(date); }, [date]);

  // 날짜에 있는 TEST 목록 (드롭다운용)
  const availableTests = Array.from(
    new Map(
      allRecords
        .filter((r) => r.testId)
        .map((r) => [r.testId, r.testName])
    ).entries()
  ).map(([id, name]) => ({ id: id!, name }));

  // 필터 적용된 표시 레코드
  const visibleRecords = testFilter
    ? allRecords.filter((r) => r.testId === testFilter)
    : allRecords;

  const handleScoreChange = (recordId: string, val: string) => {
    setScores((prev) => ({ ...prev, [recordId]: val }));
    setDirty(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleSave = async () => {
    const toUpdate = Object.entries(scores)
      .filter(([, v]) => v !== "" && !isNaN(Number(v)))
      .map(([recordId, v]) => ({ recordId, score: Number(v) }));

    if (toUpdate.length === 0) {
      setToast({ message: "입력된 점수가 없습니다", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/test/batch-score", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: toUpdate }),
      });
      const data = await res.json();
      setToast({
        message: `완료: ${data.succeeded}건 저장${data.failed ? `, ${data.failed}건 실패` : ""}`,
        type: data.failed ? "error" : "success",
      });
      setDirty(false);
      loadRecords(date);
    } catch {
      setToast({ message: "오류가 발생했습니다", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">점수 일괄 입력</h1>
        <button
          onClick={handleSave}
          disabled={!dirty || loading}
          className="bg-indigo-600 text-white rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition flex items-center gap-1"
        >
          {loading ? "저장 중..." : <>저장{dirty && <span className="w-2 h-2 bg-yellow-300 rounded-full ml-1" />}</>}
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">날짜</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              TEST 필터
              {availableTests.length > 0 && (
                <span className="ml-1.5 text-xs text-slate-400">({availableTests.length}개)</span>
              )}
            </label>
            <SearchableSelect
              options={availableTests}
              value={testFilter}
              onChange={setTestFilter}
              placeholder="전체"
              emptyLabel="전체"
              disabled={availableTests.length === 0}
            />
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          오류: {apiError}
        </div>
      )}

      {fetching && (
        <div className="text-center py-12 text-slate-400">불러오는 중...</div>
      )}

      {!fetching && visibleRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">이름</th>
                {!testFilter && (
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">TEST</th>
                )}
                <th className="text-center px-4 py-3 text-slate-600 font-medium">기존 점수</th>
                <th className="text-center px-4 py-3 text-slate-600 font-medium">점수 입력</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((rec, idx) => {
                const hasInput = scores[rec.id] !== undefined && scores[rec.id] !== "";
                return (
                  <tr
                    key={rec.id}
                    className={`border-b border-slate-100 transition ${hasInput ? "bg-indigo-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">{rec.studentName}</td>
                    {!testFilter && (
                      <td className="px-4 py-3 text-slate-500 text-xs">{rec.testName}</td>
                    )}
                    <td className="px-4 py-3 text-center text-slate-400">
                      {rec.score !== null ? rec.score : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="number"
                        min={0}
                        max={100}
                        placeholder="점수"
                        value={scores[rec.id] ?? ""}
                        onChange={(e) => handleScoreChange(rec.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!fetching && allRecords.length === 0 && !apiError && (
        <div className="text-center py-12 text-slate-400 text-sm">
          해당 날짜에 등록된 TEST 기록이 없습니다
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
