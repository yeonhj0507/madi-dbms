"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

const typeStyles = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
  warning: "bg-amber-600 text-white",
};

const typeEmoji = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all flex items-center gap-2 max-w-sm ${
        typeStyles[type]
      }`}
    >
      <span className="text-lg">{typeEmoji[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-lg leading-none hover:opacity-75 transition"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
}
