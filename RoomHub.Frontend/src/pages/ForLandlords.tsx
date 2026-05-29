import React, { useState, useEffect } from 'react';
import landlordDashboard from '../assets/landlord_dashboard.png';

interface ForLandlordsProps {
  setCurrentPage: (page: 'home' | 'browse' | 'detail' | 'landlords') => void;
}

const ForLandlords: React.FC<ForLandlordsProps> = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAlert = (message: string) => {
    alert(message);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-primary-container font-label-md text-label-md px-4 py-2 rounded-full border border-orange-100">
              <span className="material-symbols-outlined text-primary-container text-sm">verified</span>
              Dành cho chủ nhà và chủ trọ tại Đà Nẵng
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-on-surface leading-tight tracking-tight">
              Đăng tin cho thuê và quản lý nhà trọ dễ dàng hơn với <span className="text-primary-container">RoomHub</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
              Giải pháp toàn diện giúp bạn tiếp cận hàng ngàn người thuê tiềm năng tại Đà Nẵng, quản lý tình trạng phòng trực quan và tự động tính toán hóa đơn điện nước xuất file Excel chỉ trong vài cú click.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => handleAlert('Tính năng đăng tin cho thuê dành cho Chủ nhà sẽ ra mắt ở giai đoạn tiếp theo!')}
                className="bg-primary-container text-white font-label-md text-label-md px-8 py-4 rounded-full hover:bg-orange-600 transition-all hover-lift flex items-center gap-2 font-bold shadow-sm"
              >
                Bắt đầu đăng tin
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('how-it-works-timeline');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent border border-gray-200 text-on-surface font-label-md text-label-md px-8 py-4 rounded-full hover:bg-gray-50 transition-colors font-bold"
              >
                Xem cách hoạt động
              </button>
            </div>
          </div>
          {/* Right Content Dashboard Mockup */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:rotate-1 transition-transform duration-500 bg-white p-2">
            <img 
              alt="Dashboard Mockup" 
              className="w-full h-auto object-cover rounded-2xl" 
              src={landlordDashboard}
            />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-orange-50/30 border-y border-orange-100/50 py-16 md:py-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-4">Bạn đang gặp khó khăn trong quản lý?</h2>
            <p className="text-sm md:text-base text-gray-500">Những vấn đề thường gặp khi quản lý nhà trọ, căn hộ theo phương pháp thủ công.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pain Point 1 */}
            <div className="bg-white p-6 rounded-2xl soft-shadow border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Theo dõi tình trạng phòng</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Không rõ phòng nào trống, phòng nào sắp hết hạn hợp đồng, mất mát doanh thu do trống phòng kéo dài.</p>
            </div>
            
            {/* Pain Point 2 */}
            <div className="bg-white p-6 rounded-2xl soft-shadow border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">group</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Thông tin người thuê</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Dữ liệu phân tán trên sổ sách giấy tờ, khó tìm kiếm thông tin CCCD, hợp đồng khi có sự cố cần kiểm tra.</p>
            </div>
            
            {/* Pain Point 3 */}
            <div className="bg-white p-6 rounded-2xl soft-shadow border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">calculate</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Tính toán hóa đơn</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Mất nhiều thời gian ghi chép số điện nước vào cuối tháng và cộng trừ tính toán thủ công rất dễ xảy ra sai sót.</p>
            </div>
            
            {/* Pain Point 4 */}
            <div className="bg-white p-6 rounded-2xl soft-shadow border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">Theo dõi công nợ</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Khó kiểm soát ai đã thanh toán tiền trọ, ai còn nợ cước, nợ bao nhiêu tiền điện/nước sinh hoạt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-4">Giải pháp toàn diện từ RoomHub</h2>
          <p className="text-sm md:text-base text-gray-500">Mọi công cụ cần thiết để tối ưu năng suất quản lý tòa nhà và tiếp cận khách thuê.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Feature 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Đăng tin cho thuê</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Tiếp cận hàng ngàn người tìm kiếm phòng trọ tại Đà Nẵng một cách nhanh chóng với tin đăng sinh động, đầy đủ hình ảnh thực tế.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">apartment</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Quản lý tòa nhà &amp; phòng</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Theo dõi trực quan sơ đồ các phòng của tòa nhà. Quản lý đồng thời nhiều tòa nhà tại các quận Hải Châu, Ngũ Hành Sơn...</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Quản lý khách thuê</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Lưu trữ tập trung thông tin liên hệ của khách hàng, ảnh chụp CCCD/CMND và quản lý ngày bắt đầu/kết thúc hợp đồng thuê.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">settings</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Cài đặt chi phí linh động</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Cấu hình đơn giá thuê phòng, giá điện, nước tiêu thụ, phí rác thải và internet riêng biệt linh hoạt cho từng phòng trọ.</p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Chốt sổ hàng tháng</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Nhập số điện, số nước tiêu thụ mới, hệ thống tự động tính toán tổng hóa đơn cuối tháng một cách nhanh gọn, chính xác.</p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-[24px]">table_chart</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">Xuất báo cáo Excel</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Xuất hóa đơn điện nước chi tiết từng phòng trọ hoặc bảng báo cáo thống kê doanh thu ra tệp Excel chỉ với một cú nhấp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Grids & Tables Demonstrations */}
      <section className="bg-white py-16 md:py-24 border-y border-gray-100">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-24">
          
          {/* Sơ đồ phòng trực quan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Sơ đồ phòng trực quan sinh động</h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Nắm bắt ngay lập tức trạng thái hoạt động của toàn bộ phòng trọ thông qua hệ thống màu sắc trực quan đại diện cho từng tình huống thực tế.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700 pt-2">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-4 h-4 rounded-full bg-[#22c55e] shrink-0"></div> 
                  <span>Còn phòng trống ({' '}Trống)</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-4 h-4 rounded-full bg-primary-container shrink-0"></div> 
                  <span>Khách đang thuê ({' '}Đang thuê)</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-4 h-4 rounded-full bg-red-500 shrink-0"></div> 
                  <span>Quá hạn thanh toán cước</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-4 h-4 rounded-full bg-gray-400 shrink-0"></div> 
                  <span>Đang sửa chữa / Bảo trì</span>
                </div>
              </div>
            </div>
            
            {/* Visual Floor Diagram Mockup */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 soft-shadow">
              <div className="font-bold text-sm text-on-surface mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 w-fit">
                <span className="material-symbols-outlined text-primary-container">apartment</span>
                Tòa nhà: FPT House Đà Nẵng
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {/* Tầng 1 */}
                <div className="aspect-square bg-white border-t-4 border-primary-container rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">101</div>
                <div className="aspect-square bg-white border-t-4 border-[#22c55e] rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">102</div>
                <div className="aspect-square bg-white border-t-4 border-primary-container rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">103</div>
                <div className="aspect-square bg-white border-t-4 border-red-500 rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100 animate-pulse">104</div>
                <div className="aspect-square bg-white border-t-4 border-gray-400 rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100 opacity-60">105</div>
                {/* Tầng 2 */}
                <div className="aspect-square bg-white border-t-4 border-[#22c55e] rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">201</div>
                <div className="aspect-square bg-white border-t-4 border-[#22c55e] rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">202</div>
                <div className="aspect-square bg-white border-t-4 border-primary-container rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">203</div>
                <div className="aspect-square bg-white border-t-4 border-primary-container rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">204</div>
                <div className="aspect-square bg-white border-t-4 border-primary-container rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-sm border border-gray-100">205</div>
              </div>
            </div>
          </div>

          {/* Quản lý khách thuê tập trung */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:order-2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Quản lý khách thuê tập trung</h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Lưu trữ hồ sơ cá nhân của khách trọ một cách an toàn và khoa học. Giúp bạn dễ dàng tra cứu điều khoản hợp đồng thuê và liên hệ trao đổi khi cần thiết.
              </p>
            </div>
            
            <div className="lg:order-1 bg-white rounded-3xl soft-shadow border border-gray-100 overflow-hidden w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold">Khách thuê</th>
                    <th className="p-4 font-bold">Phòng</th>
                    <th className="p-4 font-bold">Trạng thái cước</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold">Nguyễn Văn An</td>
                    <td className="p-4 font-bold text-primary-container">P.201</td>
                    <td className="p-4"><span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold">Đã thanh toán</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold">Trần Thị Thu Thảo</td>
                    <td className="p-4 font-bold text-primary-container">P.103</td>
                    <td className="p-4"><span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold">Đã thanh toán</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold">Lê Văn Cường</td>
                    <td className="p-4 font-bold text-primary-container">P.104</td>
                    <td className="p-4"><span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-[10px] font-bold">Nợ tiền trọ</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Hóa đơn & Xuất Excel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Tính hóa đơn tự động &amp; Xuất Excel</h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Hệ thống tự động cộng dồn tiền phòng tĩnh và tiền điện/nước biến đổi theo chỉ số tiêu thụ của khách. Bạn có thể in hóa đơn hoặc tải file báo cáo Excel gửi trực tiếp qua Zalo/Facebook.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl soft-shadow border border-gray-100 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">Chi tiết Hóa đơn - P.201</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Khách thuê: Nguyễn Văn An</p>
                </div>
                <span className="text-xs text-primary-container bg-orange-50 font-bold px-3 py-1 rounded-full">Tháng 05/2026</span>
              </div>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between"><span>Tiền phòng cố định:</span> <span className="font-bold text-gray-800">3,000,000 đ</span></div>
                <div className="flex justify-between"><span>Tiền điện tiêu thụ (50 kWh):</span> <span className="font-bold text-gray-800">175,000 đ</span></div>
                <div className="flex justify-between"><span>Tiền nước sinh hoạt (5 m³):</span> <span className="font-bold text-gray-800">100,000 đ</span></div>
                <div className="flex justify-between pt-4 border-t border-gray-100 font-extrabold text-base text-primary-container">
                  <span>TỔNG THANH TOÁN:</span> 
                  <span>3,275,000 đ</span>
                </div>
              </div>
              <button 
                onClick={() => handleAlert('Tính năng kết xuất và download tệp hóa đơn Excel sẽ ra mắt ở giai đoạn tiếp theo!')}
                className="w-full bg-[#107c41] hover:bg-[#0c5c30] text-white text-xs font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all hover-lift active:scale-98 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span> Xuất file Excel
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Timeline Workflow */}
      <section id="how-it-works-timeline" className="py-16 md:py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-4">Quy trình vận hành đơn giản</h2>
        <p className="text-sm md:text-base text-gray-500 mb-16 max-w-xl mx-auto">Chỉ với 5 bước đơn giản để chuyên nghiệp hóa công việc kinh doanh cho thuê của bạn.</p>
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4 relative max-w-4xl mx-auto">
          {/* Horizontal Line on Desktop */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-orange-100 z-0"></div>
          
          {/* Step 1 */}
          <div className="flex flex-col items-center max-w-[160px] relative z-10 space-y-3">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-sm shrink-0">1</div>
            <h4 className="font-extrabold text-sm text-on-surface">Tạo tài khoản</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Đăng ký làm tài khoản Chủ trọ trên hệ thống RoomHub.</p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center max-w-[160px] relative z-10 space-y-3">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-sm shrink-0">2</div>
            <h4 className="font-extrabold text-sm text-on-surface">Thêm tòa nhà</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Khai báo thông tin, số tầng, số lượng phòng của nhà trọ.</p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center max-w-[160px] relative z-10 space-y-3">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-sm shrink-0">3</div>
            <h4 className="font-extrabold text-sm text-on-surface">Đăng tin trọ</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Kích hoạt tin đăng giới thiệu phòng để tiếp cận khách thuê.</p>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col items-center max-w-[160px] relative z-10 space-y-3">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-sm shrink-0">4</div>
            <h4 className="font-extrabold text-sm text-on-surface">Nhận khách thuê</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Thêm khách hàng vào phòng tương ứng trên sơ đồ quản lý.</p>
          </div>
          
          {/* Step 5 */}
          <div className="flex flex-col items-center max-w-[160px] relative z-10 space-y-3">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-sm shrink-0">5</div>
            <h4 className="font-extrabold text-sm text-on-surface">Chốt hóa đơn</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Nhập số điện nước hàng tháng và xuất báo cáo gửi khách.</p>
          </div>
        </div>
      </section>

      {/* Full Dashboard Preview Section */}
      <section className="bg-orange-50/30 border-y border-orange-100/50 py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white p-2">
            <img 
              alt="Full Dashboard View" 
              className="w-full rounded-2xl object-cover" 
              src={landlordDashboard}
            />
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 md:py-24 max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Câu hỏi thường gặp</h2>
          <p className="text-sm text-gray-500 mt-2">Giải đáp nhanh các thắc mắc của bạn về giải pháp quản lý của RoomHub.</p>
        </div>
        
        <div className="space-y-4">
          {/* Q1 */}
          <div 
            onClick={() => toggleFaq(1)}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer p-5 soft-shadow transition-all duration-300"
          >
            <div className="flex justify-between items-center font-bold text-sm md:text-base text-on-surface select-none">
              <span>Sử dụng RoomHub có mất phí không?</span>
              <span className={`material-symbols-outlined transition-transform duration-300 shrink-0 ${openFaq === 1 ? 'rotate-180 text-primary-container font-black' : 'text-gray-400'}`}>
                expand_more
              </span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openFaq === 1 ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-gray-500 text-xs leading-relaxed font-normal pt-3 border-t border-gray-50">
                Chúng tôi có gói miễn phí cơ bản hỗ trợ các chủ nhà trọ nhỏ quản lý 1 tòa nhà. Để sử dụng đầy đủ các tính năng nâng cao như xuất Excel hóa đơn hàng loạt và quản lý chuỗi nhiều tòa nhà, bạn có thể đăng ký nâng cấp lên gói trả phí siêu hợp lý chỉ từ 99k/tháng.
              </p>
            </div>
          </div>

          {/* Q2 */}
          <div 
            onClick={() => toggleFaq(2)}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer p-5 soft-shadow transition-all duration-300"
          >
            <div className="flex justify-between items-center font-bold text-sm md:text-base text-on-surface select-none">
              <span>Tôi có thể quản lý nhiều khu trọ cùng lúc không?</span>
              <span className={`material-symbols-outlined transition-transform duration-300 shrink-0 ${openFaq === 2 ? 'rotate-180 text-primary-container font-black' : 'text-gray-400'}`}>
                expand_more
              </span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openFaq === 2 ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-gray-500 text-xs leading-relaxed font-normal pt-3 border-t border-gray-50">
                Hoàn toàn được! Hệ thống cho phép bạn khởi tạo và quản lý nhiều khu nhà/tòa nhà riêng biệt tại các quận Ngũ Hành Sơn, Cẩm Lệ hay Sơn Trà trên cùng một tài khoản RoomHub tập trung duy nhất.
              </p>
            </div>
          </div>

          {/* Q3 */}
          <div 
            onClick={() => toggleFaq(3)}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer p-5 soft-shadow transition-all duration-300"
          >
            <div className="flex justify-between items-center font-bold text-sm md:text-base text-on-surface select-none">
              <span>Dữ liệu của tôi có được bảo mật an toàn không?</span>
              <span className={`material-symbols-outlined transition-transform duration-300 shrink-0 ${openFaq === 3 ? 'rotate-180 text-primary-container font-black' : 'text-gray-400'}`}>
                expand_more
              </span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openFaq === 3 ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-gray-500 text-xs leading-relaxed font-normal pt-3 border-t border-gray-50">
                RoomHub đặt an toàn thông tin lên hàng đầu. Tất cả thông tin khách thuê, thông tin hợp đồng và dữ liệu tài chính của bạn đều được mã hóa bằng công nghệ tiên tiến SSL/TLS và được lưu trữ trên hệ thống máy chủ đám mây an toàn, bảo vệ 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-[2.5rem] p-8 md:p-16 text-center text-white soft-shadow relative overflow-hidden border border-orange-400/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 relative z-10">
            Sẵn sàng quản lý cho thuê dễ dàng hơn?
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Gia nhập cộng đồng hàng ngàn chủ nhà tại Đà Nẵng đang sử dụng RoomHub để tối ưu hóa công việc quản lý, giảm thiểu thời gian ghi điện nước và tăng tỷ lệ lấp đầy phòng trọ.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button 
              onClick={() => handleAlert('Tính năng Đăng ký tài khoản Chủ nhà sẽ ra mắt ở giai đoạn tiếp theo!')}
              className="bg-white text-orange-600 font-label-md text-label-md px-8 py-4 rounded-full hover:bg-orange-50 transition-all hover-lift flex justify-center items-center gap-2 font-bold shadow-sm"
            >
              Đăng ký làm chủ nhà
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('how-it-works-timeline');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-transparent border-2 border-white text-white font-label-md text-label-md px-8 py-4 rounded-full hover:bg-white/10 transition-colors flex justify-center items-center font-bold"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default ForLandlords;
