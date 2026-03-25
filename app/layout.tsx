import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MADI 운영 도구",
  description: "수다방 MADI 내부 관리 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
