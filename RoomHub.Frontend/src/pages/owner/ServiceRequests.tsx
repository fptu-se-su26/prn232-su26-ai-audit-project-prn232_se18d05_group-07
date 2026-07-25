import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface ServiceRequestItem {
  id: number;
  serviceName: string;
  roomTitle: string | null;
  tenantName: string | null;
  requestDate: string;
  status: string;
  amount: number | null;
}

const statusMeta: Record<string, { label: string; cls: string; icon: string }> = {
  Pending: { label: 'Chờ duyệt', cls: 'text-amber-600 bg-amber-50', icon: 'pending' },
  Approved: { label: 'Đã duyệt', cls: 'text-blue-600 bg-blue-50', icon: 'check_circle' },
  Completed: { label: 'Hoàn thành', cls: 'text-green-600 bg-green-50', icon: 'task_alt' },
  Rejected: { label: 'Từ chối', cls: 'text-red-500 bg-red-50', icon: 'cancel' },
};

const money = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('vi-VN')}đ`);

const formatDate = (s: string) => {
  try {
    const hasTz = /[zZ]$|[+-]\d\d:?\d\d$/.test(s);
    return new Date(hasTz ? s : `${s}Z`).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return s; }
};

const OwnerServiceRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => setToast({ text, type });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/service-requests');
      setRequests(res.data);
    } catch {
      triggerToast('Không thể tải danh sách yêu cầu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setBusyId(id);
    try {
      const res = await api.put(`/owner/service-requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => (r.id === id ? res.data : r)));
      triggerToast('Đã cập nhật trạng thái.');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể cập nhật.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-on-surface">Yêu cầu dịch vụ</h2>
        <p className="text-xs text-gray-500">Yêu cầu dịch vụ từ khách thuê của bạn. Duyệt, hoàn thành hoặc từ chối.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-[64px] text-gray-200 mb-4">room_service</span>
          <h3 className="text-base font-bold text-on-surface mb-1">Chưa có yêu cầu dịch vụ</h3>
          <p className="text-xs text-gray-500 max-w-sm font-semibold">Khi khách thuê gửi yêu cầu dịch vụ, chúng sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => {
            const sm = statusMeta[r.status] || statusMeta.Pending;
            return (
              <Reveal key={r.id} delay={i * 40}>
                <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-on-surface">{r.serviceName} · {money(r.amount)}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {r.tenantName || 'Khách thuê'}{r.roomTitle ? ` · ${r.roomTitle}` : ''} · {formatDate(r.requestDate)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${sm.cls}`}>
                      <span className="material-symbols-outlined text-[14px]">{sm.icon}</span> {sm.label}
                    </span>
                  </div>

                  {r.status === 'Pending' && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button disabled={busyId === r.id} onClick={() => updateStatus(r.id, 'Approved')} className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95">Duyệt</button>
                      <button disabled={busyId === r.id} onClick={() => updateStatus(r.id, 'Rejected')} className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95">Từ chối</button>
                    </div>
                  )}
                  {r.status === 'Approved' && (
                    <div className="mt-4">
                      <button disabled={busyId === r.id} onClick={() => updateStatus(r.id, 'Completed')} className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95">Đánh dấu hoàn thành</button>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerServiceRequests;
