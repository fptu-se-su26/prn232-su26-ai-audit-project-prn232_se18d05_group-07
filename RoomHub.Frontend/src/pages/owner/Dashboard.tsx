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

  const formatPriceShort = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getTaskStyle = (actionType: string) => {
    switch (actionType) {
      case 'invoices':
        return {
          bg: 'bg-red-50/50 border-red-100/60',
          icon: 'warning',
          iconColor: 'text-red-500',
          titleColor: 'text-red-700',
          btnColor: 'text-red-600 hover:text-red-800',
          arrowText: 'Đi đến Hóa đơn ➔',
          page: 'owner-invoices' as PageType
        };
      case 'listings':
        return {
          bg: 'bg-blue-50/50 border-blue-100/60',
          icon: 'campaign',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-700',
          btnColor: 'text-blue-600 hover:text-blue-800',
          arrowText: 'Đi đến Tin đăng ➔',
          page: 'owner-listings' as PageType
        };
      case 'properties':
        return {
          bg: 'bg-orange-50/50 border-orange-100/60',
          icon: 'corporate_fare',
          iconColor: 'text-orange-500',
          titleColor: 'text-orange-700',
          btnColor: 'text-orange-600 hover:text-orange-800',
          arrowText: 'Đi đến Tài sản ➔',
          page: 'owner-properties' as PageType
        };
      default:
        return {
          bg: 'bg-green-50/50 border-green-100/60',
          icon: 'check_circle',
          iconColor: 'text-green-500',
          titleColor: 'text-green-700',
          btnColor: 'text-green-600 hover:text-green-800',
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Grid Cards Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Tổng số tài sản */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Tài sản</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Tổng số toà nhà / tài sản</p>
          <h3 className="text-2xl font-black text-on-surface">{data.totalProperties}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Đã cấu hình trong sơ đồ</p>
        </div>

        {/* Card 2: Tổng số phòng */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{occupiedPercent}% Thuê</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Tổng số phòng / căn</p>
          <h3 className="text-2xl font-black text-on-surface">{data.totalRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">{data.occupiedRooms} đang thuê · {data.vacantRooms} phòng trống</p>
        </div>

        {/* Card 3: Số phòng trống */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Sắp trống</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Số phòng đang trống</p>
          <h3 className="text-2xl font-black text-on-surface">{data.vacantRooms}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Sẵn sàng đăng tin tìm khách</p>
        </div>

        {/* Card 4: Doanh thu */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-invoices')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              Doanh thu
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Doanh thu tháng này</p>
          <h3 className="text-2xl font-black text-on-surface">{formatPrice(data.revenueThisMonth)}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Tổng hóa đơn đã thu nhận</p>
        </div>

      </div>

      {/* Bố cục chính Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns (Charts & Tasks) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Khối Biểu đồ Doanh thu (Dynamic Bar Chart in SVG) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Thống kê doanh thu</h3>
                <p className="text-[11px] text-gray-400 font-medium">Tổng quan doanh thu 5 tháng gần đây</p>
              </div>
              <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none cursor-pointer">
                <option>Năm 2026</option>
              </select>
            </div>

            {/* Custom SVG Column Chart */}
            <div className="w-full h-64 flex items-end justify-around pt-4 px-4 relative">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
              </div>

              {data.revenueChartData?.map((item: any, idx: number) => {
                const maxRevenue = Math.max(...data.revenueChartData.map((d: any) => d.revenue), 1);
                const pct = (item.revenue / maxRevenue) * 65 + 15;
                const isLatest = idx === data.revenueChartData.length - 1;
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                    <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatPriceShort(item.revenue)}
                    </div>
                    <div 
                      style={{ height: `${pct}%` }}
                      className={`w-full ${isLatest ? 'bg-primary-container' : 'bg-orange-100'} group-hover:bg-primary-container rounded-t-lg transition-all duration-300`}
                    ></div>
                    <span className="text-xs text-gray-500 font-bold">{item.month}</span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Khối Việc Cần Xử Lý (Tasks to Handle) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">checklist</span> Việc cần xử lý
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.tasks?.map((task: any, index: number) => {
                const style = getTaskStyle(task.actionType);
                return (
                  <div key={index} className={`p-4 rounded-2xl border flex items-start gap-3 ${style.bg}`}>
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${style.iconColor}`}>{style.icon}</span>
                    <div>
                      <h4 className={`text-xs font-bold ${style.titleColor}`}>{task.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{task.description}</p>
                      <button
                        onClick={() => setCurrentPage(style.page)}
                        className={`mt-2 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${style.btnColor}`}
                      >
                        {style.arrowText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (Quick Actions & Recent Activity) */}
        <div className="space-y-6">

          {/* Grid Quick Actions */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <h3 className="text-sm font-bold text-on-surface mb-4">Thao tác nhanh</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Action 1 */}
              <button
                onClick={() => setCurrentPage('owner-properties-create')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">add_business</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">+ Thêm toà nhà</span>
              </button>

              {/* Action 2 */}
              <button
                onClick={() => {
                  setSelectedListingId?.(null);
                  setCurrentPage('owner-listings-create');
                }}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">rate_review</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">+ Đăng tin mới</span>
              </button>

              {/* Action 3 */}
              <button
                onClick={() => setCurrentPage('owner-properties')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">person_add</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">Quản lý sơ đồ</span>
              </button>

              {/* Action 4 */}
              <button
                onClick={() => setCurrentPage('owner-invoices-create')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">offline_pin</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">Chốt tiền tháng</span>
              </button>
            </div>
          </div>

          {/* Khối Hoạt động Gần đây */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <h3 className="text-sm font-bold text-on-surface mb-4">Hoạt động gần đây</h3>

            <div className="space-y-4">
              {data.recentActivities?.map((act: any, index: number) => {
                const style = getActivityStyle(act.type);
                return (
                  <div key={index} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}>
                      <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface">{act.text}</p>
                      <span className="text-[9px] text-gray-400 block mt-1 font-semibold">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
