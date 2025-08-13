export const IS_MOBILE =
  (typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ||
  (typeof window !== 'undefined' && window.innerWidth < 768);
