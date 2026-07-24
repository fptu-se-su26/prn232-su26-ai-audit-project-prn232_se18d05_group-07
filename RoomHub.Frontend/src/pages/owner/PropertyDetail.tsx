import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface PropertyDetailProps {
  propertyId: number | null;
  setCurrentPage: (page: PageType) => void;
}

// Room models and statuses
export interface RoomUnit {
  id: string; // Database ID
  roomNumber: string; // Display number (e.g. '101')
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

const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId, setCurrentPage }) => {
  // Use either selected property or default to ID 1
  const activePropertyId = propertyId || 1;
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Room Modal states
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [addRoomNumber, setAddRoomNumber] = useState('');
  const [addFloorNumber, setAddFloorNumber] = useState(1);
  const [addRoomType, setAddRoomType] = useState('BoardingHouse');
  const [addBasePrice, setAddBasePrice] = useState(2500000);
  const [addSurfaceArea, setAddSurfaceArea] = useState(25);
  const [addMaxCapacity, setAddMaxCapacity] = useState(2);
  const [addRoomError, setAddRoomError] = useState<string | null>(null);
  const [addRoomLoading, setAddRoomLoading] = useState(false);

  // Edit Property Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editWard, setEditWard] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editElectricityPrice, setEditElectricityPrice] = useState(3500);
  const [editWaterPrice, setEditWaterPrice] = useState(15000);
  const [editWaterBillingType, setEditWaterBillingType] = useState('PerCubicMeter');
  const [editInternetPrice, setEditInternetPrice] = useState(100000);
  const [editGarbagePrice, setEditGarbagePrice] = useState(30000);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete Confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openEditModal = () => {
    if (!property) return;
    setEditName(property.name);
    setEditAddress(property.address);
    setEditDistrict(property.district || '');
    setEditWard(property.ward || '');
    setEditImageUrl(property.image || '');
    setEditElectricityPrice(property.electricityPrice);
    setEditWaterPrice(property.waterPrice);
    setEditWaterBillingType(property.waterBillingType || 'PerCubicMeter');
    setEditInternetPrice(property.internetPrice);
    setEditGarbagePrice(property.garbagePrice);
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploadingImage(true);
      const res = await api.post('/owner/properties/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditImageUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert('Không thể tải lên hình ảnh.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      await api.put(`/owner/properties/${activePropertyId}`, {
        name: editName,
        address: editAddress,
        district: editDistrict,
        ward: editWard,
        imageUrl: editImageUrl,
        electricityPrice: editElectricityPrice,
        waterPrice: editWaterPrice,
        waterBillingType: editWaterBillingType,
        internetPrice: editInternetPrice,
        garbagePrice: editGarbagePrice
      });
      setIsEditOpen(false);
      await fetchPropertyDetail();
    } catch (err: any) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddRoomError(null);
    setAddRoomLoading(true);

    try {
      await api.post(`/owner/properties/${activePropertyId}/rooms`, {
        roomNumber: addRoomNumber,
        floorNumber: addFloorNumber,
        roomType: addRoomType,
        basePrice: addBasePrice,
        surfaceArea: addSurfaceArea,
        maxCapacity: addMaxCapacity
      });
      setIsAddRoomOpen(false);
      // Reset form
      setAddRoomNumber('');
      setAddFloorNumber(1);
      setAddRoomType('BoardingHouse');
      setAddBasePrice(2500000);
      setAddSurfaceArea(25);
      setAddMaxCapacity(2);
      await fetchPropertyDetail();
    } catch (err: any) {
      console.error(err);
      setAddRoomError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm phòng.');
    } finally {
      setAddRoomLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      const res = await api.delete(`/owner/properties/${activePropertyId}`);
      if (res.data.success) {
        setIsDeleteConfirmOpen(false);
        setCurrentPage('owner-properties');
      }
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa tài sản.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tab State
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'tenants' | 'invoices' | 'listings' | 'settings'>('grid');
  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState('Tháng 05/2026');
  // Selected Room for Quick Detail Drawer
  const [selectedRoom, setSelectedRoom] = useState<RoomUnit | null>(null);

  // Settings Configuration Form Binding
  const [priceElec, setPriceElec] = useState(0);
  const [priceWater, setPriceWater] = useState(0);
  const [waterBillingType, setWaterBillingType] = useState<'PerCubicMeter' | 'PerPerson'>('PerCubicMeter');
  const [priceNet, setPriceNet] = useState(0);
  const [priceGarbage, setPriceGarbage] = useState(0);
  const [priceParking, setPriceParking] = useState(50000);
  const [priceService, setPriceService] = useState(0);

  // Property Listings State
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/owner/properties/${activePropertyId}`);
      setProperty(res.data.property);
      setRooms(res.data.rooms);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải thông tin chi tiết tài sản này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetail();
  }, [activePropertyId]);

  useEffect(() => {
    if (property) {
      setPriceElec(property.electricityPrice);
      setPriceWater(property.waterPrice);
      setWaterBillingType(property.waterBillingType || 'PerCubicMeter');
      setPriceNet(property.internetPrice);
      setPriceGarbage(property.garbagePrice);
      setPriceParking(property.parkingPrice || 50000);
      setPriceService(property.servicePrice || 0);
    }
  }, [property]);

  const fetchPropertyListings = async () => {
    if (!property) return;
    try {
      setLoadingListings(true);
      const res = await api.get('/owner/listings');
      const allListings = res.data || [];
      const propertyRoomIds = new Set(rooms.map(r => r.id.toString()));
      const propertyRoomNumbers = new Set(rooms.map(r => r.roomNumber));

      const filtered = allListings.filter((l: any) => 
        (l.roomId && propertyRoomIds.has(l.roomId.toString())) ||
        (l.buildingName && property.name && l.buildingName.toLowerCase() === property.name.toLowerCase()) ||
        (l.roomNumber && propertyRoomNumbers.has(l.roomNumber))
      );
      setListings(filtered);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tin đăng:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (property && rooms.length > 0) {
      fetchPropertyListings();
    }
  }, [property, rooms]);

  // Group rooms by floor (Highest to Lowest floor)
  const groupedRoomsByFloor = useMemo(() => {
    const floorsMap: { [floor: number]: RoomUnit[] } = {};
    rooms.forEach(room => {
      if (!floorsMap[room.floor]) {
        floorsMap[room.floor] = [];
      }
      floorsMap[room.floor].push(room);
    });

    // Sort rooms in each floor ascending by roomNumber
    Object.keys(floorsMap).forEach(fl => {
      floorsMap[parseInt(fl, 10)].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    });

    // Return entries sorted descending by floor number
    return Object.entries(floorsMap)
      .map(([floor, rooms]) => ({ floorNumber: parseInt(floor, 10), rooms }))
      .sort((a, b) => b.floorNumber - a.floorNumber);
  }, [rooms]);

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const total = rooms.length;
    const vacant = rooms.filter(r => r.status === 'Còn trống').length;
    const occupied = rooms.filter(r => r.status === 'Đang thuê' || r.status === 'Quá hạn').length;
    const maintenance = rooms.filter(r => r.status === 'Bảo trì').length;
    const unpaidInvoices = rooms.filter(r => r.outstandingBillStatus === 'Chưa thanh toán').length;
    const overdueInvoices = rooms.filter(r => r.outstandingBillStatus === 'Quá hạn').length;
    const totalUnpaid = unpaidInvoices + overdueInvoices;

    return { total, vacant, occupied, maintenance, unpaidInvoices, overdueInvoices, totalUnpaid };
  }, [rooms]);

  // Filter lists based on the selected month/property
  const activeTenants = useMemo(() => {
    return rooms.filter(r => r.tenantName).map(r => ({
      name: r.tenantName!,
      phone: r.tenantPhone!,
      room: r.roomNumber,
      startDate: r.tenantStartDate!,
      deposit: r.deposit!,
      status: r.status === 'Quá hạn' ? 'Chưa đóng tiền' : 'Đang thuê',
      unpaidAmount: r.outstandingBillAmount || 0
    }));
  }, [rooms]);

  const activeInvoices = useMemo(() => {
    return rooms.filter(r => r.tenantName).map((r) => ({
      id: `HD-FPTH-${r.roomNumber}-0526`,
      month: '05/2026',
      room: r.roomNumber,
      tenant: r.tenantName!,
      total: r.price + (r.outstandingBillAmount ? r.outstandingBillAmount - r.price : 810000),
      status: r.outstandingBillStatus || 'Đã thanh toán',
      dueDate: '10/05/2026'
    }));
  }, [rooms]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      await api.put(`/owner/properties/${activePropertyId}`, {
        name: property.name,
        description: property.description,
        address: property.address,
        district: property.district,
        ward: property.ward,
        imageUrl: property.image,
        electricityPrice: priceElec,
        waterPrice: priceWater,
        waterBillingType: waterBillingType,
        internetPrice: priceNet,
        garbagePrice: priceGarbage
      });
      alert('Lưu đơn giá cài đặt dịch vụ thành công! Các chỉ số hóa đơn kế tiếp sẽ tự động áp dụng biểu phí mới.');
      await fetchPropertyDetail();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể lưu cài đặt chi phí.');
    }
  };

  const handleInvoicePaid = (roomId: string) => {
    alert(`Đã chốt thành công hóa đơn cho phòng ${roomId}! Đã gửi thông báo thanh toán Zalo/Email cho khách.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải sơ đồ phòng...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3 max-w-md mx-auto mt-12 shadow-sm">
        <span className="material-symbols-outlined text-[36px] text-red-500 block">error</span>
        <h3 className="text-sm font-bold">{error || 'Không tìm thấy thông tin tòa nhà.'}</h3>
        <button onClick={fetchPropertyDetail} className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          Thử lại
        </button>
      </div>
    );
  }



  return (
    <div className="space-y-6 relative pb-12">
      
      {/* Breadcrumb Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
          <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-properties')}>Tài sản & Phòng</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-800 font-bold">{property.name}</span>
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
          <h2 className="text-2xl font-black text-slate-850 flex items-center gap-2">
            {property.name}
            <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 text-xs font-bold rounded-full">
              Đang hoạt động
            </span>
          </h2>
          <p className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
            {property.address}
          </p>
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-bold text-gray-650 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{property.type}</span>
            <span className="text-xs font-bold text-gray-650 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{stats.total} phòng/căn</span>
            <span className="text-xs font-bold text-orange-605 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">{Math.round((stats.occupied / stats.total) * 100)}% lấp đầy</span>
          </div>
        </div>

        {/* Action Header Panel */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddRoomOpen(true)}
            className="px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> Thêm phòng/căn
          </button>
          <button 
            onClick={() => setCurrentPage('owner-listings-create')}
            className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 border border-orange-100"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span> Tạo tin đăng
          </button>
          <button 
            onClick={openEditModal}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span> Chỉnh sửa
          </button>
          <button 
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-550 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 border border-red-100"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span> Xóa tài sản
          </button>
        </div>
      </div>

      {/* Property Overview Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Technical overview list */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">info</span>
              Thông số vận hành chi tiết
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Quy mô tài sản:</span>
                <span className="font-bold text-slate-800 block text-sm">{property.floors || groupedRoomsByFloor.length} Tầng</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-medium">Tổng phòng trọ:</span>
                <span className="font-bold text-slate-800 block text-sm">{stats.total} phòng khép kín</span>
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
                <span className="font-bold text-gray-700 block text-sm">
                  {formatPrice(property.waterPrice)} / {property.waterBillingType === 'PerPerson' ? 'người/tháng' : 'm³'}
                </span>
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
          <h3 className="text-sm font-bold text-slate-800 mb-3">Tỷ lệ lấp đầy tài sản</h3>
          
          {/* Radial SVG Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#radial-orange-gradient)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * (stats.occupied / stats.total))}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="radial-orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-800 block leading-none">{Math.round((stats.occupied / stats.total) * 100)}%</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Lấp đầy</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 font-semibold">{stats.occupied} trên {stats.total} phòng đã được bàn giao hợp đồng</p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">{stats.vacant} phòng sẵn sàng dọn vào ngay</p>
        </div>

      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tổng phòng/căn</p>
          <h4 className="text-xl font-black text-slate-800 tracking-tight">{stats.total}</h4>
        </div>
        {/* Stat 2 */}
        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-150/50 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-green-655 font-bold uppercase mb-1">Còn trống</p>
          <h4 className="text-xl font-black text-green-700 tracking-tight">{stats.vacant}</h4>
        </div>
        {/* Stat 3 */}
        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/60 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-orange-605 font-bold uppercase mb-1">Đang thuê</p>
          <h4 className="text-xl font-black text-orange-700 tracking-tight">{stats.occupied}</h4>
        </div>
        {/* Stat 4 */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Bảo trì</p>
          <h4 className="text-xl font-black text-slate-600 tracking-tight">{stats.maintenance}</h4>
        </div>
        {/* Stat 5 */}
        <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-150/60 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-yellow-650 font-bold uppercase mb-1">Chưa đóng tiền</p>
          <h4 className="text-xl font-black text-yellow-750 tracking-tight">{stats.unpaidInvoices}</h4>
        </div>
        {/* Stat 6 */}
        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-150/60 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-[10px] text-red-600 font-bold uppercase mb-1">Quá hạn</p>
          <h4 className="text-xl font-black text-red-700 tracking-tight">{stats.overdueInvoices}</h4>
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
            onClick={() => {
              window.location.hash = '#/owner/invoices';
              setCurrentPage('owner-invoices');
            }}
            className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">calculate</span> Chốt tiền tháng
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
                            <span className="text-sm font-black">{room.roomNumber}</span>
                            
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
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="p-4 font-black text-on-surface">{room.roomNumber}</td>
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
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            window.location.hash = `#/owner/units/${tenant.room}`;
                          }}
                          className="font-black text-orange-600 hover:text-orange-700 hover:underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Phòng {tenant.room}
                        </button>
                      </td>
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
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            window.location.hash = `#/owner/units/${inv.room}`;
                          }}
                          className="font-black text-gray-800 hover:text-primary-container hover:underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Phòng {inv.room}
                        </button>
                      </td>
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
              <h3 className="text-sm font-bold text-on-surface">Tin đăng tuyển khách ({listings.length} tin)</h3>
              <button 
                onClick={() => setCurrentPage('owner-listings-create')}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">add</span> Tạo tin cho thuê mới
              </button>
            </div>

            {loadingListings ? (
              <div className="py-8 text-center text-xs font-bold text-gray-400">Đang tải danh sách tin đăng...</div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((list: any) => (
                  <div key={list.id || list.roomId} className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden flex gap-4 p-4 hover-lift">
                    <img 
                      src={list.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'} 
                      alt={list.title} 
                      className="w-24 h-24 rounded-xl object-cover shrink-0" 
                    />
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-xs font-bold text-on-surface line-clamp-2">{list.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">Loại hình: {list.type || 'Phòng trọ'} · Phòng {list.roomNumber}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-primary-container">{formatPrice(list.price)}/tháng</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          list.isPublished ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-750'
                        }`}>
                          {list.isPublished ? 'Đang hiển thị' : 'Chờ duyệt / Tạm ẩn'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-8 text-center space-y-3">
                <span className="material-symbols-outlined text-gray-300 text-[40px]">campaign</span>
                <p className="text-xs font-bold text-slate-700">Chưa có tin cho thuê nào được đăng cho tòa nhà {property.name}</p>
                <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                  Tạo bài đăng tuyển khách để tự động liên kết với phòng trống thuộc tòa nhà này và tiếp cận người thuê trên RoomHub.
                </p>
                <button
                  onClick={() => setCurrentPage('owner-listings-create')}
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Tạo tin cho thuê mới
                </button>
              </div>
            )}
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
                    onChange={(e) => setPriceElec(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Water Billing Type */}
                <div className="space-y-1">
                  <label className="uppercase">Hình thức tính tiền nước</label>
                  <select
                    value={waterBillingType}
                    onChange={(e) => setWaterBillingType(e.target.value as 'PerCubicMeter' | 'PerPerson')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50"
                  >
                    <option value="PerCubicMeter">Tính theo khối (m³)</option>
                    <option value="PerPerson">Tính theo đầu người (người/tháng)</option>
                  </select>
                </div>

                {/* Water Price */}
                <div className="space-y-1">
                  <label className="uppercase">
                    {waterBillingType === 'PerPerson' ? 'Giá nước (VNĐ/người/tháng)' : 'Giá nước (VNĐ/m³)'}
                  </label>
                  <input 
                    type="number" 
                    value={priceWater}
                    onChange={(e) => setPriceWater(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Internet */}
                <div className="space-y-1">
                  <label className="uppercase">Phí mạng Internet (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceNet}
                    onChange={(e) => setPriceNet(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Garbage */}
                <div className="space-y-1">
                  <label className="uppercase">Phí vệ sinh rác thải (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceGarbage}
                    onChange={(e) => setPriceGarbage(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* Parking */}
                <div className="space-y-1">
                  <label className="uppercase">Phí gửi xe (VNĐ/Xe)</label>
                  <input 
                    type="number" 
                    value={priceParking}
                    onChange={(e) => setPriceParking(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

                {/* General Service fee */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="uppercase">Phí dịch vụ chung quản lý (VNĐ/Phòng)</label>
                  <input 
                    type="number" 
                    value={priceService}
                    onChange={(e) => setPriceService(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>

              </div>

              <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex items-start gap-2 mt-4">
                <span className="material-symbols-outlined text-primary-container text-[18px]">info</span>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  Thay đổi biểu phí dịch vụ sẽ được đồng bộ ngay cho toàn bộ tòa nhà, bảng kê chốt hóa đơn của tháng kế tiếp sẽ áp dụng đơn giá mới này.
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
              
              <button 
                onClick={() => {
                  window.location.hash = `#/owner/units/${selectedRoom.id}`;
                  setSelectedRoom(null);
                }}
                className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">visibility</span>
                Chi tiết vận hành & Khách thuê ➔
              </button>
              
              {/* If Rented */}
              {selectedRoom.tenantName ? (
                <>
                  <button 
                    onClick={() => {
                      window.location.hash = '#/owner/invoices';
                      setCurrentPage('owner-invoices');
                      setSelectedRoom(null);
                    }}
                    className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">receipt_long</span> Chốt tiền & Tạo hóa đơn
                  </button>
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

      {/* Edit Property Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 md:p-8 soft-shadow border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-105 pb-4 mb-6">
              <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">edit</span>
                Chỉnh sửa tài sản
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-on-surface cursor-pointer bg-transparent border-0 outline-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span> {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-bold text-gray-500">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block mb-1.5 uppercase">Tên tài sản</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-1.5 uppercase">Hình ảnh (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                      placeholder="Dán link ảnh trọ..."
                    />
                    <label className="px-4 py-3 bg-primary-container hover:bg-orange-600 text-white rounded-xl cursor-pointer text-center font-bold whitespace-nowrap active:scale-95 transition-all">
                      Chọn file
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {isUploadingImage && <p className="text-[10px] text-primary-container mt-1 animate-pulse">Đang tải ảnh lên...</p>}
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1.5 uppercase">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1.5 uppercase">Quận / Huyện</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase">Phường / Xã</label>
                  <input
                    type="text"
                    value={editWard}
                    onChange={(e) => setEditWard(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4 text-left">
                <h4 className="text-slate-800 text-xs font-black mb-3">Đơn giá dịch vụ mặc định</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px]">Đơn giá Điện (kWh)</label>
                    <input
                      type="number"
                      required
                      value={editElectricityPrice}
                      onChange={(e) => setEditElectricityPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px]">Đơn giá Nước</label>
                    <input
                      type="number"
                      required
                      value={editWaterPrice}
                      onChange={(e) => setEditWaterPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px]">Tính phí Nước theo</label>
                    <select
                      value={editWaterBillingType}
                      onChange={(e) => setEditWaterBillingType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                    >
                      <option value="PerCubicMeter">Mét khối (m³)</option>
                      <option value="PerPerson">Đầu người (Người)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px]">Mạng Internet (Phòng)</label>
                    <input
                      type="number"
                      required
                      value={editInternetPrice}
                      onChange={(e) => setEditInternetPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px]">Rác vệ sinh (Phòng)</label>
                    <input
                      type="number"
                      required
                      value={editGarbagePrice}
                      onChange={(e) => setEditGarbagePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl font-bold transition-all cursor-pointer outline-none border-0"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 outline-none border-0"
                >
                  {editLoading ? 'Đang cập nhật...' : 'Lưu chỉnh sửa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 md:p-8 soft-shadow border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-105 pb-4 mb-6">
              <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">meeting_room</span>
                Thêm phòng/căn mới
              </h3>
              <button onClick={() => setIsAddRoomOpen(false)} className="text-gray-400 hover:text-on-surface cursor-pointer bg-transparent border-0 outline-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {addRoomError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-[18px]">error</span> {addRoomError}
              </div>
            )}

            <form onSubmit={handleAddRoomSubmit} className="space-y-4 text-xs font-bold text-gray-500">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1.5 uppercase">Số phòng/căn</label>
                  <input
                    type="text"
                    required
                    value={addRoomNumber}
                    onChange={(e) => setAddRoomNumber(e.target.value)}
                    placeholder="Ví dụ: 106"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase">Tầng số</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={addFloorNumber}
                    onChange={(e) => setAddFloorNumber(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1.5 uppercase">Loại phòng</label>
                <select
                  value={addRoomType}
                  onChange={(e) => setAddRoomType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                >
                  <option value="BoardingHouse">Phòng trọ thường</option>
                  <option value="Studio">Phòng Studio</option>
                  <option value="MiniApartment">Căn hộ mini</option>
                  <option value="Apartment">Căn hộ dịch vụ</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="col-span-2">
                  <label className="block mb-1.5 uppercase text-[10px]">Giá thuê (VNĐ/tháng)</label>
                  <input
                    type="number"
                    required
                    value={addBasePrice}
                    onChange={(e) => setAddBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase text-[10px]">Diện tích (m²)</label>
                  <input
                    type="number"
                    required
                    value={addSurfaceArea}
                    onChange={(e) => setAddSurfaceArea(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1.5 uppercase">Số người tối đa</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={addMaxCapacity}
                  onChange={(e) => setAddMaxCapacity(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl font-bold transition-all cursor-pointer outline-none border-0"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addRoomLoading}
                  className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 outline-none border-0"
                >
                  {addRoomLoading ? 'Đang lưu...' : 'Thêm phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 md:p-8 soft-shadow border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-2">Xác nhận xóa tài sản này?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Bạn có chắc muốn xóa tài sản <strong>{property.name}</strong> không? Hành động này sẽ thực hiện xóa mềm (soft delete) tòa nhà và toàn bộ các phòng trọ liên kết.
            </p>

            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200 flex items-center justify-center gap-1 text-left">
                <span className="material-symbols-outlined text-[16px]">error</span> {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl font-bold transition-all cursor-pointer outline-none border-0"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 bg-red-600 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 outline-none border-0"
              >
                {deleteLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetail;
