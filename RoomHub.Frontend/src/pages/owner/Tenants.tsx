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
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow flex items-center justify-between transition-all hover:translate-y-[-2px]">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng khách thuê</p>
            <h3 className="text-3xl font-extrabold text-on-surface">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow flex items-center justify-between transition-all hover:translate-y-[-2px]">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tài khoản RoomHub</p>
            <h3 className="text-3xl font-extrabold text-green-600">{stats.online}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-[24px]">cloud_done</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow flex items-center justify-between transition-all hover:translate-y-[-2px]">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Khách ghi tay (Offline)</p>
            <h3 className="text-3xl font-extrabold text-blue-600">{stats.offline}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[24px]">person_outline</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow flex items-center justify-between transition-all hover:translate-y-[-2px]">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Chờ xác nhận</p>
            <h3 className="text-3xl font-extrabold text-amber-600">{stats.pending}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[24px]">hourglass_empty</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-grow max-w-lg">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email hoặc số phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-container text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Building filter */}
            <div className="flex flex-col">
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-container text-sm bg-white cursor-pointer"
              >
                {buildingList.map((bName) => (
                  <option key={bName} value={bName}>
                    {bName === 'Tất cả' ? 'Tất cả Tòa nhà' : bName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex flex-col">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-container text-sm bg-white cursor-pointer"
              >
                <option value="Tất cả">Tất cả Trạng thái</option>
                <option value="Đang thuê">Đang hoạt động (Đang ở)</option>
                <option value="Chờ xác nhận">Chờ khách xác nhận</option>
              </select>
            </div>

            {/* Account Type filter */}
            <div className="flex flex-col">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-container text-sm bg-white cursor-pointer"
              >
                <option value="Tất cả">Tất cả Hình thức</option>
                <option value="Online">Tài khoản RoomHub</option>
                <option value="Offline">Khách ghi tay (Offline)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-container mb-4"></div>
            <p className="text-gray-500 text-sm">Đang tải danh sách người thuê...</p>
          </div>
        ) : error ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[48px] text-red-400 mb-4">error</span>
            <p className="text-red-500 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchTenants}
              className="px-5 py-2 bg-primary-container text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[64px] text-gray-300 mb-4 font-light">person_search</span>
            <h3 className="text-lg font-bold text-on-surface mb-1">Không tìm thấy khách thuê</h3>
            <p className="text-gray-500 max-w-sm text-sm mb-6">
              Không tìm thấy khách thuê nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setBuildingFilter('Tất cả');
                setStatusFilter('Tất cả');
                setAccountFilter('Tất cả');
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-6 py-4">Khách thuê</th>
                  <th className="px-6 py-4">Phòng & Tòa nhà</th>
                  <th className="px-6 py-4">Hợp đồng (Kỳ thuê)</th>
                  <th className="px-6 py-4 text-right">Giá thuê & Cọc</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-on-surface">
                {filteredTenants.map((item) => (
                  <tr key={item.contractId} className="hover:bg-gray-50/50 transition-colors">
                    {/* Tenant Info */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        {item.tenantAvatar ? (
                          <img
                            src={item.tenantAvatar}
                            alt={item.tenantName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs border border-orange-200">
                            {getInitials(item.tenantName)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {item.tenantName}
                            {item.isOnline ? (
                              <span 
                                title="Tài khoản RoomHub đã liên kết" 
                                className="inline-flex items-center justify-center bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-200"
                              >
                                Online
                              </span>
                            ) : (
                              <span 
                                title="Khách thuê ghi nhận tay" 
                                className="inline-flex items-center justify-center bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-bold border border-gray-200"
                              >
                                Offline
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex flex-col">
                            <span>{item.tenantPhone}</span>
                            {item.tenantEmail && <span className="opacity-80">{item.tenantEmail}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Room & Building */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-primary-container">
                        Phòng {item.roomNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.buildingName}
                      </div>
                    </td>

                    {/* Lease Dates */}
                    <td className="px-6 py-4.5">
                      <div className="text-xs font-medium text-gray-700">
                        Từ: {formatDate(item.startDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Đến: {formatDate(item.endDate)}
                      </div>
                    </td>

                    {/* Rent & Deposit */}
                    <td className="px-6 py-4.5 text-right font-medium">
                      <div className="text-gray-900 font-semibold">{formatVND(item.rentAmount)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Cọc: {formatVND(item.depositAmount)}</div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.contractStatus === 'Chờ xác nhận'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.contractStatus === 'Chờ xác nhận' ? 'bg-amber-500' : 'bg-green-500'}`} />
                        {item.contractStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Contact */}
                        <button
                          onClick={() => {
                            setSelectedTenant(item);
                            setIsDetailOpen(true);
                          }}
                          title="Xem liên hệ & chi tiết"
                          className="w-8.5 h-8.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-all hover:text-primary-container active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>

                        {/* View Room Details */}
                        <button
                          onClick={() => handleViewRoom(item.roomId)}
                          title="Xem sơ đồ & quản lý phòng"
                          className="w-8.5 h-8.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-all hover:text-primary-container active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">meeting_room</span>
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
                          className="w-8.5 h-8.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {item.contractStatus === 'Chờ xác nhận' ? 'cancel' : 'contract_delete'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: TENANT & LEASE DETAIL */}
      {isDetailOpen && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 soft-shadow relative animate-scale-up border border-gray-100">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">info</span>
              Chi tiết Khách thuê & Hợp đồng
            </h3>

            {/* Avatar & Profile */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              {selectedTenant.tenantAvatar ? (
                <img
                  src={selectedTenant.tenantAvatar}
                  alt={selectedTenant.tenantName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg border border-orange-200">
                  {getInitials(selectedTenant.tenantName)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  {selectedTenant.tenantName}
                  {selectedTenant.isOnline ? (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">
                      Tài khoản liên kết
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">
                      Khách offline
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px]">phone</span> {selectedTenant.tenantPhone}
                </p>
                {selectedTenant.tenantEmail && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">mail</span> {selectedTenant.tenantEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Room & Contract specs */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Tòa nhà</label>
                <p className="font-semibold text-gray-800 mt-0.5">{selectedTenant.buildingName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Số phòng</label>
                <p className="font-semibold text-primary-container mt-0.5">Phòng {selectedTenant.roomNumber}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Ngày bắt đầu</label>
                <p className="font-medium text-gray-800 mt-0.5">{formatDate(selectedTenant.startDate)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Ngày kết thúc dự kiến</label>
                <p className="font-medium text-gray-800 mt-0.5">{formatDate(selectedTenant.endDate)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Giá thuê phòng</label>
                <p className="font-bold text-gray-900 mt-0.5 text-base">{formatVND(selectedTenant.rentAmount)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium uppercase">Tiền cọc cọc giữ chân</label>
                <p className="font-semibold text-gray-900 mt-0.5">{formatVND(selectedTenant.depositAmount)}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between gap-3">
              <button
                onClick={() => handleViewRoom(selectedTenant.roomId)}
                className="flex-grow py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">meeting_room</span> Quản lý chi tiết phòng
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TERMINATE / REVOKE CONTRACT */}
      {isTerminateOpen && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 soft-shadow relative animate-scale-up border border-gray-100">
            <button
              onClick={() => setIsTerminateOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">
                {selectedTenant.contractStatus === 'Chờ xác nhận' ? 'cancel' : 'gavel'}
              </span>
              {selectedTenant.contractStatus === 'Chờ xác nhận' ? 'Thu hồi lời mời nhận phòng' : 'Thanh lý hợp đồng thuê'}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {selectedTenant.contractStatus === 'Chờ xác nhận'
                ? `Bạn đang thu hồi lời mời tham gia phòng trọ đối với khách thuê ${selectedTenant.tenantName}. Hợp đồng chờ xác nhận này sẽ bị xóa.`
                : `Thao tác này sẽ chấm dứt hợp đồng thuê của ${selectedTenant.tenantName} tại Phòng ${selectedTenant.roomNumber} (${selectedTenant.buildingName}).`}
            </p>

            <form onSubmit={handleTerminateSubmit} className="space-y-4">
              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Ngày chấm dứt *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Lý do thanh lý *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  required
                  placeholder="Ví dụ: Hết hạn hợp đồng, chuyển đi, vi phạm nội quy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {selectedTenant.contractStatus !== 'Chờ xác nhận' && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Refund Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Trả lại cọc (VND)</label>
                    <input
                      type="number"
                      value={refundAmount}
                      min={0}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Penalty Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Phí phạt (VND)</label>
                    <input
                      type="number"
                      value={penaltyAmount}
                      min={0}
                      onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTerminateOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
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

      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-100' 
            : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          <span className="font-medium">{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default Tenants;
