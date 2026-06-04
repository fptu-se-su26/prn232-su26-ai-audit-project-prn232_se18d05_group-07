import React, { useState } from 'react';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';
import { useAuth } from '../../hooks/useAuth';

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'info' | 'kyc' | 'password'>('info');

  const fullName = user?.fullName || 'Nguyễn Văn Khách';
  const email = user?.email || 'tenant@roomhub.vn';
  const initials = fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase();

  const tabs = [
    { key: 'info' as const, label: 'Thông tin', icon: 'badge' },
    { key: 'kyc' as const, label: 'Xác minh danh tính', icon: 'verified_user' },
    { key: 'password' as const, label: 'Đổi mật khẩu', icon: 'lock' },
  ];

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
                <span className="ml-2 text-[11px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">Chưa xác minh</span>
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
            <form className="grid sm:grid-cols-2 gap-5" onSubmit={(e) => { e.preventDefault(); alert('Đã lưu thông tin (demo)'); }}>
              {[
                { label: 'Họ và tên', value: fullName, type: 'text' },
                { label: 'Email', value: email, type: 'email' },
                { label: 'Số điện thoại', value: '0905 123 456', type: 'tel' },
                { label: 'Ngày sinh', value: '1999-05-20', type: 'date' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">{f.label}</label>
                  <input type={f.type} defaultValue={f.value} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Địa chỉ thường trú</label>
                <input defaultValue="Đà Nẵng" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95">Lưu thay đổi</button>
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
                  <input placeholder="0123 4567 8910" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Ngày cấp</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
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
            <form className="max-w-md space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Đã đổi mật khẩu (demo)'); }}>
              {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map((l) => (
                <div key={l}>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">{l}</label>
                  <input type="password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container focus:bg-white transition-all" />
                </div>
              ))}
              <button type="submit" className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors active:scale-95">Cập nhật mật khẩu</button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
};

export default TenantProfile;
