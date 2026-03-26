import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 sm:p-8 bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700">MADI 운영 도구</h1>
        <p className="text-slate-600 text-base sm:text-lg">역할을 선택하세요</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          href="/admin"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md hover:shadow-xl px-8 sm:px-10 py-10 sm:py-12 hover:ring-2 hover:ring-red-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2"
          aria-label="관리자 메뉴로 이동"
          role="menuitem"
        >
          <span className="text-5xl sm:text-6xl">🔧</span>
          <span className="text-lg sm:text-xl font-semibold text-slate-700">관리자</span>
          <span className="text-xs text-slate-500">시스템 관리</span>
        </Link>

        <Link
          href="/teacher"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md hover:shadow-xl px-8 sm:px-10 py-10 sm:py-12 hover:ring-2 hover:ring-indigo-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
          aria-label="강사 메뉴로 이동"
          role="menuitem"
        >
          <span className="text-5xl sm:text-6xl">👩‍🏫</span>
          <span className="text-lg sm:text-xl font-semibold text-slate-700">강사</span>
          <span className="text-xs text-slate-500">TEST 및 클리닉 관리</span>
        </Link>
        
        <Link
          href="/staff"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md hover:shadow-xl px-8 sm:px-10 py-10 sm:py-12 hover:ring-2 hover:ring-emerald-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
          aria-label="알바 메뉴로 이동"
          role="menuitem"
        >
          <span className="text-5xl sm:text-6xl">🧑‍💼</span>
          <span className="text-lg sm:text-xl font-semibold text-slate-700">알바</span>
          <span className="text-xs text-slate-500">클리닉 및 점수 관리</span>
        </Link>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        <p>© 2026 MADI. All rights reserved.</p>
      </footer>
    </main>
  );
}
