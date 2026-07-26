import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  recommendationApi,
  type RecommendationList,
  type RecommendedRoom,
} from '../services/recommendations';

interface RecommendationRowProps {
  /** 'for-you' dùng khẩu vị người dùng; 'similar' cần roomId. */
  mode: 'for-you' | 'similar';
  roomId?: number;
  take?: number;
  /** Ghi đè tiêu đề do máy chủ trả về. */
  heading?: string;
  subheading?: string;
}

const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

/**
 * Dải gợi ý dùng chung cho trang chủ, trang chi tiết phòng và bảng điều khiển người thuê.
 * Tự ẩn hoàn toàn khi không có gợi ý nào — đây là khối phụ trợ, không được chiếm chỗ trống.
 */
const RecommendationRow: React.FC<RecommendationRowProps> = ({
  mode, roomId, take = 6, heading, subheading,
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState<RecommendationList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const result =
        mode === 'similar' && roomId
          ? await recommendationApi.similar(roomId, take)
          : await recommendationApi.forYou(take);

      if (active) {
        setData(result);
        setLoading(false);
      }
    };

    if (mode === 'similar' && !roomId) {
      setLoading(false);
      return;
    }

    void load();
    return () => {
      active = false;
    };
  }, [mode, roomId, take]);

  if (loading || !data || data.items.length === 0) return null;

  const openRoom = (room: RecommendedRoom) => navigate(`/room/${room.id}`);

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-orange-500">
              {data.strategy === 'similar' ? 'travel_explore' : 'recommend'}
            </span>
            {heading ?? data.title}
          </h2>
          {subheading && <p className="text-xs text-gray-400 mt-0.5">{subheading}</p>}
          {!subheading && data.strategy === 'personalized' && (
            <p className="text-xs text-gray-400 mt-0.5">
              Dựa trên phòng bạn đã lưu và đã xem gần đây.
            </p>
          )}
        </div>

        <button
          onClick={() => navigate('/browse')}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {data.items.map((room) => (
          <article
            key={room.id}
            onClick={() => openRoom(room)}
            className="w-[260px] shrink-0 snap-start bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift cursor-pointer group flex flex-col"
          >
            <div className="relative h-36 overflow-hidden bg-gray-100">
              <img
                src={room.image}
                alt={room.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {room.reason && (
                <span className="absolute bottom-2 left-2 max-w-[85%] truncate px-2.5 py-1 bg-white/95 backdrop-blur text-orange-600 rounded-full text-[10px] font-black shadow-sm">
                  {room.reason}
                </span>
              )}
            </div>

            <div className="p-3.5 flex flex-col flex-1">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1.5">
                {room.title}
              </h3>

              <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2 truncate">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                {room.district || room.location}
              </p>

              <div className="mt-auto flex items-end justify-between">
                <span className="text-sm font-black text-orange-600">{money(room.price)}</span>
                <span className="text-[11px] text-gray-400 font-semibold">{room.area} m²</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecommendationRow;
