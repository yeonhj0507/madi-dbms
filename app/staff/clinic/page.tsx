"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import SearchableSelect from "@/components/SearchableSelect";
import type { ClinicRecord, Program, Student } from "@/lib/types";
import { swrGet, swrSet } from "@/lib/swr-cache";

type LocalRecord = ClinicRecord & { attended?: boolean };

const today = new Date().toISOString().split("T")[0];

export default function StaffClinicPage() {
  const [records, setRecords] = useState<LocalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 완료 처리 바텀시트
  const [sheet, setSheet] = useState<LocalRecord | null>(null);
  const [sheetResult, setSheetResult] = useState("");
  const [sheetReview, setSheetReview] = useState(false);
  const [saving, setSaving] = useState(false);

  // 클리닉 생성 바텀시트
  const [createOpen, setCreateOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [createProgramId, setCreateProgramId] = useState("");
  const [createStudentId, setCreateStudentId] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback((background = false) => {
    const url = "/api/clinics/today";
    if (!background) {
      const cached = swrGet<ClinicRecord[]>(url);
      if (cached) {
        setRecords(cached.map((d) => ({ ...d, attended: d.status !== "클리닉 전" })));
        setLoading(false);
      }
    }
    fetch(url)
      .then((r) => r.json())
      .then((data: ClinicRecord[]) => {
        if (!Array.isArray(data)) return;
        swrSet(url, data);
        setRecords(data.map((d) => ({ ...d, attended: d.status !== "클리닉 전" })));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // 생성 시트 열릴 때 프로그램 목록 로드
  const openCreateSheet = () => {
    setCreateProgramId("");
    setCreateStudentId("");
    setCreateContent("");
    setStudents([]);
    setCreateOpen(true);
    const cached = swrGet<Program[]>("/api/programs");
    if (cached) { setPrograms(cached); return; }
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) { setPrograms(d); swrSet("/api/programs", d); } });
  };

  // 프로그램 선택 시 학생 목록 로드
  useEffect(() => {
    if (!createProgramId) { setStudents([]); setCreateStudentId(""); return; }
    setLoadingStudents(true);
    const cacheKey = `/api/programs/${createProgramId}/students`;
    const cached = swrGet<Student[]>(cacheKey);
    if (cached) { setStudents(cached); setLoadingStudents(false); return; }
    fetch(cacheKey)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) { setStudents(d); swrSet(cacheKey, d); } })
      .finally(() => setLoadingStudents(false));
  }, [createProgramId]);

  const handleCreate = async () => {
    if (!createProgramId || !createStudentId) {
      setToast({ message: "프로그램과 학생을 선택하세요", type: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/clinic/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: [{ id: createStudentId, name: students.find((s) => s.id === createStudentId)?.name ?? "" }],
          programId: createProgramId,
          date: today,
          contentDefault: createContent,
        }),
      });
      const data = await res.json();
      if (data.succeeded) {
        const studentName = students.find((s) => s.id === createStudentId)?.name ?? "";
        setToast({ message: `${studentName} 클리닉 추가됨`, type: "success" });
        setCreateOpen(false);
        swrSet("/api/clinics/today", null);
        load(true);
      } else {
        setToast({ message: "등록 실패", type: "error" });
      }
    } catch {
      setToast({ message: "오류가 발생했습니다", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleAttend = async (rec: LocalRecord) => {
    setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, attended: true } : r));
    try {
      await fetch(`/api/clinic/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "클리닉 전" }),
      });
    } catch {
      setRecords((prev) => prev.map((r) => r.id === rec.id ? { ...r, attended: false } : r));
    }
  };

  const openSheet = (rec: LocalRecord) => {
    setSheetResult(rec.result.replace(/^\[보충\]\s*/, ""));
    setSheetReview(rec.needsReview);
    setSheet(rec);
  };

  const handleComplete = async () => {
    if (!sheet) return;
    setSaving(true);
    try {
      await fetch(`/api/clinic/${sheet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "클리닉 완료", result: sheetResult, needsReview: sheetReview }),
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === sheet.id
            ? { ...r, status: "클리닉 완료", result: sheetReview ? `[보충] ${sheetResult}` : sheetResult, needsReview: sheetReview, attended: true }
            : r
        )
      );
      swrSet("/api/clinics/today", null);
      load(true);
      setToast({ message: `${sheet.studentName} 완료 처리됨`, type: "success" });
      setSheet(null);
    } catch {
      setToast({ message: "저장 실패", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const done = records.filter((r) => r.status === "클리닉 완료" || r.status === "발송 완료");
  const pending = records.filter((r) => r.status === "클리닉 전");
  const reviewPending = pending.filter((r) => r.needsReview);
  const normalPending = pending.filter((r) => !r.needsReview);

  if (loading) {
    return <div className="py-12 text-center text-slate-400">불러오는 중...</div>;
  }

  return (
    <div className="py-4 pb-8">
      {/* 현황 배너 */}
      <div className="bg-indigo-600 text-white rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
        <div>
          <div className="font-semibold">오늘 클리닉</div>
          <div className="text-lg font-bold mt-0.5">{records.length}명 중 {done.length}명 완료</div>
        </div>
        <button
          onClick={openCreateSheet}
          className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> 추가
        </button>
      </div>

      {/* 보충 대상 */}
      {reviewPending.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-amber-700 mb-3">보충 대상 ({reviewPending.length}명)</h2>
          <div className="space-y-3">
            {reviewPending.map((r) => (
              <ClinicCard key={r.id} record={r} onAttend={handleAttend} onComplete={openSheet} highlight />
            ))}
          </div>
        </section>
      )}

      {/* 일반 클리닉 */}
      {normalPending.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-slate-500 mb-3">일반 클리닉 ({normalPending.length}명)</h2>
          <div className="space-y-3">
            {normalPending.map((r) => (
              <ClinicCard key={r.id} record={r} onAttend={handleAttend} onComplete={openSheet} />
            ))}
          </div>
        </section>
      )}

      {/* 완료 */}
      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 mb-3">완료 ({done.length}명)</h2>
          <div className="space-y-2">
            {done.map((r) => (
              <div key={r.id} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between opacity-60">
                <span className="text-sm text-slate-500 line-through">{r.studentName}</span>
                <span className="text-xs text-emerald-600 font-medium">{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">오늘 등록된 클리닉이 없습니다</div>
      )}

      {/* 완료 처리 바텀시트 */}
      {sheet && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(null)} />
          <div className="relative bg-white rounded-t-2xl p-5 z-50 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">{sheet.studentName} — 클리닉 완료</h3>
              <button onClick={() => setSheet(null)} className="text-slate-400 text-xl leading-none">✕</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">클리닉 결과</label>
              <textarea
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="결과를 입력하세요"
                value={sheetResult}
                onChange={(e) => setSheetResult(e.target.value)}
                autoFocus
              />
            </div>
            <label className="flex items-center gap-2 mb-5 cursor-pointer">
              <input type="checkbox" checked={sheetReview} onChange={(e) => setSheetReview(e.target.checked)} className="rounded w-4 h-4" />
              <span className="text-sm font-medium text-amber-700">보충 필요</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setSheet(null)} className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600">취소</button>
              <button onClick={handleComplete} disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40">
                {saving ? "저장 중..." : "완료 저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 클리닉 생성 바텀시트 */}
      {createOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-t-2xl p-5 z-50 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-base">클리닉 추가</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 text-xl leading-none">✕</button>
            </div>

            <div className="text-xs text-slate-400 mb-4">날짜: 오늘 ({today})</div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">프로그램</label>
                <SearchableSelect
                  options={programs}
                  value={createProgramId}
                  onChange={(v) => { setCreateProgramId(v); setCreateStudentId(""); }}
                  placeholder="프로그램 선택"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  학생
                  {loadingStudents && <span className="ml-1 text-xs text-slate-400">로딩 중...</span>}
                </label>
                <SearchableSelect
                  options={students}
                  value={createStudentId}
                  onChange={setCreateStudentId}
                  placeholder={!createProgramId ? "프로그램을 먼저 선택하세요" : "학생 선택"}
                  disabled={!createProgramId || loadingStudents}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">클리닉 내용 <span className="text-slate-400 font-normal">(선택)</span></label>
                <textarea
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="예: 오답 풀기"
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCreateOpen(false)} className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600">취소</button>
              <button
                onClick={handleCreate}
                disabled={creating || !createStudentId}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
              >
                {creating ? "추가 중..." : "클리닉 추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ClinicCard({
  record, onAttend, onComplete, highlight,
}: {
  record: LocalRecord;
  onAttend: (r: LocalRecord) => void;
  onComplete: (r: LocalRecord) => void;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${highlight ? "border-amber-300" : "border-slate-100"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-slate-800 text-base">{record.studentName}</span>
        {record.needsReview && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">보충</span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-3">{record.content || "(내용 없음)"}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onAttend(record)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
            record.attended ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {record.attended ? "출석 ✓" : "출석"}
        </button>
        <button
          onClick={() => onComplete(record)}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          완료 처리
        </button>
      </div>
    </div>
  );
}
