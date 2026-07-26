import api from './api';

export type RecommendationStrategy = 'personalized' | 'featured' | 'similar';

export interface RecommendedRoom {
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
  matchScore: number;
  /** Lý do hiển thị cho người dùng, ví dụ "Cùng khu vực Hải Châu". */
  reason: string;
}

export interface RecommendationList {
  items: RecommendedRoom[];
  strategy: RecommendationStrategy;
  title: string;
}

const EMPTY: RecommendationList = { items: [], strategy: 'featured', title: '' };

export const recommendationApi = {
  /** Gợi ý theo khẩu vị. Gọi được cả khi chưa đăng nhập. */
  forYou: async (take = 6): Promise<RecommendationList> => {
    try {
      return (await api.get('/recommendations/for-you', { params: { take } })).data;
    } catch {
      // Gợi ý là phần phụ trợ — hỏng thì ẩn đi, không được làm vỡ trang.
      return EMPTY;
    }
  },

  similar: async (roomId: number, take = 6): Promise<RecommendationList> => {
    try {
      return (await api.get(`/recommendations/similar/${roomId}`, { params: { take } })).data;
    } catch {
      return EMPTY;
    }
  },
};
