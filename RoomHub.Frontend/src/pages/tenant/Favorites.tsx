import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';
import { favoritesApi, type FavoriteRoom } from '../../services/favorites';

interface Props { setCurrentPage: (page: PageType) => void; }

const PAGE_SIZE = 12;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

const TenantFavorites: React.FC<Props> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<FavoriteRoom[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await favoritesApi.list(page, PAGE_SIZE);
      setRooms(data.items); setTotalPages(data.totalPages);
      if (page > 1 && data.items.length === 0) setPage(page - 1);
    } catch { setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const remove = async (roomId: number) => {
    const previous = rooms;
    setRemoving(roomId);
    setRooms(current => current.filter(room => room.roomId !== roomId));
    try { await favoritesApi.remove(roomId); }
    catch { setRooms(previous); setError('Không thể bỏ lưu phòng. Vui lòng thử lại.'); }
    finally { setRemoving(null); }
  };

  if (loading) return <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />)}</div>;
  if (error && rooms.length === 0) return <div className="bg-white rounded-2xl border p-12 text-center"><p className="text-red-600 mb-4">{error}</p><button onClick={() => void load()} className="px-5 py-2.5 bg-primary-container text-white rounded-xl font-bold">Thử lại</button></div>;
  if (rooms.length === 0) return <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 flex flex-col items-center text-center"><span className="material-symbols-outlined text-[64px] text-gray-300 mb-3">favorite</span><h3 className="font-bold text-on-surface mb-1">Chưa có phòng yêu thích</h3><p className="text-sm text-gray-500 max-w-sm mb-5">Lưu lại những tin đăng bạn quan tâm để dễ dàng xem lại sau.</p><button onClick={() => { setCurrentPage('browse'); navigate('/browse'); }} className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold">Khám phá phòng</button></div>;

  return <div>
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {rooms.map((room, i) => <Reveal key={room.roomId} delay={i * 50}><div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group h-full">
        <div className="h-48 relative overflow-hidden"><img src={room.photoUrl || FALLBACK_IMAGE} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><span className="absolute top-3 left-3 bg-white/90 text-primary-container text-xs font-bold px-2.5 py-1 rounded-md">{room.roomType}</span><span className={`absolute top-3 right-12 text-white text-xs font-bold px-2.5 py-1 rounded-md ${room.isListingVisible ? 'bg-green-500' : 'bg-gray-500'}`}>{room.isListingVisible ? (room.status === 'Available' ? 'Còn trống' : room.status) : 'Không còn hiển thị'}</span><button disabled={removing === room.roomId} onClick={() => void remove(room.roomId)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 disabled:opacity-50" title="Bỏ lưu"><span className="material-symbols-outlined text-[18px] icon-fill">favorite</span></button></div>
        <div className="p-5 flex flex-col flex-grow"><h3 className="font-bold text-on-surface mb-2 line-clamp-2">{room.title}</h3><p className="text-xs text-gray-500 flex items-center gap-1 mb-4"><span className="material-symbols-outlined text-[14px]">location_on</span>{room.address}</p><div className="mt-auto flex items-center justify-between"><p className="text-primary-container font-bold text-lg">{room.price.toLocaleString('vi-VN')}đ<span className="text-xs text-gray-500 font-normal">/tháng</span></p><button disabled={!room.isListingVisible} onClick={() => navigate(`/room/${room.roomId}`)} className="text-primary-container hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-bold disabled:text-gray-400 disabled:cursor-not-allowed">Chi tiết</button></div></div>
      </div></Reveal>)}
    </div>
    {totalPages > 1 && <div className="mt-8 flex justify-center gap-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-xl disabled:opacity-40">Trước</button><span className="px-4 py-2">{page}/{totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-xl disabled:opacity-40">Sau</button></div>}
  </div>;
};

export default TenantFavorites;
