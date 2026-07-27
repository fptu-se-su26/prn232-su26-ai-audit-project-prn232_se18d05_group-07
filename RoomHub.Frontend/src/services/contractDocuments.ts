import api from './api';

/** Tải blob PDF về máy với tên file lấy từ header Content-Disposition nếu có. */
const download = async (url: string, fallbackName: string): Promise<void> => {
  const response = await api.get(url, { responseType: 'blob' });

  const disposition = response.headers?.['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const fileName = match ? decodeURIComponent(match[1]) : fallbackName;

  const objectUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const contractDocumentApi = {
  /** Người thuê tải hợp đồng đang hiệu lực của mình. */
  downloadMyContract: () => download('/contracts/my-active/pdf', 'HopDong.pdf'),

  /** Chủ trọ tải hợp đồng đang hiệu lực của một phòng. */
  downloadRoomContract: (roomId: number) =>
    download(`/contracts/by-room/${roomId}/pdf`, `HopDong_Phong_${roomId}.pdf`),

  /** Tải theo mã hợp đồng khi đã biết. */
  downloadById: (contractId: number) =>
    download(`/contracts/${contractId}/pdf`, `HopDong_${contractId}.pdf`),
};
