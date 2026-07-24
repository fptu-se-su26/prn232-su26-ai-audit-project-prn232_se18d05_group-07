import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import {
  assistantStream,
  assistantSearch,
  type AssistantChatTurn,
  type AssistantRoom,
  type AssistantFilters,
} from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  rooms?: AssistantRoom[];
  suggestions?: string[];
  streaming?: boolean;
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Xin chào 👋 Mình là trợ lý tìm phòng RoomHub. Bạn muốn thuê phòng khu vực nào, tầm giá bao nhiêu? Cứ mô tả tự nhiên nhé!',
  suggestions: [
    'Phòng dưới 3 triệu ở Thủ Đức',
    'Căn hộ mini có gác cho 2 người',
    'Phòng yên tĩnh hợp sinh viên',
  ],
};

const formatPrice = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1).replace('.0', '')} triệu` : `${v.toLocaleString('vi-VN')}đ`;

function RoomCard({ room, onNavigate }: { room: AssistantRoom; onNavigate: (id: number) => void }) {
  return (
    <button
      onClick={() => onNavigate(room.id)}
      className="w-full flex gap-3 p-2 rounded-xl border border-gray-100 bg-white hover:border-primary-container hover:shadow-md transition-all text-left active:scale-[0.98] cursor-pointer"
    >
      <img
        src={room.image}
        alt={room.title}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-on-surface line-clamp-1">{room.title}</p>
        <p className="text-[13px] font-bold text-primary-container mt-0.5">
          {formatPrice(room.price)}/tháng
        </p>
        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
          {Math.round(room.area)}m² · {room.maxPeople} người · {room.district}
        </p>
      </div>
    </button>
  );
}

const TypingDots = () => (
  <div className="flex gap-1 py-1">
    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
  </div>
);

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const lastFilters = useRef<AssistantFilters | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const goToRoom = (id: number) => {
    setOpen(false);
    navigate(`/room/${id}`);
  };

  // Cập nhật tin nhắn assistant cuối cùng (placeholder đang stream).
  const patchLast = (patch: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[copy.length - 1] = patch(copy[copy.length - 1]);
      return copy;
    });
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    const history: AssistantChatTurn[] = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '', streaming: true },
    ]);
    setInput('');
    setLoading(true);

    try {
      // Ưu tiên streaming (SSE).
      await assistantStream(message, history, lastFilters.current, {
        onMeta: ({ rooms, appliedFilters }) => {
          lastFilters.current = appliedFilters;
          patchLast((m) => ({ ...m, rooms }));
        },
        onToken: (t) => patchLast((m) => ({ ...m, content: m.content + t })),
        onDone: ({ suggestions }) => patchLast((m) => ({ ...m, suggestions, streaming: false })),
      });
      patchLast((m) => ({ ...m, streaming: false }));
    } catch {
      // Fallback: gọi endpoint non-streaming.
      try {
        const res = await assistantSearch(message, history, lastFilters.current);
        lastFilters.current = res.appliedFilters;
        patchLast((m) => ({
          ...m,
          content: res.reply,
          rooms: res.rooms,
          suggestions: res.suggestions,
          streaming: false,
        }));
      } catch {
        patchLast((m) => ({
          ...m,
          content: 'Xin lỗi, mình đang gặp trục trặc kết nối. Bạn thử lại sau một chút nhé.',
          streaming: false,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý tìm phòng"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-primary-container text-white shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <MessageCircle size={22} />
          <span className="text-sm font-semibold hidden sm:inline">Trợ lý tìm phòng</span>
        </button>
      )}

      {/* Khung chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[min(380px,calc(100vw-2.5rem))] h-[min(580px,calc(100vh-2.5rem))] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-container text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Trợ lý RoomHub</p>
                <p className="text-[11px] text-white/80 leading-tight">Tìm phòng bằng câu chat</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tin nhắn */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-surface-container-low">
            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              const showDots = !isUser && m.streaming && !m.content;
              return (
                <div key={i} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={isUser ? 'max-w-[80%]' : 'max-w-[92%] w-full'}>
                    {(m.content || showDots) && (
                      <div
                        className={
                          isUser
                            ? 'px-3.5 py-2 rounded-2xl rounded-br-md bg-primary-container text-white text-sm whitespace-pre-wrap'
                            : 'px-3.5 py-2 rounded-2xl rounded-bl-md bg-white text-on-surface text-sm whitespace-pre-wrap border border-gray-100'
                        }
                      >
                        {showDots ? <TypingDots /> : m.content}
                      </div>
                    )}

                    {/* Thẻ phòng */}
                    {m.rooms && m.rooms.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.rooms.map((r) => (
                          <RoomCard key={r.id} room={r} onNavigate={goToRoom} />
                        ))}
                      </div>
                    )}

                    {/* Gợi ý follow-up */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.suggestions.map((s, j) => (
                          <button
                            key={j}
                            onClick={() => send(s)}
                            disabled={loading}
                            className="px-2.5 py-1 rounded-full bg-white border border-primary-container/40 text-primary text-xs hover:bg-primary-container hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ô nhập */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mô tả phòng bạn cần tìm..."
              maxLength={500}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Gửi"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-container text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
