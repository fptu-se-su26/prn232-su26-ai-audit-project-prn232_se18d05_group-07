import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyResetOtp: React.FC = () => {
  const { verifyResetOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend OTP state
  const [resendBtnText, setResendBtnText] = useState('Gửi lại mã');
  const [resendMsg, setResendMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      // If no reset email, go back to forgot-password
      navigate('/forgot-password');
    }
  }, [navigate]);

  // Handle cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    setResendBtnText(`Gửi lại sau ${cooldown}s`);
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (cooldown === 0) {
      setResendBtnText('Gửi lại mã');
    }
  }, [cooldown]);

  const handleChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const newOtpValues = [...otpValues];
    newOtpValues[index] = numericValue.substring(numericValue.length - 1); // Only take last digit
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtpValues(digits);
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số của mã OTP.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await verifyResetOtp(email, code);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/reset-password');
    } else {
      setError(result.message);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setResendBtnText('Đang gửi...');
    setResendMsg(null);

    const result = await resendOtp(email);
    if (result.success) {
      setResendMsg({ text: result.message, isError: false });
      setCooldown(60);
    } else {
      setResendMsg({ text: result.message, isError: true });
      setResendBtnText('Gửi lại mã');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex font-sans bg-gray-50">
      {/* LEFT FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-12 bg-white relative">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center pb-20 mt-16">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">Xác thực mã đặt lại</h1>
            <p className="text-gray-500 leading-relaxed">
              Chúng tôi đã gửi mã xác thực 6 số dùng để đặt lại mật khẩu đến <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center">
                <span className="material-symbols-outlined mr-2">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* 6 OTP Inputs */}
            <div className="flex justify-between gap-2 sm:gap-4">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    if (el) inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="otp w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition shadow-sm"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-orange-500 text-white rounded-xl text-lg font-semibold hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition shadow-lg shadow-orange-500/30 disabled:bg-orange-300"
            >
              {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
          </form>

          {/* RESEND BLOCK */}
          <div className="mt-8 text-center text-sm text-gray-500 flex flex-col items-center">
            <div>
              Chưa nhận được mã?{' '}
              <a
                href="#resend"
                onClick={handleResend}
                className={`ml-1 font-semibold transition-all ${
                  cooldown > 0
                    ? 'text-gray-400 cursor-not-allowed pointer-events-none'
                    : 'text-orange-500 hover:text-orange-600 hover:underline'
                }`}
              >
                {resendBtnText}
              </a>
            </div>
            {resendMsg && (
              <span
                className={`text-sm mt-3 font-medium ${
                  resendMsg.isError ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {resendMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/images/otp/otp1.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          alt="RoomHub Reset OTP"
        />
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute bottom-20 left-16 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Securing your account...</h2>
          <p className="text-lg text-white/80">Protecting your property journey with RoomHub.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
