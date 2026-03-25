"use client";

import Link from "next/link";
import { useEffect } from "react";
import { swrSet } from "@/lib/swr-cache";

const links = [
  { href: "/teacher/test/register", label: "TEST 일괄 등록", desc: "반 전체 TEST 행 생성" },
  { href: "/teacher/test/score", label: "점수 일괄 입력", desc: "TEST 점수 입력" },
  { href: "/teacher/test/stats", label: "TEST 통계", desc: "테스트별 점수 통계 및 분포" },
  { href: "/teacher/clinic/register", label: "클리닉 일괄 등록", desc: "반 전체 클리닉 행 생성" },
  { href: "/teacher/clinic/review", label: "클리닉 결과 조회", desc: "클리닉 현황 확인" },
];

const today = new Date().toISOString().split("T")[0];

export default function TeacherHome() {
  useEffect(() => {
    // 홈 진입 즉시 다음 화면에서 쓸 데이터 미리 fetch
    const prefetch = async () => {
      const [programs, tests, scoreRecords] = await Promise.all([
        fetch("/api/programs").then((r) => r.json()),
        fetch("/api/tests").then((r) => r.json()),
        fetch(`/api/test/batch-score?date=${today}`).then((r) => r.json()),
      ]);
      if (Array.isArray(programs)) swrSet("/api/programs", programs);
      if (Array.isArray(tests)) swrSet("/api/tests", tests);
      if (Array.isArray(scoreRecords)) swrSet(`/api/test/batch-score?date=${today}`, scoreRecords);
    };
    prefetch();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">강사 메뉴</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:ring-2 hover:ring-indigo-400 transition"
          >
            <div className="font-semibold text-slate-800">{l.label}</div>
            <div className="text-sm text-slate-500 mt-1">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
