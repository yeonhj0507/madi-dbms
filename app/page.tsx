import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold text-indigo-700">MADI 운영 도구</h1>
      <p className="text-slate-500 text-sm">역할을 선택하세요</p>
      <div className="flex gap-6">
        <Link
          href="/teacher"
          className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md px-10 py-8 hover:shadow-lg hover:ring-2 hover:ring-indigo-400 transition"
        >
          <span className="text-4xl">👩‍🏫</span>
          <span className="text-lg font-semibold text-slate-700">강사</span>
        </Link>
        <Link
          href="/staff"
          className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md px-10 py-8 hover:shadow-lg hover:ring-2 hover:ring-emerald-400 transition"
        >
          <span className="text-4xl">🧑‍💼</span>
          <span className="text-lg font-semibold text-slate-700">알바</span>
        </Link>
      </div>
    </div>
  );
}
