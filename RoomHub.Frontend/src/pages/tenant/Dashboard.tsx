import React from 'react';
import type { PageType } from '../../App';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

const stats = [
  { icon: 'meeting_room', label: 'Phòng đang thuê', value: 'P.201', sub: 'Tòa Hải Châu', color: 'text-primary-container', bg: 'bg-orange-50' },
  { icon: 'receipt_long', label: 'Hóa đơn chờ', value: '1', sub: 'Hạn 05/06', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: 'event_available', label: 'Hợp đồng', value: '8 tháng', sub: 'còn hiệu lực', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: 'favorite', label: 'Đã lưu', value: '5', sub: 'tin yêu thích', color: 'text-pink-500', bg: 'bg-pink-50' },
];

const TenantDashboard: React.FC<Props> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-8">
      {/* Hero parallax chào mừng */}
      <ParallaxHero
        image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"
        heightClass="min-h-[230px]"
      >
        <div className="p-8 md:p-10 h-full flex flex-col justify-center">
          <span className="inline-flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full w-fit mb-4 border border-white/20">
            <span className="material-symbols-outlined text-[16px]">waving_hand</span> Chào mừng trở lại
          </span>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 max-w-xl">Chúc bạn một ngày an cư tại Đà Nẵng</h2>
          <p className="text-white/80 text-sm max-w-lg">Quản lý phòng thuê, hóa đơn và yêu cầu bảo trì — tất cả trong một nơi.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setCurrentPage('tenant-invoices')} className="px-5 py-2.5 bg-white text-primary-container rounded-xl text-sm font-bold hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">payments</span> Thanh toán hóa đơn
            </button>
            <button onClick={() => setCurrentPage('tenant-maintenance')} className="px-5 py-2.5 bg-white/10 backdrop-blur text-white border border-white/30 rounded-xl text-sm font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">build</span> Báo bảo trì
            </button>
          </div>
        </div>
      </ParallaxHero>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 hover-lift cursor-default h-full">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              </div>
              <p className="text-2xl font-bold text-on-surface leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Phòng hiện tại */}
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">meeting_room</span> Phòng đang thuê
              </h3>
              <button onClick={() => setCurrentPage('tenant-room')} className="text-xs font-bold text-primary-container hover:text-orange-600 flex items-center gap-1">
                Chi tiết <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-5">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80" alt="Phòng" className="w-full sm:w-44 h-32 object-cover rounded-xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-on-surface">Phòng 201 — Studio ban công</h4>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Đang ở</span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <span className="material-symbols-outlined text-[14px]">location_on</span> 123 Lê Lợi, Hải Châu, Đà Nẵng
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-sm font-bold text-on-surface">5.5tr</p>
                    <p className="text-[10px] text-gray-500">Tiền thuê/tháng</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-sm font-bold text-on-surface">35m²</p>
                    <p className="text-[10px] text-gray-500">Diện tích</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-sm font-bold text-on-surface">01/02/26</p>
                    <p className="text-[10px] text-gray-500">Bắt đầu thuê</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Hóa đơn gần đây */}
        <Reveal delay={120}>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">receipt_long</span> Hóa đơn
              </h3>
              <button onClick={() => setCurrentPage('tenant-invoices')} className="text-xs font-bold text-primary-container hover:text-orange-600">Tất cả</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/60 border border-red-100">
                <div>
                  <p className="text-sm font-bold text-on-surface">Tháng 05/2026</p>
                  <p className="text-[11px] text-red-500 font-semibold">Chưa thanh toán · Hạn 05/06</p>
                </div>
                <button onClick={() => setCurrentPage('tenant-invoice-detail')} className="text-xs font-bold text-white bg-primary-container px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">Trả</button>
              </div>
              {['Tháng 04/2026', 'Tháng 03/2026'].map((m) => (
                <div key={m} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{m}</p>
                    <p className="text-[11px] text-green-600 font-semibold">Đã thanh toán</p>
                  </div>
                  <span className="material-symbols-outlined text-green-500">task_alt</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default TenantDashboard;
