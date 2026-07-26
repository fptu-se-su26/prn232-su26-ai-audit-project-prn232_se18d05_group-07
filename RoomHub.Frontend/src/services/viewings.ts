import api from './api';

export type ViewingStatus = 'Pending'|'Approved'|'Rescheduled'|'Rejected'|'Cancelled'|'Completed'|'NoShow';
export interface Deposit { id:number; amount:number; expiresAt:string; status:string; paymentMethod?:string; transactionId?:string; paymentProofUrl?:string; }
export interface DepositPaymentProof { id:number; originalFileName:string; expiresAt:string; }
export interface ViewingBooking { id:number; roomId:number; roomTitle:string; tenantName:string; requestedStartAt:string; requestedEndAt:string; scheduledStartAt?:string; scheduledEndAt?:string; status:ViewingStatus; tenantNote?:string; ownerNote?:string; rejectReason?:string; requiredDepositAmount:number; deposit?:Deposit; }
export interface PagedBookings { items:ViewingBooking[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
const data = <T>(response:{data:{data:T}}) => response.data.data;
const viewingStatuses:ViewingStatus[]=['Pending','Approved','Rescheduled','Rejected','Cancelled','Completed','NoShow'];
const depositStatuses=['Active','Forfeited','Refunded','Released','Holding'];
const utc=(value?:string)=>!value||/(?:z|[+-]\d{2}:\d{2})$/i.test(value)?value:`${value}Z`;
const normalizeBooking=(booking:any):ViewingBooking=>({
  ...booking,
  status:typeof booking.status==='number'?viewingStatuses[booking.status]:booking.status,
  requestedStartAt:utc(booking.requestedStartAt)!,
  requestedEndAt:utc(booking.requestedEndAt)!,
  scheduledStartAt:utc(booking.scheduledStartAt),
  scheduledEndAt:utc(booking.scheduledEndAt),
  deposit:booking.deposit?{
    ...booking.deposit,
    status:typeof booking.deposit.status==='number'?depositStatuses[booking.deposit.status]:booking.deposit.status,
    expiresAt:utc(booking.deposit.expiresAt)!,
  }:undefined,
});
const normalizePage=(page:PagedBookings):PagedBookings=>({...page,items:page.items.map(normalizeBooking)});

export const viewingApi = {
  tenantList: async (status?:ViewingStatus):Promise<PagedBookings> => normalizePage(data(await api.get('/tenant/viewing-bookings', { params:{ page:1, pageSize:50, status } }))),
  ownerList: async (status?:ViewingStatus):Promise<PagedBookings> => normalizePage(data(await api.get('/owner/viewing-bookings', { params:{ page:1, pageSize:50, status } }))),
  create: async (payload:{roomId:number; requestedStartAt:string; requestedEndAt:string; note?:string}):Promise<ViewingBooking> => normalizeBooking(data(await api.post('/tenant/viewing-bookings', payload))),
  tenantAction: async (id:number, action:'accept-reschedule'|'cancel', reason='') => data(await api.put(`/tenant/viewing-bookings/${id}/${action}`, action === 'cancel' ? {reason} : {})),
  uploadDepositProof: async (file:File):Promise<DepositPaymentProof> => {
    const form = new FormData();
    form.append('file', file);
    return data(await api.post('/tenant/deposits/proofs', form));
  },
  deposit: async (id:number, holdDurationDays:number, paymentMethod:string, transactionId?:string, paymentProofId?:number) => data(await api.post(`/tenant/viewing-bookings/${id}/deposit`, {holdDurationDays,paymentMethod,transactionId,paymentProofId})),
  ownerAction: async (id:number, action:string, body:object={}) => data(await api.put(`/owner/viewing-bookings/${id}/${action}`, body)),
  depositAction: async (id:number, action:string, reason='') => data(await api.put(`/owner/deposits/${id}/${action}`, reason ? {reason} : {})),
};
