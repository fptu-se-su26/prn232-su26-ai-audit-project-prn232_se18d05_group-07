import React, { useState, useEffect, useCallback } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface AdminBuilding {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  ward: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  electricityPrice: number;
  waterPrice: number;
  waterBillingType: string;
  internetPrice: number;
  garbagePrice: number;
  thumbnailUrl: string;
  isLocked?: boolean;
  lockReason?: string;
  createdAt: string;
}

const AdminBuildings: React.FC = () => {
  const [buildings, setBuildings] = useState<AdminBuilding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked' | 'high_occupancy' | 'has_vacant'>('all');
  
  // Selection & Lock Modal States
  const [selectedBuilding, setSelectedBuilding] = useState<AdminBuilding | null>(null);
  const [lockTargetBuilding, setLockTargetBuilding] = useState<AdminBuilding | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState<string>('');
  const [actionBusy, setActionBusy] = useState<boolean>(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/buildings');
      const normalizedData: AdminBuilding[] = (res.data || []).map((b: any) => ({
        id: b.id,
        name: b.name || 'Tòa nhà',
        address: b.address || '',
        district: b.district || '',
        city: b.city || 'Đà Nẵng',
        ward: b.ward || '',
        ownerId: b.ownerId || '',
        ownerName: b.ownerName || 'Chủ nhà',
        ownerEmail: b.ownerEmail || 'Chưa cập nhật',
        ownerPhone: b.ownerPhone || 'Chưa cập nhật',
        totalRooms: b.totalRooms ?? b.rooms ?? 0,
        occupiedRooms: b.occupiedRooms ?? b.occupied ?? 0,
        vacantRooms: b.vacantRooms ?? b.vacant ?? 0,
        maintenanceRooms: b.maintenanceRooms ?? b.maintenance ?? 0,
        electricityPrice: b.electricityPrice || 0,
        waterPrice: b.waterPrice || 0,
        waterBillingType: b.waterBillingType || 'PerCubicMeter',
        internetPrice: b.internetPrice || 0,
        garbagePrice: b.garbagePrice || 0,
        thumbnailUrl: b.thumbnailUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
        isLocked: !!b.isLocked,
        lockReason: b.lockReason || '',
        createdAt: b.createdAt || ''
      }));
      setBuildings(normalizedData);
    } catch (err: any) {
      console.error('Error fetching admin buildings:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.details ||
        'Không thể kết nối đến máy chủ hoặc bạn không có quyền Admin.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  // Handle Toggle Lock / Unlock
  const handleConfirmToggleLock = async () => {
    if (!lockTargetBuilding) return;
    setActionBusy(true);
    try {
      const res = await api.post(`/admin/buildings/${lockTargetBuilding.id}/toggle-lock`, {
        reason: lockReasonInput.trim() || 'Vi phạm quy định nền tảng'
      });
      if (res.data.success) {
        showToast(
          lockTargetBuilding.isLocked
            ? `Đã mở khóa tòa nhà "${lockTargetBuilding.name}" thành công!`
            : `Đã tạm khóa tòa nhà "${lockTargetBuilding.name}".`,
          'success'
        );
        setLockTargetBuilding(null);
        setLockReasonInput('');
        await fetchBuildings();
      }
    } catch (err: any) {
      console.error('Error toggling building lock:', err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa tòa nhà.', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  // Statistics calculation
  const totalBuildings = buildings.length;
  const activeBuildingsCount = buildings.filter((b) => !b.isLocked).length;
  const lockedBuildingsCount = buildings.filter((b) => b.isLocked).length;
  const totalRoomsSum = buildings.reduce((acc, b) => acc + (b.totalRooms || 0), 0);
  const totalOccupiedSum = buildings.reduce((acc, b) => acc + (b.occupiedRooms || 0), 0);
  const avgOccupancy = totalRoomsSum > 0 ? Math.round((totalOccupiedSum / totalRoomsSum) * 100) : 0;

  // Filtering
  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'active') return !b.isLocked;
    if (activeTab === 'locked') return b.isLocked;

    const rate = b.totalRooms > 0 ? (b.occupiedRooms / b.totalRooms) * 100 : 0;
    if (activeTab === 'high_occupancy') return rate >= 80;
    if (activeTab === 'has_vacant') return b.vacantRooms > 0;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedBuildings = filteredBuildings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-slide-down ${
            toast.type === 'success'
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Top Header / KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">apartment</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tổng số tòa nhà</p>
            <h4 className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '...' : totalBuildings}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tòa đang hoạt động</p>
            <h4 className="text-2xl font-bold text-green-600 mt-0.5">{loading ? '...' : activeBuildingsCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tòa đang bị khóa</p>
            <h4 className="text-2xl font-bold text-red-600 mt-0.5">{loading ? '...' : lockedBuildingsCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">pie_chart</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tỷ lệ lấp đầy TB</p>
            <h4 className="text-2xl font-bold text-on-surface mt-0.5">{loading ? '...' : `${avgOccupancy}%`}</h4>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 soft-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-primary-container shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Tất cả ({totalBuildings})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🟢 Hoạt động ({activeBuildingsCount})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'locked'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🔴 Đã bị khóa ({lockedBuildingsCount})
          </button>
          <button
            onClick={() => setActiveTab('high_occupancy')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'high_occupancy'
                ? 'bg-white text-primary-container shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🔥 Lấp đầy cao (≥80%)
          </button>
          <button
            onClick={() => setActiveTab('has_vacant')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'has_vacant'
                ? 'bg-white text-primary-container shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            ✨ Còn phòng trống
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên tòa nhà, địa chỉ, chủ nhà..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">Đang tải danh sách tòa nhà hệ thống...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-3xl mb-2 text-red-500">error</span>
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchBuildings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">apartment</span>
          <h3 className="font-bold text-gray-700">Không tìm thấy tòa nhà nào</h3>
          <p className="text-xs text-gray-400 mt-1">Hãy thử điều chỉnh từ khóa hoặc bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Buildings Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedBuildings.map((b, i) => {
              const rate = b.totalRooms > 0 ? Math.round((b.occupiedRooms / b.totalRooms) * 100) : 0;
              return (
                <Reveal key={b.id} delay={i * 50}>
                  <div className={`bg-white rounded-2xl border soft-shadow overflow-hidden hover-lift h-full flex flex-col justify-between transition-all ${
                    b.isLocked ? 'border-red-200 bg-red-50/10' : 'border-gray-100'
                  }`}>
                    <div>
                      {/* Thumbnail Image Header */}
                      <div className="h-44 relative overflow-hidden bg-gray-100">
                        <img
                          src={b.thumbnailUrl}
                          alt={b.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            b.isLocked ? 'grayscale opacity-75' : 'group-hover:scale-105'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {b.isLocked ? (
                            <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-400/30 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">lock</span> ĐÃ BỊ KHÓA
                            </span>
                          ) : (
                            <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                              {rate}% Lấp đầy
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm flex items-center gap-1.5">
                            {b.name}
                          </h3>
                          <p className="text-white/80 text-xs flex items-center gap-1 mt-1 truncate">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            {b.address || `${b.district}, ${b.city}`}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        {/* Lock Reason Warning Box if Locked */}
                        {b.isLocked && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start gap-2">
                            <span className="material-symbols-outlined text-base text-red-500 shrink-0 mt-0.5">error</span>
                            <div>
                              <strong className="font-bold">Tòa nhà bị tạm khóa:</strong>
                              <p className="text-[11px] mt-0.5 italic">{b.lockReason || 'Vi phạm quy định nền tảng'}</p>
                            </div>
                          </div>
                        )}

                        {/* Owner info */}
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary-container flex items-center justify-center text-xs font-bold">
                              {b.ownerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Chủ sở hữu</p>
                              <p className="text-xs font-bold text-on-surface truncate max-w-[140px]">{b.ownerName}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium">{b.createdAt}</span>
                        </div>

                        {/* Room Occupancy progress */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-semibold">
                            <span className="text-gray-500">Tình trạng sử dụng</span>
                            <span className="text-on-surface">{b.occupiedRooms} / {b.totalRooms} phòng</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full transition-all duration-500 ${
                                b.isLocked ? 'bg-gray-400' : rate >= 80 ? 'bg-green-500' : 'bg-primary-container'
                              }`}
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                            <span>Trống: <strong className="text-green-600 font-semibold">{b.vacantRooms}</strong></span>
                            <span>Bảo trì: <strong className="text-amber-600 font-semibold">{b.maintenanceRooms}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedBuilding(b)}
                        className="py-2.5 bg-gray-50 hover:bg-orange-50 text-on-surface hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-gray-100 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        Chi tiết
                      </button>

                      <button
                        onClick={() => {
                          setLockTargetBuilding(b);
                          setLockReasonInput('');
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          b.isLocked
                            ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {b.isLocked ? 'lock_open' : 'lock'}
                        </span>
                        {b.isLocked ? 'Mở khóa' : 'Tạm khóa'}
                      </button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Pagination Controls Footer */}
          {filteredBuildings.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 soft-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span>
                  Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + itemsPerPage, filteredBuildings.length)}</strong> trên <strong>{filteredBuildings.length}</strong> tòa nhà
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
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-container disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang đầu"
                >
                  <span className="material-symbols-outlined text-base">first_page</span>
                </button>
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
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-container disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang cuối"
                >
                  <span className="material-symbols-outlined text-base">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lock / Unlock Confirmation Dialog */}
      {lockTargetBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                lockTargetBuilding.isLocked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {lockTargetBuilding.isLocked ? 'lock_open' : 'lock'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  {lockTargetBuilding.isLocked ? 'Xác nhận mở khóa tòa nhà' : 'Xác nhận tạm khóa tòa nhà'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">{lockTargetBuilding.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {lockTargetBuilding.isLocked
                ? 'Khi mở khóa, tòa nhà và các bài đăng/phòng trọ thuộc tòa nhà sẽ khôi phục trạng thái hiển thị công khai bình thường.'
                : 'Khi tạm khóa, toàn bộ bài đăng/phòng trọ thuộc tòa nhà này sẽ tự động bị ẩn khỏi trang tìm kiếm của Người thuê.'}
            </p>

            {!lockTargetBuilding.isLocked && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Lý do khóa tòa nhà:</label>
                <textarea
                  rows={3}
                  value={lockReasonInput}
                  onChange={(e) => setLockReasonInput(e.target.value)}
                  placeholder="Nhập lý do khóa (Ví dụ: Gian lận thông tin, vi phạm PCCC...)"
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                disabled={actionBusy}
                onClick={() => setLockTargetBuilding(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                disabled={actionBusy}
                onClick={handleConfirmToggleLock}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md ${
                  lockTargetBuilding.isLocked
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {actionBusy && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {lockTargetBuilding.isLocked ? 'Xác nhận Mở khóa' : 'Xác nhận Tạm khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Building Detail Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary-container uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">
                  Mã tòa nhà #{selectedBuilding.id}
                </span>
                <h3 className="text-lg font-bold text-on-surface mt-1">{selectedBuilding.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {selectedBuilding.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Warning if Locked */}
            {selectedBuilding.isLocked && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-800">
                  <span className="material-symbols-outlined text-base">lock</span>
                  Tòa nhà này hiện đang bị Admin tạm khóa!
                </div>
                <p className="text-[11px] text-red-600">Lý do: {selectedBuilding.lockReason || 'Vi phạm quy định hệ thống'}</p>
              </div>
            )}

            {/* Owner Section */}
            <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 space-y-2">
              <h4 className="text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">person</span>
                Thông tin chủ nhà
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Họ tên:</span>
                  <p className="font-bold text-on-surface">{selectedBuilding.ownerName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Số điện thoại:</span>
                  <p className="font-bold text-on-surface">{selectedBuilding.ownerPhone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Email:</span>
                  <p className="font-bold text-on-surface">{selectedBuilding.ownerEmail}</p>
                </div>
              </div>
            </div>

            {/* Room Breakdown Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold">Tổng phòng</p>
                <p className="text-lg font-bold text-blue-900 mt-0.5">{selectedBuilding.totalRooms}</p>
              </div>
              <div className="bg-green-50/60 p-3 rounded-xl border border-green-100">
                <p className="text-[10px] text-green-600 font-bold">Đang ở</p>
                <p className="text-lg font-bold text-green-900 mt-0.5">{selectedBuilding.occupiedRooms}</p>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-bold">Còn trống</p>
                <p className="text-lg font-bold text-emerald-900 mt-0.5">{selectedBuilding.vacantRooms}</p>
              </div>
            </div>

            {/* Default Service Costs */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">receipt_long</span>
                Đơn giá chi phí dịch vụ tòa nhà
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá điện:</span>
                  <span className="font-bold">{selectedBuilding.electricityPrice.toLocaleString()} đ/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá nước:</span>
                  <span className="font-bold">{selectedBuilding.waterPrice.toLocaleString()} đ/{selectedBuilding.waterBillingType === 'PerPerson' ? 'người' : 'm3'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Internet:</span>
                  <span className="font-bold">{selectedBuilding.internetPrice.toLocaleString()} đ/tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền rác:</span>
                  <span className="font-bold">{selectedBuilding.garbagePrice.toLocaleString()} đ/tháng</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedBuilding(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuildings;
