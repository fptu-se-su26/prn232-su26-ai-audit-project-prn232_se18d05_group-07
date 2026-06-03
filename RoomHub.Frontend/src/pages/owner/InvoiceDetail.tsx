import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';

interface InvoiceDetailProps {
  invoiceId: string | null;
  setCurrentPage: (page: PageType) => void;
}

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  method: 'Tiền mặt' | 'Chuyển khoản' | 'Ví điện tử' | 'Khác';
  recordedBy: string;
  notes?: string;
  type: 'Thanh toán một phần' | 'Thanh toán phần còn lại' | 'Thanh toán toàn bộ';
}

interface InvoiceState {
  id: string;
  billingMonth: string;
  createdDate: string;
  dueDate: string;
  status: 'Nháp' | 'Chưa thanh toán' | 'Thanh toán một phần' | 'Đã thanh toán' | 'Quá hạn' | 'Đã hủy';
  paidAmount: number;
  rentPrice: number;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  fixedFeesBreakdown: { label: string; amount: number }[];
  surcharge: number;
  surchargeNote: string;
  discount: number;
  notes: string;
  lastUpdatedNote?: string;
  paymentHistory: PaymentHistoryItem[];
}

// Initial Mock Invoice Data matching Part S
const INITIAL_INVOICE: InvoiceState = {
  id: 'INV-0526-001',
  billingMonth: '05/2026',
  createdDate: '25/05/2026',
  dueDate: '05/06/2026',
  status: 'Chưa thanh toán',
  paidAmount: 0,
  rentPrice: 2500000,
  oldElectric: 120,
  newElectric: 240,
  oldWater: 30,
  newWater: 34,
  fixedFeesBreakdown: [
    { label: 'Internet', amount: 100000 },
    { label: 'Phí rác', amount: 30000 },
    { label: 'Phí giữ xe', amount: 50000 }
  ],
  surcharge: 150000,
  surchargeNote: 'Phí vệ sinh cuối tháng',
  discount: 0,
  notes: 'Người thuê xin thanh toán trễ 2 ngày để nhận lương.',
  lastUpdatedNote: 'Cập nhật lần cuối bởi Nguyễn Văn Owner vào 30/05/2026.',
  paymentHistory: []
};

const OWNER_INFO = {
  name: 'Nguyễn Văn Owner',
  phone: '0909 999 999',
  email: 'owner@roomhub.com'
};

const TENANT_INFO = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  phone: '0909 123 456',
  status: 'Đang thuê',
  isLinked: true,
  startDate: '01/03/2026'
};

const UNIT_INFO = {
  propertyName: 'FPT House',
  unitName: 'Phòng 201',
  unitType: 'Phòng trọ',
  area: 25,
  rentPrice: 2500000,
  status: 'Đang thuê',
  address: 'Hòa Hải, Ngũ Hành Sơn, Đà Nẵng'
};

const ELECTRIC_PRICE = 3500;
const WATER_PRICE = 15000;

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId, setCurrentPage }) => {
  // We use our local state to allow simulation and demoing of payments, updates, notes, etc.
  const [invoice, setInvoice] = useState<InvoiceState>({
    ...INITIAL_INVOICE,
    id: invoiceId || INITIAL_INVOICE.id
  });

  // User input note states
  const [editingNote, setEditingNote] = useState<string>(invoice.notes);
  
  // Modals visibility
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Export Modal specific state options
  const [exportOptions, setExportOptions] = useState({
    includeOwner: true,
    includeTenant: true,
    includeUnit: true,
    includeElectricWater: true,
    includeFixedFees: true,
    includeSurchargeDiscount: true,
    includeStatus: true,
    includeNotes: true,
    includePaymentHistory: true
  });
  const [fileName, setFileName] = useState(`HoaDon_${invoice.id}_NguyenVanA_05-2026.xlsx`);
  const [exportModel, setExportModel] = useState<'detail' | 'compact' | 'tenant'>('detail');
  const [exportProgress, setExportProgress] = useState<'idle' | 'generating' | 'success'>('idle');

  // Record Payment Modal states
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Tiền mặt' | 'Chuyển khoản' | 'Ví điện tử' | 'Khác'>('Chuyển khoản');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [markPaidIfEnough, setMarkPaidIfEnough] = useState<boolean>(true);

  // Send Notification Modal states
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  // Cancel Invoice Modal states
  const [cancelReason, setCancelReason] = useState<string>('');
  const [confirmCancelCheck, setConfirmCancelCheck] = useState<boolean>(false);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Synchronize dynamic defaults when modal opens
  useEffect(() => {
    if (isRecordModalOpen) {
      setPaymentAmount((calculateTotal() - invoice.paidAmount).toString());
    }
  }, [isRecordModalOpen, invoice.paidAmount]);

  useEffect(() => {
    setNotificationMsg(
      `Chào bạn, RoomHub đã cập nhật hóa đơn thuê tháng ${invoice.billingMonth} của bạn. Vui lòng kiểm tra chi tiết trong ứng dụng RoomHub để thanh toán trước ngày ${invoice.dueDate}. Cảm ơn bạn!`
    );
  }, [invoice.billingMonth, invoice.dueDate]);

  // Calculators matching prompt details
  const getElectricUsage = () => invoice.newElectric - invoice.oldElectric;
  const getWaterUsage = () => invoice.newWater - invoice.oldWater;

  const calculateElectricCost = () => getElectricUsage() * ELECTRIC_PRICE;
  const calculateWaterCost = () => getWaterUsage() * WATER_PRICE;
  const calculateFixedFeesSum = () => invoice.fixedFeesBreakdown.reduce((acc, curr) => acc + curr.amount, 0);

  const calculateTotal = () => {
    if (invoice.status === 'Đã hủy') return 0;
    const rent = invoice.rentPrice;
    const elec = calculateElectricCost();
    const wat = calculateWaterCost();
    const fixed = calculateFixedFeesSum();
    const sur = invoice.surcharge;
    const disc = invoice.discount;
    return rent + elec + wat + fixed + sur - disc;
  };

  const getRemainingBalance = () => {
    const total = calculateTotal();
    return Math.max(0, total - invoice.paidAmount);
  };

  // State manipulation handlers (Simulating backend updates for demonstration)
  const saveNoteHandler = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ngày ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    setInvoice(prev => ({
      ...prev,
      notes: editingNote,
      lastUpdatedNote: `Cập nhật lần cuối bởi Nguyễn Văn Owner vào lúc ${timeStr}.`
    }));
    triggerToast('Đã lưu ghi chú hóa đơn thành công!');
  };

  const recordPaymentHandler = () => {
    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Vui lòng nhập số tiền thanh toán hợp lệ.');
      return;
    }

    const total = calculateTotal();
    const newPaidAmount = invoice.paidAmount + amt;
    const remaining = Math.max(0, total - newPaidAmount);

    let newStatus: InvoiceState['status'] = 'Thanh toán một phần';
    let paymentType: PaymentHistoryItem['type'] = 'Thanh toán một phần';

    if (remaining === 0 || (markPaidIfEnough && newPaidAmount >= total)) {
      newStatus = 'Đã thanh toán';
      paymentType = invoice.paidAmount === 0 ? 'Thanh toán toàn bộ' : 'Thanh toán phần còn lại';
    }

    const newPayment: PaymentHistoryItem = {
      id: `PAY-${Date.now().toString().substring(8)}`,
      date: paymentDate.split('-').reverse().join('/'),
      amount: amt,
      method: paymentMethod,
      recordedBy: OWNER_INFO.name,
      notes: paymentNotes || 'Ghi nhận thanh toán ngoài hệ thống',
      type: paymentType
    };

    setInvoice(prev => ({
      ...prev,
      paidAmount: Math.min(total, newPaidAmount),
      status: newStatus,
      paymentHistory: [...prev.paymentHistory, newPayment]
    }));

    setIsRecordModalOpen(false);
    setPaymentNotes('');
    triggerToast(`Ghi nhận thanh toán ${amt.toLocaleString()}đ thành công!`);
  };

  const cancelInvoiceHandler = () => {
    if (!confirmCancelCheck) {
      alert('Vui lòng tích chọn xác nhận hủy hóa đơn.');
      return;
    }
    setInvoice(prev => ({
      ...prev,
      status: 'Đã hủy',
      paidAmount: 0
    }));
    setIsCancelModalOpen(false);
    setCancelReason('');
    setConfirmCancelCheck(false);
    triggerToast('Đã hủy hóa đơn trọ thành công!', 'warning');
  };

  const markQuickPaid = () => {
    const balance = getRemainingBalance();
    if (balance <= 0) return;
    
    const quickPayment: PaymentHistoryItem = {
      id: `PAY-${Date.now().toString().substring(8)}`,
      date: new Date().toLocaleDateString('vi-VN'),
      amount: balance,
      method: 'Chuyển khoản',
      recordedBy: OWNER_INFO.name,
      notes: 'Đánh dấu đã thanh toán 1-click đóng đủ',
      type: invoice.paidAmount === 0 ? 'Thanh toán toàn bộ' : 'Thanh toán phần còn lại'
    };

    setInvoice(prev => ({
      ...prev,
      paidAmount: calculateTotal(),
      status: 'Đã thanh toán',
      paymentHistory: [...prev.paymentHistory, quickPayment]
    }));

    triggerToast('Đã đánh dấu thanh toán thành công hóa đơn!');
  };

  const handleExportSubmit = () => {
    setExportProgress('generating');
    setTimeout(() => {
      setExportProgress('success');
    }, 2000);
  };

  // Determine status color configurations for badges
  const getStatusConfig = (status: InvoiceState['status']) => {
    switch (status) {
      case 'Nháp':
        return { bg: 'bg-gray-100 border-gray-200 text-gray-700', text: 'Văn bản nháp', labelBg: 'bg-gray-500' };
      case 'Chưa thanh toán':
        return { bg: 'bg-orange-50 border-orange-200 text-primary-container', text: 'Chưa thanh toán', labelBg: 'bg-orange-500' };
      case 'Thanh toán một phần':
        return { bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'Thanh toán 1 phần', labelBg: 'bg-blue-500' };
      case 'Đã thanh toán':
        return { bg: 'bg-green-50 border-green-200 text-green-700', text: 'Đã thanh toán', labelBg: 'bg-green-500' };
      case 'Quá hạn':
        return { bg: 'bg-red-50 border-red-200 text-red-700', text: 'Đã quá hạn', labelBg: 'bg-red-500' };
      case 'Đã hủy':
        return { bg: 'bg-gray-200 border-gray-300 text-gray-500 line-through', text: 'Đã hủy bỏ', labelBg: 'bg-gray-400' };
    }
  };

  const statusStyle = getStatusConfig(invoice.status);

  return (
    <div className="space-y-6 pb-20 relative">
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

      {/* PART A: Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="space-y-2">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-invoices')}>Hóa đơn & Chốt tiền</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-gray-400 font-bold">{invoice.id}</span>
          </nav>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-on-surface">Hóa đơn {invoice.id}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${statusStyle.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.labelBg}`} />
                {statusStyle.text}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Kỳ thanh toán tháng {invoice.billingMonth} · {UNIT_INFO.unitName} · {UNIT_INFO.propertyName}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500 font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-gray-400">person</span>
              Người thuê: <span className="text-on-surface">{TENANT_INFO.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-gray-400">calendar_today</span>
              Hạn thanh toán: <span className="text-on-surface">{invoice.dueDate}</span>
            </span>
          </div>
        </div>

        {/* Dynamic header button actions based on payment status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-primary-container rounded-xl text-xs font-bold text-gray-700 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            <span>Xuất Excel</span>
          </button>

          {invoice.status !== 'Đã thanh toán' && invoice.status !== 'Đã hủy' ? (
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Ghi nhận thanh toán</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (invoice.status === 'Đã hủy') {
                  triggerToast('Hóa đơn đã bị hủy bỏ!', 'warning');
                  return;
                }
                markQuickPaid();
              }}
              disabled={invoice.status === 'Đã thanh toán'}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 disabled:bg-green-50 disabled:text-green-700 disabled:border-green-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer disabled:cursor-default"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Đã hoàn tất thu</span>
            </button>
          )}

          {invoice.status !== 'Đã hủy' && (
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 hover:bg-orange-50 text-gray-500 hover:text-primary-container rounded-xl transition-all shadow-sm cursor-pointer"
              title="Gửi thông báo nhắc tiền"
            >
              <span className="material-symbols-outlined text-[20px]">campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* PART B: Invoice Status Warning/Action Banner */}
      {invoice.status === 'Chưa thanh toán' && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary-container text-[22px] font-bold">pending_actions</span>
            <div>
              <h4 className="text-xs font-extrabold text-orange-800">Hóa đơn Chưa thanh toán</h4>
              <p className="text-[10px] text-orange-600 mt-0.5">Khách thuê cần thanh toán hóa đơn dịch vụ này trước ngày {invoice.dueDate}.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-orange-100/50 text-primary-container text-[10px] font-extrabold rounded-lg border border-orange-200 transition-colors cursor-pointer"
            >
              Gửi nhắc thanh toán
            </button>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3 py-1.5 bg-primary-container hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Ghi nhận đóng tiền
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'Quá hạn' && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-red-500 text-[22px] font-bold">error_outline</span>
            <div>
              <h4 className="text-xs font-extrabold text-red-800">Hóa đơn đã quá hạn 5 ngày!</h4>
              <p className="text-[10px] text-red-600 mt-0.5">Thời hạn thanh toán đã trễ từ ngày {invoice.dueDate}. Hãy liên hệ trực tiếp hoặc gửi thông báo cảnh cáo đóng tiền trọ.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
            >
              Gửi nhắc đóng nợ gấp
            </button>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3 py-1.5 bg-primary-container hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Ghi nhận đóng tiền
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'Thanh toán một phần' && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-500 text-[22px] font-bold">hourglass_top</span>
            <div>
              <h4 className="text-xs font-extrabold text-blue-800">Hóa đơn đã thanh toán một phần</h4>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Người thuê mới đóng {invoice.paidAmount.toLocaleString()}đ. Số dư nợ còn lại là <span className="font-bold font-mono text-xs">{getRemainingBalance().toLocaleString()}đ</span> cần truy thu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-blue-100/50 text-blue-800 text-[10px] font-extrabold rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Gửi nhắc nợ phần còn lại
            </button>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3 py-1.5 bg-primary-container hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Ghi nhận thu thêm
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'Đã thanh toán' && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-green-500 text-[22px] font-bold">verified_user</span>
            <div>
              <h4 className="text-xs font-extrabold text-green-800">Hóa đơn đã hoàn thành đóng tiền</h4>
              <p className="text-[10px] text-green-600 mt-0.5">Số tiền trọ 100% của hóa đơn đã được đóng đầy đủ. Toàn bộ dư nợ của phòng này trong tháng đã xóa bỏ.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
            >
              Xuất Excel lưu trữ
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'Đã hủy' && (
        <div className="bg-gray-150 border border-gray-250 p-4 rounded-2xl flex items-start gap-2.5 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-gray-500 text-[22px] font-bold">cancel</span>
          <div>
            <h4 className="text-xs font-extrabold text-gray-700">Hóa đơn này đã bị hủy bỏ</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Mọi khoản tính toán và doanh thu của hóa đơn này đã được loại bỏ hoàn toàn khỏi sổ ghi nợ của tòa nhà.</p>
          </div>
        </div>
      )}

      {/* PART C: Invoice Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card 1 - Tổng tiền */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">receipt</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng tiền</p>
            <p className="text-base font-black text-on-surface font-mono mt-0.5">{calculateTotal().toLocaleString()}đ</p>
          </div>
        </div>

        {/* Card 2 - Đã thanh toán */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Đã trả</p>
            <p className="text-base font-black text-green-700 font-mono mt-0.5">{invoice.paidAmount.toLocaleString()}đ</p>
          </div>
        </div>

        {/* Card 3 - Còn lại */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100/50 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">wallet</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Còn lại</p>
            <p className="text-base font-black text-orange-700 font-mono mt-0.5">{getRemainingBalance().toLocaleString()}đ</p>
          </div>
        </div>

        {/* Card 4 - Hạn chót */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">event_note</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Hạn đóng</p>
            <p className="text-xs font-bold text-on-surface mt-0.5">{invoice.dueDate}</p>
            <p className="text-[8px] text-gray-400 font-medium">
              {invoice.status === 'Đã thanh toán' ? 'Đã thu xong' : invoice.status === 'Quá hạn' ? 'Đã trễ 5 ngày' : 'Còn lại 6 ngày'}
            </p>
          </div>
        </div>

        {/* Card 5 - Trạng thái */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-sm col-span-2 md:col-span-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">credit_score</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</p>
            <p className="text-xs font-extrabold text-on-surface mt-0.5 truncate">{statusStyle.text}</p>
          </div>
        </div>
      </div>

      {/* PART D: Two Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Invoice document sheet A4 preview & breakdowns */}
        <div className="lg:col-span-2 space-y-6">

          {/* PART E: A4 Invoice Bill Preview */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Bản xem trước hóa đơn</h3>
                <p className="text-[10px] text-gray-400">Hình ảnh biểu hóa đơn thực tế in ra giấy hoặc hiển thị trên máy người thuê trọ.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">print</span> In hóa đơn
                </button>
              </div>
            </div>

            {/* A4 Paper mockup sheet */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-8 md:p-12 relative overflow-hidden font-serif max-w-2xl mx-auto border-t-8 border-t-orange-500">
              
              {/* PAID stamp banner graphic overlay */}
              {invoice.status === 'Đã thanh toán' && (
                <div className="absolute right-8 top-16 w-28 h-28 border-4 border-dashed border-green-500 text-green-500 font-sans font-black flex items-center justify-center rounded-full rotate-12 opacity-85 select-none uppercase text-center text-xs leading-none shadow-sm animate-scaleUp z-20">
                  <div>
                    <span className="text-[10px] block font-bold">RoomHub</span>
                    <span>ĐÃ THU</span>
                    <span className="text-[8px] block font-medium mt-0.5">03/06/2026</span>
                  </div>
                </div>
              )}
              {invoice.status === 'Đã hủy' && (
                <div className="absolute right-8 top-16 w-28 h-28 border-4 border-dashed border-gray-400 text-gray-400 font-sans font-black flex items-center justify-center rounded-full rotate-12 opacity-80 select-none uppercase text-center text-xs leading-none shadow-sm z-20">
                  <div>
                    <span className="text-[10px] block font-bold">RoomHub</span>
                    <span>ĐÃ HỦY</span>
                  </div>
                </div>
              )}

              {/* Bill Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-primary-container font-sans font-bold text-xl">
                    <span className="material-symbols-outlined text-[24px] font-bold">roofing</span>
                    <span>RoomHub</span>
                  </div>
                  <p className="text-xs text-gray-500 font-sans font-medium uppercase tracking-wider">Hóa đơn dịch vụ thuê trọ</p>
                </div>
                <div className="text-left sm:text-right text-xs font-sans space-y-1">
                  <p><span className="text-gray-400 font-bold">Mã số:</span> <span className="font-bold font-mono">{invoice.id}</span></p>
                  <p><span className="text-gray-400 font-bold">Kỳ hạn:</span> <span className="font-bold">{invoice.billingMonth}</span></p>
                  <p><span className="text-gray-400 font-bold">Ngày tạo:</span> {invoice.createdDate}</p>
                  <p><span className="text-gray-400 font-bold text-red-500">Hạn đóng:</span> <span className="font-bold text-red-600">{invoice.dueDate}</span></p>
                </div>
              </div>

              {/* Owner and Tenant side-by-side details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-200 text-xs font-sans leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">Thông tin chủ nhà</h4>
                  <p className="font-extrabold text-on-surface text-sm">{OWNER_INFO.name}</p>
                  <p><span className="text-gray-500 font-semibold">Điện thoại:</span> {OWNER_INFO.phone}</p>
                  <p><span className="text-gray-500 font-semibold">Email:</span> {OWNER_INFO.email}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">Thông tin khách thuê</h4>
                  <p className="font-extrabold text-on-surface text-sm">{TENANT_INFO.name}</p>
                  <p><span className="text-gray-500 font-semibold">Điện thoại:</span> {TENANT_INFO.phone}</p>
                  <p><span className="text-gray-500 font-semibold">Căn phòng:</span> <span className="font-bold">{UNIT_INFO.unitName} · {UNIT_INFO.propertyName}</span></p>
                  <p className="text-[10px] text-gray-400 font-medium italic">{UNIT_INFO.address}</p>
                </div>
              </div>

              {/* Fee breakdown invoice table */}
              <div className="py-6 font-sans">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold text-[10px] uppercase">
                      <th className="py-2.5 w-10 text-center">STT</th>
                      <th className="py-2.5">Khoản mục thu</th>
                      <th className="py-2.5 text-center w-24">Chỉ số / Số lượng</th>
                      <th className="py-2.5 text-right w-24">Đơn giá (đ)</th>
                      <th className="py-2.5 text-right w-28">Thành tiền (đ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-semibold text-gray-700">
                    {/* 1. Rent room fee */}
                    <tr>
                      <td className="py-3 text-center text-gray-400 font-medium">1</td>
                      <td className="py-3 font-bold text-on-surface">Tiền thuê phòng</td>
                      <td className="py-3 text-center">1 tháng</td>
                      <td className="py-3 text-right">{invoice.rentPrice.toLocaleString()}</td>
                      <td className="py-3 text-right text-on-surface font-extrabold">{invoice.rentPrice.toLocaleString()}</td>
                    </tr>

                    {/* 2. Electricity cost */}
                    <tr>
                      <td className="py-3 text-center text-gray-400 font-medium">2</td>
                      <td className="py-3">
                        <p className="font-bold text-on-surface">Tiền điện tiêu thụ</p>
                        <p className="text-[9px] text-gray-400 font-medium italic mt-0.5">(Chỉ số điện: Cũ: {invoice.oldElectric} - Mới: {invoice.newElectric})</p>
                      </td>
                      <td className="py-3 text-center font-mono">{getElectricUsage()} kWh</td>
                      <td className="py-3 text-right font-mono">{ELECTRIC_PRICE.toLocaleString()}</td>
                      <td className="py-3 text-right text-on-surface font-extrabold font-mono">{calculateElectricCost().toLocaleString()}</td>
                    </tr>

                    {/* 3. Water cost */}
                    <tr>
                      <td className="py-3 text-center text-gray-400 font-medium">3</td>
                      <td className="py-3">
                        <p className="font-bold text-on-surface">Tiền nước tiêu thụ</p>
                        <p className="text-[9px] text-gray-400 font-medium italic mt-0.5">(Chỉ số nước: Cũ: {invoice.oldWater} - Mới: {invoice.newWater})</p>
                      </td>
                      <td className="py-3 text-center font-mono">{getWaterUsage()} m³</td>
                      <td className="py-3 text-right font-mono">{WATER_PRICE.toLocaleString()}</td>
                      <td className="py-3 text-right text-on-surface font-extrabold font-mono">{calculateWaterCost().toLocaleString()}</td>
                    </tr>

                    {/* Fixed fees mapped dynamically */}
                    {invoice.fixedFeesBreakdown.map((fee, idx) => (
                      <tr key={idx}>
                        <td className="py-3 text-center text-gray-400 font-medium">{4 + idx}</td>
                        <td className="py-3 font-bold text-on-surface">{fee.label}</td>
                        <td className="py-3 text-center">1 tháng</td>
                        <td className="py-3 text-right font-mono">{fee.amount.toLocaleString()}</td>
                        <td className="py-3 text-right text-on-surface font-extrabold font-mono">{fee.amount.toLocaleString()}</td>
                      </tr>
                    ))}

                    {/* Surcharges if active */}
                    {invoice.surcharge > 0 && (
                      <tr>
                        <td className="py-3 text-center text-gray-400 font-medium">{4 + invoice.fixedFeesBreakdown.length}</td>
                        <td className="py-3">
                          <p className="font-bold text-on-surface">Phụ thu phát sinh</p>
                          <p className="text-[9px] text-gray-400 font-medium italic mt-0.5">({invoice.surchargeNote})</p>
                        </td>
                        <td className="py-3 text-center">-</td>
                        <td className="py-3 text-right font-mono">{invoice.surcharge.toLocaleString()}</td>
                        <td className="py-3 text-right text-on-surface font-extrabold font-mono">{invoice.surcharge.toLocaleString()}</td>
                      </tr>
                    )}

                    {/* Discount if active */}
                    {invoice.discount > 0 && (
                      <tr className="text-red-600">
                        <td className="py-3 text-center text-gray-300 font-medium">{5 + invoice.fixedFeesBreakdown.length}</td>
                        <td className="py-3 font-bold">Giảm trừ chiết khấu</td>
                        <td className="py-3 text-center">-</td>
                        <td className="py-3 text-right">-</td>
                        <td className="py-3 text-right font-extrabold font-mono">-{invoice.discount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bill Totals calculation display block */}
              <div className="border-t-2 border-gray-300 pt-4 flex justify-end font-sans">
                <div className="w-64 space-y-2 text-xs font-bold text-gray-500">
                  <div className="flex justify-between">
                    <span>Cộng tiền tạm tính:</span>
                    <span className="text-on-surface font-mono">{calculateTotal().toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá trừ chiết:</span>
                    <span className="text-red-500 font-mono">-{invoice.discount.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold text-primary-container border-t border-gray-250 pt-2 text-base">
                    <span>TỔNG THANH TOÁN:</span>
                    <span className="font-mono font-black text-lg text-primary-container">{calculateTotal().toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              {/* Signature section */}
              <div className="mt-12 grid grid-cols-2 gap-4 text-center text-xs font-sans pt-6 border-t border-dashed border-gray-200">
                <div className="space-y-12">
                  <p className="font-bold text-gray-500 uppercase text-[9px] tracking-wider">Khách ký nhận</p>
                  <div>
                    <p className="font-extrabold text-on-surface">{TENANT_INFO.name}</p>
                    <p className="text-[10px] text-gray-400">Ngày ký: .../..../2026</p>
                  </div>
                </div>
                <div className="space-y-12">
                  <p className="font-bold text-gray-500 uppercase text-[9px] tracking-wider">Đơn vị quản lý trọ</p>
                  <div>
                    <p className="font-extrabold text-on-surface">{OWNER_INFO.name}</p>
                    <p className="text-[10px] text-gray-400">Đại diện chủ sở hữu</p>
                  </div>
                </div>
              </div>

              {/* Bill Footer info text */}
              <div className="mt-8 pt-4 border-t border-gray-100 text-center font-sans">
                <p className="text-[9px] text-gray-400 leading-normal max-w-md mx-auto">
                  Hóa đơn được khởi tạo tự động bởi nền tảng RoomHub. Người thuê có thể thanh toán trực tiếp qua cổng liên kết ngân hàng trực tuyến của RoomHub hoặc thanh toán ngoài hệ thống.
                </p>
              </div>

            </div>
          </div>

          {/* PART F: Invoice Breakdown card detail */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">query_stats</span>
              Chi tiết tính toán nội bộ chủ nhà
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-bold text-gray-600 bg-gray-50 p-4.5 rounded-2xl">
              
              {/* Electricity usage block breakdown */}
              <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 md:pr-4">
                <h4 className="text-[10px] text-gray-400 uppercase font-black">Điện sinh hoạt</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Chỉ số mới:</span>
                    <span className="text-on-surface font-mono">{invoice.newElectric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chỉ số cũ:</span>
                    <span className="text-on-surface font-mono">{invoice.oldElectric}</span>
                  </div>
                  <div className="flex justify-between text-primary-container">
                    <span>Chênh lệch dùng:</span>
                    <span>{getElectricUsage()} kWh</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200/50 pt-1.5 text-on-surface">
                    <span>Đơn giá:</span>
                    <span>{ELECTRIC_PRICE.toLocaleString()}đ/kWh</span>
                  </div>
                </div>
              </div>

              {/* Water usage block breakdown */}
              <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 md:pr-4">
                <h4 className="text-[10px] text-gray-400 uppercase font-black">Nước sạch</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Chỉ số mới:</span>
                    <span className="text-on-surface font-mono">{invoice.newWater}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chỉ số cũ:</span>
                    <span className="text-on-surface font-mono">{invoice.oldWater}</span>
                  </div>
                  <div className="flex justify-between text-primary-container">
                    <span>Chênh lệch dùng:</span>
                    <span>{getWaterUsage()} m³</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200/50 pt-1.5 text-on-surface">
                    <span>Đơn giá:</span>
                    <span>{WATER_PRICE.toLocaleString()}đ/m³</span>
                  </div>
                </div>
              </div>

              {/* Adjustments block breakdown */}
              <div className="space-y-2 pb-1.5">
                <h4 className="text-[10px] text-gray-400 uppercase font-black">Các khoản phát sinh</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-green-600">
                    <span>Phụ thu (+):</span>
                    <span>+{invoice.surcharge.toLocaleString()}đ</span>
                  </div>
                  {invoice.surcharge > 0 && (
                    <p className="text-[9px] text-gray-400 font-medium italic leading-none pl-1 truncate max-w-[150px]">
                      ({invoice.surchargeNote})
                    </p>
                  )}
                  <div className="flex justify-between text-red-500">
                    <span>Giảm giá chiết (-):</span>
                    <span>-{invoice.discount.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200/50 pt-1.5 text-on-surface">
                    <span>Phí cố định:</span>
                    <span>{calculateFixedFeesSum().toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PART I: Payment History */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">history</span>
              Lịch sử ghi nhận thanh toán
            </h3>

            {invoice.paymentHistory.length === 0 ? (
              /* Empty state payments */
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2">payments</span>
                <p className="text-xs font-bold text-gray-500">Chưa có khoản thanh toán nào được ghi nhận cho hóa đơn này.</p>
                {invoice.status !== 'Đã hủy' && (
                  <button
                    onClick={() => setIsRecordModalOpen(true)}
                    className="mt-3.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary-container text-xs font-bold rounded-xl border border-orange-100 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                    Ghi nhận thanh toán đầu tiên
                  </button>
                )}
              </div>
            ) : (
              /* Payment timeline history table list */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 font-bold text-[10px] uppercase">
                      <th className="py-2">Mã giao dịch</th>
                      <th className="py-2">Ngày đóng</th>
                      <th className="py-2 text-right">Số tiền</th>
                      <th className="py-2 text-center">Phương thức</th>
                      <th className="py-2">Ghi chú xác nhận</th>
                      <th className="py-2">Phân loại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                    {invoice.paymentHistory.map((pay) => (
                      <tr key={pay.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono font-bold text-on-surface">{pay.id}</td>
                        <td className="py-3 text-gray-500">{pay.date}</td>
                        <td className="py-3 text-right text-on-surface font-extrabold font-mono">{pay.amount.toLocaleString()}đ</td>
                        <td className="py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-100 text-primary-container text-[9px] font-extrabold">
                            {pay.method}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 max-w-[150px] truncate" title={pay.notes}>
                          {pay.notes}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                            pay.type === 'Thanh toán toàn bộ' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {pay.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PART O: Notes section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">sticky_note_2</span>
              Ghi chú hóa đơn từ chủ sở hữu
            </h3>

            <div className="space-y-3">
              <textarea
                rows={3}
                disabled={invoice.status === 'Đã hủy'}
                placeholder="Nhập ghi chú cho hóa đơn này (Ví dụ: Khách xin trả chậm, hoặc đã chuyển cọc trước...)"
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:bg-white focus:border-primary-container disabled:bg-gray-100"
              />
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[9px] text-gray-400 font-semibold">{invoice.lastUpdatedNote}</span>
                {invoice.status !== 'Đã hủy' && (
                  <button
                    onClick={saveNoteHandler}
                    className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    Lưu ghi chú
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Tenant info, Room info & actions sidebar panel */}
        <div className="space-y-6">
          
          {/* PART J: Actions Panel */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface border-b border-gray-100 pb-3">Thao tác hóa đơn</h3>
            
            <div className="flex flex-col gap-2 font-bold text-xs">
              {/* Conditional Action Buttons based on status */}
              {invoice.status !== 'Đã thanh toán' && invoice.status !== 'Đã hủy' && (
                <button
                  onClick={() => setIsRecordModalOpen(true)}
                  className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Ghi nhận thanh toán</span>
                </button>
              )}

              {invoice.status !== 'Đã thanh toán' && invoice.status !== 'Đã hủy' && (
                <button
                  onClick={markQuickPaid}
                  className="w-full py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-100 hover:text-primary-container text-gray-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-green-500 font-bold">check_circle</span>
                  <span>Đánh dấu đã đóng đủ</span>
                </button>
              )}

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-100 hover:text-primary-container text-gray-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] text-green-600">download_for_offline</span>
                <span>Xuất tệp hóa đơn Excel</span>
              </button>

              {invoice.status !== 'Đã hủy' && (
                <button
                  onClick={() => setIsNotifyModalOpen(true)}
                  className="w-full py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-100 hover:text-primary-container text-gray-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-500">campaign</span>
                  <span>Gửi tin nhắc hóa đơn</span>
                </button>
              )}

              {invoice.status === 'Nháp' && (
                <button
                  onClick={() => {
                    setInvoice(prev => ({ ...prev, status: 'Chưa thanh toán' }));
                    triggerToast('Đã phát hành hóa đơn thành công!');
                  }}
                  className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>Phát hành hóa đơn</span>
                </button>
              )}

              {invoice.status !== 'Đã hủy' && invoice.status !== 'Đã thanh toán' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>Hủy bỏ hóa đơn này</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(invoice.id);
                  triggerToast('Đã sao chép mã hóa đơn vào clipboard!');
                }}
                className="w-full py-2 text-center text-gray-500 hover:text-on-surface hover:underline cursor-pointer"
              >
                Sao chép mã số hóa đơn
              </button>
            </div>
          </div>

          {/* PART G: Tenant Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">person</span>
              Người thuê phòng
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100 text-primary-container font-black text-sm flex items-center justify-center">
                {TENANT_INFO.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-on-surface text-sm">{TENANT_INFO.name}</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[8px] font-extrabold border border-green-100 mt-0.5">
                  {TENANT_INFO.isLinked ? 'Liên kết RoomHub' : 'Khách Offline'}
                </span>
              </div>
            </div>

            <div className="text-xs font-bold text-gray-600 space-y-2 pt-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Số điện thoại:</span>
                <span className="text-on-surface">{TENANT_INFO.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-on-surface text-[10px] truncate max-w-[150px]" title={TENANT_INFO.email}>
                  {TENANT_INFO.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày dọn vào:</span>
                <span className="text-on-surface">{TENANT_INFO.startDate}</span>
              </div>
            </div>

            <button
              onClick={() => alert('Mở chi tiết khách thuê...')}
              className="w-full py-2 bg-gray-50 hover:bg-orange-50 text-[10px] font-extrabold text-primary-container border border-gray-150 rounded-xl transition-all cursor-pointer text-center"
            >
              Xem hồ sơ người thuê
            </button>
          </div>

          {/* PART H: Unit Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-on-surface border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">corporate_fare</span>
              Căn hộ & Phòng trọ
            </h3>

            <div className="space-y-1">
              <h4 className="font-extrabold text-on-surface text-sm">{UNIT_INFO.unitName} · {UNIT_INFO.propertyName}</h4>
              <p className="text-[10px] text-gray-500 font-medium">{UNIT_INFO.address}</p>
            </div>

            <div className="text-xs font-bold text-gray-600 space-y-2 pt-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Loại bất động sản:</span>
                <span className="text-on-surface">{UNIT_INFO.unitType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Diện tích phòng:</span>
                <span className="text-on-surface font-mono">{UNIT_INFO.area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Giá thuê gốc:</span>
                <span className="text-on-surface font-mono">{UNIT_INFO.rentPrice.toLocaleString()}đ/tháng</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  window.location.hash = `#/owner/units/unit-1`;
                }}
                className="py-2 bg-gray-50 hover:bg-orange-50 text-[9px] font-extrabold text-primary-container border border-gray-150 rounded-xl transition-all cursor-pointer text-center"
              >
                Vào chốt điện nước
              </button>
              <button
                onClick={() => {
                  window.location.hash = `#/owner/properties/1`;
                }}
                className="py-2 bg-gray-50 hover:bg-orange-50 text-[9px] font-extrabold text-primary-container border border-gray-150 rounded-xl transition-all cursor-pointer text-center"
              >
                Xem sơ đồ tầng
              </button>
            </div>
          </div>

        </div>

      </div>


      {/* --- TASK MODALS SYSTEM --- */}

      {/* PART K: Export Excel Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsExportModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-3xl p-6 relative z-10 animate-scaleUp space-y-5 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto md:overflow-visible">
            
            {/* Modal Left Side: Options configs */}
            <div className="flex-1 space-y-5">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-green-600">border_color</span>
                    Cấu hình Xuất hóa đơn Excel
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Tạo tệp hóa đơn `{invoice.id}` chuyên nghiệp.</p>
                </div>
              </div>

              {exportProgress === 'idle' ? (
                <>
                  {/* K2. Export options (9 checkboxes) */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tùy chọn trường dữ liệu xuất</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 font-semibold pl-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeOwner}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeOwner: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Thông tin chủ nhà</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeTenant}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeTenant: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Thông tin khách thuê</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeUnit}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeUnit: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Thông tin phòng/căn</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeElectricWater}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeElectricWater: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Breakdown số điện nước</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeFixedFees}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeFixedFees: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Các khoản phí cố định</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeSurchargeDiscount}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeSurchargeDiscount: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Phụ thu & Giảm trừ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeStatus}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeStatus: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Trạng thái thanh toán</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeNotes}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Ghi chú hóa đơn</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer col-span-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.includePaymentHistory}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includePaymentHistory: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                        />
                        <span>Lịch sử các đợt giao dịch nộp tiền</span>
                      </label>
                    </div>
                  </div>

                  {/* K3. File Settings */}
                  <div className="space-y-3.5 text-xs font-bold text-gray-700 pt-1.5">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">Cấu hình File lưu trữ</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500">Tên tệp tin xuất:</label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">Định dạng:</label>
                        <select className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none">
                          <option>.xlsx (Excel Standard)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">Kiểu mẫu hiển thị:</label>
                        <select
                          value={exportModel}
                          onChange={(e) => setExportModel(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="detail">Mẫu chi tiết đầy đủ</option>
                          <option value="compact">Mẫu gọn tối giản</option>
                          <option value="tenant">Mẫu gửi người thuê trọ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : exportProgress === 'generating' ? (
                /* K5. Loading State */
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
                  <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-on-surface">Đang tạo file Excel...</p>
                    <p className="text-[10px] text-gray-400">Đang chuẩn bị dữ liệu hóa đơn và bố cục bảng tính trọ.</p>
                  </div>
                </div>
              ) : (
                /* K5. Success State */
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
                  <div className="w-14 h-14 rounded-full bg-green-150 text-green-600 flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                    <span className="material-symbols-outlined text-[28px] font-bold">check_circle</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-green-700">Xuất Excel thành công!</p>
                    <p className="text-[10px] text-gray-500 max-w-xs">{fileName}</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-1">Dung lượng: <span className="font-bold font-mono">24 KB</span></p>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsExportModalOpen(false);
                        setExportProgress('idle');
                        triggerToast('Tải xuống file Excel thành công!');
                      }}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 mx-auto"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">download_for_offline</span>
                      Tải xuống máy tính
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Right Side: PART K4 - Excel Preview Structure */}
            <div className="hidden md:block w-72 border-l border-gray-150 pl-6 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-on-surface">Xem trước Layout Excel</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">Mockup cấu trúc bảng tính Excel được xuất ra.</p>
                </div>

                {/* Mini spreadsheet grid UI */}
                <div className="border border-gray-200 rounded-xl overflow-hidden text-[9px] font-mono bg-white shadow-sm">
                  {/* Sheet tabs mock */}
                  <div className="bg-gray-100 border-b border-gray-200 px-3 py-1 flex items-center gap-2">
                    <div className="bg-white px-2 py-0.5 rounded-t-md text-xs font-sans font-bold text-green-600 border-l border-r border-t border-gray-200 flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[10px] text-green-600">table_chart</span> Invoice
                    </div>
                  </div>

                  {/* Excel Mockup Grid layout */}
                  <div className="p-2 space-y-1 bg-white select-none">
                    {/* Top Row grid index */}
                    <div className="grid grid-cols-4 gap-1 text-center font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded">
                      <div>A</div><div>B</div><div>C</div><div>D</div>
                    </div>
                    {/* Invoice header row */}
                    <div className="bg-green-600 text-white text-center font-sans font-bold p-1 rounded">
                      RoomHub - Hóa Đơn Dịch Vụ
                    </div>
                    {/* Info rows */}
                    <div className="grid grid-cols-4 gap-1 border-b border-gray-100 pb-1 pt-1.5 text-gray-500 font-medium">
                      <div className="col-span-2">INV: {invoice.id}</div>
                      <div className="col-span-2 text-right">Kỳ: {invoice.billingMonth}</div>
                    </div>
                    {exportOptions.includeTenant && (
                      <div className="text-[8px] text-gray-600 py-1 bg-orange-50/20 px-1 border border-orange-100/40 rounded">
                        Khách: {TENANT_INFO.name} ({TENANT_INFO.phone})
                      </div>
                    )}
                    {/* Fee lines simulation */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-gray-500">
                        <span>1. Tiền phòng:</span>
                        <span className="font-bold">2.500.000đ</span>
                      </div>
                      {exportOptions.includeElectricWater && (
                        <>
                          <div className="flex justify-between text-gray-500">
                            <span>2. Tiền điện:</span>
                            <span className="font-bold">420.000đ</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>3. Tiền nước:</span>
                            <span className="font-bold">60.000đ</span>
                          </div>
                        </>
                      )}
                      {exportOptions.includeFixedFees && (
                        <div className="flex justify-between text-gray-500">
                          <span>4. Dịch vụ wifi/rác:</span>
                          <span className="font-bold">180.000đ</span>
                        </div>
                      )}
                      {exportOptions.includeSurchargeDiscount && invoice.surcharge > 0 && (
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>5. Phụ thu:</span>
                          <span>+150.000đ</span>
                        </div>
                      )}
                    </div>
                    {/* Total mockup */}
                    <div className="border-t border-dashed border-gray-300 pt-1.5 flex justify-between font-bold text-primary-container text-[10px]">
                      <span>Tổng:</span>
                      <span>{calculateTotal().toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export actions at bottom right side */}
              {exportProgress === 'idle' && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleExportSubmit}
                    className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Xuất Excel
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PART L: Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsRecordModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Ghi nhận thanh toán ngoài hệ thống</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Xác nhận thu tiền mặt hoặc nhận chuyển khoản ngân hàng của khách.</p>
              </div>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-gray-400 hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Invoice payment summary cards inside modal */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold bg-gray-50 p-3 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-gray-400 block uppercase">Tổng tiền:</span>
                <span className="text-on-surface font-mono text-xs">{calculateTotal().toLocaleString()}đ</span>
              </div>
              <div className="space-y-0.5 border-l border-r border-gray-200">
                <span className="text-gray-400 block uppercase">Đã trả:</span>
                <span className="text-green-600 font-mono text-xs">{invoice.paidAmount.toLocaleString()}đ</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 block uppercase">Dư nợ còn:</span>
                <span className="text-orange-600 font-mono text-xs">{getRemainingBalance().toLocaleString()}đ</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Amount field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Số tiền thu trọ (đ) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-primary-container text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">đ</span>
                </div>
              </div>

              {/* Payment methods */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Phương thức thanh toán <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {['Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'Khác'].map(method => (
                    <div
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === method 
                          ? 'border-orange-300 bg-orange-50/15 text-primary-container' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {method === 'Tiền mặt' ? 'payments' : method === 'Chuyển khoản' ? 'account_balance' : method === 'Ví điện tử' ? 'qr_code_scanner' : 'devices_other'}
                      </span>
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datepicker & notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface">Ngày đóng tiền <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface">Ghi chú xác nhận</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chuyển khoản Vietcombank"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkbox auto paid complete */}
              <label className="flex items-center gap-2 pt-1 text-[11px] font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markPaidIfEnough}
                  onChange={(e) => setMarkPaidIfEnough(e.target.checked)}
                  className="rounded border-gray-300 text-primary-container focus:ring-primary-container"
                />
                <span>Đánh dấu hóa đơn là "Đã thanh toán" nếu nộp đủ tiền còn lại.</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={recordPaymentHandler}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Ghi nhận giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART M: Send Notification Modal */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsNotifyModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container">campaign</span>
                <h3 className="text-sm font-extrabold text-on-surface">Gửi nhắc nhở hóa đơn dịch vụ</h3>
              </div>
              <button onClick={() => setIsNotifyModalOpen(false)} className="text-gray-400 hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-600">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Khách trọ:</span>
                  <span className="text-on-surface">{TENANT_INFO.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã hóa đơn:</span>
                  <span className="text-on-surface font-mono">{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dư nợ cần nhắc:</span>
                  <span className="text-primary-container font-mono">{getRemainingBalance().toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn thanh toán:</span>
                  <span className="text-on-surface">{invoice.dueDate}</span>
                </div>
              </div>

              {!TENANT_INFO.isLinked && (
                /* PART M: Offline Warning */
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-[10px] text-red-800 font-bold leading-normal">
                  <span className="material-symbols-outlined text-[16px] text-red-500 font-bold flex-shrink-0">warning</span>
                  <p>
                    Khách thuê này đang ở chế độ **Offline** (Chưa liên kết tài khoản trọ). Hệ thống không thể gửi thông báo trực tuyến. Bạn vui lòng tải file Excel gửi qua Zalo/SMS/Email.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Mẫu văn bản thông báo gửi đi</label>
                <textarea
                  rows={4}
                  disabled={!TENANT_INFO.isLinked}
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:bg-white focus:border-primary-container disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!TENANT_INFO.isLinked}
                onClick={() => {
                  setIsNotifyModalOpen(false);
                  triggerToast(`Đã gửi thông báo nhắc đóng tiền thành công tới khách hàng ${TENANT_INFO.name}!`);
                }}
                className="px-4 py-2 bg-primary-container disabled:bg-gray-200 disabled:text-gray-400 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                Gửi nhắc nợ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART N: Cancel Invoice Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCancelModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-sm p-6 relative z-10 animate-scaleUp space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div className="flex items-center gap-1.5 text-red-500 font-bold">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <h3 className="text-sm font-extrabold text-on-surface">Yêu cầu Hủy bỏ Hóa đơn?</h3>
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal">
              Hóa đơn `{invoice.id}` sau khi hủy sẽ chuyển sang trạng thái **Đã hủy**. Mọi ghi chép công nợ tháng sẽ bị loại bỏ hoàn toàn. Hành động này không thể hoàn tác.
            </p>

            <div className="space-y-3 pt-1.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600">Lý do hủy hóa đơn <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhập sai số điện/nước trọ"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-primary-container"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-[10px] font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmCancelCheck}
                  onChange={(e) => setConfirmCancelCheck(e.target.checked)}
                  className="rounded border-gray-300 text-red-500 focus:ring-red-500 mt-0.5"
                />
                <span className="leading-snug">Tôi xác nhận hiểu rõ hậu quả và đồng ý hủy hóa đơn này.</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Không hủy
              </button>
              <button
                disabled={!confirmCancelCheck || !cancelReason}
                onClick={cancelInvoiceHandler}
                className="px-4 py-2 bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                Hủy hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceDetail;
