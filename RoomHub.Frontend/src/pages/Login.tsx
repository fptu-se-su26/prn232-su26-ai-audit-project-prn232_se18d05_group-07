import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slider State
  const [sliderIndex, setSliderIndex] = useState(0);
  const [sliderOpacity, setSliderOpacity] = useState(1);

  const images = [
    '/images/login/login1.jpg',
    '/images/login/login2.jpg',
    '/images/login/login3.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSliderOpacity(0);
      setTimeout(() => {
        setSliderIndex((prevIndex) => (prevIndex + 1) % images.length);
        setSliderOpacity(1);
      }, 500);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/browse');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-gray-100 font-sans">
      {/* LEFT SIDE FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white py-12">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600">apartment</span>
          </div>
          <span className="text-xl font-bold">RoomHub</span>
        </div>

        {/* LOGIN FORM */}
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-500 mb-8">Đăng nhập vào tài khoản của bạn</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-150 rounded-lg">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập mật khẩu của bạn"
                  required
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
            </div>

            {/* REMEMBER & FORGOT */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                Ghi nhớ đăng nhập
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition flex items-center justify-center disabled:bg-orange-300"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">Hoặc</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* SOCIAL LOGINS */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => alert('Đăng nhập bằng Google sẽ sớm được hỗ trợ!')}
                className="w-full h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition bg-white"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                <span className="text-sm font-medium text-gray-700">Đăng nhập với Google</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Đăng nhập bằng Facebook sẽ sớm được hỗ trợ!')}
                className="w-full h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition bg-white"
              >
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  className="w-5 h-5"
                  alt="Facebook"
                />
                <span className="text-sm font-medium text-gray-700">Đăng nhập với Facebook</span>
              </button>

              {/* REGISTER NAVIGATION */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <a
                    href="#register"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/register');
                    }}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Đăng ký
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE SLIDER */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-200">
        <img
          src={images[sliderIndex]}
          style={{ opacity: sliderOpacity, transition: 'opacity 0.5s ease-in-out' }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="RoomHub Slider"
        />
      </div>
    </div>
  );
};

export default Login;
