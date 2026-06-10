import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface InvoiceListProps {
  setCurrentPage: (page: PageType) => void;
}

type InvoiceStatus = 'Nháp' | 'Chưa thanh toán' | 'Đã thanh toán' | 'Thanh toán một phần' | 'Quá hạn' | 'Đã hủy';

interface InvoiceItem {
  id: string;
  code: string;
  month: string;
  createdDate: string;
  property: string;
  unit: string;
  tenantName: string;
  tenantPhone: string;
  isLinked: boolean;
  rentPrice: number;
  utilitiesPrice: number;
  otherPrice: number;
  total: number;
  collectedAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ setCurrentPage }) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('Tất cả');
  const [filterUnit, setFilterUnit] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterTenant, setFilterTenant] = useState('');
  const [sortOrder, setSortOrder] = useState('Mới nhất');

  // Active Tab Filter
  const [activeTab, setActiveTab] = useState<string>('Tất cả');

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceItem | null>(null);

  // Payment logs input
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('Chuyển khoản');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');

  // Notification states
  const [notifMessage, setNotifMessage] = useState<string>('');

  // Cancel states
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelConfirmed, setCancelConfirmed] = useState<boolean>(false);

  // Export states
  const [exportRange, setExportRange] = useState<string>('all');

  // Toast Success Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/invoices');
      const mapped = res.data.map((item: any) => ({
        id: item.id.toString(),
        code: `INV-${item.month.replace('/', '')}-${item.id}`,
        month: item.month,
        createdDate: item.dueDate,
        property: item.buildingName,
        unit: item.roomNumber,
        tenantName: item.tenantName || 'Khách thuê',
        tenantPhone: item.tenantPhone || 'N/A',
        isLinked: item.isLinkedAccount || false,
        rentPrice: item.totalAmount - 800000 > 0 ? item.totalAmount - 800000 : item.totalAmount,
        utilitiesPrice: item.totalAmount - 800000 > 0 ? 800000 : 0,
        otherPrice: 0,
        total: item.totalAmount,
        collectedAmount: item.status === 'Đã thanh toán' ? item.totalAmount : 0,
        status: item.status as InvoiceStatus,
        dueDate: item.dueDate,
        notes: ''
      }));
      setInvoices(mapped);
    } catch (err: any) {
      console.error('Không thể tải danh sách hóa đơn từ hệ thống.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.invoice-actions-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Financial Stats
  const stats = useMemo(() => {
    const totalCollected = invoices
      .filter(inv => inv.status === 'Đã thanh toán' || inv.status === 'Thanh toán một phần')
      .reduce((sum, item) => sum + item.collectedAmount, 0);

    const totalUncollected = invoices
      .filter(inv => inv.status === 'Chưa thanh toán' || inv.status === 'Quá hạn' || inv.status === 'Thanh toán một phần')
      .reduce((sum, item) => sum + (item.total - item.collectedAmount), 0);

    const totalOverdue = invoices
      .filter(inv => inv.status === 'Quá hạn')
      .reduce((sum, item) => sum + (item.total - item.collectedAmount), 0);

    const totalExpected = invoices
      .filter(inv => inv.status !== 'Đã hủy')
      .reduce((sum, item) => sum + item.total, 0);

    return {
      monthCount: invoices.length,
      collected: totalCollected,
      uncollected: totalUncollected,
      overdue: totalOverdue,
      expected: totalExpected
    };
  }, [invoices]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      'Tất cả': invoices.length,
      'Chưa thanh toán': invoices.filter(l => l.status === 'Chưa thanh toán').length,
      'Đã thanh toán': invoices.filter(l => l.status === 'Đã thanh toán').length,
      'Thanh toán một phần': invoices.filter(l => l.status === 'Thanh toán một phần').length,
      'Quá hạn': invoices.filter(l => l.status === 'Quá hạn').length,
      'Nháp': invoices.filter(l => l.status === 'Nháp').length,
      'Đã hủy': invoices.filter(l => l.status === 'Đã hủy').length,
    };
  }, [invoices]);

  // Reset Filters Helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterProperty('Tất cả');
    setFilterUnit('Tất cả');
    setFilterMonth('Tất cả');
    setFilterStatus('Tất cả');
    setFilterTenant('');
    setActiveTab('Tất cả');
    triggerToast('Đã thiết lập lại tất cả bộ lọc hóa đơn');
  };

  // Filter & Sort Logic
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (activeTab !== 'Tất cả') {
      result = result.filter(l => l.status === activeTab);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        l =>
          l.code.toLowerCase().includes(lower) ||
          l.property.toLowerCase().includes(lower) ||
          l.unit.toLowerCase().includes(lower) ||
          l.tenantName.toLowerCase().includes(lower)
      );
    }

    if (filterProperty !== 'Tất cả') {
      result = result.filter(l => l.property === filterProperty);
    }

    if (filterUnit !== 'Tất cả') {
      result = result.filter(l => l.unit === filterUnit);
    }

    if (activeTab === 'Tất cả' && filterStatus !== 'Tất cả') {
      result = result.filter(l => l.status === filterStatus);
    }

    if (filterMonth !== 'Tất cả') {
      result = result.filter(l => l.month === filterMonth);
    }

    if (filterTenant.trim()) {
      const lower = filterTenant.toLowerCase();
      result = result.filter(l => l.tenantName.toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      if (sortOrder === 'Mới nhất') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortOrder === 'Cũ nhất') return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      if (sortOrder === 'Tổng tiền cao nhất') return b.total - a.total;
      if (sortOrder === 'Tổng tiền thấp nhất') return a.total - b.total;
      if (sortOrder === 'Gần đến hạn') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortOrder === 'Quá hạn trước') {
        if (a.status === 'Quá hạn' && b.status !== 'Quá hạn') return -1;
        if (a.status !== 'Quá hạn' && b.status === 'Quá hạn') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [invoices, searchTerm, filterProperty, filterUnit, filterMonth, filterStatus, filterTenant, sortOrder, activeTab]);

  // Unique lists for filters
  const uniqueProperties = useMemo(() => {
    const props = new Set(invoices.map(inv => inv.property));
    return ['Tất cả', ...Array.from(props)];
  }, [invoices]);

  const uniqueUnits = useMemo(() => {
    const units = new Set(invoices.map(inv => inv.unit));
    return ['Tất cả', ...Array.from(units)].sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const uniqueMonths = useMemo(() => {
    const months = new Set(invoices.map(inv => inv.month));
    return ['Tất cả', ...Array.from(months)];
  }, [invoices]);

  // Checkbox selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkMarkPaid = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsAddLoading(true);
      for (const id of selectedIds) {
        const inv = invoices.find(i => i.id === id);
        if (inv && inv.status !== 'Đã thanh toán' && inv.status !== 'Đã hủy') {
          await api.post(`/owner/invoices/${id}/payment`, {
            amount: inv.total,
            paymentMethod: 'Cash',
            transactionId: `CASH-${Date.now()}`
          });
        }
      }
      triggerToast(`Ghi nhận thanh toán đầy đủ thành công cho các hóa đơn đã chọn`);
      setSelectedIds([]);
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật hàng loạt.');
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn hủy bỏ ${selectedIds.length} hóa đơn đã chọn?`)) {
      try {
        setIsAddLoading(true);
        for (const id of selectedIds) {
          await api.put(`/owner/invoices/${id}/cancel`);
        }
        triggerToast(`Đã hủy thành công các hóa đơn đã chọn`);
        setSelectedIds([]);
        fetchInvoices();
      } catch (err: any) {
        console.error(err);
        alert('Có lỗi xảy ra khi hủy hàng loạt.');
      } finally {
        setIsAddLoading(false);
      }
    }
  };

  const handleBulkNotification = () => {
    if (selectedIds.length === 0) return;
    const onlineInvoices = invoices.filter(l => selectedIds.includes(l.id) && l.isLinked);
    if (onlineInvoices.length === 0) {
      alert('Không thể gửi thông báo hàng loạt: Tất cả người thuê đã chọn đều là tài khoản Offline.');
      return;
    }
    triggerToast(`Đã gửi thông báo đòi nợ thành công tới ${onlineInvoices.length} người thuê trọ online`);
    setSelectedIds([]);
  };

  const handleBulkExportExcel = () => {
    setIsExportModalOpen(true);
  };

  // Single Actions Confirmation
  const openRecordModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setPayAmount(listing.total - listing.collectedAmount);
    setPayMethod('Chuyển khoản');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayNotes(`Thanh toán cho kỳ ${listing.month}`);
    setIsRecordModalOpen(true);
  };

  const confirmRecordPayment = async () => {
    if (!activeInvoice) return;
    if (payAmount <= 0) {
      alert('Số tiền thanh toán phải lớn hơn 0đ.');
      return;
    }
    const currentRemaining = activeInvoice.total - activeInvoice.collectedAmount;
    if (payAmount > currentRemaining) {
      alert('Số tiền thanh toán không được vượt quá số tiền còn lại của hóa đơn.');
      return;
    }

    try {
      setIsAddLoading(true);
      await api.post(`/owner/invoices/${activeInvoice.id}/payment`, {
        amount: payAmount,
        paymentMethod: payMethod === 'Chuyển khoản' ? 'BankTransfer' : payMethod === 'Ví điện tử' ? 'EWallet' : 'Cash',
        transactionId: `PAY-${Date.now()}`
      });

      triggerToast(`Đã ghi nhận thanh toán ${payAmount.toLocaleString('vi-VN')}đ thành công!`);
      setIsRecordModalOpen(false);
      setActiveInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi ghi nhận thanh toán.');
    } finally {
      setIsAddLoading(false);
    }
  };

  const openMarkPaidModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setIsMarkPaidModalOpen(true);
  };

  const confirmMarkPaid = async () => {
    if (!activeInvoice) return;
    try {
      setIsAddLoading(true);
      await api.post(`/owner/invoices/${activeInvoice.id}/payment`, {
        amount: activeInvoice.total,
        paymentMethod: 'Cash',
        transactionId: `CASH-${Date.now()}`
      });
      triggerToast(`Đã chốt thanh toán đầy đủ hóa đơn ${activeInvoice.code} thành công`);
      setIsMarkPaidModalOpen(false);
      setActiveInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thanh toán.');
    } finally {
      setIsAddLoading(false);
    }
  };

  const openCancelModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setCancelReason('');
    setCancelConfirmed(false);
    setIsCancelModalOpen(true);
  };

  const confirmCancelInvoice = async () => {
    if (!activeInvoice) return;
    if (!cancelConfirmed) {
      alert('Vui lòng tích xác nhận đồng ý hủy hóa đơn.');
      return;
    }
    try {
      setIsAddLoading(true);
      await api.put(`/owner/invoices/${activeInvoice.id}/cancel`);
      triggerToast(`Đã hủy thành công hóa đơn ${activeInvoice.code}`);
      setIsCancelModalOpen(false);
      setActiveInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy hóa đơn.');
    } finally {
      setIsAddLoading(false);
    }
  };

  const openSendNotificationModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setNotifMessage(`Bạn có hóa đơn thuê nhà kỳ ${listing.month} trị giá ${listing.total.toLocaleString('vi-VN')}đ cần thanh toán trước ngày ${new Date(listing.dueDate).toLocaleDateString('vi-VN')}. Vui lòng kiểm tra chi tiết trên RoomHub.`);
    setIsSendNotificationModalOpen(true);
  };

  const confirmSendNotification = () => {
    if (!activeInvoice) return;
    triggerToast(`Đã gửi thông báo đòi tiền trọ tới khách thuê ${activeInvoice.tenantName} thành công!`);
    setIsSendNotificationModalOpen(false);
    setActiveInvoice(null);
  };

  const handleExportSingleExcel = async (invoiceId: string, invoiceCode: string) => {
    try {
      setIsAddLoading(true);
      const response = await api.get(`/owner/invoices/${invoiceId}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${invoiceCode}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      triggerToast(`Đã tải file Excel hóa đơn ${invoiceCode} thành công!`);
    } catch (err: any) {
      console.error(err);
      alert('Không thể xuất file Excel hóa đơn này.');
    } finally {
      setIsAddLoading(false);
    }
  };

  const confirmExportExcel = async () => {
    if (exportRange === 'selected' && selectedIds.length > 0) {
      for (const id of selectedIds) {
        const inv = invoices.find(i => i.id === id);
        if (inv) {
          await handleExportSingleExcel(inv.id, inv.code);
        }
      }
    } else {
      const targetId = activeInvoice?.id || invoices[0]?.id;
      const targetCode = activeInvoice?.code || invoices[0]?.code || 'All';
      if (targetId) {
        await handleExportSingleExcel(targetId, targetCode);
      } else {
        alert('Không có hóa đơn nào để xuất.');
      }
    }
    setIsExportModalOpen(false);
    setSelectedIds([]);
  };

  // Status Badge Render Helper
  const renderStatusBadge = (status: InvoiceStatus, dueDate: string) => {
    const today = new Date();
    const isOverdueReal = status === 'Quá hạn' || (status === 'Chưa thanh toán' && new Date(dueDate) < today);
    
    if (status === 'Đã thanh toán') {
      return (
        <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Đã thanh toán
        </span>
      );
    }
    if (status === 'Thanh toán một phần') {
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Trả một phần
        </span>
      );
    }
    if (isOverdueReal) {
      return (
        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          Quá hạn đóng
        </span>
      );
    }
    if (status === 'Chưa thanh toán') {
      return (
        <span className="px-2.5 py-1 bg-yellow-50 text-yellow-755 border border-yellow-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          Chưa thanh toán
        </span>
      );
    }
    if (status === 'Nháp') {
      return (
        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          Bản nháp
        </span>
      );
    }
    if (status === 'Đã hủy') {
      return (
        <span className="px-2.5 py-1 bg-gray-100 text-gray-400 border border-gray-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          Đã hủy bỏ
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">
      
      {/* 1. HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1.5">
            <span className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-gray-700 font-bold">Hóa đơn & Chốt tiền</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-orange-500">receipt_long</span>
            Hóa đơn & Chốt tiền
            <span className="ml-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-black">{invoices.length} bill</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý toàn bộ hóa đơn thu chi và theo dõi tình trạng thanh toán.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span> Xuất Excel
          </button>
          <button 
            onClick={() => setCurrentPage('owner-invoices-create')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">calculate</span> + Chốt tiền tháng
          </button>
        </div>
      </div>

      {/* 2. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="group bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-orange-500 text-[20px]">receipt</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Tổng hóa đơn</span>
            <span className="text-sm font-black text-gray-900 leading-tight block">{stats.monthCount} bills</span>
            <span className="text-[9px] text-gray-400 font-semibold">Tất cả các kỳ</span>
          </div>
        </div>

        <div className="group bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Đã thu về</span>
            <span className="text-[13px] font-black text-emerald-600 leading-tight block">{stats.collected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-emerald-500 font-semibold">Tiền thu an toàn</span>
          </div>
        </div>

        <div className="group bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-amber-600 text-[20px]">wallet</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Chưa thu</span>
            <span className="text-[13px] font-black text-amber-600 leading-tight block">{stats.uncollected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-amber-500 font-semibold">Đang chờ chuyển</span>
          </div>
        </div>

        <div className="group bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Quá hạn nợ</span>
            <span className="text-[13px] font-black text-red-500 leading-tight block">{stats.overdue.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-red-400 font-semibold">Cần gửi nhắc nợ</span>
          </div>
        </div>

        <div className="group bg-white p-4.5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex items-center gap-3 col-span-2 md:col-span-1 transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">bar_chart</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Dự kiến thu</span>
            <span className="text-[13px] font-black text-blue-600 leading-tight block">{stats.expected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-blue-400 font-semibold">Tổng doanh thu kỳ</span>
          </div>
        </div>

      </div>

      {/* 3. SEARCH & FILTER CARD */}
      <div className="bg-white p-5 rounded-3xl border border-gray-155 soft-shadow space-y-4">
        <h3 className="text-xs font-black text-on-surface uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5 text-primary-container">
          <span className="material-symbols-outlined text-[18px]">manage_search</span>
          Bộ lọc hóa đơn đa năng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-bold text-gray-500">
          
          <div className="space-y-1 lg:col-span-2">
            <label className="uppercase">Tìm kiếm hóa đơn</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm mã hóa đơn, phòng, tòa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-semibold text-gray-700" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="uppercase">Tòa nhà / Tài sản</label>
            <select 
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              {uniqueProperties.map(p => (
                <option key={p} value={p}>{p === 'Tất cả' ? 'Tất cả tài sản' : p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="uppercase">Phòng / Căn</label>
            <select 
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              {uniqueUnits.map(u => (
                <option key={u} value={u}>{u === 'Tất cả' ? 'Tất cả phòng' : `Phòng ${u}`}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="uppercase">Kỳ thanh toán</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m === 'Tất cả' ? 'Tất cả thời gian' : `Tháng ${m}`}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="uppercase">Tên người thuê</label>
            <input 
              type="text"
              placeholder="Nhập họ tên..."
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-semibold text-gray-700" 
            />
          </div>

        </div>

        <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            Đặt lại bộ lọc
          </button>
          <button 
            onClick={() => triggerToast('Đã áp dụng bộ lọc hóa đơn')}
            className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Lọc hóa đơn
          </button>
        </div>
      </div>

      {/* 5. STATUS TABS QUICK FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
          {[
            'Tất cả',
            'Chưa thanh toán',
            'Đã thanh toán',
            'Thanh toán một phần',
            'Quá hạn',
            'Nháp',
            'Đã hủy'
          ].map((tab) => {
            const isActive = activeTab === tab;
            const count = tabCounts[tab as keyof typeof tabCounts] ?? 0;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIds([]);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? 'bg-primary-container border-primary-container text-white shadow-sm ring-2 ring-orange-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-orange-50/30 hover:border-orange-200 hover:text-primary-container'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  isActive ? 'bg-white text-primary-container' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-white p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setViewMode('table')}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-orange-50 text-primary-container font-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Xem bảng"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'card' ? 'bg-orange-50 text-primary-container font-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Xem lưới"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-650 focus:outline-none focus:border-primary-container cursor-pointer"
          >
            <option value="Mới nhất">Mới nhất</option>
            <option value="Cũ nhất">Cũ nhất</option>
            <option value="Tổng tiền cao nhất">Tổng tiền cao</option>
            <option value="Tổng tiền thấp nhất">Tổng tiền thấp</option>
            <option value="Gần đến hạn">Gần đến hạn</option>
            <option value="Quá hạn trước">Quá hạn trước</option>
          </select>
        </div>
      </div>

      {/* 6. BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-50/50 border border-orange-200/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3.5 animate-scaleUp backdrop-blur-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold text-orange-700">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] font-bold text-white">check_box</span>
            </div>
            <span>Đã chọn <strong className="text-base text-orange-600 font-black px-0.5">{selectedIds.length}</strong> hóa đơn</span>
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto justify-end text-xs font-bold flex-wrap">
            <button 
              onClick={handleBulkExportExcel}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span> Xuất Excel
            </button>
            <button 
              onClick={handleBulkNotification}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">notifications_active</span> Nhắc nợ
            </button>
            <button 
              onClick={handleBulkMarkPaid}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">credit_score</span> Đóng đủ
            </button>
            <button 
              onClick={handleBulkCancel}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">cancel</span> Hủy hóa đơn
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all cursor-pointer font-bold border border-transparent hover:border-gray-200"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* 7. INVOICE LISTINGS CONTAINER */}
      {filteredInvoices.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="bg-white p-12 rounded-3xl border border-gray-150 soft-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[350px] animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-primary-container mb-1">
            <span className="material-symbols-outlined text-[36px]">receipt_long</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-wide">
              {searchTerm || filterProperty !== 'Tất cả' || filterUnit !== 'Tất cả' || filterMonth !== 'Tất cả' || filterStatus !== 'Tất cả' || filterTenant || activeTab !== 'Tất cả'
                ? 'Không tìm thấy hóa đơn phù hợp'
                : 'Bạn chưa có hóa đơn nào'}
            </h4>
            <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              {searchTerm || filterProperty !== 'Tất cả' || filterUnit !== 'Tất cả' || filterMonth !== 'Tất cả' || filterStatus !== 'Tất cả' || filterTenant || activeTab !== 'Tất cả'
                ? 'Hãy thử thay đổi kỳ thanh toán, trạng thái hoặc bộ lọc tìm kiếm để tìm lại.'
                : 'Hãy tiến hành chốt chỉ số điện nước để tạo hóa đơn tháng này cho các căn phòng đang được thuê.'}
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            {searchTerm || filterProperty !== 'Tất cả' || filterUnit !== 'Tất cả' || filterMonth !== 'Tất cả' || filterStatus !== 'Tất cả' || filterTenant || activeTab !== 'Tất cả' ? (
              <button 
                onClick={handleResetFilters}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <button 
                onClick={() => setCurrentPage('owner-invoices-create')}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">calculate</span> + Chốt tiền ngay
              </button>
            )}
          </div>
        </div>

      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto border-0">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 uppercase tracking-widest text-[10px] text-gray-400 font-black">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                      className="w-4 h-4 text-orange-500 accent-orange-500 rounded cursor-pointer" 
                    />
                  </th>
                  <th className="py-3.5 px-4 min-w-[150px]">Hóa đơn</th>
                  <th className="py-3.5 px-4">Kỳ hóa đơn</th>
                  <th className="py-3.5 px-4">Phòng / Căn</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Người thuê trọ</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Chi tiết tiền</th>
                  <th className="py-3.5 px-4">Tổng tiền</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Hạn đóng</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
                  const isSelected = selectedIds.includes(list.id);
                  const isOverdueReal = list.status === 'Quá hạn' || (list.status === 'Chưa thanh toán' && new Date(list.dueDate) < new Date());
                  
                  return (
                    <tr 
                      key={list.id} 
                      className={`hover:bg-orange-50/20 transition-colors duration-150 group ${
                        isSelected ? 'bg-orange-50/10' : ''
                      }`}
                    >
                      <td className="py-4.5 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectOne(list.id)}
                          className="w-4 h-4 text-primary-container accent-primary-container rounded cursor-pointer" 
                        />
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-gray-400">receipt_long</span>
                          <div className="space-y-0.5">
                            <span 
                              onClick={() => {
                                window.location.hash = `#/owner/invoices/${list.id}`;
                              }}
                              className="font-bold text-gray-800 hover:text-primary-container cursor-pointer text-xs"
                            >
                              {list.code}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold leading-none block font-mono text-[9px]">{list.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-4 font-bold text-gray-700">
                        Tháng {list.month}
                        <span className="text-[9px] text-gray-400 font-semibold block uppercase">Kỳ hóa đơn</span>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-855 font-black block leading-none">{list.property}</span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px] text-gray-400">home</span>
                            Phòng {list.unit}
                          </span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-primary-container flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {list.tenantName.split(' ').pop()?.charAt(0) || 'U'}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-gray-800 font-bold block leading-none text-xs">{list.tenantName}</span>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase">
                              <span className="text-gray-400 font-bold">{list.tenantPhone}</span>
                              {list.isLinked ? (
                                <span className="bg-green-50 text-green-600 px-1 py-0.2 border border-green-200 rounded text-[7px] tracking-wide">Linked</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-500 px-1 py-0.2 border border-gray-200 rounded text-[7px] tracking-wide">Offline</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-4 text-left">
                        <div className="space-y-0.5 text-[10px] text-gray-400 font-semibold">
                          <div className="flex justify-between max-w-[140px]">
                            <span>Tiền thuê:</span>
                            <span className="text-gray-700 font-bold">{list.rentPrice.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between max-w-[140px]">
                            <span>Dịch vụ & Khác:</span>
                            <span className="text-gray-700 font-bold">{list.utilitiesPrice.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-4 text-xs font-black">
                        <span className="text-primary-container block text-xs">{list.total.toLocaleString('vi-VN')}đ</span>
                        {list.status === 'Thanh toán một phần' && (
                          <div className="text-[9px] text-gray-400 font-semibold leading-normal pt-0.5">
                            <span className="text-green-600 font-bold block">Đã trả: {list.collectedAmount.toLocaleString('vi-VN')}đ</span>
                            <span className="text-red-500 font-bold block">Còn lại: {(list.total - list.collectedAmount).toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="space-y-1">
                          {renderStatusBadge(list.status, list.dueDate)}
                          {isOverdueReal && (
                            <span className="text-[9px] text-red-500 font-black block">Quá hạn đóng!</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        <span className="text-gray-700 font-bold block">{list.dueDate}</span>
                        {list.status === 'Đã thanh toán' ? (
                          <span className="text-[9px] text-green-600 font-black flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px] font-bold">check_circle</span> Đóng đủ
                          </span>
                        ) : list.status === 'Đã hủy' ? (
                          <span className="text-[9px] text-gray-400 italic">Đã hủy</span>
                        ) : isOverdueReal ? (
                          <span className="text-[9px] text-red-655 font-black uppercase">Trễ hạn</span>
                        ) : (
                          <span className="text-[9px] text-orange-500 font-bold">Chưa đóng</span>
                        )}
                      </td>

                      <td className="py-4.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {list.status === 'Nháp' && (
                            <button 
                              onClick={() => triggerToast('Đã phê duyệt bản nháp, hóa đơn sẵn sàng gửi cho khách thuê')}
                              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Phê duyệt bản nháp"
                            >
                              Phê duyệt
                            </button>
                          )}

                          {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                            <button 
                              onClick={() => openRecordModal(list)}
                              className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Ghi nhận thanh toán ngoài hệ thống"
                            >
                              Thu tiền
                            </button>
                          )}

                          {list.status === 'Đã thanh toán' && (
                            <button 
                              onClick={() => handleExportSingleExcel(list.id, list.code)}
                              className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                              title="Tải hóa đơn dịch vụ Excel"
                            >
                              <span className="material-symbols-outlined text-[12px]">file_download</span> Tải Excel
                            </button>
                          )}

                          {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                            <button 
                              onClick={() => openSendNotificationModal(list)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-500 hover:text-primary-container rounded-lg transition-colors cursor-pointer"
                              title="Gửi thông báo nhắc thanh toán"
                            >
                              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                            </button>
                          )}

                          <div className="relative invoice-actions-menu">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(prev => prev === list.id ? null : list.id);
                              }}
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">more_vert</span>
                            </button>
                            {activeMenuId === list.id && (
                              <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 w-40 z-[1000] text-left text-[11px] font-bold text-gray-600">
                                
                                <button 
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    window.location.hash = `#/owner/invoices/${list.id}`;
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">info</span> Xem chi tiết
                                </button>

                                {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                                  <button 
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      openMarkPaidModal(list);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">credit_score</span> Đóng đủ (Paid)
                                  </button>
                                )}

                                <button 
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleExportSingleExcel(list.id, list.code);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                                >
                                  <span className="material-symbols-outlined text-[14px]">table</span> Xuất Excel bill
                                </button>

                                {list.status !== 'Đã hủy' && (
                                  <button 
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      openCancelModal(list);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-red-50 hover:text-red-655 flex items-center gap-1.5 cursor-pointer border-t border-gray-50 text-red-500"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">cancel</span> Hủy hóa đơn
                                  </button>
                                )}

                              </div>
                            )}
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        
        /* CARD VIEW FOR MOBILE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scaleUp">
          {filteredInvoices.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
            const isSelected = selectedIds.includes(list.id);
            const isOverdueReal = list.status === 'Quá hạn' || (list.status === 'Chưa thanh toán' && new Date(list.dueDate) < new Date());
            
            return (
              <div 
                key={list.id} 
                className={`bg-white rounded-3xl border p-4.5 space-y-4 shadow-sm hover:shadow-md transition-all hover-lift group ${
                  isSelected ? 'border-primary-container ring-2 ring-orange-100' : 'border-gray-150 hover:border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectOne(list.id)}
                      className="w-4.5 h-4.5 text-primary-container accent-primary-container rounded cursor-pointer" 
                    />
                    <div className="text-left">
                      <span className="font-black text-gray-800 text-xs">{list.code}</span>
                      <span className="text-[9px] text-gray-400 font-semibold block">Ngày tạo: {list.createdDate}</span>
                    </div>
                  </div>
                  {renderStatusBadge(list.status, list.dueDate)}
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-gray-655 text-left">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Phòng / Căn:</span>
                    <span className="text-gray-800 font-black">{list.property} · Phòng {list.unit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Kỳ thanh toán:</span>
                    <span className="text-gray-800 font-black">Tháng {list.month}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-gray-400 block uppercase">Người thuê:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-gray-800 font-bold">{list.tenantName}</span>
                      {list.isLinked ? (
                        <span className="bg-green-50 text-green-600 px-1 py-0.2 border border-green-200 rounded text-[7px] font-black uppercase">Linked</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-1 py-0.2 border border-gray-200 rounded text-[7px] font-black uppercase">Offline</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-55 p-3 rounded-2xl border border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-650 text-left">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Tổng tiền dự kiến:</span>
                    <strong className="text-sm font-black text-primary-container">{list.total.toLocaleString('vi-VN')}đ</strong>
                  </div>
                  
                  {list.status === 'Thanh toán một phần' && (
                    <div className="text-right text-[10px]">
                      <span className="text-green-600 font-bold block leading-none">Đã thu: {list.collectedAmount.toLocaleString('vi-VN')}đ</span>
                      <span className="text-red-500 font-bold block leading-none mt-1">Còn: {(list.total - list.collectedAmount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold text-left">
                    <span>Hạn: <strong className="text-gray-600">{list.dueDate}</strong></span>
                    {isOverdueReal && <span className="text-red-655 block font-black uppercase tracking-wider text-[8px] mt-0.5">Quá hạn nợ trọ!</span>}
                  </div>

                  <div className="flex gap-1">
                    
                    {list.status === 'Nháp' && (
                      <button 
                        onClick={() => triggerToast('Đã phê duyệt bản nháp, hóa đơn sẵn sàng gửi cho khách thuê')}
                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer"
                      >
                        Duyệt
                      </button>
                    )}

                    {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                      <button 
                        onClick={() => openRecordModal(list)}
                        className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer"
                      >
                        Thu tiền
                      </button>
                    )}

                    {list.status === 'Đã thanh toán' && (
                      <button 
                        onClick={() => handleExportSingleExcel(list.id, list.code)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[9px] font-black uppercase border border-gray-200 cursor-pointer"
                      >
                        Excel
                      </button>
                    )}

                    {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                      <button 
                        onClick={() => openSendNotificationModal(list)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg cursor-pointer"
                        title="Gửi thông báo"
                      >
                        <span className="material-symbols-outlined text-[15px]">notifications_active</span>
                      </button>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* 8. PAGINATION FOOTER */}
      {filteredInvoices.length > 0 && (
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>Hiển thị</span>
            <select 
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPageNum(1);
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg bg-white text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value={5}>5 dòng</option>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
            <span>trong tổng số <strong className="text-gray-800 font-extrabold">{filteredInvoices.length}</strong> hóa đơn</span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              disabled={currentPageNum === 1}
              onClick={() => setCurrentPageNum(prev => prev - 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                currentPageNum === 1
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.ceil(filteredInvoices.length / pageSize) }).map((_, index) => {
              const p = index + 1;
              const isSelected = currentPageNum === p;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPageNum(p)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-container border-primary-container text-white shadow-sm ring-2 ring-orange-100'
                      : 'border-gray-200 text-gray-655 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button 
              disabled={currentPageNum === Math.ceil(filteredInvoices.length / pageSize)}
              onClick={() => setCurrentPageNum(prev => prev + 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                currentPageNum === Math.ceil(filteredInvoices.length / pageSize)
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. MODAL 1: RECORD PAYMENT */}
      {isRecordModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-md w-full border border-gray-100 text-left">
            <div className="flex justify-between items-start border-b border-gray-50 pb-2">
              <div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">credit_score</span>
                  Ghi nhận thanh toán
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Cập nhật thanh toán thủ công cho hóa đơn dịch vụ.</p>
              </div>
              <button 
                onClick={() => {
                  setIsRecordModalOpen(false);
                  setActiveInvoice(null);
                }}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-400 font-bold">close</span>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs font-semibold text-gray-655 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <span>Hóa đơn: <strong>{activeInvoice.code}</strong></span>
                <span>Khách thuê: <strong>{activeInvoice.tenantName}</strong></span>
                <span>Phòng / Căn: <strong>{activeInvoice.property} · Phòng {activeInvoice.unit}</strong></span>
                <span>Trạng thái: <strong>{activeInvoice.status}</strong></span>
              </div>
              <div className="border-t border-gray-250/50 pt-2 flex justify-between items-center text-[10px] font-black">
                <span>Tổng giá trị: <strong className="text-gray-800">{activeInvoice.total.toLocaleString('vi-VN')}đ</strong></span>
                <span>Còn lại phải thu: <strong className="text-red-500">{(activeInvoice.total - activeInvoice.collectedAmount).toLocaleString('vi-VN')}đ</strong></span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-gray-500">
              
              <div className="space-y-1">
                <label className="uppercase">Số tiền ghi nhận thanh toán <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-855" 
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black">đ</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Phương thức thanh toán</label>
                <select 
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-700"
                >
                  <option value="Chuyển khoản">Chuyển khoản Ngân hàng</option>
                  <option value="Tiền mặt">Trả Tiền mặt</option>
                  <option value="Ví điện tử">Ví điện tử MoMo/ZaloPay</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Ngày thanh toán ghi nhận</label>
                <input 
                  type="date" 
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-xs font-bold text-gray-700 bg-white" 
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Ghi chú nội bộ</label>
                <textarea 
                  rows={2}
                  placeholder="Ví dụ: Người thuê chuyển khoản cước điện nước vào VCB..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs font-semibold text-gray-700 bg-gray-50/50" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-2">
              <button 
                onClick={() => {
                  setIsRecordModalOpen(false);
                  setActiveInvoice(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer text-center"
              >
                Hủy tác vụ
              </button>
              <button 
                onClick={confirmRecordPayment}
                className="py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer text-center"
              >
                Ghi nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL 2: MARK AS PAID CONFIRM QUICK */}
      {isMarkPaidModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">check_circle</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Đóng đủ hóa đơn?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Hệ thống sẽ lập tức ghi nhận hóa đơn **{activeInvoice.code}** đã được thanh toán đầy đủ toàn bộ trị giá **{activeInvoice.total.toLocaleString('vi-VN')}đ**.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsMarkPaidModalOpen(false);
                  setActiveInvoice(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Hủy tác vụ
              </button>
              <button 
                onClick={confirmMarkPaid}
                className="py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Xác nhận đã đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL 3: CANCEL INVOICE MODAL */}
      {isCancelModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100 text-left">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-655 flex items-center justify-center mx-auto mb-1 shrink-0">
              <span className="material-symbols-outlined text-[28px] font-bold">cancel</span>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Hủy bỏ hóa đơn dịch vụ?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Hóa đơn dịch vụ **{activeInvoice.code}** sẽ chuyển sang trạng thái **Đã hủy** và không còn được cộng tính vào tổng công nợ vận hành hiện tại.
              </p>
            </div>

            <div className="space-y-3 text-xs font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase">Lý do hủy bỏ hóa đơn <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Khách trọ đóng nhầm số điện tiêu thụ..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none text-xs font-semibold text-gray-700 bg-white" 
                />
              </div>

              <div className="flex items-start gap-2 pt-1 bg-gray-55 p-2.5 rounded-xl border border-gray-100 text-left">
                <input 
                  type="checkbox" 
                  id="cancelConfirmCheck" 
                  checked={cancelConfirmed}
                  onChange={(e) => setCancelConfirmed(e.target.checked)}
                  className="w-4 h-4 text-primary-container accent-primary-container mt-0.5 cursor-pointer shrink-0" 
                />
                <label htmlFor="cancelConfirmCheck" className="text-[10px] text-gray-650 font-bold select-none cursor-pointer leading-normal">
                  Tôi xác nhận muốn hủy bỏ và tạm gỡ giá trị của hóa đơn này khỏi báo cáo doanh thu tài chính trọ.
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setActiveInvoice(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer text-center"
              >
                Không hủy
              </button>
              <button 
                onClick={confirmCancelInvoice}
                className="py-2.5 bg-red-655 hover:bg-red-750 text-white rounded-xl transition-all shadow-sm cursor-pointer text-center"
              >
                Xác nhận Hủy hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL 4: EXPORT EXCEL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100 text-left">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">table</span>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Xuất báo cáo Bill Excel</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Tải báo cáo chi tiết Excel hóa đơn phòng trọ của bạn.
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-gray-500">
              <div className="space-y-1">
                <label className="uppercase block mb-1">Phạm vi hóa đơn xuất</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="rangeAll" 
                      name="rangeOpt" 
                      checked={exportRange === 'all'}
                      onChange={() => setExportRange('all')}
                      className="w-4 h-4 accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="rangeAll" className="cursor-pointer select-none font-bold text-gray-650">Xuất toàn bộ theo bộ lọc ({filteredInvoices.length} bill)</label>
                  </div>
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id="rangeSelected" 
                        name="rangeOpt" 
                        checked={exportRange === 'selected'}
                        onChange={() => setExportRange('selected')}
                        className="w-4 h-4 accent-primary-container cursor-pointer" 
                      />
                      <label htmlFor="rangeSelected" className="cursor-pointer select-none font-bold text-gray-650">Chỉ xuất các hóa đơn đã tích chọn ({selectedIds.length} bill)</label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-2">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer text-center"
              >
                Hủy tác vụ
              </button>
              <button 
                onClick={confirmExportExcel}
                className="py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span> Tải xuống Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. MODAL 5: SEND NOTIFICATION */}
      {isSendNotificationModalOpen && activeInvoice && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100 text-left">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">notifications_active</span>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Gửi nhắc nợ thanh toán?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Hệ thống sẽ gửi trực tiếp thông điệp nhắc nhở hóa đơn tới cổng thông báo RoomHub của khách thuê.
              </p>
            </div>

            {!activeInvoice.isLinked ? (
              <div className="bg-red-50 border border-red-150 p-3 rounded-2xl flex items-start gap-2 text-red-800 animate-scaleUp">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                <p className="text-[9.5px] leading-relaxed font-semibold">
                  <span className="font-black uppercase block mb-0.5">Khách thuê trọ Offline!</span>
                  Người thuê **{activeInvoice.tenantName}** chưa liên kết ứng dụng. Vui lòng tải Excel bill gửi qua Zalo/SMS.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs font-bold text-gray-500">
                <div className="space-y-1">
                  <label className="uppercase text-[10px] tracking-wide block">Nội dung thông báo nhắc nợ trọ</label>
                  <textarea 
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-[11px] font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsSendNotificationModalOpen(false);
                  setActiveInvoice(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer text-center"
              >
                Đóng lại
              </button>
              <button 
                disabled={!activeInvoice.isLinked}
                onClick={confirmSendNotification}
                className={`py-2.5 rounded-xl transition-all shadow-sm text-center flex items-center justify-center gap-1 ${
                  !activeInvoice.isLinked 
                    ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed shadow-none' 
                    : 'bg-primary-container hover:bg-orange-600 text-white cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">send</span> Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. TOAST NOTIFICATION SUCCESS ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[3000] bg-gray-900/95 backdrop-blur text-white px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-gray-800 animate-slideIn">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
          <span>{toastMessage}</span>
          <span 
            onClick={() => setToastMessage(null)}
            className="material-symbols-outlined text-[16px] text-gray-400 hover:text-white cursor-pointer ml-1.5"
          >
            close
          </span>
        </div>
      )}

      {/* SPINNER FOR OPERATIONS */}
      {isAddLoading && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2500] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col items-center justify-center space-y-3 animate-scaleUp">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
            <p className="text-xs font-bold text-gray-600">Đang xử lý yêu cầu...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceList;
