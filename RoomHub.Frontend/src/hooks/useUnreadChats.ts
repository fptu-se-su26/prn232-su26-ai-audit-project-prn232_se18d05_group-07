import { useCallback, useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { API_ORIGIN } from '../services/api';
import { chatService, type ChatMessage } from '../services/chats';

export const useUnreadChats = (enabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const conversations = await chatService.getConversations();
      setUnreadCount(conversations.reduce((sum, item) => sum + item.unreadCount, 0));
    } catch (error) {
      console.error('Không thể tải số tin nhắn chưa đọc:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refetch();
    const handleChatRead = () => void refetch();
    window.addEventListener('chat_read', handleChatRead);

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('messageReceived', (message: ChatMessage) => {
      setLatestMessage(message);
      void refetch();
    });
    connection.on('conversationUpdated', () => void refetch());
    connection.on('messagesRead', () => void refetch());
    void connection.start().catch(error =>
      console.error('Không thể kết nối thông báo tin nhắn:', error));

    return () => {
      window.removeEventListener('chat_read', handleChatRead);
      if (connection.state !== HubConnectionState.Disconnected) void connection.stop();
    };
  }, [enabled, refetch]);

  return { unreadCount, latestMessage, refetch };
};
