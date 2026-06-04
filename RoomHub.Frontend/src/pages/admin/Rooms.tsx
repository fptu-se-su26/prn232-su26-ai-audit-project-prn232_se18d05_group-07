import React, { useState } from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Listing {
  id: number;
  title: string;
  owner: string;
  price: string;
  district: string;
  status: 'pending' | 'approved' | 'rejected';
  img: string;
}

const initial: Listing[] = [
  { id: 1, title: 'Studio view biển Mỹ Khê đầy đủ nội thất', owner: 'Phan Hoài An', price: '5.500.000đ', district: 'Ngũ Hành Sơn', status: 'pending', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'Căn hộ 1PN trung tâm Hải Châu', owner: 'Lê Thị Hoa', price: '6.200.000đ', district: 'Hải Châu', status: 'pending', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' },
  { id: 3, title: 'Phòng trọ giá rẻ gần ĐH Bách Khoa', owner: 'Trần Văn Nam', price: '2.000.000đ', district: 'Liên Chiểu', status: 'approved', img: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=400&q=80' },
];

const statusMeta = {
  pending: { label: 'Chờ duyệt', cls: 'text-amber-600 bg-amber-50' },
  approved: { label: 'Đã duyệt', cls: 'text-green-600 bg-green-50' },
  rejected: { label: 'Từ chối', cls: 'text-red-600 bg-red-50' },
};

const AdminRooms: React.FC = () => {
  const [listings, setListings] = useState(initial);
  const setStatus = (id: number, status: Listing['status']) => setListings((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <div className="space-y-4">
      {listings.map((l, i) => {
        const meta = statusMeta[l.status];
        return (
          <Reveal key={l.id} delay={i * 60}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <img src={l.img} alt={l.title} className="w-full sm:w-28 h-28 sm:h-20 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-on-surface truncate">{l.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-gray-500">Chủ: {l.owner} · {l.district} · <span className="text-primary-container font-bold">{l.price}/tháng</span></p>
              </div>
              <div className="flex gap-2 shrink-0">
                {l.status === 'pending' ? (
                  <>
                    <button onClick={() => setStatus(l.id, 'approved')} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check</span> Duyệt
                    </button>
                    <button onClick={() => setStatus(l.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">close</span> Từ chối
                    </button>
                  </>
                ) : (
                  <button onClick={() => setStatus(l.id, 'pending')} className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold transition-colors">Đặt lại chờ duyệt</button>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
};

export default AdminRooms;
