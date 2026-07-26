import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

type Report = {
  id: number;
  reviewId: number;
  reasonCode: string;
  description?: string;
  status: string;
};

type Detail = {
  id: number;
  roomTitle?: string;
  tenantName: string;
  contractId?: number;
  contractStatus?: string;
  rating?: number;
  comment?: string;
  moderationStatus: string;
  moderationReason?: string;
  reports: Report[];
};

type ModerationAction = 'hide' | 'remove' | 'restore';

export default function ReviewModeration() {
  const [rows, setRows] = useState<Report[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/reviews/reports?page=1&pageSize=50&status=Pending');
      setRows(response.data.items ?? []);
    } catch (requestError: unknown) {
      const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const openDetail = async (reviewId: number) => {
    try {
      setError('');
      setDetail((await api.get(`/admin/reviews/${reviewId}`)).data);
    } catch (requestError: unknown) {
      const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Không thể tải chi tiết đánh giá.');
    }
  };

  const submitAction = async () => {
    if (!detail || !action) return;
    if (action === 'remove' && !reason.trim()) {
      setError('Lý do gỡ đánh giá là bắt buộc.');
      return;
    }
    if (reason.trim().length > 1000) {
      setError('Lý do kiểm duyệt tối đa 1000 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.put(`/admin/reviews/${detail.id}/${action}`, { reason: reason.trim() });
      setAction(null);
      setReason('');
      setDetail(null);
      await load();
    } catch (requestError: unknown) {
      const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Không thể cập nhật trạng thái đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const dismiss = async (id: number) => {
    try {
      setSubmitting(true);
      setError('');
      await api.put(`/admin/review-reports/${id}/dismiss`, { note: 'Không phát hiện vi phạm' });
      setDetail(null);
      await load();
    } catch (requestError: unknown) {
      const message = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Không thể bỏ qua báo cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  const openAction = (nextAction: ModerationAction) => {
    setReason('');
    setError('');
    setAction(nextAction);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Kiểm duyệt đánh giá</h2>
      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3">Review</th>
              <th>Lý do</th>
              <th>Mô tả</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(report => (
              <tr key={report.id} className="border-t">
                <td className="p-3 text-center">#{report.reviewId}</td>
                <td>{report.reasonCode}</td>
                <td>{report.description || '—'}</td>
                <td>
                  <button className="text-orange-600 font-bold" onClick={() => void openDetail(report.reviewId)}>
                    Xem evidence
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !rows.length && <p className="p-10 text-center">Không có báo cáo chờ xử lý.</p>}
        {loading && <p className="p-10 text-center text-gray-500">Đang tải báo cáo...</p>}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-3">
            <button className="float-right" onClick={() => setDetail(null)}>✕</button>
            <h3 className="font-bold">Review #{detail.id}</h3>
            <p><b>Phòng:</b> {detail.roomTitle || 'Phòng không còn tồn tại'}</p>
            <p><b>Người thuê:</b> {detail.tenantName}</p>
            <p><b>Evidence:</b> {detail.contractId ? `Hợp đồng #${detail.contractId} — ${detail.contractStatus || 'Không rõ trạng thái'}` : 'Không có hợp đồng liên kết'}</p>
            <p>{detail.rating ?? 0}/5 — {detail.comment || 'Không có nhận xét'}</p>
            <p><b>Trạng thái:</b> {detail.moderationStatus}</p>
            {detail.moderationReason && <p><b>Lý do trước đó:</b> {detail.moderationReason}</p>}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => openAction('hide')} className="p-2 bg-amber-100 rounded">Ẩn</button>
              <button onClick={() => openAction('remove')} className="p-2 bg-red-600 text-white rounded">Gỡ</button>
              <button onClick={() => openAction('restore')} className="p-2 bg-green-600 text-white rounded">Khôi phục</button>
              {detail.reports.filter(report => report.status === 'Pending').map(report => (
                <button disabled={submitting} key={report.id} onClick={() => void dismiss(report.id)} className="p-2 bg-gray-100 rounded disabled:opacity-50">
                  Bỏ qua #{report.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {detail && action && (
        <div className="fixed inset-0 z-[60] bg-black/50 grid place-items-center p-4">
          <form className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onSubmit={event => { event.preventDefault(); void submitAction(); }}>
            <h3 className="text-lg font-bold">Xác nhận thao tác kiểm duyệt</h3>
            <label className="block text-sm font-semibold" htmlFor="moderation-reason">
              Lý do {action === 'remove' ? '(bắt buộc)' : '(không bắt buộc)'}
            </label>
            <textarea
              id="moderation-reason"
              value={reason}
              onChange={event => setReason(event.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full rounded-xl border p-3"
              placeholder="Nhập lý do để lưu vào audit log và thông báo cho người thuê"
            />
            <p className="text-xs text-gray-500 text-right">{reason.length}/1000</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAction(null)} className="px-4 py-2 rounded-lg bg-gray-100">Hủy</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50">
                {submitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
