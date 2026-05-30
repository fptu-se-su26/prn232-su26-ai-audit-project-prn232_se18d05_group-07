import React, { useState, useMemo } from 'react';
import type { PageType } from '../../App';
import { MOCK_PROPERTIES } from './PropertyList';

interface PropertyDetailProps {
  propertyId: number | null;
  setCurrentPage: (page: PageType) => void;
}

// Mock room models and statuses
export interface RoomUnit {
  id: string; // e.g. '401'
  floor: number;
  type: 'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ';
  area: number;
  price: number;
  status: 'Còn trống' | 'Đang thuê' | 'Bảo trì' | 'Quá hạn';
  tenantName?: string;
  tenantPhone?: string;
  tenantStartDate?: string;
  deposit?: number;
  outstandingBillStatus?: 'Đã thanh toán' | 'Chưa thanh toán' | 'Quá hạn';
  outstandingBillAmount?: number;
}

// Generate rich mock rooms for FPT House (ID 1)
const ROOMS_FPT_HOUSE: RoomUnit[] = [
  // Floor 4
  { id: '401', floor: 4, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  { id: '402', floor: 4, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Nguyễn Văn An', tenantPhone: '0905 123 456', tenantStartDate: '01/03/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '403', floor: 4, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Trần Thị Bình', tenantPhone: '0914 987 654', tenantStartDate: '15/02/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '404', floor: 4, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Bảo trì' },
  { id: '405', floor: 4, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  // Floor 3
  { id: '301', floor: 3, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Lê Văn Cường', tenantPhone: '0988 555 444', tenantStartDate: '01/04/2026', deposit: 2500000, outstandingBillStatus: 'Chưa thanh toán', outstandingBillAmount: 3200000 },
  { id: '302', floor: 3, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Quá hạn', tenantName: 'Phạm Thị Dung', tenantPhone: '0909 777 888', tenantStartDate: '01/01/2026', deposit: 5000000, outstandingBillStatus: 'Quá hạn', outstandingBillAmount: 3450000 },
  { id: '303', floor: 3, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Hoàng Văn Em', tenantPhone: '0977 111 222', tenantStartDate: '10/03/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '304', floor: 3, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  { id: '305', floor: 3, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Ngô Quốc Khánh', tenantPhone: '0935 444 888', tenantStartDate: '05/04/2026', deposit: 2500000, outstandingBillStatus: 'Chưa thanh toán', outstandingBillAmount: 3120000 },
  // Floor 2
  { id: '201', floor: 2, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Trịnh Hoài Nam', tenantPhone: '0905 555 666', tenantStartDate: '01/03/2026', deposit: 2500000, outstandingBillStatus: 'Chưa thanh toán', outstandingBillAmount: 3310000 },
  { id: '202', floor: 2, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  { id: '203', floor: 2, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Quá hạn', tenantName: 'Vũ Thị Quỳnh', tenantPhone: '0912 333 444', tenantStartDate: '01/12/2025', deposit: 2500000, outstandingBillStatus: 'Quá hạn', outstandingBillAmount: 3500000 },
  { id: '204', floor: 2, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Phạm Minh Đức', tenantPhone: '0966 888 999', tenantStartDate: '15/02/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '205', floor: 2, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  // Floor 1
  { id: '101', floor: 1, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Đặng Ngọc Ánh', tenantPhone: '0905 888 777', tenantStartDate: '01/02/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '102', floor: 1, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Đang thuê', tenantName: 'Trần Minh Hoàng', tenantPhone: '0979 222 333', tenantStartDate: '01/03/2026', deposit: 2500000, outstandingBillStatus: 'Đã thanh toán', outstandingBillAmount: 0 },
  { id: '103', floor: 1, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' },
  { id: '104', floor: 1, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Bảo trì' },
  { id: '105', floor: 1, type: 'Phòng trọ', area: 25, price: 2500000, status: 'Còn trống' }
];

const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId, setCurrentPage }) => {
  // Use either selected property or default to ID 1 (FPT House) for detail rendering
  const activePropertyId = propertyId || 1;
  const property = useMemo(() => {
    return MOCK_PROPERTIES.find(p => p.id === activePropertyId) || MOCK_PROPERTIES[0];
  }, [activePropertyId]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'tenants' | 'invoices' | 'listings' | 'settings'>('grid');
  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState('Tháng 05/2026');
  // Selected Room for Quick Detail Drawer
  const [selectedRoom, setSelectedRoom] = useState<RoomUnit | null>(null);

  // Settings Configuration Form Binding Mock State
  const [priceElec, setPriceElec] = useState(property.electricityPrice);
  const [priceWater, setPriceWater] = useState(property.waterPrice);
  const [priceNet, setPriceNet] = useState(property.internetPrice);
  const [priceGarbage, setPriceGarbage] = useState(property.garbagePrice);
  const [priceParking, setPriceParking] = useState(property.parkingPrice);
  const [priceService, setPriceService] = useState(property.servicePrice);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Group rooms by floor (Highest to Lowest floor)
  const groupedRoomsByFloor = useMemo(() => {
    const floorsMap: { [floor: number]: RoomUnit[] } = {};
    ROOMS_FPT_HOUSE.forEach(room => {
      if (!floorsMap[room.floor]) {
        floorsMap[room.floor] = [];
      }
      floorsMap[room.floor].push(room);
    });

    // Sort rooms in each floor ascending by id
    Object.keys(floorsMap).forEach(fl => {
      floorsMap[parseInt(fl, 10)].sort((a, b) => a.id.localeCompare(b.id));
    });

    // Return entries sorted descending by floor number
    return Object.entries(floorsMap)
      .map(([floor, rooms]) => ({ floorNumber: parseInt(floor, 10), rooms }))
      .sort((a, b) => b.floorNumber - a.floorNumber);
  }, []);

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const total = ROOMS_FPT_HOUSE.length;
    const vacant = ROOMS_FPT_HOUSE.filter(r => r.status === 'Còn trống').length;
    const occupied = ROOMS_FPT_HOUSE.filter(r => r.status === 'Đang thuê' || r.status === 'Quá hạn').length;
    const maintenance = ROOMS_FPT_HOUSE.filter(r => r.status === 'Bảo trì').length;
    const unpaidInvoices = ROOMS_FPT_HOUSE.filter(r => r.outstandingBillStatus === 'Chưa thanh toán').length;
    const overdueInvoices = ROOMS_FPT_HOUSE.filter(r => r.outstandingBillStatus === 'Quá hạn').length;
    const totalUnpaid = unpaidInvoices + overdueInvoices;

    return { total, vacant, occupied, maintenance, unpaidInvoices, overdueInvoices, totalUnpaid };
  }, []);

  // Filter lists based on the selected month/property
  const activeTenants = useMemo(() => {
    return ROOMS_FPT_HOUSE.filter(r => r.tenantName).map(r => ({
      name: r.tenantName!,
      phone: r.tenantPhone!,
      room: r.id,
      startDate: r.tenantStartDate!,
      deposit: r.deposit!,
      status: r.status === 'Quá hạn' ? 'Chưa đóng tiền' : 'Đang thuê',
      unpaidAmount: r.outstandingBillAmount || 0
    }));
  }, []);

  const activeInvoices = useMemo(() => {
    return ROOMS_FPT_HOUSE.filter(r => r.tenantName).map((r) => ({
      id: `HD-FPTH-${r.id}-0526`,
      month: '05/2026',
      room: r.id,
      tenant: r.tenantName!,
      total: r.price + (r.outstandingBillAmount ? r.outstandingBillAmount - r.price : 810000), // Rent + Electric (200kWh) + Water (10m3) + Net
      status: r.outstandingBillStatus || 'Đã thanh toán',
      dueDate: '10/05/2026'
    }));
  }, []);

  const activeListings = useMemo(() => {
    return [
      {
        id: 101,
        title: 'Phòng trọ đẹp, ban công thoáng gần đại học FPT Đà Nẵng',
        type: 'Phòng trọ',
        roomLink: 'Phòng trống (Tầng 4)',
        price: 2500000,
        status: 'Đang hiển thị',
        createdDate: '10/04/2026',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 102,
        title: 'Căn phòng khép kín, an ninh cao cấp tòa FPT House',
        type: 'Phòng trọ',
        roomLink: 'Phòng trống (Tầng 1)',
        price: 2500000,
        status: 'Chờ duyệt',
        createdDate: '28/05/2026',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80'
      }
    ];
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Lưu đơn giá cài đặt dịch vụ thành công! Các chỉ số hóa đơn kế tiếp sẽ tự động áp dụng biểu phí mới.');
  };

  const handleInvoicePaid = (roomId: string) => {
    alert(`Đã chốt thành công hóa đơn cho phòng ${roomId}! Đã gửi thông báo thanh toán Zalo/Email cho khách.`);
  };

  const handleEndTenancy = (roomId: string, tenantName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn kết thúc hợp đồng thuê và trả phòng cho khách "${tenantName}" tại phòng ${roomId}?`)) {
      alert(`Đã hoàn tất thủ tục thanh lý hợp đồng phòng ${roomId}. Trạng thái phòng được đưa về "Còn trống".`);
      setSelectedRoom(null);
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
      
      {/* Breadcrumb Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>Tài sản & Phòng</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">{property.name}</span>
        </div>
        <button 
          onClick={() => setCurrentPage('owner-properties')}
          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Danh sách tài sản
        </button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
            {property.name}
            <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 text-xs font-bold rounded-full">
              Đang hoạt động
            </span>
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
            {property.address}
          </p>
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{property.type}</span>
            <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{stats.total} phòng/căn</span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">{Math.round((stats.occupied / stats.total) * 100)}% lấp đầy</span>
          </div>
        </div>

        {/* Action Header Panel */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => alert('Thêm phòng mới cho tòa nhà này...')}
            className="px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> Thêm phòng/căn
          </button>
          <button 
            onClick={() => alert('Đang chuyển đến tạo tin cho thuê cho tòa nhà này...')}
            className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 border border-orange-100"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span> Tạo tin đăng
          </button>
          <button 
            onClick={() => alert('Mở form sửa chi tiết tài sản...')}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span> Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Property Overview Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Technical overview list */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface border-b border-gray-100 pb-3 mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">info</span>
              Thông số vận hành chi tiết
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Quy mô tài sản:</span>
                <span className="font-bold text-on-surface block text-sm">{property.floors} Tầng · {property.roomsPerFloor} phòng/tầng</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Tổng phòng trọ:</span>
                <span className="font-bold text-on-surface block text-sm">{stats.total} phòng khép kín</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Đơn giá thuê trung bình:</span>
                <span className="font-bold text-primary-container block text-sm">{formatPrice(property.basePrice)}/tháng</span>
              </div>
              <div className="space-y-1 border-t border-gray-50 pt-3">
                <span className="text-gray-400 block font-medium">Đơn giá điện:</span>
                <span className="font-bold text-gray-700 block text-sm">{formatPrice(property.electricityPrice)}/kWh (đã chốt)</span>
              </div>
              <div className="space-y-1 border-t border-gray-50 pt-3">
                <span className="text-gray-400 block font-medium">Đơn giá nước:</span>
                <span className="font-bold text-gray-700 block text-sm">{formatPrice(property.waterPrice)}/m³</span>
              </div>
              <div className="space-y-1 border-t border-gray-50 pt-3">
                <span className="text-gray-400 block font-medium">Chi phí Internet cố định:</span>
                <span className="font-bold text-gray-700 block text-sm">{formatPrice(property.internetPrice)}/phòng/tháng</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-100/50 p-3.5 rounded-2xl flex items-start gap-2.5 mt-5">
            <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">security</span>
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Chủ nhà Phan Hoài An chịu trách nhiệm quản lý trực tiếp vận hành. Mọi hóa đơn chốt điện nước tự động của **{property.name}** được kiểm duyệt trước khi đồng bộ lên hệ thống.
            </p>
          </div>
        </div>

        {/* Circular Occupancy Progress Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-on-surface mb-3">Tỷ lệ lấp đầy tài sản</h3>
          
          {/* Radial SVG Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="9" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#F97316" 
                strokeWidth="9" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * (stats.occupied / stats.total))}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-on-surface block leading-none">{Math.round((stats.occupied / stats.total) * 100)}%</span>
              <span className="text-[9px] font-bold text-gray-400 mt-1 block">Lấp đầy</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 font-semibold">{stats.occupied} trên {stats.total} phòng đã được bàn giao hợp đồng</p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">{stats.vacant} phòng sẵn sàng dọn vào ngay</p>
        </div>

      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tổng phòng/căn</p>
          <h4 className="text-xl font-black text-on-surface">{stats.total}</h4>
        </div>
        {/* Stat 2 */}
        <div className="bg-green-50/70 p-4 rounded-2xl border border-green-100 soft-shadow">
          <p className="text-[10px] text-green-700 font-bold uppercase mb-1">Còn trống</p>
          <h4 className="text-xl font-black text-green-700">{stats.vacant}</h4>
        </div>
        {/* Stat 3 */}
        <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100 soft-shadow">
          <p className="text-[10px] text-orange-700 font-bold uppercase mb-1">Đang thuê</p>
          <h4 className="text-xl font-black text-orange-700">{stats.occupied}</h4>
        </div>
        {/* Stat 4 */}
        <div className="bg-gray-100/70 p-4 rounded-2xl border border-gray-200/50 soft-shadow">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Bảo trì</p>
          <h4 className="text-xl font-black text-gray-500">{stats.maintenance}</h4>
        </div>
        {/* Stat 5 */}
        <div className="bg-yellow-50/70 p-4 rounded-2xl border border-yellow-200/50 soft-shadow">
          <p className="text-[10px] text-yellow-700 font-bold uppercase mb-1">Chưa đóng tiền</p>
          <h4 className="text-xl font-black text-yellow-700">{stats.unpaidInvoices}</h4>
        </div>
        {/* Stat 6 */}
        <div className="bg-red-50/70 p-4 rounded-2xl border border-red-150/50 soft-shadow">
          <p className="text-[10px] text-red-700 font-bold uppercase mb-1">Quá hạn</p>
          <h4 className="text-xl font-black text-red-700">{stats.overdueInvoices}</h4>
        </div>
      </div>

      {/* Action Bar & Month Selection */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Month Selector dropdown */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-500 shrink-0">Tháng làm việc:</span>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-primary-container outline-none"
          >
            <option value="Tháng 05/2026">Tháng 05/2026</option>
            <option value="Tháng 04/2026">Tháng 04/2026</option>
            <option value="Tháng 03/2026">Tháng 03/2026</option>
          </select>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => alert('Đang mở form thêm hợp đồng khách thuê mới...')}
            className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">person_add</span> Thêm người thuê
          </button>
          <button 
            onClick={() => alert(`Đã mô phỏng quá trình chốt chỉ số điện nước & lập hóa đơn cho toàn bộ 20 phòng của ${property.name}.`)}
            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span> Chốt tiền tháng
          </button>
          <button 
            onClick={() => alert('Xuất bảng tổng hợp công suất và doanh thu của tài sản ra Excel...')}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-gray-400">table_view</span> Xuất Excel
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto no-scrollbar gap-6">
          {[
            { id: 'grid', label: 'Sơ đồ phòng', icon: 'grid_view' },
            { id: 'list', label: 'Danh sách phòng/căn', icon: 'list_alt' },
            { id: 'tenants', label: 'Người thuê', icon: 'people' },
            { id: 'invoices', label: 'Hóa đơn', icon: 'receipt_long' },
            { id: 'listings', label: 'Tin cho thuê', icon: 'campaign' },
            { id: 'settings', label: 'Cài đặt chi phí', icon: 'settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-2 border-b-2 font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary-container text-primary-container'
                  : 'border-transparent text-gray-500 hover:text-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Contents render */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: ROOM GRID */}
        {activeTab === 'grid' && (
          <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Sơ đồ phòng vận hành</h3>
                <p className="text-[11px] text-gray-400 font-medium">Theo dõi và chốt trực tiếp trên bản đồ tầng</p>
              </div>
              
              {/* Colored status legends */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Còn trống
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Đang thuê
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Bảo trì
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Hóa đơn quá hạn
                </span>
              </div>
            </div>

            {/* Grid Layout grouped by floors */}
            <div className="space-y-6 border-t border-gray-50 pt-4">
              {groupedRoomsByFloor.map(({ floorNumber, rooms }) => (
                <div key={floorNumber} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
                  {/* Floor Label */}
                  <div className="w-16 font-black text-xs text-gray-700 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-xl text-center shrink-0">
                    Tầng {floorNumber}
                  </div>

                  {/* Room Cards Row */}
                  <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full">
                    {rooms.map((room) => {
                      const isVacant = room.status === 'Còn trống';
                      const isRented = room.status === 'Đang thuê';
                      const isMaintenance = room.status === 'Bảo trì';
                      const isOverdue = room.status === 'Quá hạn';

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all hover-lift ${
                            isVacant
                              ? 'bg-green-50/70 border-green-150 hover:border-green-400 text-green-950'
                              : isRented
                              ? 'bg-orange-50/60 border-orange-100 hover:border-orange-400 text-orange-950'
                              : isMaintenance
                              ? 'bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-700'
                              : 'bg-red-50/60 border-red-100 hover:border-red-400 text-red-950 ring-2 ring-red-400/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-black">{room.id}</span>
                            
                            {/* Warnings/Status mini icons */}
                            {isOverdue && (
                              <span className="material-symbols-outlined text-red-500 text-[16px] animate-pulse">warning</span>
                            )}
                            {room.outstandingBillStatus === 'Chưa thanh toán' && (
                              <span className="material-symbols-outlined text-yellow-600 text-[16px]">receipt</span>
                            )}
                            {isMaintenance && (
                              <span className="material-symbols-outlined text-gray-400 text-[16px]">construction</span>
                            )}
                            {isVacant && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            )}
                          </div>

                          {/* Extra info text inside card */}
                          <div className="min-h-[32px] flex flex-col justify-end">
                            {isVacant ? (
                              <span className="text-[10px] font-bold text-green-700/80 leading-normal block">Sẵn sàng</span>
                            ) : isMaintenance ? (
                              <span className="text-[10px] font-bold text-gray-500 leading-normal block">Đang sửa chữa</span>
                            ) : (
                              <>
                                <span className="text-[10px] font-bold truncate block">{room.tenantName}</span>
                                <span className="text-[9px] text-gray-400 font-medium block truncate">
                                  {isOverdue ? 'HĐ Quá Hạn' : 'Thuê ổn định'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ROOM LIST (TABLE VIEW) */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-4">Mã phòng</th>
                    <th className="p-4">Tầng</th>
                    <th className="p-4">Loại hình</th>
                    <th className="p-4">Diện tích</th>
                    <th className="p-4">Đơn giá thuê</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Khách đang thuê</th>
                    <th className="p-4">Thanh toán</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                  {ROOMS_FPT_HOUSE.map((room) => (
                    <tr key={room.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="p-4 font-black text-on-surface">{room.id}</td>
                      <td className="p-4">Tầng {room.floor}</td>
                      <td className="p-4 text-gray-500">{room.type}</td>
                      <td className="p-4">{room.area} m²</td>
                      <td className="p-4">{formatPrice(room.price)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          room.status === 'Còn trống'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : room.status === 'Đang thuê'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : room.status === 'Bảo trì'
                            ? 'bg-gray-100 text-gray-600 border border-gray-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface">{room.tenantName || '—'}</td>
                      <td className="p-4">
                        {room.outstandingBillStatus ? (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            room.outstandingBillStatus === 'Đã thanh toán'
                              ? 'bg-green-100 text-green-800'
                              : room.outstandingBillStatus === 'Chưa thanh toán'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {room.outstandingBillStatus}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-4 flex gap-1 justify-center">
                        <button 
                          onClick={() => setSelectedRoom(room)}
                          className="px-2.5 py-1 bg-orange-50 text-primary-container rounded-lg text-[10px] font-bold cursor-pointer hover:bg-orange-100"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TENANTS VIEW */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Danh sách khách thuê ({activeTenants.length} người)</h3>
              <button 
                onClick={() => alert('Thêm người thuê mới...')}
                className="px-3.5 py-1.5 bg-primary-container text-white text-[11px] font-bold rounded-lg hover:bg-orange-600 cursor-pointer transition-all"
              >
                + Thêm người thuê
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4 text-center">Mã phòng</th>
                    <th className="p-4">Ngày bắt đầu</th>
                    <th className="p-4">Tiền cọc</th>
                    <th className="p-4">Trạng thái đóng tiền</th>
                    <th className="p-4">Dư nợ</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                  {activeTenants.map((tenant, index) => (
                    <tr key={index} className="hover:bg-orange-50/20">
                      <td className="p-4 text-on-surface font-black">{tenant.name}</td>
                      <td className="p-4 text-gray-500">{tenant.phone}</td>
                      <td className="p-4 text-center font-black text-orange-600">{tenant.room}</td>
                      <td className="p-4">{tenant.startDate}</td>
                      <td className="p-4">{formatPrice(tenant.deposit)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tenant.status === 'Đang thuê' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-red-600">{tenant.unpaidAmount > 0 ? formatPrice(tenant.unpaidAmount) : '0đ'}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => alert(`Gửi tin nhắn Zalo/SMS chốt công nợ tới ${tenant.name}...`)}
                          className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 cursor-pointer"
                        >
                          Nhắc nợ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVOICES VIEW */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Hóa đơn phòng tháng 05/2026</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => alert('Đã chốt hóa đơn hàng loạt và xuất Excel thành công!')}
                  className="px-3.5 py-1.5 bg-orange-50 text-primary-container border border-orange-100 text-[11px] font-bold rounded-lg hover:bg-orange-100 transition-all cursor-pointer"
                >
                  Xuất Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-4">Mã hóa đơn</th>
                    <th className="p-4">Tháng</th>
                    <th className="p-4 text-center">Phòng</th>
                    <th className="p-4">Khách thuê</th>
                    <th className="p-4">Tổng tiền hóa đơn</th>
                    <th className="p-4">Hạn thanh toán</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xác nhận đóng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                  {activeInvoices.map((inv, index) => (
                    <tr key={index} className="hover:bg-orange-50/20">
                      <td className="p-4 font-mono text-[10px] text-gray-400 font-bold">{inv.id}</td>
                      <td className="p-4">{inv.month}</td>
                      <td className="p-4 text-center font-black text-on-surface">{inv.room}</td>
                      <td className="p-4 font-black">{inv.tenant}</td>
                      <td className="p-4 text-primary-container font-black">{formatPrice(inv.total)}</td>
                      <td className="p-4 text-gray-500">{inv.dueDate}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Đã thanh toán'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : inv.status === 'Chưa thanh toán'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-250'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {inv.status !== 'Đã thanh toán' ? (
                          <button 
                            onClick={() => handleInvoicePaid(inv.room)}
                            className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Đã thu tiền
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Đã chốt xong</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LISTINGS VIEW */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Tin đăng tuyển khách ({activeListings.length} tin)</h3>
              <button 
                onClick={() => alert('Mở giao diện Đăng tin cho thuê...')}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">add</span> Tạo tin cho thuê mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeListings.map((list) => (
                <div key={list.id} className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden flex gap-4 p-4 hover-lift">
                  <img src={list.image} alt={list.title} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface line-clamp-2">{list.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 font-medium">Loại hình: {list.type} · Liên kết: {list.roomLink}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-primary-container">{formatPrice(list.price)}/tháng</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        list.status === 'Đang hiển thị' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-750'
                      }`}>
                        {list.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COST SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-bold text-on-surface border-b border-gray-100 pb-3 mb-6 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">calculate</span>
              Cấu hình biểu phí tài sản dịch vụ chung
            </h3>
            
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-bold text-gray-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Electricity */}
                <div className="space-y-1">
                  <label className="uppercase">Giá điện (VNĐ/kWh)</label>
                  <input 
                    type="number" 
                    value={priceElec}
                    onChange={(e) => setPriceElec(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Water */}
                <div className="space-y-1">
                  <label className="uppercase">Giá nước (VNĐ/m³)</label>
                  <input 
                    type="number" 
                    value={priceWater}
                    onChange={(e) => setPriceWater(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Internet */}
                <div className="space-y-1">
                  <label className="uppercase">Phí mạng Internet (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceNet}
                    onChange={(e) => setPriceNet(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Garbage */}
                <div className="space-y-1">
                  <label className="uppercase">Phí vệ sinh rác thải (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceGarbage}
                    onChange={(e) => setPriceGarbage(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Parking */}
                <div className="space-y-1">
                  <label className="uppercase">Phí gửi xe (VNĐ/Xe)</label>
                  <input 
                    type="number" 
                    value={priceParking}
                    onChange={(e) => setPriceParking(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* General Service fee */}
                <div className="space-y-1">
                  <label className="uppercase">Phí dịch vụ chung quản lý (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceService}
                    onChange={(e) => setPriceService(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

              </div>

              <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex items-start gap-2 mt-4">
                <span className="material-symbols-outlined text-primary-container text-[18px]">info</span>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  Thay đổi biểu phí dịch vụ sẽ được thông báo ngay cho toàn bộ khách thuê qua hệ thống, bảng kê chốt hóa đơn của tháng kế tiếp sẽ áp dụng đơn giá mới này.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Lưu cài đặt chi phí
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* QUICK DETAIL PANEL DRAWER (Slides in from the right!) */}
      {selectedRoom && (
        <>
          {/* Backdrop layer */}
          <div 
            onClick={() => setSelectedRoom(null)}
            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[999] transition-opacity duration-300"
          ></div>

          {/* Sliding Panel */}
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-[1000] border-l border-gray-150 soft-shadow p-6 flex flex-col justify-between overflow-y-auto animate-slideIn">
            
            <div className="space-y-6">
              {/* Drawer Title header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-on-surface">Phòng {selectedRoom.id}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{selectedRoom.type} · Tầng {selectedRoom.floor}</p>
                </div>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedRoom.status === 'Còn trống'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : selectedRoom.status === 'Đang thuê'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : selectedRoom.status === 'Bảo trì'
                    ? 'bg-gray-100 text-gray-600 border border-gray-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {selectedRoom.status}
                </span>
              </div>

              {/* Room Metadata */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5 text-xs text-gray-600 font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-400">Diện tích sàn:</span>
                  <span className="text-on-surface">{selectedRoom.area} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Giá thuê trần:</span>
                  <span className="text-primary-container font-bold">{formatPrice(selectedRoom.price)}/tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vị trí phòng:</span>
                  <span className="text-on-surface">Tầng {selectedRoom.floor} - Cửa sổ ban công</span>
                </div>
              </div>

              {/* Tenancy detail section if Rented */}
              {selectedRoom.tenantName ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">person</span>
                    Thông tin khách thuê trọ
                  </h4>
                  
                  <div className="bg-orange-50/30 border border-orange-100/50 p-4 rounded-2xl space-y-3 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tên khách thuê:</span>
                      <span className="text-on-surface font-bold">{selectedRoom.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số điện thoại:</span>
                      <span className="text-primary-container">{selectedRoom.tenantPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày bắt đầu HĐ:</span>
                      <span className="text-gray-600">{selectedRoom.tenantStartDate}</span>
                    </div>
                    <div className="flex justify-between border-t border-orange-100 pt-2.5">
                      <span className="text-gray-400">Tiền cọc giữ chân:</span>
                      <span className="text-gray-600">{formatPrice(selectedRoom.deposit || 2500000)}</span>
                    </div>
                  </div>

                  {/* Monthly bill state details */}
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 pt-2">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">receipt_long</span>
                    Tình hình hóa đơn tháng này
                  </h4>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái đóng tiền:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        selectedRoom.outstandingBillStatus === 'Đã thanh toán'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedRoom.outstandingBillStatus || 'Chưa thanh toán'}
                      </span>
                    </div>
                    {selectedRoom.outstandingBillAmount && selectedRoom.outstandingBillAmount > 0 ? (
                      <div className="flex justify-between border-t border-gray-200/50 pt-2">
                        <span className="text-gray-400">Tổng thu chốt tháng:</span>
                        <span className="text-red-600 font-bold">{formatPrice(selectedRoom.outstandingBillAmount)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50/50 border border-orange-100/50 p-4 rounded-2xl text-center space-y-2">
                  <span className="material-symbols-outlined text-primary-container text-[28px]">info</span>
                  <p className="text-xs font-bold text-on-surface">Phòng này hiện đang trống</p>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Bạn có thể lập tức thêm thông tin hợp đồng thuê mới hoặc tạo tin đăng quảng bá tìm khách ở ghép trên RoomHub.
                  </p>
                </div>
              )}
            </div>

            {/* Actionable buttons */}
            <div className="border-t border-gray-150 pt-4 space-y-2 mt-6">
              
              {/* If Rented */}
              {selectedRoom.tenantName ? (
                <>
                  <button 
                    onClick={() => { alert(`Đang lập hóa đơn thu tiền chi tiết cho phòng ${selectedRoom.id}...`); setSelectedRoom(null); }}
                    className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">receipt_long</span> Chốt tiền & Tạo hóa đơn
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => alert(`Mở nhật ký đo lường chỉ số điện nước chi tiết của phòng ${selectedRoom.id}`)}
                      className="py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Lịch sử đo
                    </button>
                    <button 
                      onClick={() => handleEndTenancy(selectedRoom.id, selectedRoom.tenantName!)}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Kết thúc thuê
                    </button>
                  </div>
                </>
              ) : (
                /* If Empty */
                <>
                  <button 
                    onClick={() => { alert(`Mở giao diện ký hợp đồng mới cho phòng trống ${selectedRoom.id}`); setSelectedRoom(null); }}
                    className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">person_add</span> Thêm hợp đồng người thuê
                  </button>
                  <button 
                    onClick={() => { alert(`Đã tạo tin đăng liên kết tự động tới phòng trống ${selectedRoom.id} tại tòa ${property.name}`); setSelectedRoom(null); }}
                    className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">campaign</span> Tạo tin đăng cho thuê phòng
                  </button>
                </>
              )}

              {/* Maintenance toggle */}
              <button 
                onClick={() => { alert(`Đã chuyển đổi trạng thái sửa chữa, bảo trì cho phòng ${selectedRoom.id}.`); setSelectedRoom(null); }}
                className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">construction</span> 
                {selectedRoom.status === 'Bảo trì' ? 'Kết thúc bảo trì' : 'Đánh dấu bảo trì sửa chữa'}
              </button>

            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default PropertyDetail;
