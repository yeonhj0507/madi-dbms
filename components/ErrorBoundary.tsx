"use client";

import { ReactNode, useState, useEffect } from "react";

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-4xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">오류가 발생했습니다</h2>
          <p className="text-slate-600 mb-4 text-sm">{error?.message || "예기치 않은 오류"}</p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ErrorFallback({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <h3 className="font-semibold text-red-700 mb-2">오류 발생</h3>
      <p className="text-red-600 text-sm mb-3">{error.message}</p>
      <button
        onClick={retry}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
      >
        재시도
      </button>
    </div>
  );
}
