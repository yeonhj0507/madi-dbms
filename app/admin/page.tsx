import { getAllUsers } from '@/lib/auth-v2';
import { notion } from '@/lib/notion';
import { DB_IDS } from '@/lib/notion-ids';

export default async function AdminDashboard() {
  // Get statistics
  const allUsers = getAllUsers();
  
  // Notion data
  const studentsResponse = await notion.databases.query({
    database_id: DB_IDS.STUDENTS,
  });
  const programsResponse = await notion.databases.query({
    database_id: DB_IDS.PROGRAMS,
  });
  
  const students = studentsResponse.results;
  const programs = programsResponse.results;

  const stats = [
    {
      label: '전체 사용자',
      value: allUsers.length,
      icon: '👥',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: '등록 학생',
      value: students.length,
      icon: '🎓',
      color: 'bg-green-100 text-green-800',
    },
    {
      label: '운영 프로그램',
      value: programs.length,
      icon: '📚',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      label: '관리자',
      value: allUsers.filter((u) => u.role === 'admin').length,
      icon: '🔑',
      color: 'bg-red-100 text-red-800',
    },
  ];

  const recentUsers = allUsers
    .filter((u) => u.lastLogin)
    .sort((a, b) => {
      const dateA = a.lastLogin?.getTime() || 0;
      const dateB = b.lastLogin?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">대시보드</h2>
        <p className="text-gray-600 mt-1">
          시스템 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Logins */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🕐 최근 로그인
          </h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      @{user.username} · {user.role}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('ko-KR')
                      : '없음'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                최근 로그인 기록이 없습니다
              </p>
            )}
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👥 사용자 역할 분포
          </h3>
          <div className="space-y-3">
            {['admin', 'teacher', 'staff'].map((role) => {
              const count = allUsers.filter((u) => u.role === role).length;
              const percentage = (count / allUsers.length) * 100;

              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {role === 'admin'
                        ? '관리자'
                        : role === 'teacher'
                        ? '강사'
                        : '알바'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count}명 ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        role === 'admin'
                          ? 'bg-red-500'
                          : role === 'teacher'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ 빠른 작업
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <a
            href="/admin/users?action=create"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              ➕
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
              사용자 추가
            </span>
          </a>

          <a
            href="/teacher/archive"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              📦
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
              데이터 아카이빙
            </span>
          </a>

          <a
            href="/admin/settings"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              ⚙️
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
              시스템 설정
            </span>
          </a>

          <a
            href="/admin/logs"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              📊
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
              활동 로그
            </span>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ℹ️ 시스템 정보
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">버전</span>
            <span className="font-mono text-gray-900">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">환경</span>
            <span className="font-mono text-gray-900">
              {process.env.NODE_ENV}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next.js</span>
            <span className="font-mono text-gray-900">16.2.1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">배포</span>
            <span className="font-mono text-gray-900">Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
