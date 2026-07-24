import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Reveal } from '../../components/parallax/Parallax';
import { adminUsersApi, type AdminUser, type AdminUserDetail, type AuditLog, type UserStatus } from '../../services/adminUsers';

const roleMeta: Record<string, { label: string; cls: string; icon: string }> = {
  Tenant: { label: 'Khách thuê', cls: 'text-blue-600 bg-blue-50 border-blue-100', icon: 'person' },
  PropertyOwner: { label: 'Chủ trọ', cls: 'text-orange-600 bg-orange-50 border-orange-100', icon: 'real_estate_agent' },
  Administrator: { label: 'Quản trị viên', cls: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: 'admin_panel_settings' },
};

const statusMeta: Record<UserStatus, { label: string; cls: string; icon: string }> = {
  Active: { label: 'Đang hoạt động', cls: 'text-green-700 bg-green-50 border-green-200', icon: 'check_circle' },
  Banned: { label: 'Đã bị khóa', cls: 'text-red-700 bg-red-50 border-red-200', icon: 'block' },
  Deleted: { label: 'Đã xóa', cls: 'text-gray-600 bg-gray-100 border-gray-200', icon: 'delete' },
  EmailUnverified: { label: 'Chưa xác minh email', cls: 'text-amber-700 bg-amber-50 border-amber-200', icon: 'mark_email_unread' },
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [action, setAction] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [saving, setSaving] = useState(false);

  // Overall KPI stats summary
  const [stats, setStats] = useState({
    totalUsers: 0,
    ownersCount: 0,
    tenantsCount: 0,
    bannedCount: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [queryInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sortBy, sortDir] = sort.split('-');
      const data = await adminUsersApi.list({ page, pageSize: 15, query, role, status, sortBy, sortDir });
      setUsers(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || data.items?.length || 0);

      // Compute quick stats from current dataset or response
      const owners = (data.items || []).filter(u => u.role === 'PropertyOwner').length;
      const tenants = (data.items || []).filter(u => u.role === 'Tenant').length;
      const banned = (data.items || []).filter(u => u.isBanned || u.status === 'Banned').length;

      setStats({
        totalUsers: data.totalCount || data.items?.length || 0,
        ownersCount: owners,
        tenantsCount: tenants,
        bannedCount: banned
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, query, role, status, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  const showDetail = async (user: AdminUser) => {
    try {
      const [detail, audit] = await Promise.all([
        adminUsersApi.detail(user.id),
        adminUsersApi.auditLogs(user.id)
      ]);
      setSelected(detail);
      setLogs(audit.items || []);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const submit = async () => {
    if (!action || reason.trim().length < 10) return;
    setSaving(true);
    setError('');
    try {
      if (action.isBanned) {
        await adminUsersApi.unban(action.id, reason.trim());
      } else {
        await adminUsersApi.ban(action.id, reason.trim(), until ? new Date(until).toISOString() : undefined);
      }
      setAction(null);
      setReason('');
      setUntil('');
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Reveal>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-red-500">error</span>
              <span>{error}</span>
            </div>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              onClick={load}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Top KPI Statistics Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tổng số tài khoản</p>
              <h4 className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '...' : totalCount}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">real_estate_agent</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tài khoản Chủ trọ</p>
              <h4 className="text-2xl font-bold text-blue-600 mt-0.5">{loading ? '...' : stats.ownersCount}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Khách tìm thuê</p>
              <h4 className="text-2xl font-bold text-green-600 mt-0.5">{loading ? '...' : stats.tenantsCount}</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">block</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Đang bị khóa</p>
              <h4 className="text-2xl font-bold text-red-600 mt-0.5">{loading ? '...' : stats.bannedCount}</h4>
            </div>
          </div>
        </div>

        {/* Main Users Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
          {/* Search and Filters Bar */}
          <div className="grid gap-3 p-4 border-b border-gray-100 md:grid-cols-4 bg-gray-50/50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container cursor-pointer"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Tenant">Khách thuê</option>
              <option value="PropertyOwner">Chủ trọ</option>
              <option value="Administrator">Quản trị viên</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">🟢 Đang hoạt động</option>
              <option value="Banned">🔴 Đã bị khóa</option>
              <option value="EmailUnverified">✉️ Chưa xác minh email</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container cursor-pointer"
            >
              <option value="createdAt-desc">Mới nhất trước</option>
              <option value="createdAt-asc">Cũ nhất trước</option>
              <option value="name-asc">Tên A – Z</option>
              <option value="name-desc">Tên Z – A</option>
            </select>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 bg-gray-50/30">
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-5 py-3.5">Vai trò</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Ngày tham gia</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      <span className="material-symbols-outlined text-4xl text-gray-300 mb-1">person_search</span>
                      <p className="font-bold text-gray-600">Không tìm thấy người dùng phù hợp</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const rm = roleMeta[u.role] ?? { label: u.role, cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'person' };
                    const sm = statusMeta[u.status] ?? { label: u.status, cls: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'info' };
                    const initials = (u.fullName || 'User').split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'U';

                    return (
                      <tr key={u.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-5 py-3.5 cursor-pointer" onClick={() => showDetail(u)}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#161d2e] to-[#25324d] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface hover:text-primary-container transition-colors truncate">
                                {u.fullName}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${rm.cls}`}>
                            <span className="material-symbols-outlined text-[13px]">{rm.icon}</span>
                            {rm.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${sm.cls}`}>
                            <span className="material-symbols-outlined text-[13px]">{sm.icon}</span>
                            {sm.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-gray-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => showDetail(u)}
                              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Xem chi tiết"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => setAction(u)}
                              disabled={u.status === 'Deleted'}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-30 border ${
                                u.isBanned
                                  ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                                  : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                              }`}
                            >
                              {u.isBanned ? 'Mở khóa' : 'Khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <span>
              Trang <strong>{page}</strong> / <strong>{Math.max(totalPages, 1)}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-bold disabled:opacity-30 cursor-pointer transition-all"
              >
                Trang trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-bold disabled:opacity-30 cursor-pointer transition-all"
              >
                Trang tiếp
              </button>
            </div>
          </div>
        </div>

        {/* Lock / Ban Confirmation Dialog Modal */}
        {action && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.isBanned ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <span className="material-symbols-outlined text-xl">
                    {action.isBanned ? 'lock_open' : 'block'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    {action.isBanned ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{action.fullName} ({action.email})</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lý do thực hiện (tối thiểu 10 ký tự):</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Nhập chi tiết lý do khóa hoặc mở khóa tài khoản..."
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
                  />
                </div>

                {!action.isBanned && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Thời hạn khóa (để trống nếu khóa vĩnh viễn):</label>
                    <input
                      type="datetime-local"
                      value={until}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setUntil(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setAction(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={saving || reason.trim().length < 10}
                  onClick={submit}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md disabled:opacity-40 ${
                    action.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Detail & Audit Logs Side Drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
            <div className="bg-white h-full w-full max-w-xl overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{selected.fullName}</h3>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                <h4 className="font-bold text-primary-container uppercase tracking-wider text-[10px]">Thông tin chi tiết</h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gray-400">Vai trò:</span>
                    <p className="font-bold">{selected.role}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Trạng thái:</span>
                    <p className="font-bold">{statusMeta[selected.status]?.label || selected.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Số điện thoại:</span>
                    <p className="font-bold">{selected.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Địa chỉ:</span>
                    <p className="font-bold">{selected.address || '—'}</p>
                  </div>
                </div>
                {selected.banReason && (
                  <div className="pt-2 border-t border-gray-200/60 text-red-600">
                    <span className="text-gray-400">Lý do khóa:</span>
                    <p className="font-bold italic">{selected.banReason}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary-container">history</span>
                  Lịch sử kiểm toán (Audit Logs)
                </h4>
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center bg-gray-50 rounded-xl">Chưa có nhật ký hoạt động.</p>
                  ) : (
                    logs.map((l) => (
                      <div key={l.id} className="bg-gray-50 rounded-xl p-3 border-l-4 border-primary-container text-xs space-y-1">
                        <p className="font-bold text-gray-800">{l.action}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(l.createdAt).toLocaleString('vi-VN')} · IP: {l.ipAddress || '—'}
                        </p>
                        <p className="text-[11px] text-gray-600 break-words">{l.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
};

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Đã xảy ra lỗi không xác định.';
  const status = error.response?.status;
  const text = error.response?.data?.message;
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.';
  if (status === 403) return 'Bạn không có quyền quản trị người dùng.';
  if (status === 409) return text || 'Thao tác xung đột với trạng thái hiện tại.';
  return text || 'Không thể tải dữ liệu.';
}

export default AdminUsers;
