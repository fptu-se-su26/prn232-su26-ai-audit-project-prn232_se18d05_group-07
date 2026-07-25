import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Service {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  commissionRate: number;
}

interface ServiceRequestItem {
  id: number;
  serviceId: number;
  serviceName: string;
  roomTitle: string | null;
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

const TenantServiceRequests: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
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
      const [sv, rq] = await Promise.allSettled([
        api.get('/services'),
        api.get('/tenant/service-requests'),
      ]);
      if (sv.status === 'fulfilled') setServices(sv.value.data);
      if (rq.status === 'fulfilled') setRequests(rq.value.data);
    } catch {
      triggerToast('Không thể tải dữ liệu dịch vụ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const request = async (serviceId: number) => {
    setSubmittingId(serviceId);
    try {
      const res = await api.post('/tenant/service-requests', { serviceId });
      setRequests(prev => [res.data, ...prev]);
      triggerToast('Đã gửi yêu cầu dịch vụ.');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể gửi yêu cầu.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const cancel = async (id: number) => {
    try {
      await api.delete(`/tenant/service-requests/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
      triggerToast('Đã hủy yêu cầu.');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể hủy yêu cầu.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Danh mục dịch vụ */}
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-1">Dịch vụ tiện ích</h2>
            <p className="text-xs text-gray-500 mb-4">Chọn dịch vụ bạn cần, yêu cầu sẽ được gửi tới chủ trọ để xử lý.</p>
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-8 text-center text-xs font-semibold text-gray-500">
                Hiện chưa có dịch vụ nào.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s, i) => (
                  <Reveal key={s.id} delay={i * 40}>
                    <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary-container">home_repair_service</span>
                        <h4 className="font-bold text-sm text-on-surface">{s.name}</h4>
                      </div>
                      {s.description && <p className="text-xs text-gray-500 mb-3 flex-grow">{s.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary-container">{money(s.basePrice)}</span>
                        <button
                          onClick={() => request(s.id)}
                          disabled={submittingId === s.id}
                          className="px-4 py-2 bg-primary-container hover:bg-orange-650 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                          {submittingId === s.id && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                          Yêu cầu
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Yêu cầu của tôi */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3">Yêu cầu của tôi ({requests.length})</h3>
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-10 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-[56px] text-gray-200 mb-3">room_service</span>
                <p className="text-xs text-gray-500 font-semibold">Bạn chưa gửi yêu cầu dịch vụ nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r, i) => {
                  const sm = statusMeta[r.status] || statusMeta.Pending;
                  return (
                    <Reveal key={r.id} delay={i * 40}>
                      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-on-surface">{r.serviceName}</h4>
                            <p className="text-xs text-gray-500 mt-1">{money(r.amount)} · Gửi lúc {formatDate(r.requestDate)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sm.cls}`}>
                              <span className="material-symbols-outlined text-[14px]">{sm.icon}</span> {sm.label}
                            </span>
                            {r.status === 'Pending' && (
                              <button
                                onClick={() => cancel(r.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                                title="Hủy yêu cầu"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TenantServiceRequests;
