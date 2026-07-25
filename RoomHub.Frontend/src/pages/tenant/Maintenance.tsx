import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Ticket {
  id: number;
  roomId: number;
  roomTitle: string | null;
  title: string;
  description: string | null;
  status: string; // Open | InProgress | Resolved
  createdAt: string;
  resolvedAt: string | null;
}

const statusMeta: Record<string, { label: string; cls: string; icon: string }> = {
  Open: { label: 'Mới gửi', cls: 'text-blue-600 bg-blue-50', icon: 'fiber_new' },
  InProgress: { label: 'Đang xử lý', cls: 'text-amber-600 bg-amber-50', icon: 'pending' },
  Resolved: { label: 'Hoàn thành', cls: 'text-green-600 bg-green-50', icon: 'task_alt' },
};

const TenantMaintenance: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => setToast({ text, type });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/maintenance');
      setTickets(res.data);
    } catch {
      triggerToast('Không thể tải danh sách yêu cầu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/tenant/maintenance', { title: title.trim(), description: desc.trim() || null });
      setTickets(prev => [res.data, ...prev]);
      setTitle('');
      setDesc('');
      triggerToast('Đã gửi yêu cầu bảo trì.');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể gửi yêu cầu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: number) => {
    try {
      await api.delete(`/tenant/maintenance/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      triggerToast('Đã hủy yêu cầu.');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể hủy yêu cầu.', 'error');
    }
  };

  const formatDate = (s: string) => {
    try {
      const hasTz = /[zZ]$|[+-]\d\d:?\d\d$/.test(s);
      return new Date(hasTz ? s : `${s}Z`).toLocaleDateString('vi-VN');
    } catch { return s; }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 relative">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Form gửi yêu cầu */}
      <Reveal>
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 lg:sticky lg:top-[96px]">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">add_circle</span> Gửi yêu cầu mới
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Tiêu đề sự cố</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="VD: Bóng đèn phòng tắm bị cháy" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Mô tả chi tiết</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Mô tả tình trạng, vị trí, thời điểm phát hiện..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all resize-none" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </Reveal>

      {/* Danh sách yêu cầu */}
      <div className="lg:col-span-2 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
            <p className="text-xs font-bold text-gray-500">Đang tải...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined text-[64px] text-gray-200 mb-4">build_circle</span>
            <h3 className="text-base font-bold text-on-surface mb-1">Chưa có yêu cầu bảo trì</h3>
            <p className="text-xs text-gray-500 max-w-sm font-semibold leading-relaxed">
              Gửi yêu cầu ở form bên trái khi phòng bạn có sự cố cần sửa chữa.
            </p>
          </div>
        ) : (
          tickets.map((t, i) => {
            const sm = statusMeta[t.status] || statusMeta.Open;
            return (
              <Reveal key={t.id} delay={i * 60}>
                <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 hover-lift">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-on-surface flex-1">{t.title}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${sm.cls}`}>
                      <span className="material-symbols-outlined text-[14px]">{sm.icon}</span> {sm.label}
                    </span>
                  </div>
                  {t.description && <p className="text-sm text-gray-600 mb-3">{t.description}</p>}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {formatDate(t.createdAt)}</span>
                      {t.roomTitle && (
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">meeting_room</span> {t.roomTitle}</span>
                      )}
                    </div>
                    {t.status === 'Open' && (
                      <button
                        onClick={() => cancel(t.id)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">cancel</span> Hủy
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TenantMaintenance;
