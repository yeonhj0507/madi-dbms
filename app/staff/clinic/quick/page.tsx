"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ClinicQuickInputPage() {
  const [clinicId, setClinicId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/clinic/smart-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, input }),
      });

      const data = await res.json();
      setResult(data);

      if (data.ok) {
        setInput("");
      }
    } catch (err) {
      setResult({ ok: false, error: "입력 실패" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        ⚡ 클리닉 빠른 입력
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="클리닉 ID"
            type="text"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            placeholder="Notion 페이지 ID"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              결과 입력
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='예: "RC 35, LC 40, 듣기 좋음"'
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-lg"
            />
          </div>

          <Button type="submit" loading={loading} fullWidth>
            저장
          </Button>
        </form>

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              result.ok
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">
          💡 입력 형식 예시
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">RC 35</code>
            <span className="ml-2">→ RC만 입력</span>
          </div>
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">LC 40</code>
            <span className="ml-2">→ LC만 입력</span>
          </div>
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">RC 35, LC 40</code>
            <span className="ml-2">→ RC, LC 모두 입력</span>
          </div>
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">
              RC 35, 듣기 좋음
            </code>
            <span className="ml-2">→ RC + 평가 입력</span>
          </div>
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">35 40 좋음</code>
            <span className="ml-2">→ RC, LC, 평가 한번에</span>
          </div>
          <div>
            <code className="bg-blue-100 px-2 py-1 rounded">35 좋음</code>
            <span className="ml-2">→ RC + 평가</span>
          </div>
        </div>
      </div>
    </div>
  );
}
