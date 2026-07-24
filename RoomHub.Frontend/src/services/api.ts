import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5143/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g. token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const email = localStorage.getItem('userEmail');
        
        if (refreshToken && email) {
          // Attempt token refresh via API endpoint if we add it, or log out
          // For now, redirect to login if unauthorized
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AI Room-Finder Assistant (RAG)
// ==========================================
export interface AssistantChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantRoom {
  id: number;
  title: string;
  type: string;
  district: string;
  location: string;
  price: number;
  area: number;
  maxPeople: number;
  image: string;
  amenities: string[];
}

export type AssistantFilters = Record<string, unknown>;

export interface AssistantResponse {
  reply: string;
  intent: 'search' | 'question' | 'greeting' | 'out_of_scope';
  appliedFilters: AssistantFilters;
  rooms: AssistantRoom[];
  suggestions: string[];
}

export const assistantSearch = async (
  message: string,
  history: AssistantChatTurn[] = [],
  previousFilters?: AssistantFilters
): Promise<AssistantResponse> => {
  const { data } = await api.post<AssistantResponse>('/assistant/search', {
    message,
    history: history.slice(-6),
    previousFilters,
  });
  return data;
};

// ---------- Streaming (Phase 2) ----------
export interface AssistantStreamHandlers {
  onMeta?: (data: { intent: string; rooms: AssistantRoom[]; appliedFilters: AssistantFilters }) => void;
  onToken?: (text: string) => void;
  onDone?: (data: { suggestions: string[] }) => void;
}

/**
 * Gọi endpoint SSE /assistant/stream và phát các sự kiện meta/token/done.
 * Ném lỗi nếu kết nối thất bại — caller nên fallback sang assistantSearch.
 */
export const assistantStream = async (
  message: string,
  history: AssistantChatTurn[] = [],
  previousFilters: AssistantFilters | undefined,
  handlers: AssistantStreamHandlers,
  signal?: AbortSignal
): Promise<void> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/assistant/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history: history.slice(-6), previousFilters }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';
    for (const chunk of chunks) {
      const dataLine = chunk.split('\n').find((l) => l.startsWith('data:'));
      if (!dataLine) continue;
      const raw = dataLine.slice(5).trim();
      if (!raw) continue;
      let evt: {
        type: string;
        intent?: string;
        rooms?: AssistantRoom[];
        appliedFilters?: AssistantFilters;
        token?: string;
        suggestions?: string[];
      };
      try {
        evt = JSON.parse(raw);
      } catch {
        continue;
      }
      switch (evt.type) {
        case 'meta':
          handlers.onMeta?.({
            intent: evt.intent ?? 'search',
            rooms: evt.rooms ?? [],
            appliedFilters: evt.appliedFilters ?? {},
          });
          break;
        case 'token':
          handlers.onToken?.(evt.token ?? '');
          break;
        case 'done':
          handlers.onDone?.({ suggestions: evt.suggestions ?? [] });
          break;
        default:
          break;
      }
    }
  }
};

export default api;
