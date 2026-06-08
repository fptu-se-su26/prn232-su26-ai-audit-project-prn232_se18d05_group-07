export const LISTING_RULES = {
  MIN_PRICE: 500_000,
  MAX_PRICE: 100_000_000,
  MIN_AREA: 5,
  MAX_AREA: 500,
  MIN_TITLE_LENGTH: 10,
  MIN_DESCRIPTION_LENGTH: 20,
} as const;

const PHONE_PATTERN = /(?:0|\+84)[\s.\-]?[3-9]\d[\s.\-]?\d{3}[\s.\-]?\d{3,4}/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const URL_PATTERN = /https?:\/\/|www\.|zalo\.me|facebook\.com|fb\.com|tiktok\.com|instagram\.com|t\.me\//i;

export interface ListingFieldErrors {
  title?: string;
  description?: string;
  rentPrice?: string;
  area?: string;
  images?: string;
  property?: string;
  unit?: string;
}

export function validateContentHeuristics(title: string, description: string): ListingFieldErrors {
  const errors: ListingFieldErrors = {};
  const combined = `${title} ${description}`;

  if (PHONE_PATTERN.test(combined)) {
    errors.description =
      'Không được để số điện thoại trong tiêu đề hoặc mô tả. Người thuê sẽ liên hệ qua hệ thống.';
  } else if (EMAIL_PATTERN.test(combined)) {
    errors.description = 'Không được để email liên hệ trong nội dung tin đăng.';
  } else if (URL_PATTERN.test(combined)) {
    errors.description =
      'Không được để link mạng xã hội hoặc website trong nội dung tin đăng.';
  }

  return errors;
}

export function validateListingStep2(
  title: string,
  description: string,
  rentPrice: number,
  area: number
): ListingFieldErrors {
  const errors: ListingFieldErrors = {};

  if (!title.trim()) {
    errors.title = 'Tiêu đề tin đăng không được để trống.';
  } else if (title.trim().length < LISTING_RULES.MIN_TITLE_LENGTH) {
    errors.title = `Tiêu đề cần ít nhất ${LISTING_RULES.MIN_TITLE_LENGTH} ký tự.`;
  }

  if (!description.trim()) {
    errors.description = 'Mô tả chi tiết không được để trống.';
  } else if (description.trim().length < LISTING_RULES.MIN_DESCRIPTION_LENGTH) {
    errors.description = `Mô tả cần ít nhất ${LISTING_RULES.MIN_DESCRIPTION_LENGTH} ký tự.`;
  }

  if (rentPrice <= 0) {
    errors.rentPrice = 'Đơn giá thuê phải lớn hơn 0.';
  } else if (rentPrice < LISTING_RULES.MIN_PRICE) {
    errors.rentPrice = `Giá thuê ${rentPrice.toLocaleString('vi-VN')}đ/tháng không hợp lệ. Tối thiểu ${LISTING_RULES.MIN_PRICE.toLocaleString('vi-VN')}đ/tháng.`;
  } else if (rentPrice > LISTING_RULES.MAX_PRICE) {
    errors.rentPrice = `Giá thuê ${rentPrice.toLocaleString('vi-VN')}đ/tháng quá cao, cần xác minh.`;
  }

  if (area <= 0) {
    errors.area = 'Diện tích phòng phải lớn hơn 0.';
  } else if (area < LISTING_RULES.MIN_AREA || area > LISTING_RULES.MAX_AREA) {
    errors.area = `Diện tích phải từ ${LISTING_RULES.MIN_AREA}–${LISTING_RULES.MAX_AREA} m².`;
  }

  const heuristicErrors = validateContentHeuristics(title, description);
  if (heuristicErrors.description && !errors.description) {
    errors.description = heuristicErrors.description;
  }

  return errors;
}

export function getStep2Checklist(
  title: string,
  description: string,
  rentPrice: number,
  area: number
) {
  const combined = `${title} ${description}`;
  const contentPolicyOk =
    !PHONE_PATTERN.test(combined) &&
    !EMAIL_PATTERN.test(combined) &&
    !URL_PATTERN.test(combined);

  return [
    { id: 'title', label: 'Tiêu đề đủ chi tiết', passed: title.trim().length >= LISTING_RULES.MIN_TITLE_LENGTH },
    { id: 'description', label: 'Mô tả đủ thông tin', passed: description.trim().length >= LISTING_RULES.MIN_DESCRIPTION_LENGTH },
    { id: 'price', label: 'Giá thuê hợp lý', passed: rentPrice >= LISTING_RULES.MIN_PRICE && rentPrice <= LISTING_RULES.MAX_PRICE },
    { id: 'area', label: 'Diện tích hợp lệ', passed: area >= LISTING_RULES.MIN_AREA && area <= LISTING_RULES.MAX_AREA },
    { id: 'content', label: 'Không chứa SĐT / link liên hệ', passed: contentPolicyOk },
  ];
}
