import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAlert = (message: string) => {
    alert(message);
  };

  return (
    <nav className="bg-surface dark:bg-on-background docked full-width top-0 sticky z-50 transition-all duration-300 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop h-20 w-full max-w-container-max mx-auto md:px-margin-desktop px-margin-mobile">
        {/* Brand */}
        <a className="flex items-center gap-2 group" href="#">
          <span className="material-symbols-outlined text-[32px] text-primary-container icon-fill">roofing</span>
          <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed tracking-tight">RoomHub</span>
        </a>

        {/* Navigation Links (Web) */}
        <div className="hidden md:flex items-center gap-8">
          <a className="text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1 text-label-md font-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors active:scale-95 duration-100" href="#">Trang chủ</a>
          <a 
            className="text-on-surface-variant dark:text-surface-variant font-body-md hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" 
            href="#"
            onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng nhập để tìm chỗ ở'); }}
          >
            Tìm chỗ ở
          </a>
          <a 
            className="text-on-surface-variant dark:text-surface-variant font-body-md hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" 
            href="#"
            onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng nhập/đăng ký tài khoản Chủ nhà'); }}
          >
            Dành cho Chủ nhà
          </a>
          <a className="text-on-surface-variant dark:text-surface-variant font-body-md hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#how-it-works">Cách hoạt động</a>
          <a className="text-on-surface-variant dark:text-surface-variant font-body-md hover:text-primary dark:hover:text-primary-fixed transition-colors text-label-md font-label-md" href="#footer-contact">Hỗ trợ</a>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            className="text-label-md font-label-md text-primary-container border border-primary-container rounded-full px-6 py-3 hover:bg-primary-container hover:text-white transition-colors" 
            href="#"
            onClick={(e) => { e.preventDefault(); handleAlert('Hệ thống Đăng nhập sẽ sớm hoàn thiện trong giai đoạn tiếp theo!'); }}
          >
            Đăng nhập
          </a>
          <a 
            className="text-label-md font-label-md text-white bg-primary-container rounded-full px-6 py-3 hover:bg-orange-600 transition-colors soft-shadow" 
            href="#"
            onClick={(e) => { e.preventDefault(); handleAlert('Hệ thống Đăng ký sẽ sớm hoàn thiện trong giai đoạn tiếp theo!'); }}
          >
            Đăng ký
          </a>
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
          <a className="text-primary font-bold text-sm py-2 border-b border-gray-50" href="#">Trang chủ</a>
          <a 
            className="text-on-surface-variant text-sm py-2 border-b border-gray-50" 
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleAlert('Vui lòng đăng nhập để tìm chỗ ở'); }}
          >
            Tìm chỗ ở
          </a>
          <a 
            className="text-on-surface-variant text-sm py-2 border-b border-gray-50" 
            href="#"
            onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleAlert('Vui lòng đăng nhập/đăng ký tài khoản Chủ nhà'); }}
          >
            Dành cho Chủ nhà
          </a>
          <a 
            className="text-on-surface-variant text-sm py-2 border-b border-gray-50" 
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Cách hoạt động
          </a>
          <a 
            className="text-on-surface-variant text-sm py-2 border-b border-gray-50" 
            href="#footer-contact"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Hỗ trợ
          </a>
          <div className="flex flex-col gap-2 mt-2 pt-2">
            <a 
              className="text-center text-sm font-bold text-primary-container border border-primary-container rounded-full py-2.5 hover:bg-primary-container hover:text-white transition-colors" 
              href="#"
              onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleAlert('Hệ thống Đăng nhập sẽ sớm hoàn thiện!'); }}
            >
              Đăng nhập
            </a>
            <a 
              className="text-center text-sm font-bold text-white bg-primary-container rounded-full py-2.5 hover:bg-orange-600 transition-colors" 
              href="#"
              onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleAlert('Hệ thống Đăng ký sẽ sớm hoàn thiện!'); }}
            >
              Đăng ký
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
