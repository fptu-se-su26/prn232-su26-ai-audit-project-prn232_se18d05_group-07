import api, { API_BASE_URL } from './api';

export interface RevenueReportRow {
  month: number;
  year: number;
  period: string;
  invoiceCount: number;
  invoiced: number;
  collected: number;
  outstanding: number;
}

export interface RevenueReport {
  period: string;
  buildingName?: string | null;
  rows: RevenueReportRow[];
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalInvoiceCount: number;
}

export interface OccupancyReportRow {
  buildingId: number;
  buildingName: string;
  address: string;
  totalRooms: number;
  occupiedRooms: number;
  depositedRooms: number;
  availableRooms: number;
  otherRooms: number;
  occupancyRate: number;
}

export interface OccupancyReport {
  rows: OccupancyReportRow[];
  totalRooms: number;
  totalOccupiedRooms: number;
  totalDepositedRooms: number;
  totalAvailableRooms: number;
  overallOccupancyRate: number;
}

export interface DebtReportRow {
  invoiceId: number;
  buildingName: string;
  roomNumber: string;
  tenantName: string;
  tenantPhone?: string | null;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number;
  status: string;
}

export interface DebtReport {
  rows: DebtReportRow[];
  totalDebt: number;
  overdueDebt: number;
  totalInvoices: number;
  overdueInvoices: number;
}

export interface ReportRange {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
  buildingId?: number;
}

const rangeParams = (range: ReportRange) => ({
  fromMonth: range.fromMonth,
  fromYear: range.fromYear,
  toMonth: range.toMonth,
  toYear: range.toYear,
  buildingId: range.buildingId,
});

export const reportApi = {
  revenue: async (range: ReportRange): Promise<RevenueReport> =>
    (await api.get('/owner/reports/revenue', { params: rangeParams(range) })).data,

  occupancy: async (buildingId?: number): Promise<OccupancyReport> =>
    (await api.get('/owner/reports/occupancy', { params: { buildingId } })).data,

  debt: async (buildingId?: number): Promise<DebtReport> =>
    (await api.get('/owner/reports/debt', { params: { buildingId } })).data,

  /**
   * Tải workbook 3 sheet. Dùng responseType blob vì đây là file nhị phân,
   * và vẫn đi qua `api` để interceptor tự gắn JWT.
   */
  exportExcel: async (range: ReportRange): Promise<void> => {
    const response = await api.get('/owner/reports/export', {
      params: rangeParams(range),
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCao_RoomHub_${range.fromMonth}-${range.fromYear}_${range.toMonth}-${range.toYear}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export { API_BASE_URL };
