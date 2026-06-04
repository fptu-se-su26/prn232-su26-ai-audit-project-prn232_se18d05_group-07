import React, { useState, useRef, useEffect } from 'react';
import type { PageType } from '../../App';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  children: React.ReactNode;
}

const menuItems: { label: string; icon: string; route: PageType }[] = [
  { label: 'Tổng quan', icon: 'monitoring', route: 'admin-dashboard' },
  { label: 'Người dùng', icon: 'group', route: 'admin-users' },
  { label: 'Tòa nhà', icon: 'apartment', route: 'admin-buildings' },
  { label: 'Phòng & Tin đăng', icon: 'meeting_room', route: 'admin-rooms' },
  { label: 'Kiểm duyệt', icon: 'gavel', route: 'admin-moderation' },
  { label: 'Gói dịch vụ', icon: 'workspace_premium', route: 'admin-subscriptions' },
];

const pageInfoMap: Record<string, { title: string; subtitle: string }> = {
  'admin-dashboard': { title: 'Bảng điều khiển', subtitle: 'Tổng quan toàn hệ thống RoomHub.' },
  'admin-users': { title: 'Quản lý người dùng', subtitle: 'Xem, xác minh và khóa tài khoản.' },
  'admin-buildings': { title: 'Quản lý tòa nhà', subtitle: 'Danh sách bất động sản trên nền tảng.' },
  'admin-rooms': { title: 'Phòng & Tin đăng', subtitle: 'Giám sát và duyệt tin cho thuê.' },
  'admin-moderation': { title: 'Kiểm duyệt nội dung', subtitle: 'Đánh giá, tin nhắn và báo cáo vi phạm.' },
  'admin-subscriptions': { title: 'Gói dịch vụ', subtitle: 'Duyệt thanh toán và quản lý gói đăng ký.' },
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  const { user, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const fullName = user?.fullName || 'Quản trị viên';
  const email = user?.email || 'admin@roomhub.vn';
  const initials = fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'AD';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setIsAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageInfo = pageInfoMap[currentPage] || { title: 'Quản trị', subtitle: 'RoomHub Admin' };

  const handleLogout = () => {
    if (window.confirm('Đăng xuất khỏi trang quản trị?')) {
      logout();
      setCurrentPage('home');
    }
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-[#161d2e] text-gray-300">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed-dim">
          <span className="material-symbols-outlined text-[26px] icon-fill">admin_panel_settings</span>
        </div>
        <div>
          <span className="text-xl font-bold text-white tracking-tight block">RoomHub</span>
          <span className="text-[11px] font-semibold text-primary-fixed-dim px-2 py-0.5 rounded-full bg-white/10 inline-block mt-0.5">Quản trị</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = currentPage === item.route;
          return (
            <button
              key={item.label}
              onClick={() => { setCurrentPage(item.route); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                active ? 'bg-primary-container text-white shadow-lg shadow-orange-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? 'icon-fill' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-left">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden font-sans">
      <aside className="hidden lg:block w-[260px] h-screen fixed left-0 top-0 z-30">
        {renderSidebar()}
      </aside>

      {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40"></div>}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-[260px] z-50 shadow-2xl transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderSidebar()}
      </aside>

      <div className="flex-grow lg:pl-[260px] flex flex-col min-w-0">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-[260px] z-30 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 cursor-pointer">
              <span className="material-symbols-outlined text-[26px]">menu</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-on-surface truncate">{pageInfo.title}</h1>
              <p className="text-xs text-gray-500 truncate">{pageInfo.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-green-600">Hệ thống ổn định</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-200"></div>
            <div className="relative" ref={avatarRef}>
              <button onClick={() => setIsAvatarOpen(!isAvatarOpen)} className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-xl transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#161d2e] text-white flex items-center justify-center font-bold text-xs">{initials}</div>
                <span className="material-symbols-outlined text-[18px] text-gray-400 hidden sm:inline">expand_more</span>
              </button>
              {isAvatarOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-2xl border border-gray-100 soft-shadow p-3 z-50 flex flex-col gap-2 animate-scaleUp">
                  <div className="flex items-center gap-2 p-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#161d2e] text-white flex items-center justify-center font-bold text-xs">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{fullName}</p>
                      <p className="text-[9px] text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsAvatarOpen(false); setCurrentPage('home'); }} className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg text-left transition-colors cursor-pointer w-full">
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

        <main className="flex-grow bg-gray-100 p-6 md:p-8 min-h-screen pt-[96px] lg:pt-[96px] overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
