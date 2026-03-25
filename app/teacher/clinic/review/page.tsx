"use client";

import { useEffect, useState } from "react";
import type { ClinicRecord } from "@/lib/types";

export default function ClinicReviewPage() {
  const [records, setRecords] = useState<ClinicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clinics/today")
      .then((r) => r.json())
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const reviewNeeded = records.filter((r) => r.needsReview);
  const normal = records.filter((r) => !r.needsReview);

  if (loading) {
    return <div className="py-12 text-center text-slate-400">불러오는 중...</div>;
  }

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-2">클리닉 결과 조회</h1>
      <p className="text-sm text-slate-400 mb-6">
        오늘 클리닉 {records.length}건 · 보충 대상 {reviewNeeded.length}명
      </p>

      {reviewNeeded.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-amber-700 mb-3">보충 대상 ({reviewNeeded.length}명)</h2>
          <div className="space-y-3">
            {reviewNeeded.map((r) => (
              <ClinicCard key={r.id} record={r} highlight />
            ))}
          </div>
        </div>
      )}

      {normal.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">일반 ({normal.length}건)</h2>
          <div className="space-y-3">
            {normal.map((r) => (
              <ClinicCard key={r.id} record={r} />
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">오늘 등록된 클리닉이 없습니다</div>
      )}
    </div>
  );
}

function ClinicCard({ record, highlight }: { record: ClinicRecord; highlight?: boolean }) {
  const statusColor =
    record.status === "클리닉 완료" || record.status === "발송 완료"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-500";

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${highlight ? "border-amber-300" : "border-slate-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-800">{record.studentName}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {record.status}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-1">
        <span className="text-slate-400">클리닉: </span>{record.content || "-"}
      </p>
      {record.result && (
        <p className="text-sm text-slate-600">
          <span className="text-slate-400">결과: </span>
          {record.result.replace(/^\[보충\]\s*/, "")}
          {record.needsReview && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">보충 필요</span>
          )}
        </p>
      )}
    </div>
  );
}
