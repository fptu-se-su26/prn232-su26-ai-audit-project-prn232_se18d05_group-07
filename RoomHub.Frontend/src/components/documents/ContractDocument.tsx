import React from 'react';

export interface ContractDocumentData {
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
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  signaturePath?: string | null;
  terms?: string | null;
}

interface Props {
  data: ContractDocumentData;
  tenantName: string;
  tenantEmail: string;
}

const formatPrice = (v: number) => (v || 0).toLocaleString('vi-VN') + 'đ';
const formatDate = (s: string) => {
  if (!s) return '...../...../.........';
  try {
    return new Date(s).toLocaleDateString('vi-VN');
  } catch {
    return s;
  }
};

/** A4-styled electronic rental contract, designed to be printed to PDF. */
const ContractDocument: React.FC<Props> = ({ data, tenantName, tenantEmail }) => {
  return (
    <div className="font-serif text-gray-800 p-8 md:p-12 border-t-8 border-t-orange-500">
      {/* Header */}
      <div className="text-center pb-5 border-b border-gray-200">
        <div className="flex items-center justify-center gap-1 text-primary-container font-sans font-bold text-lg">
          <span className="material-symbols-outlined text-[22px]">roofing</span>
          <span>RoomHub</span>
        </div>
        <h1 className="text-xl font-extrabold mt-3 uppercase tracking-wide">Hợp đồng thuê phòng trọ</h1>
        <p className="text-[11px] text-gray-500 font-sans mt-1">
          Phòng {data.roomNumber} — {data.buildingName}
        </p>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-gray-200 text-xs font-sans leading-relaxed">
        <div className="space-y-0.5">
          <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">Bên cho thuê (Bên A)</h4>
          <p className="font-extrabold text-sm text-on-surface">{data.ownerName}</p>
          <p><span className="text-gray-500">Điện thoại:</span> {data.ownerPhone || '—'}</p>
          <p><span className="text-gray-500">Email:</span> {data.ownerEmail || '—'}</p>
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">Bên thuê (Bên B)</h4>
          <p className="font-extrabold text-sm text-on-surface">{tenantName || 'Khách thuê'}</p>
          <p><span className="text-gray-500">Email:</span> {tenantEmail || '—'}</p>
        </div>
      </div>

      {/* Room & terms table */}
      <div className="py-5 text-xs font-sans">
        <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-2">Điều khoản chính</h4>
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-gray-150">
            <tr>
              <td className="py-2 text-gray-500 w-1/2">Địa chỉ phòng</td>
              <td className="py-2 font-semibold text-right">{data.buildingAddress}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Loại phòng / Diện tích</td>
              <td className="py-2 font-semibold text-right">{data.roomType} · {data.surfaceArea} m²</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Giá thuê hàng tháng</td>
              <td className="py-2 font-extrabold text-right text-primary-container">{formatPrice(data.rentAmount)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Tiền đặt cọc</td>
              <td className="py-2 font-semibold text-right">{formatPrice(data.depositAmount)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Thời hạn thuê</td>
              <td className="py-2 font-semibold text-right">{formatDate(data.startDate)} — {formatDate(data.endDate)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Trạng thái hợp đồng</td>
              <td className="py-2 font-semibold text-right">{data.status}</td>
            </tr>
          </tbody>
        </table>

        {data.terms && (
          <div className="mt-4">
            <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">Điều khoản bổ sung</h4>
            <p className="whitespace-pre-line text-gray-700 leading-relaxed">{data.terms}</p>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-4 text-center text-xs font-sans pt-6 mt-2 border-t border-dashed border-gray-200">
        <div>
          <p className="font-bold text-gray-500 uppercase text-[9px] tracking-wider">Bên cho thuê (Bên A)</p>
          <div className="h-24 flex items-center justify-center text-gray-300 italic">Ký, ghi rõ họ tên</div>
          <p className="font-extrabold text-on-surface border-t border-gray-200 pt-1">{data.ownerName}</p>
        </div>
        <div>
          <p className="font-bold text-gray-500 uppercase text-[9px] tracking-wider">Bên thuê (Bên B)</p>
          <div className="h-24 flex items-center justify-center">
            {data.signaturePath ? (
              <img src={data.signaturePath} alt="Chữ ký bên thuê" className="max-h-24 object-contain" />
            ) : (
              <span className="text-gray-300 italic">Chưa ký</span>
            )}
          </div>
          <p className="font-extrabold text-on-surface border-t border-gray-200 pt-1">{tenantName || 'Khách thuê'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-center font-sans">
        <p className="text-[9px] text-gray-400 leading-normal max-w-md mx-auto">
          Hợp đồng điện tử được tạo bởi nền tảng RoomHub. Chữ ký điện tử của Bên B được ghi nhận và có giá trị xác nhận trên hệ thống.
        </p>
      </div>
    </div>
  );
};

export default ContractDocument;
