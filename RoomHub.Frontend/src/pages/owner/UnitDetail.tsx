import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface UnitDetailProps {
  unitId: string | null;
  setCurrentPage: (page: PageType) => void;
  setSelectedListingId?: (id: number | null) => void;
}

interface TenantData {
  name: string;
  email: string;
  phone: string;
  cccd: string;
  address: string;
  startDate: string;
  endDateExpected: string;
  deposit: number;
  agreementPrice: number;
  peopleCount: number;
  isLinkedAccount: boolean;
  contractStatus?: string;
}

interface InvoiceBill {
  id: string;
  month: string;
  rentPrice: number;
  utilitiesPrice: number;
  total: number;
  status: string;
  dueDate: string;
}

interface RentalListing {
  id: string;
  title: string;
  price: number;
  status: string;
  createdDate: string;
  views: number;
}

interface ActivityLog {
  text: string;
  time: string;
}

const UnitDetail: React.FC<UnitDetailProps> = ({ unitId, setCurrentPage, setSelectedListingId }) => {
  const activeUnitId = unitId || '';
  const unitIdNum = parseInt(activeUnitId, 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [unitStatus, setUnitStatus] = useState<string>('Còn trống');
  const [roomNote, setRoomNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string>('');

  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceBill[]>([]);
  const [listing, setListing] = useState<RentalListing | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isEndTenancyOpen, setIsEndTenancyOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [editMaxCapacity, setEditMaxCapacity] = useState<number>(2);
  const [editWaterBillingType, setEditWaterBillingType] = useState<'PerCubicMeter' | 'PerPerson'>('PerCubicMeter');
  const [editWaterPrice, setEditWaterPrice] = useState<number>(0);
  const [editElectricityPrice, setEditElectricityPrice] = useState<number>(0);
  const [editInternetPrice, setEditInternetPrice] = useState<number>(0);
  const [editGarbagePrice, setEditGarbagePrice] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editArea, setEditArea] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<'not-searched' | 'found' | 'not-found'>('not-searched');
  const [addTenantName, setAddTenantName] = useState('');
  const [addTenantEmail, setAddTenantEmail] = useState('');
  const [addTenantPhone, setAddTenantPhone] = useState('');
  const [addTenantCCCD, setAddTenantCCCD] = useState('');
  const [addTenantAddress, setAddTenantAddress] = useState('');
  const [addTenantStartDate, setAddTenantStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [addTenantEndDate, setAddTenantEndDate] = useState('');
  const [addTenantRent, setAddTenantRent] = useState(0);
  const [addTenantDeposit, setAddTenantDeposit] = useState(0);
  const [addTenantPeopleCount, setAddTenantPeopleCount] = useState(1);
  const [sendZaloNotice, setSendZaloNotice] = useState(true);
  const [createFirstBill, setCreateFirstBill] = useState(false);
  const [autoStatusRented, setAutoStatusRented] = useState(true);
  const [addTenantErrors, setAddTenantErrors] = useState<{ [key: string]: string }>({});
  const [isAddLoading, setIsAddLoading] = useState(false);

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

  const [endTenancyDate, setEndTenancyDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTenancyReason, setEndTenancyReason] = useState('');
  const [markAsVacant, setMarkAsVacant] = useState(true);
  const [hideRelatedListing, setHideRelatedListing] = useState(true);
  const [isEndLoading, setIsEndLoading] = useState(false);

  const [tempStatus, setTempStatus] = useState<string>('Còn trống');

  const fetchDetail = async () => {
    if (!activeUnitId || isNaN(unitIdNum)) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/owner/units/${unitIdNum}`);
      const room = res.data;
      setData(room);
      setUnitStatus(room.status);
      setTempStatus(room.status);
      setSavedNotes(room.internalNotes || '');
      setTenant(room.tenant ? {
        name: room.tenant.name,
        email: room.tenant.email,
        phone: room.tenant.phone,
        cccd: room.tenant.cccd,
        address: room.tenant.address,
        startDate: room.tenant.startDate,
        endDateExpected: room.tenant.endDate || 'Không xác định',
        deposit: room.tenant.deposit,
        agreementPrice: room.tenant.agreementPrice,
        peopleCount: room.tenant.peopleCount || 1,
        isLinkedAccount: room.tenant.isLinkedAccount,
        contractStatus: room.tenant.contractStatus
      } : null);

      setInvoices((room.invoices || []).map((inv: any) => ({
        id: inv.id,
        month: inv.month,
        rentPrice: inv.rentPrice,
        utilitiesPrice: inv.utilitiesPrice,
        total: inv.total,
        status: inv.status,
        dueDate: inv.dueDate
      })));

      setListing(room.listing ? {
        id: room.listing.id,
        title: room.listing.title,
        price: room.listing.price,
        status: room.listing.status,
        createdDate: room.listing.createdDate,
        views: room.listing.views
      } : null);

      setLogs((room.logs || []).map((log: any) => ({
        text: log.text,
        time: log.time
      })));

      setAddTenantRent(room.price || 0);
      setAddTenantDeposit(room.price || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể tải thông tin chi tiết phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddLoading(true);
      await api.put(`/owner/units/${unitIdNum}`, {
        maxCapacity: editMaxCapacity,
        waterBillingType: editWaterBillingType,
        waterPrice: editWaterPrice,
        electricityPrice: editElectricityPrice,
        internetPrice: editInternetPrice,
        garbagePrice: editGarbagePrice,
        price: editPrice,
        area: editArea
      });
      setIsEditDetailsOpen(false);
      triggerToast('Đã cập nhật thông tin phòng thành công!');
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin phòng.', 'error');
    } finally {
      setIsAddLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [activeUnitId]);

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const debtAmount = useMemo(() => {
    if (unitStatus === 'Còn trống' || unitStatus === 'Bảo trì') return 0;
    return invoices
      .filter(inv => inv.status === 'Chưa thanh toán' || inv.status === 'Quá hạn')
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices, unitStatus]);

  const currentMonthBillStatus = useMemo(() => {
    if (unitStatus === 'Còn trống' || unitStatus === 'Bảo trì') return 'Không có';
    const latestInvoice = invoices[0];
    return latestInvoice ? latestInvoice.status : 'Không có';
  }, [invoices, unitStatus]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNote.trim()) return;
    try {
      setIsAddLoading(true);
      await api.post(`/owner/units/${unitIdNum}/notes`, { notes: roomNote });
      setSavedNotes(roomNote);
      const newLog = { text: `Chủ nhà đã cập nhật ghi chú nội bộ phòng: "${roomNote}"`, time: 'Vừa xong' };
      setLogs(prev => [newLog, ...prev]);
      setRoomNote('');
      triggerToast('Ghi chú đã được cập nhật thành công!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Không thể lưu ghi chú.', 'error');
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleMarkInvoicePaid = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    try {
      setIsAddLoading(true);
      await api.post(`/owner/invoices/${id}/payment`, {
        amount: inv.total,
        paymentMethod: 'Cash',
        transactionId: `CASH-${Date.now()}`
      });
      triggerToast(`Đã ghi nhận thanh toán hóa đơn ${id} thành công.`);
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán.', 'error');
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleSearchTenant = async () => {
    if (!searchQuery.trim()) {
      triggerToast('Vui lòng nhập Email hoặc Số điện thoại để tìm kiếm.', 'warning');
      return;
    }
    try {
      setIsAddLoading(true);
      const res = await api.get(`/owner/tenants/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.data) {
        setSearchResult('found');
        setAddTenantName(res.data.fullName || '');
        setAddTenantEmail(res.data.email || '');
        setAddTenantPhone(res.data.phone || '');
        setAddTenantCCCD(res.data.cccd || '');
        setAddTenantAddress(res.data.address || '');
      } else {
        setSearchResult('not-found');
      }
    } catch (err: any) {
      console.error(err);
      setSearchResult('not-found');
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleLinkSearchedUser = () => {
    triggerToast('Đã kết nối tài khoản RoomHub của khách thuê! Thông tin hợp đồng sẽ được liên kết khi bạn bấm "Ký hợp đồng".');
  };

  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!addTenantName.trim()) errs.name = 'Họ và tên không được để trống.';
    if (!addTenantPhone.trim()) errs.phone = 'Số điện thoại không được để trống.';
    if (addTenantPeopleCount > (data?.maxCapacity || 2)) errs.peopleCount = `Phòng này được cấu hình tối đa ${data?.maxCapacity || 2} người. Vui lòng kiểm tra lại.`;
    if (addTenantRent < 0) errs.rent = 'Giá thuê thỏa thuận không được âm.';
    if (addTenantDeposit < 0) errs.deposit = 'Tiền cọc giữ chân không được âm.';

    if (Object.keys(errs).length > 0) {
      setAddTenantErrors(errs);
      return;
    }

    try {
      setIsAddLoading(true);
      const payload = {
        roomId: unitIdNum,
        tenantEmailOrPhone: searchResult === 'found' ? searchQuery : null,
        temporaryTenantName: addTenantName,
        temporaryTenantPhone: addTenantPhone,
        temporaryTenantEmail: addTenantEmail || null,
        startDate: addTenantStartDate,
        endDate: addTenantEndDate || new Date(new Date(addTenantStartDate).setFullYear(new Date(addTenantStartDate).getFullYear() + 1)).toISOString().split('T')[0],
        rentAmount: addTenantRent,
        depositAmount: addTenantDeposit,
        terms: sendZaloNotice ? "Gửi thông báo hợp đồng qua Zalo/Email" : ""
      };

      await api.post('/owner/contracts', payload);
      setIsAddTenantOpen(false);
      triggerToast(`Đã ký kết hợp đồng và thêm người thuê "${addTenantName}" vào phòng ${data?.roomNumber} thành công.`);
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi khởi tạo hợp đồng.', 'error');
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEndTenancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsEndLoading(true);
      const payload = {
        endDate: endTenancyDate,
        reason: endTenancyReason || "Kết thúc hợp đồng thuê trọ",
        refundAmount: 0,
        penaltyAmount: 0
      };

      await api.post(`/owner/contracts/terminate/${unitIdNum}`, payload);
      setIsEndTenancyOpen(false);
      triggerToast(`Đã hoàn tất thủ tục bàn giao thanh lý phòng ${data?.roomNumber}.`);
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi chấm dứt hợp đồng.', 'error');
    } finally {
      setIsEndLoading(false);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddLoading(true);
      await api.put(`/owner/units/${unitIdNum}/status`, { status: tempStatus });
      setUnitStatus(tempStatus);
      const newLog = { text: `Chủ nhà đổi trạng thái phòng sang "${tempStatus}"`, time: 'Vừa xong' };
      setLogs(prev => [newLog, ...prev]);
      setIsChangeStatusOpen(false);
      triggerToast(`Đã đổi trạng thái phòng ${data?.roomNumber} thành "${tempStatus}".`);
      fetchDetail();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái.', 'error');
    } finally {
      setIsAddLoading(false);
    }
  };

  if (!activeUnitId || isNaN(unitIdNum)) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow min-h-[400px] flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[64px] text-primary-container mb-4">info</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Chưa chọn phòng</h2>
        <p className="text-gray-500 max-w-md">Vui lòng quay lại sơ đồ phòng của tòa nhà và chọn phòng chi tiết để tiếp tục quản lý.</p>
        <button 
          onClick={() => setCurrentPage('owner-properties')}
          className="mt-4 px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold transition-all"
        >
          Quản lý sơ đồ phòng
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải thông tin chi tiết phòng...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3 max-w-md mx-auto mt-12 shadow-sm">
        <span className="material-symbols-outlined text-[36px] text-red-500 block">error</span>
        <h3 className="text-sm font-bold">{error || 'Không tìm thấy thông tin phòng này.'}</h3>
        <button onClick={fetchDetail} className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-orange-50 border-orange-200 text-orange-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'warning'}
          </span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}
      
      {/* Breadcrumb Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>Tài sản & Phòng</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>{data.buildingName}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">Phòng {data.roomNumber}</span>
        </div>
        <button 
          onClick={() => setCurrentPage('owner-properties')}
          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Quản lý sơ đồ phòng
        </button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
            Phòng {data.roomNumber}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              unitStatus === 'Còn trống'
                ? 'bg-green-50 text-green-700 border-green-200'
                : unitStatus === 'Đang thuê'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : unitStatus === 'Bảo trì'
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
            }`}>
              {unitStatus === 'Quá hạn' ? 'Hóa đơn quá hạn' : unitStatus}
            </span>
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">corporate_fare</span>
            {data.buildingName} · Tầng {data.floor} · {data.buildingAddress}
          </p>
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">Loại: {data.type}</span>
            <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">Diện tích: {data.area}m²</span>
            <span className="text-xs font-bold text-primary-container bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">Giá: {formatPrice(data.price)}/tháng</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {tenant ? (
            <button 
              onClick={() => setCurrentPage('owner-invoices-create')}
              className="px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">receipt_long</span> Tạo hóa đơn
            </button>
          ) : (
            <button 
              onClick={() => {
                setSearchResult('not-searched');
                setSearchQuery('');
                setAddTenantName('');
                setAddTenantEmail('');
                setAddTenantPhone('');
                setAddTenantCCCD('');
                setAddTenantAddress('');
                setAddTenantRent(data?.price || 0);
                setAddTenantDeposit(data?.price || 0);
                setAddTenantPeopleCount(1);
                setIsAddTenantOpen(true);
              }}
              className="px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">person_add</span> + Thêm người thuê
            </button>
          )}
          <button 
            onClick={() => {
              if (listing) {
                triggerToast(`Tin cho thuê phòng ${data?.roomNumber} hiện đang hiển thị.`, 'warning');
              } else {
                if (setSelectedListingId && data?.id) {
                  setSelectedListingId(parseInt(data.id, 10));
                }
                setCurrentPage('owner-listings-create');
              }
            }}
            className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-orange-100 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span> Đăng tin
          </button>
          <button 
            onClick={() => {
              setTempStatus(unitStatus);
              setIsChangeStatusOpen(true);
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">change_circle</span> Đổi trạng thái
          </button>
          <button 
            onClick={() => {
              setEditMaxCapacity(data?.maxCapacity || 2);
              setEditWaterBillingType(data?.waterBillingType || 'PerCubicMeter');
              setEditWaterPrice(data?.waterPrice || 0);
              setEditElectricityPrice(data?.electricityPrice || 0);
              setEditInternetPrice(data?.internetPrice || 0);
              setEditGarbagePrice(data?.garbagePrice || 0);
              setEditPrice(data?.price || 0);
              setEditArea(data?.area || 0);
              setIsEditDetailsOpen(true);
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:text-primary-container text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span> Sửa thông tin
          </button>
        </div>
      </div>

      {/* Row Overview Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Trạng thái vận hành</p>
          <h4 className="text-sm font-black text-on-surface leading-tight">
            {unitStatus === 'Quá hạn' ? 'Nợ quá hạn' : unitStatus}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Giá thuê trần</p>
          <h4 className="text-sm font-black text-on-surface leading-tight">{formatPrice(data.price)}/th</h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Người thuê hiện tại</p>
          <h4 className="text-sm font-black text-on-surface leading-tight truncate">
            {tenant ? tenant.name : 'Chưa có'}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hóa đơn tháng này</p>
          <h4 className="text-sm font-black text-on-surface leading-tight">
            {currentMonthBillStatus === 'Chưa thanh toán' ? 'Chưa đóng' : currentMonthBillStatus === 'Đã thanh toán' ? 'Đã đóng' : currentMonthBillStatus === 'Quá hạn' ? 'Quá hạn' : 'Chưa chốt'}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Công nợ dư nợ</p>
          <h4 className={`text-sm font-black leading-tight ${debtAmount > 0 ? 'text-red-500' : 'text-on-surface'}`}>
            {formatPrice(debtAmount)}
          </h4>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Room info & invoices list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unit Information Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <h3 className="text-sm font-bold text-on-surface border-b border-gray-100 pb-3 mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">info</span>
              Thông tin phòng / đơn vị chi tiết
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs text-gray-600 font-semibold">
              <div className="space-y-0.5">
                <span className="text-gray-400 text-[10px] uppercase">Mã đơn vị:</span>
                <span className="text-on-surface font-bold block">Phòng {data.roomNumber}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 text-[10px] uppercase">Tòa nhà trực thuộc:</span>
                <span className="text-on-surface font-bold block">{data.buildingName}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 text-[10px] uppercase">Vị trí:</span>
                <span className="text-on-surface font-bold block">Tầng {data.floor}</span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Diện tích sử dụng:</span>
                <span className="text-on-surface font-bold block">{data.area} m²</span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Sức chứa tối đa:</span>
                <span className="text-on-surface font-bold block">{data.maxCapacity} người</span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Nội thất:</span>
                <span className="text-on-surface font-bold block">{data.isFurnished ? 'Có sẵn nội thất' : 'Cơ bản (Trống)'}</span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Đơn giá điện:</span>
                <span className="text-on-surface font-bold block">{formatPrice(data.electricityPrice)}/kWh</span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Đơn giá nước:</span>
                <span className="text-on-surface font-bold block">
                  {formatPrice(data.waterPrice)}/{data.waterBillingType === 'PerPerson' ? 'người' : 'm³'} ({data.waterBillingType === 'PerPerson' ? 'Cố định' : 'Theo khối'})
                </span>
              </div>
              <div className="space-y-0.5 border-t border-gray-50 pt-2.5">
                <span className="text-gray-400 text-[10px] uppercase">Mạng & Rác thải:</span>
                <span className="text-on-surface font-bold block">{formatPrice(data.internetPrice)}/th - {formatPrice(data.garbagePrice)}/th</span>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-5 border-t border-gray-50 pt-4">
              <span className="font-bold text-gray-700">Mô tả phòng:</span> {data.description || 'Chưa cấu hình mô tả chi tiết phòng.'}
            </p>
          </div>

          {/* Recent Invoices Card */}
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Hóa đơn dịch vụ gần đây</h3>
              {tenant && (
                <button 
                  onClick={() => setCurrentPage('owner-invoices-create')}
                  className="text-[10px] font-bold text-primary-container hover:text-orange-600 cursor-pointer"
                >
                  + Tạo hóa đơn mới
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-4">Mã hóa đơn</th>
                    <th className="p-4">Tháng</th>
                    <th className="p-4">Tiền phòng</th>
                    <th className="p-4">Điện nước</th>
                    <th className="p-4">Tổng cộng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xác nhận thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-orange-50/20">
                        <td className="p-4 font-mono text-[10px] text-gray-400">{inv.id}</td>
                        <td className="p-4">{inv.month}</td>
                        <td className="p-4">{formatPrice(inv.rentPrice)}</td>
                        <td className="p-4">{formatPrice(inv.utilitiesPrice)}</td>
                        <td className="p-4 text-primary-container font-black">{formatPrice(inv.total)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            inv.status === 'Đã thanh toán'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : inv.status === 'Chưa thanh toán'
                              ? 'bg-yellow-50 text-yellow-750 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {inv.status !== 'Đã thanh toán' && inv.status !== 'Đã hủy' ? (
                            <button 
                              onClick={() => handleMarkInvoicePaid(inv.id)}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Xác nhận đã thu
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px]">{inv.status === 'Đã hủy' ? 'Hóa đơn đã hủy' : 'Đã đóng đủ'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        Chưa có lịch sử hóa đơn dịch vụ cho phòng này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity / Notes Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">history</span>
              Nhật ký chốt và Ghi chú nội bộ
            </h3>

            {/* Notes Form */}
            <form onSubmit={handleSaveNotes} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Ví dụ: Người thuê báo sẽ chuyển khoản tiền phòng vào cuối tuần..."
                  value={roomNote}
                  onChange={(e) => setRoomNote(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary-container bg-gray-50/50"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Lưu ghi chú
                </button>
              </div>
              {savedNotes && (
                <div className="bg-orange-50/30 border border-orange-100/50 p-3 rounded-xl text-[10px] text-gray-600 font-bold leading-normal">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-0.5">Ghi chú hiện tại:</span>
                  "{savedNotes}"
                </div>
              )}
            </form>

            {/* Timeline logs */}
            <div className="space-y-3.5 border-t border-gray-50 pt-4">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3 text-xs leading-normal items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                  <div className="flex-grow">
                    <span className="font-semibold text-gray-700">{log.text}</span>
                    <span className="text-[10px] text-gray-400 block font-semibold mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Tenant info & related cards */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Current Tenant Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 soft-shadow">
            {tenant ? (
              /* If rented: Show detailed tenant profile */
              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-500 uppercase">Khách thuê hiện tại</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    tenant.contractStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    tenant.isLinkedAccount ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tenant.contractStatus === 'Pending' ? 'Chờ xác nhận' : tenant.isLinkedAccount ? 'RoomHub Linked' : 'Offline'}
                  </span>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-primary-container flex items-center justify-center font-bold text-sm shadow-sm">
                    {tenant.name ? tenant.name.split(' ').slice(-1)[0][0] : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-on-surface truncate">{tenant.name}</h4>
                    <p className="text-[10px] text-gray-500 truncate leading-normal mt-0.5">{tenant.email || 'offline-tenant@roomhub.vn'}</p>
                  </div>
                </div>

                {/* Contract details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-2.5 text-xs text-gray-600 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Điện thoại:</span>
                    <span className="text-on-surface font-bold">{tenant.phone}</span>
                  </div>
                  {tenant.cccd && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số CCCD:</span>
                      <span className="text-on-surface font-bold">{tenant.cccd}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bắt đầu ở:</span>
                    <span className="text-on-surface">{tenant.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hạn hợp đồng:</span>
                    <span className="text-on-surface">{tenant.endDateExpected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tiền đặt cọc:</span>
                    <span className="text-on-surface">{formatPrice(tenant.deposit)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200/50 pt-2 font-bold">
                    <span className="text-gray-400">Giá thuê:</span>
                    <span className="text-primary-container">{formatPrice(tenant.agreementPrice)}/th</span>
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                  {tenant.contractStatus === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => triggerToast(`Đã gửi lại lời mời nhận phòng tới khách hàng ${tenant.name} thành công!`)}
                        className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors active:scale-95"
                      >
                        Gửi lại lời mời nhận phòng
                      </button>
                      <button 
                        onClick={() => {
                          setEndTenancyDate(new Date().toISOString().split('T')[0]);
                          setEndTenancyReason('Chủ trọ hủy lời mời nhận phòng.');
                          setIsEndTenancyOpen(true);
                        }}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors active:scale-95"
                      >
                        Hủy lời mời (Thu hồi)
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => triggerToast(`Gửi thông báo nhắc nợ ZNS tới khách thuê ${tenant.name} thành công!`)}
                        className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors active:scale-95"
                      >
                        Gửi thông báo ZNS
                      </button>
                      <button 
                        onClick={() => {
                          setEndTenancyDate(new Date().toISOString().split('T')[0]);
                          setEndTenancyReason('');
                          setIsEndTenancyOpen(true);
                        }}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-colors active:scale-95"
                      >
                        Kết thúc hợp đồng (Trả phòng)
                      </button>
                    </>
                  )}
                </div>

              </div>
            ) : (
              /* If vacant: Show beautiful empty prompt */
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">person_add</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-on-surface">Phòng hiện đang trống</h4>
                  <p className="text-[10px] text-gray-500 leading-normal max-w-[180px] mx-auto">
                    Hiện chưa có khách thuê trong phòng trọ này. Đăng tin hoặc liên kết hợp đồng để bắt đầu vận hành.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSearchResult('not-searched');
                    setSearchQuery('');
                    setAddTenantName('');
                    setAddTenantEmail('');
                    setAddTenantPhone('');
                    setAddTenantCCCD('');
                    setAddTenantAddress('');
                    setAddTenantRent(data?.price || 0);
                    setAddTenantDeposit(data?.price || 0);
                    setAddTenantPeopleCount(1);
                    setIsAddTenantOpen(true);
                  }}
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer mx-auto flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">add</span> Thêm người thuê
                </button>
              </div>
            )}
          </div>

          {/* Rental Listing Related Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 soft-shadow">
            {listing ? (
              <div className="space-y-3.5">
                <div className="border-b border-gray-50 pb-2.5 flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-500 uppercase">Tin cho thuê liên quan</h3>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded">
                    {listing.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface line-clamp-2">{listing.title}</h4>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mt-2.5">
                    <span>Tạo ngày: {listing.createdDate}</span>
                    <span className="text-gray-600 font-bold">{listing.views} lượt xem</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-50 text-[10px] font-bold">
                  <button 
                    onClick={() => setCurrentPage('owner-listings')}
                    className="flex-grow py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-center cursor-pointer"
                  >
                    Xem bài viết
                  </button>
                  <button 
                    onClick={() => setCurrentPage('owner-listings')}
                    className="flex-grow py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-center cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3 animate-scaleUp">
                <p className="text-[10px] text-gray-500 font-semibold">Chưa có tin cho thuê liên kết</p>
                <button 
                  onClick={() => {
                    if (setSelectedListingId && data?.id) {
                      setSelectedListingId(parseInt(data.id, 10));
                    }
                    setCurrentPage('owner-listings-create');
                  }}
                  className="px-4 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary-container text-[10px] font-bold rounded-lg transition-all border border-orange-100 cursor-pointer mx-auto block active:scale-95"
                >
                  + Tạo tin cho thuê
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 soft-shadow space-y-3">
            <h3 className="text-xs font-black text-gray-500 uppercase border-b border-gray-50 pb-2">Thao tác vận hành</h3>
            <div className="flex flex-col gap-2">
              {!tenant && (
                <button 
                  onClick={() => {
                    setSearchResult('not-searched');
                    setSearchQuery('');
                    setAddTenantName('');
                    setAddTenantEmail('');
                    setAddTenantPhone('');
                    setAddTenantCCCD('');
                    setAddTenantAddress('');
                    setAddTenantRent(data?.price || 0);
                    setAddTenantDeposit(data?.price || 0);
                    setAddTenantPeopleCount(1);
                    setIsAddTenantOpen(true);
                  }}
                  className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span> + Ký hợp đồng khách thuê
                </button>
              )}
              {tenant && (
                <button 
                  onClick={() => setCurrentPage('owner-invoices-create')}
                  className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span> Chốt tiền & Tạo hóa đơn
                </button>
              )}
              <button 
                onClick={() => {
                  setTempStatus(unitStatus);
                  setIsChangeStatusOpen(true);
                }}
                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">change_circle</span> Đổi trạng thái phòng
              </button>
              <button 
                onClick={async () => {
                  try {
                    setIsAddLoading(true);
                    await api.put(`/owner/units/${unitIdNum}/status`, { status: 'Bảo trì' });
                    setUnitStatus('Bảo trì');
                    triggerToast(`Đã đưa phòng ${data.roomNumber} sang trạng thái "Bảo trì".`);
                    fetchDetail();
                  } catch (err: any) {
                    console.error(err);
                    triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi đưa phòng vào bảo trì.', 'error');
                  } finally {
                    setIsAddLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-400">construction</span> Đánh dấu bảo trì sửa chữa
              </button>
              {tenant && (
                <button 
                  onClick={() => {
                    setEndTenancyDate(new Date().toISOString().split('T')[0]);
                    setEndTenancyReason('');
                    setIsEndTenancyOpen(true);
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span> Kết thúc hợp đồng (Trả phòng)
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 1. ADD TENANT MODAL */}
      {isAddTenantOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-3xl overflow-hidden my-8 animate-scaleUp max-h-[90vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">person_add</span>
                  Thêm người thuê mới - Hợp đồng phòng {data.roomNumber}
                </h3>
                <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Khởi tạo hồ sơ khách thuê và chốt kỳ tiền cọc.</p>
              </div>
              <button 
                onClick={() => setIsAddTenantOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-orange-100/30 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddTenantSubmit} className="p-6 overflow-y-auto space-y-5 text-xs font-bold text-gray-500 flex-grow">
              
              {/* SECTION 1: SEARCH ROOMHUB ACCOUNT */}
              <div className="space-y-3.5 border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black text-primary-container uppercase block">1. Tìm kiếm & liên kết tài khoản RoomHub</span>
                
                <div className="flex gap-2">
                  <div className="flex-grow relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Nhập email hoặc số điện thoại của người thuê (Ví dụ: nguyenvana@gmail.com)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleSearchTenant}
                    className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Tìm tài khoản
                  </button>
                </div>

                {/* Search result simulator displays */}
                {searchResult === 'found' && (
                  <div className="bg-blue-50 border border-blue-150 p-4 rounded-2xl flex items-center justify-between animate-scaleUp">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {addTenantName ? addTenantName.split(' ').slice(-1)[0][0] : 'U'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-semibold leading-normal">
                        <span className="text-xs font-black text-on-surface block leading-tight">{addTenantName}</span>
                        {addTenantEmail} · {addTenantPhone}
                        <span className="bg-blue-200 text-blue-800 font-bold px-1.5 py-0.25 rounded text-[8px] uppercase inline-block ml-2">Đã xác minh</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleLinkSearchedUser}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Liên kết tài khoản
                    </button>
                  </div>
                )}

                {searchResult === 'not-found' && (
                  <div className="bg-yellow-50 border border-yellow-150 p-3.5 rounded-2xl text-[10px] text-gray-600 leading-normal flex items-start gap-2 animate-scaleUp">
                    <span className="material-symbols-outlined text-yellow-600 text-[18px] shrink-0 mt-0.5">info</span>
                    <p className="font-semibold">
                      Không tìm thấy tài khoản RoomHub trùng khớp. Hệ thống sẽ **tự động chốt hồ sơ khách thuê này ở dạng Offline**. Bạn vẫn có thể xuất và chốt tiền gửi hóa đơn Zalo/Email bình thường.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 2: BASIC INFOMATION */}
              <div className="space-y-3.5 border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black text-primary-container uppercase block">2. Hồ sơ cá nhân khách thuê trọ</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase">Họ và tên khách thuê <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Nhập đầy đủ họ và tên" 
                      value={addTenantName}
                      onChange={(e) => setAddTenantName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                        addTenantErrors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`}
                    />
                    {addTenantErrors.name && <p className="text-[10px] text-red-500 mt-1">{addTenantErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Nhập số điện thoại" 
                      value={addTenantPhone}
                      onChange={(e) => setAddTenantPhone(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                        addTenantErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`}
                    />
                    {addTenantErrors.phone && <p className="text-[10px] text-red-500 mt-1">{addTenantErrors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Địa chỉ Email (Nhận hóa đơn)</label>
                    <input 
                      type="email" 
                      placeholder="Nhập địa chỉ Email nếu có" 
                      value={addTenantEmail}
                      onChange={(e) => setAddTenantEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Số CCCD / CMND</label>
                    <input 
                      type="text" 
                      placeholder="Nhập số chứng minh thư" 
                      value={addTenantCCCD}
                      onChange={(e) => setAddTenantCCCD(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="uppercase">Địa chỉ liên hệ thường trú</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Liên Chiểu, Đà Nẵng..." 
                      value={addTenantAddress}
                      onChange={(e) => setAddTenantAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: RENTAL CONTRACT */}
              <div className="space-y-3.5 border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black text-primary-container uppercase block">3. Thiết lập hợp đồng thuê & cọc</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase">Ngày bắt đầu hợp đồng <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={addTenantStartDate}
                      onChange={(e) => setAddTenantStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Ngày kết thúc dự kiến</label>
                    <input 
                      type="date" 
                      value={addTenantEndDate}
                      onChange={(e) => setAddTenantEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Giá thuê thỏa thuận <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={addTenantRent}
                        onChange={(e) => setAddTenantRent(parseInt(e.target.value, 10) || 0)}
                        className={`w-full pl-3 pr-16 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                          addTenantErrors.rent ? 'border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`} 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ/tháng</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Tiền đặt cọc giữ chân</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={addTenantDeposit}
                        onChange={(e) => setAddTenantDeposit(parseInt(e.target.value, 10) || 0)}
                        className={`w-full pl-3 pr-16 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                          addTenantErrors.deposit ? 'border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`} 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Số lượng người lưu trú <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      value={addTenantPeopleCount}
                      onChange={(e) => setAddTenantPeopleCount(parseInt(e.target.value, 10) || 1)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                        addTenantErrors.peopleCount ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`} 
                    />
                  </div>

                </div>

                {/* Sức chứa validation alert */}
                {addTenantPeopleCount > (data?.maxCapacity || 2) && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center gap-2 text-red-600 animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="text-[10px] font-black uppercase">{addTenantErrors.peopleCount || `Số lượng người ở vượt quá giới hạn thiết lập tối đa (${data?.maxCapacity} người) của phòng này!`}</span>
                  </div>
                )}
              </div>

              {/* SECTION 4: AUTOMATION */}
              <div className="space-y-2 text-xs font-bold text-gray-600">
                <span className="text-[11px] font-black text-primary-container uppercase block mb-1">4. Thiết lập gửi thông báo & hóa đơn</span>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="notice1" 
                    checked={sendZaloNotice}
                    onChange={(e) => setSendZaloNotice(e.target.checked)}
                    className="w-4 h-4 text-primary-container accent-primary-container" 
                  />
                  <label htmlFor="notice1" className="cursor-pointer select-none">Tự động gửi thông tin hợp đồng chốt cọc qua Zalo/Email cho khách.</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="notice2" 
                    checked={createFirstBill}
                    onChange={(e) => setCreateFirstBill(e.target.checked)}
                    className="w-4 h-4 text-primary-container accent-primary-container" 
                  />
                  <label htmlFor="notice2" className="cursor-pointer select-none">Tạo ngay hóa đơn tạm đóng kỳ đầu tiên (tiền cọc + tiền phòng tháng đầu).</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="notice3" 
                    checked={autoStatusRented}
                    onChange={(e) => setAutoStatusRented(e.target.checked)}
                    className="w-4 h-4 text-primary-container accent-primary-container" 
                  />
                  <label htmlFor="notice3" className="cursor-pointer select-none">Tự động chuyển đổi trạng thái phòng {data.roomNumber} sang **"Đang thuê"** ngay sau khi lưu.</label>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsAddTenantOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={handleAddTenantSubmit}
                className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Ký hợp đồng khách thuê
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. END TENANCY MODAL */}
      {isEndTenancyOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-md overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">logout</span>
                Kết thúc hợp đồng - Trả phòng {data.roomNumber}
              </h3>
              <button 
                onClick={() => setIsEndTenancyOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-red-100/30 flex items-center justify-center text-gray-400 hover:text-red-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEndTenancySubmit} className="p-6 space-y-4 text-xs font-bold text-gray-500">
              
              <div className="space-y-1">
                <label className="uppercase">Ngày chính thức dọn đi</label>
                <input 
                  type="date" 
                  value={endTenancyDate}
                  onChange={(e) => setEndTenancyDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Lý do chấm dứt / Ghi chú bàn giao</label>
                <textarea 
                  rows={2}
                  placeholder="Ví dụ: Khách dọn đi do đi làm xa, bàn giao đầy đủ chìa khóa, điện nước..."
                  value={endTenancyReason}
                  onChange={(e) => setEndTenancyReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                />
              </div>

              {/* Options */}
              <div className="space-y-2 text-gray-600 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="endOpt1" 
                    checked={markAsVacant}
                    onChange={(e) => setMarkAsVacant(e.target.checked)}
                    className="w-4 h-4 text-primary-container accent-primary-container" 
                  />
                  <label htmlFor="endOpt1" className="cursor-pointer select-none">Tự động chuyển đổi trạng thái phòng về **"Còn trống"** sau khi chấm dứt.</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="endOpt2" 
                    checked={hideRelatedListing}
                    onChange={(e) => setHideRelatedListing(e.target.checked)}
                    className="w-4 h-4 text-primary-container accent-primary-container" 
                  />
                  <label htmlFor="endOpt2" className="cursor-pointer select-none">Ẩn tin đăng tuyển khách trực tuyến liên kết nếu có.</label>
                </div>
              </div>

              <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-2xl flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">warning</span>
                <p className="text-[10px] leading-normal font-semibold">
                  Hành động này sẽ lưu trữ thông tin hợp đồng hiện tại và đánh dấu khách thuê **{tenant?.name}** ở trạng thái "Đã rời đi". Hãy kiểm tra kỹ công nợ dịch vụ trước khi trả phòng.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEndTenancyOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Xác nhận kết thúc thuê
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. CHANGE STATUS MODAL */}
      {isChangeStatusOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-sm overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">change_circle</span>
                Đổi trạng thái phòng {data.roomNumber}
              </h3>
              <button 
                onClick={() => setIsChangeStatusOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-orange-100/30 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStatus} className="p-6 space-y-4 text-xs font-bold text-gray-500">
              
              <div className="space-y-1">
                <label className="uppercase">Chọn trạng thái vận hành mới</label>
                <select 
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                >
                  <option value="Còn trống">Còn trống (Sẵn sàng đón khách)</option>
                  <option value="Đang thuê">Đang thuê (Hợp đồng đang chạy)</option>
                  <option value="Bảo trì">Bảo trì (Đang sửa chữa, sửa sang)</option>
                </select>
              </div>

              <div className="bg-orange-50/30 border border-orange-100/50 p-3 rounded-2xl flex items-start gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">info</span>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  Cập nhật trạng thái trực tiếp sẽ đồng bộ sơ đồ grid tầng tại toà nhà. Hãy đảm bảo thông số hợp đồng và cọc khớp với cấu hình thực tế.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsChangeStatusOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT ROOM DETAILS MODAL */}
      {isEditDetailsOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-lg overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">edit</span>
                Sửa thông tin chi tiết phòng {data?.roomNumber}
              </h3>
              <button 
                onClick={() => setIsEditDetailsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-orange-100/30 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateDetails} className="p-6 space-y-4 text-xs font-bold text-gray-500">
              
              <div className="grid grid-cols-2 gap-4">
                {/* MaxCapacity */}
                <div className="space-y-1">
                  <label className="uppercase">Sức chứa tối đa (người) *</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={editMaxCapacity}
                    onChange={(e) => setEditMaxCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>

                {/* Area */}
                <div className="space-y-1">
                  <label className="uppercase">Diện tích sử dụng (m²)</label>
                  <input 
                    type="number"
                    value={editArea}
                    onChange={(e) => setEditArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>

                {/* Base Price */}
                <div className="space-y-1">
                  <label className="uppercase">Giá thuê phòng mặc định (đ/tháng) *</label>
                  <input 
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>

                {/* Electricity Price */}
                <div className="space-y-1">
                  <label className="uppercase">Đơn giá điện (đ/kWh) *</label>
                  <input 
                    type="number"
                    value={editElectricityPrice}
                    onChange={(e) => setEditElectricityPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>

                {/* Water Billing Type */}
                <div className="space-y-1">
                  <label className="uppercase">Hình thức tính tiền nước</label>
                  <select 
                    value={editWaterBillingType}
                    onChange={(e) => setEditWaterBillingType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                  >
                    <option value="PerCubicMeter">Tính theo mét khối (đ/m³)</option>
                    <option value="PerPerson">Tính cố định theo đầu người (đ/người)</option>
                  </select>
                </div>

                {/* Water Price */}
                <div className="space-y-1">
                  <label className="uppercase">Đơn giá nước *</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={editWaterPrice}
                      onChange={(e) => setEditWaterPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {editWaterBillingType === 'PerCubicMeter' ? 'đ/m³' : 'đ/người'}
                    </span>
                  </div>
                </div>

                {/* Internet Price */}
                <div className="space-y-1">
                  <label className="uppercase">Phí mạng Internet (đ/tháng)</label>
                  <input 
                    type="number"
                    value={editInternetPrice}
                    onChange={(e) => setEditInternetPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>

                {/* Garbage Price */}
                <div className="space-y-1">
                  <label className="uppercase">Phí rác & dịch vụ (đ/tháng)</label>
                  <input 
                    type="number"
                    value={editGarbagePrice}
                    onChange={(e) => setEditGarbagePrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-white"
                  />
                </div>
              </div>

              <div className="bg-orange-50/30 border border-orange-100/50 p-3 rounded-2xl flex items-start gap-2 mt-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">info</span>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  Thay đổi các cấu hình đơn giá hoặc sức chứa của phòng sẽ được áp dụng ngay cho kỳ chốt hóa đơn tiếp theo mà không làm thay đổi các kỳ trước đó.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsEditDetailsOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Lưu thông tin phòng
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL SPINNERS FOR SIMULATIONS */}
      {isAddLoading && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2100] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col items-center justify-center space-y-3 animate-scaleUp">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
            <p className="text-xs font-bold text-gray-600">Đang khởi tạo hợp đồng khách thuê...</p>
          </div>
        </div>
      )}

      {isEndLoading && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2100] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col items-center justify-center space-y-3 animate-scaleUp">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-red-500 animate-spin"></div>
            <p className="text-xs font-bold text-gray-600">Đang bàn giao và thanh lý hợp đồng...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UnitDetail;
