import { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr';
import { useAuth } from '../hooks/useAuth';
import { chatService } from '../services/chats';
import type { Conversation, ChatMessage } from '../services/chats';
import { API_ORIGIN } from '../services/api';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const activeConversationIdRef = useRef<number | null>(null);

  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversation?.id ?? null;
  }, [activeConversation]);

  useEffect(() => {
    if (!user) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('messageReceived', (message: ChatMessage) => {
      if (activeConversationIdRef.current === message.conversationId) {
        void fetchMessages(message.conversationId);
      }
    });

    connection.on('conversationUpdated', () => {
      fetchConversations();
    });

    connection.start().catch((error) => {
      console.error('Không thể kết nối SignalR:', error);
    });
    connectionRef.current = connection;

    return () => {
      connectionRef.current = null;
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      window.dispatchEvent(new Event('chat_read'));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const message = await chatService.sendMessage(activeConversation.id, newMessage.trim());
      setNewMessage('');
      setMessages((current) => [...current, message]);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUserName = (conv: Conversation) => {
    return user?.id === conv.ownerId ? conv.tenantName : conv.ownerName;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto py-6 px-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      {/* Conversations List */}
      <div className="w-1/3 border-r h-full bg-white flex flex-col rounded-l-lg border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">Chưa có cuộc trò chuyện nào</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-gray-900 truncate">{getOtherUserName(conv)}</div>
                  {conv.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.lastMessage || 'Chưa có tin nhắn'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 h-full flex flex-col bg-white rounded-r-lg">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">
                {getOtherUserName(activeConversation)}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.messageText}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          isMine ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                  Gửi
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 rounded-r-lg">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
