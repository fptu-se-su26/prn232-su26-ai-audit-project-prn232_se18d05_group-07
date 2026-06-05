import React, { useState } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

const items = [
  { label: 'Tiền thuê phòng', detail: 'Tháng 05/2026', amount: 5500000 },
  { label: 'Tiền điện', detail: '120 kWh × 3.500đ', amount: 420000 },
  { label: 'Tiền nước', detail: '8 m³ × 15.000đ', amount: 120000 },
  { label: 'Internet', detail: 'Gói tháng', amount: 100000 },
  { label: 'Phí rác', detail: 'Tháng 05/2026', amount: 20000 },
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const TenantInvoiceDetail: React.FC<Props> = ({ setCurrentPage }) => {
  const [method, setMethod] = useState('vnpay');
  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <button onClick={() => setCurrentPage('tenant-invoices')} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary-container transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Quay lại danh sách
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface">Hóa đơn HD-2605</h3>
                <p className="text-xs text-gray-500">Phòng 201 · Tháng 05/2026 · Hạn 05/06/2026</p>
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Chưa thanh toán</span>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((it) => (
                <div key={it.label} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{it.label}</p>
                    <p className="text-[11px] text-gray-500">{it.detail}</p>
                  </div>
                  <p className="text-sm font-bold text-on-surface">{fmt(it.amount)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-orange-50/50">
              <span className="font-bold text-on-surface">Tổng cộng</span>
              <span className="text-xl font-bold text-primary-container">{fmt(total)}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
            <h3 className="font-bold text-on-surface mb-4">Phương thức thanh toán</h3>
            <div className="space-y-2 mb-5">
              {[
                { key: 'vnpay', label: 'VNPay', icon: 'account_balance' },
                { key: 'momo', label: 'Ví MoMo', icon: 'wallet' },
                { key: 'bank', label: 'Chuyển khoản', icon: 'qr_code_2' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${method === m.key ? 'border-primary-container bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                >
                  <span className={`material-symbols-outlined ${method === m.key ? 'text-primary-container' : 'text-gray-400'}`}>{m.icon}</span>
                  <span className="text-sm font-semibold text-on-surface flex-1">{m.label}</span>
                  {method === m.key && <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>}
                </button>
              ))}
            </div>
            <button onClick={() => alert('Chuyển tới cổng thanh toán (demo)')} className="w-full py-3 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">lock</span> Thanh toán {fmt(total)}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">Giao dịch được mã hóa & bảo mật bởi RoomHub.</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default TenantInvoiceDetail;
