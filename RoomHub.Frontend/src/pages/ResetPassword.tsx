import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Eye toggle state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      navigate('/forgot-password');
    }
  }, [navigate]);

  // Password rules checks
  const hasMinLength = newPassword.length >= 6;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      setError('Mật khẩu mới không đạt yêu cầu tối thiểu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await resetPassword(email, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      alert('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-gray-50 font-sans">
      {/* FORM SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white py-12">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600">apartment</span>
            </div>
            <span className="text-xl font-bold">RoomHub</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-500 mb-8">
            Nhập mật khẩu mới cho tài khoản <span className="font-semibold text-gray-700">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-150 rounded-lg">
                {error}
              </div>
            )}

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password checklist */}
              <div className="text-sm mt-2 space-y-1">
                <p className={hasMinLength ? 'text-green-500' : 'text-gray-400'}>
                  • Ít nhất 6 ký tự
                </p>
                <p className={hasNumber ? 'text-green-500' : 'text-gray-400'}>
                  • Chứa ít nhất 1 số
                </p>
                <p className={hasUppercase ? 'text-green-500' : 'text-gray-400'}>
                  • Chứa chữ in hoa
                </p>
              </div>
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition flex items-center justify-center disabled:bg-orange-300"
            >
              {isSubmitting ? 'Đang đổi mật khẩu...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE GRAPHIC */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-250">
        <img
          src="/images/login/login2.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          alt="RoomHub Reset Password"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
