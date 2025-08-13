export const C={card:'#121826',accent:'#43b6ff',accent2:'#7cffad',text:'#e7eef7',sub:'#9fb3c8',danger:'#ff6b6b',warn:'#ffd166',stroke:'rgba(255,255,255,0.08)'};

export const SIZES={
  hiraganaStudyFactor:0.13,
  hiraganaStudyMin:28,
  hiraganaQuizPx:24,
  hiraganaQuizOffset:40,
  hiraganaManagePx:12
};

export const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Ajustes suaves para fontes/espacamentos no mobile
if (typeof SIZES !== 'undefined') {
  SIZES.hiraganaStudyFactor = IS_MOBILE ? 0.11 : (SIZES.hiraganaStudyFactor ?? 0.13);
  SIZES.hiraganaStudyMin    = IS_MOBILE ? 24   : (SIZES.hiraganaStudyMin ?? 28);
  SIZES.hiraganaQuizPx      = IS_MOBILE ? 16   : (SIZES.hiraganaQuizPx ?? 18);
  SIZES.hiraganaManagePx    = IS_MOBILE ? 11   : (SIZES.hiraganaManagePx ?? 12);
  SIZES.hiraganaQuizOffset  = IS_MOBILE ? 2    : (SIZES.hiraganaQuizOffset ?? 6);
}
