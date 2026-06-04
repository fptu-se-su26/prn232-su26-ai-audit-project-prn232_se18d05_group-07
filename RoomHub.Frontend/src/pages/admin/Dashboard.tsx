import React from 'react';
import type { PageType } from '../../App';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

const kpis = [
  { icon: 'group', label: 'Người dùng', value: '12.480', delta: '+8,2%', up: true, color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: 'apartment', label: 'Tòa nhà', value: '1.245', delta: '+3,1%', up: true, color: 'text-primary-container', bg: 'bg-orange-50' },
  { icon: 'meeting_room', label: 'Tin đăng', value: '5.032', delta: '+12%', up: true, color: 'text-green-600', bg: 'bg-green-50' },
  { icon: 'payments', label: 'Doanh thu tháng', value: '86,4tr', delta: '-2,4%', up: false, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const bars = [40, 65, 52, 78, 60, 90, 72, 85, 95, 70, 88, 100];
const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const activities = [
  { icon: 'person_add', text: 'Người dùng mới "tranbinh@gmail.com" đăng ký', time: '5 phút trước', color: 'text-green-500' },
  { icon: 'campaign', text: '3 tin đăng mới chờ duyệt', time: '22 phút trước', color: 'text-amber-500' },
  { icon: 'flag', text: 'Báo cáo vi phạm đánh giá #4821', time: '1 giờ trước', color: 'text-red-500' },
  { icon: 'workspace_premium', text: 'Chủ trọ "An Phan" nâng cấp gói Pro', time: '3 giờ trước', color: 'text-indigo-500' },
];

const AdminDashboard: React.FC<Props> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-6">
      <ParallaxHero
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80"
        heightClass="min-h-[180px]"
        overlayClass="bg-gradient-to-r from-[#161d2e]/90 via-[#161d2e]/80 to-primary/40"
      >
        <div className="p-8 h-full flex flex-col justify-center">
          <h2 className="text-white text-2xl font-bold mb-1">Chào mừng tới Trung tâm điều hành</h2>
          <p className="text-white/75 text-sm">Theo dõi sức khỏe nền tảng RoomHub theo thời gian thực.</p>
        </div>
      </ParallaxHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 hover-lift h-full">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
                </div>
                <span className={`text-[11px] font-bold flex items-center ${k.up ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="material-symbols-outlined text-[14px]">{k.up ? 'trending_up' : 'trending_down'}</span>{k.delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-on-surface leading-none">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{k.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface">Tăng trưởng tin đăng 2026</h3>
              <span className="text-xs font-semibold text-gray-400">Đơn vị: tin</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-48">
              {bars.map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-orange-100 rounded-t-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-orange-400 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{months[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-on-surface">Hoạt động gần đây</h3>
              <button onClick={() => setCurrentPage('admin-moderation')} className="text-xs font-bold text-primary-container hover:text-orange-600">Xem</button>
            </div>
            <div className="p-4 space-y-3">
              {activities.map((a, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ${a.color}`}>
                    <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-on-surface leading-snug">{a.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AdminDashboard;
