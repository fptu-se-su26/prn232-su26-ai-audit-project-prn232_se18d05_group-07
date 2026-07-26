import api from './api';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  receiverId: string;
  messageText: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentContentType?: string;
  attachmentSize?: number;
}

export interface Conversation {
  id: number;
  ownerId: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  roomId?: number;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
}

// SQL Server DateTime values can be serialized without an offset after being read
// from the database. Chat timestamps are stored in UTC, so append "Z" only when
// the API value has no timezone information. This prevents old messages from
// being interpreted as local time while newly-created messages are treated as UTC.
const normalizeUtcTimestamp = (value: string): string => {
  if (!value || /(?:z|[+-]\d{2}:\d{2})$/i.test(value)) return value;
  return `${value}Z`;
};

const normalizeMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  timestamp: normalizeUtcTimestamp(message.timestamp),
});

const normalizeConversation = (conversation: Conversation): Conversation => ({
  ...conversation,
  updatedAt: normalizeUtcTimestamp(conversation.updatedAt),
});

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chats/conversations');
    return response.data.map(normalizeConversation);
  },

  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/conversations/${conversationId}/messages`);
    return response.data.map(normalizeMessage);
  },

  sendMessage: async (
    conversationId: number,
    messageText: string,
    clientMessageId: string,
    attachment?: ChatAttachment
  ): Promise<ChatMessage> => {
    const response = await api.post(`/chats/conversations/${conversationId}/messages`, {
      messageText,
      clientMessageId,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentContentType: attachment?.contentType,
      attachmentSize: attachment?.size
    });
    return normalizeMessage(response.data);
  },

  uploadAttachment: async (conversationId: number, file: File): Promise<ChatAttachment> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post(
      `/chats/conversations/${conversationId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  createConversation: async (ownerId: string, roomId: number): Promise<Conversation> => {
    const response = await api.post('/chats/conversations', { ownerId, roomId });
    return normalizeConversation(response.data);
  }
};

export interface ChatAttachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}
