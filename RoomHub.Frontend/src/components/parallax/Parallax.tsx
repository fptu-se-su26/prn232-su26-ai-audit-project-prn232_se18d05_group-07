import React from 'react';
import { useParallax, useReveal } from '../../hooks/useParallax';

/**
 * Reveal — bọc nội dung để áp hiệu ứng xuất hiện khi cuộn tới (fade + trượt lên).
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxLayer — lớp di chuyển theo tốc độ cuộn, tạo chiều sâu cho trang.
 */
export const ParallaxLayer: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.2, className = '' }) => {
  const ref = useParallax<HTMLDivElement>(speed);
  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

/**
 * ParallaxHero — khối hero với ảnh nền cuộn parallax + lớp phủ gradient + nội dung.
 * Dùng làm đầu trang cho các khu vực Tenant/Admin để tạo cảm giác chuyên nghiệp.
 */
export const ParallaxHero: React.FC<{
  image: string;
  children: React.ReactNode;
  className?: string;
  heightClass?: string;
  overlayClass?: string;
}> = ({
  image,
  children,
  className = '',
  heightClass = 'min-h-[260px]',
  overlayClass = 'bg-gradient-to-r from-on-surface/85 via-on-surface/70 to-primary/40',
}) => {
  const bgRef = useParallax<HTMLDivElement>(0.25);
  return (
    <div className={`relative overflow-hidden rounded-3xl ${heightClass} ${className}`}>
      {/* Lớp ảnh nền parallax (cao hơn khung để có khoảng dịch chuyển) */}
      <div
        ref={bgRef}
        className="absolute -inset-x-0 -top-16 -bottom-16 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
      {/* Đốm sáng trang trí nổi nhẹ */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl animate-floaty pointer-events-none" />
      <div className="absolute -left-10 -bottom-12 w-56 h-56 bg-orange-300/20 rounded-full blur-3xl animate-floaty-slow pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
