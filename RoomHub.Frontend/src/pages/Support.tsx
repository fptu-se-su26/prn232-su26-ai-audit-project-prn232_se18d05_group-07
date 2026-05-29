import React, { useState } from 'react';

interface SupportProps {
  setCurrentPage: (page: 'home' | 'browse' | 'detail' | 'landlords' | 'how-it-works' | 'support') => void;
}

const Support: React.FC<SupportProps> = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Người tìm thuê');
  const [subject, setSubject] = useState('Vấn đề đăng nhập/tài khoản');
  const [message, setMessage] = useState('');

  const suggestions = [
    "Đăng tin cho thuê",
    "Liên hệ chủ nhà",
    "Quản lý hóa đơn",
    "Báo cáo sự cố"
  ];

  const faqs = [
    {
      question: "Làm sao để liên hệ với chủ nhà để xem phòng?",
      answer: "Bạn có thể liên hệ với chủ nhà bằng cách đăng nhập vào hệ thống RoomHub, mở trang chi tiết của phòng trọ/căn hộ bạn ưng ý. Số điện thoại của chủ nhà sẽ được hiển thị đầy đủ để bạn trực tiếp trao đổi và đặt lịch xem phòng."
    },
    {
      question: "Đăng tin cho thuê trên RoomHub có mất phí không?",
      answer: "RoomHub cung cấp giải pháp đăng tin cơ bản hoàn toàn miễn phí cho tất cả chủ nhà tại Đà Nẵng để đăng tải phòng trống lên mạng lưới tìm kiếm. Ngoài ra, chúng tôi có thêm các dịch vụ tin đăng nổi bật hỗ trợ tiếp cận nhanh hơn."
    },
    {
      question: "Tôi quên mật khẩu tài khoản, làm cách nào để lấy lại?",
      answer: "Tại cửa sổ Đăng nhập, bạn hãy nhấp chọn liên kết 'Quên mật khẩu'. Nhập email đăng ký của bạn, hệ thống RoomHub sẽ tự động gửi đường dẫn đặt lại mật khẩu bảo mật về hòm thư của bạn trong vòng vài giây."
    },
    {
      question: "Làm sao để báo cáo một bài viết đăng sai sự thật hoặc lừa đảo?",
      answer: "Ở cuối mỗi bài viết chi tiết phòng trọ đều có biểu tượng cờ 'Báo cáo vi phạm'. Bạn hãy bấm chọn cờ, tích chọn lý do phù hợp và gửi cho ban quản trị. Đội ngũ kiểm duyệt RoomHub sẽ xác thực thông tin và xử lý lập tức để bảo vệ người dùng."
    }
  ];

  const handleSuggestionClick = (text: string) => {
    setSearchQuery(text);
  };

  const handleToggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Email và Nội dung chi tiết).");
      return;
    }

    // Show beautiful alert
    alert(
      `Cảm ơn ${fullName}! Yêu cầu hỗ trợ về "${subject}" của bạn đã được gửi thành công đến đội ngũ hỗ trợ RoomHub Đà Nẵng.\n\nChúng tôi sẽ phản hồi sớm nhất qua email: ${email} trong vòng 24 giờ làm việc.`
    );

    // Reset states
    setFullName('');
    setEmail('');
    setRole('Người tìm thuê');
    setSubject('Vấn đề đăng nhập/tài khoản');
    setMessage('');
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="ambient-glow top-0 left-1/2 -translate-x-1/2"></div>

      {/* Header Search Section */}
      <section className="relative pt-16 pb-12 px-margin-desktop max-w-container-max mx-auto flex flex-col items-center text-center">
        <span className="inline-block px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold text-label-md mb-4">
          Trung tâm Hỗ trợ RoomHub
        </span>
        <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-6 max-w-3xl leading-tight">
          Bạn cần hỗ trợ điều gì?
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">
          Tìm kiếm câu trả lời nhanh chóng từ cơ sở dữ liệu tri thức của chúng tôi hoặc liên hệ trực tiếp với đội ngũ hỗ trợ tại Đà Nẵng.
        </p>

        {/* Big Search Bar */}
        <div className="w-full max-w-3xl relative mb-8 group">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant text-2xl group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-16 pr-40 rounded-full border border-outline-variant bg-white dark:bg-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 font-body-lg text-body-lg shadow-md outline-none transition-all" 
            placeholder="Tìm kiếm câu hỏi, ví dụ: 'Làm sao để đăng tin?'" 
          />
          <button 
            onClick={() => alert(`Tìm kiếm cụm từ: "${searchQuery}" đang được tối ưu hóa dữ liệu ở giai đoạn tiếp theo!`)}
            className="absolute right-2 top-2 bottom-2 bg-primary-container text-white font-bold text-sm px-8 rounded-full hover:bg-orange-600 transition-colors shadow-sm active:scale-98"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <span className="font-bold text-sm text-on-surface-variant py-2">Gợi ý:</span>
          {suggestions.map((sug, idx) => (
            <button 
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface font-semibold text-sm transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </section>

      {/* Support Categories Section */}
      <section className="py-16 px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 text-center space-y-3">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
            Danh mục Hỗ trợ Nhanh
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Chọn chủ đề bạn đang quan tâm để xem các bài viết hướng dẫn chi tiết.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Item 1 */}
          <div 
            onClick={() => setCurrentPage('browse')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">bed</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Tìm chỗ ở</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Cách sử dụng bộ lọc tìm kiếm nâng cao, đọc thông tin phòng, xem bản đồ và liên hệ chính xác với chủ trọ.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>

          {/* Item 2 */}
          <div 
            onClick={() => alert('Hướng dẫn tài khoản đang được biên soạn nội dung!')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">account_circle</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Tài khoản &amp; Đăng nhập</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Quản lý hồ sơ cá nhân của người thuê/chủ nhà, cách đổi mật khẩu, và các cơ chế xác thực danh tính an toàn.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>

          {/* Item 3 */}
          <div 
            onClick={() => alert('Hướng dẫn trao đổi đàm phán chủ trọ đang được biên soạn!')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">forum</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Liên hệ chủ nhà</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Gửi tin nhắn trao đổi thương thảo hợp đồng, đặt lịch xem phòng trực quan, và các lưu ý đặt cọc an toàn.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>

          {/* Item 4 */}
          <div 
            onClick={() => setCurrentPage('landlords')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">add_business</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Đăng tin cho thuê</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Quy trình đăng tin phòng trống tại Đà Nẵng, cách tối ưu hình ảnh, thiết lập giá dịch vụ và các mô tả cuốn hút.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>

          {/* Item 5 */}
          <div 
            onClick={() => setCurrentPage('landlords')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">dashboard</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Quản lý cho thuê</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Vận hành sơ đồ phòng trọ theo tầng, cập nhật thông tin khách thuê trực quan, quản lý hợp đồng chuyên nghiệp.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>

          {/* Item 6 */}
          <div 
            onClick={() => setCurrentPage('how-it-works')}
            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] icon-fill">receipt_long</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold mb-2 group-hover:text-primary transition-colors">Hóa đơn &amp; Thanh toán</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Cách thiết lập đơn giá dịch vụ điện nước, nhập số công tơ, tự động kết xuất cước và xuất file bảng kê Excel hàng tháng.
            </p>
            <span className="mt-auto font-bold text-sm text-primary-container group-hover:text-orange-600 flex items-center gap-1">
              Xem hướng dẫn 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-surface-container-low border-t border-b border-surface-variant">
        <div className="max-w-3xl mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile">
          <div className="text-center mb-12 space-y-4">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">Câu hỏi thường gặp</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tổng hợp những thắc mắc phổ biến nhất từ người dùng RoomHub trong quá trình tìm kiếm và quản lý trọ.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => handleToggleFaq(idx)}
                    className="w-full flex justify-between items-center cursor-pointer p-6 font-bold text-on-surface hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <span className={`material-symbols-outlined text-[24px] text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                      expand_more
                    </span>
                  </button>
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

      {/* Contact Section */}
      <section className="py-24 px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
              Liên hệ Đội ngũ Hỗ trợ
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Nếu bạn không tìm thấy câu trả lời trong Help Center, đừng ngần ngại gửi tin nhắn cho chúng tôi. Đội ngũ kỹ thuật RoomHub luôn sẵn sàng đồng hành và hỗ trợ bạn trong vòng 24 giờ làm việc.
            </p>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4 hover:translate-x-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] icon-fill">mail</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface">Email Hỗ Trợ</h4>
                <p className="text-sm text-on-surface-variant">support@roomhub.vn</p>
              </div>
            </div>

            {/* Hotline */}
            <div className="flex items-start gap-4 hover:translate-x-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] icon-fill">call</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface">Hotline (Miễn phí)</h4>
                <p className="text-sm text-on-surface-variant">1800-8888-9999</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4 hover:translate-x-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] icon-fill">schedule</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface">Giờ làm việc văn phòng</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Thứ 2 - Thứ 6: 8:00 AM - 6:00 PM <br />
                  Thứ 7: 8:00 AM - 12:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Họ và Tên <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm" 
                  placeholder="Nguyễn Văn A" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Email <span className="text-red-500">*</span></label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm" 
                  placeholder="nguyenvana@email.com" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Vai trò của bạn</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm text-on-surface-variant"
              >
                <option>Người tìm thuê</option>
                <option>Chủ nhà / Quản lý</option>
                <option>Khác</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Chủ đề cần hỗ trợ</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm text-on-surface-variant"
              >
                <option>Vấn đề đăng nhập/tài khoản</option>
                <option>Hỗ trợ đăng tin</option>
                <option>Báo cáo vi phạm</option>
                <option>Góp ý hệ thống</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm resize-none" 
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..." 
                rows={4}
              />
            </div>

            <button 
              type="submit"
              className="mt-2 h-14 bg-primary-container text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              Gửi Yêu Cầu Hỗ Trợ
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Support;
