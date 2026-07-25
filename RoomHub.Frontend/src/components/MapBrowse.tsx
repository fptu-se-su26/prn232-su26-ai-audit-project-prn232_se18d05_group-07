import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../pages/Browse';

// Đà Nẵng làm tâm mặc định (dữ liệu mẫu ở khu vực này).
const DEFAULT_CENTER: [number, number] = [16.0544, 108.2022];

// Khoảng cách Haversine (km) — lọc "gần tôi" phía client.
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatPrice(p: number): string {
  if (p >= 1_000_000) {
    const m = p / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}tr`;
  }
  return `${Math.round(p / 1000)}k`;
}

// Ghim giá dạng "viên thuốc" màu RoomHub.
function priceIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: 'roomhub-price-pin',
    html: `<div style="background:#f97316;color:#fff;font-weight:700;font-size:12px;padding:4px 8px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.3);white-space:nowrap;border:2px solid #fff;">${label}</div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

// Chấm xanh cho vị trí người dùng.
const userIcon = L.divIcon({
  className: 'roomhub-user-pin',
  html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid #fff;border-radius:9999px;box-shadow:0 0 0 4px rgba(37,99,235,.25);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Geocode địa điểm (trường/chỗ làm) bằng Nominatim (OSM) — miễn phí, không cần key.
async function geocode(query: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

// Bay tới tâm khi có vị trí mới.
function FlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

interface MapBrowseProps {
  rooms: Room[];
  loading?: boolean;
}

const MapBrowse: React.FC<MapBrowseProps> = ({ rooms, loading }) => {
  const navigate = useNavigate();

  const roomsWithCoords = useMemo(
    () => rooms.filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'),
    [rooms]
  );

  const [center, setCenter] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [searchText, setSearchText] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const visibleRooms = useMemo(() => {
    if (!center) return roomsWithCoords;
    return roomsWithCoords.filter(
      (r) => distanceKm(center[0], center[1], r.latitude as number, r.longitude as number) <= radiusKm
    );
  }, [roomsWithCoords, center, radiusKm]);

  const mapCenter: [number, number] =
    center ??
    (roomsWithCoords.length > 0
      ? [roomsWithCoords[0].latitude as number, roomsWithCoords[0].longitude as number]
      : DEFAULT_CENTER);

  const handleNearMe = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setGeoLoading(false);
      },
      () => {
        setGeoError('Không lấy được vị trí. Hãy cho phép quyền truy cập vị trí rồi thử lại.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    setGeoLoading(true);
    setGeoError(null);
    try {
      const loc = await geocode(q);
      if (loc) setCenter(loc);
      else setGeoError('Không tìm thấy địa điểm này.');
    } catch {
      setGeoError('Lỗi tìm địa điểm, thử lại sau.');
    } finally {
      setGeoLoading(false);
    }
  };

  const missingCoords = rooms.length - roomsWithCoords.length;

  return (
    <div className="space-y-3">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 soft-shadow flex flex-col sm:flex-row sm:items-center gap-3">
        <form onSubmit={handleSearchPlace} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
              location_searching
            </span>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm quanh trường / chỗ làm..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-container text-white text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            Tìm
          </button>
        </form>

        <button
          onClick={handleNearMe}
          disabled={geoLoading}
          className="px-4 py-2 rounded-xl border border-primary-container text-primary-container text-sm font-semibold hover:bg-orange-50 transition-colors flex items-center gap-1.5 justify-center disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
          {geoLoading ? 'Đang định vị...' : 'Gần tôi'}
        </button>
      </div>

      {/* ── Radius slider (khi đã có tâm) ────────────────────────── */}
      {center && (
        <div className="bg-white border border-gray-100 rounded-2xl p-3 soft-shadow flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Bán kính: <span className="text-primary-container font-bold">{radiusKm} km</span>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="flex-1 min-w-[140px] accent-primary-container"
          />
          <button
            onClick={() => setCenter(null)}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span> Bỏ lọc vị trí
          </button>
        </div>
      )}

      {geoError && <p className="text-xs text-red-500 px-1">{geoError}</p>}

      <p className="text-xs text-gray-500 px-1">
        Hiển thị <b>{visibleRooms.length}</b> phòng trên bản đồ
        {missingCoords > 0 && ` (${missingCoords} phòng chưa có toạ độ nên không hiện)`}.
      </p>

      {/* ── Map ──────────────────────────────────────────────────── */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden border border-gray-100 soft-shadow">
        {loading && (
          <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin" />
          </div>
        )}
        {!loading && roomsWithCoords.length === 0 && (
          <div className="absolute inset-0 z-[500] bg-white/80 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">wrong_location</span>
            <p className="text-sm text-gray-500 max-w-xs">
              Chưa có phòng nào có toạ độ để hiển thị trên bản đồ. Thử đổi bộ lọc hoặc xem ở chế độ danh sách.
            </p>
          </div>
        )}

        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo center={center} zoom={14} />

          {center && (
            <>
              <Circle
                center={center}
                radius={radiusKm * 1000}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.08, weight: 1.5 }}
              />
              <Marker position={center} icon={userIcon}>
                <Popup>Vị trí của bạn</Popup>
              </Marker>
            </>
          )}

          {visibleRooms.map((r) => (
            <Marker
              key={r.id}
              position={[r.latitude as number, r.longitude as number]}
              icon={priceIcon(formatPrice(r.price))}
            >
              <Popup>
                <div style={{ width: 200 }}>
                  <img
                    src={r.image}
                    alt={r.title}
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{ fontWeight: 700, marginTop: 6, fontSize: 13, lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ color: '#f97316', fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                    {r.price.toLocaleString('vi-VN')}đ/tháng
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {r.area} m² · {r.district}
                  </div>
                  <button
                    onClick={() => navigate(`/room/${r.id}`)}
                    style={{
                      marginTop: 8,
                      width: '100%',
                      background: '#f97316',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 0',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapBrowse;
