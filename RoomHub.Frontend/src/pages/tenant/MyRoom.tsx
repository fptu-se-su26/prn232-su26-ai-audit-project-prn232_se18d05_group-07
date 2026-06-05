import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

interface RoomData {
  roomId: number;
  roomNumber: string;
  buildingName: string;
  buildingAddress: string;
  roomType: string;
  surfaceArea: number;
  maxCapacity: number;
  isFurnished: boolean;
  electricityPrice: number;
  waterPrice: number;
  internetPrice: number;
  garbagePrice: number;
  rentAmount: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAvatar?: string;
  roomImage?: string;
}

const TenantMyRoom: React.FC<Props> = ({ setCurrentPage }) => {
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tenant/room');
      setRoomData(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setRoomData(null);
      } else {
        setError(err.response?.data?.message || 'Không thể tải thông tin phòng của bạn.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải thông tin phòng của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3 max-w-md mx-auto mt-12 shadow-sm">
        <span className="material-symbols-outlined text-[36px] text-red-500 block">error</span>
        <h3 className="text-sm font-bold">{error}</h3>
        <button onClick={fetchRoom} className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          Thử lại
        </button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow min-h-[350px] flex flex-col items-center justify-center text-center max-w-xl mx-auto my-12 animate-fadeIn">
        <span className="material-symbols-outlined text-[64px] text-primary-container mb-4">apartment</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Bạn chưa được gán vào phòng nào</h2>
        <p className="text-gray-500 max-w-md text-xs font-semibold leading-relaxed">
          Hiện tại tài khoản của bạn chưa được gán vào phòng trọ cụ thể nào trên hệ thống RoomHub. Vui lòng liên hệ với chủ trọ để thực hiện thêm và liên kết hợp đồng thông qua Email hoặc Số điện thoại của tài khoản này.
        </p>
      </div>
    );
  }

  const roomFacts = [
    { icon: 'straighten', label: 'Diện tích', value: `${roomData.surfaceArea} m²` },
    { icon: 'group', label: 'Sức chứa', value: `${roomData.maxCapacity} người` },
    { icon: 'bed', label: 'Loại phòng', value: roomData.roomType },
    { icon: 'chair', label: 'Nội thất', value: roomData.isFurnished ? 'Đầy đủ' : 'Cơ bản' },
  ];

  const roomUtilities = [
    { icon: 'bolt', label: 'Điện', value: `${formatPrice(roomData.electricityPrice)} / kWh`, color: 'text-amber-500' },
    { icon: 'water_drop', label: 'Nước', value: `${formatPrice(roomData.waterPrice)} / m³`, color: 'text-blue-500' },
    { icon: 'wifi', label: 'Internet', value: `${formatPrice(roomData.internetPrice)} / tháng`, color: 'text-indigo-500' },
    { icon: 'delete', label: 'Rác', value: `${formatPrice(roomData.garbagePrice)} / tháng`, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-orange-50 border-orange-200 text-orange-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'warning'}
          </span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      <ParallaxHero
        image={roomData.roomImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"}
        heightClass="min-h-[260px]"
      >
        <div className="p-8 h-full flex flex-col justify-end">
          <span className="text-[11px] font-bold text-white bg-green-500 px-2.5 py-1 rounded-full w-fit mb-3">● Đang ở</span>
          <h2 className="text-white text-2xl md:text-3xl font-bold">Phòng {roomData.roomNumber} — {roomData.buildingName}</h2>
          <p className="text-white/85 text-sm flex items-center gap-1 mt-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">location_on</span> {roomData.buildingAddress}
          </p>
        </div>
      </ParallaxHero>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4">Thông tin phòng</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roomFacts.map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-primary-container mb-1">{f.icon}</span>
                    <p className="text-xs font-bold text-on-surface truncate">{f.value}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">bolt</span> Đơn giá dịch vụ
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {roomUtilities.map((u) => (
                  <div key={u.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <span className={`material-symbols-outlined ${u.color}`}>{u.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{u.label}</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{u.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">description</span> Hợp đồng
              </h3>
              <ul className="space-y-3 text-xs font-semibold text-gray-600">
                <li className="flex justify-between"><span className="text-gray-500">Tiền thuê</span><span className="font-bold text-primary-container">{formatPrice(roomData.rentAmount)}/th</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Tiền cọc</span><span className="font-bold text-on-surface">{formatPrice(roomData.depositAmount)}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Bắt đầu</span><span className="font-semibold text-on-surface">{formatDate(roomData.startDate)}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Kết thúc</span><span className="font-semibold text-on-surface">{formatDate(roomData.endDate)}</span></li>
                <li className="flex justify-between items-center"><span className="text-gray-500">Trạng thái</span><span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">{roomData.status}</span></li>
              </ul>
              <button onClick={() => triggerToast('Tải hợp đồng PDF (demo)...')} className="w-full mt-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-orange-100">
                <span className="material-symbols-outlined text-[18px]">download</span> Tải hợp đồng
              </button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4">Chủ trọ</h3>
              <div className="flex items-center gap-3 mb-4">
                {roomData.ownerAvatar ? (
                  <img src={roomData.ownerAvatar} alt={roomData.ownerName} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shadow-sm">
                    {roomData.ownerName ? roomData.ownerName.split(' ').slice(-1)[0][0] : 'U'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-on-surface text-sm">{roomData.ownerName}</p>
                  <p className="text-xs text-gray-500 leading-normal mt-0.5">{roomData.ownerPhone} · {roomData.ownerEmail}</p>
                </div>
              </div>
              <button onClick={() => setCurrentPage('tenant-messages')} className="w-full py-2.5 bg-primary-container text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[18px]">chat</span> Nhắn tin
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default TenantMyRoom;
