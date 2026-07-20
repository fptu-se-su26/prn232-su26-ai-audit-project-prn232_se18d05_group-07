import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Reveal } from '../../components/parallax/Parallax';
import { adminUsersApi, type AdminUser, type AdminUserDetail, type AuditLog, type UserStatus } from '../../services/adminUsers';

const roleMeta: Record<string, { label: string; cls: string }> = {
  Tenant: { label: 'Khách thuê', cls: 'text-blue-600 bg-blue-50' },
  PropertyOwner: { label: 'Chủ trọ', cls: 'text-orange-600 bg-orange-50' },
  Administrator: { label: 'Quản trị', cls: 'text-indigo-600 bg-indigo-50' },
};
const statusMeta: Record<UserStatus, { label: string; cls: string }> = {
  Active: { label: 'Hoạt động', cls: 'text-green-600 bg-green-50' },
  Banned: { label: 'Đã khóa', cls: 'text-red-600 bg-red-50' },
  Deleted: { label: 'Đã xóa', cls: 'text-gray-600 bg-gray-100' },
  EmailUnverified: { label: 'Chưa xác minh email', cls: 'text-amber-600 bg-amber-50' },
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [queryInput, setQueryInput] = useState(''); const [query, setQuery] = useState('');
  const [role, setRole] = useState(''); const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt-desc'); const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]); const [action, setAction] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState(''); const [until, setUntil] = useState(''); const [saving, setSaving] = useState(false);

  useEffect(() => { const timer = setTimeout(() => { setQuery(queryInput.trim()); setPage(1); }, 350); return () => clearTimeout(timer); }, [queryInput]);
  const load = async () => {
    setLoading(true); setError('');
    try { const [sortBy, sortDir] = sort.split('-'); const data = await adminUsersApi.list({ page, pageSize: 20, query, role, status, sortBy, sortDir }); setUsers(data.items); setTotalPages(data.totalPages); }
    catch (e) { setError(message(e)); } finally { setLoading(false); }
  };
  // The effect synchronizes the table with server-side query state.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [page, query, role, status, sort]);
  const showDetail = async (user: AdminUser) => { try { const [detail, audit] = await Promise.all([adminUsersApi.detail(user.id), adminUsersApi.auditLogs(user.id)]); setSelected(detail); setLogs(audit.items); } catch (e) { setError(message(e)); } };
  const submit = async () => {
    if (!action || reason.trim().length < 10) return; setSaving(true); setError('');
    try { if (action.isBanned) await adminUsersApi.unban(action.id, reason.trim()); else await adminUsersApi.ban(action.id, reason.trim(), until ? new Date(until).toISOString() : undefined); setAction(null); setReason(''); setUntil(''); await load(); }
    catch (e) { setError(message(e)); } finally { setSaving(false); }
  };

  return <Reveal><div className="space-y-4">
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}<button className="ml-3 font-bold" onClick={load}>Thử lại</button></div>}
    <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
      <div className="grid gap-3 p-5 border-b border-gray-100 md:grid-cols-4">
        <input value={queryInput} onChange={e => setQueryInput(e.target.value)} placeholder="Tìm theo tên hoặc email..." className="px-3 py-2 bg-gray-50 border rounded-xl text-sm" />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-50 border rounded-xl text-sm"><option value="">Mọi vai trò</option><option>Tenant</option><option>PropertyOwner</option><option>Administrator</option></select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-50 border rounded-xl text-sm"><option value="">Mọi trạng thái</option><option value="Active">Hoạt động</option><option value="Banned">Đã khóa</option><option value="Deleted">Đã xóa</option><option value="EmailUnverified">Chưa xác minh email</option></select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 bg-gray-50 border rounded-xl text-sm"><option value="createdAt-desc">Mới nhất</option><option value="createdAt-asc">Cũ nhất</option><option value="name-asc">Tên A–Z</option><option value="name-desc">Tên Z–A</option></select>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-gray-400 border-b"><th className="px-5 py-3">Người dùng</th><th className="px-5 py-3">Vai trò</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Tham gia</th><th className="px-5 py-3 text-right">Hành động</th></tr></thead>
        <tbody className="divide-y">{loading ? <tr><td colSpan={5} className="p-10 text-center text-gray-500">Đang tải...</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-gray-500">Không tìm thấy người dùng.</td></tr> : users.map(u => { const rm = roleMeta[u.role] ?? { label: u.role, cls: 'bg-gray-100' }; const sm = statusMeta[u.status]; return <tr key={u.id} className="hover:bg-gray-50"><td className="px-5 py-3 cursor-pointer" onClick={() => showDetail(u)}><p className="font-bold">{u.fullName}</p><p className="text-xs text-gray-500">{u.email}</p></td><td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${rm.cls}`}>{rm.label}</span></td><td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${sm.cls}`}>{sm.label}</span></td><td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td><td className="px-5 py-3 text-right"><button onClick={() => setAction(u)} disabled={u.status === 'Deleted'} className={`font-bold px-3 py-1.5 rounded-lg disabled:opacity-30 ${u.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>{u.isBanned ? 'Mở khóa' : 'Khóa'}</button></td></tr>; })}</tbody></table></div>
      <div className="flex items-center justify-between p-4 border-t text-sm"><span>Trang {page}/{Math.max(totalPages, 1)}</span><div className="space-x-2"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-30">Trước</button><button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-30">Sau</button></div></div>
    </div>
    {action && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-lg"><h2 className="text-xl font-bold">{action.isBanned ? 'Mở khóa' : 'Khóa'} {action.fullName}</h2><textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500} placeholder="Lý do (10–500 ký tự)" className="mt-4 w-full border rounded-xl p-3 min-h-28" />{!action.isBanned && <input type="datetime-local" value={until} min={new Date().toISOString().slice(0,16)} onChange={e => setUntil(e.target.value)} className="w-full border rounded-xl p-3 mt-3" />}<div className="mt-4 flex justify-end gap-2"><button onClick={() => setAction(null)} className="px-4 py-2">Hủy</button><button disabled={saving || reason.trim().length < 10} onClick={submit} className="px-4 py-2 rounded-xl bg-primary-container text-white disabled:opacity-40">Xác nhận</button></div></div></div>}
    {selected && <div className="fixed inset-0 z-40 bg-black/40 flex justify-end"><div className="bg-white h-full w-full max-w-xl overflow-y-auto p-6"><button onClick={() => setSelected(null)} className="float-right text-2xl">×</button><h2 className="text-2xl font-bold">{selected.fullName}</h2><p className="text-gray-500">{selected.email}</p><dl className="grid grid-cols-2 gap-3 mt-6 text-sm"><dt>Vai trò</dt><dd>{selected.role}</dd><dt>Trạng thái</dt><dd>{statusMeta[selected.status].label}</dd><dt>Điện thoại</dt><dd>{selected.phoneNumber || '—'}</dd><dt>Địa chỉ</dt><dd>{selected.address || '—'}</dd><dt>Lý do khóa</dt><dd>{selected.banReason || '—'}</dd></dl><h3 className="font-bold mt-8 mb-3">Lịch sử kiểm toán</h3><div className="space-y-3">{logs.length === 0 ? <p className="text-gray-500">Chưa có hoạt động.</p> : logs.map(l => <div key={l.id} className="border-l-2 border-orange-300 pl-3"><p className="font-bold">{l.action}</p><p className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString('vi-VN')} · IP {l.ipAddress || '—'}</p><p className="text-xs mt-1 break-words">{l.details}</p></div>)}</div></div></div>}
  </div></Reveal>;
};

function message(error: unknown) { if (!axios.isAxiosError(error)) return 'Đã xảy ra lỗi không xác định.'; const status = error.response?.status; const text = error.response?.data?.message; if (status === 401) return 'Phiên đăng nhập đã hết hạn.'; if (status === 403) return 'Bạn không có quyền quản trị người dùng.'; if (status === 409) return text || 'Thao tác xung đột với trạng thái hiện tại.'; return text || 'Không thể tải dữ liệu.'; }
export default AdminUsers;
