"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import type { ClinicRecord } from "@/lib/types";

export default function ClinicReviewPage() {
  const [records, setRecords] = useState<ClinicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/clinics/today")
      .then((r) => r.json())
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/clinic/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setToast({ message: "삭제됐습니다", type: "success" });
      } else {
        setToast({ message: "삭제에 실패했습니다", type: "error" });
      }
    } catch {
      setToast({ message: "오류가 발생했습니다", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

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
              <ClinicCard
                key={r.id}
                record={r}
                highlight
                confirmId={confirmId}
                deletingId={deletingId}
                onRequestDelete={setConfirmId}
                onConfirmDelete={handleDelete}
                onCancelDelete={() => setConfirmId(null)}
              />
            ))}
          </div>
        </div>
      )}

      {normal.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">일반 ({normal.length}건)</h2>
          <div className="space-y-3">
            {normal.map((r) => (
              <ClinicCard
                key={r.id}
                record={r}
                confirmId={confirmId}
                deletingId={deletingId}
                onRequestDelete={setConfirmId}
                onConfirmDelete={handleDelete}
                onCancelDelete={() => setConfirmId(null)}
              />
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">오늘 등록된 클리닉이 없습니다</div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ClinicCard({
  record, highlight, confirmId, deletingId, onRequestDelete, onConfirmDelete, onCancelDelete,
}: {
  record: ClinicRecord;
  highlight?: boolean;
  confirmId: string | null;
  deletingId: string | null;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  const statusColor =
    record.status === "클리닉 완료" || record.status === "발송 완료"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-500";

  const isConfirming = confirmId === record.id;
  const isDeleting = deletingId === record.id;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${highlight ? "border-amber-300" : "border-slate-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-800">{record.studentName}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
            {record.status}
          </span>
          {isConfirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onConfirmDelete(record.id)}
                disabled={isDeleting}
                className="text-xs px-2 py-0.5 rounded bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40"
              >
                삭제
              </button>
              <button
                onClick={onCancelDelete}
                className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRequestDelete(record.id)}
              disabled={isDeleting}
              className="text-xs text-slate-300 hover:text-rose-400 transition disabled:opacity-40"
            >
              삭제
            </button>
          )}
        </div>
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
