import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Ticket {
  id: number;
  title: string;
  desc: string;
  date: string;
  status: 'open' | 'progress' | 'done';
  sentiment: 'positive' | 'neutral' | 'negative';
}

const initial: Ticket[] = [
  { id: 1, title: 'Vòi nước bị rò rỉ', desc: 'Vòi lavabo nhà tắm chảy nước liên tục.', date: '02/06/2026', status: 'progress', sentiment: 'neutral' },
  { id: 2, title: 'Điều hòa không mát', desc: 'Máy lạnh chạy nhưng không hạ nhiệt, có mùi.', date: '28/05/2026', status: 'done', sentiment: 'negative' },
  { id: 3, title: 'Thay bóng đèn hành lang', desc: 'Đèn LED hành lang tầng 2 đã cháy.', date: '20/05/2026', status: 'done', sentiment: 'positive' },
];

const statusMeta = {
  open: { label: 'Mới gửi', cls: 'text-blue-600 bg-blue-50', icon: 'fiber_new' },
  progress: { label: 'Đang xử lý', cls: 'text-amber-600 bg-amber-50', icon: 'pending' },
  done: { label: 'Hoàn thành', cls: 'text-green-600 bg-green-50', icon: 'task_alt' },
};

const sentimentMeta = {
  positive: { label: 'Tích cực', cls: 'text-green-600', icon: 'sentiment_satisfied' },
  neutral: { label: 'Trung tính', cls: 'text-gray-500', icon: 'sentiment_neutral' },
  negative: { label: 'Tiêu cực', cls: 'text-red-500', icon: 'sentiment_dissatisfied' },
};

const TenantMaintenance: React.FC = () => {
  const [tickets, setTickets] = useState(initial);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTickets((t) => [
      { id: Date.now(), title, desc, date: new Date().toLocaleDateString('vi-VN'), status: 'open', sentiment: 'neutral' },
      ...t,
    ]);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Form gửi yêu cầu */}
      <Reveal>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 lg:sticky lg:top-[96px]">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">add_circle</span> Gửi yêu cầu mới
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Tiêu đề sự cố</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bóng đèn phòng tắm bị cháy" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Mô tả chi tiết</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Mô tả tình trạng, vị trí, thời điểm phát hiện..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all resize-none" />
            </div>
            <button type="button" onClick={() => alert('Tải ảnh minh họa (demo)')} className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-primary-container hover:text-primary-container transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add_a_photo</span> Đính kèm ảnh
            </button>
            <button type="submit" className="w-full py-3 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95">Gửi yêu cầu</button>
          </div>
        </form>
      </Reveal>

      {/* Danh sách yêu cầu */}
      <div className="lg:col-span-2 space-y-4">
        {tickets.map((t, i) => {
          const sm = statusMeta[t.status];
          const sen = sentimentMeta[t.sentiment];
          return (
            <Reveal key={t.id} delay={i * 60}>
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 hover-lift">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-on-surface flex-1">{t.title}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${sm.cls}`}>
                    <span className="material-symbols-outlined text-[14px]">{sm.icon}</span> {sm.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t.desc}</p>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {t.date}</span>
                  <span className={`flex items-center gap-1 font-semibold ${sen.cls}`} title="Phân tích cảm xúc bằng AI">
                    <span className="material-symbols-outlined text-[14px]">{sen.icon}</span> AI: {sen.label}
                  </span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};

export default TenantMaintenance;
