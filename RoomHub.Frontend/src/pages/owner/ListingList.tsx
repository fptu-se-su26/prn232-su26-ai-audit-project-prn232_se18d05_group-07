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
  description: string;
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
  imageUrls: string[];
  rejectionReason?: string;
  area: number;
  maxPeople: number;
  listingScore?: number;
  aiDescription?: string;
  moderationStatus?: string;
}
const ListingList: React.FC<ListingListProps> = ({ setCurrentPage, setSelectedListingId }) => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const mapListingItem = (item: any): ListingItem => {
    let derivedStatus: ListingStatus = 'Nháp';
    const modStatus = (item.moderationStatus || 'Pending').toLowerCase();
    if (modStatus === 'rejected') {
      derivedStatus = 'Bị từ chối';
    } else if (modStatus === 'pending' || modStatus === 'flagged') {
      derivedStatus = 'Chờ duyệt';
    } else if (modStatus === 'approved' && item.isPublished) {
      derivedStatus = 'Đang hiển thị';
    } else if (modStatus === 'approved' && !item.isPublished) {
      derivedStatus = item.isHidden ? 'Đã ẩn' : 'Nháp';
    }

    return {
      id: item.roomId.toString(),
      code: `RH-LST-${1000 + item.roomId}`,
      title: item.title,
      description: item.description || '',
      type: item.type as PropertyType,
      price: item.price,
      linkedAsset: item.buildingName,
      linkedUnit: item.roomNumber,
      source: 'existing' as SourceType,
      status: derivedStatus,
      views: item.views || 0,
      saves: Math.floor((item.views || 0) * (0.08 + (item.roomId % 5) * 0.01)),
      requests: Math.floor((item.views || 0) * (0.03 + (item.roomId % 3) * 0.01)),
      createdDate: item.createdDate || new Date().toISOString(),
      address: item.buildingName + ', Đà Nẵng',
      thumbnail: (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      imageUrls: item.imageUrls || [],
      rejectionReason: item.moderationRemarks || undefined,
      area: item.area || 25,
      maxPeople: item.capacity || 2,
      listingScore: item.listingScore ?? 100,
      aiDescription: item.aiFormattedDescription || undefined,
      moderationStatus: item.moderationStatus,
    };
  };

  const handlePublishResponse = (data: any, fallbackSuccess: string) => {
    const modStatus = (data?.moderationStatus || '').toLowerCase();
    if (modStatus === 'rejected') {
      triggerToast(data?.message || 'Tin bị AI từ chối. Vui lòng chỉnh sửa nội dung.');
      return false;
    }
    if (modStatus === 'flagged') {
      triggerToast(data?.message || 'Tin đã chuyển Admin duyệt thủ công.');
      return true;
    }
    triggerToast(data?.message || fallbackSuccess);
    return true;
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/listings');
      setListings(res.data.map(mapListingItem));
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
      const results = await Promise.allSettled(
        selectedIds.map(id => api.put(`/owner/listings/${id}/publish`, { isPublished: true }))
      );
      const rejected = results.filter(r => r.status === 'rejected').length;
      await fetchListings();
      if (rejected > 0) {
        triggerToast(`${rejected}/${selectedIds.length} tin bị từ chối hoặc lỗi khi gửi duyệt.`);
      } else {
        triggerToast(`Đã gửi kiểm duyệt AI cho ${selectedIds.length} tin cho thuê`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi gửi duyệt hàng loạt.');
    } finally {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} tin đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/owner/listings/${id}`)));
      await fetchListings();
      triggerToast(`Đã xóa vĩnh viễn ${selectedIds.length} tin cho thuê`);
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi xóa hàng loạt.');
    } finally {
      setSelectedIds([]);
    }
  };

  const closeDropdown = () => setActiveDropdownId(null);

  const openDetailModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsDetailModalOpen(true);
    closeDropdown();
  };

  const handleViewPublic = (listing: ListingItem) => {
    if (listing.status !== 'Đang hiển thị') {
      triggerToast('Tin chưa được công bố, không thể xem trang public.');
      return;
    }
    window.open(`${window.location.origin}/room/${listing.id}`, '_blank', 'noopener,noreferrer');
    closeDropdown();
  };

  const handleDuplicateListing = async (listing: ListingItem) => {
    closeDropdown();
    try {
      const res = await api.post(`/owner/listings/${listing.id}/duplicate`, {});
      if (res.data.success) {
        triggerToast(res.data.message || 'Đã nhân bản tin thành công.');
        await fetchListings();
      } else {
        triggerToast(res.data.message || 'Không thể nhân bản tin.');
      }
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Không thể nhân bản tin. Kiểm tra còn phòng trống trong tòa nhà.');
    }
  };

  const renderActionMenu = (list: ListingItem) => (
    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-2 w-44 z-[1000] text-left text-xs font-bold text-gray-600 animate-fadeIn backdrop-blur-sm bg-white/95">
      <button
        onClick={() => openDetailModal(list)}
        className="w-full px-3.5 py-2 hover:bg-orange-50/50 hover:text-orange-600 flex items-center gap-2 transition-all duration-150 cursor-pointer text-left"
      >
        <span className="material-symbols-outlined text-[16px] text-gray-400">info</span> Xem chi tiết
      </button>

      {list.status === 'Đang hiển thị' && (
        <button
          onClick={() => { openHideModal(list); closeDropdown(); }}
          className="w-full px-3.5 py-2 hover:bg-orange-50/50 hover:text-orange-600 flex items-center gap-2 transition-all duration-150 cursor-pointer text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-gray-400">visibility_off</span> Ẩn tin
        </button>
      )}

      {list.status === 'Đang hiển thị' && (
        <button
          onClick={() => handleViewPublic(list)}
          className="w-full px-3.5 py-2 hover:bg-orange-50/50 hover:text-orange-600 flex items-center gap-2 transition-all duration-150 cursor-pointer border-t border-gray-50/60 text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-gray-400">open_in_new</span> Xem public
        </button>
      )}

      <button
        onClick={() => handleDuplicateListing(list)}
        className="w-full px-3.5 py-2 hover:bg-orange-50/50 hover:text-orange-600 flex items-center gap-2 transition-all duration-150 cursor-pointer border-t border-gray-50/60 text-left"
      >
        <span className="material-symbols-outlined text-[16px] text-gray-400">content_copy</span> Nhân bản tin
      </button>

      <button
        onClick={() => { openDeleteModal(list); closeDropdown(); }}
        className="w-full px-3.5 py-2 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 transition-all duration-150 cursor-pointer border-t border-gray-50/60 text-rose-500 text-left"
      >
        <span className="material-symbols-outlined text-[16px] text-rose-400">delete</span> Xóa vĩnh viễn
      </button>
    </div>
  );

  // Single Action Triggers
  const openHideModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsHideModalOpen(true);
  };

  const confirmHideListing = async () => {
    if (!activeListing) return;
    try {
      await api.put(`/owner/listings/${activeListing.id}/publish`, { isPublished: false });
      await fetchListings();
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

  const confirmDeleteListing = async () => {
    if (!activeListing) return;
    try {
      await api.delete(`/owner/listings/${activeListing.id}`);
      await fetchListings();
      triggerToast('Đã xóa vĩnh viễn tin đăng thành công');
    } catch (err) {
      console.error(err);
      triggerToast('Có lỗi xảy ra khi xóa tin.');
    } finally {
      setIsDeleteModalOpen(false);
      setActiveListing(null);
    }
  };

  const openResubmitModal = (listing: ListingItem) => {
    setActiveListing(listing);
    setIsResubmitModalOpen(true);
  };

  const confirmResubmitListing = async () => {
    if (!activeListing) return;
    try {
      const res = await api.put(`/owner/listings/${activeListing.id}/publish`, { isPublished: true });
      handlePublishResponse(res.data, 'Đã gửi yêu cầu phê duyệt lại tin trọ thành công');
      await fetchListings();
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      triggerToast(data?.message || 'Có lỗi xảy ra khi gửi yêu cầu duyệt.');
      await fetchListings();
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
      const res = await api.put(`/owner/listings/${listing.id}/publish`, { isPublished: true });
      handlePublishResponse(res.data, 'Đã gửi lại duyệt để khôi phục trạng thái hiển thị');
      await fetchListings();
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      triggerToast(data?.message || 'Có lỗi xảy ra khi hiển thị lại tin.');
      await fetchListings();
    }
  };

  // Dynamic Badges Render Helpers
  const renderStatusBadge = (status: ListingStatus, listing?: ListingItem) => {
    const scoreColor = (listing?.listingScore ?? 100) >= 70 
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
      : (listing?.listingScore ?? 100) >= 40 
        ? 'text-amber-600 bg-amber-50 border-amber-100' 
        : 'text-rose-600 bg-rose-50 border-rose-100';
    
    switch (status) {
      case 'Đang hiển thị':
        return (
          <div className="flex flex-col gap-1 text-left">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang hiển thị
            </span>
            {listing?.listingScore != null && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded flex items-center gap-0.5 w-max ${scoreColor}`}>
                <span className="material-symbols-outlined text-[11px]">insights</span>
                AI Score: {listing.listingScore}/100
              </span>
            )}
          </div>
        );
      case 'Chờ duyệt':
        return (
          <div className="flex flex-col gap-1 text-left">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max animate-pulse">
              <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
              AI đang duyệt
            </span>
            {listing?.rejectionReason && (
              <span className="text-[9px] text-amber-600 font-medium max-w-[180px] truncate block" title={listing.rejectionReason}>
                {listing.rejectionReason}
              </span>
            )}
          </div>
        );
      case 'Nháp':
        return (
          <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200/60 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            Bản nháp
          </span>
        );
      case 'Bị từ chối':
        return (
          <div className="flex flex-col gap-1 group/reject relative text-left">
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max cursor-help">
              <span className="material-symbols-outlined text-[12px]">gpp_bad</span>
              AI từ chối
            </span>
            {listing?.rejectionReason && (
              <>
                <span className="text-[9px] text-rose-500 font-medium max-w-[180px] truncate cursor-help block" title={listing.rejectionReason}>
                  💬 {listing.rejectionReason}
                </span>
                {/* Tooltip popup dạng kính mờ */}
                <div className="invisible group-hover/reject:visible absolute z-[9999] bottom-full left-0 mb-2 w-72 p-4 bg-white/95 backdrop-blur-md border border-rose-100 rounded-2xl shadow-xl text-left transition-all opacity-0 group-hover/reject:opacity-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-rose-500 text-[18px]">smart_toy</span>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Phản hồi từ AI RoomHub</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{listing.rejectionReason}</p>
                  {listing.listingScore != null && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold">Điểm chất lượng:</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 border rounded ${scoreColor}`}>{listing.listingScore}/100</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      case 'Đã ẩn':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Đã tạm ẩn
          </span>
        );
      case 'Đã thuê':
        return (
          <span className="px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-200/60 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Đã thuê
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">
      
      {/* 1. BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50/50 px-3 py-1.5 rounded-full border border-gray-100">
          <span className="hover:text-orange-605 cursor-pointer flex items-center gap-1 transition-colors" onClick={() => setCurrentPage('owner-dashboard')}>
            <span className="material-symbols-outlined text-[14px]">home</span>
            Chủ nhà
          </span>
          <span className="material-symbols-outlined text-[12px] text-gray-300">chevron_right</span>
          <span className="text-gray-800 font-bold">Tin cho thuê</span>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto justify-end">
          <button 
            onClick={() => alert('Chuyển tiếp đến xem danh sách tin công cộng của chủ nhà này...')}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-orange-600 text-gray-600 rounded-xl text-xs font-bold transition-all duration-205 flex items-center gap-2 cursor-pointer bg-white shadow-sm hover:shadow active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-gray-400">visibility</span> Xem trang public
          </button>
          <button 
            onClick={() => {
              setSelectedListingId(null);
              setCurrentPage('owner-listings-create');
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 flex items-center gap-2 cursor-pointer active:scale-95 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span> Đăng tin mới
          </button>
        </div>
      </div>

      {/* 2. PAGE SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Tổng */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-orange-500 text-[22px]">campaign</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Tổng tin đăng</span>
            <span className="text-2xl font-black text-gray-800 leading-tight block mt-0.5">{stats.total}</span>
            <span className="text-[9px] text-gray-400 font-medium">Tất cả tin đã tạo</span>
          </div>
        </div>

        {/* Card 2: Hiển thị */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-emerald-500 text-[22px]">visibility</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Đang hiển thị</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight block mt-0.5">{stats.active}</span>
            <span className="text-[9px] text-emerald-500/80 font-medium">Đã công bố public</span>
          </div>
        </div>

        {/* Card 3: Chờ duyệt */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-amber-500 text-[22px]">schedule</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Chờ duyệt</span>
            <span className="text-2xl font-black text-amber-600 leading-tight block mt-0.5">{stats.pending}</span>
            <span className="text-[9px] text-amber-500/80 font-medium">Chờ Admin duyệt</span>
          </div>
        </div>

        {/* Card 4: Nháp */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-slate-500 text-[22px]">draft</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Bản nháp</span>
            <span className="text-2xl font-black text-slate-600 leading-tight block mt-0.5">{stats.draft}</span>
            <span className="text-[9px] text-slate-400 font-medium">Chưa gửi đăng tin</span>
          </div>
        </div>

        {/* Card 5: Bị từ chối */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-rose-500 text-[22px]">error</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Bị từ chối</span>
            <span className="text-2xl font-black text-rose-600 leading-tight block mt-0.5">{stats.rejected}</span>
            <span className="text-[9px] text-rose-500/80 font-medium">Cần chỉnh sửa lại</span>
          </div>
        </div>

      </div>

      {/* 3. SEARCH & FILTER CARD */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm p-6 space-y-5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-orange-500">manage_search</span>
          Bộ lọc & Tìm kiếm nâng cao
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-bold text-gray-500 text-left">
          
          {/* Keyword Search */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="uppercase text-[10px] text-gray-400 tracking-wider">Từ khóa tìm kiếm</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Tiêu đề, địa chỉ, mã tin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200/80 hover:border-gray-300 focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-gray-50/30 hover:bg-gray-50/60 focus:bg-white text-xs font-semibold text-gray-700 transition-all duration-200" 
              />
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="space-y-1.5">
            <label className="uppercase text-[10px] text-gray-400 tracking-wider">Loại hình</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200/80 hover:border-gray-300 focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-gray-50/30 hover:bg-gray-50/60 focus:bg-white text-xs font-bold text-gray-700 transition-all duration-200 cursor-pointer"
            >
              <option value="Tất cả">Tất cả loại hình</option>
              <option value="Phòng trọ">Phòng trọ</option>
              <option value="Studio">Studio</option>
              <option value="Căn hộ mini">Căn hộ mini</option>
              <option value="Căn hộ">Căn hộ</option>
            </select>
          </div>

          {/* Source Type Dropdown */}
          <div className="space-y-1.5">
            <label className="uppercase text-[10px] text-gray-400 tracking-wider">Nguồn tin đăng</label>
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200/80 hover:border-gray-300 focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-gray-50/30 hover:bg-gray-50/60 focus:bg-white text-xs font-bold text-gray-700 transition-all duration-200 cursor-pointer"
            >
              <option value="Tất cả">Tất cả nguồn</option>
              <option value="Từ phòng/căn có sẵn">Từ phòng có sẵn</option>
              <option value="Tin độc lập">Tin độc lập</option>
            </select>
          </div>

          {/* Asset Dropdown */}
          <div className="space-y-1.5">
            <label className="uppercase text-[10px] text-gray-400 tracking-wider">Tài sản liên kết</label>
            <select 
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200/80 hover:border-gray-300 focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-gray-50/30 hover:bg-gray-50/60 focus:bg-white text-xs font-bold text-gray-700 transition-all duration-200 cursor-pointer"
            >
              <option value="Tất cả">Tất cả tài sản</option>
              <option value="FPT House">FPT House</option>
              <option value="Hòa Hải Studio">Hòa Hải Studio</option>
              <option value="Sơn Trà Mini Apartment">Sơn Trà Mini</option>
              <option value="Ngũ Hành Sơn Rooms">Ngũ Hành Sơn Rooms</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="space-y-1.5">
            <label className="uppercase text-[10px] text-gray-400 tracking-wider">Thời gian tạo</label>
            <select 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200/80 hover:border-gray-300 focus:border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-gray-50/30 hover:bg-gray-50/60 focus:bg-white text-xs font-bold text-gray-700 transition-all duration-200 cursor-pointer"
            >
              <option value="Tất cả">Tất cả thời gian</option>
              <option value="7 ngày gần đây">7 ngày gần đây</option>
              <option value="30 ngày gần đây">30 ngày gần đây</option>
              <option value="Tháng này">Tháng này</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-2.5 border-t border-gray-50 pt-4">
          <button 
            onClick={handleResetFilters}
            className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-505 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 shadow-sm bg-white"
          >
            Đặt lại bộ lọc
          </button>
          <button 
            onClick={() => triggerToast('Đã áp dụng các điều kiện tìm kiếm nâng cao')}
            className="px-5.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 cursor-pointer active:scale-95"
          >
            Tìm kiếm ngay
          </button>
        </div>
      </div>

      {/* 4. LISTING STATUS TABS & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-left">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 w-full lg:w-auto border-b lg:border-0 border-gray-100">
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md shadow-orange-500/10 transform -translate-y-0.5'
                    : 'bg-white border-gray-200/80 text-gray-500 hover:bg-orange-50/20 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {tab}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-550'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle & Sort Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
                viewMode === 'table' ? 'bg-orange-50 text-orange-600 font-black shadow-sm' : 'text-gray-400 hover:text-gray-650'
              }`}
              title="Xem bảng"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
                viewMode === 'card' ? 'bg-orange-50 text-orange-600 font-black shadow-sm' : 'text-gray-400 hover:text-gray-650'
              }`}
              title="Xem lưới"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 cursor-pointer shadow-sm transition-all"
          >
            <option value="Mới nhất">Mới nhất</option>
            <option value="Cũ nhất">Cũ nhất</option>
            <option value="Lượt xem cao nhất">Lượt xem nhiều nhất</option>
            <option value="Giá thấp đến cao">Giá tăng dần</option>
            <option value="Giá cao đến thấp">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* 5. BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50/90 to-amber-50/90 backdrop-blur border border-orange-200/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-scaleUp shadow-md shadow-orange-500/5">
          <div className="flex items-center gap-3 text-xs font-bold text-orange-800 text-left">
            <span className="material-symbols-outlined text-[20px] text-orange-500 font-bold">check_box</span>
            <span>Đang chọn <strong className="text-lg text-orange-605 font-black px-1">{selectedIds.length}</strong> tin cho thuê đã lọc</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end text-xs font-bold">
            <button 
              onClick={handleBulkHide}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span> Ẩn tin
            </button>
            <button 
              onClick={handleBulkResubmit}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-orange-100/30 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">send</span> Gửi duyệt
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100/50 border border-rose-100 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">delete</span> Xóa tin
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 text-gray-400 hover:text-gray-650 hover:bg-white/55 rounded-xl transition-all duration-150 cursor-pointer outline-none font-bold"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* 6. LISTINGS RESULTS CONTAINER */}
      {loading ? (
        <div className="min-h-[380px] bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full border-[3px] border-orange-100 border-t-orange-500 animate-spin"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải danh sách tin cho thuê của bạn...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="bg-white p-12 rounded-[24px] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[380px] animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-2 shadow-sm">
            <span className="material-symbols-outlined text-[36px]">campaign</span>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả'
                ? 'Không tìm thấy tin cho thuê nào phù hợp'
                : 'Chưa có tin cho thuê nào'}
            </h4>
            <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
              {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả'
                ? 'Vui lòng thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để hiển thị nhiều kết quả hơn.'
                : 'Đăng tin cho thuê phòng ngay hôm nay để thu hút hàng ngàn người thuê trên hệ thống RoomHub Đà Nẵng.'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            {searchTerm || filterType !== 'Tất cả' || filterStatus !== 'Tất cả' || filterSource !== 'Tất cả' || filterAsset !== 'Tất cả' || filterDate !== 'Tất cả' || activeTab !== 'Tất cả' ? (
              <button 
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow shadow-orange-500/10 cursor-pointer active:scale-95"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <>
                <button 
                  onClick={() => alert('Liên kết nhanh từ phòng trọ trống có sẵn...')}
                  className="px-4.5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100/50 border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tạo từ phòng có sẵn
                </button>
                <button 
                  onClick={() => {
                    setSelectedListingId(null);
                    setCurrentPage('owner-listings-create');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">add</span> Đăng tin mới
                </button>
              </>
            )}
          </div>
        </div>

      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden animate-fadeIn text-left">
          <div className="overflow-x-auto border-0">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-widest text-[10px] text-gray-400 font-extrabold">
                  <th className="py-4 px-4.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                      className="w-4 h-4 text-orange-500 accent-orange-500 rounded cursor-pointer transition-all focus:ring-0" 
                    />
                  </th>
                  <th className="py-4 px-4 min-w-[300px]">Tin cho thuê</th>
                  <th className="py-4 px-4">Loại hình</th>
                  <th className="py-4 px-4">Giá thuê</th>
                  <th className="py-4 px-4">Tài sản liên kết</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 min-w-[150px]">Chỉ số hiệu quả</th>
                  <th className="py-4 px-4">Ngày tạo</th>
                  <th className="py-4 px-4 text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filteredListings.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
                  const isSelected = selectedIds.includes(list.id);
                  return (
                    <tr 
                      key={list.id} 
                      className={`hover:bg-orange-50/10 transition-colors duration-150 ${
                        isSelected ? 'bg-orange-50/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4.5 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectOne(list.id)}
                          className="w-4 h-4 text-orange-500 accent-orange-500 rounded cursor-pointer transition-all focus:ring-0" 
                        />
                      </td>

                      {/* Listing Info (Title, Code, Address) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 overflow-hidden rounded-xl border border-gray-100 shadow-sm shrink-0">
                            <img 
                              src={list.thumbnail} 
                              alt={list.title} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 animate-scaleUp" 
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <span 
                              onClick={() => {
                                setSelectedListingId(parseInt(list.id, 10));
                                setCurrentPage('owner-listings-create');
                              }}
                              className="font-bold text-gray-800 line-clamp-1 hover:text-orange-600 transition-colors cursor-pointer text-xs"
                            >
                              {list.title}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black">{list.code}</span>
                              {list.source === 'existing' ? (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">Có sẵn</span>
                              ) : (
                                <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black">Độc lập</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold block line-clamp-1">{list.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Property Type Badge */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-orange-50/50 text-orange-600 text-[10px] font-bold rounded-lg uppercase border border-orange-100/50">
                          {list.type}
                        </span>
                      </td>

                      {/* Rent Price */}
                      <td className="py-4 px-4 font-black text-gray-800 text-xs text-left">
                        {list.price.toLocaleString('vi-VN')}đ<span className="text-[10px] font-semibold text-gray-400 block">/tháng</span>
                      </td>

                      {/* Linked Unit */}
                      <td className="py-4 px-4 text-left">
                        {list.source === 'existing' ? (
                          <div className="space-y-0.5">
                            <span className="text-gray-800 font-bold block">{list.linkedAsset}</span>
                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-gray-400">home</span>
                              Phòng {list.linkedUnit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px] font-medium">Không liên kết</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {renderStatusBadge(list.status, list)}
                          {list.status === 'Bị từ chối' && (
                            <button 
                              onClick={() => openReasonModal(list)}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline block cursor-pointer"
                            >
                              Xem lý do
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stats efficiency */}
                      <td className="py-4 px-4 text-left">
                        {list.status === 'Nháp' || list.status === 'Chờ duyệt' || list.status === 'Bị từ chối' ? (
                          <span className="text-gray-400 italic text-[10px] font-medium">Chưa có dữ liệu</span>
                        ) : (
                          <div className="flex gap-3 text-[11px] font-semibold text-gray-550">
                            <span className="flex items-center gap-1" title="Lượt xem">
                              <span className="material-symbols-outlined text-[15px] text-gray-400">visibility</span>
                              {list.views}
                            </span>
                            <span className="flex items-center gap-1" title="Lượt lưu">
                              <span className="material-symbols-outlined text-[15px] text-gray-400">favorite</span>
                              {list.saves}
                            </span>
                            <span className="flex items-center gap-1" title="Liên hệ">
                              <span className="material-symbols-outlined text-[15px] text-gray-400">chat</span>
                              {list.requests}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-left">
                        <span className="text-gray-700 font-bold block">{new Date(list.createdDate).toLocaleDateString('vi-VN')}</span>
                        <span className="text-[9px] text-gray-400 font-semibold block">Khởi tạo</span>
                      </td>

                      {/* Dynamic Action Buttons */}
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Main Primary Action Button according to status */}
                          {list.status === 'Nháp' && (
                            <button 
                              onClick={() => openResubmitModal(list)}
                              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-605 border border-orange-200/50 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              title="Gửi kiểm duyệt để đăng"
                            >
                              Đăng tin
                            </button>
                          )}

                          {list.status === 'Đang hiển thị' && (
                            <button 
                              onClick={() => openMarkRentedModal(list)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-105 text-emerald-750 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              title="Đánh dấu đã có khách thuê"
                            >
                              Đã thuê
                            </button>
                          )}

                          {list.status === 'Bị từ chối' && (
                            <button 
                              onClick={() => openResubmitModal(list)}
                              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-605 border border-orange-200/50 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              title="Sửa và gửi duyệt lại"
                            >
                              Duyệt lại
                            </button>
                          )}

                          {list.status === 'Đã ẩn' && (
                            <button 
                              onClick={() => handleShowAgain(list)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-750 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
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
                              className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-500 hover:text-orange-600 rounded-lg transition-all cursor-pointer"
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
                              className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                                activeDropdownId === list.id
                                  ? 'bg-orange-50 border-orange-500 text-orange-600 font-black'
                                  : 'border-gray-200 hover:bg-gray-50 text-gray-450 hover:text-gray-650'
                              }`}
                              title="Thao tác"
                            >
                              <span className="material-symbols-outlined text-[16px]">more_vert</span>
                            </button>
                            {activeDropdownId === list.id && renderActionMenu(list)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scaleUp text-left">
          {filteredListings.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize).map((list) => {
            const isSelected = selectedIds.includes(list.id);
            return (
              <div 
                key={list.id} 
                className={`bg-white rounded-[24px] border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1.5 group ${
                  isSelected ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100 hover:border-orange-200'
                }`}
              >
                {/* Thumbnail Area */}
                <div className="h-48 relative bg-gray-100 overflow-hidden">
                  <img src={list.thumbnail} alt={list.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Checkbox overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectOne(list.id)}
                      className="w-5 h-5 text-orange-500 accent-orange-500 rounded-lg cursor-pointer bg-white/90 border-transparent shadow focus:ring-0 animate-scaleUp" 
                    />
                  </div>

                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end z-10">
                    {renderStatusBadge(list.status, list)}
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-orange-650 text-[9px] font-black tracking-wider uppercase rounded-lg border border-orange-100/20 shadow-sm">
                      {list.type}
                    </span>
                  </div>

                  {/* Dark mask overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  
                  {/* Rent Price overlay */}
                  <div className="absolute bottom-4 left-4 text-white text-left">
                    <span className="text-[10px] font-semibold opacity-85 uppercase tracking-wider block">Giá cho thuê:</span>
                    <strong className="text-base font-black tracking-tight">{list.price.toLocaleString('vi-VN')}đ<span className="text-xs font-semibold opacity-90">/tháng</span></strong>
                  </div>
                </div>

                {/* Content Details Area */}
                <div className="p-5 space-y-3.5">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg w-max block">
                      {list.code} · {list.source === 'existing' ? 'Tài sản liên kết' : 'Tin độc lập'}
                    </span>
                    <h4 
                      onClick={() => openDetailModal(list)}
                      className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[36px] hover:text-orange-600 transition-colors cursor-pointer leading-relaxed"
                    >
                      {list.title}
                    </h4>
                    <p className="text-[10.5px] text-gray-400 font-semibold flex items-center gap-1 leading-none">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                      {list.address}
                    </p>
                  </div>

                  {/* Structural detail indicators */}
                  <div className="flex items-center gap-4 text-[10.5px] text-gray-450 font-bold border-t border-b border-gray-100/60 py-2.5">
                    <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">zoom_out_map</span>{list.area} m²</span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">person_pin</span>Tối đa {list.maxPeople}</span>
                    {list.source === 'existing' && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[13px]">door_open</span>P.{list.linkedUnit}</span>
                      </>
                    )}
                  </div>

                  {/* Stats & Actions Row */}
                  <div className="flex justify-between items-center pt-1 text-xs font-bold text-gray-500">
                    <div>
                      {list.status === 'Nháp' || list.status === 'Chờ duyệt' || list.status === 'Bị từ chối' ? (
                        <span className="text-[10px] text-gray-400 italic">Chưa có chỉ số</span>
                      ) : (
                        <div className="flex gap-2.5 text-[10.5px] font-bold text-gray-400">
                          <span className="flex items-center gap-0.5" title="Lượt xem">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {list.views}
                          </span>
                          <span className="flex items-center gap-0.5" title="Lượt lưu">
                            <span className="material-symbols-outlined text-[14px]">favorite</span>
                            {list.saves}
                          </span>
                          <span className="flex items-center gap-0.5" title="Yêu cầu">
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            {list.requests}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 relative">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(prev => prev === list.id ? null : list.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-550 hover:text-orange-600 rounded-lg cursor-pointer transition-all"
                          title="Thao tác"
                        >
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>
                        {activeDropdownId === list.id && renderActionMenu(list)}
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedListingId(parseInt(list.id, 10));
                          setCurrentPage('owner-listings-create');
                        }}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-550 hover:text-orange-600 rounded-lg cursor-pointer transition-all"
                        title="Chỉnh sửa tin đăng"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      {/* Main contextual action for card */}
                      {list.status === 'Đang hiển thị' && (
                        <button 
                          onClick={() => openMarkRentedModal(list)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-all active:scale-95"
                        >
                          Đã thuê
                        </button>
                      )}

                      {list.status === 'Nháp' && (
                        <button 
                          onClick={() => openResubmitModal(list)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-all active:scale-95"
                        >
                          Đăng tin
                        </button>
                      )}

                      {list.status === 'Bị từ chối' && (
                        <button 
                          onClick={() => openReasonModal(list)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-all active:scale-95 animate-pulse"
                        >
                          Lý do
                        </button>
                      )}

                      {list.status === 'Đã ẩn' && (
                        <button 
                          onClick={() => handleShowAgain(list)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm cursor-pointer transition-all active:scale-95"
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
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-550">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select 
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPageNum(1);
              }}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500"
            >
              <option value={5}>5 tin</option>
              <option value={10}>10 tin</option>
              <option value={20}>20 tin</option>
              <option value={50}>50 tin</option>
            </select>
            <span>trong tổng số <strong className="text-gray-800 font-extrabold">{filteredListings.length}</strong> tin cho thuê</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPageNum === 1}
              onClick={() => setCurrentPageNum(prev => prev - 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-150 ${
                currentPageNum === 1
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-90 shadow-sm'
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
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow shadow-orange-500/10 ring-2 ring-orange-100 font-black'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button 
              disabled={currentPageNum === Math.ceil(filteredListings.length / pageSize)}
              onClick={() => setCurrentPageNum(prev => prev + 1)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-150 ${
                currentPageNum === Math.ceil(filteredListings.length / pageSize)
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-90 shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: LISTING DETAIL */}
      {isDetailModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] shadow-2xl flex flex-col animate-scaleUp max-w-lg w-full border border-gray-100 max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100/80 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-orange-500">campaign</span>
                Chi tiết tin đăng cho thuê
              </h3>
              <button 
                onClick={() => { setIsDetailModalOpen(false); setActiveListing(null); }} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-left">
              {activeListing.imageUrls.length > 0 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                  {activeListing.imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt="" className="w-28 h-28 rounded-xl object-cover shrink-0 border border-gray-100/60 shadow-sm hover:scale-105 transition-transform duration-200" />
                  ))}
                </div>
              )}
              <div>
                <p className="text-[10px] text-orange-600 uppercase font-black tracking-wider bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded w-max">
                  {activeListing.code} · {activeListing.status}
                </p>
                <h4 className="text-base font-bold text-gray-800 mt-2">{activeListing.title}</h4>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mô tả chi tiết</span>
                <p className="text-xs text-gray-650 leading-relaxed bg-gray-50/50 border border-gray-100 p-3 rounded-xl whitespace-pre-line">{activeListing.description || 'Chưa có mô tả chi tiết từ chủ nhà.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span className="text-gray-400 block text-[9.5px] font-bold uppercase tracking-wider">Giá thuê</span>
                  <strong className="text-gray-800 text-sm mt-0.5 block">{activeListing.price.toLocaleString('vi-VN')}đ/tháng</strong>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span className="text-gray-400 block text-[9.5px] font-bold uppercase tracking-wider">Diện tích</span>
                  <strong className="text-gray-800 text-sm mt-0.5 block">{activeListing.area} m²</strong>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span className="text-gray-400 block text-[9.5px] font-bold uppercase tracking-wider">Tòa nhà</span>
                  <strong className="text-gray-800 text-sm mt-0.5 block">{activeListing.linkedAsset}</strong>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span className="text-gray-400 block text-[9.5px] font-bold uppercase tracking-wider">Mã phòng</span>
                  <strong className="text-gray-800 text-sm mt-0.5 block">Phòng {activeListing.linkedUnit}</strong>
                </div>
              </div>
              
              {activeListing.listingScore != null && (
                <div className="flex items-center gap-1.5 text-xs text-gray-605 bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500 animate-pulse">insights</span>
                  <span>Điểm tối ưu AI đánh giá: <strong className="text-emerald-600 font-extrabold">{activeListing.listingScore}/100</strong> (Rất tốt cho SEO)</span>
                </div>
              )}
              {activeListing.rejectionReason && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-800 whitespace-pre-line text-left leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1.5 font-bold uppercase text-[10px] text-rose-700 tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Phản hồi sửa đổi từ Admin
                  </div>
                  "{activeListing.rejectionReason}"
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              {activeListing.status === 'Đang hiển thị' && (
                <button 
                  onClick={() => handleViewPublic(activeListing)} 
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow shadow-orange-500/10 active:scale-95"
                >
                  Xem public
                </button>
              )}
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedListingId(parseInt(activeListing.id, 10));
                  setCurrentPage('owner-listings-create');
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer bg-white"
              >
                Chỉnh sửa tin đăng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL 1: HIDE LISTING CONFIRM */}
      {isHideModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] p-6.5 shadow-2xl flex flex-col space-y-4.5 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-505 flex items-center justify-center mx-auto mb-1 shadow-sm">
              <span className="material-symbols-outlined text-[30px]">visibility_off</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Ẩn tin đăng cho thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Tin đăng này sẽ tạm gỡ khỏi sàn RoomHub. Người dùng sẽ không tìm thấy. Lịch sử lượt xem và yêu cầu liên hệ vẫn được lưu giữ đầy đủ.
              </p>
            </div>

            {/* Context details container */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-left text-xs font-bold text-gray-600 space-y-1">
              <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Tin cho thuê đăng:</span>
              <span className="text-gray-800 font-bold line-clamp-1 block text-xs">{activeListing.title}</span>
              <div className="flex justify-between items-center border-t border-gray-200/60 mt-2.5 pt-2 text-[10px] text-gray-450 font-semibold">
                <span>Mã tin: <strong className="text-gray-700 font-bold">{activeListing.code}</strong></span>
                <span>Giá: <strong className="text-orange-605 font-black">{activeListing.price.toLocaleString('vi-VN')}đ</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsHideModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-3 border border-gray-200 hover:bg-gray-50 text-gray-505 rounded-xl transition-all cursor-pointer bg-white"
              >
                Hủy tác vụ
              </button>
              <button 
                onClick={confirmHideListing}
                className="py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer active:scale-95"
              >
                Xác nhận ẩn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL 2: DELETE LISTING CONFIRM */}
      {isDeleteModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] p-6.5 shadow-2xl flex flex-col space-y-4.5 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-1 shadow-sm">
              <span className="material-symbols-outlined text-[30px] font-bold">delete</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Xóa vĩnh viễn tin đăng?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn tin đăng và <strong className="text-rose-600">không thể khôi phục</strong>. Chúng tôi đề xuất bạn chỉ nên ẩn đi nếu muốn giữ số liệu.
              </p>
            </div>

            {/* Context details container */}
            <div className="bg-rose-50/20 p-3.5 rounded-2xl border border-rose-100/50 text-left text-xs font-bold text-gray-650 space-y-1">
              <span className="text-[9px] text-rose-600 block uppercase tracking-wider">Tin đăng bị xóa:</span>
              <span className="text-gray-800 font-bold line-clamp-1 block text-xs">{activeListing.title}</span>
              <div className="flex justify-between items-center border-t border-rose-100/50 mt-2.5 pt-2 text-[10px] text-gray-450 font-semibold">
                <span>Mã tin: <strong className="text-gray-700 font-bold">{activeListing.code}</strong></span>
                <span>Phân loại: <strong className="text-rose-700 font-bold">{activeListing.type}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-3 border border-gray-200 hover:bg-gray-50 text-gray-505 rounded-xl transition-all cursor-pointer bg-white"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDeleteListing}
                className="py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-650 text-white rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer active:scale-95"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL 3: MARK RENTED CONFIRM */}
      {isMarkRentedModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] p-6.5 shadow-2xl flex flex-col space-y-4.5 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-505 flex items-center justify-center mx-auto mb-1 shadow-sm">
              <span className="material-symbols-outlined text-[30px] font-bold">check_circle</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Đánh dấu đã có người thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Hệ thống sẽ ghi nhận tin trọ này của bạn ở trạng thái đã giao dịch thuê thành công.
              </p>
            </div>

            {/* Checkbox ẩn */}
            <div className="flex items-start gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-150 text-left">
              <input 
                type="checkbox" 
                id="hidePublicRent" 
                checked={hidePublicAfterRent}
                onChange={(e) => setHidePublicAfterRent(e.target.checked)}
                className="w-4 h-4 text-orange-500 accent-orange-500 mt-0.5 cursor-pointer shrink-0 focus:ring-0" 
              />
              <label htmlFor="hidePublicRent" className="text-[10px] text-gray-655 font-bold select-none cursor-pointer leading-normal">
                Tự động ẩn tin đăng khỏi trang tìm kiếm công khai public sau khi chuyển trạng thái thành công.
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsMarkRentedModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-3 border border-gray-200 hover:bg-gray-50 text-gray-505 rounded-xl transition-all cursor-pointer bg-white"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmMarkRentedListing}
                className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95"
              >
                Xác nhận đã thuê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL 4: RESUBMIT LISTING CONFIRM */}
      {isResubmitModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] p-6.5 shadow-2xl flex flex-col space-y-4.5 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-1 shadow-sm">
              <span className="material-symbols-outlined text-[30px] font-bold">send</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Gửi duyệt tin cho thuê?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Tin đăng trọ của bạn sẽ được gửi tới đội ngũ kiểm duyệt hệ thống RoomHub Đà Nẵng để duyệt thông số thực tế.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-1">
              <button 
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setActiveListing(null);
                }}
                className="py-3 border border-gray-200 hover:bg-gray-50 text-gray-505 rounded-xl transition-all cursor-pointer bg-white"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmResubmitListing}
                className="py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer active:scale-95"
              >
                Gửi phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL 5: REJECTION REASON DISPLAY */}
      {isReasonModalOpen && activeListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-[2200] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-[28px] p-6.5 shadow-2xl flex flex-col space-y-4.5 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-1 shadow-sm">
              <span className="material-symbols-outlined text-[30px] font-bold">warning_amber</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Lý do tin bị từ chối</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Ban quản trị kiểm duyệt RoomHub đã gửi trả phản hồi sửa đổi sau:
              </p>
            </div>

            {/* Error detail card */}
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-left text-xs font-bold text-rose-800 italic leading-relaxed">
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
