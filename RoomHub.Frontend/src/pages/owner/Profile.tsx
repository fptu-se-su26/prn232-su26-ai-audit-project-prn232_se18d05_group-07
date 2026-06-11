import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified: boolean;
  createdAt: string;
}

const Profile: React.FC = () => {
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('Khác');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get('/profile/me');
      setProfile(res.data);
      setFullName(res.data.fullName || '');
      setPhoneNumber(res.data.phoneNumber || '');
      setAddress(res.data.address || '');
      setGender(res.data.gender || 'Khác');
      if (res.data.dateOfBirth) {
        setDateOfBirth(res.data.dateOfBirth.split('T')[0]);
      }
      setProfileError(null);
    } catch (err: any) {
      console.error(err);
      setProfileError('Không thể tải thông tin hồ sơ của bạn.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    
    if (!fullName.trim()) {
      setProfileError('Họ và tên không được để trống.');
      return;
    }

    try {
      setProfileLoading(true);
      await api.put('/profile', {
        fullName,
        phoneNumber,
        address,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
      });
      setProfileSuccess('Cập nhật hồ sơ cá nhân thành công!');
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);

    if (!currentPassword) {
      setPwdError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setPwdLoading(true);
      await api.post('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setPwdError(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title block */}
      <div>
        <h2 className="text-xl font-bold text-on-surface">Hồ sơ cá nhân</h2>
        <p className="text-xs text-gray-500 mt-1">Cập nhật thông tin tài khoản và mật khẩu của bạn.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main profile form */}
        <div className="md:col-span-2">
          <Reveal>
            <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-6 md:p-8">
              <h3 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">badge</span> Thông tin tài khoản
              </h3>

              {profileSuccess && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                  <span className="material-symbols-outlined text-[18px]">error</span> {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0905xxxxxx"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 text-left">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email (Không thể sửa)</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Giới tính</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ngày sinh</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Địa chỉ liên hệ</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, Tên đường, Quận, Đà Nẵng"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>

        {/* Change password column */}
        <div>
          <Reveal delay={100}>
            <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-6">
              <h3 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">lock</span> Đổi mật khẩu
              </h3>

              {pwdSuccess && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-green-100">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span> {pwdSuccess}
                </div>
              )}
              {pwdError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-red-100">
                  <span className="material-symbols-outlined text-[18px]">error</span> {pwdError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {pwdLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default Profile;
