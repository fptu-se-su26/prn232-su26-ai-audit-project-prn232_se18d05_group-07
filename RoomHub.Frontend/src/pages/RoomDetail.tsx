import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { viewingApi } from '../services/viewings';
import { favoritesApi } from '../services/favorites';
import RecommendationRow from '../components/RecommendationRow';

interface RoomDetailProps {
  selectedRoomId?: number | null;
  setCurrentPage?: (page: 'home' | 'browse' | 'detail' | 'landlords') => void;
  setSelectedRoomId?: (id: number | null) => void;
}

type ReviewReportReason = { code: string; label: string };
type ReportableReview = { id: number; tenantName: string; comment?: string };

const RoomDetail: React.FC<RoomDetailProps> = ({ selectedRoomId, setCurrentPage, setSelectedRoomId }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<any>({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [reportingReview, setReportingReview] = useState<ReportableReview | null>(null);
  const [reportReasons, setReportReasons] = useState<ReviewReportReason[]>([]);
  const [reportReasonCode, setReportReasonCode] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();

  const activeRoomId = useMemo(() => {
    if (routeId) {
      const parsed = parseInt(routeId, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return selectedRoomId ?? null;
  }, [routeId, selectedRoomId]);

  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeRoomId) return;
    api.get(`/reviews/room/${activeRoomId}`).then(r => setReviewSummary(r.data)).catch(() => setReviewSummary({ averageRating: 0, totalReviews: 0, reviews: [] }));
  }, [activeRoomId]);

  useEffect(() => {
    api.get('/reviews/report-reasons')
      .then(response => setReportReasons(response.data))
      .catch(() => setReportReasons([
        { code: 'Spam', label: 'Nội dung spam hoặc quảng cáo' },
        { code: 'Abuse', label: 'Ngôn từ xúc phạm hoặc quấy rối' },
        { code: 'FalseInformation', label: 'Thông tin sai lệch' },
        { code: 'PersonalInformation', label: 'Tiết lộ thông tin cá nhân' },
        { code: 'Other', label: 'Lý do khác' }
      ]));
  }, []);

  // Ghi lại lịch sử xem phòng cho người thuê đã đăng nhập; lỗi được bỏ qua.
  // loggedRoomsRef chặn việc ghi trùng khi effect chạy 2 lần (React StrictMode) cho cùng một phòng.
  const loggedRoomsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!activeRoomId) return;
    if (user?.role !== 'Tenant') return;
    if (loggedRoomsRef.current.has(activeRoomId)) return;
    loggedRoomsRef.current.add(activeRoomId);
    api.post('/tenant/booking-history', { roomId: activeRoomId })
      .catch(() => loggedRoomsRef.current.delete(activeRoomId));
  }, [activeRoomId, user]);

  // Fetch listing detail from API
  useEffect(() => {
    if (!activeRoomId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/public/listings/${activeRoomId}`);
        if (isMounted) {
          setRoomData(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch listing from API:", err);
        if (isMounted) {
          setRoomData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoom();
    return () => {
      isMounted = false;
    };
  }, [activeRoomId]);

  useEffect(() => {
    if (!activeRoomId || user?.role !== 'Tenant') { setIsFavorite(false); return; }
    favoritesApi.status(activeRoomId).then(result => setIsFavorite(result.isFavorite)).catch(() => setIsFavorite(false));
  }, [activeRoomId, user]);

  // Scroll to top when activeRoomId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeRoomId]);

  // Use roomData as the active room
  const room = roomData;

  // Fetch similar rooms from API
  const [similarRooms, setSimilarRooms] = useState<any[]>([]);
  useEffect(() => {
    if (!room) return;
    const fetchSimilar = async () => {
      try {
        const res = await api.get(`/public/listings`, {
          params: { roomType: room.type, pageSize: 4, page: 1 }
        });
        const data = res.data;
        const items = Array.isArray(data) ? data : (data.items ?? []);
        
        const apiSimilar = items.filter((r: any) => r.id !== activeRoomId);
        setSimilarRooms(apiSimilar.slice(0, 3));
      } catch {
        setSimilarRooms([]);
      }
    };
    fetchSimilar();
  }, [room, activeRoomId]);

  const handleAlert = (message: string) => {
    alert(message);
  };

  const openReviewReport = (review: ReportableReview) => {
    setReportingReview(review);
    setReportReasonCode('');
    setReportDescription('');
    setReportError('');
  };

  const submitReviewReport = async () => {
    if (!reportingReview) return;
    if (!reportReasonCode) {
      setReportError('Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (reportReasonCode === 'Other' && !reportDescription.trim()) {
      setReportError('Vui lòng mô tả lý do báo cáo.');
      return;
    }
    try {
      setReportSubmitting(true);
      setReportError('');
      await api.post(`/reviews/${reportingReview.id}/reports`, {
        reasonCode: reportReasonCode,
        description: reportDescription.trim() || null
      });
      setReportingReview(null);
      alert('Đã gửi báo cáo.');
    } catch (requestError: unknown) {
      const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setReportError(message || 'Không thể gửi báo cáo.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-surface text-on-surface py-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Đang tải thông tin chi tiết phòng...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="bg-surface text-on-surface py-8 min-h-[50vh] flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-2xl p-10 text-center max-w-lg">
          <span className="material-symbols-outlined text-[56px] text-red-300">error</span>
          <h2 className="text-xl font-bold mt-3">Không tìm thấy tin đăng</h2>
          <p className="text-sm text-gray-500 mt-2">Tin đăng không tồn tại, đã bị ẩn hoặc không còn được công khai.</p>
          <button className="mt-6 px-5 py-2.5 bg-primary-container text-white rounded-xl font-bold" onClick={() => navigate('/browse')}>Quay lại danh sách phòng</button>
        </div>
      </main>
    );
  }

  const isTenant = user?.role === 'Tenant';

  const submitViewing = async () => {
    if (!activeRoomId || !bookingStart || !bookingEnd) return;
    try {
      setBookingLoading(true);
      await viewingApi.create({ roomId: activeRoomId, requestedStartAt: new Date(bookingStart).toISOString(), requestedEndAt: new Date(bookingEnd).toISOString(), note: bookingNote });
      setBookingOpen(false);
      alert('Đã gửi yêu cầu xem phòng. Bạn có thể theo dõi trong mục Lịch xem & đặt cọc.');
    } catch (error:unknown) { const message = typeof error === 'object' && error !== null && 'response' in error ? (error as {response?:{data?:{message?:string}}}).response?.data?.message : undefined; alert(message || 'Không thể đặt lịch xem phòng.'); }
    finally { setBookingLoading(false); }
  };

  const toggleFavorite = async () => {
    if (!activeRoomId) return;
    if (user?.role !== 'Tenant') { setIsLoginModalOpen(true); return; }
    const previous = isFavorite;
    setIsFavorite(!previous); setFavoriteLoading(true);
    try { if (previous) await favoritesApi.remove(activeRoomId); else await favoritesApi.add(activeRoomId); }
    catch { setIsFavorite(previous); alert('Không thể cập nhật yêu thích. Vui lòng thử lại.'); }
    finally { setFavoriteLoading(false); }
  };

  const handleStartChat = async () => {
    if (!room?.ownerId || !user) return;
    try {
      setChatLoading(true);
      await api.post('/chats/conversations', { ownerId: room.ownerId, roomId: activeRoomId });
      // Dashboard routes are hash-based. This also works when the detail page
      // is opened directly at /room/:id (where setCurrentPage is not supplied).
      if (setCurrentPage) {
        (setCurrentPage as any)('tenant-messages');
      } else {
        window.location.hash = '#/tenant/messages';
      }
    } catch (err) {
      console.error('Lỗi tạo cuộc trò chuyện:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const host = {
    name: room.landlordName || "Chủ nhà RoomHub",
    phone: room.landlordPhone || "0905 *** ***",
    role: room.landlordRole || "Chủ nhà",
    avatar: room.landlordAvatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  };
  const galleryImages: string[] = room.imageUrls?.length ? room.imageUrls : [room.image];

  const formatPrice = (price: number) => {
    return price ? price.toLocaleString('vi-VN') : '0';
  };

  return (
    <main className="bg-surface text-on-surface py-8">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex text-label-md font-label-md text-on-surface-variant mb-6">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <a
                className="inline-flex items-center hover:text-primary-container transition-colors cursor-pointer"
                onClick={() => { if (setCurrentPage) { setCurrentPage('home'); } else { navigate('/'); } }}
              >
                Trang chủ
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1 text-gray-400">chevron_right</span>
                <a
                  className="hover:text-primary-container transition-colors cursor-pointer"
                  onClick={() => { if (setCurrentPage) { setCurrentPage('browse'); } else { navigate('/browse'); } }}
                >
                  Tìm chỗ ở
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1 text-gray-400">chevron_right</span>
                <span className="text-primary-container font-semibold truncate max-w-[200px] md:max-w-xs">{room.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Gallery Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-100 bg-white p-2">
          {/* Main big view */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[480px] rounded-2xl overflow-hidden">
            <img
              alt={room.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
              src={room.image}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur text-primary-container text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                {room.type === 'Căn hộ' ? 'Căn hộ Mini' : room.type === 'Chung cư' ? 'Căn hộ chung cư' : room.type}
              </span>
              <span className="bg-green-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                Còn trống
              </span>
            </div>
            <button onClick={() => void toggleFavorite()} disabled={favoriteLoading} aria-label={isFavorite ? 'Bỏ lưu yêu thích' : 'Lưu yêu thích'} className={`absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center transition-colors disabled:opacity-50 ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}><span className={`material-symbols-outlined ${isFavorite ? 'icon-fill' : ''}`}>favorite</span></button>
          </div>

          {/* 4 detail views (Desktop only) */}
          <div className="grid grid-cols-2 gap-3 h-[300px] sm:h-[400px] md:h-[480px] hidden md:grid">
            <div className="rounded-xl overflow-hidden">
              <img alt="Nội thất chi tiết 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src={galleryImages[1 % galleryImages.length]} />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img alt="Nội thất chi tiết 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src={galleryImages[2 % galleryImages.length]} />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img alt="Nội thất chi tiết 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src={galleryImages[3 % galleryImages.length]} />
            </div>
            <div className="relative rounded-xl overflow-hidden group">
              <img alt="Nội thất chi tiết 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={galleryImages[4 % galleryImages.length]} />
              <div
                onClick={() => handleAlert('Tính năng xem toàn bộ album ảnh thực tế sẽ mở ở giai đoạn tiếp theo!')}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-colors text-white"
              >
                <span className="material-symbols-outlined text-[28px] mb-1">photo_library</span>
                <span className="text-sm font-bold">+5 Ảnh nội thất</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Main Details Column */}
          <div className="w-full lg:w-2/3 space-y-8 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 soft-shadow">

            {/* Title & Price Header */}
            <div className="border-b border-gray-100 pb-6 space-y-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
                {room.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-primary-container text-2xl font-black">
                  {formatPrice(room.price)}đ<span className="text-sm text-gray-500 font-normal">/tháng</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-[20px] text-primary-container">location_on</span>
                  <span>{room.location}</span>
                </div>
              </div>

              {/* Badges specifications */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100/50 px-4 py-2 rounded-full text-gray-700">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">straighten</span>
                  <span className="text-xs font-bold">{room.area}m² diện tích</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100/50 px-4 py-2 rounded-full text-gray-700">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">group</span>
                  <span className="text-xs font-bold">Tối đa {room.maxPeople} người</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100/50 px-4 py-2 rounded-full text-gray-700">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">bed</span>
                  <span className="text-xs font-bold">{room.type === 'Studio' || room.type === 'Phòng trọ' ? 'Dạng Studio mở' : '1 Phòng ngủ'}</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100/50 px-4 py-2 rounded-full text-gray-700">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">shower</span>
                  <span className="text-xs font-bold">1 WC khép kín</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
                Mô tả chi tiết
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Phòng sạch sẽ, thông thoáng, ban công rộng đón gió mát mẻ mỗi ngày. Thiết kế nội thất phong cách Bắc Âu hiện đại, tối giản nhưng cực kỳ tiện lợi và ấm cúng. Gần chợ, các cửa hàng tiện ích, quán cà phê và chỉ cách trường học hoặc trung tâm hành chính 5-10 phút di chuyển bằng xe máy. Khu dân cư trí thức, cực kỳ yên tĩnh và an ninh, camera bảo vệ giám sát 24/7. Nội thất sang trọng mới tinh khôi, sẵn sàng đón khách vào ở ngay lập tức!
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
                Trang bị tiện ích sẵn có
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.amenities.map((amenity: string) => {
                  let icon = "done";
                  if (amenity.includes("Wifi")) icon = "wifi";
                  else if (amenity.includes("Điều hòa") || amenity.includes("lạnh")) icon = "ac_unit";
                  else if (amenity.includes("xe")) icon = "directions_car";
                  else if (amenity.includes("công")) icon = "balcony";
                  else if (amenity.includes("WC") || amenity.includes("khép kín")) icon = "shower";
                  else if (amenity.includes("gác")) icon = "vertical_align_top";

                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-orange-50/80 flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost details table */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
                Bảng chi phí chi tiết hàng tháng
              </h2>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-700">Giá thuê phòng</td>
                      <td className="px-5 py-3.5 text-right text-primary-container font-black text-base">{formatPrice(room.price)}đ<span className="text-xs text-gray-500 font-normal">/tháng</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-600">Tiền đặt cọc</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 font-bold">1 tháng tiền phòng ({formatPrice(room.price)}đ)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-600">Chi phí tiền điện</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 font-bold">{room.electricityPrice ? `${formatPrice(room.electricityPrice)}đ / kwh` : "3.500đ / kwh"} (được kiểm soát bằng công tơ riêng)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-600">Chi phí tiền nước sinh hoạt</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 font-bold">{room.waterPrice ? `${formatPrice(room.waterPrice)}đ / người / tháng` : "50.000đ / người / tháng"}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-600">Phí mạng Internet</td>
                      <td className="px-5 py-3.5 text-right text-gray-700 font-bold">{room.internetPrice ? `${formatPrice(room.internetPrice)}đ / tháng` : "Miễn phí"}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-600">Phí dọn rác &amp; Xe máy</td>
                      <td className="px-5 py-3.5 text-right text-green-600 font-black">{room.garbagePrice ? `${formatPrice(room.garbagePrice)}đ / tháng` : "Miễn phí hoàn toàn"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
                Nội quy và quy định chỗ ở
              </h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check_circle</span>
                  <span><strong>Giữ gìn trật tự:</strong> Vui lòng không làm ồn hay tổ chức tiệc tùng gây ảnh hưởng hàng xóm sau 22h tối.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check_circle</span>
                  <span><strong>Giữ gìn vệ sinh:</strong> Bỏ rác đúng nơi quy định của tòa nhà và bảo quản đồ dùng nội thất chung.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check_circle</span>
                  <span><strong>Bảo mật &amp; Thú cưng:</strong> Hạn chế nuôi chó/mèo lớn. Vui lòng khai báo tạm trú đầy đủ khi dọn vào ở.</span>
                </li>
              </ul>
            </div>

            {/* Location Map Mockup */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
                Vị trí địa lý bản đồ
              </h2>
              <div className="w-full h-64 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden relative soft-shadow">
                {import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY ? (
                  <iframe
                    title="Bản đồ vị trí"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY}&q=${encodeURIComponent([room.district, room.city, 'Việt Nam'].filter(Boolean).join(', '))}&zoom=14&language=vi`}
                  />
                ) : (
                  <img
                    alt="Bản đồ vị trí"
                    className="w-full h-full object-cover opacity-60 filter grayscale-[20%]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADAD3WCdZBDbdcstsUN7au-HkxR1aY-E69qDUTrD01uSDNcHRUEPG4ciiDyFfbcPL2fBaaBJ6x-X58BtvizvwyGEC5SCzf2KLEyhfJNw1yYStBTsH3D_tWbS8u92BUvqbjz7hCb_HHdlHMUEQYH4XyME_wEHcYhFAdKRAj0xFg5M7-DrmpAuWUnpNXLNhR4nMEdSLfUj1rRwRvND3ciSx-9RDbIvtL9yx7H_waVRpFDgqGoo9Euht9sErkUxDJAaLDCvK2bDA5C9E"
                  />
                )}
                {/* Overlay vùng khu vực (bảo mật — không lộ địa chỉ chính xác) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-44 h-44 rounded-full bg-primary-container/10 border-2 border-primary-container/30 animate-pulse"></div>
                  <div className="relative bg-white/95 backdrop-blur px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-orange-100">
                    <span className="material-symbols-outlined text-primary-container icon-fill">location_on</span>
                    <span className="text-xs font-bold text-gray-700">Khu vực {room.district}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">info</span>
                Bản đồ hiển thị ở mức khu vực để bảo mật. Địa chỉ chính xác sẽ được cung cấp khi bạn liên hệ chủ nhà.
              </p>
            </div>

          </div>

          {/* Right Sticky Contact Sidebar Column */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-3xl p-6 soft-shadow border border-gray-100 flex flex-col gap-6">

              {/* Host Profile Header */}
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <div className="w-14 h-14 rounded-full bg-orange-50 overflow-hidden border-2 border-primary-container shrink-0">
                  <img
                    alt={host.name}
                    className="w-full h-full object-cover"
                    src={host.avatar}
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-on-surface">{host.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{host.role}</p>
                </div>
              </div>

              {/* Host Phone blur */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">phone</span>
                  <span className="text-sm font-bold tracking-widest text-on-surface blur-[4px] select-none">{host.phone}</span>
                </div>
                <span className="text-[10px] text-primary-container bg-orange-50 font-bold px-2 py-0.5 rounded">Bị ẩn</span>
              </div>

              {/* Contact / Action CTA Button */}
              {isTenant ? (
                <>
                  <button onClick={() => setBookingOpen(true)} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">event_available</span>Đặt lịch xem phòng
                  </button>
                  <button
                    onClick={handleStartChat}
                    disabled={chatLoading}
                    className="w-full py-4 bg-primary-container hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {chatLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    )}
                    {chatLoading ? 'Đang kết nối...' : 'Nhắn tin với chủ nhà'}
                  </button>
                  <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                    <span className="text-xs text-gray-600 font-semibold">Đã đăng nhập · Bảo mật 100%</span>
                  </div>
                </>
              ) : user ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-4 bg-gray-200 text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed"
                >
                  Chỉ khách thuê mới nhắn được
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-4 bg-primary-container hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-98"
                >
                  Đăng nhập để liên hệ chủ nhà
                </button>
              )}

              <p className="text-[11px] text-center text-gray-400 px-2 leading-relaxed">
                Bằng việc nhấn đăng nhập liên hệ, bạn hoàn toàn đồng ý tuân thủ với Điều khoản sử dụng và Chính sách bảo mật của RoomHub Da Nang.
              </p>
            </div>
          </div>

        </div>

        {/* Similar Listings Section */}
        <section className="mt-16 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-end justify-between"><div><h2 className="text-xl font-black">Đánh giá từ người thuê đã xác minh</h2><p className="text-sm text-gray-500">Chỉ hiển thị đánh giá hợp lệ đã qua kiểm duyệt.</p></div><div className="text-right"><span className="text-3xl font-black text-amber-500">{reviewSummary.averageRating}</span><span className="text-gray-500">/5 ({reviewSummary.totalReviews})</span></div></div>
          {!reviewSummary.reviews.length ? (
            <p className="py-8 text-center text-gray-500">Phòng này chưa có đánh giá.</p>
          ) : (
            <div className="space-y-3">
              {reviewSummary.reviews.map((review: ReportableReview & { rating?: number }) => (
                <article key={review.id} className="border-t pt-4">
                  <div className="flex justify-between">
                    <b>{review.tenantName}</b>
                    <span className="text-amber-500">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment || 'Không có nhận xét.'}</p>
                  {user && (
                    <button onClick={() => openReviewReport(review)} className="mt-2 text-xs text-red-500">
                      Báo cáo
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Phòng tương tự — tự ẩn nếu không tìm được gợi ý nào */}
        {activeRoomId && <RecommendationRow mode="similar" roomId={activeRoomId} take={8} />}

        {reportingReview && (
          <div className="fixed inset-0 z-[70] bg-black/50 grid place-items-center p-4">
            <form className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onSubmit={event => { event.preventDefault(); void submitReviewReport(); }}>
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Báo cáo đánh giá</h3>
                  <p className="text-sm text-gray-500">Đánh giá của {reportingReview.tenantName}</p>
                </div>
                <button type="button" onClick={() => setReportingReview(null)}>✕</button>
              </div>
              <label className="block text-sm font-semibold" htmlFor="review-report-reason">Lý do</label>
              <select
                id="review-report-reason"
                value={reportReasonCode}
                onChange={event => setReportReasonCode(event.target.value)}
                className="w-full rounded-xl border p-3"
              >
                <option value="">Chọn lý do báo cáo</option>
                {reportReasons.map(reason => <option key={reason.code} value={reason.code}>{reason.label}</option>)}
              </select>
              <label className="block text-sm font-semibold" htmlFor="review-report-description">
                Mô tả {reportReasonCode === 'Other' ? '(bắt buộc)' : '(không bắt buộc)'}
              </label>
              <textarea
                id="review-report-description"
                value={reportDescription}
                onChange={event => setReportDescription(event.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full rounded-xl border p-3"
                placeholder="Cung cấp thông tin giúp quản trị viên xác minh báo cáo"
              />
              <p className="text-xs text-gray-500 text-right">{reportDescription.length}/1000</p>
              {reportError && <p className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{reportError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReportingReview(null)} className="px-4 py-2 rounded-lg bg-gray-100">Hủy</button>
                <button disabled={reportSubmitting} type="submit" className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                  {reportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-20 space-y-6">
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2 border-l-4 border-primary-container pl-3">
            Gợi ý chỗ ở tương tự lân cận
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRooms.map((simRoom) => (
              <div
                key={simRoom.id}
                onClick={() => {
                  if (setSelectedRoomId) {
                    setSelectedRoomId(simRoom.id);
                  } else {
                    navigate(`/room/${simRoom.id}`);
                  }
                  // Auto scroll to top is handled by the useEffect above
                }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group cursor-pointer"
              >
                <div className="h-44 relative overflow-hidden bg-gray-100">
                  <img
                    alt={simRoom.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={simRoom.image}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-primary-container shadow-sm">
                    {simRoom.type === 'Căn hộ' ? 'Căn hộ Mini' : simRoom.type === 'Chung cư' ? 'Căn hộ chung cư' : simRoom.type}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex flex-col flex-grow">
                  <h3 className="text-sm font-extrabold text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">
                    {simRoom.title}
                  </h3>
                  <div className="text-primary-container font-black text-base">
                    {formatPrice(simRoom.price)}đ<span className="text-xs font-normal text-gray-500">/tháng</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-auto pt-2 border-t border-gray-50">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span className="truncate">{simRoom.district}, Đà Nẵng</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Login requirement Modal */}
      {bookingOpen && <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4"><div className="flex justify-between"><h3 className="font-bold text-lg">Đặt lịch xem phòng</h3><button onClick={()=>setBookingOpen(false)}>✕</button></div><label className="block text-sm font-semibold">Bắt đầu<input type="datetime-local" value={bookingStart} onChange={e=>setBookingStart(e.target.value)} className="mt-1 w-full border rounded-xl p-3" /></label><label className="block text-sm font-semibold">Kết thúc<input type="datetime-local" value={bookingEnd} onChange={e=>setBookingEnd(e.target.value)} className="mt-1 w-full border rounded-xl p-3" /></label><label className="block text-sm font-semibold">Ghi chú<textarea value={bookingNote} onChange={e=>setBookingNote(e.target.value)} className="mt-1 w-full border rounded-xl p-3" rows={3}/></label><button disabled={bookingLoading||!bookingStart||!bookingEnd} onClick={submitViewing} className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold disabled:opacity-50">{bookingLoading?'Đang gửi...':'Gửi yêu cầu'}</button></div></div>}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md soft-shadow p-6 relative border border-gray-100 animate-scale-up">

            {/* Close Button */}
            <button
              aria-label="Đóng modal"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary-container text-[28px]">lock</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Bạn cần đăng nhập</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Vui lòng đăng nhập hoặc đăng ký tài khoản RoomHub để có thể nhìn thấy Số điện thoại chính chủ và bắt đầu gửi tin nhắn thương lượng với chủ trọ!
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    handleAlert('Tính năng Đăng nhập sẽ ra mắt ở giai đoạn tiếp theo!');
                  }}
                  className="w-full bg-primary-container text-white text-sm font-bold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-sm active:scale-98"
                >
                  Đăng nhập ngay
                </button>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    handleAlert('Tính năng Đăng ký tài khoản sẽ ra mắt ở giai đoạn tiếp theo!');
                  }}
                  className="w-full bg-transparent border border-gray-200 text-on-surface-variant text-sm font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-98"
                >
                  Tạo tài khoản mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default RoomDetail;
