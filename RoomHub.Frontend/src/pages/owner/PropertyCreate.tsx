import React, { useState, useMemo } from 'react';
import type { PageType } from '../../App';
import api from '../../services/api';

interface PropertyCreateProps {
  setCurrentPage: (page: PageType) => void;
}

type PropertyTypeOption = 'building' | 'studio' | 'mini-apartment' | 'independent';

const DANANG_WARDS_MAP: { [district: string]: string[] } = {
  'Quận Ngũ Hành Sơn': ['Hòa Hải', 'Hòa Quý', 'Khuê Mỹ', 'Mỹ An'],
  'Quận Hải Châu': [
    'Bình Hiên', 'Bình Thuận', 'Hòa Cường Bắc', 'Hòa Cường Nam', 
    'Hòa Thuận Đông', 'Hòa Thuận Tây', 'Nam Dương', 'Phước Ninh', 
    'Thạch Thang', 'Thanh Bình', 'Thuận Phước'
  ],
  'Quận Sơn Trà': ['An Hải Bắc', 'An Hải Đông', 'An Hải Tây', 'Mân Thái', 'Nại Hiên Đông', 'Phước Mỹ', 'Thọ Quang'],
  'Quận Liên Chiểu': ['Hòa Hiệp Bắc', 'Hòa Hiệp Nam', 'Hòa Khánh Bắc', 'Hòa Khánh Nam', 'Hòa Minh'],
  'Quận Cẩm Lệ': ['Hòa An', 'Hòa Phát', 'Hòa Thọ Đông', 'Hòa Thọ Tây', 'Hòa Xuân', 'Khuê Trung'],
  'Quận Thanh Khê': ['An Khê', 'Chính Gián', 'Hòa Khê', 'Tam Thuận', 'Tân Chính', 'Thạc Gián', 'Thanh Khê Đông', 'Thanh Khê Tây', 'Vĩnh Trung'],
  'Huyện Hòa Vang': ['Hòa Bắc', 'Hòa Châu', 'Hòa Khương', 'Hòa Liên', 'Hòa Nhơn', 'Hòa Phong', 'Hòa Phú', 'Hòa Phước', 'Hòa Sơn', 'Hòa Tiến', 'Hòa Ninh']
};

const PropertyCreate: React.FC<PropertyCreateProps> = ({ setCurrentPage }) => {
  // Stepper state: 1 to 5
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form states
  const [selectedType, setSelectedType] = useState<PropertyTypeOption>('building');
  const [propertyName, setPropertyName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [status, setStatus] = useState<'Đang hoạt động' | 'Tạm ẩn' | 'Đang bảo trì'>('Đang hoạt động');
  
  // Address states
  const [district, setDistrict] = useState('Quận Ngũ Hành Sơn');
  const [ward, setWard] = useState('Hòa Hải');
  const [detailAddress, setDetailAddress] = useState('');

  // Default Rentals Config states
  const [basePrice, setBasePrice] = useState<number>(2500000);
  const [defaultArea, setDefaultArea] = useState<number>(25);
  const [maxPeople, setMaxPeople] = useState<number>(2);

  // Auto Room Generation config states
  const [numFloors, setNumFloors] = useState<number>(4);
  const [roomsCountPerFloor, setRoomsCountPerFloor] = useState<number[]>(new Array(4).fill(5));
  const [numberingRule, setNumberingRule] = useState<'standard' | 'prefix' | 'manual'>('standard');
  const [prefixText, setPrefixText] = useState('A');
  const [startNum, setStartNum] = useState<number>(1);

  // Default Utility cost states
  const [elecPrice, setElecPrice] = useState<number>(3500);
  const [waterPrice, setWaterPrice] = useState<number>(15000);
  const [waterBillingType, setWaterBillingType] = useState<'PerCubicMeter' | 'PerPerson'>('PerCubicMeter');
  const [netPrice, setNetPrice] = useState<number>(100000);
  const [garbagePrice, setGarbagePrice] = useState<number>(30000);
  const [parkingPrice, setParkingPrice] = useState<number>(50000);
  const [servicePrice, setServicePrice] = useState<number>(0);

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Custom Room Overrides states
  const [customRooms, setCustomRooms] = useState<{
    [roomId: string]: {
      price?: number;
      area?: number;
      maxPeople?: number;
    }
  }>({});
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<string | null>(null);

  const handleUpdateCustomRoom = (roomId: string, field: 'price' | 'area' | 'maxPeople', value: number | undefined) => {
    setCustomRooms(prev => {
      const roomData = prev[roomId] || {};
      const updatedRoomData = { ...roomData, [field]: value };
      
      const isDefault = updatedRoomData.price === undefined && 
                        updatedRoomData.area === undefined && 
                        updatedRoomData.maxPeople === undefined;
      
      const next = { ...prev };
      if (isDefault) {
        delete next[roomId];
      } else {
        next[roomId] = updatedRoomData;
      }
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };
  
  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('Đang chốt cấu trúc sơ đồ...');

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

  // Computed fields
  const totalRoomsToCreate = useMemo(() => {
    if (selectedType === 'independent') return 1;
    return roomsCountPerFloor.reduce((sum, count) => sum + count, 0);
  }, [selectedType, roomsCountPerFloor]);

  const fullDisplayAddress = useMemo(() => {
    const detail = detailAddress ? `${detailAddress}, ` : '';
    const w = ward ? `${ward}, ` : '';
    return `${detail}${w}${district}, Đà Nẵng`;
  }, [detailAddress, ward, district]);

  // Real-time Room Number preview generator
  const generatedPreviewRooms = useMemo(() => {
    if (selectedType === 'independent') {
      return [{ id: 'Căn hộ đơn lập', floor: 1 }];
    }
    if (numFloors <= 0 || roomsCountPerFloor.length !== numFloors) {
      return [];
    }

    const list: { id: string; floor: number }[] = [];
    // From top floor down to 1
    for (let fl = numFloors; fl >= 1; fl--) {
      const roomsOnFloor = roomsCountPerFloor[fl - 1] || 0;
      for (let r = 0; r < roomsOnFloor; r++) {
        const roomIndex = startNum + r;
        const indexStr = roomIndex < 10 ? `0${roomIndex}` : `${roomIndex}`;
        let roomId = '';

        if (numberingRule === 'standard') {
          roomId = `${fl}${indexStr}`;
        } else if (numberingRule === 'prefix') {
          roomId = `${prefixText}${fl}${indexStr}`;
        } else {
          roomId = `P-${fl}-${indexStr}`;
        }
        list.push({ id: roomId, floor: fl });
      }
    }
    return list;
  }, [selectedType, numFloors, roomsCountPerFloor, numberingRule, prefixText, startNum]);

  // Handler for synchronizing floors count with rooms per floor array
  const handleNumFloorsChange = (val: number) => {
    const safeVal = isNaN(val) || val < 0 ? 0 : val;
    setNumFloors(safeVal);
    setRoomsCountPerFloor(prev => {
      const next = [...prev];
      if (safeVal > prev.length) {
        const diff = safeVal - prev.length;
        const lastVal = prev[prev.length - 1] || 5;
        for (let i = 0; i < diff; i++) {
          next.push(lastVal);
        }
      } else if (safeVal < prev.length) {
        next.length = safeVal;
      }
      return next;
    });
  };

  // Handler for uploading thumbnail image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingImage(true);
    try {
      const res = await api.post('/owner/properties/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.url);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể tải ảnh lên.';
      showAlert('Lỗi tải ảnh', errMsg, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Validation checks per step
  const validateStep = (step: number): boolean => {
    const errs: { [key: string]: string } = {};

    if (step === 2) {
      if (!propertyName.trim()) errs.propertyName = 'Tên tài sản không được để trống.';
      if (!detailAddress.trim()) errs.detailAddress = 'Địa chỉ chi tiết không được để trống.';
      if (!ward) errs.ward = 'Vui lòng chọn Phường/Xã.';
      if (!imageUrl) errs.imageUrl = 'Vui lòng tải ảnh đại diện lên.';
    }

    if (step === 3) {
      if (basePrice < 0) errs.basePrice = 'Giá thuê mặc định không được âm.';
      if (defaultArea <= 0) errs.defaultArea = 'Diện tích mặc định phải lớn hơn 0.';
      if (maxPeople <= 0) errs.maxPeople = 'Số người tối đa mặc định phải lớn hơn 0.';
    }

    if (step === 4 && selectedType !== 'independent') {
      if (numFloors <= 0 || numFloors > 30) errs.numFloors = 'Số tầng phải từ 1 đến 30.';
      const invalidFloorIdx = roomsCountPerFloor.findIndex(count => count <= 0 || count > 50);
      if (invalidFloorIdx !== -1) {
        errs.roomsCount = `Số phòng ở tầng ${invalidFloorIdx + 1} phải từ 1 đến 50.`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setActiveStep(prev => prev - 1);
  };

  const handlePropertyTypeChange = (type: PropertyTypeOption) => {
    setSelectedType(type);
    
    // Set matching default room type
    if (type === 'building') {
      setBasePrice(2500000);
      setNumFloors(4);
      setRoomsCountPerFloor(new Array(4).fill(5));
    } else if (type === 'studio') {
      setBasePrice(5500000);
      setNumFloors(2);
      setRoomsCountPerFloor(new Array(2).fill(4));
    } else if (type === 'mini-apartment') {
      setBasePrice(6200000);
      setNumFloors(3);
      setRoomsCountPerFloor(new Array(3).fill(3));
    } else {
      setBasePrice(8500000);
      setNumFloors(1);
      setRoomsCountPerFloor([1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setActiveStep(2); // Jump back to form details to display validation errors
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('Đang khởi tạo cấu trúc tòa nhà Đà Nẵng...');
    
    api.post('/owner/properties', {
      name: propertyName,
      description: description,
      address: fullDisplayAddress,
      district: district,
      ward: ward,
      imageUrl: imageUrl,
      selectedType: selectedType,
      basePrice: basePrice,
      defaultArea: defaultArea,
      maxPeople: maxPeople,
      numFloors: numFloors,
      numRoomsPerFloor: roomsCountPerFloor[0] || 5, // fallback for legacy logic
      roomsCountPerFloor: roomsCountPerFloor,
      numberingRule: numberingRule,
      prefixText: prefixText,
      startNum: startNum,
      electricityPrice: elecPrice,
      waterPrice: waterPrice,
      waterBillingType: waterBillingType,
      internetPrice: netPrice,
      garbagePrice: garbagePrice,
      customRooms: Object.entries(customRooms).map(([roomId, data]) => ({
        roomNumber: roomId,
        floorNumber: generatedPreviewRooms.find(r => r.id === roomId)?.floor || 1,
        basePrice: data.price,
        surfaceArea: data.area,
        maxCapacity: data.maxPeople,
        waterBillingType: waterBillingType
      }))
    })
    .then(() => {
      setIsSubmitting(false);
      showAlert(
        'Tạo tài sản thành công',
        `Chúc mừng! Đã tạo thành công tài sản "${propertyName}" và tự động sinh ${totalRoomsToCreate} phòng cho thuê.`,
        'success',
        () => {
          setCurrentPage('owner-properties');
        }
      );
    })
    .catch((err) => {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài sản trọ.';
      showAlert('Lỗi tạo tài sản', errMsg, 'error');
    });
  };

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* Breadcrumb Section */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-dashboard')}>Chủ nhà</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-primary-container cursor-pointer" onClick={() => setCurrentPage('owner-properties')}>Tài sản & Phòng</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-gray-800 font-bold">Thêm tài sản mới</span>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 soft-shadow">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Thêm tài sản mới</h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">Tạo tòa nhà, khu trọ, studio, căn hộ mini hoặc căn hộ để bắt đầu quản lý cho thuê trên RoomHub.</p>
        </div>
        <button 
          onClick={() => setCurrentPage('owner-properties')}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">list</span> Quay lại danh sách
        </button>
      </div>

      {/* Stepper Horizontal Progress Bar Indicator */}
      <div className="bg-white px-6 py-5 rounded-3xl border border-gray-100 soft-shadow">
        <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto no-scrollbar py-1">
          {[
            { stepNum: 1, label: 'Loại tài sản' },
            { stepNum: 2, label: 'Thông tin' },
            { stepNum: 3, label: 'Cấu hình phòng' },
            { stepNum: 4, label: 'Xem trước sơ đồ' },
            { stepNum: 5, label: 'Biểu phí & Hoàn tất' }
          ].map((st) => {
            const isCompleted = st.stepNum < activeStep;
            const isActive = st.stepNum === activeStep;

            return (
              <React.Fragment key={st.stepNum}>
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary-container text-white'
                      : 'bg-gray-150 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    ) : (
                      st.stepNum
                    )}
                  </div>
                  <span className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-primary-container' : 'text-gray-500'
                  }`}>
                    {st.label}
                  </span>
                </div>
                {st.stepNum < 5 && (
                  <div className={`flex-grow h-[2px] min-w-[20px] max-w-[80px] mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Layout (2 Columns: Left Input forms, Right sticky dynamic preview grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Flowing Forms wizard */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 soft-shadow min-h-[480px]">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PROPERTY TYPE CARDS GRID SELECTION */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-on-surface">1. Chọn loại hình tài sản cho thuê</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Chọn loại tài sản phù hợp để RoomHub hiển thị biểu mẫu cấu hình phòng tối ưu nhất.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1 */}
                  <div 
                    onClick={() => handlePropertyTypeChange('building')}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all hover:bg-orange-50/10 ${
                      selectedType === 'building'
                        ? 'border-primary-container bg-orange-50/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedType === 'building' ? 'bg-primary-container text-white' : 'bg-orange-50 text-primary-container'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
                      </div>
                      {selectedType === 'building' && (
                        <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-on-surface mb-1 flex items-center gap-1.5">
                      Tòa nhà / khu trọ nhiều phòng
                      <span className="bg-orange-100 text-primary-container text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">MVP Core</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Phù hợp với chủ trọ sở hữu dãy phòng trọ hoặc tòa nhà nhiều tầng. Tự động sinh danh sách phòng, lưới bản đồ tầng hàng loạt.
                    </p>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => handlePropertyTypeChange('studio')}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all hover:bg-orange-50/10 ${
                      selectedType === 'studio'
                        ? 'border-primary-container bg-orange-50/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedType === 'studio' ? 'bg-primary-container text-white' : 'bg-orange-50 text-primary-container'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">apartment</span>
                      </div>
                      {selectedType === 'studio' && (
                        <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-on-surface mb-1">Tòa nhà Studio view đẹp</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Phù hợp với tòa nhà dịch vụ chuyên biệt cung cấp các phòng khép kín dạng Studio đầy đủ đồ đạc mở cho người đi làm.
                    </p>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => handlePropertyTypeChange('mini-apartment')}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all hover:bg-orange-50/10 ${
                      selectedType === 'mini-apartment'
                        ? 'border-primary-container bg-orange-50/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedType === 'mini-apartment' ? 'bg-primary-container text-white' : 'bg-orange-50 text-primary-container'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">maps_home_work</span>
                      </div>
                      {selectedType === 'mini-apartment' && (
                        <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-on-surface mb-1">Tòa nhà Căn hộ mini khép kín</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Phù hợp với các chung cư mini nhiều hộ gia đình nhỏ thuê, yêu cầu các thiết lập diện tích, số lượng WC, gác rộng rãi.
                    </p>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => handlePropertyTypeChange('independent')}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all hover:bg-orange-50/10 ${
                      selectedType === 'independent'
                        ? 'border-primary-container bg-orange-50/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedType === 'independent' ? 'bg-primary-container text-white' : 'bg-orange-50 text-primary-container'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">house</span>
                      </div>
                      {selectedType === 'independent' && (
                        <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-on-surface mb-1">Căn hộ độc lập lẻ loi</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Dành cho chủ nhà chỉ đăng ký cho thuê 1 căn hộ chung cư hoặc một phòng duy nhất, không yêu cầu thiết lập grid sinh phòng theo tầng phức tạp.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    Tiếp tục <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BASIC INFO & ADDRESS FORM */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-on-surface">2. Thông tin cơ bản & Địa điểm tài sản</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Vui lòng cung cấp các chi tiết tên thương hiệu và địa chỉ chính xác tại Đà Nẵng.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                  
                  {/* Property Name */}
                  <div className="col-span-2 space-y-1">
                    <label className="uppercase">Tên tài sản <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: RoomHub FPT House, Hải Châu Apartment..."
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                        errors.propertyName ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`}
                    />
                    {errors.propertyName && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">error</span>{errors.propertyName}</p>}
                  </div>

                  {/* Description */}
                  <div className="col-span-2 space-y-1">
                    <label className="uppercase">Mô tả ngắn (Tùy chọn)</label>
                    <textarea 
                      rows={3}
                      placeholder="Mô tả sơ lược về tòa nhà, tiện ích nổi bật hoặc đối tượng thuê phù hợp..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-semibold text-gray-700 bg-gray-50/50"
                    />
                  </div>

                  {/* Image upload field */}
                  <div className="col-span-2 space-y-1">
                    <label className="uppercase">Hình ảnh đại diện tài sản <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4 mt-1">
                      {imageUrl ? (
                        <div className="relative w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden shrink-0 group">
                          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setImageUrl('')}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      ) : (
                        <label 
                          htmlFor="thumbnail-upload" 
                          className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-container flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-primary-container bg-gray-50/50"
                        >
                          <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                          <span className="text-[10px] font-bold">Tải ảnh lên</span>
                        </label>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="thumbnail-upload" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                      <div className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                        {isUploadingImage ? (
                          <span className="text-primary-container font-bold flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full border-2 border-orange-100 border-t-primary-container animate-spin"></span>
                            Đang tải ảnh lên...
                          </span>
                        ) : (
                          <span>Chọn một ảnh đẹp đại diện cho tòa nhà/khu trọ của bạn (JPG, PNG, WEBP).</span>
                        )}
                      </div>
                    </div>
                    {errors.imageUrl && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.imageUrl}</p>}
                  </div>

                  {/* City (Disabled) */}
                  <div className="space-y-1">
                    <label className="uppercase">Tỉnh/Thành phố</label>
                    <input 
                      type="text" 
                      value="Đà Nẵng" 
                      disabled 
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-xs font-bold text-gray-400 outline-none"
                    />
                  </div>

                  {/* District selection */}
                  <div className="space-y-1">
                    <label className="uppercase">Quận/Huyện</label>
                    <select 
                      value={district}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setDistrict(dist);
                        setWard(DANANG_WARDS_MAP[dist]?.[0] || '');
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                    >
                      <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
                      <option value="Quận Hải Châu">Quận Hải Châu</option>
                      <option value="Quận Sơn Trà">Quận Sơn Trà</option>
                      <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
                      <option value="Quận Cẩm Lệ">Quận Cẩm Lệ</option>
                      <option value="Quận Thanh Khê">Quận Thanh Khê</option>
                      <option value="Huyện Hòa Vang">Huyện Hòa Vang</option>
                    </select>
                  </div>

                  {/* Ward */}
                  <div className="space-y-1">
                    <label className="uppercase">Phường/Xã <span className="text-red-500">*</span></label>
                    <select 
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                        errors.ward ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-white focus:border-primary-container'
                      }`}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {(DANANG_WARDS_MAP[district] || []).map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    {errors.ward && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.ward}</p>}
                  </div>

                  {/* Detail Address */}
                  <div className="space-y-1">
                    <label className="uppercase">Địa chỉ chi tiết (Số nhà, Tên đường) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Khu đô thị FPT, Nam Kỳ Khởi Nghĩa..."
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-semibold text-gray-700 ${
                        errors.detailAddress ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                      }`}
                    />
                    {errors.detailAddress && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">error</span>{errors.detailAddress}</p>}
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-1">
                    <label className="uppercase">Trạng thái ban đầu</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                    >
                      <option value="Đang hoạt động">Đang hoạt động</option>
                      <option value="Tạm ẩn">Tạm ẩn</option>
                      <option value="Đang bảo trì">Đang bảo trì</option>
                    </select>
                  </div>

                </div>

                {/* Live address preview block */}
                <div className="bg-orange-50/40 border border-orange-100 p-3.5 rounded-2xl flex items-start gap-2.5 mt-3">
                  <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">location_on</span>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Địa chỉ đầy đủ hiển thị</span>
                    <span className="text-xs font-bold text-gray-700 leading-normal">{fullDisplayAddress}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Quay lại
                  </button>
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    Tiếp tục <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DEFAULT RENTAL CONFIG FOR VACANT ROOMS */}
            {activeStep === 3 && (
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-on-surface">3. Cấu hình cho thuê phòng/căn mặc định</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Cài đặt mặc định được áp dụng hàng loạt khi sinh phòng tự động. Bạn vẫn có thể sửa riêng từng phòng sau.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-500">
                  
                  {/* Default Base Price */}
                  <div className="space-y-1">
                    <label className="uppercase">Giá thuê mặc định <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="50000"
                        value={basePrice}
                        onChange={(e) => setBasePrice(parseInt(e.target.value, 10))}
                        className={`w-full pl-3 pr-16 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                          errors.basePrice ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/tháng</span>
                    </div>
                    {errors.basePrice && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.basePrice}</p>}
                  </div>

                  {/* Area */}
                  <div className="space-y-1">
                    <label className="uppercase">Diện tích mặc định <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={defaultArea}
                        onChange={(e) => setDefaultArea(parseInt(e.target.value, 10))}
                        className={`w-full pl-3 pr-8 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                          errors.defaultArea ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">m²</span>
                    </div>
                    {errors.defaultArea && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.defaultArea}</p>}
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1">
                    <label className="uppercase">Số người tối đa <span className="text-red-500">*</span></label>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-primary-container overflow-hidden h-10 w-36">
                      <button 
                        type="button" 
                        onClick={() => setMaxPeople(prev => Math.max(1, prev - 1))}
                        className="w-10 h-full hover:bg-orange-50 text-gray-500 hover:text-primary-container font-black text-sm border-r border-gray-150 transition-colors select-none cursor-pointer flex items-center justify-center"
                      >
                        —
                      </button>
                      <input 
                        type="number" 
                        value={maxPeople}
                        onChange={(e) => setMaxPeople(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="flex-grow w-full text-center bg-transparent text-xs font-bold text-gray-700 focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setMaxPeople(prev => prev + 1)}
                        className="w-10 h-full hover:bg-orange-50 text-gray-500 hover:text-primary-container font-black text-sm border-l border-gray-150 transition-colors select-none cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    {errors.maxPeople && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.maxPeople}</p>}
                  </div>

                </div>

                <div className="flex justify-between pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Quay lại
                  </button>
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    Tiếp tục <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: AUTO ROOM GENERATION CONFIG (Only for buildings) */}
            {activeStep === 4 && (
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-on-surface">4. Thiết lập sinh phòng tự động hàng loạt</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Cấu hình quy mô tòa nhà. Lưới sơ đồ phòng tương ứng sẽ tự động hiển thị ở bảng xem trước cột bên phải.</p>
                </div>

                {selectedType === 'independent' ? (
                  <div className="bg-orange-50/50 border border-orange-100/50 p-6 rounded-2xl text-center space-y-2">
                    <span className="material-symbols-outlined text-primary-container text-[36px]">house</span>
                    <h4 className="text-xs font-bold text-on-surface">Căn hộ độc lập được thiết lập tự động</h4>
                    <p className="text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Vì bạn đã chọn loại hình **Căn hộ độc lập**, hệ thống sẽ tự động tạo duy nhất 1 mã căn hộ lẻ mà không yêu cầu cấu hình sinh nhiều phòng/tầng trọ.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                      
                      {/* Floors */}
                      <div className="space-y-1">
                        <label className="uppercase">Số tầng tòa nhà <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          min="1"
                          max="30"
                          value={numFloors}
                          onChange={(e) => handleNumFloorsChange(parseInt(e.target.value, 10))}
                          className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:bg-white text-xs font-bold text-gray-700 ${
                            errors.numFloors ? 'border-red-500 bg-red-50/10 focus:border-red-500' : 'border-gray-200 bg-gray-50/50 focus:border-primary-container'
                          }`}
                        />
                        {errors.numFloors && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.numFloors}</p>}
                      </div>

                      {/* Numbering rule */}
                      <div className="space-y-1">
                        <label className="uppercase">Quy tắc đánh số phòng</label>
                        <select 
                          value={numberingRule}
                          onChange={(e) => setNumberingRule(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                        >
                          <option value="standard">Theo tầng + số thứ tự (ví dụ: 101, 201...)</option>
                          <option value="prefix">Tiền tố tùy chỉnh (ví dụ: A101, B101...)</option>
                          <option value="manual">Tự nhập / Sửa đổi sau</option>
                        </select>
                      </div>

                      {/* Custom rooms per floor grid */}
                      <div className="col-span-2 space-y-2 border border-gray-150 p-4 rounded-2xl bg-gray-50/50 mt-1">
                        <label className="uppercase block text-xs font-black text-gray-500">Cấu hình số phòng cụ thể cho từng tầng</label>
                        <p className="text-[10px] text-gray-400 font-semibold mb-2">Bạn có thể thay đổi số lượng phòng của riêng từng tầng để khớp với thiết kế thực tế.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
                          {Array.from({ length: numFloors }).map((_, idx) => {
                            const floorNum = numFloors - idx;
                            const floorIndex = floorNum - 1;
                            const currentCount = roomsCountPerFloor[floorIndex] || 5;

                            return (
                              <div key={floorIndex} className="p-2.5 bg-white border border-gray-150 rounded-xl flex items-center justify-between gap-1.5 shadow-sm">
                                <span className="text-[10px] font-black text-gray-600 shrink-0">Tầng {floorNum}</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="50"
                                  value={currentCount}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 1;
                                    setRoomsCountPerFloor(prev => {
                                      const next = [...prev];
                                      next[floorIndex] = Math.min(50, Math.max(1, val));
                                      return next;
                                    });
                                  }}
                                  className="w-12 text-center py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-primary-container bg-white"
                                />
                              </div>
                            );
                          })}
                        </div>
                        {errors.roomsCount && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.roomsCount}</p>}
                      </div>

                      {/* Prefix (conditional) */}
                      {numberingRule === 'prefix' && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="uppercase">Tiền tố chữ</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: A, B, FPT"
                            value={prefixText}
                            onChange={(e) => setPrefixText(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50"
                          />
                        </div>
                      )}

                      {/* Start room number index */}
                      <div className="space-y-1">
                        <label className="uppercase">Bắt đầu từ số thứ tự</label>
                        <input 
                          type="number" 
                          value={startNum}
                          onChange={(e) => setStartNum(parseInt(e.target.value, 10))}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    {/* Summary box */}
                    <div className="bg-orange-50/30 border border-orange-100/50 p-4 rounded-2xl text-xs leading-normal">
                      <div className="flex justify-between items-center font-black mb-1">
                        <span className="text-gray-500">Tóm tắt số lượng:</span>
                        <span className="text-primary-container">{numFloors} tầng · Tổng cộng {totalRoomsToCreate} phòng cho thuê</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        Toàn bộ {totalRoomsToCreate} phòng sau khi sinh tự động sẽ được gán ở trạng thái **"Còn trống"** (Vacant), cài đặt các chi phí mặc định của chủ nhà.
                      </p>
                      
                      {/* Warning flag if excessive number of rooms */}
                      {totalRoomsToCreate > 60 && (
                        <div className="bg-red-50 text-red-600 border border-red-150 p-2.5 rounded-xl flex items-center gap-1.5 mt-3 animate-pulse">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          <span className="text-[9px] font-black uppercase">Quy mô quá lớn! Hãy kiểm tra kỹ trước khi bấm lưu.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Quay lại
                  </button>
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    Tiếp tục <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: DEFAULT BILLS CONFIG & REVIEW SUMIT */}
            {activeStep === 5 && (
              <div className="space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-on-surface">5. Đơn giá dịch vụ & Hoàn tất</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Nhập biểu giá điện nước mặc định để áp dụng lập hóa đơn trọn đời. Bạn có thể sửa sau trong phần cấu hình.</p>
                </div>

                {/* Utilities fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold text-gray-500">
                  
                  {/* Electric */}
                  <div className="space-y-1">
                    <label className="uppercase">Giá điện mặc định</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={elecPrice}
                        onChange={(e) => setElecPrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/kWh</span>
                    </div>
                  </div>

                  {/* Water Billing Type */}
                  <div className="space-y-1">
                    <label className="uppercase">Hình thức tính nước</label>
                    <select 
                      value={waterBillingType}
                      onChange={(e) => setWaterBillingType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-white"
                    >
                      <option value="PerCubicMeter">Theo mét khối (đ/m³)</option>
                      <option value="PerPerson">Theo đầu người (đ/người)</option>
                    </select>
                  </div>

                  {/* Water */}
                  <div className="space-y-1">
                    <label className="uppercase">Giá nước mặc định</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={waterPrice}
                        onChange={(e) => setWaterPrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        {waterBillingType === 'PerCubicMeter' ? 'đ/m³' : 'đ/người'}
                      </span>
                    </div>
                  </div>

                  {/* Internet */}
                  <div className="space-y-1">
                    <label className="uppercase">Phí Internet/Wifi</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={netPrice}
                        onChange={(e) => setNetPrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/phòng</span>
                    </div>
                  </div>

                  {/* Garbage */}
                  <div className="space-y-1">
                    <label className="uppercase">Phí thu gom rác</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={garbagePrice}
                        onChange={(e) => setGarbagePrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/phòng</span>
                    </div>
                  </div>

                  {/* Parking */}
                  <div className="space-y-1">
                    <label className="uppercase">Phí gửi xe</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={parkingPrice}
                        onChange={(e) => setParkingPrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/xe/tháng</span>
                    </div>
                  </div>

                  {/* Service fee */}
                  <div className="space-y-1">
                    <label className="uppercase">Phí quản lý chung</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={servicePrice}
                        onChange={(e) => setServicePrice(parseInt(e.target.value, 10))}
                        className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-container text-xs font-bold text-gray-700 bg-gray-50/50" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ/phòng</span>
                    </div>
                  </div>

                </div>

                {/* Final summary list review */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs leading-normal space-y-2 mt-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block pb-1 border-b border-gray-200">Kiểm tra thông tin trước khi hoàn tất</span>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-gray-600 font-semibold">
                    <div className="flex justify-between pr-4">
                      <span>Tên tài sản:</span>
                      <span className="text-on-surface font-bold">{propertyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại hình:</span>
                      <span className="text-on-surface font-bold">
                        {selectedType === 'building' ? 'Tòa nhà nhiều phòng' : selectedType === 'studio' ? 'Tòa nhà Studio' : selectedType === 'mini-apartment' ? 'Tòa nhà Căn hộ mini' : 'Căn hộ lẻ'}
                      </span>
                    </div>
                    <div className="flex justify-between pr-4">
                      <span>Địa điểm:</span>
                      <span className="text-on-surface font-bold truncate max-w-[150px]">{district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng phòng sẽ sinh:</span>
                      <span className="text-primary-container font-black">{totalRoomsToCreate} phòng trống</span>
                    </div>
                    <div className="flex justify-between pr-4">
                      <span>Giá thuê áp:</span>
                      <span className="text-on-surface font-bold">{formatPrice(basePrice)}/tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái ban đầu:</span>
                      <span className="text-green-600 font-bold">{status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Quay lại
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px] font-bold">check</span> Tạo tài sản ngay
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>

        {/* Right Column: Dynamic Live Grid Preview (Sticky panel) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-gray-100 soft-shadow sticky top-24 space-y-5 min-h-[360px] max-h-[calc(100vh-140px)] overflow-y-auto">
          
          <div>
            <h3 className="text-xs font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-primary-container text-[18px]">visibility</span>
              Xem trước sơ đồ phòng trống
            </h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Sơ đồ Grid tầng dự kiến tạo hàng loạt dựa trên thông số cấu hình bên trái.</p>
          </div>

          {selectedType === 'independent' ? (
            /* Single unit preview card */
            <div className="bg-orange-50/30 border border-orange-100 p-4 rounded-2xl space-y-4 animate-scaleUp">
              <div className="flex justify-between items-center border-b border-orange-150 pb-2">
                <span className="text-[11px] font-black text-on-surface">Căn hộ đơn lẻ</span>
                <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded">Còn trống</span>
              </div>
              <div className="space-y-2 text-[10px] text-gray-600 font-semibold">
                <div className="flex justify-between">
                  <span>Mã căn hộ:</span>
                  <span className="text-on-surface font-black">{propertyName || 'Chưa đặt tên'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loại hình:</span>
                  <span className="text-on-surface font-bold">Căn hộ độc lập</span>
                </div>
                <div className="flex justify-between">
                  <span>Định lượng diện tích:</span>
                  <span className="text-on-surface font-bold">{defaultArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Sức chứa trần:</span>
                  <span className="text-on-surface font-bold">{maxPeople} người</span>
                </div>
                <div className="flex justify-between border-t border-orange-150 pt-2 font-black">
                  <span>Giá cho thuê trần:</span>
                  <span className="text-primary-container">{formatPrice(basePrice)}/tháng</span>
                </div>
              </div>
            </div>
          ) : (
            /* Floor-grouped live grid view */
            <div className="space-y-4">
              {generatedPreviewRooms.length === 0 ? (
                <div className="bg-gray-50 border border-gray-150 p-8 rounded-2xl text-center flex flex-col items-center justify-center space-y-2">
                  <span className="material-symbols-outlined text-gray-400 text-[32px]">view_module</span>
                  <p className="text-[10px] font-bold text-gray-400 leading-normal max-w-[150px] mx-auto">
                    Vui lòng nhập số tầng và số phòng mỗi tầng hợp lệ để hiển thị sơ đồ lưới xem trước.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Group room preview indices floor-wise */}
                  {Array.from(new Set(generatedPreviewRooms.map(r => r.floor))).sort((a, b) => b - a).map((fl) => (
                    <div key={fl} className="flex items-center gap-2 pb-2.5 border-b border-gray-50 last:border-b-0 last:pb-0">
                      {/* Floor label */}
                      <span className="w-12 font-black text-[10px] text-gray-700 bg-orange-50 border border-orange-100 py-1 rounded-lg text-center shrink-0">
                        Tầng {fl}
                      </span>
                      
                      {/* Floor rooms row */}
                      <div className="flex-grow grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {generatedPreviewRooms.filter(r => r.floor === fl).map((room, idx) => {
                          const isCustomized = !!customRooms[room.id];
                          const isSelected = selectedRoomForEdit === room.id;
                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedRoomForEdit(room.id)}
                              className={`p-1.5 text-[10px] font-black rounded-lg text-center truncate cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow'
                                  : isCustomized
                                  ? 'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100'
                                  : 'bg-green-50/70 border border-green-200 text-green-800 hover:bg-green-100'
                              }`}
                              title={`Phòng ${room.id} - ${isCustomized ? 'Đã tùy chỉnh' : 'Sẵn sàng'} (Bấm để thiết lập riêng)`}
                            >
                              <div className="flex items-center justify-center gap-0.5">
                                {room.id}
                                {isCustomized && (
                                  <span className="material-symbols-outlined text-[10px] text-amber-600 font-bold">settings</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Grid legends */}
                  <div className="flex gap-2 text-[9px] font-bold text-gray-400 pt-2 border-t border-gray-100 justify-end flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Còn trống
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> Đã tùy chỉnh
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span> Đã thuê
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Room Editor Panel */}
          {selectedRoomForEdit && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3 animate-scaleUp text-xs mt-4">
              <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                <span className="font-black text-amber-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">edit_note</span>
                  Tùy chỉnh phòng {selectedRoomForEdit}
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedRoomForEdit(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold hover:underline"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-3 font-bold text-gray-600">
                {/* Custom Price */}
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-gray-500 tracking-wider">Giá thuê riêng (đ/tháng)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder={`Mặc định: ${basePrice.toLocaleString('vi-VN')}đ`}
                      value={customRooms[selectedRoomForEdit]?.price ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        handleUpdateCustomRoom(selectedRoomForEdit, 'price', val);
                      }}
                      className="w-full pl-3 pr-16 py-2 border border-amber-200 focus:border-amber-400 rounded-xl text-xs font-semibold bg-white text-gray-700 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">đ</span>
                  </div>
                </div>

                {/* Custom Area */}
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-gray-500 tracking-wider">Diện tích riêng (m²)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder={`Mặc định: ${defaultArea} m²`}
                      value={customRooms[selectedRoomForEdit]?.area ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        handleUpdateCustomRoom(selectedRoomForEdit, 'area', val);
                      }}
                      className="w-full pl-3 pr-12 py-2 border border-amber-200 focus:border-amber-400 rounded-xl text-xs font-semibold bg-white text-gray-700 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">m²</span>
                  </div>
                </div>

                {/* Custom Max People */}
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-gray-500 tracking-wider">Số người tối đa riêng</label>
                  <input 
                    type="number"
                    placeholder={`Mặc định: ${maxPeople} người`}
                    value={customRooms[selectedRoomForEdit]?.maxPeople ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      handleUpdateCustomRoom(selectedRoomForEdit, 'maxPeople', val);
                    }}
                    className="w-full px-3 py-2 border border-amber-200 focus:border-amber-400 rounded-xl text-xs font-semibold bg-white text-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => {
                    setCustomRooms(prev => {
                      const next = { ...prev };
                      delete next[selectedRoomForEdit];
                      return next;
                    });
                    setSelectedRoomForEdit(null);
                  }}
                  className="text-[10px] text-red-600 hover:underline font-bold"
                >
                  Xóa tùy chỉnh
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoomForEdit(null)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SUBMISSION LOADING OVERLAY SPINNER (High premium look!) */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center z-[2000] p-4 text-center animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 soft-shadow max-w-sm flex flex-col items-center justify-center space-y-4 animate-scaleUp">
            
            {/* Custom Spinner */}
            <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-primary-container animate-spin"></div>
            
            <h3 className="text-sm font-bold text-on-surface pt-2">Đang xử lý tạo tài sản mới</h3>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed animate-pulse">{submissionMessage}</p>
            
            <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-xl w-full">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">Tiến độ thiết lập</span>
              <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Sinh tự động sơ đồ bản đồ {totalRoomsToCreate} phòng cho thuê.</span>
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

export default PropertyCreate;
