import NavBar from "@/components/NavBar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">{children}</main>
    </div>
  );
}
