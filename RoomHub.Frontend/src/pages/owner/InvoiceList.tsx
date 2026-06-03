import React, { useState, useMemo } from 'react';
import type { PageType } from '../../App';

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

const INITIAL_MOCK_INVOICES: InvoiceItem[] = [
  {
    id: '1',
    code: 'INV-0526-001',
    month: '05/2026',
    createdDate: '2026-05-25',
    property: 'FPT House',
    unit: '201',
    tenantName: 'Nguyễn Văn An',
    tenantPhone: '0909 123 456',
    isLinked: true,
    rentPrice: 2500000,
    utilitiesPrice: 480000,
    otherPrice: 330000,
    total: 3310000,
    collectedAmount: 0,
    status: 'Chưa thanh toán',
    dueDate: '2026-06-05',
    notes: 'Kỳ chốt tiền tháng 05/2026.'
  },
  {
    id: '2',
    code: 'INV-0526-002',
    month: '05/2026',
    createdDate: '2026-05-25',
    property: 'Hòa Hải Studio',
    unit: '302',
    tenantName: 'Trần Thị Bích',
    tenantPhone: '0905 555 666',
    isLinked: true,
    rentPrice: 4500000,
    utilitiesPrice: 450000,
    otherPrice: 0,
    total: 4950000,
    collectedAmount: 4950000,
    status: 'Đã thanh toán',
    dueDate: '2026-06-05',
    notes: 'Khách thuê đã chuyển khoản đầy đủ qua Vietcombank.'
  },
  {
    id: '3',
    code: 'INV-0526-003',
    month: '05/2026',
    createdDate: '2026-05-25',
    property: 'Sơn Trà Mini Apartment',
    unit: '105',
    tenantName: 'Lê Văn Cường',
    tenantPhone: '0914 999 888',
    isLinked: false,
    rentPrice: 5500000,
    utilitiesPrice: 800000,
    otherPrice: 200000,
    total: 6500000,
    collectedAmount: 0,
    status: 'Quá hạn',
    dueDate: '2026-05-25',
    notes: 'Khách trọ trễ hạn đóng tiền 5 ngày.'
  },
  {
    id: '4',
    code: 'INV-0526-004',
    month: '05/2026',
    createdDate: '2026-05-25',
    property: 'FPT House',
    unit: '305',
    tenantName: 'Phạm Thị Dung',
    tenantPhone: '0909 321 654',
    isLinked: true,
    rentPrice: 2500000,
    utilitiesPrice: 500000,
    otherPrice: 200000,
    total: 3200000,
    collectedAmount: 1500000,
    status: 'Thanh toán một phần',
    dueDate: '2026-06-05',
    notes: 'Khách xin đóng trước 1.5M, số còn lại đóng vào cuối tuần.'
  },
  {
    id: '5',
    code: 'INV-0526-005',
    month: '05/2026',
    createdDate: '2026-05-29',
    property: 'Ngũ Hành Sơn Rooms',
    unit: '103',
    tenantName: 'Hoàng Văn Em',
    tenantPhone: '0988 777 666',
    isLinked: false,
    rentPrice: 2200000,
    utilitiesPrice: 450000,
    otherPrice: 200000,
    total: 2850000,
    collectedAmount: 0,
    status: 'Nháp',
    dueDate: '2026-06-05',
    notes: 'Bản nháp chờ xem xét lại số điện tiêu thụ thực tế.'
  },
  {
    id: '6',
    code: 'INV-0526-006',
    month: '05/2026',
    createdDate: '2026-05-20',
    property: 'Hải Châu Apartment',
    unit: 'A1205',
    tenantName: 'Đặng Thị Gia',
    tenantPhone: '0935 444 333',
    isLinked: true,
    rentPrice: 8500000,
    utilitiesPrice: 900000,
    otherPrice: 300000,
    total: 9700000,
    collectedAmount: 0,
    status: 'Đã hủy',
    dueDate: '2026-06-02',
    notes: 'Hủy do tính toán nhầm số nước kỳ trước.'
  }
];

const InvoiceList: React.FC<InvoiceListProps> = ({ setCurrentPage }) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_MOCK_INVOICES);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('Tất cả');
  const [filterUnit, setFilterUnit] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('Tháng này');
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
  const [markPaidIfFull, setMarkPaidIfFull] = useState<boolean>(true);

  // Notification states
  const [notifMessage, setNotifMessage] = useState<string>('');

  // Cancel states
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelConfirmed, setCancelConfirmed] = useState<boolean>(false);

  // Export states
  const [exportRange, setExportRange] = useState<string>('all');
  const [includeUtilities, setIncludeUtilities] = useState<boolean>(true);
  const [includeTenant, setIncludeTenant] = useState<boolean>(true);
  const [includeStatus, setIncludeStatus] = useState<boolean>(true);

  // Toast Success Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Financial Stats
  const stats = useMemo(() => {
    const curMonthInvoices = invoices.filter(inv => inv.month === '05/2026');
    const totalMonthCount = curMonthInvoices.length;
    
    // Collected total
    const totalCollected = invoices
      .filter(inv => inv.status === 'Đã thanh toán' || inv.status === 'Thanh toán một phần')
      .reduce((sum, item) => sum + item.collectedAmount, 0);

    // Uncollected total
    const totalUncollected = invoices
      .filter(inv => inv.status === 'Chưa thanh toán' || inv.status === 'Quá hạn' || inv.status === 'Thanh toán một phần')
      .reduce((sum, item) => sum + (item.total - item.collectedAmount), 0);

    // Overdue total
    const totalOverdue = invoices
      .filter(inv => inv.status === 'Quá hạn')
      .reduce((sum, item) => sum + (item.total - item.collectedAmount), 0);

    // Total Expected
    const totalExpected = invoices
      .filter(inv => inv.status !== 'Đã hủy')
      .reduce((sum, item) => sum + item.total, 0);

    return {
      monthCount: totalMonthCount,
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
    setFilterMonth('Tháng này');
    setFilterStatus('Tất cả');
    setFilterTenant('');
    setActiveTab('Tất cả');
    triggerToast('Đã thiết lập lại tất cả bộ lọc hóa đơn');
  };

  // Filter & Sort Logic
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Status Tab filter
    if (activeTab !== 'Tất cả') {
      result = result.filter(l => l.status === activeTab);
    }

    // Keyword Search (invoice code, property, unit)
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

    // Property Filter
    if (filterProperty !== 'Tất cả') {
      result = result.filter(l => l.property === filterProperty);
    }

    // Unit Filter
    if (filterUnit !== 'Tất cả') {
      result = result.filter(l => l.unit === filterUnit);
    }

    // Dropdown Status Filter (only active if activeTab is "Tất cả" to avoid conflict)
    if (activeTab === 'Tất cả' && filterStatus !== 'Tất cả') {
      result = result.filter(l => l.status === filterStatus);
    }

    // Month filter
    if (filterMonth !== 'Tất cả') {
      if (filterMonth === 'Tháng này') {
        result = result.filter(l => l.month === '05/2026');
      } else if (filterMonth === 'Tháng trước') {
        result = result.filter(l => l.month === '04/2026');
      }
    }

    // Tenant Filter
    if (filterTenant.trim()) {
      const lower = filterTenant.toLowerCase();
      result = result.filter(l => l.tenantName.toLowerCase().includes(lower));
    }

    // Sorting order
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
  const handleBulkMarkPaid = () => {
    if (selectedIds.length === 0) return;
    setInvoices(prev =>
      prev.map(l => (selectedIds.includes(l.id) && l.status !== 'Đã hủy' ? { ...l, status: 'Đã thanh toán' as const, collectedAmount: l.total } : l))
    );
    triggerToast(`Ghi nhận thanh toán đầy đủ thành công cho ${selectedIds.length} hóa đơn`);
    setSelectedIds([]);
  };

  const handleBulkCancel = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn hủy bỏ ${selectedIds.length} hóa đơn đã chọn?`)) {
      setInvoices(prev =>
        prev.map(l => (selectedIds.includes(l.id) ? { ...l, status: 'Đã hủy' as const } : l))
      );
      triggerToast(`Đã hủy thành công ${selectedIds.length} hóa đơn trọ`);
      setSelectedIds([]);
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
    setMarkPaidIfFull(true);
    setIsRecordModalOpen(true);
  };

  const confirmRecordPayment = () => {
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

    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === activeInvoice.id) {
          const newCollected = inv.collectedAmount + payAmount;
          let newStatus = inv.status;
          if (newCollected >= inv.total) {
            newStatus = 'Đã thanh toán';
          } else if (newCollected > 0) {
            newStatus = 'Thanh toán một phần';
          }
          return {
            ...inv,
            collectedAmount: newCollected,
            status: newStatus
          };
        }
        return inv;
      })
    );

    triggerToast(`Đã ghi nhận thanh toán ${payAmount.toLocaleString('vi-VN')}đ thành công!`);
    setIsRecordModalOpen(false);
    setActiveInvoice(null);
  };

  const openMarkPaidModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setIsMarkPaidModalOpen(true);
  };

  const confirmMarkPaid = () => {
    if (!activeInvoice) return;
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === activeInvoice.id
          ? { ...inv, status: 'Đã thanh toán' as const, collectedAmount: inv.total }
          : inv
      )
    );
    triggerToast(`Đã chốt thanh toán đầy đủ hóa đơn ${activeInvoice.code} thành công`);
    setIsMarkPaidModalOpen(false);
    setActiveInvoice(null);
  };

  const openCancelModal = (listing: InvoiceItem) => {
    setActiveInvoice(listing);
    setCancelReason('');
    setCancelConfirmed(false);
    setIsCancelModalOpen(true);
  };

  const confirmCancelInvoice = () => {
    if (!activeInvoice) return;
    if (!cancelConfirmed) {
      alert('Vui lòng tích xác nhận đồng ý hủy hóa đơn.');
      return;
    }
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === activeInvoice.id ? { ...inv, status: 'Đã hủy' as const } : inv
      )
    );
    triggerToast(`Đã hủy thành công hóa đơn ${activeInvoice.code}`);
    setIsCancelModalOpen(false);
    setActiveInvoice(null);
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

  const confirmExportExcel = () => {
    triggerToast('Hệ thống đang xuất bill... File Excel .xlsx đã tải xuống thành công!');
    setIsExportModalOpen(false);
    setSelectedIds([]);
  };

  const handleApproveDraft = (listing: InvoiceItem) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === listing.id ? { ...inv, status: 'Chưa thanh toán' as const } : inv
      )
    );
    triggerToast('Đã phê duyệt bản nháp, hóa đơn sẵn sàng gửi cho khách thuê');
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
        <span className="px-2.5 py-1 bg-yellow-50 text-yellow-750 border border-yellow-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
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

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">
      
      {/* 1. BREADCRUMB */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">Hóa đơn & Chốt tiền</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 hover:border-gray-350 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span> Xuất Excel
          </button>
          <button 
            onClick={() => alert('Chuyển sang biểu mẫu chốt chỉ số điện nước & chốt tiền tháng trọ...')}
            className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 animate-scaleUp"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">calculate</span> + Chốt tiền tháng
          </button>
        </div>
      </div>

      {/* 2. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Hóa đơn tháng này */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-container text-[20px]">receipt</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Kỳ hóa đơn</span>
            <span className="text-sm font-black text-on-surface leading-tight block">{stats.monthCount} bills</span>
            <span className="text-[9px] text-gray-400 font-semibold">Kỳ tháng 05/2026</span>
          </div>
        </div>

        {/* Card 2: Đã thu */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3 animate-scaleUp">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Đã thu về</span>
            <span className="text-[13px] font-black text-green-600 leading-tight block">{stats.collected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-green-500 font-semibold">Tiền thu an toàn</span>
          </div>
        </div>

        {/* Card 3: Chưa thu */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-yellow-600 text-[20px]">wallet</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Chưa thu</span>
            <span className="text-[13px] font-black text-yellow-600 leading-tight block">{stats.uncollected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-yellow-500 font-semibold">Đang chờ chuyển</span>
          </div>
        </div>

        {/* Card 4: Quá hạn */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Quá hạn nợ</span>
            <span className="text-[13px] font-black text-red-600 leading-tight block">{stats.overdue.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-red-500 font-semibold">Cần gửi nhắc nợ</span>
          </div>
        </div>

        {/* Card 5: Tổng dự kiến */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-orange-100/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-orange-700 text-[20px]">bar_chart</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Dự kiến thu</span>
            <span className="text-[13px] font-black text-gray-700 leading-tight block">{stats.expected.toLocaleString('vi-VN')}đ</span>
            <span className="text-[9px] text-gray-400 font-semibold">Tổng doanh thu kỳ</span>
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Thao tác nhanh tài chính</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Chốt tiền */}
          <div 
            onClick={() => alert('Khởi động tiến trình chốt tiền tháng cho các phòng trống...')}
            className="bg-white p-4 rounded-2xl border border-gray-150 soft-shadow hover:border-orange-200 transition-all cursor-pointer hover-lift flex gap-3 text-left"
          >
            <span className="material-symbols-outlined text-primary-container text-[24px] bg-orange-50 p-2 rounded-xl h-max">calculate</span>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-black text-on-surface">Chốt tiền tháng trọ</h5>
              <p className="text-[9px] text-gray-400 leading-normal font-semibold">Tạo hóa đơn chốt chỉ số điện nước toàn bộ nhà.</p>
            </div>
          </div>

          {/* Action 2: Ghi nhận thanh toán */}
          <div 
            onClick={() => {
              const pendingInv = invoices.find(i => i.status === 'Chưa thanh toán');
              if (pendingInv) openRecordModal(pendingInv);
              else alert('Hiện tại không có hóa đơn Chưa thanh toán nào để demo ghi nhận.');
            }}
            className="bg-white p-4 rounded-2xl border border-gray-150 soft-shadow hover:border-orange-200 transition-all cursor-pointer hover-lift flex gap-3 text-left"
          >
            <span className="material-symbols-outlined text-primary-container text-[24px] bg-orange-50 p-2 rounded-xl h-max">credit_score</span>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-black text-on-surface">Ghi nhận thanh toán</h5>
              <p className="text-[9px] text-gray-400 leading-normal font-semibold">Cập nhật tiền mặt/chuyển khoản ngân hàng.</p>
            </div>
          </div>

          {/* Action 3: Xuất bill */}
          <div 
            onClick={() => setIsExportModalOpen(true)}
            className="bg-white p-4 rounded-2xl border border-gray-150 soft-shadow hover:border-orange-200 transition-all cursor-pointer hover-lift flex gap-3 text-left"
          >
            <span className="material-symbols-outlined text-primary-container text-[24px] bg-orange-50 p-2 rounded-xl h-max">file_download</span>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-black text-on-surface">Xuất Excel báo cáo</h5>
              <p className="text-[9px] text-gray-400 leading-normal font-semibold">Tải báo cáo chi tiết bảng kê tiền điện nước.</p>
            </div>
          </div>

          {/* Action 4: Gửi nhắc */}
          <div 
            onClick={() => {
              const overdueInv = invoices.find(i => i.status === 'Quá hạn');
              if (overdueInv) openSendNotificationModal(overdueInv);
              else alert('Hiện tại không có hóa đơn quá hạn nào.');
            }}
            className="bg-white p-4 rounded-2xl border border-gray-150 soft-shadow hover:border-orange-200 transition-all cursor-pointer hover-lift flex gap-3 text-left"
          >
            <span className="material-symbols-outlined text-primary-container text-[24px] bg-orange-50 p-2 rounded-xl h-max">notifications_active</span>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-black text-on-surface">Gửi thông báo nhắc</h5>
              <p className="text-[9px] text-gray-400 leading-normal font-semibold">Gửi thông báo đòi tiền trọ trực tuyến tới khách trọ.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. SEARCH & FILTER CARD */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow space-y-4">
        <h3 className="text-xs font-black text-on-surface uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5 text-primary-container">
          <span className="material-symbols-outlined text-[18px]">manage_search</span>
          Bộ lọc hóa đơn đa năng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-bold text-gray-500">
          
          {/* Keyword Search */}
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

          {/* Property Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Tòa nhà / Tài sản</label>
            <select 
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả tài sản</option>
              <option value="FPT House">FPT House</option>
              <option value="Hòa Hải Studio">Hòa Hải Studio</option>
              <option value="Sơn Trà Mini Apartment">Sơn Trà Mini</option>
              <option value="Ngũ Hành Sơn Rooms">Ngũ Hành Sơn Rooms</option>
              <option value="Hải Châu Apartment">Hải Châu Apt</option>
            </select>
          </div>

          {/* Room Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Phòng / Căn</label>
            <select 
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả phòng</option>
              <option value="201">Phòng 201</option>
              <option value="302">Studio 302</option>
              <option value="105">Căn hộ 105</option>
              <option value="305">Phòng 305</option>
              <option value="103">Phòng 103</option>
              <option value="A1205">Căn A1205</option>
            </select>
          </div>

          {/* Month Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Kỳ thanh toán</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả thời gian</option>
              <option value="Tháng này">Tháng này (05/2026)</option>
              <option value="Tháng trước">Tháng trước (04/2026)</option>
            </select>
          </div>

          {/* Tenant Name Filter */}
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
            onClick={() => triggerToast('Đã áp dụng điều kiện lọc nâng cao')}
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
                  setSelectedIds([]); // reset checklists when tab changes
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

        {/* View mode toggle & sorting */}
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
        <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3.5 animate-scaleUp">
          <div className="flex items-center gap-2.5 text-xs font-bold text-primary-container">
            <span className="material-symbols-outlined text-[20px] font-bold">check_box</span>
            <span>Đã chọn <strong className="text-lg text-primary-container font-black px-0.5">{selectedIds.length}</strong> hóa đơn</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end text-xs font-bold">
            <button 
              onClick={handleBulkExportExcel}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-primary-container hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span> Xuất Excel
            </button>
            <button 
              onClick={handleBulkNotification}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-primary-container hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span> Nhắc nợ
            </button>
            <button 
              onClick={handleBulkMarkPaid}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-primary-container hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">credit_score</span> Đóng đủ
            </button>
            <button 
              onClick={handleBulkCancel}
              className="px-3 py-1.5 bg-red-50 text-red-655 hover:bg-red-100/50 border border-red-150 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">cancel</span> Hủy hóa đơn
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 text-gray-400 hover:text-gray-650 rounded-xl transition-all cursor-pointer outline-none font-bold"
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
              <>
                <button 
                  onClick={() => alert('Đang chuyển hướng tới hướng dẫn chốt hóa đơn dịch vụ...')}
                  className="px-4 py-2 bg-orange-50 text-primary-container hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Xem hướng dẫn chốt
                </button>
                <button 
                  onClick={() => alert('Khởi động trình chốt chỉ số điện nước...')}
                  className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">calculate</span> + Chốt tiền ngay
                </button>
              </>
            )}
          </div>
        </div>

      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-150 soft-shadow overflow-hidden">
          <div className="overflow-x-auto border-0">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 uppercase tracking-wider text-[10px] text-gray-400 font-black">
                  <th className="py-4.5 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                      className="w-4 h-4 text-primary-container accent-primary-container rounded cursor-pointer" 
                    />
                  </th>
                  <th className="py-4.5 px-4 min-w-[150px]">Hóa đơn</th>
                  <th className="py-4.5 px-4">Kỳ hóa đơn</th>
                  <th className="py-4.5 px-4">Phòng / Căn</th>
                  <th className="py-4.5 px-4 min-w-[180px]">Người thuê trọ</th>
                  <th className="py-4.5 px-4 min-w-[160px]">Chi tiết tiền</th>
                  <th className="py-4.5 px-4">Tổng tiền</th>
                  <th className="py-4.5 px-4">Trạng thái</th>
                  <th className="py-4.5 px-4">Hạn đóng</th>
                  <th className="py-4.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
                  const isSelected = selectedIds.includes(list.id);
                  const isOverdueReal = list.status === 'Quá hạn' || (list.status === 'Chưa thanh toán' && new Date(list.dueDate) < new Date());
                  
                  return (
                    <tr 
                      key={list.id} 
                      className={`hover:bg-orange-50/10 transition-colors ${
                        isSelected ? 'bg-orange-50/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4.5 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectOne(list.id)}
                          className="w-4 h-4 text-primary-container accent-primary-container rounded cursor-pointer" 
                        />
                      </td>

                      {/* Invoice Code */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-gray-400">receipt_long</span>
                          <div className="space-y-0.5">
                            <span 
                              onClick={() => alert(`Xem chi tiết hóa đơn: ${list.code}`)}
                              className="font-bold text-gray-800 hover:text-primary-container cursor-pointer text-xs"
                            >
                              {list.code}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold leading-none block">Ngày tạo: {new Date(list.createdDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </td>

                      {/* Payment period */}
                      <td className="py-4.5 px-4 font-bold text-gray-700">
                        Tháng {list.month}
                        <span className="text-[9px] text-gray-400 font-semibold block uppercase">Kỳ hóa đơn</span>
                      </td>

                      {/* Room / Property */}
                      <td className="py-4.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-850 font-black block leading-none">{list.property}</span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px] text-gray-400">home</span>
                            Phòng {list.unit}
                          </span>
                        </div>
                      </td>

                      {/* Tenant detail */}
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

                      {/* Money detail breakdown */}
                      <td className="py-4.5 px-4 text-left">
                        <div className="space-y-0.5 text-[10px] text-gray-400 font-semibold">
                          <div className="flex justify-between max-w-[140px]">
                            <span>Tiền thuê:</span>
                            <span className="text-gray-700 font-bold">{list.rentPrice.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between max-w-[140px]">
                            <span>Điện nước:</span>
                            <span className="text-gray-700 font-bold">{list.utilitiesPrice.toLocaleString('vi-VN')}đ</span>
                          </div>
                          {list.otherPrice > 0 && (
                            <div className="flex justify-between max-w-[140px]">
                              <span>Phí khác:</span>
                              <span className="text-gray-700 font-bold">{list.otherPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total expected/collected */}
                      <td className="py-4.5 px-4 text-xs font-black">
                        <span className="text-primary-container block text-xs">{list.total.toLocaleString('vi-VN')}đ</span>
                        {list.status === 'Thanh toán một phần' && (
                          <div className="text-[9px] text-gray-400 font-semibold leading-normal pt-0.5">
                            <span className="text-green-600 font-bold block">Đã trả: {list.collectedAmount.toLocaleString('vi-VN')}đ</span>
                            <span className="text-red-500 font-bold block">Còn lại: {(list.total - list.collectedAmount).toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badges */}
                      <td className="py-4.5 px-4">
                        <div className="space-y-1">
                          {renderStatusBadge(list.status, list.dueDate)}
                          {isOverdueReal && (
                            <span className="text-[9px] text-red-500 font-black block">Quá hạn đóng!</span>
                          )}
                        </div>
                      </td>

                      {/* Due Date & Countdown */}
                      <td className="py-4.5 px-4">
                        <span className="text-gray-700 font-bold block">{new Date(list.dueDate).toLocaleDateString('vi-VN')}</span>
                        {list.status === 'Đã thanh toán' ? (
                          <span className="text-[9px] text-green-600 font-black flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px] font-bold">check_circle</span> Đóng đủ
                          </span>
                        ) : list.status === 'Đã hủy' ? (
                          <span className="text-[9px] text-gray-400 italic">Đã hủy</span>
                        ) : isOverdueReal ? (
                          <span className="text-[9px] text-red-655 font-black uppercase">Trễ hạn</span>
                        ) : (
                          <span className="text-[9px] text-orange-500 font-bold">Còn 5 ngày</span>
                        )}
                      </td>

                      {/* Operations */}
                      <td className="py-4.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Contextual primary buttons */}
                          {list.status === 'Nháp' && (
                            <button 
                              onClick={() => handleApproveDraft(list)}
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
                              onClick={() => alert(`Đang tải file PDF hóa đơn ${list.code}...`)}
                              className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                              title="Tải hóa đơn dịch vụ"
                            >
                              <span className="material-symbols-outlined text-[12px]">picture_as_pdf</span> Tải bill
                            </button>
                          )}

                          {/* Quick Remind online notifications */}
                          {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                            <button 
                              onClick={() => openSendNotificationModal(list)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-500 hover:text-primary-container rounded-lg transition-colors cursor-pointer"
                              title="Gửi thông báo nhắc thanh toán"
                            >
                              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                            </button>
                          )}

                          {/* More dropdown options */}
                          <div className="relative group/actions">
                            <button 
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">more_vert</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 w-40 z-[1000] hidden group-hover/actions:block text-left text-[11px] font-bold text-gray-600">
                              
                              <button 
                                onClick={() => alert(`Xem chi tiết hóa đơn chốt tiền ${list.code}`)}
                                className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">info</span> Xem chi tiết
                              </button>

                              {(list.status === 'Chưa thanh toán' || list.status === 'Quá hạn' || list.status === 'Thanh toán một phần') && (
                                <button 
                                  onClick={() => openMarkPaidModal(list)}
                                  className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                                >
                                  <span className="material-symbols-outlined text-[14px]">credit_score</span> Đóng đủ (Paid)
                                </button>
                              )}

                              <button 
                                onClick={() => alert(`Xuất tệp báo cáo Excel cho hóa đơn ${list.code}`)}
                                className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                              >
                                <span className="material-symbols-outlined text-[14px]">table</span> Xuất Excel bill
                              </button>

                              {list.status !== 'Đã hủy' && (
                                <button 
                                  onClick={() => openCancelModal(list)}
                                  className="w-full px-3 py-1.5 hover:bg-red-50 hover:text-red-655 flex items-center gap-1.5 cursor-pointer border-t border-gray-50 text-red-500"
                                >
                                  <span className="material-symbols-outlined text-[14px]">cancel</span> Hủy hóa đơn
                                </button>
                              )}

                            </div>
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
                {/* Header Row */}
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
                      <span className="text-[9px] text-gray-400 font-semibold block">Ngày tạo: {new Date(list.createdDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  {renderStatusBadge(list.status, list.dueDate)}
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-gray-650 text-left">
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

                {/* Billing Summary Row */}
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-600 text-left">
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

                {/* Operations footer */}
                <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold text-left">
                    <span>Hạn: <strong className="text-gray-600">{new Date(list.dueDate).toLocaleDateString('vi-VN')}</strong></span>
                    {isOverdueReal && <span className="text-red-655 block font-black uppercase tracking-wider text-[8px] mt-0.5">Quá hạn nợ trọ!</span>}
                  </div>

                  <div className="flex gap-1">
                    
                    {/* Action buttons */}
                    {list.status === 'Nháp' && (
                      <button 
                        onClick={() => handleApproveDraft(list)}
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
                        onClick={() => alert('Đang tải tệp PDF hóa đơn...')}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[9px] font-black uppercase border border-gray-200 cursor-pointer"
                      >
                        Tải bill
                      </button>
                    )}

                    {/* Remind Notification */}
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
            <span>trong tổng số <strong className="text-gray-800 font-extrabold">{filteredInvoices.length}</strong> hóa đơn tháng này</span>
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

            {/* Billing Summary Box */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs font-semibold text-gray-650 space-y-2">
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
              
              {/* Payment Amount Input */}
              <div className="space-y-1">
                <label className="uppercase">Số tiền ghi nhận thanh toán <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-850" 
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black">đ</span>
                </div>
              </div>

              {/* Payment Method Dropdown */}
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
                  <option value="Khác">Phương thức khác</option>
                </select>
              </div>

              {/* Payment Date picker */}
              <div className="space-y-1">
                <label className="uppercase">Ngày thanh toán ghi nhận</label>
                <input 
                  type="date" 
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-xs font-bold text-gray-700 bg-white" 
                />
              </div>

              {/* Notes Area */}
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

              {/* Autocomplete Paid full checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="markFullPay" 
                  checked={markPaidIfFull}
                  onChange={(e) => setMarkPaidIfFull(e.target.checked)}
                  className="w-4.5 h-4.5 text-primary-container accent-primary-container cursor-pointer" 
                />
                <label htmlFor="markFullPay" className="cursor-pointer select-none font-bold text-gray-650 text-[11px]">
                  Tự động chuyển hóa đơn sang **Đã thanh toán** nếu số tiền thu khớp đủ.
                </label>
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
              
              {/* Cancel reason input */}
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

              {/* Confirmation checkbox */}
              <div className="flex items-start gap-2 pt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-left">
                <input 
                  type="checkbox" 
                  id="cancelConfirmCheck" 
                  checked={cancelConfirmed}
                  onChange={(e) => setCancelConfirmed(e.target.checked)}
                  className="w-4 h-4 text-primary-container accent-primary-container mt-0.5 cursor-pointer shrink-0" 
                />
                <label htmlFor="cancelConfirmCheck" className="text-[10px] text-gray-600 font-bold select-none cursor-pointer leading-normal">
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
                className="py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl transition-all shadow-sm cursor-pointer text-center"
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
                Thiết lập phạm vi và định dạng cột dữ liệu hóa đơn bạn muốn xuất ra bảng kê Excel trọ.
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-gray-500">
              
              {/* Range Radio options */}
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
                    <label htmlFor="rangeAll" className="cursor-pointer select-none font-bold text-gray-650">Xuất toàn bộ theo bộ lọc hiện tại ({filteredInvoices.length} bill)</label>
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
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="rangeMonth" 
                      name="rangeOpt" 
                      checked={exportRange === 'month'}
                      onChange={() => setExportRange('month')}
                      className="w-4 h-4 accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="rangeMonth" className="cursor-pointer select-none font-bold text-gray-650">Xuất toàn bộ hóa đơn kỳ này (Tháng 05/2026)</label>
                  </div>
                </div>
              </div>

              {/* Data includes checkboxes */}
              <div className="border-t border-gray-100 pt-2.5 space-y-2">
                <label className="uppercase block mb-1">Cấu hình trường dữ liệu xuất</label>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      id="incUtil" 
                      checked={includeUtilities}
                      onChange={(e) => setIncludeUtilities(e.target.checked)}
                      className="w-4 h-4 accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="incUtil" className="cursor-pointer select-none">Chi tiết điện nước</label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      id="incTenant" 
                      checked={includeTenant}
                      onChange={(e) => setIncludeTenant(e.target.checked)}
                      className="w-4 h-4 accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="incTenant" className="cursor-pointer select-none">SĐT & Thông tin khách</label>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <input 
                      type="checkbox" 
                      id="incStat" 
                      checked={includeStatus}
                      onChange={(e) => setIncludeStatus(e.target.checked)}
                      className="w-4 h-4 accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="incStat" className="cursor-pointer select-none">Bao gồm trạng thái công nợ thanh toán</label>
                  </div>
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

            {/* Offline Alert if tenant offline */}
            {!activeInvoice.isLinked ? (
              <div className="bg-red-50 border border-red-150 p-3 rounded-2xl flex items-start gap-2 text-red-800 animate-scaleUp">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                <p className="text-[9.5px] leading-relaxed font-semibold">
                  <span className="font-black uppercase block mb-0.5">Khách thuê trọ Offline!</span>
                  Người thuê **{activeInvoice.tenantName}** chưa kích hoạt tài khoản RoomHub Linked trực tuyến. Bạn không thể gửi thông báo trực tiếp qua ứng dụng. Vui lòng xuất bill Excel/PDF gửi qua Zalo/SMS.
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

    </div>
  );
};

export default InvoiceList;
