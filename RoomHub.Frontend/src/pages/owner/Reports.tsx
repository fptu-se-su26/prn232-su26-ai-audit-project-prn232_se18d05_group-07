import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageType } from '../../App';
import {
  reportApi,
  type DebtReport,
  type OccupancyReport,
  type ReportRange,
  type RevenueReport,
} from '../../services/reports';

interface ReportsProps {
  setCurrentPage: (page: PageType) => void;
}

type TabKey = 'revenue' | 'occupancy' | 'debt';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'revenue', label: 'Doanh thu', icon: 'payments' },
  { key: 'occupancy', label: 'Tỉ lệ lấp đầy', icon: 'donut_large' },
  { key: 'debt', label: 'Công nợ', icon: 'running_with_errors' },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;
const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
};

/** Mặc định: 6 tháng gần nhất, kết thúc ở tháng hiện tại. */
const defaultRange = (): ReportRange => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return {
    fromMonth: from.getMonth() + 1,
    fromYear: from.getFullYear(),
    toMonth: now.getMonth() + 1,
    toYear: now.getFullYear(),
  };
};

const YEARS = (() => {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1];
})();

const Reports: React.FC<ReportsProps> = ({ setCurrentPage }) => {
  const [range, setRange] = useState<ReportRange>(defaultRange);
  const [buildingId, setBuildingId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabKey>('revenue');

  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyReport | null>(null);
  const [debt, setDebt] = useState<DebtReport | null>(null);

  // Danh sách tòa nhà cho dropdown — lấy một lần, không lọc.
  const [buildings, setBuildings] = useState<{ id: number; name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRange = useMemo<ReportRange>(() => ({ ...range, buildingId }), [range, buildingId]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [revenueData, occupancyData, debtData] = await Promise.all([
        reportApi.revenue(activeRange),
        reportApi.occupancy(buildingId),
        reportApi.debt(buildingId),
      ]);
      setRevenue(revenueData);
      setOccupancy(occupancyData);
      setDebt(debtData);
    } catch {
      setError('Không tải được báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeRange, buildingId]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    reportApi
      .occupancy()
      .then((data) => setBuildings(data.rows.map((r) => ({ id: r.buildingId, name: r.buildingName }))))
      .catch(() => setBuildings([]));
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      await reportApi.exportExcel(activeRange);
    } catch {
      setError('Không xuất được file Excel. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const updateRange = (patch: Partial<ReportRange>) => setRange((prev) => ({ ...prev, ...patch }));

  const selectClass =
    'px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-orange-300 cursor-pointer';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1.5">
            <span
              className="hover:text-orange-500 cursor-pointer transition-colors"
              onClick={() => setCurrentPage('owner-dashboard')}
            >
              Chủ nhà
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-gray-700 font-bold">Báo cáo &amp; Thống kê</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-orange-500">analytics</span>
            Báo cáo &amp; Thống kê
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Doanh thu, tỉ lệ lấp đầy và công nợ trên toàn bộ tài sản của bạn.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || loading}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {exporting ? 'Đang xuất...' : 'Tải Excel'}
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Từ tháng</label>
          <div className="flex gap-2">
            <select className={selectClass} value={range.fromMonth} onChange={(e) => updateRange({ fromMonth: Number(e.target.value) })}>
              {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select className={selectClass} value={range.fromYear} onChange={(e) => updateRange({ fromYear: Number(e.target.value) })}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Đến tháng</label>
          <div className="flex gap-2">
            <select className={selectClass} value={range.toMonth} onChange={(e) => updateRange({ toMonth: Number(e.target.value) })}>
              {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select className={selectClass} value={range.toYear} onChange={(e) => updateRange({ toYear: Number(e.target.value) })}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tài sản</label>
          <select
            className={selectClass}
            value={buildingId ?? ''}
            onChange={(e) => setBuildingId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Tất cả tài sản</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <button
          onClick={() => void fetchReports()}
          className="px-4 py-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 bg-white"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* Thẻ số liệu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Đã thu" value={money(revenue?.totalCollected ?? 0)} hint={revenue?.period ?? ''} icon="savings" tone="emerald" />
        <StatCard label="Còn phải thu" value={money(revenue?.totalOutstanding ?? 0)} hint={`${revenue?.totalInvoiceCount ?? 0} hóa đơn`} icon="pending_actions" tone="amber" />
        <StatCard label="Tỉ lệ lấp đầy" value={`${occupancy?.overallOccupancyRate ?? 0}%`} hint={`${occupancy?.totalOccupiedRooms ?? 0}/${occupancy?.totalRooms ?? 0} phòng`} icon="donut_large" tone="orange" />
        <StatCard label="Công nợ quá hạn" value={money(debt?.overdueDebt ?? 0)} hint={`${debt?.overdueInvoices ?? 0} hóa đơn quá hạn`} icon="running_with_errors" tone="rose" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-gray-400">Đang tải báo cáo...</div>
          ) : activeTab === 'revenue' ? (
            <RevenueTable report={revenue} />
          ) : activeTab === 'occupancy' ? (
            <OccupancyTable report={occupancy} />
          ) : (
            <DebtTable report={debt} />
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Thành phần con
// ==========================================

const TONES: Record<string, { text: string; bg: string }> = {
  emerald: { text: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100 text-emerald-500' },
  amber: { text: 'text-amber-600', bg: 'from-amber-50 to-amber-100 text-amber-500' },
  orange: { text: 'text-orange-600', bg: 'from-orange-50 to-orange-100 text-orange-500' },
  rose: { text: 'text-rose-600', bg: 'from-rose-50 to-rose-100 text-rose-500' },
};

const StatCard: React.FC<{ label: string; value: string; hint: string; icon: string; tone: string }> = ({
  label, value, hint, icon, tone,
}) => {
  const palette = TONES[tone] ?? TONES.orange;
  return (
    <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl flex items-center justify-between transition-all duration-300 hover:-translate-y-1">
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className={`text-xl font-black truncate ${palette.text}`}>{value}</h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold truncate">{hint}</p>
      </div>
      <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${palette.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
    </div>
  );
};

const TH: React.FC<{ children: React.ReactNode; right?: boolean }> = ({ children, right }) => (
  <th className={`px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
);

const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-12 text-center text-xs font-bold text-gray-400">
      Chưa có dữ liệu trong kỳ báo cáo này.
    </td>
  </tr>
);

const RevenueTable: React.FC<{ report: RevenueReport | null }> = ({ report }) => (
  <table className="w-full min-w-[640px]">
    <thead className="bg-gray-50/70">
      <tr>
        <TH>Tháng</TH>
        <TH right>Số hóa đơn</TH>
        <TH right>Đã xuất hóa đơn</TH>
        <TH right>Đã thu</TH>
        <TH right>Còn phải thu</TH>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {!report || report.rows.length === 0 ? (
        <EmptyRow colSpan={5} />
      ) : (
        report.rows.map((row) => (
          <tr key={`${row.year}-${row.month}`} className="hover:bg-orange-50/30 transition-colors">
            <td className="px-5 py-3 text-xs font-bold text-gray-700">{row.period}</td>
            <td className="px-5 py-3 text-xs text-gray-500 text-right">{row.invoiceCount}</td>
            <td className="px-5 py-3 text-xs text-gray-700 text-right font-semibold">{money(row.invoiced)}</td>
            <td className="px-5 py-3 text-xs text-emerald-600 text-right font-bold">{money(row.collected)}</td>
            <td className="px-5 py-3 text-xs text-amber-600 text-right font-bold">{money(row.outstanding)}</td>
          </tr>
        ))
      )}
    </tbody>
    {report && report.rows.length > 0 && (
      <tfoot className="bg-gray-50">
        <tr>
          <td className="px-5 py-3 text-xs font-black text-gray-900">TỔNG CỘNG</td>
          <td className="px-5 py-3 text-xs font-black text-gray-900 text-right">{report.totalInvoiceCount}</td>
          <td className="px-5 py-3 text-xs font-black text-gray-900 text-right">{money(report.totalInvoiced)}</td>
          <td className="px-5 py-3 text-xs font-black text-emerald-600 text-right">{money(report.totalCollected)}</td>
          <td className="px-5 py-3 text-xs font-black text-amber-600 text-right">{money(report.totalOutstanding)}</td>
        </tr>
      </tfoot>
    )}
  </table>
);

const OccupancyTable: React.FC<{ report: OccupancyReport | null }> = ({ report }) => (
  <table className="w-full min-w-[720px]">
    <thead className="bg-gray-50/70">
      <tr>
        <TH>Tài sản</TH>
        <TH right>Tổng phòng</TH>
        <TH right>Đang ở</TH>
        <TH right>Đã cọc</TH>
        <TH right>Còn trống</TH>
        <TH right>Tỉ lệ lấp đầy</TH>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {!report || report.rows.length === 0 ? (
        <EmptyRow colSpan={6} />
      ) : (
        report.rows.map((row) => (
          <tr key={row.buildingId} className="hover:bg-orange-50/30 transition-colors">
            <td className="px-5 py-3">
              <p className="text-xs font-bold text-gray-700">{row.buildingName}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[280px]">{row.address}</p>
            </td>
            <td className="px-5 py-3 text-xs text-gray-700 text-right font-semibold">{row.totalRooms}</td>
            <td className="px-5 py-3 text-xs text-emerald-600 text-right font-bold">{row.occupiedRooms}</td>
            <td className="px-5 py-3 text-xs text-amber-600 text-right font-bold">{row.depositedRooms}</td>
            <td className="px-5 py-3 text-xs text-gray-500 text-right">{row.availableRooms}</td>
            <td className="px-5 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, row.occupancyRate)}%` }} />
                </div>
                <span className="text-xs font-black text-orange-600 w-12 text-right">{row.occupancyRate}%</span>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const DebtTable: React.FC<{ report: DebtReport | null }> = ({ report }) => (
  <table className="w-full min-w-[760px]">
    <thead className="bg-gray-50/70">
      <tr>
        <TH>Phòng</TH>
        <TH>Khách thuê</TH>
        <TH right>Số tiền</TH>
        <TH right>Hạn đóng</TH>
        <TH right>Quá hạn</TH>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {!report || report.rows.length === 0 ? (
        <EmptyRow colSpan={5} />
      ) : (
        report.rows.map((row) => (
          <tr key={row.invoiceId} className="hover:bg-orange-50/30 transition-colors">
            <td className="px-5 py-3">
              <p className="text-xs font-bold text-gray-700">Phòng {row.roomNumber}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{row.buildingName}</p>
            </td>
            <td className="px-5 py-3">
              <p className="text-xs font-bold text-gray-700">{row.tenantName}</p>
              <p className="text-[10px] text-gray-400">{row.tenantPhone || '—'}</p>
            </td>
            <td className="px-5 py-3 text-xs text-gray-900 text-right font-bold">{money(row.amount)}</td>
            <td className="px-5 py-3 text-xs text-gray-500 text-right">{formatDate(row.dueDate)}</td>
            <td className="px-5 py-3 text-right">
              {row.daysOverdue > 0 ? (
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black">
                  {row.daysOverdue} ngày
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-[10px] font-black">
                  Chưa tới hạn
                </span>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
    {report && report.rows.length > 0 && (
      <tfoot className="bg-gray-50">
        <tr>
          <td className="px-5 py-3 text-xs font-black text-gray-900" colSpan={2}>TỔNG CÔNG NỢ</td>
          <td className="px-5 py-3 text-xs font-black text-gray-900 text-right">{money(report.totalDebt)}</td>
          <td className="px-5 py-3" />
          <td className="px-5 py-3 text-xs font-black text-rose-600 text-right">{money(report.overdueDebt)}</td>
        </tr>
      </tfoot>
    )}
  </table>
);

export default Reports;
