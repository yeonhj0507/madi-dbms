"use client";

import { useEffect, useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import type { Program, TestItem } from "@/lib/types";

type Record = {
  id: string;
  studentId: string | null;
  studentName: string;
  score: number | null;
  status: string;
  category: string | null;
  date: string | null;
};

const BINS = [
  { label: "90~100", min: 90, max: 100 },
  { label: "80~89", min: 80, max: 89 },
  { label: "70~79", min: 70, max: 79 },
  { label: "60~69", min: 60, max: 69 },
  { label: "50~59", min: 50, max: 59 },
  { label: "~49", min: 0, max: 49 },
];

export default function TestStatsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [programId, setProgramId] = useState("");
  const [testId, setTestId] = useState("");
  const [loadingTests, setLoadingTests] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then((d) => Array.isArray(d) && setPrograms(d));
  }, []);

  useEffect(() => {
    if (!programId) { setTests([]); setTestId(""); return; }
    setTestId("");
    setLoadingTests(true);
    fetch(`/api/programs/${programId}/tests`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTests(d))
      .finally(() => setLoadingTests(false));
  }, [programId]);

  useEffect(() => {
    if (!testId) { setRecords([]); return; }
    setLoadingRecords(true);
    fetch(`/api/tests/${testId}/records`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setRecords(d))
      .finally(() => setLoadingRecords(false));
  }, [testId]);

  const scored = records.filter((r) => r.score !== null);
  const took = records.filter((r) => r.status === "테스트 완료" || r.status === "발송 완료");
  const scores = scored.map((r) => r.score as number);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : null;
  const max = scores.length ? Math.max(...scores) : null;
  const min = scores.length ? Math.min(...scores) : null;
  const attendRate = records.length ? Math.round(took.length / records.length * 100) : null;

  const binCounts = BINS.map((b) => ({
    ...b,
    count: scores.filter((s) => s >= b.min && s <= b.max).length,
  }));
  const maxBinCount = Math.max(...binCounts.map((b) => b.count), 1);

  const sortedRecords = [...records].sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  return (
    <div className="py-6 pb-12">
      <h1 className="text-xl font-bold text-slate-800 mb-6">TEST 대시보드</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">프로그램</label>
          <SearchableSelect
            options={programs}
            value={programId}
            onChange={setProgramId}
            placeholder="프로그램 선택"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            TEST
            {loadingTests && <span className="ml-1 text-xs text-slate-400">로딩 중...</span>}
          </label>
          <SearchableSelect
            options={tests}
            value={testId}
            onChange={setTestId}
            placeholder={!programId ? "프로그램을 먼저 선택하세요" : "TEST 선택"}
            disabled={!programId || loadingTests}
          />
        </div>
      </div>

      {loadingRecords && (
        <div className="text-center py-12 text-slate-400">불러오는 중...</div>
      )}

      {!loadingRecords && testId && records.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">등록된 응시 기록이 없습니다</div>
      )}

      {!loadingRecords && records.length > 0 && (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="응시율" value={attendRate !== null ? `${attendRate}%` : "-"} sub={`${took.length}/${records.length}명`} />
            <StatCard label="평균" value={avg !== null ? `${avg}점` : "-"} />
            <StatCard label="최고" value={max !== null ? `${max}점` : "-"} accent="text-emerald-600" />
            <StatCard label="최저" value={min !== null ? `${min}점` : "-"} accent="text-rose-500" />
          </div>

          {/* 점수 분포 */}
          {scores.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-slate-600 mb-4">점수 분포</h2>
              <div className="space-y-2">
                {binCounts.map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-14 text-right shrink-0">{b.label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(b.count / maxBinCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 shrink-0">
                      {b.count > 0 ? `${b.count}명` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 학생별 점수 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-600">학생별 점수</h2>
              <span className="text-xs text-slate-400">{records.length}명</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left px-5 py-2 font-medium">이름</th>
                  <th className="text-left px-3 py-2 font-medium">응시구분</th>
                  <th className="text-right px-5 py-2 font-medium">점수</th>
                  <th className="text-right px-5 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-5 py-2.5 font-medium text-slate-800">{r.studentName}</td>
                    <td className="px-3 py-2.5 text-slate-500">{r.category ?? "-"}</td>
                    <td className="px-5 py-2.5 text-right">
                      {r.score !== null ? (
                        <span className={`font-semibold ${r.score >= 90 ? "text-emerald-600" : r.score < 60 ? "text-rose-500" : "text-slate-800"}`}>
                          {r.score}점
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === "테스트 완료" || r.status === "발송 완료"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? "text-slate-800"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
