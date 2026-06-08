import React, { useState, useEffect } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';
import api from '../../services/api';

interface Props {
  invoiceId: string | null;
  setCurrentPage: (page: PageType) => void;
}

interface InvoiceItem {
  label: string;
  detail: string;
  amount: number;
}

interface InvoiceDetail {
  id: string;
  roomNumber: string;
  buildingName: string;
  buildingAddress: string;
  tenantName: string;
  tenantPhone: string;
  month: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  isLinkedAccount: boolean;
  items: InvoiceItem[];
}

const getItemLabel = (itemType: string, defaultDesc: string) => {
  switch (itemType) {
    case 'Rent': return 'Tiền thuê phòng';
    case 'Electricity': return 'Tiền điện';
    case 'Water': return 'Tiền nước';
    case 'Internet': return 'Internet';
    case 'Garbage': return 'Phí rác & Dịch vụ';
    case 'Add': return 'Phụ thu';
    case 'Reduce': return 'Giảm trừ';
    default: return defaultDesc || 'Khoản khác';
  }
};

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const TenantInvoiceDetail: React.FC<Props> = ({ invoiceId, setCurrentPage }) => {
  const [method, setMethod] = useState('vnpay');
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchInvoiceDetail = async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      const res = await api.get(`/tenant/invoices/${invoiceId}`);
      const data = res.data;
      const mappedItems = data.items.map((item: any) => ({
        label: getItemLabel(item.itemType, item.description),
        detail: item.description,
        amount: item.amount
      }));
      setInvoice({
        id: data.id.toString(),
        roomNumber: data.roomNumber,
        buildingName: data.buildingName,
        buildingAddress: data.buildingAddress,
        tenantName: data.tenantName,
        tenantPhone: data.tenantPhone,
        month: data.month,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        totalAmount: data.totalAmount,
        status: data.status,
        isLinkedAccount: data.isLinkedAccount,
        items: mappedItems
      });
    } catch (err) {
      console.error('Lỗi khi tải chi tiết hóa đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const handlePay = async () => {
    if (!invoice) return;
    try {
      setPaying(true);
      const paymentMethod = method === 'bank' ? 'BankTransfer' : 'EWallet';
      const transactionId = `MOCK-${method.toUpperCase()}-${Date.now()}`;
      await api.post(`/tenant/invoices/${invoice.id}/pay`, {
        amount: invoice.totalAmount,
        paymentMethod,
        transactionId
      });
      alert(`Thanh toán thành công hóa đơn HD-${invoice.id} qua ${method.toUpperCase()}!`);
      fetchInvoiceDetail();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Thanh toán thất bại, vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  const handleExportExcel = async () => {
    if (!invoice) return;
    try {
      const response = await api.get(`/tenant/invoices/${invoice.id}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_HD_${invoice.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error('Không thể xuất file Excel hóa đơn:', err);
      alert('Không thể xuất file Excel hóa đơn này.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải chi tiết hóa đơn...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow min-h-[300px] flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">error</span>
        <p className="text-gray-500">Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập.</p>
        <button onClick={() => setCurrentPage('tenant-invoices')} className="mt-4 px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isPaid = invoice.status === 'Đã thanh toán';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => setCurrentPage('tenant-invoices')} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary-container transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Quay lại danh sách
        </button>
        <button 
          onClick={handleExportExcel}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 hover:border-gray-350 text-gray-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm animate-scaleUp"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span> Xuất file Excel
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface">Hóa đơn HD-{invoice.id}</h3>
                <p className="text-xs text-gray-500">{invoice.buildingName} · Phòng {invoice.roomNumber} · Kỳ {invoice.month}</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isPaid ? 'text-green-600 bg-green-50 border border-green-200' : 'text-amber-600 bg-amber-50 border border-amber-200'}`}>
                {invoice.status}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{it.label}</p>
                    <p className="text-[11px] text-gray-500">{it.detail}</p>
                  </div>
                  <p className="text-sm font-bold text-on-surface">{fmt(it.amount)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-orange-50/50 border-t border-gray-100">
              <span className="font-bold text-on-surface">Tổng cộng cần thanh toán</span>
              <span className="text-xl font-bold text-primary-container">{fmt(invoice.totalAmount)}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6">
            <h3 className="font-bold text-on-surface mb-4">Phương thức thanh toán</h3>
            <div className="space-y-2 mb-5">
              {[
                { key: 'vnpay', label: 'VNPay (Mô phỏng)', icon: 'account_balance' },
                { key: 'momo', label: 'Ví MoMo (Mô phỏng)', icon: 'wallet' },
                { key: 'bank', label: 'Chuyển khoản (Mô phỏng)', icon: 'qr_code_2' },
              ].map((m) => (
                <button
                  key={m.key}
                  disabled={isPaid}
                  onClick={() => setMethod(m.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isPaid ? 'opacity-50 cursor-not-allowed border-gray-100' : method === m.key ? 'border-primary-container bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                >
                  <span className={`material-symbols-outlined ${method === m.key ? 'text-primary-container' : 'text-gray-400'}`}>{m.icon}</span>
                  <span className="text-sm font-semibold text-on-surface flex-1">{m.label}</span>
                  {method === m.key && <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>}
                </button>
              ))}
            </div>
            {isPaid ? (
              <div className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span> Hóa đơn đã được thanh toán
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span> {paying ? 'Đang xử lý...' : `Thanh toán ${fmt(invoice.totalAmount)}`}
              </button>
            )}
            <p className="text-[11px] text-gray-400 text-center mt-3">Giao dịch được mã hóa & bảo mật bởi RoomHub.</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default TenantInvoiceDetail;
