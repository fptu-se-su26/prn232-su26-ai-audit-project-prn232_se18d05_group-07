import React, { useState, useEffect, useMemo } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface TenantsProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedUnitId: (id: string | null) => void;
}

interface TenantDto {
  contractId: number;
  roomId: number;
  roomNumber: string;
  buildingId: number;
  buildingName: string;
  tenantId: string | null;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string | null;
  tenantAvatar: string | null;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  contractStatus: string; // "Chờ xác nhận" or "Đang thuê"
  isOnline: boolean;
}

const Tenants: React.FC<TenantsProps> = ({ setCurrentPage, setSelectedUnitId }) => {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [accountFilter, setAccountFilter] = useState('Tất cả');

  // Modal states
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  // Terminate form states
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Kết thúc hợp đồng thuê trọ');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load tenants
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/tenants');
      setTenants(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể tải danh sách người thuê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Format currency
  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Unique building list for filter dropdown
  const buildingList = useMemo(() => {
    const list = new Set<string>();
    tenants.forEach(t => {
      if (t.buildingName) list.add(t.buildingName);
    });
    return ['Tất cả', ...Array.from(list)];
  }, [tenants]);

  // Process filters
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesSearch =
        t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenantPhone.includes(searchQuery) ||
        (t.tenantEmail && t.tenantEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBuilding = buildingFilter === 'Tất cả' || t.buildingName === buildingFilter;
      const matchesStatus = statusFilter === 'Tất cả' || t.contractStatus === statusFilter;

      let matchesAccount = true;
      if (accountFilter === 'Online') {
        matchesAccount = t.isOnline;
      } else if (accountFilter === 'Offline') {
        matchesAccount = !t.isOnline;
      }

      return matchesSearch && matchesBuilding && matchesStatus && matchesAccount;
    });
  }, [tenants, searchQuery, buildingFilter, statusFilter, accountFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tenants.length;
    const online = tenants.filter(t => t.isOnline).length;
    const offline = tenants.filter(t => !t.isOnline).length;
    const pending = tenants.filter(t => t.contractStatus === 'Chờ xác nhận').length;
    return { total, online, offline, pending };
  }, [tenants]);

  // Terminate contract handler
  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      setIsSubmitting(true);
      const payload = {
        endDate,
        reason,
        refundAmount: Number(refundAmount),
        penaltyAmount: Number(penaltyAmount)
      };

      await api.post(`/owner/contracts/terminate/${selectedTenant.roomId}`, payload);
      triggerToast(`Đã thanh lý hợp đồng của khách thuê ${selectedTenant.tenantName} tại phòng ${selectedTenant.roomNumber} thành công!`);
      setIsTerminateOpen(false);
      fetchTenants();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi thanh lý hợp đồng.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewRoom = (roomId: number) => {
    setSelectedUnitId(roomId.toString());
    setCurrentPage('owner-unit-detail');
  };

  const getInitials = (name: string) => {
    if (!name) return 'KT';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">

      {/* ===== 1. HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1.5">
            <span className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-gray-700 font-bold">Quản lý Người thuê</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-orange-500">group</span>
            Người thuê trọ
            <span className="ml-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-black">{tenants.length}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Theo dõi và quản lý toàn bộ hợp đồng cư trú của khách thuê.</p>
        </div>
        <button
          onClick={fetchTenants}
          title="Làm mới danh sách"
          className="px-4 py-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-white shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Làm mới
        </button>
      </div>

      {/* ===== 2. METRICS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tổng khách thuê */}
        <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng khách thuê</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Đang quản lý</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        {/* Tài khoản Online */}
        <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tài khoản RoomHub</p>
            <h3 className="text-3xl font-black text-emerald-600">{stats.online}</h3>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-semibold">Liên kết hệ thống</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[22px]">cloud_done</span>
          </div>
        </div>

        {/* Khách ghi tay Offline */}
        <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Khách ghi tay (Offline)</p>
            <h3 className="text-3xl font-black text-blue-600">{stats.offline}</h3>
            <p className="text-[10px] text-blue-500 mt-0.5 font-semibold">Chưa liên kết</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[22px]">person_outline</span>
          </div>
        </div>

        {/* Chờ xác nhận */}
        <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chờ xác nhận</p>
            <h3 className="text-3xl font-black text-amber-600">{stats.pending}</h3>
            <p className="text-[10px] text-amber-500 mt-0.5 font-semibold">Đang mời nhận phòng</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[22px]">hourglass_empty</span>
          </div>
        </div>
      </div>

      {/* ===== 3. FILTER & SEARCH BAR ===== */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-grow max-w-lg">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email hoặc số phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium bg-gray-50/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Building filter */}
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium bg-gray-50/50 cursor-pointer transition-all"
            >
              {buildingList.map((bName) => (
                <option key={bName} value={bName}>
                  {bName === 'Tất cả' ? 'Tất cả Tòa nhà' : bName}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium bg-gray-50/50 cursor-pointer transition-all"
            >
              <option value="Tất cả">Tất cả Trạng thái</option>
              <option value="Đang thuê">Đang hoạt động (Đang ở)</option>
              <option value="Chờ xác nhận">Chờ khách xác nhận</option>
            </select>

            {/* Account Type filter */}
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium bg-gray-50/50 cursor-pointer transition-all"
            >
              <option value="Tất cả">Tất cả Hình thức</option>
              <option value="Online">Tài khoản RoomHub</option>
              <option value="Offline">Khách ghi tay (Offline)</option>
            </select>
          </div>
        </div>

        {/* Filter result count */}
        {(searchQuery || buildingFilter !== 'Tất cả' || statusFilter !== 'Tất cả' || accountFilter !== 'Tất cả') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-500 font-semibold">
              Hiển thị <span className="text-orange-600 font-black">{filteredTenants.length}</span> / {tenants.length} khách thuê
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setBuildingFilter('Tất cả');
                setStatusFilter('Tất cả');
                setAccountFilter('Tất cả');
              }}
              className="text-xs text-gray-400 hover:text-orange-500 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ===== 4. MAIN TABLE ===== */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm font-semibold">Đang tải danh sách người thuê...</p>
          </div>
        ) : error ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] text-red-400">error</span>
            </div>
            <p className="text-red-500 font-bold mb-1">{error}</p>
            <p className="text-xs text-gray-400 mb-4">Vui lòng kiểm tra kết nối mạng và thử lại</p>
            <button
              onClick={fetchTenants}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all active:scale-95 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[48px] text-gray-300 font-light">person_search</span>
            </div>
            <h3 className="text-base font-black text-gray-700 mb-1">Không tìm thấy khách thuê</h3>
            <p className="text-gray-400 max-w-xs text-sm mb-6 leading-relaxed">
              Không có khách thuê nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setBuildingFilter('Tất cả');
                setStatusFilter('Tất cả');
                setAccountFilter('Tất cả');
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">Khách thuê</th>
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">Phòng & Tòa nhà</th>
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">Hợp đồng (Kỳ thuê)</th>
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest text-right">Giá thuê & Cọc</th>
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="px-6 py-3.5 text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredTenants.map((item) => (
                  <tr key={item.contractId} className="hover:bg-orange-50/20 transition-colors duration-150 group">
                    {/* Tenant Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.tenantAvatar ? (
                          <img
                            src={item.tenantAvatar}
                            alt={item.tenantName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 font-black flex items-center justify-center text-xs shadow-sm">
                            {getInitials(item.tenantName)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                            {item.tenantName}
                            {item.isOnline ? (
                              <span
                                title="Tài khoản RoomHub đã liên kết"
                                className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-emerald-200"
                              >
                                Online
                              </span>
                            ) : (
                              <span
                                title="Khách thuê ghi nhận tay"
                                className="inline-flex items-center justify-center bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-gray-200"
                              >
                                Offline
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px] text-gray-400">phone</span>
                              {item.tenantPhone}
                            </span>
                            {item.tenantEmail && (
                              <span className="flex items-center gap-1 text-gray-400">
                                <span className="material-symbols-outlined text-[12px]">mail</span>
                                {item.tenantEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Room & Building */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-orange-500 text-sm">Phòng {item.roomNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-gray-400">apartment</span>
                        {item.buildingName}
                      </div>
                    </td>

                    {/* Lease Dates */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-gray-400">calendar_today</span>
                        {formatDate(item.startDate)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                        đến {formatDate(item.endDate)}
                      </div>
                    </td>

                    {/* Rent & Deposit */}
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-gray-900 text-sm">{formatVND(item.rentAmount)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Cọc: {formatVND(item.depositAmount)}</div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${item.contractStatus === 'Chờ xác nhận'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.contractStatus === 'Chờ xác nhận' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                        {item.contractStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        {/* View Contact */}
                        <button
                          onClick={() => {
                            setSelectedTenant(item);
                            setIsDetailOpen(true);
                          }}
                          title="Xem liên hệ & chi tiết"
                          className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-500 hover:text-orange-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">visibility</span>
                        </button>

                        {/* View Room Details */}
                        <button
                          onClick={() => handleViewRoom(item.roomId)}
                          title="Xem sơ đồ & quản lý phòng"
                          className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">meeting_room</span>
                        </button>

                        {/* Terminate Lease */}
                        <button
                          onClick={() => {
                            setSelectedTenant(item);
                            setEndDate(new Date().toISOString().split('T')[0]);
                            setReason(item.contractStatus === 'Chờ xác nhận' ? 'Thu hồi lời mời nhận phòng' : 'Kết thúc hợp đồng thuê trọ');
                            setRefundAmount(0);
                            setPenaltyAmount(0);
                            setIsTerminateOpen(true);
                          }}
                          title={item.contractStatus === 'Chờ xác nhận' ? "Hủy / Thu hồi lời mời" : "Thanh lý hợp đồng"}
                          className="w-8 h-8 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 text-red-500 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            {item.contractStatus === 'Chờ xác nhận' ? 'cancel' : 'contract_delete'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/40">
              <p className="text-xs text-gray-400 font-semibold">
                Tổng <span className="text-gray-700 font-black">{filteredTenants.length}</span> người thuê đang hiển thị
              </p>
              <p className="text-xs text-gray-400 font-semibold">
                <span className="text-emerald-600 font-black">{stats.online}</span> Online · <span className="text-blue-600 font-black">{stats.offline}</span> Offline
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL 1: TENANT & LEASE DETAIL ===== */}
      {isDetailOpen && selectedTenant && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-7 shadow-2xl relative animate-scaleUp border border-gray-100/80">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-orange-500">contact_page</span>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Chi tiết Khách thuê & Hợp đồng</h3>
                <p className="text-[11px] text-gray-400">Thông tin đầy đủ của khách cư trú</p>
              </div>
            </div>

            {/* Avatar & Profile */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50/50 to-transparent p-4 rounded-2xl border border-orange-100/60 mb-6">
              {selectedTenant.tenantAvatar ? (
                <img
                  src={selectedTenant.tenantAvatar}
                  alt={selectedTenant.tenantName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 font-black flex items-center justify-center text-xl shadow-sm">
                  {getInitials(selectedTenant.tenantName)}
                </div>
              )}
              <div>
                <h4 className="font-black text-gray-900 text-base flex items-center gap-2 flex-wrap">
                  {selectedTenant.tenantName}
                  {selectedTenant.isOnline ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-200">
                      Tài khoản liên kết
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] font-black border border-gray-200">
                      Khách offline
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">phone</span>
                  {selectedTenant.tenantPhone}
                </p>
                {selectedTenant.tenantEmail && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    {selectedTenant.tenantEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Room & Contract specs */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              {[
                { label: 'Tòa nhà', value: selectedTenant.buildingName, icon: 'apartment' },
                { label: 'Số phòng', value: `Phòng ${selectedTenant.roomNumber}`, icon: 'meeting_room', highlight: true },
                { label: 'Ngày bắt đầu', value: formatDate(selectedTenant.startDate), icon: 'calendar_today' },
                { label: 'Kết thúc dự kiến', value: formatDate(selectedTenant.endDate), icon: 'calendar_month' },
                { label: 'Giá thuê phòng', value: formatVND(selectedTenant.rentAmount), icon: 'payments', big: true },
                { label: 'Tiền cọc giữ chân', value: formatVND(selectedTenant.depositAmount), icon: 'savings' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                    {item.label}
                  </label>
                  <p className={`font-bold mt-1 ${item.highlight ? 'text-orange-500' : item.big ? 'text-gray-900 text-base' : 'text-gray-800'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between gap-3">
              <button
                onClick={() => handleViewRoom(selectedTenant.roomId)}
                className="flex-grow py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shadow-orange-200"
              >
                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                Quản lý chi tiết phòng
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL 2: TERMINATE / REVOKE CONTRACT ===== */}
      {isTerminateOpen && selectedTenant && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-md w-full p-7 shadow-2xl relative animate-scaleUp border border-gray-100/80">
            <button
              onClick={() => setIsTerminateOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Modal Header with warning icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] text-red-500">
                  {selectedTenant.contractStatus === 'Chờ xác nhận' ? 'cancel' : 'gavel'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {selectedTenant.contractStatus === 'Chờ xác nhận' ? 'Thu hồi lời mời nhận phòng' : 'Thanh lý hợp đồng thuê'}
                </h3>
                <p className="text-[11px] text-gray-400">Thao tác không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3.5 mb-5">
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                {selectedTenant.contractStatus === 'Chờ xác nhận'
                  ? `Bạn đang thu hồi lời mời tham gia phòng trọ đối với khách thuê ${selectedTenant.tenantName}. Hợp đồng chờ xác nhận này sẽ bị xóa.`
                  : `Thao tác này sẽ chấm dứt hợp đồng thuê của ${selectedTenant.tenantName} tại Phòng ${selectedTenant.roomNumber} (${selectedTenant.buildingName}).`}
              </p>
            </div>

            <form onSubmit={handleTerminateSubmit} className="space-y-4">
              {/* End Date */}
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  Ngày chấm dứt <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  Lý do thanh lý <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  required
                  placeholder="Ví dụ: Hết hạn hợp đồng, chuyển đi, vi phạm nội quy..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 resize-none transition-all"
                />
              </div>

              {selectedTenant.contractStatus !== 'Chờ xác nhận' && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Refund Amount */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Trả lại cọc (VND)</label>
                    <input
                      type="number"
                      value={refundAmount}
                      min={0}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                    />
                  </div>

                  {/* Penalty Amount */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Phí phạt (VND)</label>
                    <input
                      type="number"
                      value={penaltyAmount}
                      min={0}
                      onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTerminateOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm shadow-red-200"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">done</span>
                  )}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST NOTIFICATION ===== */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300 animate-slideIn ${toast.type === 'error'
          ? 'bg-red-50 text-red-700 border-red-100 shadow-red-100'
          : toast.type === 'warning'
            ? 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100'
            : 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100'
          }`}>
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-red-100' : toast.type === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
            </span>
          </div>
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default Tenants;
