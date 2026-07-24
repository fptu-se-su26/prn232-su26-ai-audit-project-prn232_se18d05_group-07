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

const statusMeta: Record<string, { label: string; cls: string; icon: string }> = {
  Flagged: { label: 'Chờ Admin duyệt', cls: 'text-amber-700 bg-amber-50 border-amber-200', icon: 'flag' },
  Pending: { label: 'Đang chờ xử lý', cls: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: 'hourglass_top' },
  Approved: { label: 'Đã phê duyệt', cls: 'text-green-700 bg-green-50 border-green-200', icon: 'check_circle' },
  Rejected: { label: 'Đã từ chối', cls: 'text-red-700 bg-red-50 border-red-200', icon: 'cancel' },
};

const AdminRooms: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/moderation/listings?status=${filter}`);
      setListings(res.data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, itemsPerPage]);

  const filters: { id: StatusFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất cả tin đăng', icon: 'apps' },
    { id: 'Flagged', label: 'Chờ Admin duyệt', icon: 'flag' },
    { id: 'Approved', label: 'Đã duyệt công khai', icon: 'verified' },
    { id: 'Rejected', label: 'Đã từ chối', icon: 'cancel' },
    { id: 'Pending', label: 'Đang xử lý', icon: 'hourglass_empty' },
  ];

  // Computed summary stats
  const totalListingsCount = listings.length;
  const flaggedCount = listings.filter((l) => l.moderationStatus === 'Flagged' || l.moderationStatus === 'Pending').length;
  const approvedCount = listings.filter((l) => l.moderationStatus === 'Approved').length;
  const rejectedCount = listings.filter((l) => l.moderationStatus === 'Rejected').length;

  // Pagination calculations
  const totalPages = Math.ceil(listings.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedListings = listings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Top KPI Statistics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">meeting_room</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tổng phòng & tin đăng</p>
            <h4 className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '...' : totalListingsCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">flag</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Chờ duyệt / Gắn cờ</p>
            <h4 className="text-2xl font-bold text-amber-600 mt-0.5">{loading ? '...' : flaggedCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Đã duyệt công khai</p>
            <h4 className="text-2xl font-bold text-green-600 mt-0.5">{loading ? '...' : approvedCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">cancel</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Đã từ chối vi phạm</p>
            <h4 className="text-2xl font-bold text-red-600 mt-0.5">{loading ? '...' : rejectedCount}</h4>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 soft-shadow flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filter === f.id
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary-container border border-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content List Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center text-gray-400 text-sm">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">meeting_room</span>
          <p className="font-bold text-gray-600">Không có tin đăng nào thuộc danh mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {paginatedListings.map((l, i) => {
              const meta = statusMeta[l.moderationStatus] ?? { label: l.moderationStatus, cls: 'text-gray-600 bg-gray-50 border-gray-200', icon: 'info' };
              const cover = l.imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80';

              return (
                <Reveal key={l.roomId} delay={i * 40}>
                  <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover-lift">
                    <img src={cover} alt={l.title} className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-xl shrink-0 border border-gray-100" />
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-on-surface truncate">{l.title}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${meta.cls}`}>
                          <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                          {meta.label}
                        </span>
                        {l.isPublished && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-green-700 bg-green-50 border border-green-200 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            Đang hiển thị công khai
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-gray-400">person</span>
                          Chủ trọ: <strong className="text-gray-700">{l.ownerName}</strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-gray-400">location_on</span>
                          Khu vực: <strong className="text-gray-700">{l.district}</strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-bold text-primary-container text-sm">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          {l.price.toLocaleString('vi-VN')} đ/tháng
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Pagination Controls Footer */}
          {listings.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 soft-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span>
                  Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + itemsPerPage, listings.length)}</strong> trên <strong>{listings.length}</strong> phòng
                </span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Hiển thị:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer"
                  >
                    <option value={6}>6 / trang</option>
                    <option value={12}>12 / trang</option>
                    <option value={24}>24 / trang</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-container disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang trước"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((p) => Math.abs(p - validCurrentPage) <= 1 || p === 1 || p === totalPages)
                  .map((page, index, arr) => {
                    const prev = arr[index - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="text-gray-400 text-xs px-1">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            page === validCurrentPage
                              ? 'bg-primary-container text-white shadow-sm'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-container'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-container disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang tiếp"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
