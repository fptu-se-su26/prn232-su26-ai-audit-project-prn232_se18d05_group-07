// Canonical set of invoice status strings the backend can send (see InvoiceService.GetEffectiveStatus
// on the backend). Declared once here so pages can't each redeclare a slightly different subset and
// silently drop a case - which already happened twice (owner/InvoiceList.tsx and owner/InvoiceDetail.tsx
// both originally omitted 'Chờ xử lý', so a Pending invoice would render no badge / hit an unhandled
// switch case).
export type InvoiceStatus =
  | 'Nháp'
  | 'Chưa thanh toán'
  | 'Đã thanh toán'
  | 'Thanh toán một phần'
  | 'Quá hạn'
  | 'Đã hủy'
  | 'Chờ xử lý';
