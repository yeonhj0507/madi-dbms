"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const path = usePathname();
  const router = useRouter();
  const isTeacher = path.startsWith("/teacher");
  const isStaff = path.startsWith("/staff");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav 
      className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-6" 
      role="navigation" 
      aria-label="메인 네비게이션"
    >
      <Link href="/" className="font-bold text-lg text-indigo-700 tracking-tight hover:text-indigo-800 transition" aria-label="MADI 홈">
        MADI
      </Link>
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
      <div className="ml-auto flex gap-3 items-center text-xs">
        {isTeacher && (
          <span className="text-slate-600 font-medium">👩‍🏫 강사</span>
        )}
        {isStaff && (
          <span className="text-slate-600 font-medium">🧑‍💼 알바</span>
        )}
        
        {(isTeacher || isStaff) && (
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "로그아웃 중..." : "로그아웃"}
          </button>
        )}
      </div>
    </nav>
  );
}
