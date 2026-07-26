import { useEffect, useMemo, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr';
import { CalendarDays, Download, FileText, FolderOpen, Image, LoaderCircle, Mic, Paperclip, Phone, PhoneOff, Search, Send, Smile, Video, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatService, type ChatAttachment, type ChatMessage, type Conversation } from '../services/chats';
import { API_ORIGIN } from '../services/api';
import { viewingApi, type ViewingBooking, type ViewingStatus } from '../services/viewings';

type CallMode = 'audio' | 'video';
type CallSignal = { conversationId: number; fromUserId: string; type: string; payload?: any };
type IncomingCall = { conversationId: number; mode: CallMode; offer: RTCSessionDescriptionInit };

const rtcConfig: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const formatBytes = (size?: number) => !size ? '' : size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
const initials = (name: string) => name.split(' ').filter(Boolean).slice(-2).map(x => x[0]).join('').toUpperCase();
const appointmentPreview = (text?: string) => text?.startsWith('📅 Đã gửi yêu cầu đặt lịch')
  ? '📅 Yêu cầu đặt lịch xem phòng'
  : text;
const parseAppointment = (text: string) => {
  if (!text.startsWith('📅 Đã gửi yêu cầu đặt lịch xem phòng')) return null;
  const schedule = text.match(/vào (.+?) \((\d+) phút\)\./);
  const note = text.match(/Ghi chú:\s*(.+?)(?:\r?\n|$)/);
  const bookingId = text.match(/Mã lịch hẹn:\s*#(\d+)/);
  if (!schedule) return null;
  return { dateTime: schedule[1], duration: schedule[2], note: note?.[1], bookingId: bookingId?.[1] };
};
const bookingStatusMeta: Record<ViewingStatus, { label: string; detail: string; className: string }> = {
  Pending: { label: 'Chờ duyệt', detail: 'Đang chờ chủ nhà xác nhận', className: 'bg-amber-100 text-amber-700' },
  Approved: { label: 'Đã duyệt', detail: 'Chủ nhà đã xác nhận lịch hẹn', className: 'bg-emerald-100 text-emerald-700' },
  Rescheduled: { label: 'Giờ mới', detail: 'Chủ nhà đã đề xuất thời gian mới', className: 'bg-blue-100 text-blue-700' },
  Rejected: { label: 'Từ chối', detail: 'Yêu cầu đã bị từ chối', className: 'bg-red-100 text-red-700' },
  Cancelled: { label: 'Đã hủy', detail: 'Lịch hẹn đã được hủy', className: 'bg-slate-100 text-slate-600' },
  Completed: { label: 'Hoàn thành', detail: 'Buổi xem phòng đã hoàn thành', className: 'bg-emerald-100 text-emerald-700' },
  NoShow: { label: 'Không đến', detail: 'Khách thuê không đến theo lịch', className: 'bg-slate-100 text-slate-600' },
};

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentStart, setAppointmentStart] = useState('');
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [appointmentNote, setAppointmentNote] = useState('');
  const [bookingById, setBookingById] = useState<Record<number, ViewingBooking>>({});
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [callMode, setCallMode] = useState<CallMode | null>(null);
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [callStatus, setCallStatus] = useState('');
  const connectionRef = useRef<HubConnection | null>(null);
  const activeIdRef = useRef<number | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLElement>(null);

  const otherName = (c: Conversation) => user?.id === c.ownerId ? c.tenantName : c.ownerName;
  const filtered = useMemo(() => conversations.filter(c => otherName(c).toLowerCase().includes(search.toLowerCase())), [conversations, search, user?.id]);
  const visibleMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(message =>
      message.messageText.toLowerCase().includes(query) ||
      message.attachmentName?.toLowerCase().includes(query));
  }, [messages, messageSearch]);
  const sharedFiles = useMemo(() => messages.filter(message => !!message.attachmentUrl).reverse(), [messages]);

  useEffect(() => {
    const ids = messages.map(message => parseAppointment(message.messageText)?.bookingId).filter(Boolean);
    if (!ids.length || !user?.role) return;
    const loadBookingStatuses = async () => {
      try {
        const page = user.role === 'Tenant' ? await viewingApi.tenantList() : await viewingApi.ownerList();
        setBookingById(Object.fromEntries(page.items.map(booking => [booking.id, booking])));
      } catch { /* Chat remains usable when booking status cannot be refreshed. */ }
    };
    void loadBookingStatuses();
    const interval = window.setInterval(() => void loadBookingStatuses(), 30_000);
    window.addEventListener('focus', loadBookingStatuses);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', loadBookingStatuses);
    };
  }, [messages, user?.role]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      setActive(current => {
        const requestedId = Number(sessionStorage.getItem('roomhub:open-conversation'));
        const requested = Number.isFinite(requestedId) ? data.find(c => c.id === requestedId) : undefined;
        if (requested) {
          sessionStorage.removeItem('roomhub:open-conversation');
          return requested;
        }
        return current ? data.find(c => c.id === current.id) ?? current : data[0] ?? null;
      });
    } catch { setError('Không thể tải danh sách hội thoại.'); }
  };
  const loadMessages = async (id: number) => {
    try { setMessages(await chatService.getMessages(id)); window.dispatchEvent(new Event('chat_read')); }
    catch { setError('Không thể tải tin nhắn.'); }
  };

  useEffect(() => { void loadConversations(); }, []);
  useEffect(() => {
    activeIdRef.current = active?.id ?? null;
    setAttachment(null);
    setMessageSearch('');
    setShowMessageSearch(false);
    setShowSharedFiles(false);
    if (active) void loadMessages(active.id);
  }, [active?.id]);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, active?.id]);

  const sendSignal = async (conversationId: number, type: string, payload?: unknown) =>
    connectionRef.current?.invoke('SendCallSignal', conversationId, type, payload);

  const cleanupCall = () => {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current = null;
    localStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setCallMode(null); setIncoming(null); setCallStatus('');
  };

  const createPeer = (conversationId: number) => {
    const peer = new RTCPeerConnection(rtcConfig);
    peer.onicecandidate = e => { if (e.candidate) void sendSignal(conversationId, 'ice', e.candidate.toJSON()); };
    peer.ontrack = e => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') setCallStatus('Đã kết nối');
      if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) cleanupCall();
    };
    peerRef.current = peer;
    return peer;
  };

  const getMedia = async (mode: CallMode) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const startCall = async (mode: CallMode) => {
    if (!active) return;
    try {
      setCallMode(mode); setCallStatus('Đang gọi...');
      const peer = createPeer(active.id);
      (await getMedia(mode)).getTracks().forEach(track => peer.addTrack(track, localStreamRef.current!));
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await sendSignal(active.id, 'offer', { mode, description: offer });
    } catch { setError('Không thể truy cập micro/camera. Vui lòng kiểm tra quyền trình duyệt.'); cleanupCall(); }
  };

  const acceptCall = async () => {
    if (!incoming) return;
    try {
      setCallMode(incoming.mode); setCallStatus('Đang kết nối...');
      const peer = createPeer(incoming.conversationId);
      (await getMedia(incoming.mode)).getTracks().forEach(track => peer.addTrack(track, localStreamRef.current!));
      await peer.setRemoteDescription(incoming.offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await sendSignal(incoming.conversationId, 'answer', answer);
      setIncoming(null);
    } catch { setError('Không thể nhận cuộc gọi. Vui lòng kiểm tra quyền micro/camera.'); cleanupCall(); }
  };
  const endCall = async (rejected = false) => {
    const id = incoming?.conversationId ?? activeIdRef.current;
    if (id) await sendSignal(id, rejected ? 'reject' : 'end');
    cleanupCall();
  };

  useEffect(() => {
    if (!user?.id) return;
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/chat`, { accessTokenFactory: () => localStorage.getItem('token') ?? '' })
      .withAutomaticReconnect().configureLogging(LogLevel.Warning).build();
    connection.on('messageReceived', (m: ChatMessage) => { if (activeIdRef.current === m.conversationId) void loadMessages(m.conversationId); });
    connection.on('conversationUpdated', loadConversations);
    connection.on('messagesRead', (r: { conversationId: number; messageIds: number[] }) => {
      if (activeIdRef.current === r.conversationId) setMessages(current => current.map(m => r.messageIds.includes(m.id) ? { ...m, isRead: true } : m));
    });
    connection.on('callSignal', async (s: CallSignal) => {
      if (s.type === 'offer') {
        setActive(current => conversations.find(c => c.id === s.conversationId) ?? current);
        setIncoming({ conversationId: s.conversationId, mode: s.payload.mode, offer: s.payload.description });
      } else if (s.type === 'answer' && peerRef.current) {
        await peerRef.current.setRemoteDescription(s.payload);
      } else if (s.type === 'ice' && peerRef.current) {
        try { await peerRef.current.addIceCandidate(s.payload); } catch { /* peer may still be closing */ }
      } else if (s.type === 'reject') { setError('Cuộc gọi không được chấp nhận.'); cleanupCall(); }
      else if (s.type === 'end') cleanupCall();
    });
    void connection.start();
    connectionRef.current = connection;
    return () => { cleanupCall(); if (connection.state !== HubConnectionState.Disconnected) void connection.stop(); };
  }, [user?.id, conversations.length]);

  const selectFile = async (file?: File) => {
    if (!file || !active) return;
    setBusy(true); setError('');
    try { setAttachment(await chatService.uploadAttachment(active.id, file)); }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Không thể tải tệp lên. Tệp tối đa 25 MB.'); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || (!text.trim() && !attachment) || busy) return;
    setBusy(true); setError('');
    try {
      const sent = await chatService.sendMessage(active.id, text.trim(), crypto.randomUUID(), attachment ?? undefined);
      setMessages(current => current.some(m => m.id === sent.id) ? current : [...current, sent]);
      setText(''); setAttachment(null); void loadConversations();
    } catch { setError('Gửi tin nhắn thất bại. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };

  const bookAppointment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!active?.roomId || !appointmentStart || busy) return;
    const start = new Date(appointmentStart);
    const end = new Date(start.getTime() + appointmentDuration * 60_000);
    if (start.getTime() <= Date.now()) {
      setError('Thời gian hẹn phải ở trong tương lai.');
      return;
    }
    setBusy(true); setError('');
    try {
      const booking = await viewingApi.create({
        roomId: active.roomId,
        requestedStartAt: start.toISOString(),
        requestedEndAt: end.toISOString(),
        note: appointmentNote.trim() || undefined,
      });
      const timeLabel = start.toLocaleString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const message = await chatService.sendMessage(
        active.id,
        `📅 Đã gửi yêu cầu đặt lịch xem phòng vào ${timeLabel} (${appointmentDuration} phút).${appointmentNote.trim() ? `\nGhi chú: ${appointmentNote.trim()}` : ''}\nMã lịch hẹn: #${booking.id}`,
        crypto.randomUUID(),
      );
      setMessages(current => [...current, message]);
      setBookingById(current => ({ ...current, [booking.id]: booking }));
      setShowAppointment(false); setAppointmentStart(''); setAppointmentNote('');
      void loadConversations();
    } catch (exception: any) {
      setError(exception?.response?.data?.message ?? 'Không thể tạo lịch hẹn. Vui lòng kiểm tra thời gian và thử lại.');
    } finally { setBusy(false); }
  };

  return (
    <div className="relative h-[calc(100vh-150px)] min-h-[560px] overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_18px_55px_rgba(104,72,40,0.12)]">
      {error && <button onClick={() => setError('')} className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 shadow">{error}</button>}
      <div className="grid h-full min-h-0 md:grid-cols-[320px_1fr]">
        <aside className={`${active ? 'hidden md:flex' : 'flex'} min-h-0 flex-col overflow-hidden border-r border-orange-100 bg-[#fffdf9]`}>
          <div className="border-b border-orange-100 p-5">
            <h1 className="text-xl font-extrabold text-slate-800">Tin nhắn</h1>
            <p className="mt-1 text-xs text-slate-500">Trao đổi nhanh chóng và an tâm</p>
            <label className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-orange-100 focus-within:ring-orange-300">
              <Search size={17} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm cuộc trò chuyện..." className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setActive(c)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${active?.id === c.id ? 'bg-orange-100/70' : 'hover:bg-orange-50'}`}>
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 font-bold text-white shadow-sm">{initials(otherName(c))}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><b className="truncate text-sm text-slate-800">{otherName(c)}</b><span className="text-[10px] text-slate-400">{new Date(c.updatedAt).toLocaleDateString('vi-VN')}</span></div>
                  <p className="truncate text-xs text-slate-500">{appointmentPreview(c.lastMessage) || 'Bắt đầu cuộc trò chuyện'}</p>
                </div>
                {!!c.unreadCount && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{c.unreadCount}</span>}
              </button>
            ))}
            {!filtered.length && <p className="p-8 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện phù hợp.</p>}
          </div>
        </aside>

        <main className={`${active ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-col overflow-hidden bg-[#fffaf4]/50`}>
          {active ? <>
            <header className="flex items-center gap-3 border-b border-orange-100 bg-white/90 px-4 py-3 backdrop-blur">
              <button onClick={() => setActive(null)} className="md:hidden text-slate-500">‹</button>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white">{initials(otherName(active))}</div>
              <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-slate-800">{otherName(active)}</h2><p className="text-xs font-medium text-emerald-600">Sẵn sàng trò chuyện</p></div>
              <button title="Tìm trong cuộc trò chuyện" onClick={() => setShowMessageSearch(value => !value)} className={`grid h-10 w-10 place-items-center rounded-xl hover:bg-orange-50 hover:text-orange-600 ${showMessageSearch ? 'bg-orange-50 text-orange-600' : 'text-slate-500'}`}><Search size={19}/></button>
              <button title="Ảnh và tệp đã gửi" onClick={() => setShowSharedFiles(true)} className={`grid h-10 w-10 place-items-center rounded-xl hover:bg-orange-50 hover:text-orange-600 ${showSharedFiles ? 'bg-orange-50 text-orange-600' : 'text-slate-500'}`}><FolderOpen size={19}/></button>
              {user?.role === 'Tenant' && <button title={active.roomId ? 'Đặt lịch xem phòng' : 'Hội thoại này chưa gắn với phòng'} disabled={!active.roomId} onClick={() => setShowAppointment(true)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-35"><CalendarDays size={19}/></button>}
              <button title="Gọi thoại" onClick={() => void startCall('audio')} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600"><Phone size={19}/></button>
              <button title="Gọi video" onClick={() => void startCall('video')} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600"><Video size={20}/></button>
            </header>
            {showMessageSearch && <div className="border-b border-orange-100 bg-white px-4 py-3">
              <label className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl bg-orange-50/60 px-3 py-2 ring-1 ring-orange-100 focus-within:ring-orange-300">
                <Search size={17} className="text-slate-400"/>
                <input autoFocus value={messageSearch} onChange={event => setMessageSearch(event.target.value)} placeholder="Tìm nội dung hoặc tên tệp..." className="w-full bg-transparent text-sm outline-none"/>
                {messageSearch && <span className="text-xs font-medium text-slate-400">{visibleMessages.length} kết quả</span>}
                <button type="button" onClick={() => { setMessageSearch(''); setShowMessageSearch(false); }} className="text-slate-400 hover:text-slate-700"><X size={17}/></button>
              </label>
            </div>}
            <section ref={messagesContainerRef} className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 py-6 md:px-8">
              <div className="mx-auto max-w-3xl space-y-3">
                {visibleMessages.map(m => {
                  const mine = m.senderId === user?.id;
                  const image = m.attachmentContentType?.startsWith('image/');
                  const appointment = parseAppointment(m.messageText);
                  const liveBooking = appointment?.bookingId ? bookingById[Number(appointment.bookingId)] : undefined;
                  const statusMeta = liveBooking ? bookingStatusMeta[liveBooking.status] : bookingStatusMeta.Pending;
                  return <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] overflow-hidden rounded-2xl shadow-sm ${appointment ? `${mine ? 'rounded-br-md' : 'rounded-bl-md'} border border-orange-200 bg-white text-slate-700` : mine ? 'rounded-br-md bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'rounded-bl-md border border-orange-100 bg-white text-slate-700'}`}>
                      {m.attachmentUrl && (image
                        ? <a href={m.attachmentUrl} target="_blank" rel="noreferrer"><img src={m.attachmentUrl} alt={m.attachmentName} className="max-h-72 w-full object-cover" /></a>
                        : <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 ${mine ? 'bg-white/10' : 'bg-orange-50'}`}><FileText size={25}/><span className="min-w-0 flex-1"><b className="block truncate text-xs">{m.attachmentName}</b><small>{formatBytes(m.attachmentSize)}</small></span><Download size={18}/></a>)}
                      {appointment ? <div className="w-[min(420px,72vw)]">
                        <div className="flex items-center gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white"><CalendarDays size={20}/></span>
                          <span className="min-w-0 flex-1"><b className="block text-sm text-slate-800">Yêu cầu xem phòng</b><span className="text-xs text-slate-500">{statusMeta.detail}</span></span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusMeta.className}`}>{statusMeta.label}</span>
                        </div>
                        <div className="space-y-3 px-4 py-3 text-sm">
                          <div className="flex items-start gap-3"><CalendarDays size={17} className="mt-0.5 shrink-0 text-orange-500"/><span><small className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Ngày và giờ</small><b className="font-semibold text-slate-700">{liveBooking?.scheduledStartAt ? new Date(liveBooking.scheduledStartAt).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : appointment.dateTime}</b></span></div>
                          <div className="flex items-center gap-3"><span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 border-orange-400 text-[8px] font-bold text-orange-500">◷</span><span><small className="mr-2 font-bold uppercase tracking-wide text-slate-400">Thời lượng</small>{appointment.duration} phút</span></div>
                          {appointment.note && <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600"><b className="mr-1">Ghi chú:</b>{appointment.note}</div>}
                        </div>
                        <div className="flex items-center justify-between border-t border-orange-100 px-4 py-2">
                          <span className="text-[10px] font-medium text-slate-400">{appointment.bookingId ? `Mã lịch #${appointment.bookingId}` : 'Lịch xem phòng'}</span>
                          <button type="button" onClick={() => { window.location.hash = user?.role === 'Tenant' ? '#/tenant/viewing-bookings' : '#/owner/viewing-bookings'; }} className="text-xs font-bold text-orange-600 hover:text-orange-700">Xem chi tiết →</button>
                        </div>
                      </div> : m.messageText && <p className="whitespace-pre-wrap break-words px-4 pt-2.5 text-sm leading-relaxed">{m.messageText}</p>}
                      <p className={`px-4 pb-2 pt-1 text-right text-[10px] ${mine && !appointment ? 'text-orange-100' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{mine && ` · ${m.isRead ? 'Đã xem' : 'Đã gửi'}`}</p>
                    </div>
                  </div>;
                })}
                {!visibleMessages.length && <div className="py-20 text-center"><Smile className="mx-auto mb-3 text-orange-300" size={38}/><p className="font-semibold text-slate-600">{messageSearch ? 'Không tìm thấy tin nhắn phù hợp.' : 'Hãy gửi lời chào đầu tiên!'}</p></div>}
              </div>
            </section>
            <form onSubmit={sendMessage} className="border-t border-orange-100 bg-white p-3 md:p-4">
              {attachment && <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-xl bg-orange-50 p-2 text-xs text-slate-700"><Image size={17}/><span className="min-w-0 flex-1 truncate">{attachment.name} · {formatBytes(attachment.size)}</span><button type="button" onClick={() => setAttachment(null)} className="font-bold text-red-500">×</button></div>}
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" onChange={e => void selectFile(e.target.files?.[0])}/>
                <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} title="Gửi ảnh hoặc tệp" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600"><Paperclip size={21}/></button>
                <textarea rows={1} value={text} maxLength={2000} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Nhập tin nhắn..." className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-orange-100 bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"/>
                <button disabled={busy || (!text.trim() && !attachment)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md transition hover:scale-105 disabled:opacity-40">{busy ? <LoaderCircle className="animate-spin" size={20}/> : <Send size={19}/>}</button>
              </div>
            </form>
          </> : <div className="grid h-full place-items-center text-center"><div><div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-orange-100 text-orange-500"><Send size={32}/></div><h2 className="text-xl font-bold text-slate-700">Kết nối thật gần</h2><p className="mt-1 text-sm text-slate-400">Chọn một cuộc trò chuyện để bắt đầu.</p></div></div>}
        </main>
      </div>

      {showSharedFiles && active && <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-orange-100 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-orange-100 p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600"><FolderOpen size={20}/></div>
          <div className="min-w-0 flex-1"><h3 className="font-bold text-slate-800">Ảnh & tệp đã gửi</h3><p className="text-xs text-slate-500">{sharedFiles.length} mục trong cuộc trò chuyện</p></div>
          <button onClick={() => setShowSharedFiles(false)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"><X size={19}/></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {sharedFiles.map(item => {
            const isImage = item.attachmentContentType?.startsWith('image/');
            return <a key={item.id} href={item.attachmentUrl} target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-3 rounded-2xl border border-orange-100 p-3 transition hover:bg-orange-50">
              {isImage
                ? <img src={item.attachmentUrl} alt={item.attachmentName} className="h-16 w-16 shrink-0 rounded-xl object-cover"/>
                : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500"><FileText size={27}/></span>}
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm text-slate-700">{item.attachmentName || 'Tệp đính kèm'}</b>
                <small className="block text-slate-400">{formatBytes(item.attachmentSize)} · {new Date(item.timestamp).toLocaleDateString('vi-VN')}</small>
              </span>
              <Download size={17} className="shrink-0 text-slate-400"/>
            </a>;
          })}
          {!sharedFiles.length && <div className="grid h-full place-items-center py-16 text-center"><div><Image className="mx-auto mb-3 text-orange-200" size={42}/><p className="font-semibold text-slate-600">Chưa có ảnh hoặc tệp</p><p className="mt-1 text-xs text-slate-400">Các tệp đã gửi sẽ xuất hiện tại đây.</p></div></div>}
        </div>
      </div>}

      {showAppointment && active && <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <form onSubmit={bookAppointment} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600"><CalendarDays size={24}/></div>
            <div className="min-w-0 flex-1"><h3 className="text-lg font-bold text-slate-800">Đặt lịch xem phòng</h3><p className="text-xs text-slate-500">Chủ nhà sẽ nhận yêu cầu và xác nhận lịch với bạn.</p></div>
            <button type="button" onClick={() => setShowAppointment(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
          </div>
          <label className="mb-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Ngày và giờ mong muốn</span><input required type="datetime-local" value={appointmentStart} min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)} onChange={event => setAppointmentStart(event.target.value)} className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"/></label>
          <label className="mb-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Thời lượng</span><select value={appointmentDuration} onChange={event => setAppointmentDuration(Number(event.target.value))} className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-300"><option value={30}>30 phút</option><option value={60}>60 phút</option><option value={90}>90 phút</option><option value={120}>120 phút</option></select></label>
          <label className="mb-5 block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Ghi chú cho chủ nhà</span><textarea value={appointmentNote} maxLength={500} onChange={event => setAppointmentNote(event.target.value)} placeholder="Ví dụ: Em có thể đến sớm hơn 10 phút..." className="min-h-24 w-full resize-none rounded-xl border border-orange-100 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"/></label>
          <div className="flex gap-3"><button type="button" onClick={() => setShowAppointment(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Hủy</button><button disabled={busy || !appointmentStart} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <CalendarDays size={18}/>} Gửi yêu cầu</button></div>
        </form>
      </div>}

      {(callMode || incoming) && <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
          <video ref={remoteVideoRef} autoPlay playsInline className={`h-[480px] w-full object-cover ${callMode === 'video' ? '' : 'hidden'}`}/>
          <video ref={localVideoRef} autoPlay muted playsInline className={`absolute right-4 top-4 h-32 w-24 rounded-2xl border-2 border-white/30 object-cover shadow ${callMode === 'video' ? '' : 'hidden'}`}/>
          <div className={`${callMode === 'video' ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-8' : 'grid min-h-[380px] place-items-center text-center'} `}>
            <div>
              <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-orange-500 text-3xl font-bold">{active ? initials(otherName(active)) : <Mic/>}</div>
              <h3 className="text-2xl font-bold">{active ? otherName(active) : 'Cuộc gọi đến'}</h3>
              <p className="mt-2 text-sm text-white/70">{incoming ? `Cuộc gọi ${incoming.mode === 'video' ? 'video' : 'thoại'} đến` : callStatus}</p>
              <div className="mt-8 flex justify-center gap-5">
                {incoming && <button onClick={() => void acceptCall()} className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 hover:bg-emerald-600"><Phone size={23}/></button>}
                <button onClick={() => void endCall(!!incoming)} className="grid h-14 w-14 place-items-center rounded-full bg-red-500 hover:bg-red-600"><PhoneOff size={24}/></button>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
