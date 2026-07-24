import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5143/api';
export const API_ORIGIN = new URL(API_BASE_URL).origin;


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

let refreshPromise: Promise<string | null> | null = null;

const clearSessionAndRedirect = () => {
  const token = localStorage.getItem('token');
  // Only purge session if a token was present
  if (token) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
  }

  const isAuthPath =
    window.location.pathname === '/login' ||
    window.location.pathname === '/register' ||
    window.location.hash.startsWith('#/login');

  if (!isAuthPath) {
    window.location.hash = '';
  }
};

// Response interceptor: on 401, try once to exchange the refresh token for a new access token
// and replay the original request; log the user out if that fails too.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT clear session on 403 Forbidden errors (user simply lacks role permission for specific endpoint)
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken })
            .then((res) => {
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('refreshToken', res.data.refreshToken);
              return res.data.token as string;
            })
            .catch(() => null)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (!newToken) {
          clearSessionAndRedirect();
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearSessionAndRedirect();
        return Promise.reject(error);
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
