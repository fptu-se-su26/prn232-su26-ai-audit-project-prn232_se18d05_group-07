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

interface SubscriptionStatus {
  plan: string;
  expiryDate?: string;
  buildingsUsed: number;
  buildingsLimit: number;
  roomsUsed: number;
  roomsLimit: number;
  aiAuditsUsed: number;
  aiAuditsLimit: number;
  status: string;
}

interface UpgradeResult {
  success: boolean;
  subscriptionId: number;
  amount: number;
  qrCodeUrl?: string;
  paymentUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  message: string;
}

const ProfileAndSubscription: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  
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

  // Subscription state
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  
  // Upgrade Modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [paymentMethod, setPaymentMethod] = useState<'VietQR' | 'Manual'>('VietQR');
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [upgradeResult, setUpgradeResult] = useState<UpgradeResult | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulateSuccess, setSimulateSuccess] = useState<string | null>(null);

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

  const fetchSubscriptionStatus = async () => {
    try {
      setSubLoading(true);
      const res = await api.get('/owner/subscription/status');
      setSubStatus(res.data);
      setSubError(null);
    } catch (err: any) {
      console.error(err);
      setSubError('Không thể tải thông tin gói cước.');
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSubscriptionStatus();
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

  const handleSubscribe = async () => {
    setUpgradeLoading(true);
    setUpgradeResult(null);
    try {
      const res = await api.post('/owner/subscription/subscribe', {
        planType: selectedPlanType,
        paymentMethod,
        proofImageUrl: paymentMethod === 'Manual' ? proofUrl : null,
        note,
      });
      setUpgradeResult(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu nâng cấp.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleSimulatePayment = async (memo: string) => {
    setSimulating(true);
    setSimulateSuccess(null);
    try {
      const res = await api.post('/subscription/simulate-webhook', { memo });
      if (res.data.success) {
        setSimulateSuccess(res.data.message);
        // Refresh status
        fetchSubscriptionStatus();
        setTimeout(() => {
          setIsUpgradeModalOpen(false);
          setUpgradeResult(null);
          setSimulateSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể giả lập thanh toán.');
    } finally {
      setSimulating(false);
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: '0đ',
      period: 'mãi mãi',
      desc: 'Phù hợp cho chủ nhà nhỏ lẻ, quản lý khu trọ mini dưới 3 phòng.',
      perks: ['Tối đa 1 tòa nhà/tài sản', 'Tối đa 3 phòng trọ', 'Tối đa 3 lượt AI Audit/tháng', 'Tính tiền & quản lý hóa đơn cơ bản'],
      color: 'border-gray-200 bg-white text-gray-500',
      popular: false,
    },
    {
      name: 'Pro',
      price: selectedPlanType === 'Monthly' ? '199.000đ' : '1.990.000đ',
      period: selectedPlanType === 'Monthly' ? 'tháng' : 'năm (tiết kiệm 20%)',
      desc: 'Gói tối ưu nhất cho các chủ trọ chuyên nghiệp, chung cư mini homestay.',
      perks: [
        'Tối đa 3 tòa nhà/tài sản',
        'Tối đa 30 phòng trọ',
        'Không giới hạn lượt AI Audit tin đăng',
        'Tặng 5 lượt đẩy tin nổi bật/tháng',
        'Xuất hóa đơn & báo cáo ra Excel/PDF',
        'Gửi email thông báo tự động cho người thuê',
      ],
      color: 'border-orange-500 bg-gradient-to-br from-orange-50/50 to-white relative shadow-md shadow-orange-100',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: selectedPlanType === 'Monthly' ? '499.000đ' : '4.990.000đ',
      period: selectedPlanType === 'Monthly' ? 'tháng' : 'năm (tiết kiệm 20%)',
      desc: 'Giải pháp quản lý chuỗi phòng trọ, căn hộ dịch vụ quy mô lớn.',
      perks: [
        'Không giới hạn tòa nhà',
        'Không giới hạn số phòng trọ',
        'Không giới hạn AI Audit tin đăng',
        'Tặng 20 lượt đẩy tin + Huy hiệu Verified',
        'Báo cáo phân tích dòng tiền chuyên sâu',
        'Tài khoản phụ cho nhân viên quản lý',
        'Hỗ trợ Zalo Group & hotline riêng 24/7',
      ],
      color: 'border-gray-800 bg-gray-900 text-white',
      popular: false,
    },
  ];

  const getLimitPercent = (used: number, limit: number) => {
    if (limit === 2147483647 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-primary-container shadow-sm'
              : 'text-gray-500 hover:text-primary-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span> Hồ sơ cá nhân
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-white text-primary-container shadow-sm'
              : 'text-gray-500 hover:text-primary-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">workspace_premium</span> Gói cước & Hạn mức
        </button>
      </div>

      {/* Tab 1: Profile View */}
      {activeTab === 'profile' && (
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
                  <div className="grid sm:grid-cols-2 gap-5">
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

                  <div className="grid sm:grid-cols-3 gap-5">
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

                  <div className="grid sm:grid-cols-3 gap-5">
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
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu cũ</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                    />
                  </div>
                  <div>
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
      )}

      {/* Tab 2: Subscription & Limits */}
      {activeTab === 'subscription' && (
        <div className="space-y-8">
          {subError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-100">
              {subError}
            </div>
          )}
          {subLoading && !subStatus ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs font-bold text-gray-500 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-orange-100 border-t-orange-500 animate-spin"></div>
              <span>Đang tải thông tin gói cước...</span>
            </div>
          ) : (
            <>
              {/* Active plan summary and limits progress */}
              <Reveal>
            <div className="bg-white rounded-3xl border border-gray-100 soft-shadow p-6 md:p-8 grid md:grid-cols-3 gap-6 items-center">
              {/* Plan Badge Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] uppercase font-bold tracking-widest text-orange-100">Gói đang sử dụng</p>
                    <h2 className="text-2xl font-black mt-1">{subStatus?.plan || 'Starter (Free)'}</h2>
                  </div>
                  <span className="material-symbols-outlined text-[32px] text-orange-200">workspace_premium</span>
                </div>
                <div className="mt-8 border-t border-orange-400/30 pt-4 flex justify-between items-center text-xs font-bold">
                  <span>Trạng thái:</span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {subStatus?.status === 'Free' ? 'Miễn phí' : 'Hoạt động'}
                  </span>
                </div>
                {subStatus?.expiryDate && (
                  <p className="text-[10px] text-orange-100 mt-2 text-right">Hết hạn: {subStatus.expiryDate}</p>
                )}
              </div>

              {/* Limits progress */}
              <div className="md:col-span-2 grid sm:grid-cols-3 gap-6">
                {/* Building usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-blue-500">corporate_fare</span> Tòa nhà</span>
                    <span className="text-on-surface">{subStatus?.buildingsUsed}/{subStatus?.buildingsLimit === 2147483647 ? '∞' : subStatus?.buildingsLimit}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${getLimitPercent(subStatus?.buildingsUsed || 0, subStatus?.buildingsLimit || 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400">Giới hạn số lượng tòa nhà quản lý</p>
                </div>

                {/* Rooms usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-green-500">meeting_room</span> Phòng/Căn</span>
                    <span className="text-on-surface">{subStatus?.roomsUsed}/{subStatus?.roomsLimit === 2147483647 ? '∞' : subStatus?.roomsLimit}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${getLimitPercent(subStatus?.roomsUsed || 0, subStatus?.roomsLimit || 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400">Giới hạn tổng số lượng phòng trọ</p>
                </div>

                {/* AI Audits usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-purple-500">neurology</span> AI Audits</span>
                    <span className="text-on-surface">{subStatus?.aiAuditsUsed}/{subStatus?.aiAuditsLimit === 2147483647 ? '∞' : subStatus?.aiAuditsLimit}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${getLimitPercent(subStatus?.aiAuditsUsed || 0, subStatus?.aiAuditsLimit || 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400">Lượt AI duyệt tin dùng trong tháng</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Plan Comparison Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-on-surface">Bảng so sánh các gói cước</h3>
                <p className="text-xs text-gray-500">Chọn gói dịch vụ phù hợp nhất với quy mô kinh doanh của bạn.</p>
              </div>
              
              {/* Billing Cycle Switcher */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setSelectedPlanType('Monthly')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPlanType === 'Monthly' ? 'bg-white text-on-surface shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Thanh toán Tháng
                </button>
                <button
                  onClick={() => setSelectedPlanType('Yearly')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedPlanType === 'Yearly' ? 'bg-white text-on-surface shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Thanh toán Năm (-20%)
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((p, i) => (
                <Reveal key={p.name} delay={i * 80}>
                  <div className={`rounded-3xl border-2 p-6 h-full flex flex-col justify-between transition-all hover:scale-[1.01] ${p.color}`}>
                    <div>
                      {/* Popular tag */}
                      {p.popular && (
                        <span className="absolute -top-3 right-6 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-orange-500/25">
                          Khuyên dùng
                        </span>
                      )}
                      
                      <div className="flex justify-between items-baseline mb-4">
                        <h4 className="text-lg font-black">{p.name}</h4>
                        <div className="text-right">
                          <span className="text-2xl font-black">{p.price}</span>
                          <span className="text-[10px] text-gray-500 block">/ {p.period}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">{p.desc}</p>

                      <ul className="space-y-3 mb-8">
                        {p.perks.map((perk) => (
                          <li key={perk} className="text-xs flex items-start gap-2">
                            <span className={`material-symbols-outlined text-[16px] shrink-0 ${p.name === 'Enterprise' ? 'text-orange-400' : 'text-green-500'}`}>
                              check_circle
                            </span>
                            <span className={p.name === 'Enterprise' ? 'text-gray-200' : 'text-gray-700'}>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      {p.name === 'Starter' ? (
                        <button
                          disabled
                          className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed"
                        >
                          Mặc định miễn phí
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (p.name === 'Enterprise') {
                              alert('Gói Enterprise vui lòng liên hệ hotline/Zalo của RoomHub để ký hợp đồng và tích hợp cấu hình riêng.');
                            } else {
                              setIsUpgradeModalOpen(true);
                            }
                          }}
                          className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
                            p.name === 'Enterprise'
                              ? 'bg-white text-gray-900 hover:bg-gray-100'
                              : 'bg-primary-container hover:bg-orange-600 text-white shadow-orange-500/10'
                          }`}
                        >
                          Nâng cấp lên {p.name}
                        </button>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* Upgrade Checkout Dialog Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 md:p-8 soft-shadow relative animate-scale-up border border-gray-100 overflow-y-auto max-h-[90vh]">
            
            {/* Close button */}
            <button
              onClick={() => {
                setIsUpgradeModalOpen(false);
                setUpgradeResult(null);
              }}
              className="absolute right-5 top-5 text-gray-400 hover:text-on-surface cursor-pointer outline-none"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            {!upgradeResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">shopping_cart</span> Nâng cấp gói cước dịch vụ
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Hoàn tất biểu mẫu để chuyển đổi gói dịch vụ sang gói Pro.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Upgrade configuration */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Gói nâng cấp</label>
                      <input
                        type="text"
                        disabled
                        value="Pro (Tính năng chuyên nghiệp)"
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Chu kỳ thanh toán</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanType('Monthly')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            selectedPlanType === 'Monthly'
                              ? 'border-orange-500 bg-orange-50 text-primary-container'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Gói Tháng (199k)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPlanType('Yearly')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            selectedPlanType === 'Yearly'
                              ? 'border-orange-500 bg-orange-50 text-primary-container'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Gói Năm (1.99M)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phương thức thanh toán</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('VietQR')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            paymentMethod === 'VietQR'
                              ? 'border-orange-500 bg-orange-50 text-primary-container'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Quét mã VietQR (Tự động)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Manual')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            paymentMethod === 'Manual'
                              ? 'border-orange-500 bg-orange-50 text-primary-container'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Chuyển khoản thủ công
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual proof input or details summary */}
                  <div className="space-y-4">
                    {paymentMethod === 'Manual' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                          Đường dẫn ảnh chuyển khoản (Proof URL)
                        </label>
                        <input
                          type="text"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="Dán link ảnh screenshot hóa đơn tại đây..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all"
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Tải ảnh hóa đơn lên Imgur hoặc cloud và dán liên kết vào đây để Admin duyệt nhanh nhất.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 h-full flex flex-col justify-center text-center">
                        <span className="material-symbols-outlined text-[36px] text-primary-container mb-2">qr_code_scanner</span>
                        <h4 className="text-xs font-bold text-on-surface">Thanh toán quét mã QR cực tiện lợi</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                          Hệ thống sẽ sinh mã VietQR ngân hàng. Chỉ cần mở ví hoặc app ngân hàng để quét mà không cần điền tay số tiền và nội dung. Gói kích hoạt tự động sau khi chuyển khoản.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ghi chú (Tùy chọn)</label>
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ví dụ: Nâng cấp gói cước cho tài khoản..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-primary-container transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={upgradeLoading}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {upgradeLoading ? 'Đang kết nối...' : 'Tiến hành Thanh toán'}
                  </button>
                </div>
              </div>
            ) : (
              // Payment detail / QR display screen
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="text-lg font-black text-on-surface">Chi tiết thanh toán nạp tiền</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Hóa đơn nâng cấp gói cước của bạn trị giá{' '}
                    <span className="font-bold text-primary-container">{(selectedPlanType === 'Monthly' ? 199000 : 1990000).toLocaleString('vi-VN')}đ</span>
                  </p>
                </div>

                {upgradeResult.qrCodeUrl ? (
                  // VietQR QR Code Display
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-md">
                      <img
                        src={upgradeResult.qrCodeUrl}
                        alt="Mã VietQR Thanh toán"
                        className="w-56 h-56 object-contain"
                      />
                    </div>

                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 text-left text-xs text-gray-700 max-w-md w-full space-y-1">
                      <p><strong>Nội dung:</strong> <code className="bg-orange-100/60 px-1.5 py-0.5 rounded text-primary-container font-mono font-bold">ROOMHUB_SUB_{upgradeResult.subscriptionId}</code></p>
                      <p><strong>Ngân hàng:</strong> Ngân hàng Quân Đội (MB Bank)</p>
                      <p><strong>Số tài khoản:</strong> 0987654321</p>
                      <p><strong>Chủ tài khoản:</strong> CONG TY ROOMHUB</p>
                    </div>

                    {simulateSuccess && (
                      <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 max-w-md w-full flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px] animate-bounce">check_circle</span> {simulateSuccess}
                      </div>
                    )}

                    {/* Simulation sandbox button */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-3">
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment(`ROOMHUB_SUB_${upgradeResult.subscriptionId}`)}
                        disabled={simulating}
                        className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">integration_instructions</span>
                        {simulating ? 'Đang giả lập...' : 'Giả lập Thanh toán (Sandbox)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUpgradeModalOpen(false);
                          setUpgradeResult(null);
                          fetchSubscriptionStatus();
                        }}
                        className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Đóng và kiểm tra sau
                      </button>
                    </div>
                  </div>
                ) : (
                  // Manual transfer details
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px]">account_balance</span>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-left text-xs text-gray-700 w-full max-w-md space-y-2">
                      <p className="flex justify-between"><span>Ngân hàng:</span> <strong className="text-on-surface">{upgradeResult.bankName}</strong></p>
                      <p className="flex justify-between"><span>Số tài khoản:</span> <strong className="text-on-surface font-mono">{upgradeResult.bankAccountNumber}</strong></p>
                      <p className="flex justify-between"><span>Chủ tài khoản:</span> <strong className="text-on-surface">{upgradeResult.bankAccountName}</strong></p>
                      <p className="flex justify-between"><span>Số tiền chuyển:</span> <strong className="text-primary-container font-mono">{upgradeResult.amount.toLocaleString('vi-VN')}đ</strong></p>
                      <p className="flex justify-between"><span>Nội dung chuyển:</span> <strong className="text-on-surface bg-gray-200 px-1 rounded font-mono">ROOMHUB_SUB_{upgradeResult.subscriptionId}</strong></p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                      Yêu cầu nâng cấp gói cước ở trạng thái <strong>Chờ duyệt (Pending)</strong>. Quản trị viên của RoomHub sẽ xác thực chuyển khoản và phê duyệt tài khoản của bạn trong thời gian sớm nhất.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUpgradeModalOpen(false);
                        setUpgradeResult(null);
                        fetchSubscriptionStatus();
                      }}
                      className="w-full max-w-md py-3 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Hoàn thành
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAndSubscription;
