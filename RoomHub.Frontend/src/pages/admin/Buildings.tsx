import React from 'react';
import { Reveal } from '../../components/parallax/Parallax';

interface Building {
  id: number;
  name: string;
  owner: string;
  district: string;
  rooms: number;
  occupied: number;
  img: string;
}

const buildings: Building[] = [
  { id: 1, name: 'RoomHub Hải Châu', owner: 'Phan Hoài An', district: 'Hải Châu', rooms: 24, occupied: 20, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Sun Apartment', owner: 'Lê Thị Hoa', district: 'Sơn Trà', rooms: 16, occupied: 16, img: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Trọ sinh viên Bách Khoa', owner: 'Trần Văn Nam', district: 'Liên Chiểu', rooms: 30, occupied: 22, img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80' },
];

const AdminBuildings: React.FC = () => {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {buildings.map((b, i) => {
        const rate = Math.round((b.occupied / b.rooms) * 100);
        return (
          <Reveal key={b.id} delay={i * 70}>
            <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden hover-lift h-full">
              <div className="h-40 relative">
                <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{b.name}</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {b.district}, Đà Nẵng</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-primary-container flex items-center justify-center text-[10px] font-bold">{b.owner.split(' ').slice(-1)[0][0]}</div>
                  <span className="text-xs text-gray-500">Chủ: <span className="font-semibold text-on-surface">{b.owner}</span></span>
                </div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">Lấp đầy</span>
                  <span className="font-bold text-on-surface">{b.occupied}/{b.rooms} phòng</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${rate === 100 ? 'bg-green-500' : 'bg-primary-container'}`} style={{ width: `${rate}%` }}></div>
                </div>
                <button onClick={() => alert('Xem chi tiết tòa nhà (demo)')} className="w-full mt-4 py-2 bg-gray-50 hover:bg-orange-50 text-on-surface hover:text-primary-container rounded-xl text-sm font-bold transition-colors">Xem chi tiết</button>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
};

export default AdminBuildings;
