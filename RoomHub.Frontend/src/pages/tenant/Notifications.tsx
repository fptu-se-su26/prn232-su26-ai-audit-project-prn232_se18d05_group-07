import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Props {
  setCurrentPage?: (page: PageType) => void;
}

interface NotificationItem {
  id: number;
  userId: string;
  type: string;
  title: string;
  content: string;
  linkedId: number | null;
  isRead: boolean;
  createdAt: string;
}

const TenantNotifications: React.FC<Props> = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // ID of notification being processed
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err: any) {
      console.error(err);
      triggerToast('Không thể tải danh sách thông báo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Dispatch an event to notify layout layout badge to update
      window.dispatchEvent(new Event('notification_changed'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      triggerToast('Đã đánh dấu đọc tất cả thông báo.');
      window.dispatchEvent(new Event('notification_changed'));
    } catch (err) {
      console.error(err);
      triggerToast('Thao tác thất bại.', 'error');
    }
  };

  const handleDeleteNotification = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      triggerToast('Đã xóa thông báo.');
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notification_changed'));
    } catch (err) {
      console.error(err);
      triggerToast('Không thể xóa thông báo.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleAcceptRoom = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await api.post('/tenant/room/accept');
      triggerToast('Bạn đã xác nhận nhận phòng thành công!');
      // Mark notification as read
      await handleMarkAsRead(notificationId);
      // Refresh list to sync status
      await fetchNotifications();
      window.dispatchEvent(new Event('notification_changed'));
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận nhận phòng.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRoom = (notificationId: number) => {
    setRejectTargetId(notificationId);
  };

  const confirmRejectRoom = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await api.post('/tenant/room/reject');
      triggerToast('Đã từ chối lời mời nhận phòng thành công.', 'warning');
      // Mark notification as read
      await handleMarkAsRead(notificationId);
      await fetchNotifications();
      window.dispatchEvent(new Event('notification_changed'));
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối lời mời.', 'error');
    } finally {
      setActionLoading(null);
      setRejectTargetId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Thông báo của tôi</h2>
          <p className="text-xs text-gray-500">Xem và quản lý các cập nhật từ chủ nhà và hệ thống RoomHub.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 border border-gray-200 hover:bg-orange-50 text-gray-700 hover:text-primary-container rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span> Đánh dấu đọc tất cả
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
          <span className="material-symbols-outlined text-[64px] text-gray-200 mb-4 animate-bounce">notifications_off</span>
          <h3 className="text-base font-bold text-on-surface mb-1">Không có thông báo nào</h3>
          <p className="text-xs text-gray-500 max-w-sm font-semibold leading-relaxed">
            Hộp thư của bạn hiện đang trống. Mọi thông báo mới từ chủ nhà và hợp đồng sẽ được hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => {
            const isInvitation = notif.type === 'RoomInvitation';
            const isInvitationAccepted = notif.type === 'RoomInvitationAccepted';
            const isInvitationRejected = notif.type === 'RoomInvitationRejected';
            return (
              <Reveal key={notif.id} delay={index * 50}>
                <div
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md relative overflow-hidden ${
                    notif.isRead ? 'border-gray-150/70 opacity-90' : 'border-orange-100 bg-orange-50/10'
                  }`}
                >
                  {/* Left Highlight Strip */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    isInvitation ? 'bg-primary-container' : 
                    isInvitationAccepted ? 'bg-green-500' :
                    isInvitationRejected ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>

                  <div className="flex items-start gap-4">
                    {/* Icon Column */}
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                      isInvitation ? 'bg-orange-50 text-primary-container' :
                      isInvitationAccepted ? 'bg-green-50 text-green-600' :
                      isInvitationRejected ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-500'
                    }`}>
                      <span className="material-symbols-outlined text-[22px]">
                        {isInvitation ? 'meeting_room' : 
                         isInvitationAccepted ? 'check_circle' : 
                         isInvitationRejected ? 'cancel' : 'campaign'}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                        <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                          {notif.title}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block"></span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400 font-semibold">{formatDate(notif.createdAt)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notif.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer flex items-center justify-center outline-none shrink-0"
                            title="Xóa thông báo"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed font-semibold">{notif.content}</p>

                      {/* Room invitation action buttons */}
                      {isInvitation && (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            disabled={actionLoading !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectRoom(notif.id);
                            }}
                            className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-650 border border-red-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                          >
                            Từ chối
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptRoom(notif.id);
                            }}
                            className="px-4 py-1.5 bg-primary-container hover:bg-orange-650 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer active:scale-95 shadow-sm"
                          >
                            {actionLoading === notif.id && (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                            )}
                            Đồng ý nhận phòng
                          </button>
                        </div>
                      )}

                      {isInvitationAccepted && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-150 rounded-full text-[11px] font-bold text-green-600">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã đồng ý nhận phòng
                        </div>
                      )}

                      {isInvitationRejected && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-150 rounded-full text-[11px] font-bold text-red-600">
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
                          Đã từ chối nhận phòng
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Custom Modal Confirm Xóa */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-red-650">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Xóa thông báo?</h3>
            <p className="text-sm text-gray-500 mb-6 font-semibold">Bạn có chắc chắn muốn xóa thông báo này không? Thao tác này không thể hoàn tác.</p>
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
                onClick={() => confirmDeleteNotification(deleteTargetId)}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal Confirm Từ chối nhận phòng */}
      {rejectTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 soft-shadow relative animate-scale-up border border-gray-100 text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-550 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-orange-600">warning</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Từ chối nhận phòng?</h3>
            <p className="text-sm text-gray-500 mb-6 font-semibold">Bạn có chắc chắn muốn từ chối lời mời nhận phòng này không? Lời mời sẽ bị hủy vĩnh viễn.</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRejectTargetId(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => confirmRejectRoom(rejectTargetId)}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantNotifications;
