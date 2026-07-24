import api from './api';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  receiverId: string;
  messageText: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  ownerId: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chats/conversations');
    return response.data;
  },

  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: number, messageText: string): Promise<ChatMessage> => {
    const response = await api.post(`/chats/conversations/${conversationId}/messages`, { messageText });
    return response.data;
  },

  createConversation: async (tenantId: string, ownerId: string): Promise<Conversation> => {
    const response = await api.post('/chats/conversations', { tenantId, ownerId });
    return response.data;
  }
};
