import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Tenant' | 'PropertyOwner' | 'Administrator';
  verified: boolean;
  banned: boolean;
  joined: string;
}

const initial: User[] = [
  { id: 1, name: 'Phan Hoài An', email: 'an.phan@roomhub.vn', role: 'PropertyOwner', verified: true, banned: false, joined: '12/01/2026' },
  { id: 2, name: 'Trần Đình Quý', email: 'quy.tran@gmail.com', role: 'Tenant', verified: true, banned: false, joined: '20/02/2026' },
  { id: 3, name: 'Nguyễn Văn Bình', email: 'binh.nv@gmail.com', role: 'Tenant', verified: false, banned: false, joined: '01/03/2026' },
  { id: 4, name: 'Lê Thị Hoa', email: 'hoa.le@gmail.com', role: 'PropertyOwner', verified: false, banned: true, joined: '15/03/2026' },
  { id: 5, name: 'Admin RoomHub', email: 'admin@roomhub.vn', role: 'Administrator', verified: true, banned: false, joined: '01/01/2026' },
];

const roleMeta = {
  Tenant: { label: 'Khách thuê', cls: 'text-blue-600 bg-blue-50' },
  PropertyOwner: { label: 'Chủ trọ', cls: 'text-primary-container bg-orange-50' },
  Administrator: { label: 'Quản trị', cls: 'text-indigo-600 bg-indigo-50' },
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState(initial);
  const [q, setQ] = useState('');

  const toggleBan = (id: number) => setUsers((u) => u.map((x) => (x.id === id ? { ...x, banned: !x.banned } : x)));
  const filtered = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <Reveal>
      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="relative sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc email..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container" />
          </div>
          <button onClick={() => alert('Xuất Excel (demo)')} className="px-4 py-2 bg-orange-50 text-primary-container rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất danh sách
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-bold">Người dùng</th>
                <th className="px-5 py-3 font-bold">Vai trò</th>
                <th className="px-5 py-3 font-bold">Trạng thái</th>
                <th className="px-5 py-3 font-bold hidden md:table-cell">Tham gia</th>
                <th className="px-5 py-3 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const rm = roleMeta[u.role];
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                          {u.name.split(' ').slice(-2).map((w) => w[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate">{u.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rm.cls}`}>{rm.label}</span></td>
                    <td className="px-5 py-3">
                      {u.banned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-red-600 bg-red-50">Đã khóa</span>
                      ) : u.verified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-green-600 bg-green-50 flex items-center gap-1 w-fit"><span className="material-symbols-outlined text-[13px]">verified</span> Đã xác minh</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber-600 bg-amber-50">Chờ xác minh</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.joined}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleBan(u.id)}
                        disabled={u.role === 'Administrator'}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${u.banned ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        {u.banned ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
};

export default AdminUsers;
