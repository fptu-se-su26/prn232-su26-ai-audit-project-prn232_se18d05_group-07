import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { viewingApi, type ViewingBooking, type ViewingStatus } from '../services/viewings';

const labels:Record<string,string>={Pending:'Chờ duyệt',Approved:'Đã duyệt',Rescheduled:'Đề xuất giờ mới',Rejected:'Từ chối',Cancelled:'Đã hủy',Completed:'Đã xem',NoShow:'Không đến',Holding:'Chờ xác nhận',Active:'Đang giữ phòng',Refunded:'Đã hoàn',Forfeited:'Mất cọc',Released:'Đã giải phóng'};
const time=(value?:string)=>value?new Date(value).toLocaleString('vi-VN'):'—';
const errorMessage=(error:unknown)=>axios.isAxiosError<{message?:string}>(error)?error.response?.data?.message||'Không thể thực hiện yêu cầu.':'Không thể thực hiện yêu cầu.';

export default function ViewingBookings({actor}:{actor:'tenant'|'owner'}) {
  const [items,setItems]=useState<ViewingBooking[]>([]);
  const [status,setStatus]=useState<ViewingStatus|''>('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [depositBooking,setDepositBooking]=useState<ViewingBooking|null>(null);
  const [holdDays,setHoldDays]=useState(7);
  const [paymentMethod,setPaymentMethod]=useState<'BankTransfer'|'Cash'>('BankTransfer');
  const [transactionId,setTransactionId]=useState('');
  const [proof,setProof]=useState<File|null>(null);
  const [submitting,setSubmitting]=useState(false);
  const [depositError,setDepositError]=useState('');

  const load=useCallback(async()=>{
    setLoading(true); setError('');
    try {
      const result=actor==='tenant'?await viewingApi.tenantList(status||undefined):await viewingApi.ownerList(status||undefined);
      setItems(result.items);
    } catch(e) { setError(errorMessage(e)); } finally { setLoading(false); }
  },[actor,status]);
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer)},[load]);

  const run=async(fn:()=>Promise<unknown>)=>{try{await fn();await load()}catch(e){alert(errorMessage(e))}};
  const ownerAction=(booking:ViewingBooking,action:string)=>{
    if(action==='reschedule'){const start=prompt('Giờ bắt đầu mới (ISO hoặc YYYY-MM-DDTHH:mm)');const end=prompt('Giờ kết thúc mới');if(!start||!end)return;return run(()=>viewingApi.ownerAction(booking.id,action,{startAt:new Date(start).toISOString(),endAt:new Date(end).toISOString(),note:prompt('Ghi chú')||''}));}
    if(action==='reject'){const reason=prompt('Lý do từ chối');if(!reason)return;return run(()=>viewingApi.ownerAction(booking.id,action,{reason}));}
    return run(()=>viewingApi.ownerAction(booking.id,action));
  };
  const openDeposit=(booking:ViewingBooking)=>{setDepositBooking(booking);setHoldDays(7);setPaymentMethod('BankTransfer');setTransactionId('');setProof(null);setDepositError('')};
  const submitDeposit=async()=>{
    if(!depositBooking)return;
    if(holdDays<1||holdDays>30){setDepositError('Thời gian giữ phòng phải từ 1 đến 30 ngày.');return}
    if(paymentMethod==='BankTransfer'&&(!transactionId.trim()||!proof)){setDepositError('Chuyển khoản yêu cầu mã giao dịch và ảnh minh chứng.');return}
    setSubmitting(true);setDepositError('');
    try {
      const uploaded=proof?await viewingApi.uploadDepositProof(proof):undefined;
      await viewingApi.deposit(depositBooking.id,holdDays,paymentMethod,transactionId.trim()||undefined,uploaded?.id);
      setDepositBooking(null);
      await load();
    } catch(e) { setDepositError(errorMessage(e)); } finally { setSubmitting(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-2xl font-black">Lịch xem phòng & đặt cọc</h2><p className="text-sm text-gray-500">Theo dõi toàn bộ tiến trình trên hệ thống.</p></div>
      <select className="border rounded-xl px-3 py-2" value={status} onChange={e=>setStatus(e.target.value as ViewingStatus|'')}><option value="">Tất cả trạng thái</option>{Object.keys(labels).slice(0,7).map(x=><option key={x}>{x}</option>)}</select>
    </div>
    {error&&<div className="p-4 bg-red-50 text-red-700 rounded-xl">{error} <button className="underline" onClick={load}>Thử lại</button></div>}
    {loading?<div className="p-10 text-center">Đang tải...</div>:items.length===0?<div className="p-10 text-center bg-white rounded-2xl border">Chưa có lịch xem phòng.</div>:<div className="grid gap-4">{items.map(booking=><article key={booking.id} className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between gap-3"><div><h3 className="font-bold">{booking.roomTitle}</h3>{actor==='owner'&&<p className="text-sm text-gray-500">Khách: {booking.tenantName}</p>}</div><span className="h-fit rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs font-bold">{labels[booking.status]}</span></div>
      <div className="grid sm:grid-cols-2 gap-2 mt-4 text-sm"><p>Yêu cầu: {time(booking.requestedStartAt)} – {time(booking.requestedEndAt)}</p><p>Lịch hiện tại: {time(booking.scheduledStartAt)} – {time(booking.scheduledEndAt)}</p></div>
      {(booking.tenantNote||booking.ownerNote||booking.rejectReason)&&<p className="mt-3 text-sm text-gray-600">{booking.ownerNote||booking.rejectReason||booking.tenantNote}</p>}
      {booking.deposit&&<div className="mt-4 p-3 rounded-xl bg-blue-50 text-sm"><b>Cọc: {booking.deposit.amount.toLocaleString('vi-VN')}đ · {labels[booking.deposit.status]}</b><div>Hết hạn: {time(booking.deposit.expiresAt)}</div>{booking.deposit.status==='Active'&&<div className="text-blue-700">Phòng đang được giữ cho bạn.</div>}</div>}
      <div className="flex flex-wrap gap-2 mt-4">
        {actor==='tenant'&&booking.status==='Rescheduled'&&<button className="bg-green-600 text-white px-3 py-2 rounded-lg" onClick={()=>run(()=>viewingApi.tenantAction(booking.id,'accept-reschedule'))}>Chấp nhận giờ mới</button>}
        {actor==='tenant'&&['Pending','Rescheduled','Approved'].includes(booking.status)&&<button className="px-3 py-2 rounded-lg border" onClick={()=>{const reason=prompt('Lý do hủy');if(reason)run(()=>viewingApi.tenantAction(booking.id,'cancel',reason))}}>Hủy lịch</button>}
        {actor==='tenant'&&['Approved','Completed'].includes(booking.status)&&!booking.deposit&&<button className="px-3 py-2 rounded-lg bg-orange-600 text-white" onClick={()=>openDeposit(booking)}>Đặt cọc</button>}
        {actor==='owner'&&booking.status==='Pending'&&<><button className="px-3 py-2 rounded-lg bg-green-600 text-white" onClick={()=>ownerAction(booking,'approve')}>Duyệt</button><button className="px-3 py-2 rounded-lg border" onClick={()=>ownerAction(booking,'reschedule')}>Đề xuất giờ</button><button className="px-3 py-2 rounded-lg bg-red-50 text-red-700" onClick={()=>ownerAction(booking,'reject')}>Từ chối</button></>}
        {actor==='owner'&&booking.status==='Approved'&&<><button className="px-3 py-2 rounded-lg bg-green-600 text-white" onClick={()=>ownerAction(booking,'complete')}>Đã xem</button><button className="px-3 py-2 rounded-lg border" onClick={()=>ownerAction(booking,'no-show')}>Không đến</button></>}
        {actor==='owner'&&booking.deposit?.status==='Holding'&&<button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={()=>run(()=>viewingApi.depositAction(booking.deposit!.id,'confirm'))}>Xác nhận cọc</button>}
        {actor==='owner'&&booking.deposit&&['Holding','Active'].includes(booking.deposit.status)&&<button className="px-3 py-2 rounded-lg border" onClick={()=>run(()=>viewingApi.depositAction(booking.deposit!.id,'refund',prompt('Lý do hoàn')||''))}>Hoàn cọc</button>}
        {actor==='owner'&&booking.deposit?.status==='Active'&&<button className="px-3 py-2 rounded-lg bg-red-50 text-red-700" onClick={()=>{const reason=prompt('Lý do mất cọc');if(reason)run(()=>viewingApi.depositAction(booking.deposit!.id,'forfeit',reason))}}>Forfeit</button>}
      </div>
    </article>)}</div>}
    {depositBooking&&<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
      <div><h3 className="text-xl font-bold">Đặt cọc giữ phòng</h3><p className="text-sm text-gray-500">{depositBooking.roomTitle}</p></div>
      <div className="rounded-xl bg-orange-50 p-3"><span className="text-sm">Số tiền do hệ thống xác định</span><div className="text-xl font-black text-orange-700">{depositBooking.requiredDepositAmount.toLocaleString('vi-VN')}đ</div></div>
      <label className="block text-sm font-medium">Số ngày giữ phòng (1-30)<input className="mt-1 w-full border rounded-lg px-3 py-2" type="number" min={1} max={30} value={holdDays} onChange={e=>setHoldDays(Number(e.target.value))}/></label>
      <label className="block text-sm font-medium">Phương thức thanh toán<select className="mt-1 w-full border rounded-lg px-3 py-2" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value as 'BankTransfer'|'Cash')}><option value="BankTransfer">Chuyển khoản</option><option value="Cash">Tiền mặt</option></select></label>
      {paymentMethod==='BankTransfer'&&<><label className="block text-sm font-medium">Mã giao dịch<input className="mt-1 w-full border rounded-lg px-3 py-2" maxLength={100} value={transactionId} onChange={e=>setTransactionId(e.target.value)} placeholder="VD: FT260726123456"/></label><label className="block text-sm font-medium">Ảnh minh chứng (tối đa 5 MB)<input className="mt-1 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setProof(e.target.files?.[0]||null)}/></label></>}
      {depositError&&<p className="text-sm text-red-600">{depositError}</p>}
      <div className="flex justify-end gap-2"><button className="px-4 py-2 border rounded-lg" disabled={submitting} onClick={()=>setDepositBooking(null)}>Hủy</button><button className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50" disabled={submitting} onClick={()=>void submitDeposit()}>{submitting?'Đang xử lý...':'Xác nhận đặt cọc'}</button></div>
    </div></div>}
  </div>;
}
