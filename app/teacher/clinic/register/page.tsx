"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import SearchableSelect from "@/components/SearchableSelect";
import type { Program, Student } from "@/lib/types";

export default function ClinicRegisterPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [programId, setProgramId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [contentDefault, setContentDefault] = useState("");
  const [individualMode, setIndividualMode] = useState(false);
  const [individualContents, setIndividualContents] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then((d) => Array.isArray(d) && setPrograms(d));
  }, []);

  useEffect(() => {
    if (!programId) { setStudents([]); setSelected(new Set()); return; }
    fetch(`/api/programs/${programId}/students`)
      .then((r) => r.json())
      .then((data: Student[]) => {
        if (!Array.isArray(data)) return;
        setStudents(data);
        setSelected(new Set(data.map((s) => s.id)));
        setIndividualContents({});
      });
  }, [programId]);

  const toggleAll = () => {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!programId || !date || selected.size === 0) {
      setToast({ message: "프로그램, 날짜, 학생을 선택하세요", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: students.filter((s) => selected.has(s.id)).map((s) => ({ id: s.id, name: s.name })),
          programId,
          date,
          contentDefault,
          contentsPerStudent: individualMode ? individualContents : undefined,
        }),
      });
      const data = await res.json();
      setToast({
        message: `완료: ${data.succeeded}건 성공${data.failed ? `, ${data.failed}건 실패` : ""}`,
        type: data.failed ? "error" : "success",
      });
    } catch {
      setToast({ message: "오류가 발생했습니다", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 pb-28">
      <h1 className="text-xl font-bold text-slate-800 mb-6">클리닉 일괄 등록</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <label className="block text-sm font-medium text-slate-600 mb-1">날짜</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            클리닉 내용 (공통)
          </label>
          <textarea
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="예: 확통 step2 4~7번 풀기"
            value={contentDefault}
            onChange={(e) => setContentDefault(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setIndividualMode((v) => !v)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition ${
            individualMode
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : "border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          {individualMode ? "개별 내용 모드 켜짐" : "개별 내용 다르게 설정"} ▾
        </button>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === students.length}
                onChange={toggleAll}
                className="rounded"
              />
              전체선택 ({students.length}명)
            </label>
            <span className="text-sm text-slate-400">{selected.size}명 선택됨</span>
          </div>

          {!individualMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {students.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition ${
                    selected.has(s.id)
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleOne(s.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 w-24 shrink-0 cursor-pointer ${selected.has(s.id) ? "text-indigo-700" : "text-slate-400"}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleOne(s.id)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">{s.name}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={contentDefault || "클리닉 내용"}
                    disabled={!selected.has(s.id)}
                    value={individualContents[s.id] ?? ""}
                    onChange={(e) =>
                      setIndividualContents((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 fixed-bottom-safe">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || selected.size === 0}
            className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-semibold text-base disabled:opacity-40 hover:bg-indigo-700 transition"
          >
            {loading ? "등록 중..." : `${selected.size}명 클리닉 등록하기`}
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
