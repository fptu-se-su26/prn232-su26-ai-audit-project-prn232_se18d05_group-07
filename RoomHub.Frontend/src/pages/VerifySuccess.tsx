import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerifySuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 font-sans p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center flex flex-col items-center">
        {/* CHECKMARK ICON */}
        <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-6 animate-bounce">
          <span className="material-symbols-outlined text-green-500 text-5xl font-light">
            check_circle
          </span>
        </div>

        {/* HEADING */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Xác thực thành công!</h1>

        {/* MESSAGE */}
        <p className="text-gray-500 leading-relaxed mb-8">
          Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Bạn đã có thể đăng nhập và trải nghiệm đầy đủ tính năng của RoomHub.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-semibold transition shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};

export default VerifySuccess;
