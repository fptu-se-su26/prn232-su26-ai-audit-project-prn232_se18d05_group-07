import api from './api';

export type UserStatus = 'Active' | 'Banned' | 'Deleted' | 'EmailUnverified';
export interface AdminUser { id: string; fullName: string; email: string; role: string; status: UserStatus; emailConfirmed: boolean; isBanned: boolean; createdAt: string; bannedUntil?: string; }
export interface AdminUserDetail extends AdminUser { phoneNumber?: string; address?: string; gender?: string; dateOfBirth?: string; avatarUrl?: string; isVerified: boolean; isDeleted: boolean; bannedAt?: string; banReason?: string; bannedByAdminId?: string; }
export interface AuditLog { id: number; actorAdminId?: string; action?: string; details?: string; ipAddress?: string; createdAt: string; }
export interface Page<T> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number; }
export interface UserQuery { page: number; pageSize: number; query?: string; role?: string; status?: string; sortBy?: string; sortDir?: string; }

export const adminUsersApi = {
  list: (params: UserQuery) => api.get<Page<AdminUser>>('/admin/users', { params }).then(r => r.data),
  detail: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`).then(r => r.data),
  auditLogs: (id: string, page = 1) => api.get<Page<AuditLog>>(`/admin/users/${id}/audit-logs`, { params: { page, pageSize: 20 } }).then(r => r.data),
  ban: (id: string, reason: string, bannedUntil?: string) => api.put(`/admin/users/${id}/ban`, { reason, bannedUntil: bannedUntil || null }),
  unban: (id: string, reason: string) => api.put(`/admin/users/${id}/unban`, { reason }),
};
