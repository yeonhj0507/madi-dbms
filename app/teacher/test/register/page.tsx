"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import SearchableSelect from "@/components/SearchableSelect";
import type { Program, Student, TestItem } from "@/lib/types";

const EXAM_CATEGORIES = ["정규", "재시", "재시2", "모의고사"].map((c) => ({ id: c, name: c }));

const TEST_TYPES = [
  "월간평가", "주간평가", "단원평가", "백지시험", "복습TEST",
  "입학TEST", "클리닉TEST", "내신대비 단체TEST", "당일TEST", "파이널모의고사",
].map((c) => ({ id: c, name: c }));

const TEST_DIVISIONS = [
  "반별 TEST", "월간 TEST", "입학TEST", "내신 모의고사", "개별 TEST",
].map((c) => ({ id: c, name: c }));

export default function TestRegisterPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [programId, setProgramId] = useState("");
  const [testId, setTestId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("정규");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loadingTests, setLoadingTests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 학생 검색
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);

  // TEST 생성 모달 상태
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [newDate, setNewDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then((d) => Array.isArray(d) && setPrograms(d));
  }, []);

  useEffect(() => {
    if (!programId) {
      setTests([]); setTestId(""); setStudents([]); setSelected(new Set());
      return;
    }
    setTestId("");
    setLoadingTests(true);
    Promise.all([
      fetch(`/api/programs/${programId}/tests`).then((r) => r.json()),
      fetch(`/api/programs/${programId}/students`).then((r) => r.json()),
    ]).then(([testData, studentData]) => {
      if (Array.isArray(testData)) setTests(testData);
      if (Array.isArray(studentData)) {
        setStudents(studentData);
        setSelected(new Set(studentData.map((s: Student) => s.id)));
      }
    }).finally(() => setLoadingTests(false));
  }, [programId]);

  const openCreateModal = () => {
    setNewName("");
    setNewType("");
    setNewDivision("");
    setNewDate(date); // 현재 선택된 날짜를 기본값으로
    setCreateOpen(true);
  };

  const handleCreateTest = async () => {
    if (!newName.trim()) {
      setToast({ message: "시험제목을 입력하세요", type: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType || undefined,
          category: newDivision || undefined,
          date: newDate || undefined,
          programId: programId || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ message: data.error, type: "error" });
        return;
      }
      // 목록에 추가 후 자동 선택
      const newTest: TestItem = { id: data.id, name: data.name };
      setTests((prev) => [newTest, ...prev]);
      setTestId(data.id);
      setCreateOpen(false);
      setToast({ message: `"${data.name}" TEST가 생성됐습니다`, type: "success" });
    } catch {
      setToast({ message: "오류가 발생했습니다", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/students?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          const list = Array.isArray(d) ? d : (d?.data?.students ?? []);
          setSearchResults(list);
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addStudent = (s: Student) => {
    setStudents((prev) => prev.some((x) => x.id === s.id) ? prev : [...prev, s]);
    setSelected((prev) => new Set([...prev, s.id]));
    setSearchQuery("");
    setSearchResults([]);
  };

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
    if (!programId || !testId || !date || !category || selected.size === 0) {
      setToast({ message: "모든 항목을 선택하고 학생을 1명 이상 선택하세요", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/test/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: students.filter((s) => selected.has(s.id)).map((s) => ({ id: s.id, name: s.name })),
          testId,
          date,
          category,
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
      <h1 className="text-xl font-bold text-slate-800 mb-6">TEST 일괄 등록</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">프로그램</label>
          <SearchableSelect
            options={programs}
            value={programId}
            onChange={setProgramId}
            placeholder="프로그램 선택"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-600">
                TEST
                {loadingTests && <span className="ml-1 text-xs text-slate-400">로딩 중...</span>}
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                disabled={!programId}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:text-slate-300 disabled:cursor-not-allowed"
              >
                + 새 TEST 만들기
              </button>
            </div>
            <SearchableSelect
              options={tests}
              value={testId}
              onChange={setTestId}
              placeholder={!programId ? "프로그램을 먼저 선택하세요" : "TEST 선택"}
              disabled={!programId || loadingTests}
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
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">응시구분</label>
            <SearchableSelect
              options={EXAM_CATEGORIES}
              value={category}
              onChange={setCategory}
              placeholder="응시구분 선택"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
            {students.length > 0 && (
              <input
                type="checkbox"
                checked={students.length > 0 && selected.size === students.length}
                onChange={toggleAll}
                className="rounded"
              />
            )}
            학생 {students.length > 0 ? `(${students.length}명)` : ""}
          </label>
          <span className="text-sm text-slate-400">{selected.size}명 선택됨</span>
        </div>

        {/* 학생 검색 */}
        <div className="relative mb-3">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
            placeholder="이름으로 학생 검색 후 추가..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searching && (
            <span className="absolute right-3 top-2 text-xs text-slate-400">검색 중...</span>
          )}
          {searchResults.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => addStudent(s)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    {students.some((x) => x.id === s.id) ? (
                      <span className="text-xs text-slate-400">이미 추가됨</span>
                    ) : (
                      <span className="text-xs text-indigo-500">+ 추가</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {students.length > 0 ? (
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
          <p className="text-sm text-slate-400 text-center py-4">
            {programId ? "프로그램에 연결된 학생이 없습니다. 위에서 검색해 추가하세요." : "프로그램을 먼저 선택하세요."}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || selected.size === 0}
            className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-semibold text-base disabled:opacity-40 hover:bg-indigo-700 transition"
          >
            {loading ? "등록 중..." : `${selected.size}명 등록하기`}
          </button>
        </div>
      </div>

      {/* TEST 생성 모달 */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-base">새 TEST 만들기</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  시험제목 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="예: 고1M 10월 월간평가"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTest()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">시험유형</label>
                  <SearchableSelect
                    options={TEST_TYPES}
                    value={newType}
                    onChange={setNewType}
                    placeholder="선택 (선택사항)"
                    emptyLabel="없음"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">시험구분</label>
                  <SearchableSelect
                    options={TEST_DIVISIONS}
                    value={newDivision}
                    onChange={setNewDivision}
                    placeholder="선택 (선택사항)"
                    emptyLabel="없음"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">정규시험일</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              {programId && (
                <p className="text-xs text-slate-400">
                  생성 후 <span className="font-medium text-slate-600">{programs.find(p => p.id === programId)?.name}</span> 프로그램에 자동 연결됩니다.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCreateOpen(false)}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateTest}
                disabled={creating || !newName.trim()}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition"
              >
                {creating ? "생성 중..." : "TEST 생성"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
