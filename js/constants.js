import { IS_MOBILE } from './main.js';

export const C = { card:'#121826',accent:'#43b6ff',accent2:'#7cffad',text:'#e7eef7',sub:'#9fb3c8',danger:'#ff6b6b',warn:'#ffd166',stroke:'rgba(255,255,255,0.08)' };

export const SIZES = {
  // estudo/treino
  hiraganaStudyFactor: IS_MOBILE ? 0.10 : 0.13,
  hiraganaStudyMin:    IS_MOBILE ? 22   : 28,

  // quiz
  hiraganaQuizPx:      IS_MOBILE ? 16   : 18,
  hiraganaQuizOffset:  IS_MOBILE ? 2    : 6,

  // tabela "Lista"
  hiraganaManagePx:    IS_MOBILE ? 11   : 12,

  topBtnW:             IS_MOBILE ? 84   : 112,
  topBtnH:             IS_MOBILE ? 34   : 36,
};
