import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageType } from '../../App';
import {
  adminDashboardApi,
  type AdminActivity,
  type DashboardSummary,
  type ListingStatuses,
  type RevenuePoint,
  type TrendPoint
} from '../../services/adminDashboard';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

type RangePreset = 7 | 30 | 90 | 'custom';
const dateInput = (date: Date) => date.toISOString().slice(0, 10);
const tomorrowInput = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return dateInput(date);
};

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('vi-VN');

const LoadingCard = () => <div className="h-28 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />;
const ErrorBox: React.FC<{ retry: () => void }> = ({ retry }) => (
  <div className="p-8 text-center text-sm text-red-600 space-y-2 bg-red-50 rounded-2xl border border-red-200">
    <span className="material-symbols-outlined text-3xl text-red-500">error</span>
    <p className="font-bold">Không thể tải dữ liệu thống kê hệ thống.</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-all cursor-pointer shadow-sm"
    >
      Thử lại
    </button>
  </div>
);

const AdminDashboard: React.FC<Props> = ({ setCurrentPage }) => {
  const [preset, setPreset] = useState<RangePreset>(30);
  const [to, setTo] = useState(tomorrowInput);
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return dateInput(date);
  });
  const [summary, setSummary] = useState<DashboardSummary>();
  const [growth, setGrowth] = useState<TrendPoint[]>([]);
  const [statuses, setStatuses] = useState<ListingStatuses>();
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const granularity: 'day' | 'week' | 'month' = preset === 7 ? 'day' : preset === 90 ? 'month' : 'week';

  const load = useCallback(async () => {
    if (!from || !to || from >= to) {
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [summaryData, growthData, statusData, revenueData, activityData] = await Promise.all([
        adminDashboardApi.summary(from, to),
        adminDashboardApi.userGrowth(from, to, granularity),
        adminDashboardApi.listingStatuses(from, to),
        adminDashboardApi.revenue(from, to),
        adminDashboardApi.activities(),
      ]);
      setSummary(summaryData);
      setGrowth(growthData);
      setStatuses(statusData);
      setRevenue(revenueData);
      setActivities(activityData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [from, to, granularity]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectPreset = (days: 7 | 30 | 90) => {
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setPreset(days);
    setFrom(dateInput(start));
    setTo(dateInput(end));
  };

  const maxGrowth = Math.max(1, ...growth.map((x) => x.count));
  const maxRevenue = Math.max(1, ...revenue.map((x) => x.revenue));

  const statusItems = useMemo(
    () =>
      statuses
        ? [
            ['Chờ Admin duyệt', statuses.pending, 'bg-amber-400'],
            ['Bị gắn cờ vi phạm', statuses.flagged, 'bg-red-500'],
            ['Đã phê duyệt', statuses.approved, 'bg-green-500'],
            ['Đã từ chối', statuses.rejected, 'bg-gray-400'],
          ] as const
        : [],
    [statuses]
  );

  const kpis = summary
    ? [
        {
          icon: 'group',
          label: 'Tổng người dùng',
          value: number.format(summary.totalUsers),
          detail: `+${number.format(summary.newUsers)} trong kỳ`,
          badgeCls: 'bg-blue-50 text-blue-600',
          page: 'admin-users' as PageType,
        },
        {
          icon: 'apartment',
          label: 'Tổng số tòa nhà',
          value: number.format(summary.totalBuildings),
          detail: `${number.format(summary.totalRooms)} phòng trọ`,
          badgeCls: 'bg-orange-50 text-primary-container',
          page: 'admin-buildings' as PageType,
        },
        {
          icon: 'pie_chart',
          label: 'Tỷ lệ lấp đầy TB',
          value: `${summary.occupancyRate}%`,
          detail: `${summary.occupiedRooms}/${summary.totalRooms} phòng có khách`,
          badgeCls: 'bg-purple-50 text-purple-600',
          page: 'admin-rooms' as PageType,
        },
        {
          icon: 'payments',
          label: 'Doanh thu gói cước',
          value: currency.format(summary.subscriptionRevenue),
          detail: `${summary.activeSubscriptions} gói đang hoạt động`,
          badgeCls: 'bg-emerald-50 text-emerald-600',
          page: 'admin-subscriptions' as PageType,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#161d2e] via-[#1e293b] to-[#25324d] p-6 text-white shadow-xl border border-slate-700/50">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Bảng điều khiển Admin
              </span>
              <span className="text-xs text-white/50">| Realtime Data</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Tổng quan vận hành RoomHub</h2>
            <p className="mt-1 text-xs text-white/70">
              Thống kê toàn diện về người dùng, tòa nhà, doanh thu và kiểm duyệt nội dung nền tảng.
            </p>
          </div>

          {/* Preset Buttons & Date Picker */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => selectPreset(days as 7 | 30 | 90)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    preset === days
                      ? 'bg-gradient-to-r from-orange-500 to-primary-container text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-[11px] text-white/80">
                <span>Từ:</span>
                <input
                  aria-label="Từ ngày"
                  type="date"
                  value={from}
                  max={to}
                  onChange={(e) => {
                    setPreset('custom');
                    setFrom(e.target.value);
                  }}
                  className="rounded-lg border-0 bg-white/90 px-2 py-1 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-orange-400"
                />
              </label>
              <label className="flex items-center gap-1 text-[11px] text-white/80">
                <span>Đến:</span>
                <input
                  aria-label="Đến ngày"
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => {
                    setPreset('custom');
                    setTo(e.target.value);
                  }}
                  className="rounded-lg border-0 bg-white/90 px-2 py-1 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-orange-400"
                />
              </label>

              <button
                onClick={load}
                className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 soft-shadow flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-primary-container">bolt</span> Thao tác nhanh:
        </span>
        <button
          onClick={() => setCurrentPage('admin-buildings')}
          className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">apartment</span> Quản lý Tòa nhà
        </button>
        <button
          onClick={() => setCurrentPage('admin-subscriptions')}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">payments</span> Duyệt Gói dịch vụ
        </button>
        <button
          onClick={() => setCurrentPage('admin-users')}
          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">group</span> Quản lý Người dùng
        </button>
        <button
          onClick={() => setCurrentPage('admin-moderation')}
          className="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span> Duyệt tin AI Moderation
        </button>
      </div>

      {error ? (
        <ErrorBox retry={load} />
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <LoadingCard key={i} />)
              : kpis.map((k) => (
                  <button
                    key={k.label}
                    onClick={() => setCurrentPage(k.page)}
                    className="bg-white rounded-2xl p-5 border border-gray-100 soft-shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.badgeCls}`}>
                        <span className="material-symbols-outlined text-2xl">{k.icon}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-primary-container transition-colors text-base">
                        arrow_forward_ios
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-2xl font-bold text-on-surface group-hover:text-primary-container transition-colors">
                        {k.value}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">{k.label}</p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">{k.detail}</p>
                    </div>
                  </button>
                ))}
          </div>

          {/* Section 1: User Growth Chart & Listing Status Breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* User Growth Chart */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 soft-shadow lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">trending_up</span>
                    Tăng trưởng Người dùng mới
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Thống kê đăng ký theo {granularity === 'day' ? 'ngày' : granularity === 'week' ? 'tuần' : 'tháng'}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-orange-50 text-primary-container rounded-full border border-orange-100">
                  +{growth.reduce((acc, p) => acc + p.count, 0)} Tài khoản
                </span>
              </div>

              {loading ? (
                <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
              ) : growth.length === 0 ? (
                <p className="py-20 text-center text-xs text-gray-400 font-medium">Không có dữ liệu trong kỳ đã chọn.</p>
              ) : (
                <div className="flex h-56 items-end gap-2 pt-6">
                  {growth.map((point) => (
                    <div
                      key={point.periodStart}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                      title={`${new Date(point.periodStart).toLocaleDateString('vi-VN')} – ${new Date(point.periodEnd).toLocaleDateString('vi-VN')}: ${point.count} tài khoản`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-primary-container bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                        {point.count}
                      </span>
                      <div
                        className="w-full min-w-2 rounded-t-lg bg-gradient-to-t from-orange-600 via-primary-container to-amber-400 transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${Math.max(4, (point.count / maxGrowth) * 80)}%` }}
                      />
                      <span className="max-w-14 truncate text-[9px] font-bold text-gray-400">
                        {new Date(point.periodStart).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Listing Status Breakdown */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 soft-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">fact_check</span>
                    Trạng thái kiểm duyệt
                  </h3>
                  <button
                    onClick={() => setCurrentPage('admin-moderation')}
                    className="text-xs font-bold text-primary-container hover:underline cursor-pointer"
                  >
                    Xử lý ngay →
                  </button>
                </div>

                {loading ? (
                  <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
                ) : statuses?.total === 0 ? (
                  <p className="py-16 text-center text-xs text-gray-400 font-medium">Không có tin đăng trong kỳ.</p>
                ) : (
                  <div className="space-y-4">
                    {statusItems.map(([label, value, color]) => {
                      const pct = Math.round((value / Math.max(1, statuses?.total ?? 1)) * 100);
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-600">{label}</span>
                            <span className="text-on-surface">
                              <strong>{value}</strong> ({pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 flex">
                            <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-gray-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-lg shrink-0">auto_awesome</span>
                <span>Hệ thống AI Moderation đang hỗ trợ lọc vi phạm tự động.</span>
              </div>
            </section>
          </div>

          {/* Section 2: Subscription Revenue & Realtime Audit Logs */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Subscription Revenue */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 soft-shadow lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">monetization_on</span>
                    Doanh thu Gói dịch vụ đã xác nhận
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Theo các gói active từ Chủ nhà (Đơn vị: VNĐ)</p>
                </div>
                <button
                  onClick={() => setCurrentPage('admin-subscriptions')}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Nhật ký giao dịch
                </button>
              </div>

              {loading ? (
                <div className="h-44 animate-pulse rounded-2xl bg-gray-100" />
              ) : revenue.length === 0 ? (
                <p className="py-16 text-center text-xs text-gray-400 font-medium">Chưa có dữ liệu doanh thu trong kỳ.</p>
              ) : (
                <div className="flex h-44 items-end gap-3 pt-6">
                  {revenue.map((point) => (
                    <div
                      key={point.periodStart}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                      title={`${new Date(point.periodStart).toLocaleDateString('vi-VN')} – ${new Date(point.periodEnd).toLocaleDateString('vi-VN')}: ${currency.format(point.revenue)}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {currency.format(point.revenue)}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-700 via-indigo-500 to-sky-400 transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 80)}%` }}
                      />
                      <span className="text-[10px] font-bold text-gray-400">
                        Tháng {new Date(point.periodStart).getMonth() + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Realtime Audit Activity Log Feed */}
            <section className="bg-white rounded-3xl border border-gray-100 soft-shadow flex flex-col justify-between overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-base">history</span>
                  Nhật ký hoạt động hệ thống
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">AuditLogs</span>
              </div>

              {loading ? (
                <div className="m-4 h-48 animate-pulse rounded-2xl bg-gray-100" />
              ) : activities.length === 0 ? (
                <p className="py-16 text-center text-xs text-gray-400 font-medium">Chưa có hoạt động gần đây.</p>
              ) : (
                <div className="max-h-72 space-y-1.5 overflow-y-auto p-4 divide-y divide-gray-100">
                  {activities.map((a) => (
                    <div key={a.id} className="pt-2 first:pt-0 flex items-start gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-primary-container flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-sm">notifications</span>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2" title={a.description}>
                          {a.description}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <strong className="text-gray-600">{a.actorName || 'Hệ thống'}</strong> ·{' '}
                          {new Date(a.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {summary && (
            <p className="text-right text-[10px] text-gray-400 font-medium">
              Khoảng dữ liệu hệ thống: {new Date(summary.from).toLocaleString('vi-VN')} – {new Date(summary.to).toLocaleString('vi-VN')}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
