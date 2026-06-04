import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface ListingListProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedListingId: (id: number | null) => void;
}

type PropertyType = 'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ';
type ListingStatus = 'Nháp' | 'Chờ duyệt' | 'Đang hiển thị' | 'Bị từ chối' | 'Đã ẩn' | 'Đã thuê';
type SourceType = 'existing' | 'independent';

interface ListingItem {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  price: number;
  linkedAsset: string;
  linkedUnit: string;
  source: SourceType;
  status: ListingStatus;
  views: number;
  saves: number;
  requests: number;
  createdDate: string;
  address: string;
  thumbnail: string;
  rejectionReason?: string;
  area: number;
  maxPeople: number;
}
const ListingList: React.FC<ListingListProps> = ({ setCurrentPage, setSelectedListingId }) => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/listings');
      const mappedListings = res.data.map((item: any) => ({
        id: item.roomId.toString(),
        code: `RH-LST-${1000 + item.roomId}`,
        title: item.title,
        type: item.type as PropertyType,
        price: item.price,
        linkedAsset: item.buildingName,
        linkedUnit: item.roomNumber,
        source: 'existing' as SourceType,
        status: item.isPublished ? ('Đang hiển thị' as ListingStatus) : ('Nháp' as ListingStatus),
        views: item.views || 0,
        saves: Math.floor((item.views || 0) * (0.08 + (item.roomId % 5) * 0.01)),
        requests: Math.floor((item.views || 0) * (0.03 + (item.roomId % 3) * 0.01)),
        createdDate: item.createdDate || new Date().toISOString(),
        address: item.buildingName + ', Đà Nẵng',
        thumbnail: (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
        area: item.area || 25,
        maxPeople: item.capacity || 2
      }));
      setListings(mappedListings);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tin đăng:', err);
      triggerToast('Không thể tải danh sách tin đăng từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Tất cả');
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const [filterSource, setFilterSource] = useState<string>('Tất cả');
  const [filterAsset, setFilterAsset] = useState<string>('Tất cả');
  const [filterDate, setFilterDate] = useState<string>('Tất cả');
  const [sortOrder, setSortOrder] = useState<string>('Mới nhất');

  // Active status tab state
  const [activeTab, setActiveTab] = useState<string>('Tất cả');

  // Modal States
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isMarkRentedModalOpen, setIsMarkRentedModalOpen] = useState(false);
  const [activeListing, setActiveListing] = useState<ListingItem | null>(null);
  const [hidePublicAfterRent, setHidePublicAfterRent] = useState(true);

  // Pagination State
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Stats computation
  const stats = useMemo(() => {
    return {
      total: listings.length,
      active: listings.filter(l => l.status === 'Đang hiển thị').length,
      pending: listings.filter(l => l.status === 'Chờ duyệt').length,
      draft: listings.filter(l => l.status === 'Nháp').length,
      rejected: listings.filter(l => l.status === 'Bị từ chối').length,
    };
  }, [listings]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      'Tất cả': listings.length,
      'Đang hiển thị': listings.filter(l => l.status === 'Đang hiển thị').length,
      'Chờ duyệt': listings.filter(l => l.status === 'Chờ duyệt').length,
      'Nháp': listings.filter(l => l.status === 'Nháp').length,
      'Bị từ chối': listings.filter(l => l.status === 'Bị từ chối').length,
      'Đã ẩn': listings.filter(l => l.status === 'Đã ẩn').length,
      'Đã thuê': listings.filter(l => l.status === 'Đã thuê').length,
    };
  }, [listings]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('Tất cả');
    setFilterStatus('Tất cả');
    setFilterSource('Tất cả');
    setFilterAsset('Tất cả');
    setFilterDate('Tất cả');
    setActiveTab('Tất cả');
    triggerToast('Đã thiết lập lại tất cả bộ lọc');
  };

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Status Tab filter
    if (activeTab !== 'Tất cả') {
      result = result.filter(l => l.status === activeTab);
    }

    // Keyword search
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(lower) ||
          l.code.toLowerCase().includes(lower) ||
          l.address.toLowerCase().includes(lower)
      );
    }

    // Property Type
    if (filterType !== 'Tất cả') {
      result = result.filter(l => l.type === filterType);
    }

    // Dropdown Status Filter (only active if activeTab is "Tất cả" to avoid conflict)
    if (activeTab === 'Tất cả' && filterStatus !== 'Tất cả') {
      result = result.filter(l => l.status === filterStatus);
    }

    // Source Filter
    if (filterSource !== 'Tất cả') {
      const src = filterSource === 'Từ phòng/căn có sẵn' ? 'existing' : 'independent';
      result = result.filter(l => l.source === src);
    }

    // Asset filter
    if (filterAsset !== 'Tất cả') {
      result = result.filter(l => l.linkedAsset === filterAsset);
    }

    // Date range filter
    if (filterDate !== 'Tất cả') {
      const today = new Date();
      result = result.filter(l => {
        const cDate = new Date(l.createdDate);
        const diffTime = Math.abs(today.getTime() - cDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filterDate === '7 ngày gần đây') return diffDays <= 7;
        if (filterDate === '30 ngày gần đây') return diffDays <= 30;
        if (filterDate === 'Tháng này') return cDate.getMonth() === today.getMonth() && cDate.getFullYear() === today.getFullYear();
        return true;
      });
    }

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === 'Mới nhất') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortOrder === 'Cũ nhất') return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      if (sortOrder === 'Lượt xem cao nhất') return b.views - a.views;
      if (sortOrder === 'Giá thấp đến cao') return a.price - b.price;
      if (sortOrder === 'Giá cao đến thấp') return b.price - a.price;
      return 0;
    });

    return result;
  }, [listings, searchTerm, filterType, filterStatus, filterSource, filterAsset, filterDate, sortOrder, activeTab]);

  // Checkbox selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredListings.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions Handlers
  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => api.put(`/owner/listings/${id}/publish`, { isPublished: false })));
      setListings(prev =>
        prev.map(l => (selectedIds.includes(l.id) && l.status === 'Đang hiển thị' ? { ...l, status: 'Đã ẩn' as const } : l))
      );
      triggerToast(`Đã tạm ẩn thành công ${selectedIds.length} tin cho thuê`);
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi tạm ẩn hàng loạt.');
    } finally {
      setSelectedIds([]);
    }
  };

  const handleBulkResubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => api.put(`/owner/listings/${id}/publish`, { isPublished: true })));
      setListings(prev =>
        prev.map(l => (selectedIds.includes(l.id) && (l.status === 'Nháp' || l.status === 'Bị từ chối') ? { ...l, status: 'Chờ duyệt' as const } : l))
      );
      triggerToast(`Đã gửi duyệt thành công ${selectedIds.length} tin cho thuê`);
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi gửi duyệt hàng loạt.');
    } finally {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} tin đã chọn?`)) {
      setListings(prev => prev.filter(l => !selectedIds.includes(l.id)));
      triggerToast(`Đã xóa vĩnh viễn ${selectedIds.length} tin cho thuê`);
      setSelectedIds([]);
    }
  };

  // Single Action Triggers
  const openHideModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsHideModalOpen(true);
  };

  const confirmHideListing = async () => {
    if (!activeListing) return;
    try {
      await api.put(`/owner/listings/${activeListing.id}/publish`, { isPublished: false });
      setListings(prev =>
        prev.map(l => (l.id === activeListing.id ? { ...l, status: 'Đã ẩn' as const } : l))
      );
      triggerToast('Tin cho thuê đã được ẩn khỏi sàn public thành công');
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi ẩn tin.');
    } finally {
      setIsHideModalOpen(false);
      setActiveListing(null);
    }
  };

  const openDeleteModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteListing = () => {
    if (!activeListing) return;
    setListings(prev => prev.filter(l => l.id !== activeListing.id));
    triggerToast('Đã xóa vĩnh viễn tin đăng thành công');
    setIsDeleteModalOpen(false);
    setActiveListing(null);
  };

  const openResubmitModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsResubmitModalOpen(true);
  };

  const confirmResubmitListing = async () => {
    if (!activeListing) return;
    try {
      await api.put(`/owner/listings/${activeListing.id}/publish`, { isPublished: true });
      setListings(prev =>
        prev.map(l => (l.id === activeListing.id ? { ...l, status: 'Chờ duyệt' as const } : l))
      );
      triggerToast('Đã gửi yêu cầu phê duyệt lại tin trọ thành công');
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi gửi yêu cầu duyệt.');
    } finally {
      setIsResubmitModalOpen(false);
      setActiveListing(null);
    }
  };

  const openReasonModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsReasonModalOpen(true);
  };

  const openMarkRentedModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsMarkRentedModalOpen(true);
  };

  const confirmMarkRentedListing = async () => {
    if (!activeListing) return;
    try {
      if (hidePublicAfterRent) {
        await api.put(`/owner/listings/${activeListing.id}/publish`, { isPublished: false });
      }
      setListings(prev =>
        prev.map(l => (l.id === activeListing.id ? { ...l, status: hidePublicAfterRent ? 'Đã thuê' as const : 'Đang hiển thị' as const } : l))
      );
      triggerToast(hidePublicAfterRent ? 'Đã đánh dấu đã thuê và tạm ẩn tin đăng' : 'Đã đánh dấu đã thuê thành công');
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi đánh dấu đã thuê.');
    } finally {
      setIsMarkRentedModalOpen(false);
      setActiveListing(null);
    }
  };

  const handleShowAgain = async (listing: ListingItem) => {
    try {
      await api.put(`/owner/listings/${listing.id}/publish`, { isPublished: true });
      setListings(prev =>
        prev.map(l => (l.id === listing.id ? { ...l, status: 'Chờ duyệt' as const } : l))
      );
      triggerToast('Đã gửi lại duyệt để khôi phục trạng thái hiển thị');
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi hiển thị lại tin.');
    }
  };

  // Dynamic Badges Render Helpers
  const renderStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'Đang hiển thị':
        return (
          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Đang hiển thị
          </span>
        );
      case 'Chờ duyệt':
        return (
          <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Chờ duyệt
          </span>
        );
      case 'Nháp':
        return (
          <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Bản nháp
          </span>
        );
      case 'Bị từ chối':
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Bị từ chối
          </span>
        );
      case 'Đã ẩn':
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Đã tạm ẩn
          </span>
        );
      case 'Đã thuê':
        return (
          <span className="px-2.5 py-1 bg-orange-50 text-primary-container border border-orange-200 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            Đã thuê
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">
      
      {/* 1. BREADCRUMB */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">Tin cho thuê</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('Chuyển tiếp đến xem danh sách tin công cộng của chủ nhà này...')}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 hover:border-gray-350 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span> Xem trang public
          </button>
          <button 
            onClick={() => {
              setSelectedListingId(null);
              setCurrentPage('owner-listings-create');
            }}
            className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> Đăng tin mới
          </button>
        </div>
      </div>

      {/* 2. PAGE SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Tổng */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary-container text-[20px]">campaign</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Tổng tin</span>
            <span className="text-lg font-black text-on-surface leading-tight block">{stats.total}</span>
            <span className="text-[9px] text-gray-400 font-semibold">Tất cả tin đã tạo</span>
          </div>
        </div>

        {/* Card 2: Hiển thị */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-600 text-[20px]">visibility</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Đang hiển thị</span>
            <span className="text-lg font-black text-green-600 leading-tight block">{stats.active}</span>
            <span className="text-[9px] text-green-500 font-semibold">Đã công bố public</span>
          </div>
        </div>

        {/* Card 3: Chờ duyệt */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-yellow-600 text-[20px]">schedule</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Chờ duyệt</span>
            <span className="text-lg font-black text-yellow-600 leading-tight block">{stats.pending}</span>
            <span className="text-[9px] text-yellow-500 font-semibold">Đang chờ admin trọ</span>
          </div>
        </div>

        {/* Card 4: Nháp */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">draft</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Bản nháp</span>
            <span className="text-lg font-black text-gray-700 leading-tight block">{stats.draft}</span>
            <span className="text-[9px] text-gray-400 font-semibold">Chưa gửi đăng</span>
          </div>
        </div>

        {/* Card 5: Bị từ chối */}
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Bị từ chối</span>
            <span className="text-lg font-black text-red-600 leading-tight block">{stats.rejected}</span>
            <span className="text-[9px] text-red-500 font-semibold">Yêu cầu sửa lại</span>
          </div>
        </div>

      </div>

      {/* 3. SEARCH & FILTER CARD */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow space-y-4">
        <h3 className="text-xs font-black text-on-surface uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5 text-primary-container">
          <span className="material-symbols-outlined text-[18px]">manage_search</span>
          Bộ lọc & Tìm kiếm tin đăng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-bold text-gray-500">
          
          {/* Keyword Search */}
          <div className="space-y-1 lg:col-span-2">
            <label className="uppercase">Từ khóa tìm kiếm</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Tiêu đề, địa chỉ, mã tin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-semibold text-gray-700" 
              />
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Loại hình</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả loại hình</option>
              <option value="Phòng trọ">Phòng trọ</option>
              <option value="Studio">Studio</option>
              <option value="Căn hộ mini">Căn hộ mini</option>
              <option value="Căn hộ">Căn hộ</option>
            </select>
          </div>

          {/* Source Type Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Nguồn tin</label>
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả nguồn</option>
              <option value="Từ phòng/căn có sẵn">Từ phòng có sẵn</option>
              <option value="Tin độc lập">Tin trọ độc lập</option>
            </select>
          </div>

          {/* Asset Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Tài sản liên kết</label>
            <select 
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả tài sản</option>
              <option value="FPT House">FPT House</option>
              <option value="Hòa Hải Studio">Hòa Hải Studio</option>
              <option value="Sơn Trà Mini Apartment">Sơn Trà Mini</option>
              <option value="Ngũ Hành Sơn Rooms">Ngũ Hành Sơn Rooms</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="space-y-1">
            <label className="uppercase">Ngày tạo</label>
            <select 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 focus:border-primary-container rounded-xl focus:outline-none bg-gray-50/40 text-xs font-bold text-gray-700"
            >
              <option value="Tất cả">Tất cả thời gian</option>
              <option value="7 ngày gần đây">7 ngày gần đây</option>
              <option value="30 ngày gần đây">30 ngày gần đây</option>
              <option value="Tháng này">Tháng này</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            Đặt lại bộ lọc
          </button>
          <button 
            onClick={() => triggerToast('Đã áp dụng các điều kiện tìm kiếm nâng cao')}
            className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Tìm kiếm tin
          </button>
        </div>
      </div>

      {/* 4. LISTING STATUS TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
          {[
            'Tất cả',
            'Đang hiển thị',
            'Chờ duyệt',
            'Nháp',
            'Bị từ chối',
            'Đã ẩn',
            'Đã thuê'
          ].map((tab) => {
            const isActive = activeTab === tab;
            const count = tabCounts[tab as keyof typeof tabCounts] ?? 0;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIds([]); // reset checkboxes when switching tabs
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? 'bg-primary-container border-primary-container text-white shadow-sm ring-2 ring-orange-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-orange-50/30 hover:border-orange-200 hover:text-primary-container'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  isActive ? 'bg-white text-primary-container' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle & Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-white p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setViewMode('table')}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-orange-50 text-primary-container font-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Xem bảng"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                viewMode === 'card' ? 'bg-orange-50 text-primary-container font-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Xem lưới"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-650 focus:outline-none focus:border-primary-container cursor-pointer"
          >
            <option value="Mới nhất">Mới nhất</option>
            <option value="Cũ nhất">Cũ nhất</option>
            <option value="Lượt xem cao nhất">Lượt xem cao</option>
            <option value="Giá thấp đến cao">Giá tăng dần</option>
            <option value="Giá cao đến thấp">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* 5. BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3.5 animate-scaleUp">
          <div className="flex items-center gap-2.5 text-xs font-bold text-primary-container">
            <span className="material-symbols-outlined text-[20px] font-bold">check_box</span>
            <span>Đã chọn <strong className="text-lg text-primary-container font-black px-0.5">{selectedIds.length}</strong> tin cho thuê</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end text-xs font-bold">
            <button 
              onClick={handleBulkHide}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-primary-container hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span> Ẩn tin
            </button>
            <button 
              onClick={handleBulkResubmit}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-primary-container hover:border-orange-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">send</span> Gửi duyệt
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100/50 border border-red-100 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">delete</span> Xóa tin
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 text-gray-400 hover:text-gray-600 rounded-xl transition-all cursor-pointer outline-none font-bold"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* 6. LISTINGS RESULTS CONTAINER */}
      {loading ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-gray-150 soft-shadow flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách tin cho thuê...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="bg-white p-12 rounded-3xl border border-gray-150 soft-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[350px] animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-primary-container mb-1">
            <span className="material-symbols-outlined text-[36px]">campaign</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-wide">
              {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả'
                ? 'Không tìm thấy tin phù hợp'
                : 'Bạn chưa có tin cho thuê nào'}
            </h4>
            <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả'
                ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều kiện bộ lọc để mở rộng kết quả.'
                : 'Hãy tạo tin đầu tiên để người thuê có thể tìm thấy phòng trọ, studio, căn hộ mini hoặc căn hộ của bạn trên RoomHub.'}
            </p>
          </div>

          <div className="flex gap-2.5 pt-1">
            {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả' ? (
              <button 
                onClick={handleResetFilters}
                className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <>
                <button 
                  onClick={() => alert('Liên kết nhanh từ phòng trọ trống có sẵn...')}
                  className="px-4 py-2 bg-orange-50 text-primary-container hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tạo từ phòng có sẵn
                </button>
                <button 
                  onClick={() => {
                    setSelectedListingId(null);
                    setCurrentPage('owner-listings-create');
                  }}
                  className="px-5 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">add</span> Đăng tin mới
                </button>
              </>
            )}
          </div>
        </div>

      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-gray-150 soft-shadow overflow-hidden">
          <div className="overflow-x-auto border-0">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 uppercase tracking-wider text-[10px] text-gray-400 font-black">
                  <th className="py-4.5 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                      className="w-4 h-4 text-primary-container accent-primary-container rounded cursor-pointer" 
                    />
                  </th>
                  <th className="py-4.5 px-4 min-w-[280px]">Tin cho thuê</th>
                  <th className="py-4.5 px-4">Loại hình</th>
                  <th className="py-4.5 px-4">Giá thuê</th>
                  <th className="py-4.5 px-4">Tài sản liên kết</th>
                  <th className="py-4.5 px-4">Trạng thái</th>
                  <th className="py-4.5 px-4 min-w-[140px]">Chỉ số hiệu quả</th>
                  <th className="py-4.5 px-4">Ngày tạo</th>
                  <th className="py-4.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
                  const isSelected = selectedIds.includes(list.id);
                  return (
                    <tr 
                      key={list.id} 
                      className={`hover:bg-orange-50/10 transition-colors ${
                        isSelected ? 'bg-orange-50/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4.5 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectOne(list.id)}
                          className="w-4 h-4 text-primary-container accent-primary-container rounded cursor-pointer" 
                        />
                      </td>

                      {/* Listing Info (Title, Code, Address) */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={list.thumbnail} 
                            alt={list.title} 
                            className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0 shadow-sm animate-scaleUp" 
                          />
                          <div className="space-y-0.5">
                            <span 
                              onClick={() => {
                                setSelectedListingId(parseInt(list.id, 10));
                                setCurrentPage('owner-listings-create');
                              }}
                              className="font-bold text-gray-800 line-clamp-1 hover:text-primary-container cursor-pointer text-xs"
                            >
                              {list.title}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                              <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded shadow-sm">{list.code}</span>
                              {list.source === 'existing' ? (
                                <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded shadow-sm">Có sẵn</span>
                              ) : (
                                <span className="bg-orange-50 text-primary-container px-1 py-0.5 rounded shadow-sm">Độc lập</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold leading-none block">{list.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Property Type Badge */}
                      <td className="py-4.5 px-4">
                        <span className="px-2 py-0.5 bg-orange-50 text-primary-container text-[10px] font-black rounded uppercase border border-orange-100">
                          {list.type}
                        </span>
                      </td>

                      {/* Rent Price */}
                      <td className="py-4.5 px-4 font-black text-gray-800 text-xs">
                        {list.price.toLocaleString('vi-VN')}đ<span className="text-[10px] font-semibold text-gray-400 block">/tháng</span>
                      </td>

                      {/* Linked Unit */}
                      <td className="py-4.5 px-4">
                        {list.source === 'existing' ? (
                          <div className="space-y-0.5">
                            <span className="text-gray-800 font-bold block">{list.linkedAsset}</span>
                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] text-gray-400">home</span>
                              Phòng {list.linkedUnit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px] font-medium">Không liên kết</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4.5 px-4">
                        <div className="space-y-1">
                          {renderStatusBadge(list.status)}
                          {list.status === 'Bị từ chối' && (
                            <button 
                              onClick={() => openReasonModal(list)}
                              className="text-[10px] font-bold text-red-655 hover:text-red-800 underline block cursor-pointer"
                            >
                              Xem lý do
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stats efficiency */}
                      <td className="py-4.5 px-4">
                        {list.status === 'Nháp' || list.status === 'Chờ duyệt' || list.status === 'Bị từ chối' ? (
                          <span className="text-gray-400 italic text-[10px] font-medium">Chưa có dữ liệu</span>
                        ) : (
                          <div className="flex gap-2.5 text-[11px] font-bold text-gray-600">
                            <span className="flex items-center gap-0.5" title="Lượt xem">
                              <span className="material-symbols-outlined text-[14px] text-gray-400">visibility</span>
                              {list.views}
                            </span>
                            <span className="flex items-center gap-0.5" title="Lượt lưu">
                              <span className="material-symbols-outlined text-[14px] text-gray-400">favorite</span>
                              {list.saves}
                            </span>
                            <span className="flex items-center gap-0.5" title="Liên hệ">
                              <span className="material-symbols-outlined text-[14px] text-gray-400">chat</span>
                              {list.requests}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4.5 px-4">
                        <span className="text-gray-700 font-bold block">{new Date(list.createdDate).toLocaleDateString('vi-VN')}</span>
                        <span className="text-[9px] text-gray-400 font-semibold block">2 ngày trước</span>
                      </td>

                      {/* Dynamic Action Buttons */}
                      <td className="py-4.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Main Primary Action Button according to status */}
                          {list.status === 'Nháp' && (
                            <button 
                              onClick={() => openResubmitModal(list)}
                              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Gửi kiểm duyệt để đăng"
                            >
                              Đăng tin
                            </button>
                          )}

                          {list.status === 'Đang hiển thị' && (
                            <button 
                              onClick={() => openMarkRentedModal(list)}
                              className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Đánh dấu đã có khách thuê"
                            >
                              Đã thuê
                            </button>
                          )}

                          {list.status === 'Bị từ chối' && (
                            <button 
                              onClick={() => openResubmitModal(list)}
                              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Sửa và gửi duyệt lại"
                            >
                              Duyệt lại
                            </button>
                          )}

                          {list.status === 'Đã ẩn' && (
                            <button 
                              onClick={() => handleShowAgain(list)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Hiển thị tin đăng lại"
                            >
                              Hiện lại
                            </button>
                          )}

                           {(list.status === 'Nháp' || list.status === 'Đang hiển thị' || list.status === 'Bị từ chối' || list.status === 'Đã ẩn') && (
                             <button 
                               onClick={() => {
                                 setSelectedListingId(parseInt(list.id, 10));
                                 setCurrentPage('owner-listings-create');
                               }}
                               className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-500 hover:text-primary-container rounded-lg transition-colors cursor-pointer"
                               title="Chỉnh sửa tin đăng"
                             >
                               <span className="material-symbols-outlined text-[16px]">edit</span>
                             </button>
                           )}

                          {/* More Context actions Dropdown menu trigger */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(prev => prev === list.id ? null : list.id);
                              }}
                              className={`w-7 h-7 flex items-center justify-center border rounded-lg cursor-pointer transition-colors ${
                                activeDropdownId === list.id
                                  ? 'bg-orange-50 border-primary-container text-primary-container font-black'
                                  : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                              }`}
                              title="Thao tác"
                            >
                              <span className="material-symbols-outlined text-[16px]">more_vert</span>
                            </button>
                            {activeDropdownId === list.id && (
                              <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 w-36 z-[1000] text-left text-[11px] font-bold text-gray-600 animate-fadeIn">
                                
                                <button 
                                  onClick={() => alert(`Xem chi tiết tin trọ: ${list.title}`)}
                                  className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">info</span> Xem chi tiết
                                </button>
                                
                                {list.status === 'Đang hiển thị' && (
                                  <button 
                                    onClick={() => openHideModal(list)}
                                    className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">visibility_off</span> Ẩn tin
                                  </button>
                                )}

                                {list.status === 'Đang hiển thị' && (
                                  <button 
                                    onClick={() => alert(`Xem trang public bài đăng ${list.code}`)}
                                    className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">visibility</span> Xem public
                                  </button>
                                )}

                                <button 
                                  onClick={() => {
                                    const clone = { ...list, id: Math.random().toString(), code: `RH-LST-${Math.floor(1000 + Math.random() * 9000)}`, title: `${list.title} (Bản sao)`, status: 'Nháp' as const, views: 0, saves: 0, requests: 0, createdDate: new Date().toISOString().split('T')[0] };
                                    setListings(prev => [clone, ...prev]);
                                    triggerToast('Đã nhân bản thành công tin trọ mới lưu nháp');
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-orange-50/40 hover:text-primary-container flex items-center gap-1.5 cursor-pointer border-t border-gray-50"
                                >
                                  <span className="material-symbols-outlined text-[14px]">content_copy</span> Nhân bản tin
                                </button>

                                <button 
                                  onClick={() => openDeleteModal(list)}
                                  className="w-full px-3 py-1.5 hover:bg-red-50 hover:text-red-655 flex items-center gap-1.5 cursor-pointer border-t border-gray-50 text-red-500"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span> Xóa vĩnh viễn
                                </button>

                              </div>
                            )}
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scaleUp">
          {filteredListings.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
            const isSelected = selectedIds.includes(list.id);
            return (
              <div 
                key={list.id} 
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all hover-lift group ${
                  isSelected ? 'border-primary-container ring-2 ring-orange-100' : 'border-gray-150 hover:border-orange-200'
                }`}
              >
                {/* Thumbnail Area */}
                <div className="h-44 relative bg-gray-100 overflow-hidden">
                  <img src={list.thumbnail} alt={list.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Checkbox overlay */}
                  <div className="absolute top-3 left-3 z-10">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectOne(list.id)}
                      className="w-5 h-5 text-primary-container accent-primary-container rounded-lg cursor-pointer bg-white/80 backdrop-blur-sm" 
                    />
                  </div>

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
                    {renderStatusBadge(list.status)}
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-primary-container text-[8.5px] font-black uppercase rounded shadow-sm">
                      {list.type}
                    </span>
                  </div>

                  {/* Dark mask overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Rent Price overlay */}
                  <div className="absolute bottom-3 left-3 text-white text-left">
                    <span className="text-[10px] font-semibold opacity-95 uppercase tracking-wide block">Giá cho thuê:</span>
                    <strong className="text-sm font-black">{list.price.toLocaleString('vi-VN')}đ/tháng</strong>
                  </div>
                </div>

                {/* Content Details Area */}
                <div className="p-4.5 space-y-3">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded w-max block">
                      {list.code} · {list.source === 'existing' ? 'Sinh từ phòng' : 'Tin độc lập'}
                    </span>
                    <h4 
                      onClick={() => alert(`Xem chi tiết tin đăng: ${list.title}`)}
                      className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[34px] hover:text-primary-container cursor-pointer leading-relaxed"
                    >
                      {list.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5 leading-none">
                      <span className="material-symbols-outlined text-[13px] text-gray-400">location_on</span>
                      {list.address}
                    </p>
                  </div>

                  {/* Structural detail indicators */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold border-t border-b border-gray-50 py-2">
                    <span>Diện tích: {list.area} m²</span>
                    <span>·</span>
                    <span>Tối đa: {list.maxPeople} người</span>
                    {list.source === 'existing' && (
                      <>
                        <span>·</span>
                        <span>Phòng: {list.linkedUnit}</span>
                      </>
                    )}
                  </div>

                  {/* Stats & Actions Row */}
                  <div className="flex justify-between items-center pt-1.5 text-xs font-bold text-gray-500">
                    <div>
                      {list.status === 'Nháp' || list.status === 'Chờ duyệt' || list.status === 'Bị từ chối' ? (
                        <span className="text-[10px] text-gray-400 italic">Chưa có chỉ số</span>
                      ) : (
                        <div className="flex gap-2 text-[10px] font-bold text-gray-400">
                          <span className="flex items-center gap-0.5" title="Lượt xem">
                            <span className="material-symbols-outlined text-[13px]">visibility</span>
                            {list.views}
                          </span>
                          <span className="flex items-center gap-0.5" title="Lượt lưu">
                            <span className="material-symbols-outlined text-[13px]">favorite</span>
                            {list.saves}
                          </span>
                          <span className="flex items-center gap-0.5" title="Yêu cầu">
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                            {list.requests}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      
                      {/* Secondary dropdown actions trigger */}
                      <button 
                        onClick={() => {
                          setSelectedListingId(parseInt(list.id, 10));
                          setCurrentPage('owner-listings-create');
                        }}
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-500 hover:text-primary-container rounded-lg cursor-pointer"
                        title="Chỉnh sửa tin đăng"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>

                      {/* Main contextual action for card */}
                      {list.status === 'Đang hiển thị' && (
                        <button 
                          onClick={() => openMarkRentedModal(list)}
                          className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer"
                        >
                          Đã thuê
                        </button>
                      )}

                      {list.status === 'Nháp' && (
                        <button 
                          onClick={() => openResubmitModal(list)}
                          className="px-2.5 py-1 bg-primary-container hover:bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer"
                        >
                          Đăng tin
                        </button>
                      )}

                      {list.status === 'Bị từ chối' && (
                        <button 
                          onClick={() => openReasonModal(list)}
                          className="px-2.5 py-1 bg-red-655 hover:bg-red-750 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer animate-pulse"
                        >
                          Xem lý do
                        </button>
                      )}

                      {list.status === 'Đã ẩn' && (
                        <button 
                          onClick={() => handleShowAgain(list)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase shadow-sm cursor-pointer"
                        >
                          Hiện lại
                        </button>
                      )}

                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* 7. PAGINATION FOOTER */}
      {filteredListings.length > 0 && (
        <div className="bg-white p-4.5 rounded-3xl border border-gray-150 soft-shadow flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>Hiển thị</span>
            <select 
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPageNum(1);
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg bg-white text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value={5}>5 tin</option>
              <option value={10}>10 tin</option>
              <option value={20}>20 tin</option>
              <option value={50}>50 tin</option>
            </select>
            <span>trong tổng số <strong className="text-gray-800 font-extrabold">{filteredListings.length}</strong> tin cho thuê</span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              disabled={currentPageNum === 1}
              onClick={() => setCurrentPageNum(prev => prev - 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                currentPageNum === 1
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.ceil(filteredListings.length / pageSize) }).map((_, index) => {
              const p = index + 1;
              const isSelected = currentPageNum === p;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPageNum(p)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-container border-primary-container text-white shadow-sm ring-2 ring-orange-100'
                      : 'border-gray-200 text-gray-655 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button 
              disabled={currentPageNum === Math.ceil(filteredListings.length / pageSize)}
              onClick={() => setCurrentPageNum(prev => prev + 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                currentPageNum === Math.ceil(filteredListings.length / pageSize)
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL 1: HIDE LISTING CONFIRM */}
      {isHideModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px]">visibility_off</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Ẩn tin cho thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Tin trọ này sẽ bị tạm gỡ bỏ khỏi cổng tìm kiếm trọ công cộng công khai. Người thuê sẽ không tìm được nữa. Bạn vẫn có thể hiển thị lại bất cứ lúc nào.
              </p>
            </div>

            {/* Context details container */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-left text-xs font-semibold text-gray-600">
              <span className="text-[10px] text-gray-400 block uppercase mb-0.5">Tin cho thuê:</span>
              <span className="text-gray-800 font-bold line-clamp-1 block">{activeListing.title}</span>
              <div className="flex justify-between items-center border-t border-gray-200/50 mt-2 pt-2 text-[10px]">
                <span>Mã tin: <strong>{activeListing.code}</strong></span>
                <span>Giá: <strong className="text-primary-container">{activeListing.price.toLocaleString('vi-VN')}đ</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsHideModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Hủy tác vụ
              </button>
              <button 
                onClick={confirmHideListing}
                className="py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Xác nhận Ẩn tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL 2: DELETE LISTING CONFIRM */}
      {isDeleteModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-655 flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">delete</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Xóa vĩnh viễn tin đăng?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn tin đăng khỏi CSDL của RoomHub và <strong className="text-red-600">không thể phục hồi</strong>. Chúng tôi đề xuất bạn chỉ nên tạm ẩn tin đi nếu muốn giữ lại lịch sử số liệu views.
              </p>
            </div>

            {/* Context details container */}
            <div className="bg-red-50/20 p-3 rounded-2xl border border-red-100/50 text-left text-xs font-semibold text-gray-600">
              <span className="text-[10px] text-red-600/70 block uppercase mb-0.5">Xóa tin đăng:</span>
              <span className="text-gray-800 font-bold line-clamp-1 block">{activeListing.title}</span>
              <div className="flex justify-between items-center border-t border-red-100/50 mt-2 pt-2 text-[10px]">
                <span>Mã tin: <strong>{activeListing.code}</strong></span>
                <span>Phân loại: <strong>{activeListing.type}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDeleteListing}
                className="py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Đồng ý Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL 3: MARK RENTED CONFIRM */}
      {isMarkRentedModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">check_circle</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Đánh dấu đã có người thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Tin đăng của bạn sẽ được chuyển tiếp thành công sang trạng thái **Đã thuê**, đánh dấu việc chốt thuê giao dịch thành công.
              </p>
            </div>

            {/* Checkbox ẩn */}
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-left">
              <input 
                type="checkbox" 
                id="hidePublicRent" 
                checked={hidePublicAfterRent}
                onChange={(e) => setHidePublicAfterRent(e.target.checked)}
                className="w-4 h-4 text-primary-container accent-primary-container mt-0.5 cursor-pointer shrink-0" 
              />
              <label htmlFor="hidePublicRent" className="text-[10px] text-gray-600 font-bold select-none cursor-pointer leading-normal">
                Tự động ẩn tin đăng khỏi trang tìm kiếm công khai public sau khi đánh dấu giao dịch đã thuê thành công.
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsMarkRentedModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmMarkRentedListing}
                className="py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Xác nhận Đã thuê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL 4: RESUBMIT LISTING CONFIRM */}
      {isResubmitModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-primary-container flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">send</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Gửi duyệt tin cho thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Tin đăng của bạn sẽ được gửi tới Ban quản trị hệ thống RoomHub Đà Nẵng để tiến hành kiểm duyệt thông số giá cả và hình ảnh thực tế.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmResubmitListing}
                className="py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Gửi phê duyệt ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL 5: REJECTION REASON DISPLAY */}
      {isReasonModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-655 flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-[28px] font-bold">warning_amber</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Lý do tin bị từ chối</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                Ban quản trị RoomHub đã xem xét tin trọ của bạn và gửi trả phản hồi sửa đổi sau:
              </p>
            </div>

            {/* Error detail card */}
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 text-left text-xs font-bold text-red-800 italic leading-relaxed">
              💬 "{activeListing.rejectionReason || 'Ảnh trọ mờ và thiếu thông tin chi phí giá cọc.'}"
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsReasonModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer"
              >
                Đóng lại
              </button>
              <button 
                onClick={() => {
                  setIsReasonModalOpen(false);
                  alert(`Chuyển hướng sang sửa tin trọ ${activeListing.code} để sửa lại lý do...`);
                  setActiveListing(null);
                }}
                className="py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Chỉnh sửa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. TOAST NOTIFICATION FLYER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[3000] bg-gray-900/95 backdrop-blur text-white px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-gray-800 animate-slideIn">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
          <span>{toastMessage}</span>
          <span 
            onClick={() => setToastMessage(null)}
            className="material-symbols-outlined text-[16px] text-gray-400 hover:text-white cursor-pointer ml-1.5"
          >
            close
          </span>
        </div>
      )}

    </div>
  );
};

export default ListingList;
