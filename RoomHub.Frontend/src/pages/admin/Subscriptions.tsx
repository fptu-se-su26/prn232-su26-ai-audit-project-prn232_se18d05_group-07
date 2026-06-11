import React, { useState, useEffect, useCallback } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface AdminSubscription {
  id: number;
  userId: string;
  ownerName: string;
  ownerEmail: string;
  planType: string;
  amount: number;
  date: string;
  status: string;
  transactionProofUrl?: string;
  note?: string;
}

const plans = [
  { 
    name: 'Starter', 
    price: '0đ', 
    perks: ['Tối đa 1 tòa nhà', 'Tối đa 3 phòng trọ', '3 lượt AI Audit/tháng', 'Quản lý cơ bản'], 
    color: 'border-gray-200' 
  },
  { 
    name: 'Pro (Tháng)', 
    price: '199.000đ/tháng', 
    perks: ['Tối đa 3 tòa nhà', 'Tối đa 30 phòng trọ', 'Không giới hạn AI Audit', 'Tự động gửi email', 'Báo cáo Excel & PDF'], 
    color: 'border-orange-200' 
  },
  { 
    name: 'Pro (Năm)', 
    price: '1.990.000đ/năm', 
    perks: ['Tiết kiệm 20%', 'Tối đa 3 tòa nhà', 'Tối đa 30 phòng trọ', 'Không giới hạn AI Audit', 'Hỗ trợ ưu tiên'], 
    color: 'border-indigo-400' 
  },
];

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const AdminSubscriptions: React.FC = () => {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  
  // Rejection modal state
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Lightbox modal state for viewing proof image
  const [previewSub, setPreviewSub] = useState<AdminSubscription | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/subscriptions');
      setSubs(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ hoặc bạn không có quyền Admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt giao dịch này?')) return;
    
    setActionId(id);
    try {
      const res = await api.post(`/admin/subscriptions/${id}/approve`);
      if (res.data.success) {
        alert('Phê duyệt giao dịch thành công!');
        // Close preview if it was open
        if (previewSub?.id === id) {
          setPreviewSub(null);
        }
        await loadSubscriptions();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt giao dịch.');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    setRejecting(true);
    try {
      const res = await api.post(`/admin/subscriptions/${rejectId}/reject`, {
        reason: rejectReason
      });
      if (res.data.success) {
        alert('Đã từ chối giao dịch thành công.');
        setRejectId(null);
        setRejectReason('');
        // Close preview if it was open
        if (previewSub?.id === rejectId) {
          setPreviewSub(null);
        }
        await loadSubscriptions();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối giao dịch.');
    } finally {
      setRejecting(false);
    }
  };

  // Compute stats dynamically
  const pendingCount = subs.length;
  const pendingAmount = subs.reduce((sum, s) => sum + s.amount, 0);
  const monthlyCount = subs.filter(s => s.planType.includes('Tháng') || s.planType.toLowerCase() === 'monthly').length;
  const yearlyCount = subs.filter(s => s.planType.includes('Năm') || s.planType.toLowerCase() === 'yearly').length;

  if (loading && subs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="material-symbols-outlined text-[40px] text-primary-container animate-spin">progress_activity</span>
        <p className="text-xs font-bold text-gray-500">Đang tải danh sách giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Statistics Row */}
      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Giao dịch chờ duyệt', value: pendingCount, color: 'text-amber-500', icon: 'pending_actions' },
            { label: 'Tổng tiền chờ duyệt', value: formatVND(pendingAmount), color: 'text-green-600', icon: 'payments' },
            { label: 'Yêu cầu gói Tháng', value: monthlyCount, color: 'text-blue-500', icon: 'calendar_month' },
            { label: 'Yêu cầu gói Năm', value: yearlyCount, color: 'text-purple-500', icon: 'workspace_premium' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-3xl border border-gray-100 soft-shadow p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
              <div className={`w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className={`text-lg sm:text-xl font-black truncate ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Plans list */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 70}>
            <div className={`bg-white rounded-3xl border-2 ${p.color} soft-shadow p-5 h-full flex flex-col justify-between hover:scale-[1.01] transition-transform`}>
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                  <h3 className="font-black text-on-surface text-sm uppercase tracking-wider">{p.name}</h3>
                  <span className="text-xs font-bold text-primary-container bg-orange-50 px-2.5 py-1 rounded-full">{p.price}</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.perks.map((perk) => (
                    <li key={perk} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                      <span className="font-medium">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Pending List Card */}
      <Reveal>
        <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">pending_actions</span> Danh sách thanh toán nâng cấp gói
            </h3>
            <button 
              onClick={loadSubscriptions} 
              disabled={loading}
              className="p-2 text-gray-400 hover:text-primary-container rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {subs.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[56px] text-green-400 mb-2">verified</span>
                <p className="font-black text-on-surface">Tuyệt vời! Không có yêu cầu thanh toán nào chờ duyệt.</p>
                <p className="text-xs text-gray-500 mt-1">Các giao dịch chuyển khoản thủ công sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              subs.map((s) => {
                const initials = s.ownerName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'CN';
                const isBusy = actionId === s.id;
                
                return (
                  <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50/40 transition-colors">
                    {/* User and Info block */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#161d2e] to-[#25324d] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                        {initials}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-on-surface truncate">{s.ownerName}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-wider">
                            Gói {s.planType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{s.ownerEmail}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1 font-semibold text-primary-container">
                            <span className="material-symbols-outlined text-[14px]">payments</span>
                            {formatVND(s.amount)}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {s.date}
                          </span>
                        </div>

                        {s.note && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-2.5 max-w-lg italic">
                            &ldquo;{s.note}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proof and Actions block */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                      {s.transactionProofUrl ? (
                        <button
                          onClick={() => setPreviewSub(s)}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">image</span>
                          Xem hóa đơn
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl text-gray-500 bg-gray-50 border border-gray-100 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                          VietQR Online
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          disabled={isBusy}
                          onClick={() => handleApprove(s.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-green-500/10 hover:shadow-green-500/20 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                          {isBusy ? (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                          Duyệt
                        </button>
                        
                        <button
                          disabled={isBusy}
                          onClick={() => setRejectId(s.id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Reveal>

      {/* Beautiful Custom Rejection Dialog Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 soft-shadow relative animate-scale-up border border-gray-100">
            <button
              onClick={() => {
                setRejectId(null);
                setRejectReason('');
              }}
              className="absolute right-5 top-5 text-gray-400 hover:text-on-surface cursor-pointer outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="mb-5">
              <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">cancel</span> Từ chối duyệt giao dịch
              </h3>
              <p className="text-xs text-gray-500 mt-1">Nêu rõ lý do từ chối để hệ thống gửi thông báo đến chủ nhà.</p>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Lý do từ chối</label>
                <textarea
                  rows={4}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh hóa đơn mờ không rõ chi tiết, hoặc chưa nhận được tiền trên tài khoản ngân hàng..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRejectId(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-red-500/10 hover:shadow-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {rejecting ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  Gửi từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Beautiful Lightbox Dialog Modal for transaction proof */}
      {previewSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setPreviewSub(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 hover:text-on-surface cursor-pointer flex items-center justify-center outline-none z-10"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Left side: Image receipt */}
            <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={previewSub.transactionProofUrl}
                alt="Bằng chứng giao dịch"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=L%E1%BB%97i+t%E1%BA%A3i+%E1%BA%A3nh+h%C3%B3a+%C4%91%C6%A1n';
                }}
              />
            </div>

            {/* Right side: details and quick actions */}
            <div className="w-full md:w-[240px] flex flex-col justify-between shrink-0 space-y-6 pt-4 md:pt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-500">receipt_long</span> Chi tiết biên lai
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Mã GD: #{previewSub.id}</p>
                </div>

                <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Chủ nhà</span>
                    <span className="font-bold text-on-surface block truncate">{previewSub.ownerName}</span>
                    <span className="text-[10px] text-gray-500 block truncate">{previewSub.ownerEmail}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Gói đăng ký</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5 text-[10px] border border-indigo-100 uppercase tracking-wider">
                      {previewSub.planType}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Số tiền</span>
                    <span className="font-black text-primary-container text-sm">{formatVND(previewSub.amount)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Ngày gửi</span>
                    <span className="font-semibold text-gray-700">{previewSub.date}</span>
                  </div>
                </div>

                {previewSub.note && (
                  <div className="space-y-1">
                    <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">Ghi chú chủ nhà</span>
                    <p className="text-xs text-gray-600 bg-orange-50/40 border border-orange-100 rounded-xl p-3 italic">
                      &ldquo;{previewSub.note}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons inside lightbox */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <button
                  disabled={actionId === previewSub.id}
                  onClick={() => handleApprove(previewSub.id)}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-green-500/10 hover:shadow-green-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Phê duyệt ngay
                </button>
                
                <button
                  onClick={() => setRejectId(previewSub.id)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Từ chối duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
