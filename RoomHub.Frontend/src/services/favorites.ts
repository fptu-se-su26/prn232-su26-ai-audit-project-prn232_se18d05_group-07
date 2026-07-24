import api from './api';

export interface FavoriteRoom {
  roomId: number;
  title: string;
  roomType: string;
  address: string;
  district: string;
  price: number;
  photoUrl?: string;
  status: string;
  isListingVisible: boolean;
  favoritedAt: string;
}

export interface FavoritePage {
  items: FavoriteRoom[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const favoritesApi = {
  list: (page = 1, pageSize = 12) => api.get<FavoritePage>('/tenant/favorites', { params: { page, pageSize } }).then(r => r.data),
  ids: () => api.get<number[]>('/tenant/favorites/ids').then(r => r.data),
  status: (roomId: number) => api.get<{ isFavorite: boolean }>(`/tenant/favorites/${roomId}/status`).then(r => r.data),
  add: (roomId: number) => api.put(`/tenant/favorites/${roomId}`),
  remove: (roomId: number) => api.delete(`/tenant/favorites/${roomId}`),
};
