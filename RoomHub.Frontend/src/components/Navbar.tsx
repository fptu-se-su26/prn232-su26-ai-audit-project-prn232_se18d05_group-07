import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.replace('/', '') || 'home';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navTo = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const roleLabel =
    user?.role === 'Administrator' ? 'Quản trị' : user?.role === 'PropertyOwner' ? 'Chủ nhà' : 'Khách thuê';

  const goDashboard = () => {
    if (user?.role === 'Administrator') window.location.hash = '#/admin/dashboard';
    else if (user?.role === 'PropertyOwner') window.location.hash = '#/owner/dashboard';
    else window.location.hash = '#/tenant/dashboard';
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-surface dark:bg-on-background docked full-width top-0 sticky z-50 transition-all duration-300 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop h-20 w-full max-w-container-max mx-auto md:px-margin-desktop px-margin-mobile">
        {/* Brand Logo */}
        <a
          className="flex items-center gap-2 group cursor-pointer"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
        >
          <span className="material-symbols-outlined text-[32px] text-primary-container icon-fill">roofing</span>
          <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed tracking-tight">RoomHub</span>
        </a>

        {/* Navigation Links (Web) */}
        <div className="hidden md:flex items-center gap-8">
          <a
            className={`text-label-md font-label-md transition-colors active:scale-95 duration-100 cursor-pointer ${
              currentPage === '' || currentPage === 'home'
                ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1'
                : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/'); }}
          >
            Trang chủ
          </a>
          <a
            className={`text-label-md font-label-md transition-colors cursor-pointer ${
              currentPage === 'browse'
                ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1'
                : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/browse'); }}
          >
            Tìm chỗ ở
          </a>
          <a
            className={`text-label-md font-label-md transition-colors cursor-pointer ${
              currentPage === 'landlords'
                ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1'
                : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/landlords'); }}
          >
            Dành cho Chủ nhà
          </a>
          <a
            className={`text-label-md font-label-md transition-colors cursor-pointer ${
              currentPage === 'how-it-works'
                ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1'
                : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/how-it-works'); }}
          >
            Cách hoạt động
          </a>
          <a
            className={`text-label-md font-label-md transition-colors cursor-pointer ${
              currentPage === 'support'
                ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1'
                : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/support'); }}
          >
            Hỗ trợ
          </a>
        </div>

        {/* Actions (Web) */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-650 font-black text-sm border border-orange-200">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                  {user?.fullName}
                </span>
                <span className="material-symbols-outlined text-gray-400 text-[18px]">keyboard_arrow_down</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 py-2">
                <div className="px-4 py-2.5 border-b border-gray-100 flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tài khoản</p>
                  <p className="text-sm font-black text-gray-800 truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-bold rounded-full">
                      {roleLabel}
                    </span>
                  </div>
                </div>
                
                <a
                  onClick={goDashboard}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-primary-container font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-400">space_dashboard</span>
                  <span>Bảng điều khiển</span>
                </a>
                
                <a
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Đăng xuất</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              <a
                className="text-label-md font-label-md text-primary-container border border-primary-container rounded-full px-6 py-3 hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              >
                Đăng nhập
              </a>
              <a
                className="text-label-md font-label-md text-white bg-primary-container rounded-full px-6 py-3 hover:bg-orange-600 transition-colors soft-shadow cursor-pointer"
                onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              >
                Đăng ký
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-on-surface p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-[28px]">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-margin-mobile py-4 flex flex-col gap-4 shadow-md transition-all duration-300">
          <a
            className={`text-sm py-2 border-b border-gray-50 cursor-pointer ${
              currentPage === '' || currentPage === 'home' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/'); }}
          >
            Trang chủ
          </a>
          <a
            className={`text-sm py-2 border-b border-gray-50 cursor-pointer ${
              currentPage === 'browse' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/browse'); }}
          >
            Tìm chỗ ở
          </a>
          <a
            className={`text-sm py-2 border-b border-gray-50 cursor-pointer ${
              currentPage === 'landlords' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/landlords'); }}
          >
            Dành cho Chủ nhà
          </a>
          <a
            className={`text-sm py-2 border-b border-gray-50 cursor-pointer ${
              currentPage === 'how-it-works' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/how-it-works'); }}
          >
            Cách hoạt động
          </a>
          <a
            className={`text-sm py-2 border-b border-gray-50 cursor-pointer ${
              currentPage === 'support' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
            onClick={(e) => { e.preventDefault(); navTo('/support'); }}
          >
            Hỗ trợ
          </a>

          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col items-center gap-1 py-2 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-800">{user?.fullName}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                  <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold rounded-full">
                    {roleLabel}
                  </span>
                </div>
                <button
                  className="text-center text-sm font-bold text-primary-container border border-primary-container rounded-full py-2.5 hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                  onClick={goDashboard}
                >
                  Bảng điều khiển
                </button>
                <button
                  className="text-center text-sm font-bold text-white bg-red-500 rounded-full py-2.5 hover:bg-red-600 transition-colors cursor-pointer mt-1"
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <a
                  className="text-center text-sm font-bold text-primary-container border border-primary-container rounded-full py-2.5 hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                  onClick={(e) => { e.preventDefault(); navTo('/login'); }}
                >
                  Đăng nhập
                </a>
                <a
                  className="text-center text-sm font-bold text-white bg-primary-container rounded-full py-2.5 hover:bg-orange-600 transition-colors cursor-pointer"
                  onClick={(e) => { e.preventDefault(); navTo('/register'); }}
                >
                  Đăng ký
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
