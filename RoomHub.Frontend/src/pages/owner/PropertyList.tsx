import React, { useState, useMemo } from 'react';
import type { PageType } from '../../App';

interface PropertyListProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedPropertyId: (id: number | null) => void;
}

export interface Property {
  id: number;
  name: string;
  type: 'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ';
  address: string;
  district: string;
  floors: number;
  roomsPerFloor: number;
  totalRooms: number;
  occupiedRooms: number;
  basePrice: number;
  electricityPrice: number;
  waterPrice: number;
  internetPrice: number;
  garbagePrice: number;
  parkingPrice: number;
  servicePrice: number;
  image: string;
  status: 'Đang hoạt động' | 'Đang bảo trì' | 'Ngừng hoạt động';
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    name: 'FPT House',
    type: 'Phòng trọ',
    address: 'Đường Nam Kỳ Khởi Nghĩa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    district: 'Quận Ngũ Hành Sơn',
    floors: 4,
    roomsPerFloor: 5,
    totalRooms: 20,
    occupiedRooms: 15,
    basePrice: 2500000,
    electricityPrice: 3500,
    waterPrice: 15000,
    internetPrice: 100000,
    garbagePrice: 30000,
    parkingPrice: 50000,
    servicePrice: 50000,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    status: 'Đang hoạt động'
  },
  {
    id: 2,
    name: 'Mỹ Khê Sea View Studio',
    type: 'Studio',
    address: 'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
    district: 'Quận Sơn Trà',
    floors: 1,
    roomsPerFloor: 4,
    totalRooms: 4,
    occupiedRooms: 2,
    basePrice: 5500000,
    electricityPrice: 3800,
    waterPrice: 18000,
    internetPrice: 120000,
    garbagePrice: 40000,
    parkingPrice: 80000,
    servicePrice: 100000,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    status: 'Đang hoạt động'
  },
  {
    id: 3,
    name: 'Liên Chiểu Campus House',
    type: 'Phòng trọ',
    address: 'Đường Ngô Sĩ Liên, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng',
    district: 'Quận Liên Chiểu',
    floors: 1,
    roomsPerFloor: 3,
    totalRooms: 3,
    occupiedRooms: 2,
    basePrice: 2000000,
    electricityPrice: 3000,
    waterPrice: 12000,
    internetPrice: 80000,
    garbagePrice: 20000,
    parkingPrice: 30000,
    servicePrice: 30000,
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    status: 'Đang hoạt động'
  },
  {
    id: 4,
    name: 'Hải Châu Central Mini Apartment',
    type: 'Căn hộ mini',
    address: 'Đường Nguyễn Chí Thanh, Thạch Thang, Hải Châu, Đà Nẵng',
    district: 'Quận Hải Châu',
    floors: 1,
    roomsPerFloor: 2,
    totalRooms: 2,
    occupiedRooms: 2,
    basePrice: 6200000,
    electricityPrice: 3500,
    waterPrice: 15000,
    internetPrice: 100000,
    garbagePrice: 30000,
    parkingPrice: 50000,
    servicePrice: 80000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    status: 'Đang hoạt động'
  },
  {
    id: 5,
    name: 'Sông Hàn Luxury Apartment',
    type: 'Căn hộ',
    address: 'Đường Bạch Đằng, Bình Hiên, Hải Châu, Đà Nẵng',
    district: 'Quận Hải Châu',
    floors: 1,
    roomsPerFloor: 1,
    totalRooms: 1,
    occupiedRooms: 0,
    basePrice: 8500000,
    electricityPrice: 4000,
    waterPrice: 20000,
    internetPrice: 150000,
    garbagePrice: 50000,
    parkingPrice: 100000,
    servicePrice: 120000,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    status: 'Đang bảo trì'
  }
];

const PropertyList: React.FC<PropertyListProps> = ({ setCurrentPage, setSelectedPropertyId }) => {
  const [demoMode, setDemoMode] = useState<'loaded' | 'empty'>('loaded');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Tất cả');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for simulator
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ'>('Phòng trọ');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropDistrict, setNewPropDistrict] = useState('Quận Ngũ Hành Sơn');
  const [newPropFloors, setNewPropFloors] = useState(2);
  const [newPropRoomsPerFloor, setNewPropRoomsPerFloor] = useState(4);
  const [newPropPrice, setNewPropPrice] = useState(2500000);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const filteredProperties = useMemo(() => {
    if (demoMode === 'empty') return [];

    return MOCK_PROPERTIES.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            prop.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === 'Tất cả' || prop.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [demoMode, searchQuery, selectedTypeFilter]);

  // Calculations for loaded state
  const metrics = useMemo(() => {
    if (demoMode === 'empty') {
      return { total: 0, active: 0, totalRooms: 0, occupied: 0, rate: 0 };
    }
    const total = MOCK_PROPERTIES.length;
    const active = MOCK_PROPERTIES.filter(p => p.status === 'Đang hoạt động').length;
    const totalRooms = MOCK_PROPERTIES.reduce((acc, p) => acc + p.totalRooms, 0);
    const occupied = MOCK_PROPERTIES.reduce((acc, p) => acc + p.occupiedRooms, 0);
    const rate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    return { total, active, totalRooms, occupied, rate };
  }, [demoMode]);

  const handleManageRooms = (id: number) => {
    setSelectedPropertyId(id);
    setCurrentPage('owner-property-detail');
  };

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) {
      alert('Vui lòng điền đầy đủ tên và địa chỉ tài sản.');
      return;
    }
    alert(`Mô phỏng thành công! Đã tạo cấu trúc toà nhà "${newPropName}" với ${newPropFloors} tầng, tổng ${newPropFloors * newPropRoomsPerFloor} phòng cho thuê. Danh sách sơ đồ phòng đã được khởi tạo tự động.`);
    setIsAddModalOpen(false);
    // Switch to loaded if it was empty
    if (demoMode === 'empty') {
      setDemoMode('loaded');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Mode Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">science</span>
          <span className="text-xs font-bold text-gray-700">Chế độ Demo: Bạn đang kiểm nghiệm danh sách Tài sản của Chủ nhà.</span>
        </div>
        <button 
          onClick={() => setDemoMode(demoMode === 'loaded' ? 'empty' : 'loaded')}
          className="px-4 py-2 bg-white text-xs font-bold text-primary-container border border-orange-200 rounded-xl hover:bg-orange-100/50 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {demoMode === 'loaded' ? 'Chuyển sang "Chế độ tài khoản mới trống"' : 'Chuyển sang "Chế độ có sẵn dữ liệu mẫu"'}
        </button>
      </div>

      {/* Page Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-gray-800 font-bold">Tài sản & Phòng</span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Tổng tài sản</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-on-surface">{metrics.total}</h3>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">{metrics.active} đang hoạt động</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Tổng số phòng/căn</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-on-surface">{metrics.totalRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">{metrics.occupied} phòng đang thuê</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Phòng trống</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-on-surface">{metrics.totalRooms - metrics.occupied}</h3>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">Sẵn sàng chào đón khách</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Tỷ lệ lấp đầy TB</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">percent</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-on-surface">{metrics.rate}%</h3>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.rate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 soft-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài sản, địa chỉ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-on-surface placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-container transition-all"
          />
        </div>

        {/* Type Filters Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
          {['Tất cả', 'Phòng trọ', 'Studio', 'Căn hộ mini', 'Căn hộ'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-orange-50 text-primary-container border border-orange-100'
                  : 'bg-white text-gray-600 border border-gray-200/60 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Add Property Trigger */}
        <button 
          onClick={() => setCurrentPage('owner-properties-create')}
          className="w-full md:w-auto px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">add</span> Thêm tài sản mới
        </button>
      </div>

      {/* Property Cards Grid or Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[36px]">corporate_fare</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">Tài sản này chưa có phòng/căn nào</h3>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
            Hãy thêm tòa nhà trọ, studio hoặc căn hộ mini mới của bạn để bắt đầu thiết lập sơ đồ phòng trọ, chốt tiền phòng hàng tháng.
          </p>
          <button 
            onClick={() => setCurrentPage('owner-properties-create')}
            className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> Tạo sơ đồ tài sản ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const occupancyRate = property.totalRooms > 0 ? Math.round((property.occupiedRooms / property.totalRooms) * 100) : 0;
            return (
              <div 
                key={property.id} 
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden soft-shadow hover-lift flex flex-col h-full group"
              >
                {/* Image section */}
                <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={property.image} 
                    alt={property.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {property.type}
                  </div>
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    property.status === 'Đang hoạt động'
                      ? 'bg-green-500/90 text-white border-green-400'
                      : 'bg-gray-500/90 text-white border-gray-400'
                  }`}>
                    {property.status}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-on-surface mb-0.5 line-clamp-1 group-hover:text-primary-container transition-colors">
                        {property.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 leading-normal">
                        <span className="material-symbols-outlined text-[14px] text-gray-400 shrink-0">location_on</span>
                        <span className="truncate">{property.address}</span>
                      </p>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="space-y-1 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-500">Đã lấp đầy</span>
                        <span className="text-primary-container">{property.occupiedRooms}/{property.totalRooms} phòng ({occupancyRate}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyRate >= 75 ? 'bg-emerald-500' : occupancyRate >= 40 ? 'bg-orange-400' : 'bg-red-400'
                          }`} 
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Fees Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Giá điện:</span>
                        <span className="font-bold text-gray-700">{formatPrice(property.electricityPrice)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Giá nước:</span>
                        <span className="font-bold text-gray-700">{formatPrice(property.waterPrice)}/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Giá thuê sàn:</span>
                        <span className="font-bold text-gray-700">{formatPrice(property.basePrice)}/th</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quy mô:</span>
                        <span className="font-bold text-gray-700">{property.floors} tầng - {property.roomsPerFloor}p/t</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-5 border-t border-gray-100 pt-4">
                    <button 
                      onClick={() => handleManageRooms(property.id)}
                      className="col-span-2 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">grid_view</span> Quản lý sơ đồ phòng
                    </button>
                    <button 
                      onClick={() => alert(`Đăng tin cho thuê tài sản "${property.name}"...`)}
                      className="py-2 bg-orange-50 hover:bg-orange-100/80 text-primary-container rounded-xl text-[11px] font-bold text-center transition-all flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">campaign</span> Đăng tin
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mock Add Property Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-lg overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100/50 flex justify-between items-center">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">corporate_fare</span>
                Thêm tài sản trọ & sơ đồ phòng mới
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-orange-100/30 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddPropertySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Property Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Tên tòa nhà/khu trọ</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: RoomHub Ngũ Hành Sơn" 
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container"
                    required
                  />
                </div>

                {/* Property Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Loại hình</label>
                  <select 
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container bg-white"
                  >
                    <option value="Phòng trọ">Phòng trọ</option>
                    <option value="Studio">Studio</option>
                    <option value="Căn hộ mini">Căn hộ mini</option>
                    <option value="Căn hộ">Căn hộ</option>
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Quận/Huyện</label>
                  <select 
                    value={newPropDistrict}
                    onChange={(e) => setNewPropDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container bg-white"
                  >
                    <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
                    <option value="Quận Hải Châu">Quận Hải Châu</option>
                    <option value="Quận Sơn Trà">Quận Sơn Trà</option>
                    <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
                    <option value="Quận Cẩm Lệ">Quận Cẩm Lệ</option>
                    <option value="Quận Thanh Khê">Quận Thanh Khê</option>
                  </select>
                </div>

                {/* Address */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Địa chỉ chi tiết</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: 123 Võ Nguyên Giáp, Phước Mỹ..." 
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container"
                    required
                  />
                </div>

                {/* Floors */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Số tầng</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newPropFloors}
                    onChange={(e) => setNewPropFloors(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Rooms per floor */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Số phòng mỗi tầng</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    value={newPropRoomsPerFloor}
                    onChange={(e) => setNewPropRoomsPerFloor(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container"
                  />
                </div>

                {/* Default Rent Price */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Giá thuê mặc định (VNĐ/tháng)</label>
                  <input 
                    type="number" 
                    step="50000"
                    value={newPropPrice}
                    onChange={(e) => setNewPropPrice(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container"
                  />
                </div>

              </div>

              {/* Notice */}
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex items-start gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">info</span>
                <p className="text-[10px] text-gray-600 leading-normal">
                  Hệ thống sẽ **tự động khởi tạo sơ đồ phòng dạng lưới** (ví dụ: phòng 101, 102... cho tầng 1; 201, 202... cho tầng 2) dựa trên số tầng và số phòng mỗi tầng bạn cấu hình ở trên.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Tạo sơ đồ tài sản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
