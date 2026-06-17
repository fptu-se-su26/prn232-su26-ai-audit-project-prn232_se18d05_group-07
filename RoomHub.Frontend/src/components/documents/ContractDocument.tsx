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

const Article: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-3">
    <p className="font-bold text-on-surface">{title}</p>
    <div className="mt-1 pl-1 text-gray-700 leading-relaxed">{children}</div>
  </div>
);

/** A4-styled, professionally-laid-out electronic rental contract for printing to PDF. */
const ContractDocument: React.FC<Props> = ({ data, tenantName, tenantEmail }) => {
  const today = new Date();
  const startYear = (() => {
    try {
      return new Date(data.startDate).getFullYear();
    } catch {
      return today.getFullYear();
    }
  })();
  const contractNo = `HĐ-${data.roomNumber}/${startYear}`;
  const signedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div className="font-serif text-gray-800 p-8 md:p-14 text-[13px] leading-relaxed">
      {/* National header */}
      <div className="text-center font-sans">
        <p className="font-bold text-[13px] uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
        <p className="font-bold text-xs">Độc lập &ndash; Tự do &ndash; Hạnh phúc</p>
        <p className="text-gray-400 text-xs tracking-widest mt-0.5">———oOo———</p>
      </div>

      {/* Title */}
      <div className="text-center mt-6 mb-1">
        <h1 className="text-xl font-extrabold uppercase tracking-wide">Hợp đồng thuê phòng trọ</h1>
        <p className="text-xs text-gray-500 mt-1 font-sans">Số: {contractNo}</p>
      </div>

      <p className="italic text-gray-600 my-4">
        Hôm nay, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}, tại {data.buildingName} &mdash; {data.buildingAddress}, chúng tôi gồm:
      </p>

      {/* Parties */}
      <div className="mb-2">
        <p className="font-bold uppercase text-on-surface">Bên cho thuê (Bên A)</p>
        <p>Ông/Bà: <span className="font-bold">{data.ownerName}</span></p>
        <p>Điện thoại: {data.ownerPhone || '—'} &nbsp;·&nbsp; Email: {data.ownerEmail || '—'}</p>
      </div>
      <div className="mb-4">
        <p className="font-bold uppercase text-on-surface">Bên thuê (Bên B)</p>
        <p>Ông/Bà: <span className="font-bold">{tenantName || 'Khách thuê'}</span></p>
        <p>Email: {tenantEmail || '—'}</p>
      </div>

      <p className="mb-3">Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng thuê phòng trọ với các điều khoản sau:</p>

      <Article title="ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG">
        Bên A đồng ý cho Bên B thuê phòng <span className="font-bold">{data.roomNumber}</span> thuộc{' '}
        <span className="font-bold">{data.buildingName}</span>, địa chỉ: {data.buildingAddress}. Loại phòng:{' '}
        {data.roomType}; diện tích sử dụng: {data.surfaceArea} m².
      </Article>

      <Article title="ĐIỀU 2: GIÁ THUÊ VÀ THANH TOÁN">
        <ul className="list-disc pl-5 space-y-0.5">
          <li>Giá thuê: <span className="font-bold text-primary-container">{formatPrice(data.rentAmount)}</span> / tháng.</li>
          <li>Tiền đặt cọc: <span className="font-bold">{formatPrice(data.depositAmount)}</span>.</li>
          <li>Bên B thanh toán đầy đủ, đúng hạn theo kỳ đã thỏa thuận. Tiền cọc được hoàn trả khi kết thúc hợp đồng nếu không phát sinh vi phạm.</li>
        </ul>
      </Article>

      <Article title="ĐIỀU 3: THỜI HẠN THUÊ">
        Thời hạn thuê tính từ ngày <span className="font-bold">{formatDate(data.startDate)}</span> đến ngày{' '}
        <span className="font-bold">{formatDate(data.endDate)}</span>. Tình trạng hợp đồng: {data.status}.
      </Article>

      <Article title="ĐIỀU 4: ĐIỀU KHOẢN BỔ SUNG">
        {data.terms ? (
          <span className="whitespace-pre-line">{data.terms}</span>
        ) : (
          'Hai bên thực hiện đúng quyền và nghĩa vụ; giữ gìn tài sản, an ninh trật tự và vệ sinh chung.'
        )}
      </Article>

      <Article title="ĐIỀU 5: ĐIỀU KHOẢN CHUNG">
        Hai bên cam kết thực hiện đúng các điều khoản đã ghi. Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản
        điện tử có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.
      </Article>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-6 mt-8 text-center text-xs font-sans">
        {/* Bên A — system auto e-signature seal */}
        <div className="flex flex-col items-center">
          <p className="font-bold uppercase tracking-wider text-gray-500">Bên cho thuê (Bên A)</p>
          <div className="h-28 flex items-center justify-center">
            <div className="-rotate-6 border-2 border-primary-container/70 rounded-xl px-4 py-2 text-primary-container bg-orange-50/40">
              <div className="flex items-center justify-center gap-1 font-bold text-[10px]">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary-container text-white text-[9px] leading-none">✓</span>
                ĐÃ KÝ ĐIỆN TỬ
              </div>
              <div className="font-black text-sm leading-tight my-0.5">RoomHub</div>
              <div className="text-[8px] text-primary-container/80">Xác thực hệ thống · {signedDate}</div>
            </div>
          </div>
          <p className="font-extrabold text-on-surface border-t border-gray-200 pt-1 w-full">{data.ownerName}</p>
          <p className="text-[9px] text-gray-400 italic mt-0.5">Ký điện tử tự động bởi hệ thống</p>
        </div>

        {/* Bên B — tenant's mouse-drawn signature */}
        <div className="flex flex-col items-center">
          <p className="font-bold uppercase tracking-wider text-gray-500">Bên thuê (Bên B)</p>
          <div className="h-28 flex items-center justify-center">
            {data.signaturePath ? (
              <img src={data.signaturePath} alt="Chữ ký bên thuê" className="max-h-24 object-contain" />
            ) : (
              <span className="text-gray-300 italic">Chưa ký</span>
            )}
          </div>
          <p className="font-extrabold text-on-surface border-t border-gray-200 pt-1 w-full">{tenantName || 'Khách thuê'}</p>
          <p className="text-[9px] text-gray-400 italic mt-0.5">Ký xác nhận trực tuyến</p>
        </div>
      </div>

      <div className="mt-8 pt-3 border-t border-gray-100 text-center font-sans">
        <p className="text-[9px] text-gray-400 leading-normal max-w-lg mx-auto">
          Hợp đồng điện tử được khởi tạo và xác thực bởi nền tảng RoomHub. Mã hợp đồng {contractNo}. Chữ ký điện tử của các
          bên có giá trị xác nhận trên hệ thống.
        </p>
      </div>
    </div>
  );
};

export default ContractDocument;
