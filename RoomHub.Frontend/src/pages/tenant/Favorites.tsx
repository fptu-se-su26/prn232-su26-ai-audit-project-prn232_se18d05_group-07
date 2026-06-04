import React, { useState } from 'react';
import type { PageType } from '../../App';
import { Reveal } from '../../components/parallax/Parallax';

interface Props {
  setCurrentPage: (page: PageType) => void;
}

interface Room {
  id: number;
  title: string;
  area: string;
  price: string;
  type: string;
  img: string;
  available: boolean;
}

const initial: Room[] = [
  { id: 1, title: 'Studio ban công view biển Mỹ Khê', area: 'Ngũ Hành Sơn', price: '5.500.000đ', type: 'Studio', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80', available: true },
  { id: 2, title: 'Căn hộ 1PN trung tâm Hải Châu', area: 'Hải Châu', price: '6.200.000đ', type: 'Căn hộ mini', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80', available: true },
  { id: 3, title: 'Phòng trọ gần ĐH Bách Khoa', area: 'Liên Chiểu', price: '2.000.000đ', type: 'Phòng trọ', img: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80', available: false },
  { id: 4, title: 'Căn hộ dịch vụ cao cấp Sơn Trà', area: 'Sơn Trà', price: '8.500.000đ', type: 'Căn hộ', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80', available: true },
];

const TenantFavorites: React.FC<Props> = ({ setCurrentPage }) => {
  const [rooms, setRooms] = useState(initial);

  const remove = (id: number) => setRooms((r) => r.filter((x) => x.id !== id));

  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-12 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-[64px] text-gray-300 mb-3">favorite</span>
        <h3 className="font-bold text-on-surface mb-1">Chưa có phòng yêu thích</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-5">Lưu lại những tin đăng bạn quan tâm để dễ dàng so sánh và xem lại sau.</p>
        <button onClick={() => setCurrentPage('home')} className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">Khám phá phòng</button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {rooms.map((room, i) => (
        <Reveal key={room.id} delay={i * 70}>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group h-full">
            <div className="h-48 relative overflow-hidden">
              <img src={room.img} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary-container text-xs font-bold px-2.5 py-1 rounded-md">{room.type}</span>
              <span className={`absolute top-3 right-12 text-white text-xs font-bold px-2.5 py-1 rounded-md ${room.available ? 'bg-green-500' : 'bg-gray-400'}`}>{room.available ? 'Còn trống' : 'Đã thuê'}</span>
              <button onClick={() => remove(room.id)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors" title="Bỏ lưu">
                <span className="material-symbols-outlined text-[18px] icon-fill">favorite</span>
              </button>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary-container transition-colors">{room.title}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-[14px]">location_on</span> {room.area}, Đà Nẵng
              </p>
              <div className="mt-auto flex items-center justify-between">
                <p className="text-primary-container font-bold text-lg">{room.price}<span className="text-xs text-gray-500 font-normal">/tháng</span></p>
                <button onClick={() => alert('Xem chi tiết (demo)')} className="text-primary-container hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">Chi tiết</button>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

export default TenantFavorites;
