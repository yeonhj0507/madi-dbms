"use client";

import { useEffect, useState } from "react";

type ArchiveResult = {
  count: number;
  copied: number;
  skipped?: boolean;
  errors?: string[];
};

type Results = {
  students: ArchiveResult;
  programs: ArchiveResult;
  testMgmt: ArchiveResult;
  testRecords: ArchiveResult;
  clinics: ArchiveResult;
};

const ROWS: { key: keyof Results; label: string; desc: string }[] = [
  { key: "students",    label: "학생",       desc: "상태 = 퇴원" },
  { key: "programs",    label: "수업 프로그램", desc: "상태 = 종강" },
  { key: "testMgmt",   label: "TEST 관리",   desc: "완료 + 1달 이상" },
  { key: "testRecords", label: "TEST 기록",   desc: "날짜 1달 이상" },
  { key: "clinics",     label: "클리닉",      desc: "날짜 1달 이상" },
];

export default function ArchivePage() {
  const [preview, setPreview] = useState<{ cutoff: string; preview: Record<keyof Results, number> & { total: number } } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ dryRun: boolean; results: Results; message: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/archive")
      .then(r => r.json())
      .then(d => d.ok && setPreview(d.data))
      .finally(() => setLoadingPreview(false));
  }, []);

  const handleRun = async (dryRun: boolean) => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });
      const d = await res.json();
      if (d.ok) setResult(d.data);
    } finally {
      setRunning(false);
      setConfirmed(false);
    }
  };


  return (
    <div className="py-6 pb-12 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800 mb-2">데이터 아카이브</h1>
      <p className="text-sm text-slate-500 mb-6">기준: 오늘 기준 1개월 이전 데이터 / 퇴원·종강 처리된 데이터</p>

      {/* 대상 현황 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">아카이브 대상</span>
          {preview && (
            <span className="text-xs text-slate-400">기준일: {preview.cutoff}</span>
          )}
        </div>
        {loadingPreview ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">조회 중...</div>
        ) : !preview ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">조회 실패</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left px-5 py-2 font-medium">DB</th>
                  <th className="text-left px-3 py-2 font-medium">기준</th>
                  <th className="text-right px-5 py-2 font-medium">대상</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr key={r.key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-5 py-2.5 font-medium text-slate-800">{r.label}</td>
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{r.desc}</td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`font-semibold ${(preview.preview[r.key] ?? 0) > 0 ? "text-indigo-600" : "text-slate-300"}`}>
                        {(preview.preview[r.key] ?? 0).toLocaleString()}건
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-700">합계</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800">{preview.preview.total.toLocaleString()}건</td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

      {/* 실행 */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-4">
        <p className="text-sm text-slate-600">
          백업 DB에 복사합니다. <span className="font-medium text-slate-800">원본은 삭제되지 않습니다.</span>
        </p>

        {!result && (
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="rounded"
            />
            대상 건수를 확인했으며 아카이브를 실행합니다
          </label>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleRun(true)}
            disabled={running || loadingPreview}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            {running ? "실행 중..." : "미리보기 (Dry Run)"}
          </button>
          <button
            onClick={() => handleRun(false)}
            disabled={running || !confirmed || loadingPreview}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            {running ? "백업 중..." : "아카이브 실행"}
          </button>
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <div className={`rounded-xl shadow-sm overflow-hidden ${result.dryRun ? "border border-amber-200" : "border border-emerald-200"}`}>
          <div className={`px-5 py-3 text-sm font-semibold ${result.dryRun ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
            {result.dryRun ? "미리보기 결과" : "아카이브 완료"}
          </div>
          <table className="w-full text-sm bg-white">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100">
                <th className="text-left px-5 py-2 font-medium">DB</th>
                <th className="text-right px-5 py-2 font-medium">대상</th>
                {!result.dryRun && <th className="text-right px-5 py-2 font-medium">복사됨</th>}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const d = result.results[r.key];
                return (
                  <tr key={r.key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-5 py-2.5 text-slate-800">{r.label}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{d.count.toLocaleString()}건</td>
                    {!result.dryRun && (
                      <td className="px-5 py-2.5 text-right">
                        <span className={d.copied === d.count ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                          {d.copied.toLocaleString()}건
                        </span>
                        {(d.errors?.length ?? 0) > 0 && (
                          <div className="text-xs text-rose-400 mt-0.5">{d.errors![0]}</div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!result.dryRun && (
            <div className="px-5 py-3 bg-slate-50 text-xs text-slate-500">
              원본 데이터는 유지됩니다. 확인 후 Notion에서 직접 삭제하세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
