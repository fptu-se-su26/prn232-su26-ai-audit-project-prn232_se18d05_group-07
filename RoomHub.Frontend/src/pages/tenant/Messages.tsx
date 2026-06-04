import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Conversation {
  id: number;
  name: string;
  initials: string;
  last: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Msg {
  id: number;
  fromMe: boolean;
  text: string;
  time: string;
}

const conversations: Conversation[] = [
  { id: 1, name: 'Phan Hoài An (Chủ trọ)', initials: 'AN', last: 'Em qua xem phòng lúc 3h nhé', time: '10:24', unread: 1, online: true },
  { id: 2, name: 'Trần Đình Quý', initials: 'TQ', last: 'Dạ em cảm ơn anh ạ', time: 'Hôm qua', unread: 0, online: false },
  { id: 3, name: 'Hỗ trợ RoomHub', initials: 'RH', last: 'Yêu cầu của bạn đã được tiếp nhận', time: '2 ngày', unread: 0, online: true },
];

const initialThread: Msg[] = [
  { id: 1, fromMe: false, text: 'Chào em, phòng 201 vẫn còn trống nhé.', time: '10:20' },
  { id: 2, fromMe: true, text: 'Dạ anh cho em hỏi giá điện nước tính sao ạ?', time: '10:21' },
  { id: 3, fromMe: false, text: 'Điện 3.5k/kWh, nước 15k/m³ em nhé.', time: '10:22' },
  { id: 4, fromMe: false, text: 'Em qua xem phòng lúc 3h nhé', time: '10:24' },
];

const TenantMessages: React.FC = () => {
  const [active, setActive] = useState(1);
  const [thread, setThread] = useState(initialThread);
  const [input, setInput] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setThread((t) => [...t, { id: Date.now(), fromMe: true, text: input, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  const activeConv = conversations.find((c) => c.id === active)!;

  return (
    <Reveal>
      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden grid md:grid-cols-3 h-[calc(100vh-160px)] min-h-[480px]">
        {/* Danh sách hội thoại */}
        <div className="border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input placeholder="Tìm cuộc trò chuyện..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-container" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${active === c.id ? 'bg-orange-50/60 border-primary-container' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">{c.initials}</div>
                  {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-on-surface truncate">{c.name}</p>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.last}</p>
                </div>
                {c.unread > 0 && <span className="bg-primary-container text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Khung chat */}
        <div className="md:col-span-2 flex flex-col bg-gray-50/40">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
            <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">{activeConv.initials}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">{activeConv.name}</p>
              <p className="text-[11px] text-green-600 font-semibold">{activeConv.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
            </div>
            <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-[20px]">call</span></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {thread.map((m) => (
              <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.fromMe ? 'bg-primary-container text-white rounded-br-md' : 'bg-white border border-gray-100 text-on-surface rounded-bl-md'}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.fromMe ? 'text-orange-100' : 'text-gray-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
            <button type="button" className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><span className="material-symbols-outlined text-[22px]">add_photo_alternate</span></button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-container" />
            <button type="submit" className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center hover:bg-orange-600 transition-colors shrink-0 active:scale-90"><span className="material-symbols-outlined text-[20px]">send</span></button>
          </form>
        </div>
      </div>
    </Reveal>
  );
};

export default TenantMessages;
