import React, { useCallback, useEffect, useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Listing {
  roomId: number;
  title: string;
  ownerName: string;
  price: number;
  district: string;
  moderationStatus: string;
  imageUrls: string[];
  isPublished: boolean;
}

type StatusFilter = 'all' | 'Flagged' | 'Approved' | 'Rejected' | 'Pending';

const statusMeta: Record<string, { label: string; cls: string }> = {
  Flagged: { label: 'Chờ Admin', cls: 'text-amber-600 bg-amber-50' },
  Pending: { label: 'Đang xử lý', cls: 'text-indigo-600 bg-indigo-50' },
  Approved: { label: 'Đã duyệt', cls: 'text-green-600 bg-green-50' },
  Rejected: { label: 'Từ chối', cls: 'text-red-600 bg-red-50' },
};

const AdminRooms: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/moderation/listings?status=${filter}`);
      setListings(res.data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Flagged', label: 'Chờ Admin' },
    { id: 'Approved', label: 'Đã duyệt' },
    { id: 'Rejected', label: 'Từ chối' },
    { id: 'Pending', label: 'Đang xử lý' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === f.id
                ? 'bg-primary-container text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-[36px] text-primary-container animate-spin">progress_activity</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center text-gray-500 text-sm">
          Không có tin đăng nào.
        </div>
      ) : (
        listings.map((l, i) => {
          const meta = statusMeta[l.moderationStatus] ?? { label: l.moderationStatus, cls: 'text-gray-600 bg-gray-50' };
          const cover = l.imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';

          return (
            <Reveal key={l.roomId} delay={i * 60}>
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img src={cover} alt={l.title} className="w-full sm:w-28 h-28 sm:h-20 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-on-surface truncate">{l.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>{meta.label}</span>
                    {l.isPublished && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-green-700 bg-green-50">Đang hiển thị</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Chủ: {l.ownerName} · {l.district} ·{' '}
                    <span className="text-primary-container font-bold">{l.price.toLocaleString('vi-VN')}đ/tháng</span>
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })
      )}
    </div>
  );
};

export default AdminRooms;
