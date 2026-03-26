import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUserByToken, isAdmin } from '@/lib/auth-v2';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = getUserByToken(token);

  if (!user || !isAdmin(user)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔧 관리자 페이지
              </h1>
              <p className="text-sm text-gray-600">
                시스템 관리 및 사용자 설정
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👤 {user.name} ({user.role})
              </span>
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← 메인으로
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-3">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <a
                    href="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📊 대시보드
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/users"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    👥 사용자 관리
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ⚙️ 시스템 설정
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/logs"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📝 활동 로그
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
