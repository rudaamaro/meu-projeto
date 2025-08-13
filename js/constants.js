// ATENÇÃO: não importar nada de constants.js dentro de main.js para evitar loop.
import { IS_MOBILE } from './main.js';
export { IS_MOBILE };

export const MOBILE_WIDTH_HINT = 768; // usado no layout

export const C = { card:'#121826',accent:'#43b6ff',accent2:'#7cffad',text:'#e7eef7',sub:'#9fb3c8',danger:'#ff6b6b',warn:'#ffd166',stroke:'rgba(255,255,255,0.08)' };

export const SIZES = {
  // Estudo/Treino
  hiraganaStudyFactor: 0.115,
  hiraganaStudyMin:    22,

  // Quiz
  hiraganaQuizPx:      16,
  hiraganaQuizOffset:   4,

  // Lista
  hiraganaManagePx:    11,

  // Header
  headerPadY:          10,
  headerHeight:        42,
  fabReserveW:         64,
};
