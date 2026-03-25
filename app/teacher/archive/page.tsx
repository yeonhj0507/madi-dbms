"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ArchivePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleArchive = async (dryRun = false) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, dryRun }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ ok: false, error: "아카이빙 실패" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        월별 데이터 아카이빙
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">아카이빙 설정</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              연도
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              월
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleArchive(true)}
            loading={loading}
            variant="secondary"
          >
            미리보기 (Dry Run)
          </Button>
          <Button onClick={() => handleArchive(false)} loading={loading}>
            아카이빙 실행
          </Button>
        </div>
      </div>

      {result && (
        <div
          className={`rounded-xl p-6 ${
            result.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <h3 className="font-semibold mb-3">
            {result.ok ? "✅ 결과" : "❌ 오류"}
          </h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 현재월 이전 데이터만 아카이빙할 수 있습니다</li>
          <li>• Dry Run으로 먼저 확인 후 실행하세요</li>
          <li>• 아카이빙된 데이터는 별도 DB에 저장됩니다</li>
          <li>• 복구가 필요하면 관리자에게 문의하세요</li>
        </ul>
      </div>
    </div>
  );
}
