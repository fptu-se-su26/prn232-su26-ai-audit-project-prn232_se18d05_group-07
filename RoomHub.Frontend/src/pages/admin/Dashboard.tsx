import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageType } from '../../App';
import { adminDashboardApi, type AdminActivity, type DashboardSummary, type ListingStatuses, type RevenuePoint, type TrendPoint } from '../../services/adminDashboard';

interface Props { setCurrentPage: (page: PageType) => void }
type RangePreset = 7 | 30 | 90 | 'custom';
const dateInput = (date: Date) => date.toISOString().slice(0, 10);
const tomorrowInput = () => { const date = new Date(); date.setDate(date.getDate() + 1); return dateInput(date); };
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('vi-VN');

const LoadingCard = () => <div className="h-28 rounded-2xl bg-gray-200 animate-pulse" />;
const ErrorBox: React.FC<{ retry: () => void }> = ({ retry }) => <div className="p-6 text-center text-sm text-red-600"><p>Không thể tải dữ liệu.</p><button onClick={retry} className="mt-2 font-bold underline">Thử lại</button></div>;

const AdminDashboard: React.FC<Props> = ({ setCurrentPage }) => {
  const [preset, setPreset] = useState<RangePreset>(30);
  const [to, setTo] = useState(tomorrowInput);
  const [from, setFrom] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 29); return dateInput(date); });
  const [summary, setSummary] = useState<DashboardSummary>();
  const [growth, setGrowth] = useState<TrendPoint[]>([]);
  const [statuses, setStatuses] = useState<ListingStatuses>();
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const granularity: 'day' | 'week' | 'month' = preset === 7 ? 'day' : preset === 90 ? 'month' : 'week';
  const load = useCallback(async () => {
    if (!from || !to || from >= to) { setError(true); return; }
    setLoading(true); setError(false);
    try {
      const [summaryData, growthData, statusData, revenueData, activityData] = await Promise.all([
        adminDashboardApi.summary(from, to), adminDashboardApi.userGrowth(from, to, granularity),
        adminDashboardApi.listingStatuses(from, to), adminDashboardApi.revenue(from, to), adminDashboardApi.activities(),
      ]);
      setSummary(summaryData); setGrowth(growthData); setStatuses(statusData); setRevenue(revenueData); setActivities(activityData);
    } catch { setError(true); } finally { setLoading(false); }
  }, [from, to, granularity]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectPreset = (days: 7 | 30 | 90) => {
    const end = new Date(); end.setDate(end.getDate() + 1);
    const start = new Date(); start.setDate(start.getDate() - days + 1);
    setPreset(days); setFrom(dateInput(start)); setTo(dateInput(end));
  };
  const maxGrowth = Math.max(1, ...growth.map(x => x.count));
  const maxRevenue = Math.max(1, ...revenue.map(x => x.revenue));
  const statusItems = useMemo(() => statuses ? [
    ['Chờ duyệt', statuses.pending, 'bg-amber-400'], ['Gắn cờ', statuses.flagged, 'bg-red-500'],
    ['Đã duyệt', statuses.approved, 'bg-green-500'], ['Từ chối', statuses.rejected, 'bg-gray-500'],
  ] as const : [], [statuses]);
  const kpis = summary ? [
    { icon: 'group', label: 'Người dùng', value: number.format(summary.totalUsers), detail: `+${number.format(summary.newUsers)} trong kỳ`, page: 'admin-users' as PageType },
    { icon: 'apartment', label: 'Tòa nhà', value: number.format(summary.totalBuildings), detail: `${number.format(summary.totalRooms)} phòng`, page: 'admin-buildings' as PageType },
    { icon: 'meeting_room', label: 'Tỷ lệ lấp đầy', value: `${summary.occupancyRate}%`, detail: `${summary.occupiedRooms}/${summary.totalRooms} phòng`, page: 'admin-rooms' as PageType },
    { icon: 'payments', label: 'Doanh thu gói', value: currency.format(summary.subscriptionRevenue), detail: `${summary.activeSubscriptions} gói hoạt động`, page: 'admin-subscriptions' as PageType },
  ] : [];

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 rounded-2xl bg-[#161d2e] p-6 text-white md:flex-row md:items-end md:justify-between">
      <div><h2 className="text-2xl font-bold">Tổng quan vận hành</h2><p className="mt-1 text-sm text-white/70">Dữ liệu hệ thống theo khoảng thời gian đã chọn, tính theo giờ địa phương.</p></div>
      <div className="flex flex-wrap items-end gap-2">
        {[7, 30, 90].map(days => <button key={days} onClick={() => selectPreset(days as 7 | 30 | 90)} className={`rounded-lg px-3 py-2 text-xs font-bold ${preset === days ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/20'}`}>{days} ngày</button>)}
        <label className="text-[10px] text-white/70">Từ<input aria-label="Từ ngày" type="date" value={from} max={to} onChange={e => { setPreset('custom'); setFrom(e.target.value); }} className="mt-1 block rounded-lg border-0 bg-white px-2 py-1.5 text-xs text-gray-800" /></label>
        <label className="text-[10px] text-white/70">Đến<input aria-label="Đến ngày" type="date" value={to} min={from} onChange={e => { setPreset('custom'); setTo(e.target.value); }} className="mt-1 block rounded-lg border-0 bg-white px-2 py-1.5 text-xs text-gray-800" /></label>
      </div>
    </div>

    {error ? <div className="rounded-2xl bg-white"><ErrorBox retry={load} /></div> : <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{loading ? Array.from({ length: 4 }, (_, i) => <LoadingCard key={i} />) : kpis.map(k => <button key={k.label} onClick={() => setCurrentPage(k.page)} className="rounded-2xl border border-gray-100 bg-white p-5 text-left soft-shadow transition hover:-translate-y-0.5 hover:border-orange-200">
        <span className="material-symbols-outlined rounded-xl bg-orange-50 p-2 text-orange-500">{k.icon}</span><p className="mt-3 text-2xl font-bold text-on-surface">{k.value}</p><p className="text-xs font-semibold text-gray-500">{k.label}</p><p className="mt-1 text-[11px] text-gray-400">{k.detail}</p>
      </button>)}</div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 soft-shadow lg:col-span-2"><div className="mb-6 flex justify-between"><div><h3 className="font-bold">Người dùng mới</h3><p className="text-xs text-gray-400">Đơn vị: tài khoản · nhóm theo {granularity === 'day' ? 'ngày' : granularity === 'week' ? 'tuần' : 'tháng'}</p></div></div>
          {loading ? <div className="h-52 animate-pulse rounded-xl bg-gray-100" /> : growth.length === 0 ? <p className="py-20 text-center text-sm text-gray-400">Không có dữ liệu trong kỳ.</p> : <div className="flex h-52 items-end gap-2">{growth.map(point => <div key={point.periodStart} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${new Date(point.periodStart).toLocaleDateString('vi-VN')} – ${new Date(point.periodEnd).toLocaleDateString('vi-VN')}: ${point.count} tài khoản`}><span className="hidden text-[10px] font-bold group-hover:block">{point.count}</span><div className="w-full min-w-1 rounded-t bg-gradient-to-t from-orange-600 to-orange-300" style={{ height: `${Math.max(3, point.count / maxGrowth * 85)}%` }} /><span className="max-w-14 truncate text-[9px] text-gray-400">{new Date(point.periodStart).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span></div>)}</div>}
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-6 soft-shadow"><div className="flex items-center justify-between"><h3 className="font-bold">Trạng thái tin đăng</h3><button onClick={() => setCurrentPage('admin-moderation')} className="text-xs font-bold text-orange-500">Xử lý</button></div>
          {loading ? <div className="mt-6 h-48 animate-pulse rounded-xl bg-gray-100" /> : statuses?.total === 0 ? <p className="py-20 text-center text-sm text-gray-400">Không có tin đăng trong kỳ.</p> : <div className="mt-6 space-y-5">{statusItems.map(([label, value, color]) => <div key={label}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><b>{value}</b></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${color}`} style={{ width: `${value / Math.max(1, statuses?.total ?? 1) * 100}%` }} /></div></div>)}</div>}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 soft-shadow lg:col-span-2"><h3 className="font-bold">Doanh thu subscription đã xác nhận</h3><p className="text-xs text-gray-400">Đơn vị: VND · theo tháng · chỉ gói Active</p>
          {loading ? <div className="mt-5 h-44 animate-pulse rounded-xl bg-gray-100" /> : revenue.length === 0 ? <p className="py-16 text-center text-sm text-gray-400">Không có dữ liệu trong kỳ.</p> : <div className="mt-5 flex h-44 items-end gap-3">{revenue.map(point => <div key={point.periodStart} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${new Date(point.periodStart).toLocaleDateString('vi-VN')} – ${new Date(point.periodEnd).toLocaleDateString('vi-VN')}: ${currency.format(point.revenue)}`}><div className="w-full rounded-t bg-indigo-500" style={{ height: `${Math.max(3, point.revenue / maxRevenue * 85)}%` }} /><span className="text-[10px] text-gray-400">T{new Date(point.periodStart).getMonth() + 1}</span></div>)}</div>}
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white soft-shadow"><div className="border-b border-gray-100 px-6 py-4"><h3 className="font-bold">Hoạt động gần đây</h3><p className="text-[10px] text-gray-400">Nguồn: AuditLogs</p></div>
          {loading ? <div className="m-4 h-44 animate-pulse rounded-xl bg-gray-100" /> : activities.length === 0 ? <p className="py-16 text-center text-sm text-gray-400">Chưa có hoạt động.</p> : <div className="max-h-64 space-y-1 overflow-y-auto p-3">{activities.map(a => <div key={a.id} className="flex gap-3 rounded-xl p-2 hover:bg-gray-50"><span className="material-symbols-outlined text-lg text-orange-500">history</span><div className="min-w-0"><p className="truncate text-xs font-semibold" title={a.description}>{a.description}</p><p className="text-[10px] text-gray-400">{a.actorName || 'Hệ thống'} · {new Date(a.createdAt).toLocaleString('vi-VN')}</p></div></div>)}</div>}
        </section>
      </div>
      {summary && <p className="text-right text-[10px] text-gray-400">Khoảng dữ liệu UTC: {new Date(summary.from).toLocaleString('vi-VN')} – {new Date(summary.to).toLocaleString('vi-VN')}</p>}
    </>}
  </div>;
};

export default AdminDashboard;
