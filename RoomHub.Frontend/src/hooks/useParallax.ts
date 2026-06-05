import { useEffect, useRef, useState } from 'react';

/**
 * useParallax — dịch chuyển phần tử theo tiến trình cuộn trang để tạo hiệu ứng
 * chiều sâu (parallax). Trả về ref để gắn vào phần tử cần áp hiệu ứng.
 *
 * @param speed Hệ số tốc độ. Dương -> di chuyển ngược chiều cuộn (lớp nền chậm hơn),
 *              giá trị khuyến nghị 0.05 - 0.4.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tôn trọng tuỳ chọn giảm chuyển động của người dùng (accessibility).
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const center = rect.top + rect.height / 2;
      // progress: 0 khi phần tử ở giữa màn hình, âm/dương khi lệch trên/dưới.
      const progress = (center - viewportH / 2) / viewportH;
      const offset = -progress * speed * 100;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}

/**
 * useReveal — phát hiện phần tử lọt vào khung nhìn để kích hoạt hiệu ứng xuất hiện
 * (fade + trượt lên). Dùng IntersectionObserver nên hiệu năng tốt.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const once = options?.once ?? true;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [options?.threshold, options?.once]);

  return { ref, visible };
}
