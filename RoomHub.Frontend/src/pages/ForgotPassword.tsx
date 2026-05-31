import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      // On success, navigate to verify-reset-otp page
      navigate('/verify-reset-otp');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-slate-50 text-slate-900 font-sans">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-12 lg:px-20 bg-white relative">
        <div className="max-w-md w-full mx-auto my-auto py-12">
          {/* ICON */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
              <span className="material-symbols-outlined text-orange-500 text-3xl font-light">
                key_visualizer
              </span>
            </div>
          </div>

          {/* HEADING */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Quên mật khẩu?</h1>
            <p className="text-slate-500">
              Đừng lo lắng! Hãy nhập email liên kết với tài khoản của bạn và chúng tôi sẽ gửi mã OTP
              để đặt lại mật khẩu.
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-150 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    mail
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400 focus:outline-none"
                  placeholder="ten@congty.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:shadow-orange-500/30 transition-all disabled:bg-orange-300"
            >
              {isSubmitting ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
            </button>
          </form>

          {/* BACK TO LOGIN */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Đã nhớ lại mật khẩu?{' '}
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="text-orange-500 font-semibold hover:underline"
              >
                Đăng nhập tại đây
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE PANEL */}
      <div className="hidden lg:block lg:flex-[1.2] relative">
        <img
          alt="Modern Architecture"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgZ-03dhzDd6AP_Q1driO6Kx_pSJCAnfl_okWtl6OWEYKkrF1-3bc15zLdhfxB6e0eyLUjlZGOo5VMV57oarTGoS5TvD8XCOZm9lKxZIuqRgIzcF03KJDWSgiuXFes7Ynr4bHiUS52jzzyMAzjSwSE42qHmwQXBpgEKvNKP2THEd_HLvmRJ7RCboO6AE8b9LtEkBPLq7XDxbpF0-TGMfHrSVNYQi3vI-Km7YrcGfoRo2zJ_f4ABY15AKHBPitgvK7bi14tBqY-br1_"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-20 left-16 right-16 text-white">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Khôi phục quyền truy cập tài khoản an toàn.
          </h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full mb-6"></div>
          <p className="text-slate-200 text-lg max-w-sm">
            Tham gia cùng hàng ngàn chuyên gia quản lý danh mục bất động sản một cách dễ dàng và an
            toàn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
