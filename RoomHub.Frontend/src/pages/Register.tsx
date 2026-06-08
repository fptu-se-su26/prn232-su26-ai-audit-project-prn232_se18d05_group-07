import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const { register, checkEmailExists } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Tenant' | 'PropertyOwner' | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Eye toggle state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation & existence check state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailChecked, setIsEmailChecked] = useState(true);

  // Validation / submitting state
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password checklist conditions
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const validateEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(null);
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError('Email không hợp lệ.');
      setIsEmailChecked(false);
      return;
    }

    try {
      const exists = await checkEmailExists(trimmedEmail);
      if (exists) {
        setEmailError('Email này đã được sử dụng.');
        setIsEmailChecked(false);
      } else {
        setEmailError(null);
        setIsEmailChecked(true);
      }
    } catch (err) {
      console.error(err);
      setIsEmailChecked(true); // default to true to let form submit try
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setFormError('Vui lòng chọn vai trò (Khách thuê hoặc Chủ nhà).');
      return;
    }

    if (!fullName) {
      setFormError('Vui lòng nhập họ và tên.');
      return;
    }

    if (!validateEmail(email)) {
      setFormError('Email không hợp lệ.');
      return;
    }

    if (!isEmailChecked || emailError) {
      setFormError('Email này đã được sử dụng hoặc không hợp lệ.');
      return;
    }

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      setFormError('Mật khẩu không thỏa mãn các yêu cầu tối thiểu.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Xác nhận mật khẩu không khớp.');
      return;
    }

    if (!agreeTerms) {
      setFormError('Bạn phải đồng ý với Điều khoản sử dụng.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    const result = await register(email, password, fullName, role);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/verify-otp', { state: { message: result.message } });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col lg:flex-row font-sans">
      {/* LEFT FORM */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 bg-white">
        {/* LOGO */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500">apartment</span>
            </div>
            <span className="text-xl font-bold">RoomHub</span>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-250 hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại trang chủ
          </button>
        </div>

        {/* MAIN REGISTER CARD */}
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
          <p className="text-gray-500 mb-6">Chọn vai trò và bắt đầu hành trình của bạn.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-150 rounded-lg">
                {formError}
              </div>
            )}

            {/* ROLE CARDS */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tenant role card */}
              <div className="relative">
                <input
                  id="tenantRole"
                  type="radio"
                  name="Role"
                  value="Tenant"
                  checked={role === 'Tenant'}
                  onChange={() => setRole('Tenant')}
                  className="peer sr-only"
                  required
                />
                <label
                  htmlFor="tenantRole"
                  className="cursor-pointer border border-gray-250 rounded-xl p-4 text-center block h-full peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50 transition-all"
                >
                  <span
                    className={`material-symbols-outlined block mb-2 transition-colors ${
                      role === 'Tenant' ? 'text-orange-500 icon-fill' : 'text-gray-400'
                    }`}
                  >
                    person
                  </span>
                  Khách thuê
                </label>
              </div>

              {/* Owner role card */}
              <div className="relative">
                <input
                  id="ownerRole"
                  type="radio"
                  name="Role"
                  value="PropertyOwner"
                  checked={role === 'PropertyOwner'}
                  onChange={() => setRole('PropertyOwner')}
                  className="peer sr-only"
                />
                <label
                  htmlFor="ownerRole"
                  className="cursor-pointer border border-gray-250 rounded-xl p-4 text-center block h-full peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-gray-50 transition-all"
                >
                  <span
                    className={`material-symbols-outlined block mb-2 transition-colors ${
                      role === 'PropertyOwner' ? 'text-orange-500 icon-fill' : 'text-gray-400'
                    }`}
                  >
                    domain
                  </span>
                  Chủ nhà
                </label>
              </div>
            </div>

            {/* FULLNAME */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập email của bạn"
              />
              {emailError && <span className="text-red-500 text-sm mt-1 block">{emailError}</span>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập mật khẩu"
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

              {/* Validation Rules Checklist */}
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập lại mật khẩu"
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

            {/* TERMS CHECKBOX */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                Tôi đồng ý với Điều khoản sử dụng
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition disabled:bg-orange-300"
            >
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            </button>
          </form>
        </div>

        {/* LOGIN NAVIGATION */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="text-orange-500 hover:underline font-medium"
            >
              Đăng nhập
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <img
          src="/images/register/register1.png"
          className="absolute inset-0 w-full h-full object-cover"
          alt="RoomHub Register View"
        />
      </div>
    </div>
  );
};

export default Register;
