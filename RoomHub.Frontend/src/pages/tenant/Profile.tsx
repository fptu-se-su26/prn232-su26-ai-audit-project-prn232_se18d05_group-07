import React, { useEffect, useState } from 'react';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  isVerified: boolean;
  createdAt: string;
}

type Banner = { type: 'success' | 'error'; text: string } | null;

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'info' | 'kyc' | 'password'>('info');

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Info form state
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoBanner, setInfoBanner] = useState<Banner>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwdBanner, setPwdBanner] = useState<Banner>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<ProfileData>('/profile/me');
        if (!active) return;
        setProfile(data);
        setFullNameInput(data.fullName ?? '');
        setPhoneInput(data.phoneNumber ?? '');
        setDobInput(data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '');
        setAddressInput(data.address ?? '');
      } catch {
        if (active) setInfoBanner({ type: 'error', text: 'Không tải được hồ sơ. Vui lòng thử lại.' });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fullName = profile?.fullName || user?.fullName || 'Nguyễn Văn Khách';
  const email = profile?.email || user?.email || 'tenant@roomhub.vn';
  const initials = fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

  const tabs = [
    { key: 'info' as const, label: 'Thông tin', icon: 'badge' },
    { key: 'kyc' as const, label: 'Xác minh danh tính', icon: 'verified_user' },
    { key: 'password' as const, label: 'Đổi mật khẩu', icon: 'lock' },
  ];

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim()) {
      setInfoBanner({ type: 'error', text: 'Họ tên không được để trống.' });
      return;
    }
    setSavingInfo(true);
    setInfoBanner(null);
    try {
      await api.put('/profile', {
        fullName: fullNameInput.trim(),
        phoneNumber: phoneInput || null,
        dateOfBirth: dobInput || null,
        address: addressInput || null,
        // Preserve fields not exposed by this form so they are not wiped.
        gender: profile?.gender ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              fullName: fullNameInput.trim(),
              phoneNumber: phoneInput || null,
              dateOfBirth: dobInput || null,
              address: addressInput || null,
            }
          : prev,
      );
      setInfoBanner({ type: 'success', text: 'Đã lưu thông tin hồ sơ.' });
    } catch (err: any) {
      setInfoBanner({ type: 'error', text: err?.response?.data?.message || 'Cập nhật hồ sơ thất bại.' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdBanner({ type: 'error', text: 'Vui lòng nhập đầy đủ các trường.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdBanner({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }
    setSavingPassword(true);
    setPwdBanner(null);
    try {
      await api.post('/profile/change-password', { currentPassword, newPassword });
      setPwdBanner({ type: 'success', text: 'Đổi mật khẩu thành công.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdBanner({ type: 'error', text: err?.response?.data?.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all';

  const renderBanner = (banner: Banner) =>
    banner && (
      <div
        className={`sm:col-span-2 text-sm rounded-xl px-4 py-2.5 font-semibold ${
          banner.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-100'
            : 'bg-red-50 text-red-600 border border-red-100'
        }`}
      >
        {banner.text}
      </div>
    );

  return (
    <div className="space-y-6">
      <ParallaxHero
        image="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80"
        heightClass="min-h-[180px]"
      >
        <div className="h-full flex items-end p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white text-primary-container flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white">{initials}</div>
            <div>
              <h2 className="text-white text-2xl font-bold">{fullName}</h2>
              <p className="text-white/85 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">mail</span> {email}
                {profile?.isVerified ? (
                  <span className="ml-2 text-[11px] font-bold bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded-full">Đã xác minh</span>
                ) : (
                  <span className="ml-2 text-[11px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">Chưa xác minh</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </ParallaxHero>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === t.key ? 'bg-primary-container text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-100 hover:text-primary-container'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <Reveal>
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 md:p-8">
          {tab === 'info' && (
            <form className="grid sm:grid-cols-2 gap-5" onSubmit={handleSaveInfo}>
              {renderBanner(infoBanner)}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Email</label>
                <input type="email" value={email} disabled readOnly className={`${inputClass} text-gray-400 cursor-not-allowed`} />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Số điện thoại</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  disabled={loading}
                  placeholder="0905 123 456"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Ngày sinh</label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Địa chỉ thường trú</label>
                <input
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  disabled={loading}
                  placeholder="Đà Nẵng"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingInfo || loading}
                  className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-60"
                >
                  {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}

          {tab === 'kyc' && (
            <div className="max-w-2xl">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
                <span className="material-symbols-outlined text-amber-500">info</span>
                <p className="text-sm text-amber-800">Xác minh danh tính (CCCD) giúp chủ trọ tin tưởng và đẩy nhanh quá trình duyệt hợp đồng thuê.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Số CCCD</label>
                  <input placeholder="0123 4567 8910" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Ngày cấp</label>
                  <input type="date" className={inputClass} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {['Ảnh mặt trước CCCD', 'Ảnh chân dung (selfie)'].map((l) => (
                  <button key={l} onClick={() => alert('Tải ảnh (demo)')} className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-container hover:text-primary-container transition-all">
                    <span className="material-symbols-outlined text-[36px]">upload_file</span>
                    <span className="text-xs font-semibold mt-1">{l}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => alert('Đã gửi yêu cầu xác minh (demo)')} className="mt-6 px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95">Gửi xác minh</button>
            </div>
          )}

          {tab === 'password' && (
            <form className="max-w-md space-y-4" onSubmit={handleChangePassword}>
              {pwdBanner && (
                <div
                  className={`text-sm rounded-xl px-4 py-2.5 font-semibold ${
                    pwdBanner.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}
                >
                  {pwdBanner.text}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Mật khẩu hiện tại</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Mật khẩu mới</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Xác nhận mật khẩu mới</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-60"
              >
                {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
};

export default TenantProfile;
