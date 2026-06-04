import React, { useState } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

interface Invoice {
  id: string;
  month: string;
  total: string;
  due: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

const invoices: Invoice[] = [
  { id: 'HD-2605', month: 'Tháng 05/2026', total: '6.120.000đ', due: '05/06/2026', status: 'unpaid' },
  { id: 'HD-2604', month: 'Tháng 04/2026', total: '5.980.000đ', due: '05/05/2026', status: 'paid' },
  { id: 'HD-2603', month: 'Tháng 03/2026', total: '6.050.000đ', due: '05/04/2026', status: 'paid' },
  { id: 'HD-2602', month: 'Tháng 02/2026', total: '5.500.000đ', due: '05/03/2026', status: 'paid' },
];

const statusMeta = {
  unpaid: { label: 'Chưa thanh toán', cls: 'text-amber-600 bg-amber-50' },
  paid: { label: 'Đã thanh toán', cls: 'text-green-600 bg-green-50' },
  overdue: { label: 'Quá hạn', cls: 'text-red-600 bg-red-50' },
};

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unpaid', label: 'Chưa trả' },
  { key: 'paid', label: 'Đã trả' },
];

const TenantMyInvoices: React.FC<Props> = ({ setCurrentPage }) => {
  const [tab, setTab] = useState('all');
  const filtered = invoices.filter((i) => (tab === 'all' ? true : i.status === tab));

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Cần thanh toán</p>
            <p className="text-2xl font-bold text-red-500 mt-1">6.120.000đ</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Đã thanh toán (2026)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">17.530.000đ</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Tổng hóa đơn</p>
            <p className="text-2xl font-bold text-on-surface mt-1">{invoices.length}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t.key ? 'bg-orange-50 text-primary-container' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="divide-y divide-gray-100 mt-2">
            {filtered.map((inv) => {
              const meta = statusMeta[inv.status];
              return (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary-container">receipt</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">{inv.month}</p>
                    <p className="text-[11px] text-gray-500">Mã {inv.id} · Hạn {inv.due}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-on-surface">{inv.total}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage('tenant-invoice-detail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${inv.status === 'paid' ? 'text-primary-container hover:bg-orange-50' : 'text-white bg-primary-container hover:bg-orange-600'}`}
                  >
                    {inv.status === 'paid' ? 'Xem' : 'Thanh toán'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default TenantMyInvoices;
