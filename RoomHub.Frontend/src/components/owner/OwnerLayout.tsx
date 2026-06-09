import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { PageType } from '../../App';

interface OwnerLayoutProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  children: React.ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.fullName || 'Chủ nhà RoomHub';
  const email = user?.email || 'owner@roomhub.vn';
  const initials = fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'CN';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setIsAvatarOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(target)) {
        setIsQuickAddOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title and subtitle mapping based on current page
  const getPageInfo = () => {
    switch (currentPage) {
      case 'owner-dashboard':
        return { title: 'Tổng quan', subtitle: 'Xem nhanh tình hình hoạt động cho thuê của bạn.' };
      case 'owner-properties':
        return { title: 'Tài sản & Phòng', subtitle: 'Quản lý danh sách toà nhà, căn hộ và sơ đồ phòng.' };
      case 'owner-property-detail':
        return { title: 'Chi tiết sơ đồ phòng', subtitle: 'Theo dõi, chốt điện nước và quản lý phòng chi tiết.' };
      case 'owner-properties-create':
        return { title: 'Thêm tài sản mới', subtitle: 'Tạo tòa nhà, dãy trọ, căn hộ và sinh sơ đồ phòng tự động.' };
      case 'owner-unit-detail':
        return { title: 'Chi tiết phòng/căn', subtitle: 'Quản lý khách thuê, công nợ, hợp đồng và hóa đơn dịch vụ.' };
      case 'owner-listings':
        return { title: 'Tin cho thuê', subtitle: 'Quản lý tin đăng, kiểm duyệt và trạng thái hiển thị.' };
      case 'owner-listings-create':
        return { title: 'Đăng tin cho thuê mới', subtitle: 'Tạo tin cho phòng trọ, studio, căn hộ mini hoặc căn hộ để người thuê có thể tìm thấy trên RoomHub.' };
      case 'owner-tenants':
        return { title: 'Người thuê', subtitle: 'Danh sách khách thuê trọ và thông tin liên hệ.' };
      case 'owner-invoices':
        return { title: 'Hóa đơn & Chốt tiền', subtitle: 'Quản lý hóa đơn hàng tháng, chốt chỉ số điện nước.' };
      case 'owner-invoices-create':
        return { title: 'Chốt tiền tháng', subtitle: 'Tạo hóa đơn hàng loạt cho các phòng/căn đang thuê, tự động tính tiền điện, nước và các khoản phí.' };
      case 'owner-invoice-detail':
        return { title: 'Chi tiết hóa đơn', subtitle: 'Theo dõi breakdown chi tiết chi phí dịch vụ, lịch sử đóng tiền và xuất file hóa đơn.' };
      case 'owner-cost-settings':
        return { title: 'Cài đặt chi phí', subtitle: 'Cấu hình đơn giá dịch vụ điện, nước, internet.' };
      case 'owner-notifications':
        return { title: 'Thông báo', subtitle: 'Các cập nhật và phản hồi mới nhất từ người thuê.' };
      case 'owner-profile':
        return { title: 'Hồ sơ cá nhân', subtitle: 'Cập nhật thông tin liên hệ chủ nhà.' };
      default:
        return { title: 'Quản lý Chủ nhà', subtitle: 'RoomHub Platform' };
    }
  };

  const pageInfo = getPageInfo();

  // Sidebar Menu configuration
  const menuItems = [
    { label: 'Tổng quan', icon: 'dashboard', route: 'owner-dashboard' as PageType },
    { label: 'Tài sản & Phòng', icon: 'corporate_fare', route: 'owner-properties' as PageType, activeMatches: ['owner-properties', 'owner-property-detail', 'owner-properties-create', 'owner-unit-detail', 'owner-units'] },
    { label: 'Tin cho thuê', icon: 'campaign', route: 'owner-listings' as PageType, activeMatches: ['owner-listings', 'owner-listings-create'] },
    { label: 'Người thuê', icon: 'people', route: 'owner-tenants' as PageType },
    { label: 'Hóa đơn & Chốt tiền', icon: 'receipt_long', route: 'owner-invoices' as PageType, activeMatches: ['owner-invoices', 'owner-invoices-create', 'owner-invoice-detail'] },
    { label: 'Cài đặt chi phí', icon: 'calculate', route: 'owner-cost-settings' as PageType },
    { label: 'Thông báo', icon: 'notifications', route: 'owner-notifications' as PageType, badge: 3 },
    { label: 'Hồ sơ', icon: 'person', route: 'owner-profile' as PageType },
  ];

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    setCurrentPage('home');
    navigate('/login');
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (item.activeMatches) {
      return item.activeMatches.some(match => currentPage.startsWith(match));
    }
    return currentPage === item.route;
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary-container">
          <span className="material-symbols-outlined text-[26px] font-bold">roofing</span>
        </div>
        <div>
          <span className="text-xl font-bold text-on-surface tracking-tight block">RoomHub</span>
          <span className="text-[11px] font-semibold text-primary-container px-2 py-0.5 rounded-full bg-orange-50 inline-block mt-0.5">Chủ nhà</span>
        </div>
      </div>



      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.label}
              onClick={() => {
                setCurrentPage(item.route);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                active
                  ? 'bg-orange-50 text-primary-container'
                  : 'text-gray-600 hover:bg-orange-50/30 hover:text-primary-container'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] transition-colors ${
                  active ? 'text-primary-container' : 'text-gray-400 group-hover:text-primary-container'
                }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>


      {/* Logout Link Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
      
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[260px] h-screen fixed left-0 top-0 border-r border-gray-200 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        ></div>
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-[260px] bg-white z-50 shadow-2xl transition-transform duration-300 transform ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* Layout Content wrapper */}
      <div className="flex-grow lg:pl-[260px] flex flex-col min-w-0">
        
        {/* Topbar Navigation */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-[260px] z-30 shadow-sm">
          
          {/* Topbar Left (Title/Mobile toggle) */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-on-surface focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg font-bold text-on-surface truncate">{pageInfo.title}</h1>
              <p className="text-xs text-gray-500 truncate">{pageInfo.subtitle}</p>
            </div>
            {/* Small Brand on Mobile */}
            <div className="sm:hidden flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[24px] font-bold">roofing</span>
              <span className="text-base font-bold text-on-surface">RoomHub</span>
            </div>
          </div>

          {/* Topbar Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Hộp tìm kiếm nhanh */}
            <div className="hidden md:block relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm toà nhà, phòng, người thuê..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-on-surface placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-container transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert(`Tìm kiếm nhanh "${(e.target as HTMLInputElement).value}"...`);
                  }
                }}
              />
            </div>

            {/* Dropdown "+ Tạo mới" */}
            <div className="relative" ref={quickAddRef}>
              <button 
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer outline-none"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">add</span> Tạo mới
              </button>
              
              {isQuickAddOpen && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-2xl border border-gray-100 soft-shadow p-2 z-50 flex flex-col gap-1 animate-scaleUp">
                  <button 
                    onClick={() => { setIsQuickAddOpen(false); setCurrentPage('owner-properties'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">corporate_fare</span> Thêm tài sản trọ
                  </button>
                  <button 
                    onClick={() => { setIsQuickAddOpen(false); setCurrentPage('owner-listings'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">campaign</span> Đăng tin cho thuê
                  </button>
                  <button 
                    onClick={() => { setIsQuickAddOpen(false); setCurrentPage('owner-tenants'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">people</span> Thêm khách thuê
                  </button>
                  <button 
                    onClick={() => { setIsQuickAddOpen(false); setCurrentPage('owner-invoices'); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span> Chốt tiền & Hoá đơn
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="w-10 h-10 rounded-xl hover:bg-orange-50 border border-gray-200/50 flex items-center justify-center text-gray-500 hover:text-primary-container transition-colors relative cursor-pointer outline-none"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-2xl border border-gray-100 soft-shadow p-3 z-50 flex flex-col gap-2 animate-scaleUp">
                  <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-50">
                    <span className="text-xs font-bold text-on-surface">Thông báo mới</span>
                    <button 
                      onClick={() => { setIsNotificationOpen(false); setCurrentPage('owner-notifications'); }}
                      className="text-[10px] font-bold text-primary-container hover:text-orange-600 cursor-pointer"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {/* Item 1 */}
                    <div className="p-2 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer text-left border-l-2 border-primary-container pl-3">
                      <p className="text-xs font-semibold text-on-surface">Nguyễn Văn An báo đã thanh toán</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Phòng 201 - Tòa Hải Châu · 15 phút trước</p>
                    </div>
                    {/* Item 2 */}
                    <div className="p-2 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer text-left border-l-2 border-red-500 pl-3">
                      <p className="text-xs font-semibold text-on-surface">02 hóa đơn đã quá hạn thanh toán</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Tòa RoomHub FPT · 2 giờ trước</p>
                    </div>
                    {/* Item 3 */}
                    <div className="p-2 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer text-left border-l-2 border-green-500 pl-3">
                      <p className="text-xs font-semibold text-on-surface">Tin "Studio view biển" đã được duyệt</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Hệ thống RoomHub · Hôm qua</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Separator */}
            <div className="h-6 w-[1px] bg-gray-200"></div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={avatarRef}>
              <button 
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="flex items-center gap-2 hover:bg-orange-50/50 p-1.5 rounded-xl transition-all cursor-pointer outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {initials}
                </div>
                <span className="material-symbols-outlined text-[18px] text-gray-400 hidden sm:inline">expand_more</span>
              </button>

              {isAvatarOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl border border-gray-100 soft-shadow p-3 z-50 flex flex-col gap-2 animate-scaleUp">
                  <div className="flex items-center gap-2 p-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{fullName}</p>
                      <p className="text-[9px] text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => { setIsAvatarOpen(false); setCurrentPage('owner-profile'); }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors cursor-pointer w-full"
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span> Hồ sơ của tôi
                    </button>
                    <button 
                      onClick={() => { setIsAvatarOpen(false); setCurrentPage('owner-cost-settings'); }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors cursor-pointer w-full"
                    >
                      <span className="material-symbols-outlined text-[16px]">settings</span> Cấu hình dịch vụ
                    </button>
                    <button 
                      onClick={() => { setIsAvatarOpen(false); setCurrentPage('home'); }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors cursor-pointer w-full"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span> Về trang chủ
                    </button>
                    <button 
                      onClick={() => { setIsAvatarOpen(false); handleLogout(); }}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg text-left transition-colors cursor-pointer w-full"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow bg-gray-50 p-6 md:p-8 min-h-screen pt-[96px] lg:pt-[96px] overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">logout</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Đăng xuất khỏi hệ thống?</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Chủ nhà?</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default OwnerLayout;
