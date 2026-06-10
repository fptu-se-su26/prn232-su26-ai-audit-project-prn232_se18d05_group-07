import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

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

const PropertyList: React.FC<PropertyListProps> = ({ setCurrentPage, setSelectedPropertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Tất cả');

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/properties');
      setProperties(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối danh sách tài sản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            prop.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === 'Tất cả' || prop.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [properties, searchQuery, selectedTypeFilter]);

  const metrics = useMemo(() => {
    const total = properties.length;
    const active = properties.filter(p => p.status === 'Đang hoạt động').length;
    const totalRooms = properties.reduce((acc, p) => acc + p.totalRooms, 0);
    const occupied = properties.reduce((acc, p) => acc + p.occupiedRooms, 0);
    const rate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    return { total, active, totalRooms, occupied, rate };
  }, [properties]);

  const handleManageRooms = (id: number) => {
    setSelectedPropertyId(id);
    setCurrentPage('owner-property-detail');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải danh sách tài sản trọ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 text-center">
        <span className="material-symbols-outlined text-[48px] text-red-500">error_outline</span>
        <p className="text-sm font-bold text-red-655">{error}</p>
        <button 
          onClick={fetchProperties}
          className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Thử tải lại dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* Page Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
        <span className="hover:text-primary-container cursor-pointer transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-slate-800 font-bold">Tài sản & Phòng</span>
      </div>

      {/* Metrics Row (Giao diện Premium đồng bộ Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Tổng tài sản */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-orange-100/30 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400">Tổng tài sản</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.total}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">{metrics.active} đang hoạt động</p>
        </div>

        {/* Metric 2: Tổng số phòng */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-blue-100/30 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400">Tổng số phòng/căn</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.totalRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">{metrics.occupied} phòng đang thuê</p>
        </div>

        {/* Metric 3: Phòng trống */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-emerald-100/30 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400">Phòng trống</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">vpn_key</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.totalRooms - metrics.occupied}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Sẵn sàng chào đón khách</p>
        </div>

        {/* Metric 4: Tỷ lệ lấp đầy TB */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-indigo-100/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Tỷ lệ lấp đầy TB</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">percent</span>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.rate}%</h3>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden relative shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              style={{ width: `${metrics.rate}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Action Bar (Giao diện Kính mờ cao cấp) */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100/85 soft-shadow flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài sản, địa chỉ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-semibold text-slate-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 transition-all duration-300"
          />
        </div>

        {/* Type Filters Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto py-1 no-scrollbar">
          {['Tất cả', 'Phòng trọ', 'Studio', 'Căn hộ mini', 'Căn hộ'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                selectedTypeFilter === type
                  ? 'bg-gradient-to-r from-orange-500 to-primary-container text-white border-transparent shadow-sm shadow-orange-100/50'
                  : 'bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50/60 hover:text-primary-container hover:border-orange-100/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Add Property Trigger */}
        <button 
          onClick={() => setCurrentPage('owner-properties-create')}
          className="w-full lg:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-primary-container hover:brightness-110 text-white rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-orange-100/30 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">add</span> Thêm tài sản mới
        </button>
      </div>

      {/* Property Cards Grid or Empty State */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mb-5 animate-bounce">
            <span className="material-symbols-outlined text-[36px]">corporate_fare</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tài sản này chưa có phòng/căn nào</h3>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
            Hãy thêm tòa nhà trọ, studio hoặc căn hộ mini mới của bạn để bắt đầu thiết lập sơ đồ phòng trọ, chốt tiền phòng hàng tháng.
          </p>
          <button 
            onClick={() => setCurrentPage('owner-properties-create')}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-primary-container text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
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
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden soft-shadow hover:shadow-xl hover:shadow-orange-100/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
              >
                {/* Image section */}
                <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={property.image} 
                    alt={property.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  {/* Dark gradient overlay on bottom of image for readability */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/10">
                    {property.type}
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                    property.status === 'Đang hoạt động'
                      ? 'bg-emerald-500/90 text-white border-emerald-400/30 backdrop-blur-sm'
                      : 'bg-slate-500/90 text-white border-slate-400/30 backdrop-blur-sm'
                  }`}>
                    {property.status}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-primary-container transition-colors duration-205">
                        {property.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-1 leading-normal">
                        <span className="material-symbols-outlined text-[14px] text-gray-400 shrink-0">location_on</span>
                        <span className="truncate">{property.address}</span>
                      </p>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-gray-100/50">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-500 font-bold">Đã lấp đầy</span>
                        <span className="text-primary-container bg-orange-50 px-2 py-0.5 rounded-full font-bold">
                          {property.occupiedRooms}/{property.totalRooms} phòng ({occupancyRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            occupancyRate >= 75 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : occupancyRate >= 40 
                                ? 'bg-gradient-to-r from-orange-400 to-amber-300' 
                                : 'bg-gradient-to-r from-rose-500 to-red-400'
                          }`} 
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Fees Details Grid (Icons and styling) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] border-t border-gray-100 pt-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-yellow-500">bolt</span>
                          Giá điện:
                        </span>
                        <span className="font-extrabold text-slate-700">{formatPrice(property.electricityPrice)}/kWh</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-blue-500">water_drop</span>
                          Giá nước:
                        </span>
                        <span className="font-extrabold text-slate-700">{formatPrice(property.waterPrice)}/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-emerald-500">payments</span>
                          Giá thuê sàn:
                        </span>
                        <span className="font-extrabold text-slate-700">{formatPrice(property.basePrice)}/th</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-purple-500">domain</span>
                          Quy mô:
                        </span>
                        <span className="font-extrabold text-slate-700">{property.floors} tầng · {property.roomsPerFloor}p/t</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-3 gap-2 border-t border-gray-150/60 pt-4">
                    <button 
                      onClick={() => handleManageRooms(property.id)}
                      className="col-span-2 py-2.5 bg-gradient-to-r from-orange-500 to-primary-container hover:brightness-110 text-white rounded-xl text-[11px] font-extrabold text-center transition-all duration-300 flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">grid_view</span> Quản lý sơ đồ phòng
                    </button>
                    <button 
                      onClick={() => setCurrentPage('owner-listings-create')}
                      className="py-2.5 bg-orange-50/70 hover:bg-orange-100/60 text-primary-container rounded-xl text-[11px] font-extrabold text-center transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">campaign</span> Đăng tin
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default PropertyList;
