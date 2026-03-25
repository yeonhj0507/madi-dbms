"use client";

import Link from "next/link";
import { useEffect } from "react";
import { swrSet } from "@/lib/swr-cache";

const links = [
  { href: "/staff/clinic", label: "클리닉 운영", desc: "출석 확인 + 클리닉 완료 처리" },
  { href: "/staff/test/score", label: "점수 입력", desc: "테스트 점수 입력" },
  { href: "/staff/clinic/quick", label: "⚡ 클리닉 빠른 입력", desc: "스마트 입력 (RC 35, 좋음)" },
];

const today = new Date().toISOString().split("T")[0];

export default function StaffHome() {
  useEffect(() => {
    const prefetch = async () => {
      const [clinics, scoreRecords] = await Promise.all([
        fetch("/api/clinics/today").then((r) => r.json()),
        fetch(`/api/test/batch-score?date=${today}`).then((r) => r.json()),
      ]);
      if (Array.isArray(clinics)) swrSet("/api/clinics/today", clinics);
      if (Array.isArray(scoreRecords)) swrSet(`/api/test/batch-score?date=${today}`, scoreRecords);
    };
    prefetch();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">알바 메뉴</h1>
      <div className="flex flex-col gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:ring-2 hover:ring-emerald-400 transition"
          >
            <div className="font-semibold text-slate-800 text-lg">{l.label}</div>
            <div className="text-sm text-slate-500 mt-1">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
