import React, { useState, useMemo, useEffect } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface ListingCreateProps {
  setCurrentPage: (page: PageType) => void;
  roomId?: number | null;
  setSelectedRoomId?: (id: number | null) => void;
}

type PropertyType = 'Phòng trọ' | 'Studio' | 'Căn hộ mini' | 'Căn hộ';

const AMENITIES_LIST = [
  { id: 'wifi', label: 'Wifi', icon: 'wifi' },
  { id: 'ac', label: 'Máy lạnh', icon: 'ac_unit' },
  { id: 'mezzanine', label: 'Gác lửng', icon: 'layers' },
  { id: 'private_wc', label: 'WC riêng', icon: 'wc' },
  { id: 'private_kitchen', label: 'Bếp riêng', icon: 'kitchen' },
  { id: 'washing_machine', label: 'Máy giặt', icon: 'local_laundry_service' },
  { id: 'parking', label: 'Chỗ để xe', icon: 'local_parking' },
  { id: 'camera', label: 'Camera an ninh', icon: 'videocam' },
  { id: 'balcony', label: 'Ban công', icon: 'balcony' },
  { id: 'basic_furniture', label: 'Nội thất cơ bản', icon: 'chair' },
  { id: 'full_furniture', label: 'Full nội thất', icon: 'living' },
  { id: 'closet', label: 'Tủ quần áo', icon: 'wardrobe' },
  { id: 'desk', label: 'Bàn học', icon: 'desk' },
  { id: 'free_hours', label: 'Giờ giấc tự do', icon: 'schedule' },
  { id: 'elevator', label: 'Thang máy', icon: 'elevator' },
  { id: 'security', label: 'Bảo vệ', icon: 'security' },
  { id: 'pets', label: 'Cho nuôi thú cưng', icon: 'pets' },
];

const QUICK_RULES = [
  'Không hút thuốc trong phòng',
  'Không nuôi thú cưng nếu chưa được phép',
  'Không gây ồn sau 22h',
  'Giữ vệ sinh chung',
  'Không tự ý sửa chữa phòng/căn',
  'Không tổ chức tiệc lớn',
  'Tuân thủ quy định gửi xe',
];

const ListingCreate: React.FC<ListingCreateProps> = ({ setCurrentPage, roomId, setSelectedRoomId }) => {
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form Fields
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rentPrice, setRentPrice] = useState<number>(2500000);
  const [deposit, setDeposit] = useState<number>(2500000);
  const [availabilityStatus, setAvailabilityStatus] = useState<'Còn trống' | 'Sắp trống' | 'Đang thuê'>('Còn trống');
  const [minRentTerm, setMinRentTerm] = useState('Tối thiểu 6 tháng');

  // Specs
  const [independentArea, setIndependentArea] = useState<number>(25);
  const [independentMaxPeople, setIndependentMaxPeople] = useState<number>(2);

  // Address
  const [district, setDistrict] = useState('Quận Ngũ Hành Sơn');
  const [ward] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [hideExactAddress] = useState(false);

  // Amenities & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  // Images
  const [imgUrls, setImgUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  ]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Fetch properties and initial listing details if in Edit Mode
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load properties list
        const propsRes = await api.get('/owner/properties');
        setProperties(propsRes.data);

        if (roomId) {
          // Fetch unit detail
          const unitRes = await api.get(`/owner/units/${roomId}`);
          const unit = unitRes.data;

          if (unit && unit.listing) {
            setIsEditMode(true);
          } else {
            setIsEditMode(false);
          }

          // Find property matching unit's buildingId
          const prop = propsRes.data.find((p: any) => p.id === unit.buildingId);
          if (prop) {
            setSelectedPropertyId(prop.id);
            // Fetch rooms for this property
            const roomsRes = await api.get(`/owner/properties/${prop.id}`);
            setRooms(roomsRes.data.rooms || []);
            setSelectedUnitId(roomId.toString());
            setDistrict(prop.district || 'Quận Ngũ Hành Sơn');
            setDetailAddress(prop.address.replace(`, ${prop.district}, Đà Nẵng`, ''));
          }

          // Populate listing fields
          setTitle(unit.listing?.title || `Phòng ${unit.roomNumber} tiện ích tại ${unit.buildingName}`);
          setDescription(unit.description || '');
          setRentPrice(unit.listing?.price || unit.price || 2500000);
          setDeposit(unit.listing?.price || unit.price || 2500000);
          setAvailabilityStatus(unit.status === 'Đang thuê' ? 'Đang thuê' : 'Còn trống');
          setIndependentArea(unit.area || 25);
          setIndependentMaxPeople(unit.maxCapacity || 2);

          if (unit.isFurnished) {
            setSelectedAmenities(['wifi', 'ac', 'basic_furniture', 'parking']);
          }

          if (unit.imageUrls && unit.imageUrls.length > 0) {
            setImgUrls(unit.imageUrls);
          } else {
            setImgUrls(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khởi tạo tin đăng:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [roomId]);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const selectedUnit = useMemo(() => {
    if (!selectedPropertyId) return null;
    return rooms.find(r => r.id.toString() === selectedUnitId.toString()) || null;
  }, [rooms, selectedPropertyId, selectedUnitId]);

  // Handle Property dropdown change
  const handlePropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedPropertyId(id);
    setSelectedUnitId('');
    setRooms([]);
    if (id) {
      try {
        const res = await api.get(`/owner/properties/${id}`);
        setRooms(res.data.rooms || []);
        
        const prop = properties.find(p => p.id === id);
        if (prop) {
          setDistrict(prop.district || 'Quận Ngũ Hành Sơn');
          setDetailAddress(prop.address.replace(`, ${prop.district}, Đà Nẵng`, ''));
        }
      } catch (err) {
        console.error('Không thể tải sơ đồ phòng của tòa nhà:', err);
      }
    }
  };

  // Handle Unit dropdown change and autofill
  const handleUnitChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uid = e.target.value;
    setSelectedUnitId(uid);
    if (selectedPropertyId && uid) {
      const prop = properties.find(p => p.id === selectedPropertyId);
      const room = rooms.find(r => r.id.toString() === uid.toString());
      if (prop && room) {
        setTitle(`Phòng ${room.roomNumber} tiện ích tại ${prop.name}`);
        setDescription(`Phòng khép kín sạch sẽ, an ninh tốt tại tòa nhà ${prop.name}, khu vực an ninh tốt, tiện nghi đầy đủ, thích hợp học sinh, sinh viên và người đi làm.`);
        setRentPrice(room.basePrice || 2500000);
        setDeposit(room.basePrice || 2500000);
        setIndependentArea(room.surfaceArea || 25);
        setIndependentMaxPeople(room.maxCapacity || 2);

        try {
          const unitRes = await api.get(`/owner/units/${uid}`);
          const unit = unitRes.data;
          if (unit) {
            if (unit.imageUrls && unit.imageUrls.length > 0) {
              setImgUrls(unit.imageUrls);
            } else {
              setImgUrls(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']);
            }
          }
        } catch (err) {
          console.error('Không thể lấy chi tiết phòng:', err);
        }
      }
    }
  };

  // Image Gallery Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/owner/properties/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data && res.data.url) {
          uploadedUrls.push(res.data.url);
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setImgUrls(prev => {
        if (prev.length === 1 && prev[0].includes('unsplash.com')) {
          return uploadedUrls;
        }
        return [...prev, ...uploadedUrls];
      });
    } catch (err) {
      console.error(err);
      showAlert('Tải ảnh thất bại', 'Có lỗi xảy ra khi tải ảnh của bạn lên hệ thống Cloudinary. Vui lòng thử lại.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imgUrls.length <= 1) {
      showAlert('Không thể xóa ảnh', 'Tin cho thuê nên có ít nhất 1 ảnh thực tế để đảm bảo chất lượng tin đăng.', 'warning');
      return;
    }
    setImgUrls(prev => prev.filter((_, i) => i !== index));
    if (coverImageIndex === index) {
      setCoverImageIndex(0);
    } else if (coverImageIndex > index) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleRule = (rule: string) => {
    setSelectedRules(prev =>
      prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]
    );
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errs: { [key: string]: string } = {};

    if (step === 1) {
      if (!selectedPropertyId) errs.property = 'Vui lòng chọn tài sản liên kết.';
      if (!selectedUnitId) errs.unit = 'Vui lòng chọn số phòng cụ thể.';
    } else if (step === 2) {
      if (!title.trim()) errs.title = 'Tiêu đề tin đăng không được để trống.';
      if (!description.trim()) errs.description = 'Mô tả chi tiết không được để trống.';
      if (rentPrice <= 0) errs.rentPrice = 'Đơn giá thuê phải lớn hơn 0.';
      if (independentArea <= 0) errs.area = 'Diện tích phòng phải lớn hơn 0.';
    } else if (step === 3) {
      if (imgUrls.length === 0) errs.images = 'Cung cấp ít nhất 1 ảnh đại diện.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  // Submit form to backend API
  const handleSubmitListing = async (status: 'Draft' | 'Active') => {
    if (!selectedUnitId) {
      showAlert('Lỗi yêu cầu', 'Vui lòng chọn phòng trọ muốn đăng tin.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(status === 'Draft' ? 'Đang lưu bản nháp...' : 'Đang đăng tin công khai...');

    try {
      const isPublished = status === 'Active';

      // Reorder images so that the cover image is at index 0 (primary image)
      const reorderedImages = [...imgUrls];
      if (reorderedImages.length > 0 && coverImageIndex > 0 && coverImageIndex < reorderedImages.length) {
        const coverImg = reorderedImages[coverImageIndex];
        reorderedImages.splice(coverImageIndex, 1);
        reorderedImages.unshift(coverImg);
      }

      await api.put(`/owner/listings/${selectedUnitId}`, {
        title,
        description,
        price: rentPrice,
        area: independentArea,
        capacity: independentMaxPeople,
        isPublished,
        imageUrls: reorderedImages
      });

      showAlert(
        status === 'Draft' ? 'Lưu nháp thành công' : 'Đăng tin thành công',
        status === 'Draft' 
          ? 'Tin trọ của bạn đã được lưu nháp thành công!' 
          : 'Tin cho thuê của bạn đã được công bố thành công trên RoomHub!',
        'success',
        () => {
          if (setSelectedRoomId) {
            setSelectedRoomId(null);
          }
          setCurrentPage('owner-listings');
        }
      );
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tin đăng. Vui lòng thử lại.';
      showAlert('Lỗi thao tác', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayAddressPreview = useMemo(() => {
    const detail = hideExactAddress ? '' : (detailAddress ? `${detailAddress}, ` : '');
    const w = ward ? `${ward}, ` : '';
    return `${detail}${w}${district}, Đà Nẵng`;
  }, [detailAddress, ward, district, hideExactAddress]);

  const activePropertyType = useMemo<PropertyType>(() => {
    if (selectedProperty) {
      return selectedProperty.type;
    }
    return 'Phòng trọ';
  }, [selectedProperty]);

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
        <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu phòng trọ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative animate-fadeIn">
      
      {/* Breadcrumb Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer" onClick={() => {
            if (setSelectedRoomId) setSelectedRoomId(null);
            setCurrentPage('owner-listings');
          }}>Tin cho thuê</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">{isEditMode ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}</span>
        </div>
        <button 
          onClick={() => {
            if (setSelectedRoomId) setSelectedRoomId(null);
            setCurrentPage('owner-listings');
          }}
          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">list</span> Quay lại danh sách tin
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center min-w-[550px] px-4">
          {[
            { step: 1, label: 'Chọn phòng trọ' },
            { step: 2, label: 'Nội dung tin đăng' },
            { step: 3, label: 'Tiện ích & Ảnh' },
            { step: 4, label: 'Xem trước & Đăng' }
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                activeStep === s.step
                  ? 'bg-primary-container border-primary-container text-white shadow-sm ring-4 ring-orange-100'
                  : activeStep > s.step
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                {activeStep > s.step ? (
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                ) : s.step}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${
                activeStep === s.step
                  ? 'text-primary-container'
                  : activeStep > s.step
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {s.step < 4 && (
                <div className={`w-12 md:w-24 h-0.5 ml-2 border-t-2 border-dashed ${
                  activeStep > s.step ? 'border-green-500' : 'border-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form Steps (65%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: CHỌN PHÒNG */}
          {activeStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-5 animate-scaleUp">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                  1. Chọn phòng trọ muốn đăng tin cho thuê
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Tin đăng bắt buộc liên kết với một phòng trống trong sơ đồ tài sản của bạn.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                <div className="space-y-1">
                  <label className="uppercase">Chọn tòa nhà / tài sản <span className="text-red-500">*</span></label>
                  <select 
                    value={selectedPropertyId || ''}
                    onChange={handlePropertyChange}
                    disabled={isEditMode}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-700 ${
                      isEditMode ? 'bg-gray-150 text-gray-400 cursor-not-allowed' : (errors.property ? 'border-red-500 bg-red-55/10' : 'border-gray-200 focus:border-primary-container bg-gray-50/50')
                    }`}
                  >
                    <option value="">-- Chọn tài sản --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type} · {p.district})</option>
                    ))}
                  </select>
                  {errors.property && <p className="text-[10px] text-red-550 font-semibold mt-1">{errors.property}</p>}
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Chọn số phòng trống <span className="text-red-500">*</span></label>
                  <select 
                    value={selectedUnitId}
                    onChange={handleUnitChange}
                    disabled={!selectedPropertyId || isEditMode}
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-700 ${
                      (!selectedPropertyId || isEditMode) ? 'bg-gray-150 text-gray-400 cursor-not-allowed' : (errors.unit ? 'border-red-500 bg-red-55/10' : 'border-gray-200 focus:border-primary-container bg-gray-50/50')
                    }`}
                  >
                    <option value="">-- Chọn số phòng --</option>
                    {selectedPropertyId && rooms.map(u => (
                      <option key={u.id} value={u.id}>Phòng {u.roomNumber} ({u.status})</option>
                    ))}
                  </select>
                  {errors.unit && <p className="text-[10px] text-red-550 font-semibold mt-1">{errors.unit}</p>}
                </div>
              </div>

              {selectedUnit && selectedUnit.status === 'Đang thuê' && (
                <div className="bg-yellow-50 border border-yellow-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-yellow-800 animate-scaleUp">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-yellow-600">warning</span>
                  <p className="text-[10px] leading-relaxed font-semibold">
                    <span className="font-black uppercase block mb-0.5">Phòng trọ này hiện đang có người thuê!</span>
                    Hệ thống đề xuất bạn chỉ nên đăng tin cho các phòng trống hoặc sắp trống để hạn chế lượt liên hệ ảo.
                  </p>
                </div>
              )}

              {selectedProperty && selectedUnitId && (
                <div className="bg-orange-50/30 border border-orange-100/50 p-4 rounded-2xl space-y-2 animate-scaleUp">
                  <h4 className="text-[11px] font-black text-primary-container uppercase border-b border-orange-100/30 pb-2">Thông tin phòng đã đồng bộ</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs font-semibold text-gray-600">
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">Loại hình:</span>
                      <span className="text-on-surface font-bold">{selectedProperty.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">Diện tích sàn:</span>
                      <span className="text-on-surface font-bold">{independentArea} m²</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">Giá thuê niêm yết:</span>
                      <span className="text-primary-container font-black">{rentPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">Khu vực:</span>
                      <span className="text-on-surface font-bold">{selectedProperty.district}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: NỘI DUNG TIN ĐĂNG */}
          {activeStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                  2. Cài đặt chi tiết nội dung tin đăng
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Cung cấp tiêu đề thu hút và mô tả các chi phí tiện ích cho người thuê.</p>
              </div>

              <div className="space-y-4 text-xs font-bold text-gray-500">
                {/* Title */}
                <div className="space-y-1">
                  <label className="uppercase">Tiêu đề tin đăng công khai <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Phòng trọ khép kín sạch đẹp có gác gần FPT University..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                      errors.title ? 'border-red-500 bg-red-55/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                    }`}
                  />
                  {errors.title && <p className="text-[10px] text-red-550 mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="uppercase">Mô tả chi tiết phòng trọ <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4}
                    placeholder="Mô tả các trang thiết bị tiện nghi, phòng có sẵn giường tủ, máy lạnh hay không, lối đi riêng, giờ giấc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                      errors.description ? 'border-red-500 bg-red-55/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                    }`}
                  />
                  {errors.description && <p className="text-[10px] text-red-550 mt-1">{errors.description}</p>}
                </div>

                {/* Price, Deposit, Area, Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase">Giá cho thuê mong muốn <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={rentPrice}
                        onChange={(e) => setRentPrice(parseInt(e.target.value, 10))}
                        className={`w-full pl-3 pr-16 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                          errors.rentPrice ? 'border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`} 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ/tháng</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Tiền đặt cọc phòng</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={deposit}
                        onChange={(e) => setDeposit(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Diện tích sử dụng (m²) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={independentArea}
                      onChange={(e) => setIndependentArea(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Số người ở tối đa</label>
                    <input 
                      type="number" 
                      value={independentMaxPeople}
                      onChange={(e) => setIndependentMaxPeople(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                    />
                  </div>
                </div>

                {/* Sẵn có & Cam kết */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                  <div className="space-y-1">
                    <label className="uppercase">Trạng thái phòng sẵn có</label>
                    <select 
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-white text-xs font-bold text-gray-700"
                    >
                      <option value="Còn trống">Còn trống (Dọn vào ngay)</option>
                      <option value="Sắp trống">Sắp trống (Kế hoạch dọn đi)</option>
                      <option value="Đang thuê">Đang thuê nhưng vẫn nhận đặt trước</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Thời hạn thuê tối thiểu</label>
                    <select 
                      value={minRentTerm}
                      onChange={(e) => setMinRentTerm(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-white text-xs font-bold text-gray-700"
                    >
                      <option value="Không yêu cầu">Không yêu cầu thời hạn</option>
                      <option value="Tối thiểu 3 tháng">Tối thiểu 3 tháng</option>
                      <option value="Tối thiểu 6 tháng">Tối thiểu 6 tháng</option>
                      <option value="Tối thiểu 1 năm">Tối thiểu 1 năm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AMENITIES, RULES & IMAGE */}
          {activeStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              
              {/* Amenities checklist */}
              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">ac_unit</span>
                    3. Chọn tiện nghi phòng trọ
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Đánh dấu những trang bị tiện ích để tăng bộ lọc tối ưu.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES_LIST.map((am) => {
                    const isSelected = selectedAmenities.includes(am.id);
                    return (
                      <div 
                        key={am.id}
                        onClick={() => toggleAmenity(am.id)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-orange-50/50 border-primary-container ring-1 ring-orange-105'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary-container' : 'text-gray-400'}`}>{am.icon}</span>
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-primary-container' : 'text-gray-600'}`}>{am.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="space-y-4 border-t border-gray-50 pt-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                    4. Nội quy chỗ ở
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-gray-650">
                  {QUICK_RULES.map((rule) => {
                    const isSelected = selectedRules.includes(rule);
                    return (
                      <div 
                        key={rule}
                        onClick={() => toggleRule(rule)}
                        className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-primary-container accent-primary-container cursor-pointer" 
                        />
                        <span>{rule}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    5. Hình ảnh phòng trọ thực tế
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Đăng ảnh phòng thực tế từ thiết bị của bạn để người thuê dễ hình dung chỗ ở.</p>
                </div>

                <div className="space-y-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <input
                    type="file"
                    id="listing-images-file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="listing-images-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-orange-200 hover:border-primary-container bg-white hover:bg-orange-50/10 p-6 rounded-2xl cursor-pointer transition-all text-center group"
                  >
                    <span className="material-symbols-outlined text-[36px] text-primary-container mb-2 group-hover:scale-110 transition-transform">
                      cloud_upload
                    </span>
                    <span className="text-xs font-black text-gray-700">Tải lên hình ảnh phòng trọ</span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-1">Hỗ trợ JPG, PNG, WEBP. Chọn nhiều ảnh cùng lúc.</span>
                  </label>

                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-primary-container">
                        <span>Đang tải ảnh lên Cloudinary...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-container h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {errors.images && <p className="text-[10px] text-red-550 font-semibold mt-1">{errors.images}</p>}
                </div>

                {imgUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {imgUrls.map((url, index) => {
                      const isCover = coverImageIndex === index;
                      return (
                        <div key={index} className={`relative rounded-xl overflow-hidden border-2 group shadow-sm transition-all ${
                          isCover ? 'border-primary-container ring-2 ring-orange-100' : 'border-gray-200'
                        }`}>
                          <img src={url} alt={`Listing upload ${index}`} className="w-full h-20 object-cover" />
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-primary-container text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow">Ảnh bìa</span>
                          )}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveImage(index)}
                              className="self-end w-5 h-5 rounded-full bg-red-650 text-white flex items-center justify-center cursor-pointer shadow outline-none"
                            >
                              <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                            </button>
                            {!isCover && (
                              <button 
                                type="button" 
                                onClick={() => setCoverImageIndex(index)}
                                className="w-full py-1 bg-white hover:bg-gray-50 text-gray-700 text-[8px] font-black uppercase rounded text-center cursor-pointer outline-none"
                              >
                                Đặt làm ảnh bìa
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & SUBMIT */}
          {activeStep === 4 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  4. Xác nhận đăng tin cho thuê
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Đảm bảo các số liệu đơn giá, cọc và địa bàn hiển thị chính xác trước khi gửi.</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 space-y-4 text-xs font-semibold text-gray-600">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Tòa nhà liên kết:</span>
                    <span className="text-on-surface font-bold">{selectedProperty?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Phòng trọ liên kết:</span>
                    <span className="text-on-surface font-bold">Phòng {selectedUnit?.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Đơn giá thuê:</span>
                    <span className="text-primary-container font-black">{rentPrice.toLocaleString('vi-VN')}đ/tháng</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Diện tích sử dụng:</span>
                    <span className="text-gray-700 font-bold">{independentArea} m²</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Sức chứa tối đa:</span>
                    <span className="text-gray-700 font-bold">{independentMaxPeople} người lớn</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Địa chỉ hiển thị:</span>
                    <span className="text-gray-700 font-bold leading-normal truncate block">{displayAddressPreview}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200/50 pt-3">
                  <span className="text-gray-400 text-[10px] block uppercase mb-1">Mục tiện ích đã chọn ({selectedAmenities.length}):</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAmenities.length > 0 ? selectedAmenities.map((a) => {
                      const amInfo = AMENITIES_LIST.find(item => item.id === a);
                      return (
                        <span key={a} className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[9px] font-bold">
                          {amInfo?.label || a}
                        </span>
                      );
                    }) : <span className="text-gray-400 italic">Chưa chọn tiện ích nào</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-gray-150 soft-shadow flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={activeStep === 1}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStep === 1
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95'
              }`}
            >
              Quay lại
            </button>

            <div className="flex gap-2">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Tiếp tục
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmitListing('Draft')}
                    className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Lưu bản nháp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitListing('Active')}
                    className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">send</span>
                    Đăng tin ngay
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Preview Card (35%) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow space-y-4">
            <div className="border-b border-gray-50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Xem trước tin đăng</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-40 relative bg-gray-100">
                {imgUrls.length > 0 ? (
                  <img 
                    src={imgUrls[coverImageIndex] || imgUrls[0]} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <span className="material-symbols-outlined text-[36px]">image</span>
                    <span className="text-[9px] font-bold">Chưa tải ảnh lên</span>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                  <span className="px-2 py-0.5 bg-white/90 text-primary-container text-[8px] font-black uppercase rounded shadow-sm">
                    {activePropertyType}
                  </span>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase rounded shadow-sm">
                    {availabilityStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 text-left">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px]">
                  {title.trim() || <span className="text-gray-300 italic">Tiêu đề hiển thị tại đây...</span>}
                </h4>
                
                <p className="text-[13px] font-black text-primary-container">
                  {rentPrice.toLocaleString('vi-VN')}đ/tháng
                </p>

                <div className="flex items-center gap-1 text-[10px] text-gray-505 font-semibold truncate">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                  <span className="truncate">{displayAddressPreview}</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-2">
                  <span>Sàn: {independentArea} m²</span>
                  <span>·</span>
                  <span>Max: {independentMaxPeople} người</span>
                </div>

                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedAmenities.slice(0, 3).map((amId) => {
                      const am = AMENITIES_LIST.find(a => a.id === amId);
                      return (
                        <span key={amId} className="px-2 py-0.5 bg-orange-50 text-primary-container rounded text-[8px] font-bold border border-orange-100 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">{am?.icon}</span>
                          {am?.label}
                        </span>
                      );
                    })}
                    {selectedAmenities.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-55 text-gray-400 text-[8px] font-black rounded border border-gray-100">
                        +{selectedAmenities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[9px] text-gray-400 font-semibold leading-relaxed text-center">
              * Giao diện xem trước tin đăng của bạn hiển thị công khai trên ứng dụng RoomHub.
            </p>
          </div>

        </div>

      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[3100] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col items-center justify-center space-y-3 max-w-sm">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
            <div>
              <p className="text-xs font-black text-on-surface">{submitMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col space-y-4 animate-scaleUp max-w-sm w-full border border-gray-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce ${
              alertConfig.type === 'success' ? 'bg-green-50 text-green-600' :
              alertConfig.type === 'error' ? 'bg-red-50 text-red-600 animate-shake' :
              alertConfig.type === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <span className="material-symbols-outlined text-[28px]">
                {alertConfig.type === 'success' ? 'check_circle' :
                 alertConfig.type === 'error' ? 'error' :
                 alertConfig.type === 'warning' ? 'warning' : 'info'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">{alertConfig.title}</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1 leading-relaxed">
                {alertConfig.message}
              </p>
            </div>
            <div className="pt-1">
              <button 
                onClick={() => {
                  setAlertConfig(prev => ({ ...prev, isOpen: false }));
                  if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
                className="w-full py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListingCreate;
