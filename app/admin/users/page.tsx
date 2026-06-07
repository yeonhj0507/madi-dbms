'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth-v2';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Toast from '@/components/Toast';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'teacher' | 'staff',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data.users)) setUsers(data.users);
      else setToast({ message: '사용자 목록을 불러오지 못했습니다', type: 'error' });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setToast({ message: '사용자 목록을 불러오지 못했습니다', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'staff',
        });
        setToast({ message: '사용자가 생성됐습니다', type: 'success' });
        fetchUsers();
      } else {
        const error = await res.json();
        setToast({ message: error.message || '사용자 생성 실패', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setToast({ message: '사용자 생성 중 오류 발생', type: 'error' });
    }
  };

  const handleDelete = async (username: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${username}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setToast({ message: `${username} 사용자를 삭제했습니다`, type: 'success' });
        fetchUsers();
      } else {
        const error = await res.json();
        setToast({ message: error.message || '사용자 삭제 실패', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      setToast({ message: '사용자 삭제 중 오류 발생', type: 'error' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">사용자 관리</h2>
          <p className="text-gray-600 mt-1">
            시스템 사용자를 추가, 수정, 삭제할 수 있습니다
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          ➕ 사용자 추가
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                최근 로그인
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : user.role === 'teacher'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role === 'admin'
                      ? '관리자'
                      : user.role === 'teacher'
                      ? '강사'
                      : '알바'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString('ko-KR')
                    : '없음'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setDeleteTarget(user.username)}
                    className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              사용자 추가
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="아이디"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />

              <Input
                label="비밀번호"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />

              <Input
                label="이름"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <Input
                label="이메일 (선택)"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  역할
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'admin' | 'teacher' | 'staff',
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">알바</option>
                  <option value="teacher">강사</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  생성
                </Button>
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowCreateModal(false)}>
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="사용자 삭제"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              취소
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              삭제
            </Button>
          </>
        }
      >
        <p className="text-slate-600">
          정말 <span className="font-semibold text-slate-900">{deleteTarget}</span> 사용자를 삭제하시겠습니까?
          <br />이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
