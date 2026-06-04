import React from 'react';
import type { PageType } from '../../App';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

const facts = [
  { icon: 'straighten', label: 'Diện tích', value: '35 m²' },
  { icon: 'group', label: 'Sức chứa', value: '2 người' },
  { icon: 'bed', label: 'Phòng ngủ', value: '1 PN' },
  { icon: 'chair', label: 'Nội thất', value: 'Đầy đủ' },
];

const utilities = [
  { icon: 'bolt', label: 'Điện', value: '3.500đ / kWh', color: 'text-amber-500' },
  { icon: 'water_drop', label: 'Nước', value: '15.000đ / m³', color: 'text-blue-500' },
  { icon: 'wifi', label: 'Internet', value: '100.000đ / tháng', color: 'text-indigo-500' },
  { icon: 'delete', label: 'Rác', value: '20.000đ / tháng', color: 'text-green-500' },
];

const TenantMyRoom: React.FC<Props> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-6">
      <ParallaxHero
        image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
        heightClass="min-h-[260px]"
      >
        <div className="p-8 h-full flex flex-col justify-end">
          <span className="text-[11px] font-bold text-white bg-green-500 px-2.5 py-1 rounded-full w-fit mb-3">● Đang ở</span>
          <h2 className="text-white text-2xl md:text-3xl font-bold">Phòng 201 — Studio ban công view phố</h2>
          <p className="text-white/85 text-sm flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span> 123 Lê Lợi, Hải Châu, Đà Nẵng
          </p>
        </div>
      </ParallaxHero>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4">Thông tin phòng</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-primary-container mb-1">{f.icon}</span>
                    <p className="text-sm font-bold text-on-surface">{f.value}</p>
                    <p className="text-[11px] text-gray-500">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">bolt</span> Đơn giá dịch vụ
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {utilities.map((u) => (
                  <div key={u.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <span className={`material-symbols-outlined ${u.color}`}>{u.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{u.label}</p>
                      <p className="text-xs text-gray-500">{u.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">description</span> Hợp đồng
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-gray-500">Tiền thuê</span><span className="font-bold text-on-surface">5.500.000đ</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Tiền cọc</span><span className="font-bold text-on-surface">5.500.000đ</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Bắt đầu</span><span className="font-semibold text-on-surface">01/02/2026</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Kết thúc</span><span className="font-semibold text-on-surface">01/02/2027</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-500">Trạng thái</span><span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Còn hiệu lực</span></li>
              </ul>
              <button onClick={() => alert('Tải hợp đồng PDF (demo)')} className="w-full mt-5 py-2.5 bg-orange-50 text-primary-container rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span> Tải hợp đồng
              </button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4">Chủ trọ</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">AN</div>
                <div>
                  <p className="font-bold text-on-surface text-sm">Phan Hoài An</p>
                  <p className="text-xs text-gray-500">Đã xác minh · 4.9 ★</p>
                </div>
              </div>
              <button onClick={() => setCurrentPage('tenant-messages')} className="w-full py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">chat</span> Nhắn tin
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default TenantMyRoom;
