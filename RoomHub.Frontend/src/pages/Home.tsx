import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroApartment from '../assets/hero_apartment.png';
import tenantBenefits from '../assets/tenant_benefits.png';
import landlordDashboard from '../assets/landlord_dashboard.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const setSelectedRoomId = (_id: number | null) => {};
  const handleAlert = (message: string) => {
    alert(message);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-surface to-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
              <span className="material-symbols-outlined text-primary-container text-[18px]">location_on</span>
              <span className="text-label-md font-label-md text-primary-container">RoomHub Đà Nẵng</span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface mb-6 leading-tight md:text-[64px] text-[40px]">
              Tìm phòng, căn hộ và nhà cho thuê phù hợp tại Đà Nẵng
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 max-w-xl">
              RoomHub giúp bạn khám phá nhiều loại hình chỗ ở từ phòng trọ sinh viên đến căn hộ dịch vụ cao cấp. Dễ dàng tìm kiếm, so sánh và liên hệ trực tiếp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                className="text-label-md font-label-md text-white bg-primary-container rounded-full px-8 py-4 text-center hover:bg-orange-600 transition-all soft-shadow hover:-translate-y-1 cursor-pointer" 
                onClick={(e) => { e.preventDefault(); navigate('/browse'); }}
              >
                Tìm chỗ ở ngay
              </a>
              <a 
                className="text-label-md font-label-md text-primary-container border-2 border-primary-container rounded-full px-8 py-4 text-center hover:bg-orange-50 transition-all" 
                href="#"
                onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng ký tài khoản chủ trọ để đăng tin!'); }}
              >
                Đăng tin cho thuê
              </a>
            </div>
          </div>

          {/* Right Mockup */}
          <div className="relative z-10 md:h-[600px] h-[500px] flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-blue-50 rounded-[3rem] opacity-50 transform rotate-3 scale-105"></div>
            {/* Main Mockup Image */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl soft-shadow overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500 z-20 border border-gray-100">
              {/* Top Bar Mockup */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 bg-white rounded-md h-6 border border-gray-200 mx-4"></div>
              </div>
              {/* Content Area */}
              <div className="p-4 bg-gray-50">
                {/* Quick Stats Widget */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-green-500 text-[18px]">visibility</span>
                      <span className="text-xs text-gray-500 font-medium">Tin đang hiển thị</span>
                    </div>
                    <p className="text-lg font-bold text-on-surface">12</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary-container text-[18px]">receipt_long</span>
                      <span className="text-xs text-gray-500 font-medium">Hóa đơn tháng này</span>
                    </div>
                    <p className="text-lg font-bold text-on-surface">8/12</p>
                  </div>
                </div>
                {/* Sample Property Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      alt="Căn hộ mẫu" 
                      className="w-full h-full object-cover" 
                      src={heroApartment}
                    />
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-primary-container text-[10px] font-bold px-2 py-1 rounded">Căn hộ Mini</span>
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">Còn trống</span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-on-surface mb-1 truncate">Căn hộ ban công lộng gió Hải Châu</h3>
                    <p className="text-primary-container font-bold text-base mb-2">4.500.000đ<span className="text-[10px] text-gray-500 font-normal">/tháng</span></p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> Hải Châu</span>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">aspect_ratio</span> 35m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl soft-shadow border border-gray-100 z-30 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Đã xác minh</p>
                  <p className="text-xs text-gray-500">Chính chủ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Floating Card */}
      <section className="max-w-[1100px] mx-auto px-margin-mobile relative z-30 -mt-16 mb-24">
        <div className="bg-white rounded-2xl soft-shadow border border-gray-100 p-6">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant block">Khu vực</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                <select className="w-full pl-10 pr-8 py-3 bg-gray-50 border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl text-sm appearance-none focus:outline-none">
                  <option>Tất cả quận/huyện Đà Nẵng</option>
                  <option>Hải Châu</option>
                  <option>Thanh Khê</option>
                  <option>Sơn Trà</option>
                  <option>Ngũ Hành Sơn</option>
                  <option>Liên Chiểu</option>
                  <option>Cẩm Lệ</option>
                  <option>Hòa Vang</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant block">Loại phòng</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">category</span>
                <select className="w-full pl-10 pr-8 py-3 bg-gray-50 border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl text-sm appearance-none focus:outline-none">
                  <option>Tất cả loại phòng</option>
                  <option>Phòng trọ</option>
                  <option>Studio</option>
                  <option>Căn hộ mini</option>
                  <option>Căn hộ</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant block">Mức giá</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">payments</span>
                <select className="w-full pl-10 pr-8 py-3 bg-gray-50 border-transparent focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl text-sm appearance-none focus:outline-none">
                  <option>Bất kỳ mức giá</option>
                  <option>Dưới 2 triệu</option>
                  <option>2 - 3 triệu</option>
                  <option>3 - 5 triệu</option>
                  <option>5 - 8 triệu</option>
                  <option>Trên 8 triệu</option>
                </select>
              </div>
            </div>
            <button 
              className="w-full bg-primary-container text-white rounded-xl py-3 text-label-md font-label-md hover:bg-orange-600 transition-colors h-[46px] flex items-center justify-center gap-2 active:scale-98" 
              onClick={() => navigate('/browse')} 
              type="button"
            >
              <span className="material-symbols-outlined">search</span> Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">Đa dạng loại hình cho thuê</h2>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl mx-auto">Chọn không gian sống phù hợp với nhu cầu và ngân sách của bạn tại Đà Nẵng.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Category 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">single_bed</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Phòng trọ</h3>
              <p className="text-xs text-gray-500">Giá tốt, cơ bản</p>
            </div>
            {/* Category 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">weekend</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Studio</h3>
              <p className="text-xs text-gray-500">Không gian mở, hiện đại</p>
            </div>
            {/* Category 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">home_work</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Căn hộ mini</h3>
              <p className="text-xs text-gray-500">Tiện nghi & tự do</p>
            </div>
            {/* Category 4 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">apartment</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Căn hộ</h3>
              <p className="text-xs text-gray-500">Sang trọng & an ninh</p>
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">group</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Phòng ở ghép</h3>
              <p className="text-xs text-gray-500">Chia sẻ chi phí</p>
            </div>
            {/* Category 5 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">weekend</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Studio</h3>
              <p className="text-xs text-gray-500">Thiết kế mở</p>
            </div>
            {/* Category 6 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">apartment</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Căn hộ Mini</h3>
              <p className="text-xs text-gray-500">Đầy đủ tiện nghi</p>
            </div>
            {/* Category 7 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">location_city</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Căn hộ chung cư</h3>
              <p className="text-xs text-gray-500">Cao cấp, an ninh</p>
            </div>
            {/* Category 8 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover-lift cursor-pointer group" onClick={() => navigate('/browse')}>
              <div className="w-14 h-14 mx-auto bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[28px] text-primary-container group-hover:text-white transition-colors">house</span>
              </div>
              <h3 className="text-label-md font-label-md text-on-surface mb-1">Nhà nguyên căn</h3>
              <p className="text-xs text-gray-500">Phù hợp gia đình</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Phòng/Căn hộ nổi bật tại Đà Nẵng</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Những không gian sống được đánh giá cao tại trung tâm Đà Nẵng</p>
            </div>
            <a 
              className="hidden md:flex items-center gap-1 text-primary-container font-semibold hover:text-orange-600 transition-colors cursor-pointer" 
              onClick={(e) => { e.preventDefault(); navigate('/browse'); }}
            >
              Xem tất cả <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Listing 1 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group cursor-pointer" onClick={() => { setSelectedRoomId(1); navigate('/room/1'); }}>
              <div className="h-56 relative overflow-hidden">
                <img 
                  alt="Studio" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-primary-container text-xs font-bold px-2.5 py-1 rounded-md">Studio</span>
                </div>
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">Còn trống</span>
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleAlert('Vui lòng đăng nhập để lưu yêu thích!'); }}>
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary-container transition-colors">Studio ban công view biển Mỹ Khê - Đầy đủ nội thất</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>Quận Ngũ Hành Sơn, Đà Nẵng</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">aspect_ratio</span> 35m²
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">group</span> Tối đa 2
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">bed</span> 1 PN
                  </div>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-primary-container font-bold text-xl">5.500.000đ<span className="text-sm text-gray-500 font-normal">/tháng</span></p>
                  </div>
                  <button className="text-primary-container hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>

            {/* Listing 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group cursor-pointer" onClick={() => { setSelectedRoomId(2); navigate('/room/2'); }}>
              <div className="h-56 relative overflow-hidden">
                <img 
                  alt="Căn hộ" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-primary-container text-xs font-bold px-2.5 py-1 rounded-md">Căn hộ Mini</span>
                </div>
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">Còn trống</span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary-container transition-colors">Căn hộ 1PN trung tâm Hải Châu, an ninh 24/7</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>Quận Hải Châu, Đà Nẵng</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">aspect_ratio</span> 45m²
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">group</span> Tối đa 3
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">bed</span> 1 PN
                  </div>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-primary-container font-bold text-xl">6.200.000đ<span className="text-sm text-gray-500 font-normal">/tháng</span></p>
                  </div>
                  <button className="text-primary-container hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>

            {/* Listing 3 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group cursor-pointer" onClick={() => { setSelectedRoomId(3); navigate('/room/3'); }}>
              <div className="h-56 relative overflow-hidden">
                <img 
                  alt="Phòng trọ" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-primary-container text-xs font-bold px-2.5 py-1 rounded-md">Phòng trọ</span>
                </div>
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">Còn trống</span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary-container transition-colors">Phòng trọ sạch sẽ gần ĐH Bách Khoa, có gác lửng</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>Quận Liên Chiểu, Đà Nẵng</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">aspect_ratio</span> 20m²
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">group</span> Tối đa 2
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">bed</span> 0 PN
                  </div>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div>
                    <p className="text-primary-container font-bold text-xl">2.000.000đ<span className="text-sm text-gray-500 font-normal">/tháng</span></p>
                  </div>
                  <button className="text-primary-container hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (Renters) */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">Quy trình đơn giản cho người thuê</h2>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl mx-auto">Chỉ với 3 bước, bạn đã có thể tìm được không gian sống lý tưởng tại Đà Nẵng.</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-0.5 bg-orange-100 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary-container text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 soft-shadow border-4 border-white">
                  1
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Tìm kiếm &amp; So sánh</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Sử dụng bộ lọc thông minh để tìm phòng theo khu vực, giá cả và tiện ích mong muốn tại các quận Hải Châu, Ngũ Hành Sơn...</p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary-container text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 soft-shadow border-4 border-white">
                  2
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Liên hệ trực tiếp</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Nhắn tin hoặc gọi điện trực tiếp cho chủ trọ qua nền tảng trực tuyến, không qua bất kỳ trung gian nào.</p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary-container text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 soft-shadow border-4 border-white">
                  3
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Chuyển vào ở</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Thống nhất các điều khoản, ký hợp đồng điện tử tiện lợi và bắt đầu tận hưởng cuộc sống mới.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Renters */}
      <section className="py-16 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <img 
              alt="Người tìm phòng" 
              className="rounded-3xl soft-shadow object-cover h-[500px] w-full" 
              src={tenantBenefits}
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl soft-shadow hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">100% Xác thực</p>
                  <p className="text-sm text-gray-500">Chính chủ đăng tin tại Đà Nẵng</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Trải nghiệm tìm thuê dễ dàng hơn bao giờ hết</h2>
            <p className="text-body-lg text-on-surface-variant mb-10">Chúng tôi thiết kế các tính năng hướng đến người thuê, giúp quá trình tìm kiếm nhanh chóng, minh bạch và an toàn.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Tìm kiếm linh hoạt</h4>
                  <p className="text-sm text-gray-600">Bộ lọc chi tiết từ diện tích, giá cả đến tiện ích riêng biệt.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Thông tin minh bạch</h4>
                  <p className="text-sm text-gray-600">Hình ảnh thực tế, giá thuê và các khoản phí được công khai rõ ràng.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Lưu tin yêu thích</h4>
                  <p className="text-sm text-gray-600">Dễ dàng lưu lại và so sánh các căn hộ bạn đang cân nhắc.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Nhận hóa đơn điện tử</h4>
                  <p className="text-sm text-gray-600">Theo dõi chi phí hàng tháng trực tiếp trên ứng dụng web.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Landlords */}
      <section className="py-20 bg-[#FFF7ED]">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-200 mb-6 shadow-sm">
              <span className="material-symbols-outlined text-primary-container text-[18px]">real_estate_agent</span>
              <span className="text-label-md font-label-md text-primary-container">Dành cho Chủ nhà</span>
            </div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Giải pháp quản lý phòng trọ toàn diện tại Đà Nẵng</h2>
            <p className="text-body-lg text-gray-600 mb-10">Chuyển đổi số công việc quản lý nhà trọ của bạn. Tối ưu thời gian, giảm thiểu sai sót và quản lý lưới phòng trực quan.</p>
            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface block">Quản lý nhiều tòa nhà</strong>
                  <span className="text-sm text-gray-600">Dễ dàng quản lý danh sách nhiều cơ sở trọ quận Ngũ Hành Sơn, Liên Chiểu... trên cùng một giao diện.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface block">Sơ đồ phòng trực quan (Lưới tòa nhà)</strong>
                  <span className="text-sm text-gray-600">Theo dõi trạng thái phòng (trống, đã thuê, cọc) nhanh chóng qua sơ đồ lưới mô phỏng tầng và phòng.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface block">Chốt điện nước &amp; Hóa đơn</strong>
                  <span className="text-sm text-gray-600">Tính toán tiền tự động, tạo và gửi hóa đơn điện tử cho khách thuê chỉ với vài click.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <strong className="text-on-surface block">Xuất báo cáo Excel</strong>
                  <span className="text-sm text-gray-600">Kết xuất hóa đơn tháng, báo cáo doanh thu và thông tin khách ra file Excel tiện lợi ngay lập tức.</span>
                </div>
              </li>
            </ul>
            <a 
              className="inline-flex items-center gap-2 text-white bg-on-surface rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors font-semibold" 
              href="#"
              onClick={(e) => { e.preventDefault(); handleAlert('Hệ thống Đăng ký tài khoản Chủ nhà sẽ mở ở giai đoạn tiếp theo!'); }}
            >
              Bắt đầu quản lý miễn phí
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>

          {/* Landlord Dashboard Mockup */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Fake Browser Chrome */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="mx-auto bg-white text-xs text-gray-400 py-1 px-20 rounded-md border border-gray-200 select-none text-center">roomhub.vn/landlord</div>
            </div>
            {/* Dashboard Content Image */}
            <div className="relative overflow-hidden aspect-[16/10] w-full">
              <img 
                alt="Giao diện quản lý nhà trọ RoomHub" 
                className="w-full h-full object-cover" 
                src={landlordDashboard}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-primary-container mb-2 flex justify-center">
                <span className="material-symbols-outlined text-[40px]">apartment</span>
              </div>
              <h4 className="text-3xl font-bold text-on-surface mb-1">5,000+</h4>
              <p className="text-sm text-gray-500 font-medium">Phòng/Căn hộ tại Đà Nẵng</p>
            </div>
            <div className="text-center">
              <div className="text-primary-container mb-2 flex justify-center">
                <span className="material-symbols-outlined text-[40px]">group</span>
              </div>
              <h4 className="text-3xl font-bold text-on-surface mb-1">10,000+</h4>
              <p className="text-sm text-gray-500 font-medium">Người tìm thuê</p>
            </div>
            <div className="text-center">
              <div className="text-primary-container mb-2 flex justify-center">
                <span className="material-symbols-outlined text-[40px]">real_estate_agent</span>
              </div>
              <h4 className="text-3xl font-bold text-on-surface mb-1">1,200+</h4>
              <p className="text-sm text-gray-500 font-medium">Chủ trọ Đà Nẵng tin dùng</p>
            </div>
            <div className="text-center">
              <div className="text-primary-container mb-2 flex justify-center">
                <span className="material-symbols-outlined text-[40px]">verified</span>
              </div>
              <h4 className="text-3xl font-bold text-on-surface mb-1">100%</h4>
              <p className="text-sm text-gray-500 font-medium">Tin đăng xác thực chính chủ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-margin-mobile">
          <div className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl p-10 md:p-16 text-center text-white soft-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.05] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-[0.05] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10 leading-tight">Sẵn sàng trải nghiệm<br />RoomHub ngay hôm nay?</h2>
            <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">Dù bạn đang tìm kiếm một không gian sống lý tưởng hay muốn quản lý nhà trọ hiệu quả hơn tại Đà Nẵng, chúng tôi đều có giải pháp tối ưu cho bạn.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button 
                className="bg-white text-primary-container px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors" 
                onClick={() => handleAlert('Hệ thống Đăng nhập dành cho Khách thuê sẽ sớm hoàn thiện!')}
              >
                Tìm phòng ngay
              </button>
              <button 
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors" 
                onClick={() => handleAlert('Hệ thống Đăng ký dành cho Chủ trọ Đà Nẵng sẽ sớm hoàn thiện!')}
              >
                Trở thành Chủ nhà
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
