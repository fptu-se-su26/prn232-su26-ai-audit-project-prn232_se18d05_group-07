import React, { useState, useRef, useEffect } from 'react';
import type { PageType } from '../../App';
import { useAuth } from '../../hooks/useAuth';

interface TenantLayoutProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  children: React.ReactNode;
}

const menuItems: { label: string; icon: string; route: PageType; activeMatches?: string[]; badge?: number }[] = [
  { label: 'Tổng quan', icon: 'space_dashboard', route: 'tenant-dashboard' },
  { label: 'Phòng của tôi', icon: 'meeting_room', route: 'tenant-room' },
  { label: 'Hóa đơn', icon: 'receipt_long', route: 'tenant-invoices', activeMatches: ['tenant-invoices', 'tenant-invoice-detail'] },
  { label: 'Phòng yêu thích', icon: 'favorite', route: 'tenant-favorites' },
  { label: 'Yêu cầu bảo trì', icon: 'build', route: 'tenant-maintenance' },
  { label: 'Tin nhắn', icon: 'chat', route: 'tenant-messages', badge: 2 },
  { label: 'Hồ sơ', icon: 'person', route: 'tenant-profile' },
];

const TenantLayout: React.FC<TenantLayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  const { user, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const fullName = user?.fullName || 'Khách thuê RoomHub';
  const email = user?.email || 'tenant@roomhub.vn';
  const initials = fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'KT';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageInfoMap: Record<string, { title: string; subtitle: string }> = {
    'tenant-dashboard': { title: 'Tổng quan', subtitle: 'Tình hình thuê trọ của bạn trong nháy mắt.' },
    'tenant-room': { title: 'Phòng của tôi', subtitle: 'Thông tin phòng, hợp đồng và chủ trọ hiện tại.' },
    'tenant-invoices': { title: 'Hóa đơn của tôi', subtitle: 'Theo dõi và thanh toán hóa đơn hàng tháng.' },
    'tenant-invoice-detail': { title: 'Chi tiết hóa đơn', subtitle: 'Breakdown chi phí và xác nhận thanh toán.' },
    'tenant-favorites': { title: 'Phòng yêu thích', subtitle: 'Những tin đăng bạn đã lưu để xem lại.' },
    'tenant-maintenance': { title: 'Yêu cầu bảo trì', subtitle: 'Gửi và theo dõi các yêu cầu sửa chữa.' },
    'tenant-messages': { title: 'Tin nhắn', subtitle: 'Trao đổi trực tiếp với chủ trọ.' },
    'tenant-profile': { title: 'Hồ sơ cá nhân', subtitle: 'Thông tin tài khoản và xác minh danh tính.' },
  };
  const pageInfo = pageInfoMap[currentPage] || { title: 'Khách thuê', subtitle: 'RoomHub Platform' };

  const isActive = (item: typeof menuItems[number]) =>
    item.activeMatches ? item.activeMatches.some((m) => currentPage.startsWith(m)) : currentPage === item.route;

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      setCurrentPage('home');
    }
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary-container">
          <span className="material-symbols-outlined text-[26px] icon-fill">roofing</span>
        </div>
        <div>
          <span className="text-xl font-bold text-on-surface tracking-tight block">RoomHub</span>
          <span className="text-[11px] font-semibold text-primary-container px-2 py-0.5 rounded-full bg-orange-50 inline-block mt-0.5">Khách thuê</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50">
          <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{fullName}</p>
            <p className="text-[11px] text-gray-500 font-medium truncate">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.label}
              onClick={() => { setCurrentPage(item.route); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                active ? 'bg-orange-50 text-primary-container' : 'text-gray-600 hover:bg-orange-50/30 hover:text-primary-container'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[20px] transition-colors ${active ? 'text-primary-container icon-fill' : 'text-gray-400 group-hover:text-primary-container'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-tr from-orange-100/80 to-blue-50/50 p-4 rounded-2xl border border-orange-100/30 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-orange-200/20 rounded-full"></div>
          <h4 className="text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[16px]">tips_and_updates</span> Mẹo nhỏ
          </h4>
          <p className="text-[10px] text-gray-600 leading-relaxed mb-3">Xác minh danh tính để chủ trọ tin tưởng và duyệt hợp đồng nhanh hơn.</p>
          <button
            onClick={() => setCurrentPage('tenant-profile')}
            className="w-full py-2 bg-white hover:bg-orange-50 text-[10px] font-bold text-primary-container rounded-lg border border-orange-100 transition-all cursor-pointer text-center active:scale-95 shadow-sm"
          >
            Xác minh ngay
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans">
      <aside className="hidden lg:block w-[260px] h-screen fixed left-0 top-0 border-r border-gray-200 z-30">
        {renderSidebar()}
      </aside>

      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
      )}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-[260px] bg-white z-50 shadow-2xl transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderSidebar()}
      </aside>

      <div className="flex-grow lg:pl-[260px] flex flex-col min-w-0">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-[260px] z-30 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-on-surface truncate">{pageInfo.title}</h1>
              <p className="text-xs text-gray-500 truncate">{pageInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('tenant-messages')}
              className="w-10 h-10 rounded-xl hover:bg-orange-50 border border-gray-200/50 flex items-center justify-center text-gray-500 hover:text-primary-container transition-colors relative cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-[1px] bg-gray-200"></div>
            <div className="relative" ref={avatarRef}>
              <button onClick={() => setIsAvatarOpen(!isAvatarOpen)} className="flex items-center gap-2 hover:bg-orange-50/50 p-1.5 rounded-xl transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shadow-sm">{initials}</div>
                <span className="material-symbols-outlined text-[18px] text-gray-400 hidden sm:inline">expand_more</span>
              </button>
              {isAvatarOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl border border-gray-100 soft-shadow p-3 z-50 flex flex-col gap-2 animate-scaleUp">
                  <div className="flex items-center gap-2 p-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{fullName}</p>
                      <p className="text-[9px] text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsAvatarOpen(false); setCurrentPage('tenant-profile'); }} className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors cursor-pointer w-full">
                    <span className="material-symbols-outlined text-[16px]">person</span> Hồ sơ của tôi
                  </button>
                  <button onClick={() => { setIsAvatarOpen(false); setCurrentPage('home'); }} className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-primary-container rounded-lg text-left transition-colors cursor-pointer w-full">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Về trang chủ
                  </button>
                  <button onClick={() => { setIsAvatarOpen(false); handleLogout(); }} className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg text-left transition-colors cursor-pointer w-full">
                    <span className="material-symbols-outlined text-[16px]">logout</span> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow bg-gray-50 p-6 md:p-8 min-h-screen pt-[96px] lg:pt-[96px] overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default TenantLayout;
