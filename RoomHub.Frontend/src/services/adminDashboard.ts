import api from './api';

export interface ListingStatuses { pending: number; flagged: number; approved: number; rejected: number; total: number }
export interface DashboardSummary {
  from: string; to: string; totalUsers: number; newUsers: number; usersByRole: Record<string, number>;
  totalBuildings: number; totalRooms: number; occupiedRooms: number; occupancyRate: number;
  listings: ListingStatuses; pendingSubscriptions: number; activeSubscriptions: number;
  subscriptionRevenue: number; openMaintenanceTickets: number;
}
export interface TrendPoint { periodStart: string; periodEnd: string; count: number }
export interface RevenuePoint { periodStart: string; periodEnd: string; revenue: number }
export interface AdminActivity { id: number; action: string; entityType: string; description: string; actorName?: string; details?: string; createdAt: string }

const rangeParams = (from: string, to: string) => ({ from: new Date(`${from}T00:00:00`).toISOString(), to: new Date(`${to}T00:00:00`).toISOString() });

export const adminDashboardApi = {
  summary: async (from: string, to: string) => (await api.get<DashboardSummary>('/admin/dashboard/summary', { params: rangeParams(from, to) })).data,
  userGrowth: async (from: string, to: string, granularity: 'day' | 'week' | 'month') => (await api.get<TrendPoint[]>('/admin/dashboard/user-growth', { params: { ...rangeParams(from, to), granularity } })).data,
  listingStatuses: async (from: string, to: string) => (await api.get<ListingStatuses>('/admin/dashboard/listing-statuses', { params: rangeParams(from, to) })).data,
  revenue: async (from: string, to: string) => (await api.get<RevenuePoint[]>('/admin/dashboard/subscription-revenue', { params: { ...rangeParams(from, to), granularity: 'month' } })).data,
  activities: async () => (await api.get<AdminActivity[]>('/admin/dashboard/recent-activities', { params: { limit: 10 } })).data,
};
