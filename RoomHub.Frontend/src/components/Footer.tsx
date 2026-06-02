import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleAlert = (message: string) => {
    alert(message);
  };

  return (
    <footer id="footer-contact" className="bg-[#111827] text-gray-300 border-t border-gray-800">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <a className="flex items-center gap-2" href="#">
              <span className="material-symbols-outlined text-[32px] text-primary-container icon-fill">roofing</span>
              <span className="text-2xl font-bold text-white tracking-tight">RoomHub</span>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Nền tảng tìm kiếm và quản lý nhà trọ, căn hộ thông minh hàng đầu tại Đà Nẵng. Kết nối trực tiếp người thuê và chủ nhà, tối ưu hóa cuộc sống thuê trọ.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors"
                href="#"
                onClick={(e) => { e.preventDefault(); handleAlert('Website chính thức của dự án: www.roomhub.vn'); }}
              >
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors"
                href="mailto:support@roomhub.vn"
                onClick={(e) => { e.preventDefault(); handleAlert('Gửi email hỗ trợ tới: support@roomhub.vn'); }}
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors"
                href="tel:02367300999"
                onClick={(e) => { e.preventDefault(); handleAlert('Gọi tổng đài hỗ trợ: 0236 7300 999 (Đà Nẵng)'); }}
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-white font-bold mb-6">Dành cho người thuê</h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng nhập để tìm kiếm phòng trọ tại Đà Nẵng'); }}
                >
                  Tìm phòng trọ
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng nhập để tìm kiếm căn hộ dịch vụ'); }}
                >
                  Tìm căn hộ
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng nhập để tìm kiếm bạn ở ghép'); }}
                >
                  Tìm bạn ở ghép
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/how-it-works');
                  }}
                >
                  Cách hoạt động
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-6">Dành cho chủ nhà</h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Vui lòng đăng ký tài khoản chủ nhà để đăng tin cho thuê'); }}
                >
                  Đăng tin cho thuê
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Tính năng Phần mềm quản lý tòa nhà sẽ kích hoạt sau khi đăng nhập tài khoản Chủ nhà'); }}
                >
                  Phần mềm quản lý
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Bảng giá tin đăng nổi bật Đà Nẵng sẽ sớm ra mắt!'); }}
                >
                  Bảng giá dịch vụ
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:text-primary-container transition-colors"
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleAlert('Kinh nghiệm vận hành và tối ưu hóa doanh thu phòng trọ!'); }}
                >
                  Kinh nghiệm quản lý
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-bold mb-6">Liên hệ &amp; Hỗ trợ</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">location_on</span>
                <span>Khu đô thị FPT City, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container">call</span>
                <span>0236 7300 999</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary-container">mail</span>
                <span>support@roomhub.vn</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} RoomHub Đà Nẵng - Môn học PRN232 - Dự án báo cáo của Nhóm 07 (Lớp SE18D05). Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
