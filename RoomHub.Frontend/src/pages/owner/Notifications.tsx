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

// Map notification type to icon & color theme
const getNotifTheme = (type: string) => {
  switch (type) {
    case 'ContractResponse':
      return { icon: 'assignment_turned_in', bg: 'bg-emerald-50', text: 'text-emerald-600', strip: 'bg-emerald-500', label: 'Phản hồi HĐ' };
    case 'InvoiceCreated':
      return { icon: 'receipt_long', bg: 'bg-orange-50', text: 'text-orange-500', strip: 'bg-orange-500', label: 'Hóa đơn mới' };
    case 'PaymentSuccess':
      return { icon: 'payments', bg: 'bg-green-50', text: 'text-green-600', strip: 'bg-green-500', label: 'Thanh toán' };
    case 'InvoiceReminder':
      return { icon: 'campaign', bg: 'bg-amber-50', text: 'text-amber-600', strip: 'bg-amber-500', label: 'Nhắc nhở' };
    default:
      return { icon: 'notifications', bg: 'bg-blue-50', text: 'text-blue-500', strip: 'bg-blue-500', label: 'Thông báo' };
  }
};

const OwnerNotifications: React.FC<Props> = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300 animate-slideIn ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-100' :
          toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-700 shadow-red-100' :
          'bg-orange-50 border-orange-100 text-orange-700 shadow-orange-100'
        }`}>
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-100' : toast.type === 'error' ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'warning'}
            </span>
          </div>
          <span>{toast.text}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-orange-500">notifications</span>
            Trung tâm Thông báo
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-black">
                {unreadCount} chưa đọc
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Nơi nhận và phản hồi thông tin từ khách thuê của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-white shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Đánh dấu đọc tất cả
            </button>
          )}
          <button
            onClick={fetchNotifications}
            title="Làm mới thông báo"
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Làm mới
          </button>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      {!loading && notifications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Tổng thông báo', value: notifications.length, icon: 'notifications', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Chưa đọc', value: unreadCount, icon: 'mark_email_unread', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
            { label: 'Đã đọc', value: notifications.filter(n => n.isRead).length, icon: 'mark_email_read', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Loại thông báo', value: new Set(notifications.map(n => n.type)).size, icon: 'category', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-2xl border ${stat.border} shadow-sm flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[18px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== NOTIFICATION LIST ===== */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin mb-4"></div>
          <p className="text-sm font-bold text-gray-500">Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[52px] text-gray-200">notifications_off</span>
          </div>
          <h3 className="text-base font-black text-gray-700 mb-2">Không có thông báo mới</h3>
          <p className="text-xs text-gray-400 max-w-xs font-semibold leading-relaxed">
            Bạn chưa nhận được phản hồi hay cập nhật mới nào. Khi khách thuê nhận phòng hoặc thanh toán hóa đơn, thông tin sẽ hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => {
            const theme = getNotifTheme(notif.type);
            return (
              <Reveal key={notif.id} delay={index * 40}>
                <div
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`bg-white rounded-2xl border transition-all duration-200 relative overflow-hidden cursor-pointer group ${
                    notif.isRead
                      ? 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                      : 'border-orange-100 shadow-md hover:shadow-lg hover:border-orange-200 bg-orange-50/5'
                  }`}
                >
                  {/* Left accent strip */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${theme.strip} rounded-l-2xl`} />

                  <div className="flex items-start gap-4 p-5 pl-6">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      <span className="material-symbols-outlined text-[22px]">{theme.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${theme.bg} ${theme.text} border border-opacity-30`}>
                              {theme.label}
                            </span>
                            {!notif.isRead && (
                              <span className="flex items-center gap-1 text-[10px] text-orange-500 font-black">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block"></span>
                                Mới
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-sm text-gray-900 mt-1.5 leading-snug">{notif.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">{notif.content}</p>
                        </div>

                        <div className="flex items-start gap-1.5 shrink-0 flex-col items-end">
                          <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notif.id);
                                }}
                                className="w-7 h-7 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-center"
                                title="Đánh dấu đã đọc"
                              >
                                <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetId(notif.id);
                              }}
                              className="w-7 h-7 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                              title="Xóa thông báo"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read indicator bottom */}
                  {!notif.isRead && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-400/0 via-orange-300/40 to-orange-400/0" />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ===== CUSTOM DELETE CONFIRM MODAL ===== */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-7 shadow-2xl relative animate-scaleUp border border-gray-100/80 text-center">
            <div className="w-18 h-18 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-red-500">delete_forever</span>
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Xóa thông báo?</h3>
            <p className="text-sm text-gray-500 mb-7 font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa thông báo này không?<br />
              <span className="text-red-500 font-bold">Thao tác này không thể hoàn tác.</span>
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteNotification(deleteTargetId)}
                className="flex-1 py-2.5 px-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm shadow-red-200"
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

export default OwnerNotifications;
