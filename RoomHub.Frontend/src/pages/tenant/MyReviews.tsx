import React, { useState, useEffect } from 'react';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface ReviewItem {
  id: number;
  roomId: number | null;
  roomTitle: string | null;
  tenantId: string;
  tenantName: string;
  ownerId: string | null;
  rating: number | null;
  comment: string | null;
  createdAt: string;
}

interface ActiveRoom {
  roomId: number;
  roomNumber: string;
  buildingName?: string;
}

// Nhãn cảm xúc suy ra từ số sao (quy tắc hiển thị, không phải AI).
const sentimentMeta = (rating: number | null) => {
  if (rating == null) return { label: 'Chưa chấm', cls: 'text-gray-500 bg-gray-50', icon: 'sentiment_neutral' };
  if (rating >= 4) return { label: 'Tích cực', cls: 'text-green-600 bg-green-50', icon: 'sentiment_satisfied' };
  if (rating === 3) return { label: 'Trung tính', cls: 'text-amber-600 bg-amber-50', icon: 'sentiment_neutral' };
  return { label: 'Tiêu cực', cls: 'text-red-500 bg-red-50', icon: 'sentiment_dissatisfied' };
};

const TenantMyReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Trạng thái sửa một đánh giá đã có
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editHover, setEditHover] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => setToast({ text, type });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, roomRes] = await Promise.allSettled([
        api.get('/tenant/reviews/my'),
        api.get('/tenant/room'),
      ]);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data);
      if (roomRes.status === 'fulfilled' && roomRes.value.data?.roomId) {
        setActiveRoom(roomRes.value.data);
      } else {
        setActiveRoom(null);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Không thể tải dữ liệu đánh giá.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const alreadyReviewed = activeRoom
    ? reviews.some(r => r.roomId === activeRoom.roomId)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    setSubmitting(true);
    try {
      await api.post('/tenant/reviews', {
        roomId: activeRoom.roomId,
        rating,
        comment: comment.trim() || null,
      });
      triggerToast('Đã gửi đánh giá của bạn. Cảm ơn!');
      setComment('');
      setRating(5);
      await fetchData();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể gửi đánh giá.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r: ReviewItem) => {
    setEditingId(r.id);
    setEditRating(r.rating || 5);
    setEditComment(r.comment || '');
    setEditHover(0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditHover(0);
  };

  const handleUpdate = async (id: number) => {
    setSavingEdit(true);
    try {
      const res = await api.put(`/tenant/reviews/${id}`, {
        rating: editRating,
        comment: editComment.trim() || null,
      });
      setReviews(prev => prev.map(r => (r.id === id ? res.data : r)));
      triggerToast('Đã cập nhật đánh giá.');
      setEditingId(null);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể cập nhật đánh giá.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      await api.delete(`/tenant/reviews/${id}`);
      triggerToast('Đã xóa đánh giá.');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể xóa đánh giá.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return s; }
  };

  const StarRow: React.FC<{ value: number; size?: number }> = ({ value, size = 18 }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`material-symbols-outlined ${i <= value ? 'text-amber-400 icon-fill' : 'text-gray-300'}`}
          style={{ fontSize: `${size}px` }}
        >
          star
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-12 relative">
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

      <div>
        <h2 className="text-xl font-bold text-on-surface">Đánh giá của tôi</h2>
        <p className="text-xs text-gray-500">Chấm sao và nhận xét về phòng bạn đang thuê, giúp cộng đồng RoomHub minh bạch hơn.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[240px]">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Form viết đánh giá cho phòng đang thuê */}
          {activeRoom && !alreadyReviewed && (
            <Reveal>
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">rate_review</span>
                  <h3 className="text-sm font-bold text-on-surface">
                    Đánh giá phòng {activeRoom.roomNumber}
                    {activeRoom.buildingName ? ` — ${activeRoom.buildingName}` : ''}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[32px] transition-colors ${
                          i <= (hoverRating || rating) ? 'text-amber-400 icon-fill' : 'text-gray-300'
                        }`}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="text-sm font-bold text-gray-500 ml-2">{rating}/5</span>
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Chia sẻ cảm nhận của bạn về phòng, chủ trọ, tiện nghi..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-primary-container hover:bg-orange-650 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 shadow-sm"
                  >
                    {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Gửi đánh giá
                  </button>
                </div>
              </form>
            </Reveal>
          )}

          {activeRoom && alreadyReviewed && (
            <div className="bg-green-50 border border-green-150 rounded-2xl p-4 flex items-center gap-2 text-green-700">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="text-xs font-bold">Bạn đã đánh giá phòng đang thuê. Cảm ơn bạn đã chia sẻ!</span>
            </div>
          )}

          {!activeRoom && (
            <div className="bg-orange-50 border border-orange-150 rounded-2xl p-4 flex items-center gap-2 text-orange-700">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <span className="text-xs font-bold">Bạn cần đang thuê một phòng để có thể viết đánh giá.</span>
            </div>
          )}

          {/* Danh sách đánh giá đã viết */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3">Lịch sử đánh giá ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-10 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-[56px] text-gray-200 mb-3">reviews</span>
                <p className="text-xs text-gray-500 font-semibold">Bạn chưa viết đánh giá nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, index) => {
                  const s = sentimentMeta(r.rating);
                  return (
                    <Reveal key={r.id} delay={index * 50}>
                      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-5">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-on-surface truncate">
                              {r.roomTitle || (r.roomId ? `Phòng #${r.roomId}` : 'Phòng đã xóa')}
                            </h4>
                            {editingId !== r.id && (
                              <div className="flex items-center gap-2 mt-1">
                                <StarRow value={r.rating || 0} />
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>
                                  <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
                                  {s.label}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-gray-400 font-semibold">{formatDate(r.createdAt)}</span>
                            {editingId !== r.id && (
                              <>
                                <button
                                  onClick={() => startEdit(r)}
                                  className="text-gray-400 hover:text-primary-container transition-colors p-1 rounded-full hover:bg-orange-50 cursor-pointer"
                                  title="Sửa đánh giá"
                                >
                                  <span className="material-symbols-outlined text-[15px]">edit</span>
                                </button>
                                <button
                                  onClick={() => setDeleteTargetId(r.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                                  title="Xóa đánh giá"
                                >
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingId === r.id ? (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button
                                  type="button"
                                  key={i}
                                  onClick={() => setEditRating(i)}
                                  onMouseEnter={() => setEditHover(i)}
                                  onMouseLeave={() => setEditHover(0)}
                                  className="cursor-pointer"
                                >
                                  <span
                                    className={`material-symbols-outlined text-[26px] transition-colors ${
                                      i <= (editHover || editRating) ? 'text-amber-400 icon-fill' : 'text-gray-300'
                                    }`}
                                  >
                                    star
                                  </span>
                                </button>
                              ))}
                              <span className="text-xs font-bold text-gray-500 ml-2">{editRating}/5</span>
                            </div>
                            <textarea
                              value={editComment}
                              onChange={e => setEditComment(e.target.value)}
                              rows={3}
                              maxLength={1000}
                              placeholder="Cập nhật nhận xét của bạn..."
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={savingEdit}
                                onClick={() => handleUpdate(r.id)}
                                className="px-4 py-2 bg-primary-container hover:bg-orange-650 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                              >
                                {savingEdit && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                Lưu thay đổi
                              </button>
                            </div>
                          </div>
                        ) : (
                          r.comment && (
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed font-semibold">{r.comment}</p>
                          )
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal xác nhận xóa */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-red-650">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Xóa đánh giá?</h3>
            <p className="text-sm text-gray-500 mb-6 font-semibold">Bạn có chắc chắn muốn xóa đánh giá này không? Thao tác không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteTargetId)}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantMyReviews;
