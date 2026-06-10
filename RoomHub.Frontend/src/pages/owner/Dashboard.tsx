import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface DashboardProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedListingId?: (id: number | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage, setSelectedListingId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/owner/dashboard');
      setData(res.data);
    } catch (err: any) {
      console.error('Lỗi khi lấy dữ liệu tổng quan:', err);
      setError('Không thể tải thông tin tổng quan dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getTaskStyle = (actionType: string) => {
    switch (actionType) {
      case 'invoices':
        return {
          bg: 'bg-red-50/50 border-red-100/60 hover:border-red-200/80 hover:bg-red-50/80',
          icon: 'warning',
          iconColor: 'text-red-500',
          titleColor: 'text-red-750 font-bold',
          btnColor: 'text-red-655 hover:text-red-800',
          arrowText: 'Đi đến Hóa đơn ➔',
          page: 'owner-invoices' as PageType
        };
      case 'listings':
        return {
          bg: 'bg-blue-50/50 border-blue-100/60 hover:border-blue-200/80 hover:bg-blue-50/80',
          icon: 'campaign',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-750 font-bold',
          btnColor: 'text-blue-655 hover:text-blue-800',
          arrowText: 'Đi đến Tin đăng ➔',
          page: 'owner-listings' as PageType
        };
      case 'properties':
        return {
          bg: 'bg-orange-50/50 border-orange-100/60 hover:border-orange-200/80 hover:bg-orange-50/80',
          icon: 'corporate_fare',
          iconColor: 'text-orange-500',
          titleColor: 'text-orange-750 font-bold',
          btnColor: 'text-orange-655 hover:text-orange-800',
          arrowText: 'Đi đến Tài sản ➔',
          page: 'owner-properties' as PageType
        };
      default:
        return {
          bg: 'bg-green-50/50 border-green-100/60 hover:border-green-200/80 hover:bg-green-50/80',
          icon: 'check_circle',
          iconColor: 'text-green-500',
          titleColor: 'text-green-750 font-bold',
          btnColor: 'text-green-655 hover:text-green-800',
          arrowText: 'Xem tổng quan ➔',
          page: 'owner-dashboard' as PageType
        };
    }
  };

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'campaign':
        return {
          bg: 'bg-orange-50',
          color: 'text-primary-container',
          icon: 'campaign'
        };
      case 'person_add':
        return {
          bg: 'bg-blue-50',
          color: 'text-blue-600',
          icon: 'person_add'
        };
      case 'receipt_long':
        return {
          bg: 'bg-emerald-50',
          color: 'text-emerald-600',
          icon: 'receipt_long'
        };
      default:
        return {
          bg: 'bg-gray-50',
          color: 'text-gray-500',
          icon: 'info'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 text-center">
        <span className="material-symbols-outlined text-[48px] text-red-500">error_outline</span>
        <p className="text-sm font-bold text-red-655">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Thử tải lại dữ liệu
        </button>
      </div>
    );
  }

  if (!data || data.totalProperties === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-12 text-center max-w-2xl mx-auto mt-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mb-6 relative animate-bounce">
            <span className="material-symbols-outlined text-[48px]">corporate_fare</span>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center border-2 border-white text-sm font-bold">+</span>
          </div>

          <h2 className="text-2xl font-bold text-on-surface mb-3">Chào mừng bạn đến với RoomHub!</h2>
          <h3 className="text-base font-semibold text-gray-700 mb-2">Bạn chưa có tài sản cho thuê nào trong hệ thống</h3>

          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
            Hãy tạo toà nhà, dãy trọ hoặc căn hộ độc lập đầu tiên của bạn để bắt đầu đăng tin tìm kiếm khách thuê, thiết lập sơ đồ phòng trọ, chốt chỉ số điện nước và xuất hoá đơn hàng tháng tiện lợi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => setCurrentPage('owner-properties-create')}
              className="px-8 py-3.5 bg-primary-container text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">add</span> Thêm tài sản đầu tiên
            </button>
            <button
              onClick={() => alert('Đang tải video hướng dẫn làm quen với hệ thống...')}
              className="px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-gray-400">play_circle</span> Xem video hướng dẫn
            </button>
          </div>
        </div>
      </div>
    );
  }

  const occupiedPercent = data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0;
  
  // Calculate unpaid this month from the last element of chart data (current month)
  const currentMonthData = data.revenueChartData && data.revenueChartData.length > 0 
    ? data.revenueChartData[data.revenueChartData.length - 1] 
    : null;
  const unpaidThisMonth = currentMonthData ? currentMonthData.unpaid : 0;

  // Find max value in chart data to scale columns
  const maxVal = data.revenueChartData && data.revenueChartData.length > 0
    ? Math.max(...data.revenueChartData.map((d: any) => Math.max(d.revenue, d.unpaid)), 1)
    : 1;

  // SVG Radial properties
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupiedPercent / 100) * circumference;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Grid Cards Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

        {/* Card 1: Tổng số tài sản */}
        <div 
          onClick={() => setCurrentPage('owner-properties')}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-orange-100/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">Tài sản</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-1">Toà nhà / dãy trọ</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data.totalProperties}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Đã thiết lập sơ đồ</p>
        </div>

        {/* Card 2: Tổng số phòng */}
        <div 
          onClick={() => setCurrentPage('owner-properties')}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-blue-100/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{occupiedPercent}% Thuê</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-1">Phòng / Căn hộ</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data.totalRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">{data.occupiedRooms} đang thuê · {data.vacantRooms} trống</p>
        </div>

        {/* Card 3: Số phòng trống */}
        <div 
          onClick={() => setCurrentPage('owner-properties')}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-teal-100/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Sẵn sàng</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-1">Số phòng trống</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{data.vacantRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Sẵn sàng đón khách mới</p>
        </div>

        {/* Card 4: Doanh thu đã thu */}
        <div 
          onClick={() => setCurrentPage('owner-invoices')}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-emerald-100/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-[10px] font-bold text-teal-605 bg-teal-50 px-2 py-0.5 rounded-full">Đã thu</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-1">Đã thu tháng này</p>
          <h3 className="text-2xl font-black text-emerald-650 tracking-tight">{formatPrice(data.revenueThisMonth)}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Doanh thu hóa đơn đã thanh toán</p>
        </div>

        {/* Card 5: Doanh thu chưa thu (Nợ) */}
        <div 
          onClick={() => setCurrentPage('owner-invoices')}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 soft-shadow hover:shadow-lg hover:shadow-rose-100/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Chưa thu</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mb-1">Chưa thu tháng này</p>
          <h3 className="text-2xl font-black text-rose-600 tracking-tight">{formatPrice(unpaidThisMonth)}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Hóa đơn chờ/quá hạn thanh toán</p>
        </div>

      </div>

      {/* Biểu đồ doanh thu & Radial Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100/85 soft-shadow flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">bar_chart</span>
                  Thống kê doanh thu
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold">So sánh Doanh thu đã thu & Khoản nợ chưa thu 6 tháng gần nhất</p>
              </div>

              {/* Legends & Filters */}
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500 to-emerald-400 block shadow-sm shadow-emerald-200"></span>
                    <span className="text-[11px] font-bold text-gray-500">Đã thu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-500 to-rose-400 block shadow-sm shadow-rose-200"></span>
                    <span className="text-[11px] font-bold text-gray-500">Chưa thu</span>
                  </div>
                </div>
                <select className="px-3 py-1.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer transition-all">
                  <option>Năm 2026</option>
                </select>
              </div>
            </div>

            {/* Mock Data Banner alert */}
            {data.isMockData && (
              <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/40 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 backdrop-blur-sm animate-pulse">
                <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5">info</span>
                <div className="leading-relaxed">
                  <span className="font-bold">Đang hiển thị dữ liệu mô phỏng:</span> Hệ thống hiển thị số liệu mẫu do tài sản của bạn chưa phát sinh bất kỳ hóa đơn nào. Khi bạn tạo hoặc thanh toán hóa đơn thực tế, biểu đồ sẽ tự động cập nhật ngay lập tức.
                </div>
              </div>
            )}
          </div>

          {/* Double Column Chart Rendering */}
          <div className="relative h-64 w-full mt-4">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 bottom-8 top-4 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-gray-100/70 w-full h-[1px]"></div>
              <div className="border-t border-gray-100/70 w-full h-[1px]"></div>
              <div className="border-t border-gray-100/70 w-full h-[1px]"></div>
              <div className="border-t border-gray-100/70 w-full h-[1px]"></div>
            </div>

            {/* Columns content container */}
            <div className="absolute inset-x-0 bottom-8 top-4 flex justify-around items-end px-2">
              {data.revenueChartData?.map((item: any, idx: number) => {
                const revenuePct = (item.revenue / maxVal) * 80;
                const unpaidPct = (item.unpaid / maxVal) * 80;

                return (
                  <div key={idx} className="flex flex-col items-center w-[12%] group relative h-full justify-end">
                    
                    {/* Interactive Tooltip Card on Hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-900/95 text-white text-[10px] p-2.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-20 w-36 -translate-y-1 backdrop-blur-sm border border-slate-800/80">
                      <p className="font-extrabold text-center text-gray-300 border-b border-slate-800 pb-1 mb-1.5 text-[10px] tracking-wide">{item.month}</p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 text-gray-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Đã thu:</span>
                        <span className="font-extrabold text-emerald-400">{formatPrice(item.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-gray-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Chưa thu:</span>
                        <span className="font-extrabold text-rose-400">{formatPrice(item.unpaid)}</span>
                      </div>
                    </div>

                    {/* Pair of Columns */}
                    <div className="flex items-end justify-center gap-1.5 w-full h-full pb-1">
                      {/* Column 1: Revenue (Đã thu) */}
                      <div className="relative w-1/2 h-full flex flex-col justify-end">
                        <div
                          style={{ height: `${Math.max(revenuePct, 3)}%` }}
                          className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md hover:brightness-110 transition-all duration-300 shadow-[0_-2px_10px_rgba(16,185,129,0.15)] cursor-pointer"
                        ></div>
                      </div>

                      {/* Column 2: Unpaid (Chưa thu) */}
                      <div className="relative w-1/2 h-full flex flex-col justify-end">
                        <div
                          style={{ height: `${Math.max(unpaidPct, 3)}%` }}
                          className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md hover:brightness-110 transition-all duration-300 shadow-[0_-2px_10px_rgba(244,63,94,0.15)] cursor-pointer"
                        ></div>
                      </div>
                    </div>

                    {/* Axis Label */}
                    <span className="absolute top-full mt-2.5 text-[10px] text-gray-500 font-bold whitespace-nowrap tracking-tight">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Radial Occupancy Gauge) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100/85 soft-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">donut_large</span>
              Tỷ lệ lấp đầy
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold">Tình trạng khai thác và lấp đầy phòng</p>
          </div>
          
          <div className="flex flex-col items-center justify-center my-6 relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Track circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Fill circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="url(#radial-blue-gradient)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Definitions for gradient stroke */}
                <defs>
                  <linearGradient id="radial-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{occupiedPercent}%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Lấp đầy</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-t border-gray-50 pt-4">
            <div className="flex flex-col items-center border-r border-gray-50">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-blue-600 block shadow-sm shadow-blue-200"></span>
                <span className="text-[11px] font-bold text-gray-500">Đang thuê</span>
              </div>
              <span className="text-sm font-black text-slate-800">{data.occupiedRooms} phòng</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-200"></span>
                <span className="text-[11px] font-bold text-gray-500">Trống</span>
              </div>
              <span className="text-sm font-black text-slate-800">{data.vacantRooms} phòng</span>
            </div>
          </div>
        </div>

      </div>

      {/* Khối Việc Cần Xử Lý & Thao tác nhanh / Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Việc cần xử lý */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100/85 soft-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">checklist</span> 
              Việc cần xử lý
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold mb-5">Danh sách các đầu việc và nhắc nhở từ hệ thống cần phản hồi</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.tasks && data.tasks.length > 0 ? (
                data.tasks.map((task: any, index: number) => {
                  const style = getTaskStyle(task.actionType);
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${style.bg}`}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-gray-100/30">
                        <span className={`material-symbols-outlined text-[20px] ${style.iconColor}`}>{style.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-extrabold ${style.titleColor}`}>{task.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-semibold">{task.description}</p>
                        <button
                          onClick={() => setCurrentPage(style.page)}
                          className={`mt-2.5 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-transform hover:translate-x-1 ${style.btnColor}`}
                        >
                          {style.arrowText}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-gray-300 mb-2">done_all</span>
                  <p className="text-xs font-bold">Tuyệt vời! Bạn không có việc nào cần xử lý ngay.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Thao tác nhanh & Hoạt động gần đây */}
        <div className="space-y-6">

          {/* Quick Actions (Glassmorphism design) */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100/85 soft-shadow">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
              Thao tác nhanh
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold mb-4">Các lối tắt tiện ích xử lý nhanh các tác vụ phổ biến</p>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Action 1 */}
              <button
                onClick={() => setCurrentPage('owner-properties-create')}
                className="p-4 bg-gradient-to-br from-orange-50/70 to-amber-50/20 hover:from-orange-100/50 hover:to-amber-50/30 border border-orange-100/50 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-orange-100/20 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-orange-100/40">
                  <span className="material-symbols-outlined text-[18px] font-bold">add_business</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-primary-container transition-colors">+ Thêm toà nhà</span>
                <span className="text-[9px] text-gray-400 mt-1 font-semibold hidden sm:inline-block">Tạo toà nhà, dãy trọ</span>
              </button>

              {/* Action 2 */}
              <button
                onClick={() => {
                  setSelectedListingId?.(null);
                  setCurrentPage('owner-listings-create');
                }}
                className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/20 hover:from-blue-100/50 hover:to-indigo-50/30 border border-blue-100/50 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-blue-100/20 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-blue-100/40">
                  <span className="material-symbols-outlined text-[18px] font-bold">rate_review</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-blue-700 transition-colors">+ Đăng tin mới</span>
                <span className="text-[9px] text-gray-400 mt-1 font-semibold hidden sm:inline-block">Tìm khách thuê nhanh</span>
              </button>

              {/* Action 3 */}
              <button
                onClick={() => setCurrentPage('owner-properties')}
                className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/20 hover:from-emerald-100/50 hover:to-teal-50/30 border border-emerald-100/50 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-emerald-100/20 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-emerald-100/40">
                  <span className="material-symbols-outlined text-[18px] font-bold">room_preferences</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-emerald-700 transition-colors">Sơ đồ phòng</span>
                <span className="text-[9px] text-gray-400 mt-1 font-semibold hidden sm:inline-block">Quản lý trực quan</span>
              </button>

              {/* Action 4 */}
              <button
                onClick={() => setCurrentPage('owner-invoices-create')}
                className="p-4 bg-gradient-to-br from-rose-50/70 to-red-50/20 hover:from-rose-100/50 hover:to-red-50/30 border border-rose-100/50 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-rose-100/20 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-rose-100/40">
                  <span className="material-symbols-outlined text-[18px] font-bold">offline_pin</span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-rose-700 transition-colors">Chốt hóa đơn</span>
                <span className="text-[9px] text-gray-400 mt-1 font-semibold hidden sm:inline-block">Tính điện nước tháng</span>
              </button>
            </div>
          </div>

          {/* Vertical Recent Activities Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100/85 soft-shadow">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">history</span>
              Hoạt động gần đây
            </h3>
            <p className="text-[11px] text-gray-405 font-semibold mb-5">Lịch sử sự kiện, tương tác và biến động tài sản</p>

            <div className="space-y-1">
              {data.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map((act: any, index: number) => {
                  const style = getActivityStyle(act.type);
                  return (
                    <div key={index} className="flex gap-4 relative group">
                      
                      {/* Timeline connecting line */}
                      {index < data.recentActivities.length - 1 && (
                        <div className="absolute left-[17px] top-8 bottom-0 w-[1.5px] bg-gray-100 group-hover:bg-primary-container/20 transition-colors"></div>
                      )}
                      
                      {/* Icon circle */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm ${style.bg} ${style.color} transition-all group-hover:scale-110 group-hover:shadow-md`}>
                        <span className="material-symbols-outlined text-[15px]">{style.icon}</span>
                      </div>
                      
                      {/* Content details */}
                      <div className="pb-5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-750 leading-relaxed group-hover:text-primary-container transition-colors duration-200">
                          {act.text}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {act.time}
                        </span>
                      </div>

                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 text-center py-6 font-semibold">Chưa có hoạt động gần đây nào.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
