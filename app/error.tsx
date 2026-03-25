"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="text-center space-y-6 max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-8xl">⚠️</div>
        <h1 className="text-4xl font-bold text-red-700">오류 발생</h1>
        <p className="text-lg text-slate-600">예기치 않은 오류가 발생했습니다</p>
        <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg font-mono">
          {error.message || '알 수 없는 오류'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition inline-block"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
