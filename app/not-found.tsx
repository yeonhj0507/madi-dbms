import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl">🔍</div>
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="text-xl text-slate-600">페이지를 찾을 수 없습니다</p>
        <p className="text-sm text-slate-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition mt-4"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
