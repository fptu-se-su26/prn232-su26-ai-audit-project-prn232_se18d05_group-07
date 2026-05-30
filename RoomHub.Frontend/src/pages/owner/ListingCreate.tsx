import React, { useState, useMemo } from 'react';
import type { PageType } from '../../App';
import { MOCK_PROPERTIES } from './PropertyList';

interface ListingCreateProps {
  setCurrentPage: (page: PageType) => void;
}

type SourceType = 'existing' | 'independent';
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

const MOCK_UNITS_MAP: { [propertyId: number]: { id: string; status: 'Còn trống' | 'Đang thuê' | 'Bảo trì'; isRented: boolean }[] } = {
  1: [
    { id: '101', status: 'Đang thuê', isRented: true },
    { id: '102', status: 'Đang thuê', isRented: true },
    { id: '103', status: 'Còn trống', isRented: false },
    { id: '201', status: 'Đang thuê', isRented: true },
    { id: '202', status: 'Còn trống', isRented: false },
    { id: '301', status: 'Đang thuê', isRented: true },
    { id: '304', status: 'Còn trống', isRented: false },
    { id: '401', status: 'Còn trống', isRented: false },
    { id: '405', status: 'Còn trống', isRented: false },
  ],
  2: [
    { id: 'P-101', status: 'Còn trống', isRented: false },
    { id: 'P-102', status: 'Đang thuê', isRented: true },
    { id: 'P-103', status: 'Còn trống', isRented: false },
  ],
  3: [
    { id: 'A-01', status: 'Còn trống', isRented: false },
    { id: 'A-02', status: 'Còn trống', isRented: false },
  ]
};

const ListingCreate: React.FC<ListingCreateProps> = ({ setCurrentPage }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  // STEP 1: SOURCE SELECTION
  const [sourceType, setSourceType] = useState<SourceType>('existing');

  // STEP 2: SOURCE DETAILS & PROPERTIES
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Independent Listing Inputs
  const [independentType, setIndependentType] = useState<PropertyType>('Căn hộ');
  const [independentName, setIndependentName] = useState('');
  const [independentArea, setIndependentArea] = useState<number>(30);
  const [independentMaxPeople, setIndependentMaxPeople] = useState<number>(2);
  const [independentBedrooms, setIndependentBedrooms] = useState<number>(1);
  const [independentWCs, setIndependentWCs] = useState<number>(1);

  // STEP 3: LISTING DETAILS
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [rentPrice, setRentPrice] = useState<number>(2500000);
  const [deposit, setDeposit] = useState<number>(2500000);
  const [availabilityStatus, setAvailabilityStatus] = useState<'Còn trống' | 'Sắp trống' | 'Đang thuê'>('Còn trống');
  const [availableDate, setAvailableDate] = useState('2026-05-30');
  const [minRentTerm, setMinRentTerm] = useState('Tối thiểu 6 tháng');

  // Address
  const [ward, setWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [district, setDistrict] = useState('Quận Ngũ Hành Sơn');
  const [hideExactAddress, setHideExactAddress] = useState(false);

  // STEP 4: AMENITIES & RULES & IMAGES
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState('');

  // Images
  const [imgUrls, setImgUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImgUrl, setNewImgUrl] = useState('');
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);

  // Contact
  const [contactName, setContactName] = useState('Phan Hoài An');
  const [contactPhone, setContactPhone] = useState('0905 555 666');
  const [contactEmail, setContactEmail] = useState('owner@roomhub.vn');
  const [allowChat, setAllowChat] = useState(true);
  const [hidePhoneNoLogin, setHidePhoneNoLogin] = useState(true);
  const [allowRequests, setAllowRequests] = useState(true);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Loading Simulation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('Đang lưu thông tin tin đăng...');

  // Auto-filled info card helper
  const selectedProperty = useMemo(() => {
    return MOCK_PROPERTIES.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId]);

  const selectedUnit = useMemo(() => {
    if (!selectedPropertyId) return null;
    const units = MOCK_UNITS_MAP[selectedPropertyId] || [];
    return units.find(u => u.id === selectedUnitId) || null;
  }, [selectedPropertyId, selectedUnitId]);

  // Effect to automatically fill listing values when Property/Unit is chosen
  const handleAutoFill = (propId: number, unitId: string) => {
    const prop = MOCK_PROPERTIES.find(p => p.id === propId);
    if (prop) {
      setDistrict(prop.district);
      setRentPrice(prop.basePrice);
      setDeposit(prop.basePrice);
      setDetailAddress(prop.address.replace(`, ${prop.district}, Đà Nẵng`, ''));
      // Pre-populate title
      setTitle(`Phòng ${unitId} cao cấp tòa ${prop.name} ${prop.district}`);
      setDescription(`Phòng khép kín sạch sẽ tại ${prop.name}, khu vực an ninh tốt, gần các trường đại học tiện nghi đầy đủ, thích hợp cho học sinh sinh viên văn phòng.`);
    }
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedPropertyId(id);
    setSelectedUnitId('');
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uid = e.target.value;
    setSelectedUnitId(uid);
    if (selectedPropertyId && uid) {
      handleAutoFill(selectedPropertyId, uid);
    }
  };

  // Highlights Tag Adding
  const handleAddHighlight = () => {
    if (highlightText.trim() && !highlights.includes(highlightText.trim())) {
      setHighlights(prev => [...prev, highlightText.trim()]);
      setHighlightText('');
    }
  };

  const handleRemoveHighlight = (tag: string) => {
    setHighlights(prev => prev.filter(t => t !== tag));
  };

  // Image Adding
  const handleAddImage = () => {
    if (newImgUrl.trim()) {
      setImgUrls(prev => [...prev, newImgUrl.trim()]);
      setNewImgUrl('');
    } else {
      alert('Vui lòng nhập URL ảnh trước khi thêm.');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imgUrls.length <= 1) {
      alert('Tin cho thuê nên giữ lại ít nhất 1 ảnh đại diện.');
      return;
    }
    setImgUrls(prev => prev.filter((_, i) => i !== index));
    if (coverImageIndex === index) {
      setCoverImageIndex(0);
    } else if (coverImageIndex > index) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  // Checkbox amenities toggle
  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Checkbox rules toggle
  const toggleRule = (rule: string) => {
    setSelectedRules(prev =>
      prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]
    );
  };

  // Stepper Validation
  const validateStep = (step: number): boolean => {
    const errs: { [key: string]: string } = {};

    if (step === 1) {
      // Source selection always valid since it defaults to existing
    }
    else if (step === 2) {
      if (sourceType === 'existing') {
        if (!selectedPropertyId) errs.property = 'Vui lòng chọn tài sản trong hệ thống.';
        if (!selectedUnitId) errs.unit = 'Vui lòng chọn cụ thể số phòng/căn.';
      } else {
        if (!independentName.trim()) errs.independentName = 'Vui lòng nhập tên/tiêu đề chỗ ở độc lập.';
        if (independentArea <= 0) errs.independentArea = 'Diện tích phải lớn hơn 0m².';
      }
    }
    else if (step === 3) {
      if (!title.trim()) errs.title = 'Tiêu đề tin đăng không được bỏ trống.';
      if (!description.trim()) errs.description = 'Mô tả bài đăng không được bỏ trống.';
      if (rentPrice < 0) errs.rentPrice = 'Đơn giá thuê không được phép âm.';
      if (!detailAddress.trim()) errs.detailAddress = 'Địa chỉ chi tiết không được bỏ trống.';
    }
    else if (step === 4) {
      if (imgUrls.length === 0) errs.images = 'Vui lòng cung cấp ít nhất 1 ảnh đại diện cho tin đăng.';
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

  // Form Submission
  const handleSubmitListing = (status: 'Draft' | 'Active') => {
    if (!validateStep(2) || !validateStep(3) || !validateStep(4)) {
      alert('Vui lòng kiểm tra lại biểu mẫu nhập liệu. Có một số thông tin chưa hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(status === 'Draft' ? 'Đang đóng gói dữ liệu nháp...' : 'Đang tải tệp tin và đồng bộ hóa sàn giao dịch...');

    setTimeout(() => {
      setIsSubmitting(false);
      alert(status === 'Draft' ? 'Đã lưu nháp tin cho thuê thành công!' : 'Tin cho thuê của bạn đã được đăng thành công và sẵn sàng đón khách!');
      setCurrentPage('owner-listings');
    }, 1500);
  };

  // Computed display address for Preview
  const displayAddressPreview = useMemo(() => {
    const detail = hideExactAddress ? '' : (detailAddress ? `${detailAddress}, ` : '');
    const w = ward ? `${ward}, ` : '';
    return `${detail}${w}${district}, Đà Nẵng`;
  }, [detailAddress, ward, district, hideExactAddress]);

  const activePropertyType = useMemo<PropertyType>(() => {
    if (sourceType === 'existing' && selectedProperty) {
      return selectedProperty.type;
    }
    return independentType;
  }, [sourceType, selectedProperty, independentType]);

  const activeArea = useMemo<number>(() => {
    if (sourceType === 'existing' && selectedProperty) {
      return 25; // default property size
    }
    return independentArea;
  }, [sourceType, selectedProperty, independentArea]);

  const activeMaxPeople = useMemo<number>(() => {
    if (sourceType === 'existing') {
      return 2;
    }
    return independentMaxPeople;
  }, [sourceType, independentMaxPeople]);

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* Breadcrumb Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-listings')}>Tin cho thuê</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-gray-800 font-bold">Đăng tin mới</span>
        </div>
        <button 
          onClick={() => setCurrentPage('owner-listings')}
          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">list</span> Quay lại danh sách tin
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center min-w-[650px] px-4">
          {[
            { step: 1, label: 'Nguồn tin' },
            { step: 2, label: 'Thông tin chỗ ở' },
            { step: 3, label: 'Giá & Chi tiết' },
            { step: 4, label: 'Tiện ích & Nội quy' },
            { step: 5, label: 'Xem trước' },
            { step: 6, label: 'Hoàn tất' }
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
              {s.step < 6 && (
                <div className={`w-8 md:w-16 h-0.5 ml-2 border-t-2 border-dashed ${
                  activeStep > s.step ? 'border-green-500' : 'border-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form Steps Inputs (65%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: SOURCE SELECTION */}
          {activeStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">database</span>
                  1. Bạn muốn đăng tin từ nguồn nào?
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Chọn nguồn dữ liệu phù hợp để RoomHub tự động điền các thông số cơ bản.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Existing */}
                <div 
                  onClick={() => setSourceType('existing')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover-lift ${
                    sourceType === 'existing'
                      ? 'bg-orange-50/50 border-primary-container ring-2 ring-orange-100'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-primary-container text-[28px] bg-orange-100/50 p-2.5 rounded-xl">corporate_fare</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-primary-container text-[8px] font-black uppercase rounded">Khuyến nghị</span>
                  </div>
                  <h4 className="text-xs font-black text-on-surface mb-1 flex items-center gap-1">
                    Chọn phòng/căn đã có trong hệ thống
                    {sourceType === 'existing' && <span className="material-symbols-outlined text-primary-container text-[18px] font-bold">check_circle</span>}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    Phù hợp khi bạn đã khai báo tài sản và sinh sơ đồ phòng trên RoomHub. Hệ thống tự động lấy địa chỉ, loại hình, diện tích và đơn giá mặc định.
                  </p>
                </div>

                {/* Option 2: Independent */}
                <div 
                  onClick={() => setSourceType('independent')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover-lift ${
                    sourceType === 'independent'
                      ? 'bg-orange-50/50 border-primary-container ring-2 ring-orange-100'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-gray-400 text-[28px] bg-gray-50 p-2.5 rounded-xl">home</span>
                  </div>
                  <h4 className="text-xs font-black text-on-surface mb-1 flex items-center gap-1">
                    Đăng tin độc lập mới
                    {sourceType === 'independent' && <span className="material-symbols-outlined text-primary-container text-[18px] font-bold">check_circle</span>}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    Phù hợp khi bạn muốn đăng nhanh một phòng trọ lẻ, một căn hộ độc lập bên ngoài hoặc chỗ ở chưa cần đưa vào hệ thống sơ đồ lưới tầng quản lý.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS BASED ON SOURCE */}
          {activeStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              
              {/* Existing Flow Form */}
              {sourceType === 'existing' ? (
                <div className="space-y-5">
                  <div className="border-b border-gray-50 pb-3">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                      2. Chọn phòng/căn từ sơ đồ có sẵn
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold mt-1">Liên kết tin đăng tới phòng trống đang mở trên hệ thống quản lý của bạn.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                    <div className="space-y-1">
                      <label className="uppercase">Chọn tòa nhà / tài sản <span className="text-red-500">*</span></label>
                      <select 
                        value={selectedPropertyId || ''}
                        onChange={handlePropertyChange}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-700 ${
                          errors.property ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-container bg-gray-50/50'
                        }`}
                      >
                        <option value="">-- Chọn tài sản --</option>
                        {MOCK_PROPERTIES.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.type} · {p.district})</option>
                        ))}
                      </select>
                      {errors.property && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.property}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Chọn phòng trọ trống <span className="text-red-500">*</span></label>
                      <select 
                        value={selectedUnitId}
                        onChange={handleUnitChange}
                        disabled={!selectedPropertyId}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none bg-white text-xs font-bold text-gray-700 ${
                          !selectedPropertyId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : (errors.unit ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-primary-container bg-gray-50/50')
                        }`}
                      >
                        <option value="">-- Chọn số phòng --</option>
                        {selectedPropertyId && (MOCK_UNITS_MAP[selectedPropertyId] || []).map(u => (
                          <option key={u.id} value={u.id}>Phòng {u.id} — Trạng thái: {u.status}</option>
                        ))}
                      </select>
                      {errors.unit && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.unit}</p>}
                    </div>
                  </div>

                  {/* Warning if selecting rented room */}
                  {selectedUnit && selectedUnit.isRented && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-yellow-800 animate-scaleUp">
                      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-yellow-600">warning</span>
                      <p className="text-[10px] leading-relaxed font-semibold">
                        <span className="font-black uppercase block mb-0.5">Phòng trọ này hiện đang có người thuê!</span>
                        Bạn vẫn có thể tạo bản đăng tin nháp để chuẩn bị sẵn, tuy nhiên hệ thống khuyến cáo không nên hiển thị công khai tin đăng khi chưa sắp trống để tránh phiền toái.
                      </p>
                    </div>
                  )}

                  {/* Info fills card */}
                  {selectedProperty && selectedUnitId && (
                    <div className="bg-orange-50/30 border border-orange-100/50 p-4 rounded-2xl space-y-3.5 animate-scaleUp">
                      <h4 className="text-[11px] font-black text-primary-container uppercase border-b border-orange-100/30 pb-2">Thông tin tự động điền từ phòng</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs font-semibold text-gray-600">
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase">Loại hình:</span>
                          <span className="text-on-surface font-bold">{selectedProperty.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase">Diện tích mặc định:</span>
                          <span className="text-on-surface font-bold">25 m²</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase">Đơn giá thuê mặc định:</span>
                          <span className="text-primary-container font-black">2.500.000đ/tháng</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase">Quận / Địa bàn:</span>
                          <span className="text-on-surface font-bold">{selectedProperty.district}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold leading-normal border-t border-orange-100/30 pt-2.5 italic">
                        💡 Lưu ý: Bạn hoàn toàn có thể tùy chỉnh đơn giá và mô tả tiêu đề ở các bước sau của tin đăng mà không làm ảnh hưởng tới thông số dữ liệu gốc của phòng trong sơ đồ.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Independent Flow Form */
                <div className="space-y-5">
                  <div className="border-b border-gray-50 pb-3">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">home</span>
                      2. Cấu hình thông tin chỗ ở độc lập
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold mt-1">Cung cấp các thông số kết cấu cơ bản cho căn nhà lẻ bên ngoài.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                    <div className="space-y-1">
                      <label className="uppercase">Loại hình căn hộ/phòng trọ</label>
                      <select 
                        value={independentType}
                        onChange={(e) => setIndependentType(e.target.value as PropertyType)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-gray-50/50 text-xs font-bold text-gray-700"
                      >
                        <option value="Phòng trọ">Phòng trọ khép kín</option>
                        <option value="Studio">Tòa căn hộ Studio</option>
                        <option value="Căn hộ mini">Căn hộ Mini cao cấp</option>
                        <option value="Căn hộ">Căn hộ độc lập gia đình</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Tên / Mã phòng độc lập <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Căn hộ 2PN view biển Mỹ Khê"
                        value={independentName}
                        onChange={(e) => setIndependentName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                          errors.independentName ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`}
                      />
                      {errors.independentName && <p className="text-[10px] text-red-500 mt-1">{errors.independentName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Diện tích sàn căn hộ</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={independentArea}
                          onChange={(e) => setIndependentArea(parseInt(e.target.value, 10))}
                          className={`w-full pl-3 pr-10 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                            errors.independentArea ? 'border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
                      </div>
                      {errors.independentArea && <p className="text-[10px] text-red-500 mt-1">{errors.independentArea}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Sức chứa tối đa (người)</label>
                      <input 
                        type="number" 
                        value={independentMaxPeople}
                        onChange={(e) => setIndependentMaxPeople(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Số lượng phòng ngủ</label>
                      <input 
                        type="number" 
                        value={independentBedrooms}
                        onChange={(e) => setIndependentBedrooms(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Số lượng WC</label>
                      <input 
                        type="number" 
                        value={independentWCs}
                        onChange={(e) => setIndependentWCs(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50/45 border border-orange-100 p-3 rounded-2xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0">info</span>
                    <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                      Lưu ý: Tin độc lập sẽ chỉ phục vụ cho việc hiển thị đăng tin quảng bá tìm khách public. Nó sẽ **không tự động sinh sơ đồ phòng grid tầng hay tích hợp các báo cáo chốt tiền tự động hóa**.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: TITLE, PRICE & ADDRESS DETAILS */}
          {activeStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                  3. Chi tiết nội dung tin đăng công khai
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Cung cấp tiêu đề thu hút, mô tả chi tiết và cài đặt giá cọc công khai.</p>
              </div>

              <div className="space-y-4 text-xs font-bold text-gray-500">
                {/* Title */}
                <div className="space-y-1">
                  <label className="uppercase">Tiêu đề tin đăng <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Phòng trọ khép kín có gác lửng cực thoáng gần FPT City"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                      errors.title ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                    }`}
                  />
                  {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Tiêu đề nên ghi rõ loại hình phòng trọ, khoảng cách tới trường Đại học FPT Đà Nẵng hoặc biển để tăng lượt click.</p>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="uppercase">Mô tả chi tiết phòng trọ <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4}
                    placeholder="Mô tả nội thất giường tủ, tiện ích giặt sấy, khu an ninh an toàn, giờ giấc ra vào..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                      errors.description ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                    }`}
                  />
                  {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description}</p>}
                </div>

                {/* Highlights Tags input */}
                <div className="space-y-2">
                  <label className="uppercase">Điểm nổi bật nổi trội (Tags)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Gần FPT, giờ tự do, có máy giặt..."
                      value={highlightText}
                      onChange={(e) => setHighlightText(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary-container bg-gray-50/50"
                    />
                    <button 
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary-container border border-orange-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Thêm Tag
                    </button>
                  </div>
                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {highlights.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-orange-50 text-primary-container rounded-lg border border-orange-100 text-[10px] font-bold flex items-center gap-1">
                          {tag}
                          <span 
                            onClick={() => handleRemoveHighlight(tag)}
                            className="material-symbols-outlined text-[12px] font-black text-orange-400 hover:text-primary-container cursor-pointer"
                          >
                            close
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prices row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {errors.rentPrice && <p className="text-[10px] text-red-500 mt-1">{errors.rentPrice}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Yêu cầu tiền cọc phòng</label>
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
                </div>

                {/* Date & Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                  <div className="space-y-1">
                    <label className="uppercase">Trạng thái phòng sẵn có</label>
                    <select 
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-white text-xs font-bold text-gray-700"
                    >
                      <option value="Còn trống">Còn trống (Dọn vào ngay)</option>
                      <option value="Sắp trống">Sắp trống (Kế hoạch bàn giao)</option>
                      <option value="Đang thuê">Đang thuê nhưng nhận đặt chỗ trước</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Ngày dọn vào dự kiến</label>
                    <input 
                      type="date" 
                      value={availableDate}
                      onChange={(e) => setAvailableDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Thời hạn thuê cam kết tối thiểu</label>
                    <select 
                      value={minRentTerm}
                      onChange={(e) => setMinRentTerm(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-white text-xs font-bold text-gray-700"
                    >
                      <option value="Không yêu cầu">Không yêu cầu thời hạn</option>
                      <option value="Tối thiểu 3 tháng">Tối thiểu 3 tháng ở trọ</option>
                      <option value="Tối thiểu 6 tháng">Tối thiểu 6 tháng cam kết</option>
                      <option value="Tối thiểu 1 năm">Tối thiểu 1 năm hợp đồng</option>
                    </select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h4 className="text-[11px] font-black text-primary-container uppercase">5. Thông tin địa bàn & địa chỉ hiển thị</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="uppercase">Tỉnh / Thành phố</label>
                      <input 
                        type="text" 
                        value="Đà Nẵng" 
                        disabled 
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 cursor-not-allowed" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Quận / Huyện Đà Nẵng</label>
                      <select 
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container bg-white text-xs font-bold text-gray-700"
                      >
                        <option value="Quận Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                        <option value="Quận Sơn Trà">Sơn Trà</option>
                        <option value="Quận Hải Châu">Hải Châu</option>
                        <option value="Quận Cẩm Lệ">Cẩm Lệ</option>
                        <option value="Quận Liên Chiểu">Liên Chiểu</option>
                        <option value="Quận Thanh Khê">Thanh Khê</option>
                        <option value="Huyện Hòa Vang">Hòa Vang</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase">Phường / Xã chi tiết</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Hòa Hải..."
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Địa chỉ nhà chi tiết <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Lô B2-15 Khu Đô Thị FPT..."
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                        errors.detailAddress ? 'border-red-500 bg-red-50/10' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`}
                    />
                    {errors.detailAddress && <p className="text-[10px] text-red-500 mt-1">{errors.detailAddress}</p>}
                  </div>

                  <div className="flex items-center gap-2 pt-1.5">
                    <input 
                      type="checkbox" 
                      id="hideAdd" 
                      checked={hideExactAddress}
                      onChange={(e) => setHideExactAddress(e.target.checked)}
                      className="w-4 h-4 text-primary-container accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="hideAdd" className="cursor-pointer select-none font-bold text-gray-600">Ẩn số nhà chi tiết trên tin đăng công cộng công khai (Bảo mật số nhà).</label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: AMENITIES, RULES & IMAGE UPLOADS */}
          {activeStep === 4 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              
              {/* Amenities Grid checkboxes */}
              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">ac_unit</span>
                    6. Chọn tiện ích có sẵn
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Đánh dấu những trang bị tiện nghi thực tế để bộ lọc khách thuê tìm nhanh hơn.</p>
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
                            ? 'bg-orange-50/50 border-primary-container ring-1 ring-orange-100'
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

              {/* Rules List */}
              <div className="space-y-4 border-t border-gray-50 pt-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                    7. Nội quy tòa nhà & phòng trọ
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Thiết lập các ràng buộc bắt buộc để đảm bảo an ninh trật tự chung.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-gray-600">
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

                <div className="space-y-1 text-xs font-bold text-gray-500 pt-1">
                  <label className="uppercase">Nội quy bổ sung khác</label>
                  <textarea 
                    rows={2}
                    placeholder="Ví dụ: Giữ vệ sinh chung tại sân để xe, cổng khóa trước 23h..."
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container font-semibold text-gray-700 bg-gray-50/50" 
                  />
                </div>
              </div>

              {/* Picture Upload simulator */}
              <div className="space-y-4 border-t border-gray-50 pt-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    8. Thêm hình ảnh bài đăng
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Tin có ảnh đầy đủ sẽ nhận được lượt xem cao hơn gấp 3 lần.</p>
                </div>

                {/* Drag and Drop Simulator Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-orange-50/10 hover:border-orange-350 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-gray-400 text-[42px] mb-1">upload_file</span>
                  <p className="text-xs font-bold text-gray-700">Kéo thả ảnh hoặc click nút bấm tải ảnh lên</p>
                  <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">Hỗ trợ định dạng PNG, JPG kích thước tối đa 5MB mỗi ảnh</p>
                </div>

                {/* URL upload input option */}
                <div className="space-y-2 text-xs font-bold text-gray-500 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <label className="uppercase">Hoặc nhúng liên kết ảnh trực tuyến</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập địa chỉ URL hình ảnh (ví dụ: https://images.unsplash.com/...)"
                      value={newImgUrl}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      className="flex-grow px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-750 focus:outline-none focus:border-primary-container bg-white"
                    />
                    <button 
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                    >
                      Thêm ảnh
                    </button>
                  </div>
                  {errors.images && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.images}</p>}
                </div>

                {/* Image Previews gallery grid */}
                {imgUrls.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Thư viện ảnh đã tải lên ({imgUrls.length} ảnh):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imgUrls.map((url, index) => {
                        const isCover = coverImageIndex === index;
                        return (
                          <div key={index} className={`relative rounded-xl overflow-hidden border-2 group shadow-sm transition-all ${
                            isCover ? 'border-primary-container ring-2 ring-orange-100' : 'border-gray-200'
                          }`}>
                            <img src={url} alt={`Listing upload ${index}`} className="w-full h-24 object-cover" />
                            {isCover && (
                              <span className="absolute top-1.5 left-1.5 bg-primary-container text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow">Ảnh bìa</span>
                            )}
                            
                            {/* Overlay hover actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <button 
                                type="button" 
                                onClick={() => handleRemoveImage(index)}
                                className="self-end w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer shadow outline-none"
                              >
                                <span className="material-symbols-outlined text-[14px] font-bold">close</span>
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
                  </div>
                )}
              </div>

              {/* Contact details */}
              <div className="space-y-4 border-t border-gray-50 pt-4">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    9. Thông tin liên hệ công khai
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-1">Thiết lập các kênh kết nối trao đổi với khách thuê tiềm năng.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-500">
                  <div className="space-y-1">
                    <label className="uppercase">Tên người liên hệ</label>
                    <input 
                      type="text" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase">Email nhận phản hồi</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white" 
                    />
                  </div>
                </div>

                {/* Option checkboxes */}
                <div className="space-y-2 text-xs font-bold text-gray-600 pt-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="optCon1" 
                      checked={allowChat}
                      onChange={(e) => setAllowChat(e.target.checked)}
                      className="w-4 h-4 text-primary-container accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="optCon1" className="cursor-pointer select-none">Cho phép người thuê nhắn tin, trao đổi trực tiếp trên RoomHub.</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="optCon2" 
                      checked={hidePhoneNoLogin}
                      onChange={(e) => setHidePhoneNoLogin(e.target.checked)}
                      className="w-4 h-4 text-primary-container accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="optCon2" className="cursor-pointer select-none">Ẩn số điện thoại, bắt buộc người thuê đăng nhập để xem thông tin liên hệ (Hạn chế spam).</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="optCon3" 
                      checked={allowRequests}
                      onChange={(e) => setAllowRequests(e.target.checked)}
                      className="w-4 h-4 text-primary-container accent-primary-container cursor-pointer" 
                    />
                    <label htmlFor="optCon3" className="cursor-pointer select-none">Cho phép gửi yêu cầu giữ chỗ / đăng ký thuê trọ trực tuyến.</label>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: DETAILED PREVIEW & CONFIRMATION */}
          {activeStep === 5 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 soft-shadow space-y-6 animate-scaleUp">
              
              <div className="border-b border-gray-50 pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  5. Kiểm tra và hoàn tất tin cho thuê
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Đảm bảo các số liệu đơn giá, cọc và địa hình hiển thị chính xác trước khi gửi.</p>
              </div>

              {/* Review summary cards */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 space-y-4 text-xs font-semibold text-gray-600">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Nguồn gốc tin đăng:</span>
                    <span className="text-on-surface font-bold">{sourceType === 'existing' ? 'Liên kết phòng có sẵn' : 'Tin trọ độc lập'}</span>
                  </div>
                  {sourceType === 'existing' && (
                    <div>
                      <span className="text-gray-400 text-[10px] block uppercase">Tòa nhà liên kết:</span>
                      <span className="text-on-surface font-bold">{selectedProperty?.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Loại hình mô hình:</span>
                    <span className="text-on-surface font-bold">{activePropertyType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Đơn giá mong muốn:</span>
                    <span className="text-primary-container font-black">{rentPrice.toLocaleString('vi-VN')}đ/tháng</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Tiền cọc giữ chân:</span>
                    <span className="text-gray-700 font-bold">{deposit.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Diện tích sử dụng:</span>
                    <span className="text-gray-700 font-bold">{activeArea} m²</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">Sức chứa tối đa:</span>
                    <span className="text-gray-700 font-bold">{activeMaxPeople} người lớn</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 text-[10px] block uppercase">Địa chỉ hiển thị công khai:</span>
                    <span className="text-gray-700 font-bold leading-normal">{displayAddressPreview}</span>
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

              {/* Academic admin check alert warning */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">gavel</span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-semibold">
                  <span className="font-black uppercase block mb-0.5 text-primary-container">Kiểm duyệt đăng tin trực tuyến</span>
                  Để đảm bảo chất lượng và giảm tin giả mạo tại Đà Nẵng, RoomHub sẽ tiến hành kiểm duyệt cơ bản thông tin liên hệ và biểu giá. Tin của bạn có thể được tạm lưu ở trạng thái **"Chờ duyệt" (Pending)** trước khi hiển thị công khai trên thanh Tìm kiếm.
                </p>
              </div>
            </div>
          )}

          {/* STEPPER NAVIGATION BUTTONS BAR */}
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
              {activeStep < 5 ? (
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
                    Lưu nháp
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

        {/* Right Column: Sticky Public Card Preview (35%) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          
          {/* Card Preview Box */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 soft-shadow space-y-4">
            <div className="border-b border-gray-50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Xem trước tin đăng public</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            {/* Public Card Simulated UI rendering */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Cover picture area */}
              <div className="h-44 relative bg-gray-100">
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

                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-primary-container text-[8px] font-black uppercase rounded shadow-sm">
                    {activePropertyType}
                  </span>
                  <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase rounded shadow-sm">
                    Còn trống
                  </span>
                </div>
              </div>

              {/* Listing Details area */}
              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px]">
                  {title.trim() || <span className="text-gray-300 italic">Tiêu đề tin trọ của bạn sẽ hiển thị tại đây</span>}
                </h4>
                
                <p className="text-[13px] font-black text-primary-container">
                  {rentPrice.toLocaleString('vi-VN')}đ/tháng
                </p>

                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold truncate">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                  <span className="truncate">{displayAddressPreview}</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-2.5">
                  <span>Diện tích: {activeArea} m²</span>
                  <span>·</span>
                  <span>Tối đa: {activeMaxPeople} người</span>
                </div>

                {/* Quick Amenities Chips previews */}
                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
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
                      <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-black rounded border border-gray-100">
                        +{selectedAmenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled
                  className="w-full py-1.5 bg-orange-50 hover:bg-orange-100 text-primary-container text-[10px] font-black uppercase rounded-lg border border-orange-100 text-center mt-3 cursor-default"
                >
                  Xem chi tiết tin
                </button>
              </div>

            </div>

            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed text-center">
              * Thẻ tin đăng mô phỏng trên sàn RoomHub công cộng Đà Nẵng, hiển thị đồng bộ kết quả tìm kiếm và bộ lọc client.
            </p>
          </div>

          {/* Sticky Quick Review warning instructions */}
          <div className="bg-gray-50 p-4.5 rounded-3xl border border-gray-200 text-xs font-semibold text-gray-500 space-y-3.5">
            <h4 className="text-[11px] font-black text-gray-700 uppercase border-b border-gray-200 pb-2">Hướng dẫn lập tin tối ưu</h4>
            <div className="space-y-2 leading-relaxed text-[10px]">
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                <p>Nên tải lên ít nhất **3 ảnh thật** của phòng trọ (ảnh bìa nên chụp góc rộng nhiều ánh sáng).</p>
              </div>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                <p>Giá thuê thỏa thuận nên sát với giá trần mặc định của tòa nhà để tăng điểm uy tín.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                <p>Địa chỉ hiển thị có thể ẩn số căn hộ cụ thể nếu bạn lo lắng vấn đề an ninh bảo mật.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* OVERLAY SPINNING POPUP MODAL */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex flex-col items-center justify-center z-[2100] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 soft-shadow flex flex-col items-center justify-center space-y-3.5 animate-scaleUp max-w-sm">
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
            <div>
              <p className="text-xs font-black text-on-surface">{submitMessage}</p>
              <p className="text-[9px] text-gray-400 font-semibold mt-0.5 leading-normal">Đang đồng bộ hóa thông số tiện ích và mã phòng trọ công cộng...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListingCreate;
