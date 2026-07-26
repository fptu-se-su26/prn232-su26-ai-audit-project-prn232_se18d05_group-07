import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { viewingApi, type ViewingBooking, type ViewingStatus } from '../services/viewings';

const labels: Record<string, string> = {
  Pending: 'Chờ duyệt', Approved: 'Đã duyệt', Rescheduled: 'Đề xuất giờ mới',
  Rejected: 'Từ chối', Cancelled: 'Đã hủy', Completed: 'Đã xem', NoShow: 'Không đến',
  Holding: 'Chờ xác nhận', Active: 'Đang giữ phòng', Refunded: 'Đã hoàn',
  Forfeited: 'Mất cọc', Released: 'Đã giải phóng',
};
const time = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '—';
const dateParts = (value?: string) => {
  if (!value) return { day: '--', month: '---', weekday: '', time: '--:--' };
  const date = new Date(value);
  return {
    day: date.toLocaleDateString('vi-VN', { day: '2-digit' }),
    month: `Tháng ${date.toLocaleDateString('vi-VN', { month: '2-digit' })}`,
    weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
};
const statusStyle: Record<ViewingStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rescheduled: 'bg-blue-50 text-blue-700 ring-blue-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  Completed: 'bg-teal-50 text-teal-700 ring-teal-200',
  NoShow: 'bg-gray-100 text-gray-600 ring-gray-200',
};
const errorMessage = (error: unknown) => axios.isAxiosError<{ message?: string }>(error)
  ? error.response?.data?.message || 'Không thể thực hiện yêu cầu.'
  : 'Không thể thực hiện yêu cầu.';
type DialogAction = 'reschedule' | 'reject' | 'cancel' | 'refund' | 'forfeit';

export default function ViewingBookings({ actor }: { actor: 'tenant' | 'owner' }) {
  const [items, setItems] = useState<ViewingBooking[]>([]);
  const [status, setStatus] = useState<ViewingStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dialog, setDialog] = useState<{ booking: ViewingBooking; action: DialogAction } | null>(null);
  const [actionStart, setActionStart] = useState('');
  const [actionEnd, setActionEnd] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [depositBooking, setDepositBooking] = useState<ViewingBooking | null>(null);
  const [holdDays, setHoldDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<'BankTransfer' | 'Cash'>('BankTransfer');
  const [transactionId, setTransactionId] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [depositError, setDepositError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = actor === 'tenant'
        ? await viewingApi.tenantList(status || undefined)
        : await viewingApi.ownerList(status || undefined);
      setItems(result.items);
    } catch (exception) { setError(errorMessage(exception)); }
    finally { setLoading(false); }
  }, [actor, status]);
  useEffect(() => { void load(); }, [load]);

  const run = async (operation: () => Promise<unknown>, success: string) => {
    try {
      await operation();
      setFeedback({ type: 'success', message: success });
      await load();
    } catch (exception) {
      setFeedback({ type: 'error', message: errorMessage(exception) });
    }
  };

  const toLocalInput = (value: string) => {
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  };
  const openDialog = (booking: ViewingBooking, action: DialogAction) => {
    setDialog({ booking, action }); setActionReason(''); setActionNote(''); setActionError('');
    setActionStart(toLocalInput(booking.scheduledStartAt || booking.requestedStartAt));
    setActionEnd(toLocalInput(booking.scheduledEndAt || booking.requestedEndAt));
  };
  const submitDialog = async () => {
    if (!dialog) return;
    const { booking, action } = dialog;
    if (action === 'reschedule') {
      if (!actionStart || !actionEnd || new Date(actionEnd) <= new Date(actionStart)) {
        setActionError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return;
      }
    } else if (!actionReason.trim()) {
      setActionError('Vui lòng nhập lý do.'); return;
    }
    setSubmitting(true); setActionError('');
    try {
      if (action === 'reschedule') await viewingApi.ownerAction(booking.id, action, {
        startAt: new Date(actionStart).toISOString(), endAt: new Date(actionEnd).toISOString(), note: actionNote.trim(),
      });
      else if (action === 'reject') await viewingApi.ownerAction(booking.id, action, { reason: actionReason.trim() });
      else if (action === 'cancel') await viewingApi.tenantAction(booking.id, action, actionReason.trim());
      else if (action === 'refund' && booking.deposit) await viewingApi.depositAction(booking.deposit.id, action, actionReason.trim());
      else if (action === 'forfeit' && booking.deposit) await viewingApi.depositAction(booking.deposit.id, action, actionReason.trim());
      setDialog(null);
      setFeedback({ type: 'success', message: action === 'reschedule' ? 'Đã gửi đề xuất thời gian mới.' : 'Cập nhật thành công.' });
      await load();
    } catch (exception) { setActionError(errorMessage(exception)); }
    finally { setSubmitting(false); }
  };

  const openDeposit = (booking: ViewingBooking) => {
    setDepositBooking(booking); setHoldDays(7); setPaymentMethod('BankTransfer');
    setTransactionId(''); setProof(null); setDepositError('');
  };
  const submitDeposit = async () => {
    if (!depositBooking) return;
    if (holdDays < 1 || holdDays > 30) { setDepositError('Thời gian giữ phòng phải từ 1 đến 30 ngày.'); return; }
    if (paymentMethod === 'BankTransfer' && (!transactionId.trim() || !proof)) {
      setDepositError('Chuyển khoản yêu cầu mã giao dịch và ảnh minh chứng.'); return;
    }
    setSubmitting(true); setDepositError('');
    try {
      const uploaded = proof ? await viewingApi.uploadDepositProof(proof) : undefined;
      await viewingApi.deposit(depositBooking.id, holdDays, paymentMethod, transactionId.trim() || undefined, uploaded?.id);
      setDepositBooking(null); setFeedback({ type: 'success', message: 'Đặt cọc thành công.' }); await load();
    } catch (exception) { setDepositError(errorMessage(exception)); }
    finally { setSubmitting(false); }
  };

  const counts = {
    total: items.length,
    pending: items.filter(item => item.status === 'Pending').length,
    approved: items.filter(item => item.status === 'Approved').length,
    completed: items.filter(item => item.status === 'Completed').length,
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600"><span className="material-symbols-outlined text-[15px]">calendar_month</span> Quản lý lịch hẹn</span><h2 className="text-2xl font-black text-slate-900 md:text-3xl">Lịch xem phòng & đặt cọc</h2><p className="mt-1 text-sm text-gray-500">{actor === 'tenant' ? 'Theo dõi phản hồi của chủ nhà và tiến trình giữ phòng.' : 'Duyệt yêu cầu xem phòng và quản lý tiền cọc tập trung.'}</p></div>
      <select className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-orange-400" value={status} onChange={event => setStatus(event.target.value as ViewingStatus | '')}>
        <option value="">Tất cả trạng thái</option>
        {Object.keys(labels).slice(0, 7).map(value => <option key={value} value={value}>{labels[value]}</option>)}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { label: 'Tất cả lịch', value: counts.total, icon: 'event_note', color: 'bg-slate-100 text-slate-600' },
        { label: 'Chờ duyệt', value: counts.pending, icon: 'pending_actions', color: 'bg-amber-50 text-amber-600' },
        { label: 'Đã duyệt', value: counts.approved, icon: 'event_available', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Hoàn thành', value: counts.completed, icon: 'task_alt', color: 'bg-blue-50 text-blue-600' },
      ].map(card => <div key={card.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm md:p-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${card.color}`}><span className="material-symbols-outlined text-[21px]">{card.icon}</span></span><span><b className="block text-xl font-black leading-none text-slate-800">{card.value}</b><small className="mt-1 block text-xs font-medium text-gray-500">{card.label}</small></span></div>)}
    </div>
    {feedback && <button onClick={() => setFeedback(null)} className={`w-full rounded-xl border p-3 text-left text-sm font-medium ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{feedback.message}<span className="float-right">×</span></button>}
    {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error} <button className="underline" onClick={() => void load()}>Thử lại</button></div>}
    {loading ? <div className="grid min-h-56 place-items-center rounded-3xl border border-gray-100 bg-white"><div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-100 border-t-orange-500"></div><p className="text-sm text-gray-500">Đang tải lịch hẹn...</p></div></div> : items.length === 0 ? <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-orange-200 bg-white text-center"><div><span className="material-symbols-outlined mb-3 text-[48px] text-orange-200">event_busy</span><h3 className="font-bold text-slate-700">Chưa có lịch xem phòng</h3><p className="mt-1 text-sm text-gray-400">Lịch hẹn mới sẽ xuất hiện tại đây.</p></div></div> :
      <div className="grid gap-4">{items.map(booking => {
        const requested = dateParts(booking.requestedStartAt);
        const scheduled = dateParts(booking.scheduledStartAt);
        const changed = booking.status === 'Rescheduled';
        return <article key={booking.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="flex items-center justify-center gap-3 border-b border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-5 py-4 md:w-36 md:flex-col md:border-b-0 md:border-r">
            <span className="text-xs font-bold uppercase text-orange-500">{requested.weekday}</span><strong className="text-3xl font-black leading-none text-slate-800">{requested.day}</strong><span className="text-xs font-semibold text-slate-500">{requested.month}</span><span className="rounded-lg bg-white px-2.5 py-1 text-sm font-black text-orange-600 shadow-sm">{requested.time}</span>
          </div>
          <div className="min-w-0 flex-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-extrabold text-slate-800 md:text-lg">{booking.roomTitle}</h3>{actor === 'owner' && <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><span className="material-symbols-outlined text-[17px]">person</span>{booking.tenantName}</p>}</div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusStyle[booking.status]}`}>{labels[booking.status]}</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3"><small className="flex items-center gap-1 font-bold uppercase tracking-wide text-slate-400"><span className="material-symbols-outlined text-[15px]">schedule</span> Thời gian yêu cầu</small><p className="mt-1 text-sm font-semibold text-slate-700">{requested.time} – {dateParts(booking.requestedEndAt).time}, {new Date(booking.requestedStartAt).toLocaleDateString('vi-VN')}</p></div>
              <div className={`rounded-2xl p-3 ${changed ? 'bg-blue-50 ring-1 ring-blue-100' : 'bg-slate-50'}`}><small className={`flex items-center gap-1 font-bold uppercase tracking-wide ${changed ? 'text-blue-500' : 'text-slate-400'}`}><span className="material-symbols-outlined text-[15px]">{changed ? 'update' : 'event_available'}</span> {changed ? 'Thời gian chủ nhà đề xuất' : 'Lịch hiện tại'}</small><p className="mt-1 text-sm font-semibold text-slate-700">{scheduled.time} – {dateParts(booking.scheduledEndAt).time}, {booking.scheduledStartAt ? new Date(booking.scheduledStartAt).toLocaleDateString('vi-VN') : '—'}</p></div>
            </div>
            {(booking.tenantNote || booking.ownerNote || booking.rejectReason) && <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${booking.rejectReason ? 'bg-red-50 text-red-700' : 'bg-amber-50/70 text-slate-600'}`}><span className="material-symbols-outlined mt-0.5 text-[17px]">{booking.rejectReason ? 'info' : 'notes'}</span><span><b>{booking.rejectReason ? 'Lý do: ' : 'Ghi chú: '}</b>{booking.ownerNote || booking.rejectReason || booking.tenantNote}</span></div>}
        {booking.deposit && <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm"><b>Cọc: {booking.deposit.amount.toLocaleString('vi-VN')}đ · {labels[booking.deposit.status]}</b><div>Hết hạn: {time(booking.deposit.expiresAt)}</div></div>}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {actor === 'tenant' && booking.status === 'Rescheduled' && <button className="rounded-lg bg-green-600 px-3 py-2 text-white" onClick={() => void run(() => viewingApi.tenantAction(booking.id, 'accept-reschedule'), 'Đã chấp nhận thời gian mới.')}>Chấp nhận giờ mới</button>}
          {actor === 'tenant' && ['Pending', 'Rescheduled', 'Approved'].includes(booking.status) && <button className="rounded-lg border px-3 py-2" onClick={() => openDialog(booking, 'cancel')}>Hủy lịch</button>}
          {actor === 'tenant' && ['Approved', 'Completed'].includes(booking.status) && !booking.deposit && <button className="rounded-lg bg-orange-600 px-3 py-2 text-white" onClick={() => openDeposit(booking)}>Đặt cọc</button>}
          {actor === 'owner' && booking.status === 'Pending' && <><button className="rounded-lg bg-green-600 px-3 py-2 text-white" onClick={() => void run(() => viewingApi.ownerAction(booking.id, 'approve'), 'Đã duyệt lịch xem phòng.')}>Duyệt</button><button className="rounded-lg border px-3 py-2" onClick={() => openDialog(booking, 'reschedule')}>Đề xuất giờ</button><button className="rounded-lg bg-red-50 px-3 py-2 text-red-700" onClick={() => openDialog(booking, 'reject')}>Từ chối</button></>}
          {actor === 'owner' && booking.status === 'Approved' && <><button className="rounded-lg bg-green-600 px-3 py-2 text-white" onClick={() => void run(() => viewingApi.ownerAction(booking.id, 'complete'), 'Đã đánh dấu hoàn thành.')}>Đã xem</button><button className="rounded-lg border px-3 py-2" onClick={() => void run(() => viewingApi.ownerAction(booking.id, 'no-show'), 'Đã ghi nhận khách không đến.')}>Không đến</button></>}
          {actor === 'owner' && booking.deposit?.status === 'Holding' && <button className="rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => void run(() => viewingApi.depositAction(booking.deposit!.id, 'confirm'), 'Đã xác nhận tiền cọc.')}>Xác nhận cọc</button>}
          {actor === 'owner' && booking.deposit && ['Holding', 'Active'].includes(booking.deposit.status) && <button className="rounded-lg border px-3 py-2" onClick={() => openDialog(booking, 'refund')}>Hoàn cọc</button>}
          {actor === 'owner' && booking.deposit?.status === 'Active' && <button className="rounded-lg bg-red-50 px-3 py-2 text-red-700" onClick={() => openDialog(booking, 'forfeit')}>Mất cọc</button>}
        </div></div></div>
      </article>})}</div>}

    {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${dialog.action === 'reschedule' ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-red-600'}`}><span className="material-symbols-outlined">{dialog.action === 'reschedule' ? 'edit_calendar' : 'feedback'}</span></div><div className="flex-1"><h3 className="text-lg font-bold">{dialog.action === 'reschedule' ? 'Đề xuất thời gian mới' : dialog.action === 'reject' ? 'Từ chối lịch xem' : dialog.action === 'cancel' ? 'Hủy lịch xem' : dialog.action === 'refund' ? 'Hoàn tiền cọc' : 'Xác nhận mất cọc'}</h3><p className="mt-1 text-xs text-gray-500">{dialog.booking.roomTitle}</p></div><button onClick={() => setDialog(null)} className="text-xl text-gray-400">×</button></div>
        {dialog.action === 'reschedule' ? <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Bắt đầu<input type="datetime-local" value={actionStart} onChange={event => setActionStart(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:border-orange-400"/></label><label className="text-sm font-medium">Kết thúc<input type="datetime-local" value={actionEnd} onChange={event => setActionEnd(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:border-orange-400"/></label><label className="text-sm font-medium sm:col-span-2">Ghi chú<textarea value={actionNote} onChange={event => setActionNote(event.target.value)} maxLength={500} className="mt-1 min-h-24 w-full resize-none rounded-xl border px-3 py-2.5 outline-none focus:border-orange-400" placeholder="Giải thích ngắn gọn về thời gian đề xuất..."/></label></div> : <label className="block text-sm font-medium">Lý do<textarea autoFocus value={actionReason} onChange={event => setActionReason(event.target.value)} maxLength={500} className="mt-1 min-h-28 w-full resize-none rounded-xl border px-3 py-2.5 outline-none focus:border-orange-400" placeholder="Nhập lý do để người nhận dễ theo dõi..."/></label>}
        {actionError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{actionError}</p>}
        <div className="flex justify-end gap-2"><button disabled={submitting} onClick={() => setDialog(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Hủy</button><button disabled={submitting} onClick={() => void submitDialog()} className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${dialog.action === 'reschedule' ? 'bg-orange-600' : 'bg-red-600'}`}>{submitting ? 'Đang xử lý...' : dialog.action === 'reschedule' ? 'Gửi đề xuất' : 'Xác nhận'}</button></div>
      </div>
    </div>}

    {depositBooking && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6">
      <div><h3 className="text-xl font-bold">Đặt cọc giữ phòng</h3><p className="text-sm text-gray-500">{depositBooking.roomTitle}</p></div>
      <div className="rounded-xl bg-orange-50 p-3"><span className="text-sm">Số tiền do hệ thống xác định</span><div className="text-xl font-black text-orange-700">{depositBooking.requiredDepositAmount.toLocaleString('vi-VN')}đ</div></div>
      <label className="block text-sm font-medium">Số ngày giữ phòng (1–30)<input className="mt-1 w-full rounded-lg border px-3 py-2" type="number" min={1} max={30} value={holdDays} onChange={event => setHoldDays(Number(event.target.value))}/></label>
      <label className="block text-sm font-medium">Phương thức thanh toán<select className="mt-1 w-full rounded-lg border px-3 py-2" value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as 'BankTransfer' | 'Cash')}><option value="BankTransfer">Chuyển khoản</option><option value="Cash">Tiền mặt</option></select></label>
      {paymentMethod === 'BankTransfer' && <><label className="block text-sm font-medium">Mã giao dịch<input className="mt-1 w-full rounded-lg border px-3 py-2" maxLength={100} value={transactionId} onChange={event => setTransactionId(event.target.value)}/></label><label className="block text-sm font-medium">Ảnh minh chứng<input className="mt-1 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setProof(event.target.files?.[0] || null)}/></label></>}
      {depositError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{depositError}</p>}
      <div className="flex justify-end gap-2"><button disabled={submitting} onClick={() => setDepositBooking(null)} className="rounded-lg border px-4 py-2">Hủy</button><button disabled={submitting} onClick={() => void submitDeposit()} className="rounded-lg bg-orange-600 px-4 py-2 text-white disabled:opacity-50">{submitting ? 'Đang xử lý...' : 'Xác nhận đặt cọc'}</button></div>
    </div></div>}
  </div>;
}
