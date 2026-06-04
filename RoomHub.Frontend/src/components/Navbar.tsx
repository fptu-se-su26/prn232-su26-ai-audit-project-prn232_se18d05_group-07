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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">account_circle</span>
                <span className="text-label-md font-semibold text-gray-700">
                  {user?.fullName} ({roleLabel})
                </span>
              </div>
              <button
                onClick={goDashboard}
                className="text-label-md font-label-md text-white bg-primary-container rounded-full px-5 py-2.5 hover:bg-orange-600 transition-colors soft-shadow cursor-pointer font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">space_dashboard</span> Bảng điều khiển
              </button>
              <button
                onClick={handleLogout}
                className="text-label-md font-label-md text-white bg-red-500 rounded-full px-5 py-2.5 hover:bg-red-650 transition-colors soft-shadow cursor-pointer font-bold"
              >
                Đăng xuất
              </button>
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
                <span className="text-sm font-semibold text-center text-gray-700 py-1">
                  {user?.fullName} ({roleLabel})
                </span>
                <button
                  className="text-center text-sm font-bold text-white bg-primary-container rounded-full py-2.5 hover:bg-orange-600 transition-colors cursor-pointer"
                  onClick={goDashboard}
                >
                  Bảng điều khiển
                </button>
                <button
                  className="text-center text-sm font-bold text-white bg-red-500 rounded-full py-2.5 hover:bg-red-600 transition-colors cursor-pointer"
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
