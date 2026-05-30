import React, { useState } from 'react';
import type { PageType } from '../../App';

interface DashboardProps {
  setCurrentPage: (page: PageType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  // Demo Mode State: 'loaded' or 'empty' to showcase both states as requested!
  const [demoMode, setDemoMode] = useState<'loaded' | 'empty'>('loaded');

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (demoMode === 'empty') {
    return (
      <div className="space-y-6">
        {/* Toggle Mode Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">science</span>
            <span className="text-xs font-bold text-gray-700">Chế độ Demo: Bạn đang xem trạng thái Tài khoản mới chưa có dữ liệu.</span>
          </div>
          <button 
            onClick={() => setDemoMode('loaded')}
            className="px-4 py-2 bg-white text-xs font-bold text-primary-container border border-orange-200 rounded-xl hover:bg-orange-100/50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Chuyển sang "Chế độ có sẵn dữ liệu"
          </button>
        </div>

        {/* Empty State Onboarding */}
        <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-12 text-center max-w-2xl mx-auto mt-8 flex flex-col items-center">
          {/* Custom Illustrated Icon */}
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
              onClick={() => setCurrentPage('owner-properties')}
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

  return (
    <div className="space-y-6">
      
      {/* Toggle Mode Banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">science</span>
          <span className="text-xs font-bold text-gray-700">Chế độ Demo: Bạn đang xem trạng thái Tài khoản đã có dữ liệu mẫu.</span>
        </div>
        <button 
          onClick={() => setDemoMode('empty')}
          className="px-4 py-2 bg-white text-xs font-bold text-primary-container border border-orange-200 rounded-xl hover:bg-orange-100/50 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Chuyển sang "Chế độ tài khoản mới trống"
        </button>
      </div>

      {/* Grid Cards Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">SaaS</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Tổng số toà nhà / tài sản</p>
          <h3 className="text-2xl font-black text-on-surface">5</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Trải rộng trên 5 quận Đà Nẵng</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">60% Thuê</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Tổng số phòng / căn</p>
          <h3 className="text-2xl font-black text-on-surface">30</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">18 đang thuê · 12 phòng trống</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Cơ hội</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Số phòng đang trống</p>
          <h3 className="text-2xl font-black text-on-surface">12</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Sẵn sàng đăng tin và đón khách</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 soft-shadow hover-lift cursor-pointer" onClick={() => setCurrentPage('owner-invoices')}>
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span> +12%
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-1">Doanh thu tháng này</p>
          <h3 className="text-2xl font-black text-on-surface">{formatPrice(42500000)}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Tăng 4.2M so với tháng trước</p>
        </div>

      </div>

      {/* Bố cục chính Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Charts & Tasks) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Khối Biểu đồ Doanh thu (Simulated Bar Chart in SVG) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Thống kê doanh thu</h3>
                <p className="text-[11px] text-gray-400 font-medium">Tổng quan doanh thu 5 tháng đầu năm 2026</p>
              </div>
              <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none cursor-pointer">
                <option>Năm 2026</option>
                <option>Năm 2025</option>
              </select>
            </div>

            {/* Custom SVG Column Chart */}
            <div className="w-full h-64 flex items-end justify-between pt-4 px-4 relative">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
                <div className="border-t border-gray-100 w-full h-[1px]"></div>
              </div>

              {/* Bar 1 - Jan */}
              <div className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">30M</div>
                <div className="w-full bg-orange-100 group-hover:bg-primary-container rounded-t-lg h-36 transition-all duration-300"></div>
                <span className="text-xs text-gray-500 font-bold">Th1</span>
              </div>

              {/* Bar 2 - Feb */}
              <div className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">32M</div>
                <div className="w-full bg-orange-100 group-hover:bg-primary-container rounded-t-lg h-38 transition-all duration-300"></div>
                <span className="text-xs text-gray-500 font-bold">Th2</span>
              </div>

              {/* Bar 3 - Mar */}
              <div className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">38M</div>
                <div className="w-full bg-orange-100 group-hover:bg-primary-container rounded-t-lg h-44 transition-all duration-300"></div>
                <span className="text-xs text-gray-500 font-bold">Th3</span>
              </div>

              {/* Bar 4 - Apr */}
              <div className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">39.5M</div>
                <div className="w-full bg-orange-100 group-hover:bg-primary-container rounded-t-lg h-46 transition-all duration-300"></div>
                <span className="text-xs text-gray-500 font-bold">Th4</span>
              </div>

              {/* Bar 5 - May */}
              <div className="flex flex-col items-center gap-2 z-10 w-[12%] group cursor-pointer">
                <div className="text-[10px] font-bold text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">42.5M</div>
                <div className="w-full bg-primary-container rounded-t-lg h-52 transition-all duration-300"></div>
                <span className="text-xs text-gray-500 font-bold">Th5</span>
              </div>

            </div>
          </div>

          {/* Khối Việc Cần Xử Lý (Tasks to Handle) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">checklist</span> Việc cần xử lý
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Task 1 */}
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">warning</span>
                <div>
                  <h4 className="text-xs font-bold text-red-700">02 Hoá đơn đã quá hạn</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Phòng 302 (Tòa Hải Châu) và Phòng 101 (Tòa FPT) chưa đóng tiền phòng.</p>
                  <button 
                    onClick={() => setCurrentPage('owner-invoices')}
                    className="mt-2 text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    Xem hóa đơn quá hạn ➔
                  </button>
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-500 text-[20px] mt-0.5">calculate</span>
                <div>
                  <h4 className="text-xs font-bold text-orange-700">Chưa nhập chỉ số điện nước</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Có 5 phòng tại toà trọ Bách Khoa chưa được ghi nhận chỉ số cuối tháng.</p>
                  <button 
                    onClick={() => setCurrentPage('owner-invoices')}
                    className="mt-2 text-[10px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    Bắt đầu chốt số điện nước ➔
                  </button>
                </div>
              </div>

              {/* Task 3 */}
              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px] mt-0.5">verified_user</span>
                <div>
                  <h4 className="text-xs font-bold text-green-700">Khách trọ báo đã chuyển khoản</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Người thuê tại phòng 201 gửi minh chứng chuyển khoản tiền phòng tháng này.</p>
                  <button 
                    onClick={() => setCurrentPage('owner-invoices')}
                    className="mt-2 text-[10px] font-bold text-green-600 hover:text-green-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    Xem minh chứng duyệt bill ➔
                  </button>
                </div>
              </div>

              {/* Task 4 */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">campaign</span>
                <div>
                  <h4 className="text-xs font-bold text-blue-700">Có phòng trống chưa đăng tin</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Toà trọ FPT còn 2 phòng trống đã lâu chưa được đăng tin cho thuê.</p>
                  <button 
                    onClick={() => setCurrentPage('owner-listings')}
                    className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    Tạo bài đăng mới ➔
                  </button>
                </div>
              </div>

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
                onClick={() => setCurrentPage('owner-properties')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">add_business</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">+ Thêm toà nhà</span>
              </button>

              {/* Action 2 */}
              <button 
                onClick={() => setCurrentPage('owner-listings')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">rate_review</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">+ Đăng tin mới</span>
              </button>

              {/* Action 3 */}
              <button 
                onClick={() => setCurrentPage('owner-tenants')}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-gray-400 group-hover:text-primary-container transition-colors mb-2">person_add</span>
                <span className="text-[11px] font-bold text-gray-700 group-hover:text-primary-container transition-colors">+ Thêm khách</span>
              </button>

              {/* Action 4 */}
              <button 
                onClick={() => setCurrentPage('owner-invoices')}
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
              
              {/* Activity 1 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">campaign</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">Đã đăng tin mới</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">"Studio ban công FPT House" đã được gửi chờ kiểm duyệt.</p>
                  <span className="text-[9px] text-gray-400 block mt-1 font-semibold">10 phút trước</span>
                </div>
              </div>

              {/* Activity 2 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">Đã thêm người thuê</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">Thêm khách thuê Trần Thị Thu Thảo vào phòng 201 tòa Hải Châu.</p>
                  <span className="text-[9px] text-gray-400 block mt-1 font-semibold">2 giờ trước</span>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">Đã xuất hoá đơn thành công</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">Đã xuất 15 file hóa đơn trọ dạng Excel cho toà FPT.</p>
                  <span className="text-[9px] text-gray-400 block mt-1 font-semibold">Hôm qua</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
