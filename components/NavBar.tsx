"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const TEACHER_LINKS = [
  { href: "/teacher/test/register", label: "TEST 등록" },
  { href: "/teacher/test/score", label: "점수 입력" },
  { href: "/teacher/test/stats", label: "TEST 통계" },
  { href: "/teacher/clinic/register", label: "클리닉 등록" },
  { href: "/teacher/clinic/review", label: "클리닉 조회" },
  { href: "/teacher/clinic/schedule", label: "정기 클리닉" },
  { href: "/teacher/archive", label: "아카이브" },
];

const STAFF_LINKS = [
  { href: "/staff/clinic", label: "클리닉 운영" },
  { href: "/staff/test/score", label: "점수 입력" },
];

export default function NavBar() {
  const path = usePathname();
  const router = useRouter();
  const isTeacher = path.startsWith("/teacher");
  const isStaff = path.startsWith("/staff");
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = isTeacher ? TEACHER_LINKS : isStaff ? STAFF_LINKS : [];
  const roleLabel = isTeacher ? "강사" : isStaff ? "알바" : "";

  const handleLogout = async () => {
    setLoggingOut(true);
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => path.startsWith(href);

  return (
    <>
      <nav className="bg-white border-b border-slate-200 px-4 h-14 flex items-center sticky top-0 z-30">
        {/* 햄버거 버튼 (모바일) */}
        {links.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="md:hidden mr-3 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            aria-label="메뉴 열기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1" />
              <rect y="9" width="20" height="2" rx="1" />
              <rect y="15" width="20" height="2" rx="1" />
            </svg>
          </button>
        )}

        <Link href="/" className="font-bold text-lg text-indigo-700 tracking-tight">
          MADI
        </Link>

        {/* 데스크톱 링크 */}
        {links.length > 0 && (
          <div className="hidden md:flex gap-4 ml-6 text-sm">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-indigo-600 transition ${isActive(href) ? "text-indigo-600 font-semibold" : "text-slate-600"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {roleLabel && (
            <span className="hidden sm:block text-xs text-slate-500 font-medium">{roleLabel}</span>
          )}
          {(isTeacher || isStaff) && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden md:block text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition disabled:opacity-50"
            >
              {loggingOut ? "..." : "로그아웃"}
            </button>
          )}
          {/* 모바일에서 현재 페이지 표시 */}
          <span className="md:hidden text-sm font-medium text-slate-700 truncate max-w-[140px]">
            {links.find((l) => isActive(l.href))?.label ?? ""}
          </span>
        </div>
      </nav>

      {/* 모바일 드로어 */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* 드로어 패널 */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100">
              <span className="font-bold text-indigo-700 text-lg">MADI</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                aria-label="메뉴 닫기"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </button>
            </div>

            {/* 역할 배지 */}
            {roleLabel && (
              <div className="px-5 py-3 border-b border-slate-100">
                <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full">
                  {roleLabel}
                </span>
              </div>
            )}

            {/* 링크 목록 */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive(href)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* 로그아웃 */}
            {(isTeacher || isStaff) && (
              <div className="px-3 py-3 border-t border-slate-100 pb-safe">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                >
                  {loggingOut ? "로그아웃 중..." : "로그아웃"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
