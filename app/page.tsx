import Link from "next/link";
import { cookies } from "next/headers";
import { getUserByToken, type UserRole } from "@/lib/auth-v2";

const CARDS = [
  {
    role: "admin" as const,
    href: "/admin",
    icon: "🔧",
    label: "관리자",
    desc: "시스템 관리",
    ring: "hover:ring-red-400 focus-visible:outline-red-500",
  },
  {
    role: "teacher" as const,
    href: "/teacher",
    icon: "👩‍🏫",
    label: "강사",
    desc: "TEST 및 클리닉 관리",
    ring: "hover:ring-indigo-400 focus-visible:outline-indigo-500",
  },
  {
    role: "staff" as const,
    href: "/staff",
    icon: "🧑‍💼",
    label: "알바",
    desc: "클리닉 및 점수 관리",
    ring: "hover:ring-emerald-400 focus-visible:outline-emerald-500",
  },
];

// proxy.ts의 역할별 라우트 접근 규칙과 동일하게 유지
const ACCESSIBLE_ROLES: Record<UserRole, UserRole[]> = {
  admin: ["admin", "teacher", "staff"],
  teacher: ["teacher"],
  staff: ["staff"],
};

const GRID_CLASS: Record<number, string> = {
  1: "grid grid-cols-1 gap-6 w-full max-w-sm",
  2: "grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl",
  3: "grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl",
};

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const user = token ? getUserByToken(token) : null;

  const cards = user
    ? CARDS.filter((c) => ACCESSIBLE_ROLES[user.role].includes(c.role))
    : CARDS;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 sm:p-8 bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700">MADI 운영 도구</h1>
        <p className="text-slate-600 text-base sm:text-lg">
          {user ? `${user.name}님, 메뉴를 선택하세요` : "역할을 선택하세요"}
        </p>
      </div>

      <div className={GRID_CLASS[cards.length] ?? GRID_CLASS[3]}>
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md hover:shadow-xl px-8 sm:px-10 py-10 sm:py-12 hover:ring-2 ${c.ring} transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2`}
            aria-label={`${c.label} 메뉴로 이동`}
            role="menuitem"
          >
            <span className="text-5xl sm:text-6xl">{c.icon}</span>
            <span className="text-lg sm:text-xl font-semibold text-slate-700">{c.label}</span>
            <span className="text-xs text-slate-500">{c.desc}</span>
          </Link>
        ))}
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        <p>© 2026 MADI. All rights reserved.</p>
      </footer>
    </main>
  );
}
