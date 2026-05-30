import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';

interface InvoiceCreateProps {
  setCurrentPage: (page: PageType) => void;
}

interface UnitBilling {
  id: string;
  propertyName: string;
  unitName: string;
  unitType: 'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ';
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  isLinked: boolean;
  rentPrice: number;
  oldElectric: number;
  newElectric: string | number;
  oldWater: number;
  newWater: string | number;
  fixedFees: number;
  fixedFeesBreakdown: { label: string; amount: number }[];
  surcharge: string | number;
  discount: string | number;
  status: 'Hợp lệ' | 'Thiếu chỉ số' | 'Lỗi chỉ số' | 'Đã có hóa đơn';
  errorMessage?: string;
  hasInvoiceThisMonth: boolean;
  notes?: string;
}

// Initial Mock Data
const INITIAL_UNITS: UnitBilling[] = [
  {
    id: 'unit-1',
    propertyName: 'FPT House',
    unitName: 'Phòng 201',
    unitType: 'Phòng trọ',
    tenantName: 'Nguyễn Văn A',
    tenantPhone: '0905123456',
    tenantEmail: 'vana@gmail.com',
    isLinked: true,
    rentPrice: 2500000,
    oldElectric: 120,
    newElectric: 240,
    oldWater: 30,
    newWater: 34,
    fixedFees: 180000,
    fixedFeesBreakdown: [
      { label: 'Internet', amount: 100000 },
      { label: 'Rác', amount: 30000 },
      { label: 'Giữ xe', amount: 50000 }
    ],
    surcharge: 150000,
    discount: 0,
    status: 'Hợp lệ',
    hasInvoiceThisMonth: false,
    notes: 'Sửa vòi nước bồn rửa mặt'
  },
  {
    id: 'unit-2',
    propertyName: 'Hòa Hải Studio',
    unitName: 'Studio 302',
    unitType: 'Studio',
    tenantName: 'Trần Thị B',
    tenantPhone: '0914987654',
    tenantEmail: 'thib@gmail.com',
    isLinked: true,
    rentPrice: 4500000,
    oldElectric: 210,
    newElectric: 310,
    oldWater: 50,
    newWater: 56,
    fixedFees: 210000,
    fixedFeesBreakdown: [
      { label: 'Internet', amount: 120000 },
      { label: 'Rác', amount: 40000 },
      { label: 'Giữ xe', amount: 50000 }
    ],
    surcharge: 0,
    discount: 0,
    status: 'Hợp lệ',
    hasInvoiceThisMonth: false
  },
  {
    id: 'unit-3',
    propertyName: 'Sơn Trà Mini Apartment',
    unitName: 'Căn hộ mini 105',
    unitType: 'Căn hộ mini',
    tenantName: 'Lê Văn C',
    tenantPhone: '0988654321',
    tenantEmail: 'vanc@gmail.com',
    isLinked: false,
    rentPrice: 6000000,
    oldElectric: 400,
    newElectric: '',
    oldWater: 80,
    newWater: '',
    fixedFees: 200000,
    fixedFeesBreakdown: [
      { label: 'Internet', amount: 100000 },
      { label: 'Rác', amount: 30000 },
      { label: 'Phí dịch vụ', amount: 70000 }
    ],
    surcharge: 0,
    discount: 0,
    status: 'Thiếu chỉ số',
    hasInvoiceThisMonth: false
  },
  {
    id: 'unit-4',
    propertyName: 'FPT House',
    unitName: 'Phòng 305',
    unitType: 'Phòng trọ',
    tenantName: 'Phạm Thị D',
    tenantPhone: '0977112233',
    tenantEmail: 'thid@gmail.com',
    isLinked: true,
    rentPrice: 2700000,
    oldElectric: 250,
    newElectric: 230, // Error: new < old
    oldWater: 40,
    newWater: 45,
    fixedFees: 150000,
    fixedFeesBreakdown: [
      { label: 'Internet', amount: 100000 },
      { label: 'Rác', amount: 50000 }
    ],
    surcharge: 0,
    discount: 0,
    status: 'Lỗi chỉ số',
    errorMessage: 'Điện mới nhỏ hơn điện cũ',
    hasInvoiceThisMonth: false
  },
  {
    id: 'unit-5',
    propertyName: 'Ngũ Hành Sơn Rooms',
    unitName: 'Phòng 103',
    unitType: 'Phòng trọ',
    tenantName: 'Hoàng Văn E',
    tenantPhone: '0935445566',
    tenantEmail: 'vane@gmail.com',
    isLinked: false,
    rentPrice: 3000000,
    oldElectric: 100,
    newElectric: 110,
    oldWater: 20,
    newWater: 23,
    fixedFees: 100000,
    fixedFeesBreakdown: [
      { label: 'Internet', amount: 70000 },
      { label: 'Rác', amount: 30000 }
    ],
    surcharge: 0,
    discount: 0,
    status: 'Đã có hóa đơn',
    hasInvoiceThisMonth: true
  }
];

const PROPERTIES = [
  { id: 'all', name: 'Tất cả tài sản' },
  { id: 'fpt-house', name: 'FPT House' },
  { id: 'hoahai-studio', name: 'Hòa Hải Studio' },
  { id: 'sontra-mini', name: 'Sơn Trà Mini Apartment' },
  { id: 'nguhanhson-rooms', name: 'Ngũ Hành Sơn Rooms' },
  { id: 'haichau-apartment', name: 'Hải Châu Apartment' } // Empty property for empty state test
];

const ELECTRIC_PRICE = 3500;
const WATER_PRICE = 15000;

export const InvoiceCreate: React.FC<InvoiceCreateProps> = ({ setCurrentPage }) => {
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(2); // Default to Step 2 (Nhập chỉ số)
  
  // Form fields
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [billingMonth, setBillingMonth] = useState<string>('2026-05');
  const [billingScope, setBillingScope] = useState<'all' | 'specific'>('all');
  const [dueDate, setDueDate] = useState<string>('2026-06-05');
  const [initialStatus, setInitialStatus] = useState<'draft' | 'unpaid'>('unpaid');

  // Interactive Units Data
  const [units, setUnits] = useState<UnitBilling[]>(INITIAL_UNITS);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['unit-1', 'unit-2']);
  
  // Modals & Drawer States
  const [detailDrawerUnit, setDetailDrawerUnit] = useState<UnitBilling | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSaveDraftModalOpen, setIsSaveDraftModalOpen] = useState<boolean>(false);
  const [isBulkSurchargeModalOpen, setIsBulkSurchargeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  
  // Bulk input values
  const [bulkSurchargeAmount, setBulkSurchargeAmount] = useState<string>('');
  const [bulkSurchargeNote, setBulkSurchargeNote] = useState<string>('');

  // Toast System
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const triggerToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
  };
  
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync Select All Checkbox when property filter changes
  const filteredUnits = units.filter(u => {
    if (selectedProperty === 'all') return true;
    const prop = PROPERTIES.find(p => p.id === selectedProperty);
    return prop ? u.propertyName.toLowerCase() === prop.name.toLowerCase() : true;
  });

  useEffect(() => {
    // If scope is 'all', auto select all eligible filtered units (exclude disabled/already has invoice ones)
    if (billingScope === 'all') {
      const eligibleIds = filteredUnits
        .filter(u => !u.hasInvoiceThisMonth)
        .map(u => u.id);
      setSelectedUnitIds(eligibleIds);
    }
  }, [selectedProperty, billingScope]);

  // Recalculate billing status for a unit based on new values
  const validateUnit = (unit: UnitBilling, newElec: string | number, newWat: string | number, rent: number, sur: number, disc: number): { status: UnitBilling['status']; errorMessage?: string } => {
    if (unit.hasInvoiceThisMonth) {
      return { status: 'Đã có hóa đơn' };
    }

    if (newElec === '' || newWat === '') {
      return { status: 'Thiếu chỉ số' };
    }

    const elecNum = Number(newElec);
    const watNum = Number(newWat);

    if (isNaN(elecNum) || isNaN(watNum) || rent < 0 || sur < 0 || disc < 0) {
      return { status: 'Lỗi chỉ số', errorMessage: 'Dữ liệu nhập vào không hợp lệ' };
    }

    if (elecNum < unit.oldElectric) {
      return { status: 'Lỗi chỉ số', errorMessage: 'Điện mới nhỏ hơn điện cũ' };
    }

    if (watNum < unit.oldWater) {
      return { status: 'Lỗi chỉ số', errorMessage: 'Nước mới nhỏ hơn nước cũ' };
    }

    return { status: 'Hợp lệ' };
  };

  // Handle inputs changes
  const handleInputChange = (id: string, field: 'newElectric' | 'newWater' | 'rentPrice' | 'surcharge' | 'discount' | 'notes', value: string) => {
    setUnits(prev => prev.map(unit => {
      if (unit.id !== id) return unit;

      const updated = { ...unit, [field]: value };
      
      // Values parsing
      const rent = field === 'rentPrice' ? (Number(value) || 0) : unit.rentPrice;
      const sur = field === 'surcharge' ? (Number(value) || 0) : Number(unit.surcharge) || 0;
      const disc = field === 'discount' ? (Number(value) || 0) : Number(unit.discount) || 0;
      const nElec = field === 'newElectric' ? value : unit.newElectric;
      const nWat = field === 'newWater' ? value : unit.newWater;

      const validation = validateUnit(unit, nElec, nWat, rent, sur, disc);
      updated.status = validation.status;
      updated.errorMessage = validation.errorMessage;

      return updated;
    }));
  };

  // Helper calculating cost
  const calculateElectricCost = (unit: UnitBilling) => {
    if (unit.newElectric === '') return 0;
    const diff = Number(unit.newElectric) - unit.oldElectric;
    return diff > 0 ? diff * ELECTRIC_PRICE : 0;
  };

  const calculateWaterCost = (unit: UnitBilling) => {
    if (unit.newWater === '') return 0;
    const diff = Number(unit.newWater) - unit.oldWater;
    return diff > 0 ? diff * WATER_PRICE : 0;
  };

  const calculateTotal = (unit: UnitBilling) => {
    if (unit.status === 'Lỗi chỉ số' || unit.status === 'Thiếu chỉ số') return 0;
    const rent = Number(unit.rentPrice) || 0;
    const elec = calculateElectricCost(unit);
    const wat = calculateWaterCost(unit);
    const fixed = Number(unit.fixedFees) || 0;
    const sur = Number(unit.surcharge) || 0;
    const disc = Number(unit.discount) || 0;
    return rent + elec + wat + fixed + sur - disc;
  };

  // Selection Checkbox handlers
  const handleSelectUnit = (id: string) => {
    setSelectedUnitIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const eligibleFiltered = filteredUnits.filter(u => !u.hasInvoiceThisMonth);
    if (selectedUnitIds.length === eligibleFiltered.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(eligibleFiltered.map(u => u.id));
    }
  };

  // Action Apply defaults
  const applyDefaultFees = () => {
    triggerToast('Đã áp dụng phí dịch vụ cố định mặc định cho tất cả phòng!');
  };

  // Action Copy last month values
  const copyLastMonthData = () => {
    setUnits(prev => prev.map(unit => {
      if (unit.hasInvoiceThisMonth) return unit;
      // Simulate copy by adding reasonable delta to old readings
      const simulatedNewElec = unit.oldElectric + 100;
      const simulatedNewWat = unit.oldWater + 5;
      
      const validation = validateUnit(unit, simulatedNewElec, simulatedNewWat, unit.rentPrice, Number(unit.surcharge) || 0, Number(unit.discount) || 0);
      
      return {
        ...unit,
        newElectric: simulatedNewElec,
        newWater: simulatedNewWat,
        status: validation.status,
        errorMessage: validation.errorMessage
      };
    }));
    triggerToast('Đã sao chép và cập nhật chỉ số điện nước từ tháng trước!');
  };

  // Bulk Apply Surcharge Action
  const applyBulkSurcharge = () => {
    const amt = Number(bulkSurchargeAmount);
    if (isNaN(amt) || amt < 0) {
      alert('Vui lòng nhập số tiền phụ thu hợp lệ.');
      return;
    }
    setUnits(prev => prev.map(unit => {
      if (!selectedUnitIds.includes(unit.id) || unit.hasInvoiceThisMonth) return unit;
      
      const updated = { 
        ...unit, 
        surcharge: amt, 
        notes: bulkSurchargeNote ? `${unit.notes || ''} | ${bulkSurchargeNote}`.replace(/^ \| /, '') : unit.notes 
      };

      const validation = validateUnit(
        updated, 
        updated.newElectric, 
        updated.newWater, 
        updated.rentPrice, 
        amt, 
        Number(updated.discount) || 0
      );
      updated.status = validation.status;
      updated.errorMessage = validation.errorMessage;

      return updated;
    }));
    setIsBulkSurchargeModalOpen(false);
    setBulkSurchargeAmount('');
    setBulkSurchargeNote('');
    triggerToast(`Đã áp dụng phụ thu +${amt.toLocaleString()}đ cho ${selectedUnitIds.length} phòng được chọn!`);
  };

  // Financial summary of selected and valid units
  const summarySelectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
  const validSelectedUnits = summarySelectedUnits.filter(u => u.status === 'Hợp lệ');
  
  const totalRent = validSelectedUnits.reduce((acc, u) => acc + u.rentPrice, 0);
  const totalElectric = validSelectedUnits.reduce((acc, u) => acc + calculateElectricCost(u), 0);
  const totalWater = validSelectedUnits.reduce((acc, u) => acc + calculateWaterCost(u), 0);
  const totalFixed = validSelectedUnits.reduce((acc, u) => acc + u.fixedFees, 0);
  const totalSurcharge = validSelectedUnits.reduce((acc, u) => acc + (Number(u.surcharge) || 0), 0);
  const totalDiscount = validSelectedUnits.reduce((acc, u) => acc + (Number(u.discount) || 0), 0);
  const totalExpected = totalRent + totalElectric + totalWater + totalFixed + totalSurcharge - totalDiscount;

  const countValid = summarySelectedUnits.filter(u => u.status === 'Hợp lệ').length;
  const countMissing = summarySelectedUnits.filter(u => u.status === 'Thiếu chỉ số').length;
  const countError = summarySelectedUnits.filter(u => u.status === 'Lỗi chỉ số').length;
  const countExist = filteredUnits.filter(u => u.hasInvoiceThisMonth).length;

  const hasSeriousError = countError > 0;

  // Confirm Invoices Creation Flow
  const handleConfirmCreate = () => {
    setIsConfirmModalOpen(false);
    setCurrentStep(4); // Move to Step 4 (Xác nhận tạo)
    triggerToast(`Tạo thành công ${validSelectedUnits.length} hóa đơn tháng ${billingMonth.split('-')[1]}/${billingMonth.split('-')[0]}!`);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-orange-50 border-orange-200 text-orange-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'error' ? 'error' : 'warning'}
          </span>
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* PART A: Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2">
            <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-invoices')}>Hóa đơn & Chốt tiền</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-gray-400">Chốt tiền tháng</span>
          </nav>
          <h2 className="text-xl font-bold text-on-surface">Chốt tiền tháng hàng loạt</h2>
          <p className="text-xs text-gray-500 mt-1">
            Tạo hóa đơn hàng loạt cho các phòng/căn đang thuê, tự động tính tiền thuê, điện, nước và dịch vụ đi kèm.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('owner-invoices')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-primary-container rounded-xl text-xs font-bold text-gray-700 transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại Hóa đơn</span>
        </button>
      </div>

      {/* PART B: Stepper / Progress Indicator */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] px-4">
          {[
            { step: 1, label: 'Chọn phạm vi' },
            { step: 2, label: 'Nhập chỉ số' },
            { step: 3, label: 'Kiểm tra hóa đơn' },
            { step: 4, label: 'Xác nhận tạo' },
            { step: 5, label: 'Xuất / Gửi thông báo' }
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    isActive ? 'bg-primary-container text-white ring-4 ring-orange-100' :
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <span className="material-symbols-outlined text-[16px] font-bold">check</span> : s.step}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${
                    isActive ? 'text-primary-container font-extrabold' :
                    isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {s.step < 5 && (
                  <div className={`flex-1 h-[2px] mx-4 transition-all duration-300 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-100'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Scope & Table Form */}
        <div className="lg:col-span-3 space-y-6">

          {/* PART C: Billing Scope Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-5 h-5 rounded bg-orange-100 text-primary-container flex items-center justify-center text-[11px] font-bold">1</span>
              Chọn phạm vi chốt tiền
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Field 1 - Chọn tài sản */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Tài sản <span className="text-red-500">*</span></label>
                <select
                  value={selectedProperty}
                  onChange={(e) => {
                    setSelectedProperty(e.target.value);
                    if (e.target.value === 'haichau-apartment') {
                      triggerToast('Tài sản này chưa có phòng cho thuê!', 'warning');
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container transition-all"
                >
                  {PROPERTIES.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400">Chỉ các phòng có hợp đồng còn hiệu lực mới hiển thị.</p>
              </div>

              {/* Field 2 - Chọn tháng/năm */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Tháng tạo hóa đơn <span className="text-red-500">*</span></label>
                <input
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container transition-all"
                />
                <p className="text-[10px] text-gray-400">Kỳ tính phí tương ứng cho toàn bộ chỉ số.</p>
              </div>

              {/* Field 4 - Hạn thanh toán */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Hạn thanh toán <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container transition-all"
                />
                <p className="text-[10px] text-gray-400">Hạn chót thanh toán trước khi tính quá hạn.</p>
              </div>
            </div>

            {/* Field 3 - Phạm vi và Trạng thái */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface">Phạm vi tạo hóa đơn</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setBillingScope('all')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      billingScope === 'all' ? 'border-primary-container bg-orange-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${billingScope === 'all' ? 'text-primary-container' : 'text-gray-400'}`}>
                      {billingScope === 'all' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Toàn bộ tài sản</h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Tạo hóa đơn cho tất cả phòng đang thuê.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setBillingScope('specific')}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      billingScope === 'specific' ? 'border-primary-container bg-orange-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50/40'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${billingScope === 'specific' ? 'text-primary-container' : 'text-gray-400'}`}>
                      {billingScope === 'specific' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Chọn phòng cụ thể</h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Chỉ tạo hóa đơn cho một số phòng bạn tích chọn.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface">Trạng thái ban đầu của hóa đơn</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setInitialStatus('unpaid')}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold ${
                      initialStatus === 'unpaid' ? 'border-orange-300 bg-orange-50/10 text-primary-container shadow-sm' : 'border-gray-100 bg-gray-50/40 text-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                    Chưa thanh toán
                  </div>
                  <div
                    onClick={() => setInitialStatus('draft')}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold ${
                      initialStatus === 'draft' ? 'border-orange-300 bg-orange-50/10 text-primary-container shadow-sm' : 'border-gray-100 bg-gray-50/40 text-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">draft</span>
                    Lưu nháp trước
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-orange-500 font-bold">info</span>
                  Nếu bạn chưa chắc chắn dữ liệu, hãy chọn lưu nháp trước.
                </p>
              </div>
            </div>
          </div>

          {/* PART D: Utility Cost Settings Preview */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[18px]">calculate</span>
                2. Cài đặt chi phí dịch vụ áp dụng mặc định
              </h4>
              <p className="text-[10px] text-gray-500">Các chi phí này được tự động lấy từ cấu hình của từng tài sản khi tính tiền.</p>
            </div>
            
            {/* Quick Price Badges */}
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-700">
              <span className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-orange-500">bolt</span> Điện: 3.500đ/kWh
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-blue-500">water_drop</span> Nước: 15.000đ/m³
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-green-500">wifi</span> Wifi: 100.000đ/tháng
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-gray-500">delete_outline</span> Rác: 30.000đ/tháng
              </span>
            </div>

            <button
              onClick={() => alert('Mở cài đặt chi phí tài sản...')}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-[10px] font-bold text-primary-container rounded-lg transition-colors cursor-pointer"
            >
              Chỉnh cấu hình
            </button>
          </div>

          {/* Empty state & Table block */}
          {selectedProperty === 'haichau-apartment' ? (
            /* PART Q: Empty State - Tài sản chưa có người thuê */
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[64px] text-orange-300 mb-4 animate-bounce">corporate_fare</span>
              <h3 className="text-base font-bold text-on-surface mb-1">Tài sản chưa có phòng cho thuê</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-6">Tòa nhà Hải Châu Apartment hiện chưa có phòng/căn nào đang được liên kết thuê trong hợp đồng.</p>
              <button
                onClick={() => setCurrentPage('owner-properties')}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Đến quản lý tài sản & phòng
              </button>
            </div>
          ) : filteredUnits.length === 0 ? (
            /* PART Q: Empty State - Chưa chọn hoặc trống */
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[64px] text-orange-200 mb-4">search_off</span>
              <h3 className="text-base font-bold text-on-surface mb-1">Không tìm thấy phòng phù hợp</h3>
              <p className="text-xs text-gray-500 max-w-sm">Vui lòng điều chỉnh lại bộ lọc tài sản hoặc tháng tạo hóa đơn.</p>
            </div>
          ) : (
            /* PART E & F: Tenant Units Billing Table */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
              
              {/* Table Toolbar */}
              <div className="p-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">3. Danh sách phòng & Nhập chỉ số</h3>
                  <p className="text-[10px] text-gray-500">Nhập chỉ số điện nước mới. RoomHub tự động quy đổi thành hóa đơn tương ứng.</p>
                </div>
                
                {/* Toolbar Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyLastMonthData}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">content_copy</span>
                    Tải số liệu tháng trước
                  </button>
                  <button
                    onClick={applyDefaultFees}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                    Áp dụng phí mặc định
                  </button>
                  <button
                    onClick={() => triggerToast('Đã tải thành công file mẫu Excel!', 'success')}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Xuất Excel mẫu
                  </button>
                </div>
              </div>

              {/* Table wrapper (Desktop version) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedUnitIds.length === filteredUnits.filter(u => !u.hasInvoiceThisMonth).length && selectedUnitIds.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-container focus:ring-primary-container cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">Phòng/Căn</th>
                      <th className="py-3 px-3">Người thuê</th>
                      <th className="py-3 px-3">Tiền thuê (đ)</th>
                      <th className="py-3 px-3 w-20">Điện cũ</th>
                      <th className="py-3 px-3 w-24">Điện mới</th>
                      <th className="py-3 px-3">Tiền điện</th>
                      <th className="py-3 px-3 w-20">Nước cũ</th>
                      <th className="py-3 px-3 w-24">Nước mới</th>
                      <th className="py-3 px-3">Tiền nước</th>
                      <th className="py-3 px-3">Phí cố định</th>
                      <th className="py-3 px-3 w-24">Phụ thu (+)</th>
                      <th className="py-3 px-3 w-24">Giảm trừ (-)</th>
                      <th className="py-3 px-3">Tổng tiền</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                    {filteredUnits.map((unit) => {
                      const isSelected = selectedUnitIds.includes(unit.id);
                      const isDisabled = unit.hasInvoiceThisMonth;
                      const elecCost = calculateElectricCost(unit);
                      const watCost = calculateWaterCost(unit);
                      const totalCost = calculateTotal(unit);

                      return (
                        <tr
                          key={unit.id}
                          className={`transition-colors hover:bg-gray-50/50 ${
                            isDisabled ? 'bg-gray-50/70 opacity-80' : isSelected ? 'bg-orange-50/10' : ''
                          }`}
                        >
                          {/* 1. Checkbox */}
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              disabled={isDisabled}
                              checked={isSelected}
                              onChange={() => handleSelectUnit(unit.id)}
                              className="rounded border-gray-300 text-primary-container focus:ring-primary-container disabled:opacity-50 cursor-pointer"
                            />
                          </td>

                          {/* 2. Room/Unit details */}
                          <td className="py-4 px-3">
                            <div>
                              <p className="font-bold text-on-surface">{unit.unitName}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{unit.propertyName}</p>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-orange-100/60 text-primary-container mt-1">
                                {unit.unitType}
                              </span>
                            </div>
                          </td>

                          {/* 3. Tenant */}
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 text-primary-container text-[10px] font-bold flex items-center justify-center">
                                {unit.tenantName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface">{unit.tenantName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${unit.isLinked ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  <span className="text-[9px] text-gray-400">{unit.isLinked ? 'Đã liên kết' : 'Offline'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 4. Rent price */}
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              disabled={isDisabled}
                              value={unit.rentPrice}
                              onChange={(e) => handleInputChange(unit.id, 'rentPrice', e.target.value)}
                              className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container text-right disabled:bg-gray-100"
                            />
                          </td>

                          {/* 5. Electric Old */}
                          <td className="py-4 px-3 text-center text-gray-500 font-mono">
                            {unit.oldElectric}
                          </td>

                          {/* 6. Electric New */}
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              disabled={isDisabled}
                              placeholder="Mới"
                              value={unit.newElectric}
                              onChange={(e) => handleInputChange(unit.id, 'newElectric', e.target.value)}
                              className={`w-16 px-2 py-1 bg-gray-50 border rounded-lg text-xs font-mono font-bold focus:outline-none focus:bg-white text-right disabled:bg-gray-100 ${
                                unit.status === 'Lỗi chỉ số' && unit.errorMessage?.includes('Điện') 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                                  : 'border-gray-200 focus:border-primary-container'
                              }`}
                            />
                          </td>

                          {/* 7. Electric Cost */}
                          <td className="py-4 px-3 font-mono text-right text-gray-700">
                            {unit.newElectric === '' ? (
                              <span className="text-[10px] text-orange-500">Chưa nhập</span>
                            ) : (
                              <div>
                                <p className="font-bold">{elecCost.toLocaleString()}đ</p>
                                <p className="text-[8px] text-gray-400 font-medium">({(Number(unit.newElectric) - unit.oldElectric)} kWh)</p>
                              </div>
                            )}
                          </td>

                          {/* 8. Water Old */}
                          <td className="py-4 px-3 text-center text-gray-500 font-mono">
                            {unit.oldWater}
                          </td>

                          {/* 9. Water New */}
                          <td className="py-4 px-3">
                            <input
                              type="number"
                              disabled={isDisabled}
                              placeholder="Mới"
                              value={unit.newWater}
                              onChange={(e) => handleInputChange(unit.id, 'newWater', e.target.value)}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-primary-container text-right disabled:bg-gray-100"
                            />
                          </td>

                          {/* 10. Water Cost */}
                          <td className="py-4 px-3 font-mono text-right text-gray-700">
                            {unit.newWater === '' ? (
                              <span className="text-[10px] text-orange-500">Chưa nhập</span>
                            ) : (
                              <div>
                                <p className="font-bold">{watCost.toLocaleString()}đ</p>
                                <p className="text-[8px] text-gray-400 font-medium">({(Number(unit.newWater) - unit.oldWater)} m³)</p>
                              </div>
                            )}
                          </td>

                          {/* 11. Fixed Fees */}
                          <td className="py-4 px-3 text-right">
                            <div className="relative group inline-block cursor-help border-b border-dotted border-gray-400">
                              <span className="font-mono text-gray-700">{unit.fixedFees.toLocaleString()}đ</span>
                              
                              {/* Hover details tooltip */}
                              <div className="absolute right-0 bottom-6 hidden group-hover:block w-48 bg-white p-3 rounded-xl border border-gray-200 shadow-xl z-30 text-left">
                                <h5 className="text-[10px] font-extrabold text-on-surface border-b border-gray-100 pb-1.5 mb-1.5 uppercase">Chi phí dịch vụ</h5>
                                <div className="space-y-1 text-[9px] text-gray-500">
                                  {unit.fixedFeesBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span>{item.label}:</span>
                                      <span className="font-bold text-gray-700">{item.amount.toLocaleString()}đ</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 12. Surcharge */}
                          <td className="py-4 px-3">
                            <div className="relative">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">+</span>
                              <input
                                type="number"
                                disabled={isDisabled}
                                placeholder="0"
                                value={unit.surcharge}
                                onChange={(e) => handleInputChange(unit.id, 'surcharge', e.target.value)}
                                className="w-16 pl-4 pr-1 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container text-right disabled:bg-gray-100"
                              />
                            </div>
                          </td>

                          {/* 13. Discount */}
                          <td className="py-4 px-3">
                            <div className="relative">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">-</span>
                              <input
                                type="number"
                                disabled={isDisabled}
                                placeholder="0"
                                value={unit.discount}
                                onChange={(e) => handleInputChange(unit.id, 'discount', e.target.value)}
                                className="w-16 pl-4 pr-1 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container text-right disabled:bg-gray-100"
                              />
                            </div>
                          </td>

                          {/* 14. Total Expected */}
                          <td className="py-4 px-3 text-right">
                            {unit.status === 'Lỗi chỉ số' || unit.status === 'Thiếu chỉ số' ? (
                              <span className="text-[10px] text-red-500 font-bold">Không thể tính</span>
                            ) : (
                              <span className="font-extrabold text-primary-container font-mono">{totalCost.toLocaleString()}đ</span>
                            )}
                          </td>

                          {/* 15. Data status */}
                          <td className="py-4 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold border ${
                              unit.status === 'Hợp lệ' ? 'bg-green-50 border-green-200 text-green-700' :
                              unit.status === 'Thiếu chỉ số' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                              unit.status === 'Lỗi chỉ số' ? 'bg-red-50 border-red-200 text-red-700' :
                              'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                unit.status === 'Hợp lệ' ? 'bg-green-500' :
                                unit.status === 'Thiếu chỉ số' ? 'bg-orange-500' :
                                unit.status === 'Lỗi chỉ số' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`} />
                              {unit.status}
                            </span>
                            {unit.status === 'Lỗi chỉ số' && unit.errorMessage && (
                              <p className="text-[8px] text-red-500 mt-1 truncate max-w-[120px]" title={unit.errorMessage}>
                                {unit.errorMessage}
                              </p>
                            )}
                          </td>

                          {/* 16. Actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setDetailDrawerUnit(unit)}
                                className="w-7 h-7 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-primary-container flex items-center justify-center transition-colors cursor-pointer"
                                title="Xem chi tiết hóa đơn dự kiến"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PART S: Responsive Mobile Cards version */}
              <div className="md:hidden p-4 space-y-4">
                <div className="text-xs font-bold text-gray-500 border-b border-gray-100 pb-2">Danh sách phòng / căn trên di động</div>
                {filteredUnits.map((unit) => {
                  const isSelected = selectedUnitIds.includes(unit.id);
                  const isDisabled = unit.hasInvoiceThisMonth;
                  const elecCost = calculateElectricCost(unit);
                  const watCost = calculateWaterCost(unit);
                  const totalCost = calculateTotal(unit);

                  return (
                    <div
                      key={unit.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDisabled ? 'bg-gray-50/80 border-gray-200/50 opacity-85' :
                        isSelected ? 'border-primary-container bg-orange-50/10 shadow-sm' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Mobile Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={isSelected}
                            onChange={() => handleSelectUnit(unit.id)}
                            className="rounded border-gray-300 text-primary-container focus:ring-primary-container disabled:opacity-50 cursor-pointer"
                          />
                          <div>
                            <h4 className="font-extrabold text-on-surface text-sm">{unit.unitName}</h4>
                            <p className="text-[10px] text-gray-400">{unit.propertyName} · {unit.unitType}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${
                          unit.status === 'Hợp lệ' ? 'bg-green-50 border-green-100 text-green-700' :
                          unit.status === 'Thiếu chỉ số' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                          unit.status === 'Lỗi chỉ số' ? 'bg-red-50 border-red-100 text-red-700' :
                          'bg-blue-50 border-blue-100 text-blue-700'
                        }`}>
                          {unit.status}
                        </span>
                      </div>

                      {/* Mobile Card details - collapsible details */}
                      <div className="grid grid-cols-2 gap-3.5 text-[11px] font-bold text-gray-600 bg-gray-50 p-3 rounded-xl">
                        
                        {/* Tenant */}
                        <div className="col-span-2 flex justify-between border-b border-gray-200/50 pb-2">
                          <span className="text-gray-400">Người thuê:</span>
                          <span className="text-on-surface">{unit.tenantName} {unit.isLinked ? '(Linked)' : '(Offline)'}</span>
                        </div>

                        {/* Rent price */}
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-400">Tiền thuê phòng:</span>
                          <input
                            type="number"
                            disabled={isDisabled}
                            value={unit.rentPrice}
                            onChange={(e) => handleInputChange(unit.id, 'rentPrice', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Fixed fees */}
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-400">Phí cố định:</span>
                          <span className="text-on-surface pt-1">{unit.fixedFees.toLocaleString()}đ</span>
                        </div>

                        {/* Electric old/new */}
                        <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2">
                          <span className="text-gray-400">Số Điện (Cũ: {unit.oldElectric}):</span>
                          <input
                            type="number"
                            disabled={isDisabled}
                            placeholder="Chỉ số mới"
                            value={unit.newElectric}
                            onChange={(e) => handleInputChange(unit.id, 'newElectric', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                          {unit.newElectric !== '' && <span className="text-[9px] text-gray-500 font-mono mt-0.5">Tiền: {elecCost.toLocaleString()}đ</span>}
                        </div>

                        {/* Water old/new */}
                        <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2">
                          <span className="text-gray-400">Số Nước (Cũ: {unit.oldWater}):</span>
                          <input
                            type="number"
                            disabled={isDisabled}
                            placeholder="Chỉ số mới"
                            value={unit.newWater}
                            onChange={(e) => handleInputChange(unit.id, 'newWater', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                          {unit.newWater !== '' && <span className="text-[9px] text-gray-500 font-mono mt-0.5">Tiền: {watCost.toLocaleString()}đ</span>}
                        </div>

                        {/* Surcharge */}
                        <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2">
                          <span className="text-gray-400">Phụ thu (+):</span>
                          <input
                            type="number"
                            disabled={isDisabled}
                            placeholder="Phát sinh"
                            value={unit.surcharge}
                            onChange={(e) => handleInputChange(unit.id, 'surcharge', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Discount */}
                        <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2">
                          <span className="text-gray-400">Giảm trừ (-):</span>
                          <input
                            type="number"
                            disabled={isDisabled}
                            placeholder="Giảm giá"
                            value={unit.discount}
                            onChange={(e) => handleInputChange(unit.id, 'discount', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Mobile Card footer */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setDetailDrawerUnit(unit)}
                          className="text-[10px] font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">info</span> Xem breakdown chi tiết
                        </button>
                        <div>
                          <span className="text-[10px] text-gray-400 mr-1.5">Tổng dự kiến:</span>
                          {unit.status === 'Lỗi chỉ số' || unit.status === 'Thiếu chỉ số' ? (
                            <span className="text-red-500 text-xs font-extrabold">Chưa thể tính</span>
                          ) : (
                            <span className="text-primary-container text-sm font-black font-mono">{totalCost.toLocaleString()}đ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PART G: Bulk Actions in Table */}
          {selectedUnitIds.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl shadow-md flex items-center justify-between gap-4 animate-slideUp">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-container">
                <span className="material-symbols-outlined text-[20px] font-bold">check_box</span>
                <span>Đã chọn {selectedUnitIds.length} phòng / căn hộ</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkSurchargeModalOpen(true)}
                  className="px-3.5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">add_circle</span>
                  <span>Đặt phụ thu hàng loạt</span>
                </button>
                <button
                  onClick={() => {
                    setUnits(prev => prev.map(unit => {
                      if (!selectedUnitIds.includes(unit.id) || unit.hasInvoiceThisMonth) return unit;
                      
                      const updated = { ...unit, discount: 50000 };
                      const validation = validateUnit(updated, updated.newElectric, updated.newWater, updated.rentPrice, Number(updated.surcharge) || 0, 50000);
                      updated.status = validation.status;
                      updated.errorMessage = validation.errorMessage;

                      return updated;
                    }));
                    triggerToast(`Đã áp dụng giảm trừ -50.000đ cho ${selectedUnitIds.length} phòng!`);
                  }}
                  className="px-3 py-2 bg-white border border-orange-200 hover:bg-orange-100/30 text-primary-container rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Giảm trừ 50k
                </button>
                <button
                  onClick={() => setSelectedUnitIds([])}
                  className="px-3 py-2 text-gray-500 hover:text-on-surface text-xs font-bold transition-colors cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Sticky Summary Panel */}
        {/* PART H: Billing Summary Sticky Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5 sticky top-[96px]">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-on-surface">Tóm tắt chốt tiền</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Dự tính hóa đơn tháng {billingMonth.split('-')[1]}/{billingMonth.split('-')[0]}</p>
            </div>

            {/* Scope info summaries */}
            <div className="space-y-2.5 text-xs text-gray-600 font-bold border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Tài sản chọn:</span>
                <span className="text-on-surface">{PROPERTIES.find(p => p.id === selectedProperty)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng phòng đang chọn:</span>
                <span className="text-on-surface font-mono">{selectedUnitIds.length} phòng</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trạng thái phòng chọn:</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {countValid > 0 && <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[8px] font-extrabold">Hợp lệ: {countValid}</span>}
                  {countMissing > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[8px] font-extrabold">Thiếu: {countMissing}</span>}
                  {countError > 0 && <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[8px] font-extrabold">Lỗi: {countError}</span>}
                </div>
              </div>
              {countExist > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Đã có hóa đơn rồi:</span>
                  <span className="font-mono text-[10px]">{countExist} phòng</span>
                </div>
              )}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-[11px] text-gray-500 font-bold border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Tiền thuê phòng:</span>
                <span className="text-on-surface">{totalRent.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền điện dự kiến:</span>
                <span className="text-on-surface">{totalElectric.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền nước dự kiến:</span>
                <span className="text-on-surface">{totalWater.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Chi phí dịch vụ khác:</span>
                <span className="text-on-surface">{totalFixed.toLocaleString()}đ</span>
              </div>
              {totalSurcharge > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Phụ thu phát sinh:</span>
                  <span>+{totalSurcharge.toLocaleString()}đ</span>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Giảm trừ chiết khấu:</span>
                  <span>-{totalDiscount.toLocaleString()}đ</span>
                </div>
              )}
            </div>

            {/* Total Financial expected */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400">TỔNG TIỀN DỰ KIẾN (CỦA {countValid} PHÒNG HỢP LỆ)</p>
              <p className="text-2xl font-black text-primary-container font-mono tracking-tight">{totalExpected.toLocaleString()}đ</p>
            </div>

            {/* Error notes warning */}
            {hasSeriousError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-[10px] text-red-800 font-bold">
                <span className="material-symbols-outlined text-[16px] text-red-500 font-bold flex-shrink-0">warning</span>
                <p className="leading-normal">Bạn cần xử lý {countError} phòng đang bị lỗi chỉ số trước khi có thể xác nhận chốt hóa đơn.</p>
              </div>
            )}
            
            {countMissing > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-2 text-[10px] text-orange-800 font-bold">
                <span className="material-symbols-outlined text-[16px] text-orange-500 font-bold flex-shrink-0">info</span>
                <p className="leading-normal">{countMissing} phòng chưa nhập đủ chỉ số sẽ tạm thời bị bỏ qua không tạo hóa đơn đợt này.</p>
              </div>
            )}

            {/* Sticky Actions CTA buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (validSelectedUnits.length === 0) {
                    triggerToast('Không có phòng hợp lệ nào được chọn để chốt tiền!', 'error');
                    return;
                  }
                  setIsConfirmModalOpen(true);
                }}
                disabled={hasSeriousError || validSelectedUnits.length === 0}
                className="w-full py-3 bg-primary-container disabled:bg-gray-200 disabled:text-gray-400 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px] font-bold">check_circle</span>
                <span>Xác nhận chốt tiền</span>
              </button>
              
              <button
                onClick={() => setIsSaveDraftModalOpen(true)}
                disabled={validSelectedUnits.length === 0}
                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-orange-50 hover:border-orange-100 hover:text-primary-container text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">draft</span>
                <span>Lưu nháp</span>
              </button>

              <button
                onClick={() => {
                  if (validSelectedUnits.length === 0) {
                    triggerToast('Không có dữ liệu hợp lệ để xem trước!', 'error');
                    return;
                  }
                  setCurrentStep(3); // Go to step 3 (Kiểm tra hóa đơn preview)
                  triggerToast('Đã mở chế độ kiểm tra xem trước hóa đơn!');
                }}
                disabled={validSelectedUnits.length === 0}
                className="w-full py-2 bg-white text-gray-500 hover:text-on-surface rounded-xl text-[10px] font-bold text-center hover:underline cursor-pointer"
              >
                Xem preview danh sách hóa đơn
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* PART J: Invoice Preview Section (When step is 3 or manually triggered) */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 animate-scaleUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-orange-100 text-primary-container flex items-center justify-center text-[11px] font-bold">4</span>
                Kiểm tra hóa đơn trước khi tạo hàng loạt
              </h3>
              <p className="text-[10px] text-gray-500">Xem trước danh sách hóa đơn sẵn sàng được khởi tạo.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Quay lại sửa chỉ số
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Tiếp tục xác nhận tạo
              </button>
            </div>
          </div>

          {/* Quick Warning summaries in preview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-green-200 bg-green-50/50 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
              <div>
                <h4 className="text-xs font-bold text-green-800">{countValid} hóa đơn sẵn sàng</h4>
                <p className="text-[9px] text-green-600 font-medium">Chỉ số hợp lệ & đã được chọn</p>
              </div>
            </div>
            {countMissing > 0 && (
              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-orange-500">info</span>
                <div>
                  <h4 className="text-xs font-bold text-orange-800">{countMissing} phòng thiếu chỉ số</h4>
                  <p className="text-[9px] text-orange-600 font-medium">Sẽ bị bỏ qua không tạo hóa đơn</p>
                </div>
              </div>
            )}
            {countError > 0 && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-red-500 font-bold">warning</span>
                <div>
                  <h4 className="text-xs font-bold text-red-800">{countError} phòng bị lỗi chỉ số</h4>
                  <p className="text-[9px] text-red-600 font-medium">Cần xử lý lỗi mới chốt được</p>
                </div>
              </div>
            )}
            {countExist > 0 && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-500">receipt_long</span>
                <div>
                  <h4 className="text-xs font-bold text-blue-800">{countExist} phòng đã có hóa đơn</h4>
                  <p className="text-[9px] text-blue-600 font-medium">Không thể tạo trùng lặp tháng</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick list preview grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validSelectedUnits.map(unit => {
              const elec = calculateElectricCost(unit);
              const wat = calculateWaterCost(unit);
              const total = calculateTotal(unit);

              return (
                <div key={unit.id} className="p-4 rounded-2xl border border-gray-150 bg-gray-50/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary-container flex items-center justify-center font-black text-xs">
                      {unit.unitName.replace('Phòng ', '').replace('Studio ', '')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-on-surface text-xs">{unit.unitName} · {unit.tenantName}</h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Tiền phòng: {unit.rentPrice.toLocaleString()}đ | Phí dịch vụ: {unit.fixedFees.toLocaleString()}đ</p>
                      <p className="text-[9px] text-gray-500">Điện nước: {(elec + wat).toLocaleString()}đ {unit.surcharge ? `| Phụ thu: +${Number(unit.surcharge).toLocaleString()}đ` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary-container font-mono">{total.toLocaleString()}đ</p>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[8px] font-bold border border-green-100 mt-1">Sẵn sàng</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PART K, M, N: Success State & Action step after Invoice creation */}
      {currentStep >= 4 && (
        <div className="bg-white p-8 rounded-2xl border border-green-200 bg-gradient-to-tr from-green-50/30 to-white shadow-lg space-y-6 text-center animate-scaleUp max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto ring-8 ring-green-50">
            <span className="material-symbols-outlined text-[36px] font-bold">check_circle</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-on-surface">Chốt hóa đơn hàng loạt thành công!</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Hệ thống RoomHub đã xử lý tạo thành công **{validSelectedUnits.length}** hóa đơn trong tháng {billingMonth.split('-')[1]}/{billingMonth.split('-')[0]} cho tài sản **{PROPERTIES.find(p => p.id === selectedProperty)?.name}**.
            </p>
          </div>

          {/* Quick success summary cards */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl max-w-sm mx-auto text-left text-xs font-bold text-gray-600">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">Số hóa đơn:</span>
              <span className="text-on-surface font-mono text-base">{validSelectedUnits.length} hóa đơn</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 block uppercase">Tổng tiền chốt:</span>
              <span className="text-primary-container font-mono text-base">{totalExpected.toLocaleString()}đ</span>
            </div>
            <div className="space-y-1 col-span-2 border-t border-gray-200/50 pt-2.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Hạn thanh toán:</span>
                <span className="text-on-surface">{dueDate.split('-').reverse().join('/')}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px] font-extrabold uppercase">{initialStatus === 'unpaid' ? 'Chưa thanh toán' : 'Bản nháp'}</span>
            </div>
          </div>

          {/* Post success action flows */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Tải file bill Excel</span>
            </button>

            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              <span>Gửi thông báo</span>
            </button>

            <button
              onClick={() => {
                setUnits(INITIAL_UNITS);
                setSelectedUnitIds(['unit-1', 'unit-2']);
                setCurrentStep(2);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Tạo thêm hóa đơn khác
            </button>
          </div>

          <div>
            <button
              onClick={() => setCurrentPage('owner-invoices')}
              className="text-xs font-bold text-gray-500 hover:text-primary-container hover:underline cursor-pointer"
            >
              Quay lại danh sách hóa đơn & lịch sử thanh toán
            </button>
          </div>
        </div>
      )}


      {/* --- WORKFLOW MODALS & DRAWERS --- */}

      {/* PART I: Row Detail Expand / Side Drawer */}
      {detailDrawerUnit && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setDetailDrawerUnit(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel Container */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Chi tiết hóa đơn dự kiến</h3>
                <p className="text-[10px] text-gray-500">{detailDrawerUnit.unitName} · {detailDrawerUnit.propertyName}</p>
              </div>
              <button
                onClick={() => setDetailDrawerUnit(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Body content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Tenant info subcard */}
              <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-[10px] font-black text-primary-container uppercase tracking-wider">Thông tin khách thuê</h4>
                <div className="text-xs font-bold text-gray-700 grid grid-cols-2 gap-y-1">
                  <span className="text-gray-400">Khách thuê:</span>
                  <span className="text-on-surface text-right">{detailDrawerUnit.tenantName}</span>
                  <span className="text-gray-400">Số điện thoại:</span>
                  <span className="text-on-surface text-right">{detailDrawerUnit.tenantPhone}</span>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-on-surface text-right text-[10px] truncate">{detailDrawerUnit.tenantEmail}</span>
                  <span className="text-gray-400">Hình thức liên kết:</span>
                  <span className="text-right text-green-600">{detailDrawerUnit.isLinked ? 'Đã liên kết tài khoản' : 'Offline'}</span>
                </div>
              </div>

              {/* Financial Calculation breakdown list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bảng kê chi tiết phí</h4>
                
                <div className="space-y-3.5 text-xs font-bold text-gray-600">
                  {/* Rent */}
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span>1. Tiền thuê phòng:</span>
                    <span className="text-on-surface">{detailDrawerUnit.rentPrice.toLocaleString()}đ</span>
                  </div>

                  {/* Electricity cost breakdown */}
                  <div className="space-y-1 border-b border-gray-100 pb-2">
                    <div className="flex justify-between">
                      <span>2. Tiền Điện:</span>
                      <span className="text-on-surface">
                        {detailDrawerUnit.status === 'Thiếu chỉ số' || detailDrawerUnit.status === 'Lỗi chỉ số' 
                          ? 'Chưa thể tính' 
                          : `${calculateElectricCost(detailDrawerUnit).toLocaleString()}đ`}
                      </span>
                    </div>
                    {detailDrawerUnit.status === 'Hợp lệ' && (
                      <div className="text-[9px] text-gray-400 font-medium pl-3 space-y-0.5">
                        <p>· Chỉ số điện: Cũ: {detailDrawerUnit.oldElectric} kWh ➔ Mới: {detailDrawerUnit.newElectric} kWh</p>
                        <p>· Tiêu dùng: {Number(detailDrawerUnit.newElectric) - detailDrawerUnit.oldElectric} kWh × Đơn giá: {ELECTRIC_PRICE.toLocaleString()}đ/kWh</p>
                      </div>
                    )}
                  </div>

                  {/* Water cost breakdown */}
                  <div className="space-y-1 border-b border-gray-100 pb-2">
                    <div className="flex justify-between">
                      <span>3. Tiền Nước:</span>
                      <span className="text-on-surface">
                        {detailDrawerUnit.status === 'Thiếu chỉ số' || detailDrawerUnit.status === 'Lỗi chỉ số' 
                          ? 'Chưa thể tính' 
                          : `${calculateWaterCost(detailDrawerUnit).toLocaleString()}đ`}
                      </span>
                    </div>
                    {detailDrawerUnit.status === 'Hợp lệ' && (
                      <div className="text-[9px] text-gray-400 font-medium pl-3 space-y-0.5">
                        <p>· Chỉ số nước: Cũ: {detailDrawerUnit.oldWater} m³ ➔ Mới: {detailDrawerUnit.newWater} m³</p>
                        <p>· Tiêu dùng: {Number(detailDrawerUnit.newWater) - detailDrawerUnit.oldWater} m³ × Đơn giá: {WATER_PRICE.toLocaleString()}đ/m³</p>
                      </div>
                    )}
                  </div>

                  {/* Fixed service charges breakdown */}
                  <div className="space-y-1.5 border-b border-gray-100 pb-2">
                    <div className="flex justify-between">
                      <span>4. Phí dịch vụ cố định:</span>
                      <span className="text-on-surface">{detailDrawerUnit.fixedFees.toLocaleString()}đ</span>
                    </div>
                    <div className="text-[9px] text-gray-400 font-medium pl-3 space-y-0.5">
                      {detailDrawerUnit.fixedFeesBreakdown.map((item, idx) => (
                        <p key={idx}>· {item.label}: {item.amount.toLocaleString()}đ</p>
                      ))}
                    </div>
                  </div>

                  {/* Surcharges & discount */}
                  {(Number(detailDrawerUnit.surcharge) > 0 || Number(detailDrawerUnit.discount) > 0) && (
                    <div className="space-y-1 border-b border-gray-100 pb-2">
                      <span className="text-gray-500">5. Điều chỉnh phát sinh:</span>
                      <div className="text-[10px] pl-3 space-y-1 font-bold">
                        {Number(detailDrawerUnit.surcharge) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>· Phụ thu phát sinh:</span>
                            <span>+{Number(detailDrawerUnit.surcharge).toLocaleString()}đ</span>
                          </div>
                        )}
                        {Number(detailDrawerUnit.discount) > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>· Giảm trừ chiết khấu:</span>
                            <span>-{Number(detailDrawerUnit.discount).toLocaleString()}đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Note fields */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">6. Ghi chú hóa đơn này</label>
                    <textarea
                      rows={2}
                      placeholder="Nhập ghi chú cho hóa đơn này (Ví dụ: Trừ tiền sửa bóng đèn, vệ sinh...)"
                      value={detailDrawerUnit.notes || ''}
                      onChange={(e) => handleInputChange(detailDrawerUnit.id, 'notes', e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-primary-container"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer total and close */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">TỔNG CỘNG HÓA ĐƠN:</span>
                {detailDrawerUnit.status === 'Lỗi chỉ số' || detailDrawerUnit.status === 'Thiếu chỉ số' ? (
                  <span className="text-red-500 text-sm font-black">Chưa thể tính</span>
                ) : (
                  <span className="text-primary-container text-lg font-black font-mono">{calculateTotal(detailDrawerUnit).toLocaleString()}đ</span>
                )}
              </div>

              <button
                onClick={() => setDetailDrawerUnit(null)}
                className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer text-center"
              >
                Lưu và đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PART G: Bulk Surcharge Modal */}
      {isBulkSurchargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsBulkSurchargeModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Áp dụng phụ thu hàng loạt</h3>
                <p className="text-[10px] text-gray-500">Đã chọn {selectedUnitIds.length} phòng để điều chỉnh.</p>
              </div>
              <button onClick={() => setIsBulkSurchargeModalOpen(false)} className="text-gray-400 hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">Số tiền phụ thu (đ) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Nhập số tiền phát sinh (Ví dụ: 100000)"
                  value={bulkSurchargeAmount}
                  onChange={(e) => setBulkSurchargeAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">Ghi chú phụ thu</label>
                <input
                  type="text"
                  placeholder="Lý do phụ thu (Ví dụ: Phí vệ sinh định kỳ đợt hè)"
                  value={bulkSurchargeNote}
                  onChange={(e) => setBulkSurchargeNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsBulkSurchargeModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={applyBulkSurcharge}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART K: Confirm Create Invoices Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsConfirmModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 font-bold">help</span>
                <h3 className="text-sm font-extrabold text-on-surface">Xác nhận tạo hóa đơn tháng {billingMonth.split('-')[1]}/{billingMonth.split('-')[0]}?</h3>
              </div>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-gray-600">
              <p className="leading-relaxed font-semibold text-gray-500">
                Hệ thống sẽ tiến hành chốt và xuất hóa đơn dịch vụ tương ứng cho các phòng đã chọn hợp lệ. Vui lòng rà soát kỹ các chỉ số trước khi nhấn đồng ý.
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Tài sản áp dụng:</span>
                  <span className="text-on-surface">{PROPERTIES.find(p => p.id === selectedProperty)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số hóa đơn sẽ tạo:</span>
                  <span className="text-on-surface font-mono">{validSelectedUnits.length} hóa đơn</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng tiền dự kiến chốt:</span>
                  <span className="text-primary-container font-mono">{totalExpected.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Hạn thanh toán hóa đơn:</span>
                  <span className="text-on-surface">{dueDate.split('-').reverse().join('/')}</span>
                </div>
              </div>

              {/* Confirm workflow checkbox choices */}
              <div className="space-y-2 pt-1 font-bold text-gray-700 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Tôi đã kiểm tra kỹ và xác nhận dữ liệu chính xác.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Tự động gửi thông báo cho khách hàng có tài khoản RoomHub Linked.</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmCreate}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95"
              >
                Xác nhận tạo hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART L: Save Draft Modal */}
      {isSaveDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsSaveDraftModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-sm p-6 relative z-10 animate-scaleUp space-y-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-400 mx-auto">draft</span>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-on-surface">Lưu nháp hóa đơn?</h3>
              <p className="text-[10px] text-gray-500 px-2 leading-relaxed">
                Tất cả chỉ số điện nước, phụ thu và giảm trừ đã nhập của {validSelectedUnits.length} phòng hợp lệ sẽ được lưu lại dưới dạng bản nháp để chỉnh sửa sau.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsSaveDraftModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer flex-1"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsSaveDraftModalOpen(false);
                  triggerToast(`Đã lưu nháp hóa đơn dịch vụ tháng ${billingMonth.split('-')[1]}/${billingMonth.split('-')[0]} thành công!`);
                }}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex-1"
              >
                Lưu nháp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART M: Export Excel After Create Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsExportModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">download_for_offline</span>
                <h3 className="text-sm font-extrabold text-on-surface">Xuất hóa đơn bill Excel</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-600">
              <p className="leading-relaxed font-semibold text-gray-500 text-[11px]">
                Chọn các cấu hình chi tiết xuất file báo cáo tổng hợp dịch vụ tháng để lưu trữ hoặc gửi ngoài hệ thống:
              </p>
              
              <div className="space-y-2 pt-1 font-bold text-gray-700 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="exportScope" defaultChecked className="rounded-full border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Xuất tất cả hóa đơn vừa tạo ({validSelectedUnits.length} bill)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="exportScope" className="rounded-full border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Xuất gom thành nhiều sheet trong 1 tệp Excel duy nhất</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="exportScope" className="rounded-full border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Chỉ xuất danh sách bảng tổng hợp doanh số dự kiến</span>
                </label>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-[10px] text-gray-500 font-semibold pl-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Bao gồm chi tiết phép tính chỉ số điện/nước</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-container focus:ring-primary-container" />
                  <span>Bao gồm số điện thoại và email thông tin khách thuê</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  triggerToast('Tải file Excel hóa đơn dịch vụ tổng hợp thành công!', 'success');
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Tải file Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART N: Send Notification After Create Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsNotificationModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scaleUp space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">campaign</span>
                <h3 className="text-sm font-extrabold text-on-surface">Gửi thông báo hóa đơn dịch vụ</h3>
              </div>
              <button onClick={() => setIsNotificationModalOpen(false)} className="text-gray-400 hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-600">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block uppercase">Hóa đơn tạo:</span>
                  <span className="text-on-surface font-mono text-xs">{validSelectedUnits.length}</span>
                </div>
                <div className="p-2 bg-green-50 text-green-800 rounded-xl">
                  <span className="text-green-600/70 block uppercase">Phòng liên kết:</span>
                  <span className="font-mono text-xs">{validSelectedUnits.filter(u => u.isLinked).length} Linked</span>
                </div>
                <div className="p-2 bg-orange-50 text-orange-800 rounded-xl">
                  <span className="text-orange-600/70 block uppercase">Người thuê offline:</span>
                  <span className="font-mono text-xs">{validSelectedUnits.filter(u => !u.isLinked).length} Offline</span>
                </div>
              </div>

              {validSelectedUnits.filter(u => !u.isLinked).length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-2 text-[10px] text-orange-800 font-bold leading-normal">
                  <span className="material-symbols-outlined text-[16px] text-orange-500 font-bold flex-shrink-0">warning</span>
                  <p>
                    Có {validSelectedUnits.filter(u => !u.isLinked).length} khách thuê Offline không thể nhận tin trên RoomHub. Bạn vui lòng tải file Excel gửi qua Zalo/SMS cho họ.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Nội dung tin nhắn thông báo <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  defaultValue={`Chào bạn, RoomHub đã cập nhật hóa đơn dịch vụ tháng ${billingMonth.split('-')[1]}/${billingMonth.split('-')[0]} của bạn. Vui lòng kiểm tra ứng dụng RoomHub để đối soát chi tiết chỉ số và thanh toán trước ngày ${dueDate.split('-').reverse().join('/')}. Cảm ơn bạn!`}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setIsNotificationModalOpen(false);
                  triggerToast(`Đã gửi thông báo nhắc hóa đơn thành công tới ${validSelectedUnits.filter(u => u.isLinked).length} tài khoản liên kết!`, 'success');
                }}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceCreate;
