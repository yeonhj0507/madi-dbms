"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();
  const isTeacher = path.startsWith("/teacher");
  const isStaff = path.startsWith("/staff");

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-6">
      <span className="font-bold text-lg text-indigo-700 tracking-tight">MADI</span>
      {isTeacher && (
        <div className="flex gap-4 text-sm">
          <Link
            href="/teacher/test/register"
            className={`hover:text-indigo-600 ${path.includes("test/register") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            TEST 등록
          </Link>
          <Link
            href="/teacher/test/score"
            className={`hover:text-indigo-600 ${path.includes("test/score") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            점수 입력
          </Link>
          <Link
            href="/teacher/clinic/register"
            className={`hover:text-indigo-600 ${path.includes("clinic/register") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            클리닉 등록
          </Link>
          <Link
            href="/teacher/clinic/review"
            className={`hover:text-indigo-600 ${path.includes("clinic/review") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            클리닉 조회
          </Link>
          <Link
            href="/teacher/test/stats"
            className={`hover:text-indigo-600 ${path.includes("test/stats") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            TEST 통계
          </Link>
        </div>
      )}
      {isStaff && (
        <div className="flex gap-4 text-sm">
          <Link
            href="/staff/clinic"
            className={`hover:text-indigo-600 ${path === "/staff/clinic" ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            클리닉 운영
          </Link>
          <Link
            href="/staff/test/score"
            className={`hover:text-indigo-600 ${path.includes("test/score") ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
          >
            점수 입력
          </Link>
        </div>
      )}
      <div className="ml-auto flex gap-2 text-xs text-slate-400">
        {isTeacher ? (
          <Link href="/staff" className="hover:text-slate-600">알바 화면 →</Link>
        ) : isStaff ? (
          <Link href="/teacher" className="hover:text-slate-600">강사 화면 →</Link>
        ) : null}
      </div>
    </nav>
  );
}
