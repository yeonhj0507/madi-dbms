"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: "teacher" | "staff") => {
    setUsername(role);
    setPassword("madi123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            MADI 로그인
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            운영 도구 접속
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="아이디"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="teacher 또는 staff"
            required
          />
          
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            error={error}
          />

          <Button type="submit" fullWidth loading={loading}>
            로그인
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">
            빠른 로그인 (개발용)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => quickLogin("teacher")}
            >
              👩‍🏫 강사
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => quickLogin("staff")}
            >
              🧑‍💼 알바
            </Button>
          </div>
        </div>

        <p className="mt-6 text-xs text-center text-slate-500 dark:text-slate-400">
          기본 비밀번호: madi123
        </p>
      </div>
    </div>
  );
}
