"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Schedule {
  id: string;
  programId: string;
  programName: string;
  dayOfWeek: number; // 0=일, 1=월, ..., 6=토
  enabled: boolean;
}

export default function ClinicSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrograms();
    loadSchedules();
  }, []);

  const loadPrograms = async () => {
    const res = await fetch("/api/programs");
    const data = await res.json();
    if (data.ok) setPrograms(data.data);
  };

  const loadSchedules = async () => {
    const res = await fetch("/api/clinic/schedule");
    const data = await res.json();
    if (data.ok) setSchedules(data.data || []);
  };

  const saveSchedule = async (schedule: Partial<Schedule>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (data.ok) {
        alert("스케줄 저장 완료!");
        loadSchedules();
      }
    } catch (err) {
      alert("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (id: string, enabled: boolean) => {
    await fetch(`/api/clinic/schedule/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    loadSchedules();
  };

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        📅 정기 클리닉 자동 등록
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">새 스케줄 추가</h2>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            saveSchedule({
              programId: formData.get("programId") as string,
              dayOfWeek: parseInt(formData.get("dayOfWeek") as string),
              enabled: true,
            });
            e.currentTarget.reset();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              프로그램
            </label>
            <select
              name="programId"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">선택하세요</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              요일
            </label>
            <select
              name="dayOfWeek"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}요일
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading}>
            스케줄 추가
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">등록된 스케줄</h2>
        
        {schedules.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            등록된 스케줄이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-slate-800">
                    {schedule.programName}
                  </div>
                  <div className="text-sm text-slate-600">
                    매주 {DAYS[schedule.dayOfWeek]}요일
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) =>
                        toggleSchedule(schedule.id, e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-600">활성화</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ 자동 등록 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 매일 자정에 오늘이 스케줄 요일이면 자동 등록</li>
          <li>• 해당 프로그램의 모든 학생에게 클리닉 행 생성</li>
          <li>• 스케줄은 언제든지 추가/비활성화 가능</li>
        </ul>
      </div>
    </div>
  );
}
