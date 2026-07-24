/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Maps Embed API key (dùng cho bản đồ vị trí phòng). Để trống sẽ hiện ảnh mockup fallback. */
  readonly VITE_GOOGLE_MAPS_EMBED_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
