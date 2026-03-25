import NavBar from "@/components/NavBar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
