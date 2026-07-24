import React, { useState, useEffect, useRef } from 'react';
import type { PageType } from '../../App';
import { Reveal, ParallaxHero } from '../../components/parallax/Parallax';
import api from '../../services/api';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import PrintModal from '../../components/documents/PrintModal';
import ContractDocument from '../../components/documents/ContractDocument';
import { useAuth } from '../../hooks/useAuth';

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
  isPending: boolean;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAvatar?: string;
  roomImage?: string;
  signaturePath?: string | null;
  terms?: string | null;
}

const TenantMyRoom: React.FC<Props> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const sigRef = useRef<SignaturePadHandle>(null);
  const [signing, setSigning] = useState(false);
  const [showContract, setShowContract] = useState(false);

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

  const handleAcceptRoom = async () => {
    try {
      setLoading(true);
      await api.post('/tenant/room/accept');
      triggerToast('Đã xác nhận nhận phòng thành công!');
      fetchRoom();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận nhận phòng.', 'error');
      setLoading(false);
    }
  };

  const handleRejectRoomClick = () => {
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    setShowRejectConfirm(false);
    try {
      setLoading(true);
      await api.post('/tenant/room/reject');
      triggerToast('Đã từ chối lời mời nhận phòng thành công.', 'warning');
      fetchRoom();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối lời mời.', 'error');
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      triggerToast('Vui lòng ký tên trước khi lưu.', 'warning');
      return;
    }
    try {
      setSigning(true);
      const dataUrl = sigRef.current.toDataURL();
      await api.post('/tenant/room/sign', { signatureImage: dataUrl });
      triggerToast('Đã ký hợp đồng thành công!');
      fetchRoom();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi ký hợp đồng.', 'error');
    } finally {
      setSigning(false);
    }
  };

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

      {/* Parallax Hero */}
      <ParallaxHero
        image={roomData.roomImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"}
        heightClass="min-h-[260px]"
      >
        <div className="p-8 h-full flex flex-col justify-end">
          <span className={`text-[11px] font-bold text-white px-2.5 py-1 rounded-full w-fit mb-3 ${roomData.isPending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}>
            ● {roomData.isPending ? 'Chờ xác nhận' : 'Đang ở'}
          </span>
          <h2 className="text-white text-2xl md:text-3xl font-bold">Phòng {roomData.roomNumber} — {roomData.buildingName}</h2>
          <p className="text-white/85 text-sm flex items-center gap-1 mt-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">location_on</span> {roomData.buildingAddress}
          </p>
        </div>
      </ParallaxHero>

      {/* Pending Room Link Confirmation Banner */}
      {roomData.isPending && (
        <Reveal>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-scaleUp">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-primary-container shrink-0">info</span>
              <div className="text-xs text-gray-700 font-semibold leading-relaxed">
                <p className="text-sm font-black text-on-surface">Yêu cầu liên kết nhận phòng chờ xác nhận</p>
                Chủ trọ <span className="font-bold text-gray-900">{roomData.ownerName}</span> đã gửi lời mời nhận phòng này cho bạn. Vui lòng xác nhận thông tin hợp đồng bên dưới trước khi đồng ý nhận phòng.
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button 
                onClick={handleRejectRoomClick}
                className="flex-grow sm:flex-grow-0 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95"
              >
                Từ chối
              </button>
              <button 
                onClick={handleAcceptRoom}
                className="flex-grow sm:flex-grow-0 px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm active:scale-95"
              >
                Đồng ý nhận phòng
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {/* Main Content Layout */}
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
                <li className="flex justify-between items-center"><span className="text-gray-500">Trạng thái</span><span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roomData.isPending ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200'}`}>{roomData.status}</span></li>
              </ul>
              <button onClick={() => setShowContract(true)} className="w-full mt-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-orange-100">
                <span className="material-symbols-outlined text-[18px]">description</span> Xem & in hợp đồng
              </button>
            </div>
          </Reveal>

          <Reveal delay={40}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">draw</span> Chữ ký điện tử
              </h3>
              {roomData.signaturePath ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-center">
                    <img src={roomData.signaturePath} alt="Chữ ký hợp đồng" className="max-h-28 object-contain" />
                  </div>
                  <p className="text-[11px] font-bold text-green-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">verified</span> Bạn đã ký hợp đồng này.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    Dùng chuột (hoặc cảm ứng) để ký xác nhận hợp đồng thuê phòng này.
                  </p>
                  <SignaturePad ref={sigRef} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => sigRef.current?.clear()}
                      className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-100 cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={handleSign}
                      disabled={signing}
                      className="flex-1 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
                    >
                      {signing ? 'Đang lưu...' : 'Ký & lưu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
              <h3 className="font-bold text-on-surface mb-4">Chủ trọ</h3>
              <div className="flex items-center gap-3 mb-4">
                {roomData.ownerAvatar ? (
                  <img src={roomData.ownerAvatar} alt={roomData.ownerName} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shadow-sm animate-scaleUp">
                    {roomData.ownerName ? roomData.ownerName.split(' ').slice(-1)[0][0] : 'U'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-on-surface text-sm">{roomData.ownerName}</p>
                  <p className="text-xs text-gray-500 leading-normal mt-0.5">{roomData.ownerPhone} · {roomData.ownerEmail}</p>
                </div>
              </div>
              <button onClick={async () => {
                if (user && roomData.ownerId) {
                  try {
                    await api.post('/chats/conversations', { tenantId: user.id, ownerId: roomData.ownerId });
                    setCurrentPage('tenant-messages');
                  } catch (e) {
                    console.error('Lỗi khi tạo cuộc trò chuyện:', e);
                  }
                }
              }} className="w-full py-2.5 bg-primary-container text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[18px]">chat</span> Nhắn tin
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Reject invitation confirmation modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 soft-shadow w-full max-w-sm overflow-hidden animate-scaleUp p-6 space-y-4">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">warning</span>
              Từ chối nhận phòng
            </h3>
            <p className="text-xs font-semibold text-gray-500 leading-normal">
              Bạn có chắc chắn muốn từ chối lời mời nhận phòng {roomData.roomNumber} tại {roomData.buildingName} từ chủ trọ {roomData.ownerName} không? Lời mời này sẽ bị hủy vĩnh viễn.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-755 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Từ chối nhận phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Electronic contract preview (print-to-PDF) */}
      <PrintModal open={showContract} onClose={() => setShowContract(false)} title="Hợp đồng thuê phòng">
        <ContractDocument
          data={{
            roomNumber: roomData.roomNumber,
            buildingName: roomData.buildingName,
            buildingAddress: roomData.buildingAddress,
            roomType: roomData.roomType,
            surfaceArea: roomData.surfaceArea,
            rentAmount: roomData.rentAmount,
            depositAmount: roomData.depositAmount,
            startDate: roomData.startDate,
            endDate: roomData.endDate,
            status: roomData.status,
            ownerName: roomData.ownerName,
            ownerPhone: roomData.ownerPhone,
            ownerEmail: roomData.ownerEmail,
            signaturePath: roomData.signaturePath,
            terms: roomData.terms,
          }}
          tenantName={user?.fullName || ''}
          tenantEmail={user?.email || ''}
        />
      </PrintModal>
    </div>
  );
};

export default TenantMyRoom;
