import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Props {
  setCurrentPage?: (page: PageType) => void;
}

interface BookingHistoryItem {
  id: number;
  roomId: number;
  roomTitle: string | null;
  priceAtBooking: number | null;
  bookedAt: string;
}

const TenantBookingHistory: React.FC<Props> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => setToast({ text, type });

  // Điều hướng đúng cách: đổi cả currentPage (thoát khu tenant) lẫn path router.
  const goToBrowse = () => {
    setCurrentPage?.('browse');
    navigate('/browse');
  };
  const goToRoom = (roomId: number) => {
    setCurrentPage?.('detail');
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/booking-history');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      triggerToast('Không thể tải lịch sử xem phòng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tenant/booking-history/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      triggerToast('Không thể xóa mục này.', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/tenant/booking-history');
      setItems([]);
      triggerToast('Đã xóa toàn bộ lịch sử.');
    } catch (err) {
      console.error(err);
      triggerToast('Không thể xóa lịch sử.', 'error');
    } finally {
      setClearConfirm(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return s; }
  };

  const formatPrice = (p: number | null) =>
    p == null ? '—' : `${p.toLocaleString('vi-VN')}đ/tháng`;

  return (
    <div className="space-y-6 pb-12 relative">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Lịch sử xem phòng</h2>
          <p className="text-xs text-gray-500">Những phòng bạn đã xem gần đây, kèm mức giá tại thời điểm xem.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setClearConfirm(true)}
            className="px-4 py-2 border border-gray-200 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span> Xóa tất cả
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-[64px] text-gray-200 mb-4">history</span>
          <h3 className="text-base font-bold text-on-surface mb-1">Chưa có lịch sử xem phòng</h3>
          <p className="text-xs text-gray-500 max-w-sm font-semibold leading-relaxed mb-4">
            Khi bạn mở xem chi tiết một phòng, phòng đó sẽ được lưu tại đây để bạn xem lại nhanh.
          </p>
          <button
            onClick={goToBrowse}
            className="px-5 py-2.5 bg-primary-container hover:bg-orange-650 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
          >
            Khám phá phòng
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 40}>
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-orange-50 text-primary-container">
                    <span className="material-symbols-outlined text-[22px]">meeting_room</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm text-on-surface truncate">
                      {item.roomTitle || `Phòng #${item.roomId}`}
                    </h4>
                    <p className="text-xs text-primary-container font-bold mt-1">{formatPrice(item.priceAtBooking)}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">Xem lúc {formatDate(item.bookedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => goToRoom(item.roomId)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-primary-container rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Xem lại
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                      title="Xóa mục này"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Modal xác nhận xóa tất cả */}
      {clearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-red-650">delete_sweep</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Xóa toàn bộ lịch sử?</h3>
            <p className="text-sm text-gray-500 mb-6 font-semibold">Toàn bộ lịch sử xem phòng sẽ bị xóa và không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setClearConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantBookingHistory;
