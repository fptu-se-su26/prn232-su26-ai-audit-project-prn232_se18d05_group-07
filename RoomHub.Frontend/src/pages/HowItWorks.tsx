import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface HowItWorksProps {
  setCurrentPage?: (page: 'home' | 'browse' | 'detail' | 'landlords' | 'how-it-works') => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ setCurrentPage: propSetCurrentPage }) => {
  const navigate = useNavigate();
  
  const setCurrentPage = (page: 'home' | 'browse' | 'detail' | 'landlords' | 'how-it-works') => {
    if (propSetCurrentPage) {
      propSetCurrentPage(page);
    } else {
      if (page === 'home') navigate('/');
      else if (page === 'browse') navigate('/browse');
      else if (page === 'landlords') navigate('/landlords');
      else if (page === 'how-it-works') navigate('/how-it-works');
    }
  };

  const renterSectionRef = useRef<HTMLDivElement>(null);
  const landlordSectionRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      question: "RoomHub có thu phí người đi thuê không?",
      answer: "Không. RoomHub hoàn toàn miễn phí cho người tìm kiếm và thuê chỗ ở tại Đà Nẵng. Bạn có thể tìm phòng, so sánh tiện ích và theo dõi hóa đơn hàng tháng mà không tốn bất kỳ khoản phí nào."
    },
    {
      question: "Làm sao để tôi lấy được số điện thoại của chủ nhà?",
      answer: "Vì lý do bảo mật và hạn chế tin nhắn rác (spam), số điện thoại chủ nhà mặc định sẽ bị làm mờ. Bạn chỉ cần tạo một tài khoản miễn phí trên RoomHub và đăng nhập, hệ thống sẽ lập tức hiển thị đầy đủ thông tin liên hệ của chủ nhà."
    },
    {
      question: "Tôi là chủ nhà, tôi có thể tạo bao nhiêu tòa nhà và phòng trọ?",
      answer: "Hiện tại trong giai đoạn thử nghiệm này, RoomHub không giới hạn số lượng tòa nhà, số tầng, số lượng phòng hay tin đăng cho thuê. Bạn có thể thiết lập cấu trúc tòa nhà đa dạng và trực quan tùy theo thực tế quản lý."
    },
    {
      question: "Phần mềm quản lý có giúp tôi tự động tính tiền điện nước hàng tháng không?",
      answer: "Có. Bạn chỉ cần cài đặt đơn giá điện, nước, dịch vụ ban đầu khi tạo tòa nhà. Hàng tháng, khi bạn nhập chỉ số mới của công tơ, hệ thống RoomHub sẽ tự động đối chiếu chỉ số cũ và nhân theo đơn giá để tính ra tổng số tiền phải trả chính xác 100%."
    },
    {
      question: "Người thuê có thể nhận thông báo hóa đơn tự động bằng cách nào?",
      answer: "Chủ nhà có thể xuất bảng kê hóa đơn chi tiết ra file Excel chuyên nghiệp chỉ với một cú click chuột từ RoomHub. Bảng kê này được định dạng rất gọn gàng để chủ nhà dễ dàng gửi nhanh qua các kênh liên lạc như Zalo, Messenger hoặc Email cho người thuê."
    },
    {
      question: "Dữ liệu quản lý của tôi có được bảo mật và an toàn không?",
      answer: "RoomHub cam kết bảo mật tuyệt đối dữ liệu cá nhân, thông tin hợp đồng và số liệu tài chính của chủ nhà cũng như khách thuê. Hệ thống sử dụng các tiêu chuẩn mã hóa dữ liệu cao nhất và lưu trữ an toàn trên nền tảng đám mây."
    }
  ];

  const handleToggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold text-label-md">
              Cách RoomHub vận hành
            </span>
            <h1 className="text-headline-lg-mobile md:text-[56px] font-extrabold text-on-background leading-tight tracking-tight">
              Tìm chỗ ở, kết nối chủ nhà và quản lý thuê phòng trong một nền tảng
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
              RoomHub là giải pháp công nghệ toàn diện giúp người thuê dễ dàng tìm kiếm không gian sống lý tưởng và hỗ trợ chủ nhà tối ưu hóa quy trình quản lý bất động sản cho thuê tại Đà Nẵng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setCurrentPage('browse')}
                className="px-8 py-4 bg-primary-container text-white text-label-md font-bold rounded-full hover:bg-orange-600 transition-all active:scale-98 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Tìm chỗ ở ngay
              </button>
              <button 
                onClick={() => setCurrentPage('landlords')}
                className="px-8 py-4 border-2 border-outline text-on-surface text-label-md font-bold rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">real_estate_agent</span>
                Dành cho chủ nhà
              </button>
            </div>
          </div>

          {/* Hero Right: Modern Card Stepper */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-surface-container-low to-surface-container p-8 border border-surface-variant flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[28px] icon-fill">search</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface">1. Tìm kiếm thông minh</h3>
                <p className="text-sm text-on-surface-variant">Lọc phòng trọ, căn hộ mini theo giá cả, vị trí cụ thể và các tiện ích mong muốn tại Đà Nẵng.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[28px] icon-fill">visibility</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface">2. Xem chi tiết &amp; Liên hệ</h3>
                <p className="text-sm text-on-surface-variant">Xem hình ảnh thực tế, tiện nghi cụ thể, bảng chi phí và đăng nhập để hiển thị liên hệ chủ nhà.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[28px] icon-fill">grid_view</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface">3. Sơ đồ phòng trực quan</h3>
                <p className="text-sm text-on-surface-variant">Chủ nhà dễ dàng theo dõi toàn bộ trạng thái trống, đã thuê và quản lý hợp đồng trên sơ đồ dạng lưới.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[28px] icon-fill">receipt_long</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface">4. Hóa đơn &amp; Thanh toán tự động</h3>
                <p className="text-sm text-on-surface-variant">Tính tiền điện nước hàng tháng chính xác tuyệt đối, xuất bảng kê Excel chuyên nghiệp gửi khách hàng.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Switch Section */}
      <section className="bg-surface-container-low py-20 border-t border-b border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile text-center">
          <h2 className="text-headline-lg font-bold text-on-background mb-4">
            Bạn sử dụng RoomHub với vai trò nào?
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-12">
            Chọn vai trò của bạn để khám phá nhanh quy trình vận hành và các tính năng được tối ưu hóa riêng biệt.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Renter Switch Card */}
            <div 
              onClick={() => scrollToSection(renterSectionRef)}
              className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary-container group text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[36px] icon-fill">person</span>
                </div>
                <h3 className="text-headline-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  Tôi là người thuê
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Tìm kiếm phòng trọ, căn hộ ưng ý tại Đà Nẵng, lọc theo ngân sách và tiện ích, liên hệ chủ trọ tin cậy và theo dõi hóa đơn chi phí minh bạch hàng tháng.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm">
                <span>Xem quy trình chi tiết</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_downward</span>
              </div>
            </div>

            {/* Landlord Switch Card */}
            <div 
              onClick={() => scrollToSection(landlordSectionRef)}
              className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary-container group text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[36px] icon-fill">real_estate_agent</span>
                </div>
                <h3 className="text-headline-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  Tôi là chủ nhà
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Quản lý nhiều tòa nhà, thiết lập số tầng, thiết kế lưới phòng trực quan, đăng tin tìm khách thuê, tạo hợp đồng điện nước và xuất hóa đơn tính tiền Excel tự động.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm">
                <span>Xem quy trình chi tiết</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_downward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works for Renters */}
      <section ref={renterSectionRef} className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile py-24 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-orange-50 text-primary font-bold text-xs uppercase tracking-wider">
            Dành cho người thuê
          </span>
          <h2 className="text-headline-lg font-bold text-on-background">
            Hành trình tìm kiếm không gian sống lý tưởng
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
            Quy trình 5 bước đơn giản giúp bạn tìm phòng trọ, căn hộ nhanh chóng và minh bạch từ tìm kiếm đến theo dõi hóa đơn.
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Timeline Connector Line (Desktop) */}
          <div className="absolute top-20 left-[10%] right-[10%] h-1 bg-surface-container-high hidden md:block z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover-lift">
              <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm border-4 border-white dark:border-gray-800">
                1
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] icon-fill">search</span>
              </div>
              <h4 className="font-bold text-base text-on-surface mb-2">Tìm kiếm phòng</h4>
              <p className="text-sm text-on-surface-variant">Nhập khu vực quận/huyện, tên trường học gần kề để quét tìm các vị trí trọ.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover-lift">
              <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm border-4 border-white dark:border-gray-800">
                2
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] icon-fill">tune</span>
              </div>
              <h4 className="font-bold text-base text-on-surface mb-2">Lọc &amp; So sánh</h4>
              <p className="text-sm text-on-surface-variant">Lọc nhanh theo tầm giá mong muốn, diện tích phòng, và tích chọn các tiện ích phòng.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover-lift">
              <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm border-4 border-white dark:border-gray-800">
                3
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] icon-fill">visibility</span>
              </div>
              <h4 className="font-bold text-base text-on-surface mb-2">Xem chi tiết</h4>
              <p className="text-sm text-on-surface-variant">Duyệt gallery ảnh chất lượng cao, nắm rõ nội quy và các khoản phí dịch vụ cụ thể.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover-lift">
              <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm border-4 border-white dark:border-gray-800">
                4
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] icon-fill">login</span>
              </div>
              <h4 className="font-bold text-base text-on-surface mb-2">Đăng nhập xem SĐT</h4>
              <p className="text-sm text-on-surface-variant">Đăng nhập tài khoản miễn phí để mở khóa số điện thoại chủ nhà và trực tiếp chốt phòng.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center hover-lift">
              <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm border-4 border-white dark:border-gray-800">
                5
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px] icon-fill">receipt</span>
              </div>
              <h4 className="font-bold text-base text-on-surface mb-2">Theo dõi hóa đơn</h4>
              <p className="text-sm text-on-surface-variant">Nhận bảng chi tiết hóa đơn điện nước hàng tháng rõ ràng từ chủ trọ gửi qua Zalo/Excel.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => setCurrentPage('browse')}
            className="px-8 py-4 bg-primary text-white text-label-md font-bold rounded-full hover:bg-orange-800 transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 mx-auto"
          >
            Bắt đầu tìm phòng trọ tại Đà Nẵng
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* How It Works for Landlords */}
      <section ref={landlordSectionRef} className="bg-surface-container-low py-24 border-t border-b border-surface-variant scroll-mt-20">
        <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile">
          <div className="text-center mb-16 space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-orange-50 text-primary font-bold text-xs uppercase tracking-wider">
              Dành cho chủ nhà
            </span>
            <h2 className="text-headline-lg font-bold text-on-background">
              Giải pháp số quản lý chuyên nghiệp, tối ưu thời gian
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Thiết lập quy trình số hóa toàn bộ hệ thống phòng trọ của bạn chỉ trong 6 bước trực quan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-on-surface">Đăng ký tài khoản chủ nhà</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Tạo tài khoản quản lý hoàn toàn miễn phí trên nền tảng. Xác thực các thông tin cơ bản để bắt đầu kích hoạt quyền quản lý tòa nhà.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-on-surface">Thiết lập cấu trúc Tòa nhà</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Khai báo thông tin các dãy trọ, tòa nhà căn hộ của bạn, bao gồm: Địa chỉ, số tầng, các tiện ích dùng chung và cài đặt đơn giá điện nước.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-on-surface">Quản lý lưới sơ đồ phòng</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Hệ thống tự động thiết kế lưới phòng trọ trực quan theo các tầng trọ. Dễ dàng nắm bắt phòng nào trống (màu xanh) hay đã cho thuê (màu cam).
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  4
                </div>
                <h3 className="text-lg font-bold text-on-surface">Đăng tin tìm khách thuê</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Nhấp vào các phòng trống trên lưới để đăng bài cho thuê, tải ảnh đẹp, giới thiệu chi phí và hiển thị bài đăng trên trang tìm kiếm Đà Nẵng.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  5
                </div>
                <h3 className="text-lg font-bold text-on-surface">Thêm khách thuê vào sơ đồ</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Khi có khách mới dọn vào trọ, chủ nhà cập nhật thông tin cá nhân của khách trọ, kỳ hạn cọc và ghi nhận trạng thái phòng chuyển sang "Đã thuê".
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                  6
                </div>
                <h3 className="text-lg font-bold text-on-surface">Tự động xuất hóa đơn Excel</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Cuối tháng nhập chỉ số mới của công tơ điện nước. RoomHub tự động cộng dồn tiền phòng và xuất bảng kê Excel chuyên nghiệp gửi khách thuê trọ.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setCurrentPage('landlords')}
              className="px-8 py-4 bg-primary text-white text-label-md font-bold rounded-full hover:bg-orange-800 transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 mx-auto"
            >
              Trải nghiệm Dashboard quản lý tòa nhà
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* End-to-End Flow Diagram */}
      <section className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-headline-lg font-bold text-on-background">Quy trình xuyên suốt của RoomHub</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
            Hệ thống kết nối mượt mà từ hành động của chủ nhà đến trải nghiệm người đi thuê trên cùng một nền tảng số.
          </p>
        </div>

        <div className="bg-surface-container rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-stretch justify-between gap-8 border border-outline-variant relative">
          
          {/* Node 1 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center hover-lift">
            <span className="material-symbols-outlined text-[56px] text-primary mb-4 block">real_estate_agent</span>
            <h4 className="font-bold text-base text-on-surface mb-2">Chủ nhà đăng tin</h4>
            <p className="text-xs text-on-surface-variant">Đăng phòng trống kèm ảnh thực tế và giá thuê rõ ràng lên hệ thống.</p>
          </div>

          <div className="flex items-center justify-center lg:h-auto py-2">
            <span className="material-symbols-outlined text-[36px] text-outline rotate-90 lg:rotate-0">arrow_forward</span>
          </div>

          {/* Node 2 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center hover-lift">
            <span className="material-symbols-outlined text-[56px] text-primary-container mb-4 block">search</span>
            <h4 className="font-bold text-base text-on-surface mb-2">Người thuê tìm &amp; liên hệ</h4>
            <p className="text-xs text-on-surface-variant">Lọc theo ngân sách, đăng nhập để lấy thông tin liên lạc và gọi chốt phòng.</p>
          </div>

          <div className="flex items-center justify-center lg:h-auto py-2">
            <span className="material-symbols-outlined text-[36px] text-outline rotate-90 lg:rotate-0">arrow_forward</span>
          </div>

          {/* Node 3 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center hover-lift">
            <span className="material-symbols-outlined text-[56px] text-primary mb-4 block">handshake</span>
            <h4 className="font-bold text-base text-on-surface mb-2">Chốt thuê &amp; Cập nhật</h4>
            <p className="text-xs text-on-surface-variant">Chủ nhà thêm thông tin khách trọ vào sơ đồ và cập nhật trạng thái đã thuê.</p>
          </div>

          <div className="flex items-center justify-center lg:h-auto py-2">
            <span className="material-symbols-outlined text-[36px] text-outline rotate-90 lg:rotate-0">arrow_forward</span>
          </div>

          {/* Node 4 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center hover-lift">
            <span className="material-symbols-outlined text-[56px] text-primary-container mb-4 block">receipt_long</span>
            <h4 className="font-bold text-base text-on-surface mb-2">Quản lý hóa đơn</h4>
            <p className="text-xs text-on-surface-variant">Tính toán tiền dịch vụ tự động mỗi cuối tháng và xuất bảng kê Excel chuyên nghiệp.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-surface-container-low py-24 border-t border-b border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile">
          <h2 className="text-headline-lg font-bold text-on-background text-center mb-16">
            Tính năng công nghệ vượt trội trên RoomHub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">domain</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Đa dạng mô hình trọ</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Hỗ trợ quản lý linh hoạt mọi mô hình bất động sản cho thuê: từ phòng trọ truyền thống, phòng chung cư mini, căn hộ dịch vụ cao cấp đến nhà nguyên căn.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">manage_search</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Tìm kiếm thông minh tại Đà Nẵng</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bộ lọc tìm kiếm đa năng tích hợp sâu theo vị trí quận, tầm giá thuê thực tế và danh sách tiện nghi tùy chọn để cho ra kết quả sát thực tế nhất.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">privacy_tip</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Bảo mật liên hệ tuyệt đối</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Chỉ cho phép người dùng đã xác thực thông tin và đăng nhập tài khoản xem số điện thoại của chủ nhà, loại bỏ triệt để các cuộc gọi spam môi giới.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">grid_on</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Lưới phòng trực quan sinh động</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Giao diện dashboard quản lý sơ đồ phòng thiết kế dưới dạng lưới lấp đầy màu sắc giúp chủ trọ nắm vững tình trạng vận hành trong 1 giây.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">calculate</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Tự động tính cước điện nước</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Hệ thống tự động lưu trữ số liệu cũ, đối chiếu chỉ số mới do chủ nhà nhập và thực hiện cộng dồn tiền phòng, tiền cọc, cước mạng chính xác.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-50 dark:border-gray-700 hover-lift">
              <span className="material-symbols-outlined text-4xl text-primary-container mb-4">table_view</span>
              <h4 className="text-lg font-bold text-on-surface mb-2">Xuất file Excel báo cáo nhanh</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Dễ dàng kết xuất bảng kê cước phí dịch vụ điện nước chi tiết của từng phòng ra định dạng Excel chuyên nghiệp, phục vụ gửi nhanh cho khách trọ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Scenario (Minh & Cô Lan) */}
      <section className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-headline-lg font-bold text-on-background">Ví dụ một tình huống sử dụng RoomHub thực tế</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
            Hành trình kết nối mượt mà của hai mảnh ghép: khách thuê tìm phòng và chủ nhà vận hành.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-stretch">
            
            {/* Minh's Side */}
            <div className="flex-1 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[36px]">face</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-on-surface">Bạn Minh (Sinh viên)</h4>
                    <p className="text-sm text-on-surface-variant">Đang cần tìm phòng trọ tốt gần trường học quận Hải Châu</p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-primary space-y-2 hover-lift">
                  <div className="text-xs font-bold text-primary">BƯỚC 1: LỌC TÌM PHÒNG TRỌ</div>
                  <p className="text-sm text-on-surface">Minh truy cập RoomHub, nhập bộ lọc giá dưới 3 triệu đồng và chọn khu vực quận Hải Châu để hệ thống quét danh sách phòng trống phù hợp.</p>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border-l-4 border-primary space-y-2 hover-lift">
                  <div className="text-xs font-bold text-primary">BƯỚC 2: LIÊN HỆ CHỐT PHÒNG</div>
                  <p className="text-sm text-on-surface">Minh thấy căn phòng Studio full nội thất rất đẹp của Cô Lan. Minh tạo tài khoản miễn phí để hiển thị số điện thoại và gọi điện đặt lịch hẹn chốt thuê.</p>
                </div>
              </div>
            </div>

            {/* Connection Arrow Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center px-4 shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-primary-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] animate-pulse">sync_alt</span>
              </div>
            </div>

            {/* Cô Lan's Side */}
            <div className="flex-1 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6 lg:flex-row-reverse lg:text-right">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[36px]">face_3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-on-surface">Cô Lan (Chủ dãy nhà trọ)</h4>
                    <p className="text-sm text-on-surface-variant">Đang quản lý dãy nhà trọ quy mô 20 phòng cho thuê</p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border-r-4 lg:border-l-4 lg:border-r-0 border-secondary-container space-y-2 hover-lift text-left">
                  <div className="text-xs font-bold text-primary-container">BƯỚC 3: CẬP NHẬT TRẠNG THÁI PHÒNG</div>
                  <p className="text-sm text-on-surface">Sau khi chốt giao dịch với Minh, Cô Lan mở lưới sơ đồ phòng của tòa nhà, nhấp chọn phòng tương ứng để cập nhật trạng thái "Đã thuê" và điền thông tin của Minh.</p>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border-r-4 lg:border-l-4 lg:border-r-0 border-secondary-container space-y-2 hover-lift text-left">
                  <div className="text-xs font-bold text-primary-container">BƯỚC 4: TÍNH CƯỚC &amp; GỬI FILE EXCEL</div>
                  <p className="text-sm text-on-surface">Đến ngày chốt sổ cuối tháng, cô chỉ cần nhập chỉ số điện nước mới. Hệ thống tự động tính ra tổng số tiền và kết xuất bảng kê cước phí Excel cực nhanh để cô gửi cho Minh.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container-low py-24 border-t border-b border-surface-variant">
        <div className="max-w-3xl mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-headline-lg font-bold text-on-background">Câu hỏi thường gặp</h2>
            <p className="text-body-lg text-on-surface-variant">
              Giải đáp nhanh các thắc mắc phổ biến của người thuê trọ và chủ nhà khi trải nghiệm RoomHub.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => handleToggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-on-surface hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <span className={`material-symbols-outlined text-[24px] text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  {/* Dynamic Height Transition Container */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] border-t border-gray-50 dark:border-gray-700' : 'max-h-0'}`}
                  >
                    <div className="p-6 text-sm text-on-surface-variant leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gradient-to-br from-primary-container to-secondary-container py-24 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>
        <div className="max-w-4xl mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile relative z-10 space-y-8">
          <h2 className="text-headline-lg font-extrabold text-white leading-tight">
            Sẵn sàng bắt đầu với RoomHub Đà Nẵng?
          </h2>
          <p className="text-body-lg text-white/95 max-w-xl mx-auto font-medium">
            Gia nhập ngay cộng đồng tìm kiếm và quản lý bất động sản cho thuê hiệu quả, văn minh hàng đầu tại miền Trung.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button 
              onClick={() => setCurrentPage('browse')}
              className="px-8 py-4 bg-white text-primary-container text-label-md font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] icon-fill">search</span>
              Tìm chỗ ở ngay
            </button>
            <button 
              onClick={() => setCurrentPage('landlords')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-label-md font-bold rounded-full hover:bg-white/10 hover:scale-105 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px] icon-fill">real_estate_agent</span>
              Đăng ký làm chủ nhà
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
