import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Props {
  setCurrentPage: (page: PageType) => void;
  setSelectedInvoiceId: (id: string | null) => void;
}

interface Invoice {
  id: string;
  month: string;
  total: number;
  due: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled' | 'pending';
  statusLabel: string;
  buildingName: string;
  roomNumber: string;
}

const statusMeta = {
  unpaid: { label: 'Chưa thanh toán', cls: 'text-amber-600 bg-amber-50 border border-amber-200' },
  paid: { label: 'Đã thanh toán', cls: 'text-green-600 bg-green-50 border border-green-200' },
  overdue: { label: 'Quá hạn', cls: 'text-red-600 bg-red-50 border border-red-200' },
  cancelled: { label: 'Đã hủy', cls: 'text-gray-500 bg-gray-100 border border-gray-200' },
  pending: { label: 'Chờ xử lý', cls: 'text-blue-600 bg-blue-50 border border-blue-200' },
};

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unpaid', label: 'Chưa trả' },
  { key: 'paid', label: 'Đã trả' },
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const TenantMyInvoices: React.FC<Props> = ({ setCurrentPage, setSelectedInvoiceId }) => {
  const [tab, setTab] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tenant/invoices');
        const mapped = res.data.map((item: any) => {
          let statusKey: 'unpaid' | 'paid' | 'overdue' | 'cancelled' | 'pending' = 'unpaid';
          if (item.status === 'Đã thanh toán') {
            statusKey = 'paid';
          } else if (item.status === 'Quá hạn') {
            statusKey = 'overdue';
          } else if (item.status === 'Đã hủy') {
            statusKey = 'cancelled';
          } else if (item.status === 'Chờ xử lý') {
            statusKey = 'pending';
          }
          return {
            id: item.id.toString(),
            month: `Tháng ${item.month}`,
            total: item.totalAmount,
            due: item.dueDate,
            status: statusKey,
            statusLabel: item.status,
            buildingName: item.buildingName,
            roomNumber: item.roomNumber,
          };
        });
        setInvoices(mapped);
      } catch (err) {
        console.error('Lỗi khi tải hóa đơn của khách thuê:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = invoices.filter((i) => {
    if (tab === 'all') return true;
    if (tab === 'unpaid') return i.status === 'unpaid' || i.status === 'overdue';
    return i.status === 'paid';
  });

  const unpaidSum = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0);

  const paidSum = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Cần thanh toán</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{fmt(unpaidSum)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
            <p className="text-xs text-gray-500 font-medium">Đã thanh toán</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{fmt(paidSum)}</p>
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
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-[48px] mb-2 block">receipt_long</span>
                Không có hóa đơn nào trong danh mục này.
              </div>
            ) : (
              filtered.map((inv) => {
                const meta = statusMeta[inv.status];
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary-container">receipt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">{inv.month} ({inv.buildingName} - Phòng {inv.roomNumber})</p>
                      <p className="text-[11px] text-gray-500">Mã HD-{inv.id} · Hạn đóng {inv.due}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-on-surface">{fmt(inv.total)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>{inv.statusLabel}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInvoiceId(inv.id);
                        setCurrentPage('tenant-invoice-detail');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${inv.status === 'unpaid' || inv.status === 'overdue' ? 'text-white bg-primary-container hover:bg-orange-600' : 'text-primary-container hover:bg-orange-50'}`}
                    >
                      {inv.status === 'unpaid' || inv.status === 'overdue' ? 'Thanh toán ngay' : 'Xem chi tiết'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default TenantMyInvoices;
