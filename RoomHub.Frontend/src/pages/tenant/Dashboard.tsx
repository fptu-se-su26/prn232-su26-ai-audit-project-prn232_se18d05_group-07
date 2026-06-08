import React, { useState, useEffect, useMemo } from 'react';
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
  rentAmount: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  isPending: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  roomImage: string;
}

const TenantDashboard: React.FC<Props> = ({ setCurrentPage }) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant/room');
      setRoomData(res.data);
    } catch (err: any) {
      console.error(err);
      setRoomData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Compute dynamic stats based on actual room data
  const stats = useMemo(() => {
    return [
      {
        icon: 'meeting_room',
        label: 'Phòng đang thuê',
        value: roomData ? `P.${roomData.roomNumber}` : 'Chưa có',
        sub: roomData ? roomData.buildingName : 'Bạn chưa thuê phòng',
        color: 'text-primary-container',
        bg: 'bg-orange-50'
      },
      {
        icon: 'payments',
        label: 'Tiền thuê phòng',
        value: roomData ? formatVND(roomData.rentAmount) : '—',
        sub: roomData ? 'Đóng hàng tháng' : 'Chưa phát sinh',
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      {
        icon: 'event_available',
        label: 'Trạng thái hợp đồng',
        value: roomData ? (roomData.isPending ? 'Chờ xác nhận' : 'Đang thuê') : 'Chưa có',
        sub: roomData ? `Từ: ${formatDate(roomData.startDate)}` : 'Chưa có hợp đồng',
        color: 'text-green-600',
        bg: 'bg-green-50'
      },
      {
        icon: 'width_full',
        label: 'Diện tích sử dụng',
        value: roomData ? `${roomData.surfaceArea} m²` : '—',
        sub: roomData ? `Loại: ${roomData.roomType}` : '—',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      }
    ];
  }, [roomData]);

  return (
    <div className="space-y-8">
      {/* Hero parallax chào mừng */}
      <ParallaxHero
        image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"
        heightClass="min-h-[230px]"
      >
        <div className="p-8 md:p-10 h-full flex flex-col justify-center">
          <span className="inline-flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full w-fit mb-4 border border-white/20">
            <span className="material-symbols-outlined text-[16px]">waving_hand</span> Chào mừng trở lại
          </span>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 max-w-xl">Chúc bạn một ngày an cư tại Đà Nẵng</h2>
          <p className="text-white/80 text-sm max-w-lg">Quản lý phòng thuê, hóa đơn và yêu cầu bảo trì — tất cả trong một nơi.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setCurrentPage('tenant-room')} className="px-5 py-2.5 bg-white text-primary-container rounded-xl text-sm font-bold hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-[18px]">meeting_room</span> Xem phòng của tôi
            </button>
            <button onClick={() => setCurrentPage('tenant-maintenance')} className="px-5 py-2.5 bg-white/10 backdrop-blur text-white border border-white/30 rounded-xl text-sm font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">build</span> Báo bảo trì
            </button>
          </div>
        </div>
      </ParallaxHero>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5 hover-lift cursor-default h-full">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              </div>
              <p className="text-xl font-bold text-on-surface leading-tight">{s.value}</p>
              <p className="text-xs text-gray-500 mt-2.5 font-semibold">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Phòng hiện tại */}
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">meeting_room</span> Phòng đang thuê
              </h3>
              {roomData && (
                <button onClick={() => setCurrentPage('tenant-room')} className="text-xs font-bold text-primary-container hover:text-orange-600 flex items-center gap-1 cursor-pointer">
                  Chi tiết <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-center flex-grow">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container mb-2"></div>
                <p className="text-gray-500 text-xs">Đang tải dữ liệu phòng...</p>
              </div>
            ) : !roomData ? (
              <div className="p-10 flex flex-col items-center justify-center text-center flex-grow">
                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">help_outline</span>
                <h4 className="font-bold text-gray-800 text-sm">Bạn chưa liên kết phòng</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                  Bạn hiện chưa được gán vào bất kỳ phòng nào trên hệ thống RoomHub hoặc hợp đồng của bạn đã chấm dứt.
                </p>
                <button
                  onClick={() => setCurrentPage('browse')}
                  className="px-4 py-2 bg-primary-container text-white rounded-lg text-xs font-bold hover:bg-orange-650 transition-all cursor-pointer"
                >
                  Tìm phòng trọ ngay
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col sm:flex-row gap-5 flex-grow">
                <img 
                  src={roomData.roomImage} 
                  alt="Phòng" 
                  className="w-full sm:w-44 h-32 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0" 
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-on-surface text-base">
                        Phòng {roomData.roomNumber} — {roomData.roomType}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        roomData.isPending 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-green-50 text-green-600 border border-green-200'
                      }`}>
                        {roomData.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-[14px]">location_on</span> {roomData.buildingAddress}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-sm font-bold text-on-surface">{formatVND(roomData.rentAmount)}</p>
                      <p className="text-[10px] text-gray-500">Tiền thuê/tháng</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-sm font-bold text-on-surface">{roomData.surfaceArea} m²</p>
                      <p className="text-[10px] text-gray-500">Diện tích</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-sm font-bold text-on-surface">{formatDate(roomData.startDate)}</p>
                      <p className="text-[10px] text-gray-500">Bắt đầu thuê</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Hóa đơn gần đây */}
        <Reveal delay={120}>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow h-full flex flex-col justify-between">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">receipt_long</span> Hóa đơn
              </h3>
              {roomData && (
                <button onClick={() => setCurrentPage('tenant-invoices')} className="text-xs font-bold text-primary-container hover:text-orange-600 cursor-pointer">
                  Tất cả
                </button>
              )}
            </div>
            <div className="p-6 flex-grow flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-[44px] text-gray-300 mb-2">task_alt</span>
              <h4 className="font-bold text-gray-800 text-sm">Không có hóa đơn chưa trả</h4>
              <p className="text-xs text-gray-500 max-w-[200px] mt-1 leading-relaxed">
                {roomData 
                  ? 'Tuyệt vời! Hiện tại bạn không có hóa đơn chờ thanh toán nào trên RoomHub.'
                  : 'Hãy liên kết phòng thuê để nhận hóa đơn dịch vụ hàng tháng.'}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default TenantDashboard;
