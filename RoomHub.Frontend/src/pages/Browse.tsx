import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Room {
  id: number;
  title: string;
  type: string;
  location: string;
  district: string;
  price: number;
  area: number;
  maxPeople: number;
  image: string;
  amenities: string[];
  isNew?: boolean;
}



interface BrowseProps {
  _unused?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5143/api/public/listings';
const PAGE_SIZE = 12;

const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  all:     {},
  under2:  { max: 1_999_999 },
  '2to4':  { min: 2_000_000, max: 4_000_000 },
  above4:  { min: 4_000_001 },
};

const AMENITY_OPTIONS = [
  'Wifi miễn phí',
  'Điều hòa',
  'Chỗ để xe',
  'Ban công',
  'Vệ sinh khép kín',
  'Gác lửng',
  'Máy giặt',
  'Tủ lạnh',
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 1,
    title: "Studio ban công view biển Mỹ Khê - Đầy đủ nội thất",
    type: "Studio",
    location: "Đường Võ Nguyên Giáp, Quận Ngũ Hành Sơn, Đà Nẵng",
    district: "Quận Ngũ Hành Sơn",
    price: 5500000,
    area: 35,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe", "Ban công", "Vệ sinh khép kín"],
    isNew: true
  },
  {
    id: 2,
    title: "Căn hộ 1PN trung tâm Hải Châu, an ninh 24/7",
    type: "Căn hộ",
    location: "Đường Nguyễn Chí Thanh, Quận Hải Châu, Đà Nẵng",
    district: "Quận Hải Châu",
    price: 6200000,
    area: 45,
    maxPeople: 3,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe", "Vệ sinh khép kín"]
  },
  {
    id: 3,
    title: "Phòng trọ sạch sẽ gần ĐH Bách Khoa, có gác lửng",
    type: "Phòng trọ",
    location: "Đường Ngô Sĩ Liên, Quận Liên Chiểu, Đà Nẵng",
    district: "Quận Liên Chiểu",
    price: 2000000,
    area: 20,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Chỗ để xe", "Gác lửng"]
  },
  {
    id: 4,
    title: "Studio full nội thất cao cấp gần ĐH FPT",
    type: "Studio",
    location: "Đường Nam Kỳ Khởi Nghĩa, Quận Ngũ Hành Sơn, Đà Nẵng",
    district: "Quận Ngũ Hành Sơn",
    price: 4500000,
    area: 30,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe", "Ban công", "Vệ sinh khép kín"],
    isNew: true
  },
  {
    id: 5,
    title: "Phòng trọ sinh viên Hòa Khánh khép kín, gần chợ",
    type: "Phòng trọ",
    location: "Đường Nguyễn Lương Bằng, Quận Liên Chiểu, Đà Nẵng",
    district: "Quận Liên Chiểu",
    price: 1500000,
    area: 18,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Chỗ để xe", "Vệ sinh khép kín"]
  },
  {
    id: 6,
    title: "Căn hộ cao cấp view sông Hàn cực kỳ sang trọng",
    type: "Căn hộ",
    location: "Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng",
    district: "Quận Hải Châu",
    price: 8500000,
    area: 55,
    maxPeople: 3,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe", "Ban công", "Vệ sinh khép kín"],
    isNew: true
  },
  {
    id: 7,
    title: "Phòng trọ rộng rãi phù hợp 2 người, gần biển Phạm Văn Đồng",
    type: "Phòng trọ",
    location: "Đường Lê Hữu Trác, Quận Sơn Trà, Đà Nẵng",
    district: "Quận Sơn Trà",
    price: 3200000,
    area: 28,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe"]
  },
  {
    id: 8,
    title: "Phòng trọ ký túc xá dịch vụ cao cấp tại Cẩm Lệ",
    type: "Phòng trọ",
    location: "Đường Cách Mạng Tháng 8, Quận Cẩm Lệ, Đà Nẵng",
    district: "Quận Cẩm Lệ",
    price: 1200000,
    area: 32,
    maxPeople: 4,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe"]
  },
  {
    id: 9,
    title: "Căn hộ chung cư cao cấp 2PN view vịnh biển cực mát",
    type: "Căn hộ",
    location: "Đường Lê Đức Thọ, Quận Sơn Trà, Đà Nẵng",
    district: "Quận Sơn Trà",
    price: 9000000,
    area: 65,
    maxPeople: 4,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Điều hòa", "Chỗ để xe", "Ban công", "Vệ sinh khép kín"],
    isNew: true
  },
  {
    id: 10,
    title: "Căn hộ mini thông minh có gác lửng cực đẹp tại Thanh Khê",
    type: "Căn hộ mini",
    location: "Đường Điện Biên Phủ, Quận Thanh Khê, Đà Nẵng",
    district: "Quận Thanh Khê",
    price: 3800000,
    area: 28,
    maxPeople: 2,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Chỗ để xe", "Ban công", "Vệ sinh khép kín"],
    isNew: true
  },
  {
    id: 11,
    title: "Phòng trọ khép kín sinh viên Hòa Vang, an ninh tốt",
    type: "Phòng trọ",
    location: "Đường Quốc lộ 14B, Huyện Hòa Vang, Đà Nẵng",
    district: "Huyện Hòa Vang",
    price: 1100000,
    area: 16,
    maxPeople: 1,
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
    amenities: ["Wifi miễn phí", "Chỗ để xe", "Vệ sinh khép kín"]
  }
];

// ─── Component ────────────────────────────────────────────────────────────────

const Browse: React.FC<BrowseProps> = () => {
  const navigate = useNavigate();

  // ── Search / Filter state ──────────────────────────────────────────────────
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [activeQuickTab, setActiveQuickTab] = useState('Tất cả');

  // ── API / Loading state ───────────────────────────────────────────────────
  const [dbRooms, setDbRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── Fetch listings from real API ──────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const params = new URLSearchParams();

      if (searchKeyword.trim()) params.set('searchQuery', searchKeyword.trim());
      if (selectedType !== 'Tất cả') params.set('roomType', selectedType);
      if (selectedLocation !== 'Tất cả') params.set('district', selectedLocation);
      if (sortBy) params.set('sortBy', sortBy);

      const priceFilter = PRICE_RANGES[priceRange] ?? {};
      if (priceFilter.min != null) params.set('minPrice', String(priceFilter.min));
      if (priceFilter.max != null) params.set('maxPrice', String(priceFilter.max));

      if (selectedAmenities.length > 0) {
        params.set('amenities', selectedAmenities.join(','));
      }

      // Fetch larger set from server for client-side merged pagination
      params.set('page', '1');
      params.set('pageSize', '50');

      const response = await fetch(`${API_BASE}?${params.toString()}`);

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();

      if (Array.isArray(data)) {
        setDbRooms(data as Room[]);
      } else if (data.items) {
        setDbRooms(data.items as Room[]);
      } else {
        setDbRooms([]);
      }
    } catch {
      setHasError(true);
      setDbRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword, selectedType, selectedLocation, priceRange, selectedAmenities, sortBy]);

  // Filter & Sort Logic for Mock Rooms
  const filteredMockRooms = useMemo(() => {
    let result = [...MOCK_ROOMS];

    // Filter by Keyword
    if (searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(room => 
        room.title.toLowerCase().includes(keyword) || 
        room.location.toLowerCase().includes(keyword)
      );
    }

    // Filter by Property Type
    if (selectedType !== 'Tất cả') {
      result = result.filter(room => room.type === selectedType);
    }

    // Filter by District/Location
    if (selectedLocation !== 'Tất cả') {
      result = result.filter(room => room.district === selectedLocation);
    }

    // Filter by Price Range
    const priceFilter = PRICE_RANGES[priceRange] ?? {};
    if (priceFilter.min != null) {
      result = result.filter(room => room.price >= priceFilter.min!);
    }
    if (priceFilter.max != null) {
      result = result.filter(room => room.price <= priceFilter.max!);
    }

    // Filter by Amenities
    if (selectedAmenities.length > 0) {
      result = result.filter(room => 
        selectedAmenities.every(amenity => room.amenities.includes(amenity))
      );
    }

    return result;
  }, [searchKeyword, selectedType, selectedLocation, priceRange, selectedAmenities]);

  const combinedRooms = useMemo(() => {
    const mappedMock = filteredMockRooms.map((r: Room) => ({
      ...r,
      id: r.id + 100000 // avoid conflicts with database IDs
    }));

    const merged = [...dbRooms, ...mappedMock];

    // Sort combined
    if (sortBy === 'priceAsc') {
      merged.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      merged.sort((a, b) => b.price - a.price);
    } else {
      // newest
      merged.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return b.id - a.id;
      });
    }

    return merged;
  }, [dbRooms, filteredMockRooms, sortBy]);

  // Derived values for component
  const rooms = useMemo(() => {
    return combinedRooms.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [combinedRooms, currentPage]);

  const totalPages = Math.max(1, Math.ceil(combinedRooms.length / PAGE_SIZE));

  // Re-fetch whenever filters or sort change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchListings();
  }, [fetchListings]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputKeyword);
  };

  const handleQuickTabSelect = (tab: string) => {
    setActiveQuickTab(tab);
    setSelectedType(tab);
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setInputKeyword('');
    setSelectedType('Tất cả');
    setSelectedLocation('Tất cả');
    setPriceRange('all');
    setSelectedAmenities([]);
    setActiveQuickTab('Tất cả');
    setSortBy('newest');
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const formatPrice = (price: number) => price.toLocaleString('vi-VN');

  // ── Pagination page numbers ───────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="bg-surface text-on-surface">
      {/* ── Hero / Search Header ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#FFF7ED] to-surface pt-12 pb-24 relative px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col items-center text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-label-md text-label-md mb-6">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a
                  className="inline-flex items-center hover:text-primary-container transition-colors cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  Trang chủ
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1 text-gray-400">chevron_right</span>
                  <span className="text-gray-500 font-medium">Đà Nẵng</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1 text-gray-400">chevron_right</span>
                  <span className="text-primary-container font-semibold">Tìm chỗ ở</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="font-display-lg text-display-lg text-on-surface mb-8 max-w-3xl md:text-[54px] text-[36px]">
            Tìm chỗ ở cho thuê tại Đà Nẵng
          </h1>

          {/* Floating Search Card */}
          <div className="w-full max-w-5xl bg-white rounded-2xl soft-shadow p-6 mt-4 relative z-10 mx-auto border border-gray-100">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-2 text-left">
                <label className="font-label-md text-label-md text-on-surface-variant">Từ khoá</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input
                    id="browse-search-input"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-md text-body-md text-on-surface outline-none transition-all"
                    placeholder="Tên đường, phường..."
                    type="text"
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="font-label-md text-label-md text-on-surface-variant">Loại chỗ ở</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">home_work</span>
                  <select
                    id="browse-type-select"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-10 py-3 focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-md text-body-md text-on-surface outline-none appearance-none cursor-pointer transition-all"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setActiveQuickTab(e.target.value);
                    }}
                  >
                    <option value="Tất cả">Tất cả loại phòng</option>
                    <option value="Phòng trọ">Phòng trọ</option>
                    <option value="Studio">Studio</option>
                    <option value="Căn hộ mini">Căn hộ mini</option>
                    <option value="Căn hộ">Căn hộ</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="font-label-md text-label-md text-on-surface-variant">Khu vực</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                  <select
                    id="browse-location-select"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-10 py-3 focus:ring-1 focus:ring-primary-container focus:border-primary-container font-body-md text-body-md text-on-surface outline-none appearance-none cursor-pointer transition-all"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="Tất cả">Tất cả quận/huyện</option>
                    <option value="Quận Hải Châu">Quận Hải Châu</option>
                    <option value="Quận Thanh Khê">Quận Thanh Khê</option>
                    <option value="Quận Sơn Trà">Quận Sơn Trà</option>
                    <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
                    <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
                    <option value="Quận Cẩm Lệ">Quận Cẩm Lệ</option>
                    <option value="Huyện Hòa Vang">Huyện Hòa Vang</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <button
                id="browse-search-btn"
                type="submit"
                className="bg-primary-container text-white font-label-md text-label-md rounded-xl py-3 px-6 h-[48px] hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-sm font-bold active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Quick Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 w-full max-w-4xl z-10 relative">
            {['Tất cả', 'Phòng trọ', 'Studio', 'Căn hộ mini', 'Căn hộ'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleQuickTabSelect(tab)}
                className={`px-6 py-2 rounded-full font-label-md text-label-md transition-all duration-300 border active:scale-95 ${
                  activeQuickTab === tab
                    ? 'bg-primary-container text-white border-transparent soft-shadow'
                    : 'bg-white text-on-surface-variant border-gray-200 hover:border-primary-container hover:text-primary-container'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Layout: Sidebar + Results ─────────────────────────────────── */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-24 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start relative z-20">

        {/* ── Left Sidebar Filters ──────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col p-6 sticky top-24 bg-white border border-gray-100 rounded-2xl soft-shadow">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-primary-container">Bộ lọc</h2>
              <p className="text-xs text-gray-500">Tìm phòng ưng ý nhất</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary-container hover:text-orange-600 transition-colors font-semibold"
            >
              Đặt lại
            </button>
          </div>

          <div className="space-y-6">
            {/* Property Types */}
            <div className="border-b border-gray-100 pb-5">
              <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px]">home_work</span>
                Loại chỗ ở
              </h3>
              <div className="space-y-2">
                {['Phòng trọ', 'Studio', 'Căn hộ mini', 'Căn hộ'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group text-sm">
                    <input
                      type="checkbox"
                      checked={selectedType === type}
                      onChange={() => {
                        if (selectedType === type) {
                          setSelectedType('Tất cả');
                          setActiveQuickTab('Tất cả');
                        } else {
                          setSelectedType(type);
                          setActiveQuickTab(type);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer"
                    />
                    <span className="text-on-surface-variant group-hover:text-primary-container transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-b border-gray-100 pb-5">
              <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px]">payments</span>
                Mức giá thuê
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { value: 'all',    label: 'Tất cả mức giá' },
                  { value: 'under2', label: 'Dưới 2 triệu' },
                  { value: '2to4',   label: '2 triệu - 4 triệu' },
                  { value: 'above4', label: 'Trên 4 triệu' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      name="priceRange"
                      type="radio"
                      checked={priceRange === value}
                      onChange={() => setPriceRange(value)}
                      className="text-primary-container focus:ring-primary-container w-4 h-4 border-gray-300 cursor-pointer"
                    />
                    <span className="text-on-surface-variant group-hover:text-primary-container transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
                Tiện ích phòng
              </h3>
              <div className="space-y-2 text-sm">
                {AMENITY_OPTIONS.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer"
                    />
                    <span className="text-on-surface-variant group-hover:text-primary-container transition-colors">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right: Results Panel ──────────────────────────────────────────── */}
        <main>
          {/* Result count + sort row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-on-surface">
              {isLoading ? (
                <span className="text-gray-400">Đang tìm kiếm...</span>
              ) : (
                <>
                  Tìm thấy{' '}
                  <span className="text-primary-container">{combinedRooms.length}</span>{' '}
                  chỗ ở phù hợp
                </>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Sắp xếp:</span>
              <select
                id="browse-sort-select"
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-body-md text-sm text-on-surface focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none cursor-pointer transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất đầu tiên</option>
                <option value="priceAsc">Giá: Thấp đến Cao</option>
                <option value="priceDesc">Giá: Cao xuống Thấp</option>
              </select>
            </div>
          </div>

          {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-5 bg-orange-100 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── API Error State ──────────────────────────────────────────────── */}
          {!isLoading && hasError && (
            <div className="bg-white border border-red-100 rounded-2xl p-12 text-center soft-shadow">
              <span className="material-symbols-outlined text-[64px] text-red-300 mb-4 block">wifi_off</span>
              <h3 className="text-lg font-bold text-on-surface mb-2">Không thể kết nối máy chủ</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Hệ thống đang bảo trì hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau ít phút.
              </p>
              <button
                onClick={() => fetchListings()}
                className="bg-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors soft-shadow"
              >
                <span className="material-symbols-outlined align-middle mr-1 text-[18px]">refresh</span>
                Thử lại
              </button>
            </div>
          )}

          {/* ── Empty Results ────────────────────────────────────────────────── */}
          {!isLoading && !hasError && rooms.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center soft-shadow">
              <span className="material-symbols-outlined text-[64px] text-gray-300 mb-4 block">search_off</span>
              <h3 className="text-lg font-bold text-on-surface mb-2">Không tìm thấy phòng phù hợp</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Bạn hãy thử xóa bớt các bộ lọc tiện ích, mở rộng khoảng giá hoặc tìm kiếm từ khóa khác nhé!
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors soft-shadow"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* ── Listings Grid ────────────────────────────────────────────────── */}
          {!isLoading && !hasError && rooms.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room: Room) => (
                  <div
                    key={room.id}
                    id={`room-card-${room.id}`}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover-lift flex flex-col group cursor-pointer"
                  >
                    {/* Card Image */}
                    <div className="h-48 relative overflow-hidden bg-gray-100">
                      <img
                        alt={room.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={room.image}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      {/* Type Badge */}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-primary-container text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {room.type}
                      </span>

                      {/* New Badge */}
                      {room.isNew && (
                        <span className="absolute top-3 right-14 bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Mới
                        </span>
                      )}

                      {/* Favorite Button */}
                      <button
                        aria-label="Lưu yêu thích"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLoginModalOpen(true);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-base font-bold text-on-surface mb-1.5 line-clamp-1 group-hover:text-primary-container transition-colors">
                        {room.title}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{room.location}</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-100 mb-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">aspect_ratio</span>
                          <span>{room.area}m²</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">group</span>
                          <span>Tối đa {room.maxPeople}</span>
                        </div>
                      </div>

                      {/* Amenities Pills (max 3) */}
                      {room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {room.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                              {a}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                              +{room.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Row */}
                      <div className="mt-auto flex justify-between items-center">
                        <div>
                          <p className="text-primary-container font-bold text-lg">
                            {formatPrice(room.price)}đ
                            <span className="text-xs text-gray-500 font-normal">/tháng</span>
                          </p>
                        </div>
                        <button className="text-primary-container hover:bg-orange-50 px-3 py-1 rounded-lg text-xs font-semibold transition-colors">
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ──────────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-primary-container text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-primary-container'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Login Requirement Modal ───────────────────────────────────────── */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md soft-shadow p-6 relative border border-gray-100 animate-scale-up">
            <button
              aria-label="Đóng modal"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary-container text-[28px]">lock</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Bạn cần đăng nhập</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Vui lòng đăng nhập hoặc đăng ký tài khoản RoomHub để lưu chỗ ở yêu thích và gửi tin nhắn trao đổi trực tiếp với chủ nhà!
              </p>
              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    navigate('/login');
                  }}
                  className="w-full bg-primary-container text-white text-sm font-bold py-3 rounded-xl hover:bg-orange-600 transition-all shadow-sm active:scale-98"
                >
                  Đăng nhập ngay
                </button>
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    navigate('/register');
                  }}
                  className="w-full bg-transparent border border-gray-200 text-on-surface-variant text-sm font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-98"
                >
                  Tạo tài khoản mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Browse;
