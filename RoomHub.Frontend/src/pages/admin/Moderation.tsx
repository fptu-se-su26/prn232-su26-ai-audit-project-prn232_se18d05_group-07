import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Report {
  id: number;
  type: 'review' | 'message';
  author: string;
  content: string;
  reason: string;
  time: string;
}

const initial: Report[] = [
  { id: 1, type: 'review', author: 'binh.nv@gmail.com', content: 'Chủ trọ lừa đảo, đặt cọc xong không cho xem phòng!!!', reason: 'Ngôn từ xúc phạm', time: '1 giờ trước' },
  { id: 2, type: 'message', author: 'user2841', content: 'Liên hệ Zalo 09xx để được giảm giá ngoài hệ thống...', reason: 'Spam / giao dịch ngoài nền tảng', time: '3 giờ trước' },
  { id: 3, type: 'review', author: 'hoa.le@gmail.com', content: 'Phòng ẩm mốc, không đúng như hình đăng tải.', reason: 'Báo cáo bởi chủ trọ', time: 'Hôm qua' },
];

const AdminModeration: React.FC = () => {
  const [reports, setReports] = useState(initial);
  const resolve = (id: number) => setReports((r) => r.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Chờ xử lý', value: reports.length, color: 'text-amber-500' },
            { label: 'Đánh giá bị báo', value: reports.filter((r) => r.type === 'review').length, color: 'text-red-500' },
            { label: 'Tin nhắn bị báo', value: reports.filter((r) => r.type === 'message').length, color: 'text-indigo-500' },
            { label: 'Đã xử lý (tháng)', value: 47, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="space-y-4">
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-green-400 mb-2">verified</span>
            <p className="font-bold text-on-surface">Tuyệt vời! Không còn nội dung nào chờ kiểm duyệt.</p>
          </div>
        )}
        {reports.map((r, i) => (
          <Reveal key={r.id} delay={i * 60}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${r.type === 'review' ? 'text-amber-500' : 'text-indigo-500'}`}>{r.type === 'review' ? 'rate_review' : 'forum'}</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{r.type === 'review' ? 'Đánh giá' : 'Tin nhắn'} từ {r.author}</p>
                    <p className="text-[11px] text-gray-400">{r.time}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-red-600 bg-red-50 flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[14px]">flag</span> {r.reason}
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-4 italic">"{r.content}"</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => resolve(r.id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">delete</span> Gỡ nội dung
                </button>
                <button onClick={() => resolve(r.id)} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check</span> Hợp lệ, bỏ qua
                </button>
                <button onClick={() => alert('Cảnh báo người dùng (demo)')} className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Cảnh báo
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default AdminModeration;
