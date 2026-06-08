import React, { useCallback, useEffect, useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface FlaggedListing {
  roomId: number;
  title: string;
  description: string;
  price: number;
  area: number;
  ownerName: string;
  ownerEmail: string;
  buildingName: string;
  district: string;
  imageUrls: string[];
  moderationStatus: string;
  moderationRemarks?: string;
  listingScore: number;
  isPublished: boolean;
  moderatedAt?: string;
  submittedAt: string;
}

interface ModerationStats {
  flaggedCount: number;
  pendingCount: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')}đ`;
const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const AdminModeration: React.FC = () => {
  const [listings, setListings] = useState<FlaggedListing[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listingsRes, statsRes] = await Promise.all([
        api.get('/admin/moderation/listings/flagged'),
        api.get('/admin/moderation/stats'),
      ]);
      setListings(listingsRes.data);
      setStats(statsRes.data);
    } catch {
      setError('Không thể tải danh sách kiểm duyệt. Vui lòng đăng nhập bằng tài khoản Admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: number, publish: boolean) => {
    setActionId(id);
    try {
      await api.put(`/admin/moderation/listings/${id}/approve`, { publish });
      await loadData();
    } catch {
      alert('Không thể duyệt tin. Vui lòng thử lại.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: number) => {
    const remarks = window.prompt('Lý do từ chối (tùy chọn):');
    if (remarks === null) return;

    setActionId(id);
    try {
      await api.put(`/admin/moderation/listings/${id}/reject`, { remarks: remarks || undefined });
      await loadData();
    } catch {
      alert('Không thể từ chối tin. Vui lòng thử lại.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-[40px] text-primary-container animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-semibold">{error}</div>
      )}

      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Chờ Admin duyệt', value: stats?.flaggedCount ?? 0, color: 'text-amber-500' },
            { label: 'Đang xử lý AI', value: stats?.pendingCount ?? 0, color: 'text-indigo-500' },
            { label: 'Đã duyệt (tháng)', value: stats?.approvedThisMonth ?? 0, color: 'text-green-600' },
            { label: 'Đã từ chối (tháng)', value: stats?.rejectedThisMonth ?? 0, color: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="space-y-4">
        {listings.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-green-400 mb-2">verified</span>
            <p className="font-bold text-on-surface">Không có tin nào chờ Admin duyệt.</p>
            <p className="text-sm text-gray-500 mt-1">Tin bị AI chuyển sang (Flagged) sẽ hiện tại đây.</p>
          </div>
        )}

        {listings.map((l, i) => {
          const cover = l.imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';
          const isBusy = actionId === l.roomId;

          return (
            <Reveal key={l.roomId} delay={i * 60}>
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  <img src={cover} alt={l.title} className="w-full lg:w-36 h-36 lg:h-28 object-cover rounded-xl shrink-0" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-on-surface">{l.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chủ: {l.ownerName} ({l.ownerEmail}) · {l.buildingName}, {l.district}
                        </p>
                        <p className="text-xs text-primary-container font-bold mt-0.5">
                          {formatPrice(l.price)}/tháng · {l.area}m² · Điểm AI: {l.listingScore}/100
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-amber-700 bg-amber-50 flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                        AI chuyển Admin
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 line-clamp-3">{l.description}</p>

                    {l.moderationRemarks && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Báo cáo AI / Hệ thống</p>
                        <p className="text-xs text-amber-900 whitespace-pre-line">{l.moderationRemarks}</p>
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">
                      Gửi duyệt: {formatDate(l.submittedAt)}
                      {l.moderatedAt ? ` · AI xử lý: ${formatDate(l.moderatedAt)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                  <button
                    disabled={isBusy}
                    onClick={() => handleApprove(l.roomId, true)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Duyệt & Công bố
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => handleApprove(l.roomId, false)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">draft</span>
                    Duyệt (giữ nháp)
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => handleReject(l.roomId)}
                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Từ chối
                  </button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};

export default AdminModeration;
