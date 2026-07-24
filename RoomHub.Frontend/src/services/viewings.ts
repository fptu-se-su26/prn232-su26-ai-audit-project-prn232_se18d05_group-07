import api from './api';

export type ViewingStatus = 'Pending'|'Approved'|'Rescheduled'|'Rejected'|'Cancelled'|'Completed'|'NoShow';
export interface Deposit { id:number; amount:number; expiresAt:string; status:string; paymentMethod?:string; transactionId?:string; }
export interface ViewingBooking { id:number; roomId:number; roomTitle:string; tenantName:string; requestedStartAt:string; requestedEndAt:string; scheduledStartAt?:string; scheduledEndAt?:string; status:ViewingStatus; tenantNote?:string; ownerNote?:string; rejectReason?:string; deposit?:Deposit; }
interface PagedBookings { items:ViewingBooking[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
const data = <T>(response:{data:{data:T}}) => response.data.data;

export const viewingApi = {
  tenantList: async (status?:ViewingStatus):Promise<PagedBookings> => data(await api.get('/tenant/viewing-bookings', { params:{ page:1, pageSize:50, status } })),
  ownerList: async (status?:ViewingStatus):Promise<PagedBookings> => data(await api.get('/owner/viewing-bookings', { params:{ page:1, pageSize:50, status } })),
  create: async (payload:{roomId:number; requestedStartAt:string; requestedEndAt:string; note?:string}) => data(await api.post('/tenant/viewing-bookings', payload)),
  tenantAction: async (id:number, action:'accept-reschedule'|'cancel', reason='') => data(await api.put(`/tenant/viewing-bookings/${id}/${action}`, action === 'cancel' ? {reason} : {})),
  deposit: async (id:number, amount:number, holdDurationDays:number, paymentMethod:string, transactionId?:string, paymentProofUrl?:string) => data(await api.post(`/tenant/viewing-bookings/${id}/deposit`, {amount,holdDurationDays,paymentMethod,transactionId,paymentProofUrl})),
  ownerAction: async (id:number, action:string, body:object={}) => data(await api.put(`/owner/viewing-bookings/${id}/${action}`, body)),
  depositAction: async (id:number, action:string, reason='') => data(await api.put(`/owner/deposits/${id}/${action}`, reason ? {reason} : {})),
};
