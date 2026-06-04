import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Sub {
  id: number;
  owner: string;
  plan: 'Pro' | 'Business';
  amount: string;
  date: string;
  status: 'pending' | 'active';
}

const initial: Sub[] = [
  { id: 1, owner: 'Phan Hoài An', plan: 'Pro', amount: '199.000đ', date: '02/06/2026', status: 'pending' },
  { id: 2, owner: 'Trần Văn Nam', plan: 'Business', amount: '499.000đ', date: '01/06/2026', status: 'pending' },
  { id: 3, owner: 'Lê Thị Hoa', plan: 'Pro', amount: '199.000đ', date: '28/05/2026', status: 'active' },
];

const plans = [
  { name: 'Free', price: '0đ', perks: ['Đăng 3 tin', 'Quản lý cơ bản'], color: 'border-gray-200', active: 8420 },
  { name: 'Pro', price: '199k/tháng', perks: ['Đăng 30 tin', 'Đẩy tin nổi bật', 'Báo cáo Excel'], color: 'border-primary-container', active: 312 },
  { name: 'Business', price: '499k/tháng', perks: ['Không giới hạn tin', 'Đa tòa nhà', 'Hỗ trợ ưu tiên'], color: 'border-indigo-400', active: 64 },
];

const AdminSubscriptions: React.FC = () => {
  const [subs, setSubs] = useState(initial);
  const approve = (id: number) => setSubs((s) => s.map((x) => (x.id === id ? { ...x, status: 'active' } : x)));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 70}>
            <div className={`bg-white rounded-2xl border-2 ${p.color} soft-shadow p-5 h-full`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-on-surface">{p.name}</h3>
                <span className="text-sm font-bold text-primary-container">{p.price}</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {p.perks.map((perk) => (
                  <li key={perk} className="text-xs text-gray-600 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-green-500">check</span> {perk}</li>
                ))}
              </ul>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-2xl font-bold text-on-surface">{p.active.toLocaleString('vi-VN')}</p>
                <p className="text-[11px] text-gray-500">tài khoản đang dùng</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">pending_actions</span> Thanh toán chờ duyệt
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {s.owner.split(' ').slice(-2).map((w) => w[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{s.owner}</p>
                  <p className="text-[11px] text-gray-500">Gói {s.plan} · {s.amount} · {s.date}</p>
                </div>
                {s.status === 'pending' ? (
                  <button onClick={() => approve(s.id)} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[16px]">check</span> Duyệt
                  </button>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-green-600 bg-green-50 shrink-0">Đang hoạt động</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default AdminSubscriptions;
