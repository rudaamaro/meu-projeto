// input-handlers.js (trecho do touch p/ mobile)

import { IS_MOBILE, mobileInput } from './main.js';
import { State } from './state.js';
import { syncMobileInput } from './main.js';

function onTouchStart(e) {
  if (!IS_MOBILE) return;
  if (!State.lastInputRect) return;

  const el = document.getElementById('app'); // canvas
  if (!el) return;

  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;

  const r = el.getBoundingClientRect();
  const x = t.clientX - r.left;
  const y = t.clientY - r.top;

  const { x: ix, y: iy, w: iw, h: ih } = State.lastInputRect;
  const inside = x >= ix && x <= ix + iw && y >= iy && y <= iy + ih;

  if (inside && mobileInput) {
    e.preventDefault();         // evita zoom / seleção no iOS
    mobileInput.focus();
    const v = mobileInput.value || '';
    try { mobileInput.setSelectionRange(v.length, v.length); } catch {}
    syncMobileInput(State.lastInputRect); // garante posição/foco
  }
}

function setupMobileTouch() {
  const el = document.getElementById('app');
  if (!el) return;
  // remove possível duplicado e adiciona de novo com passive:false
  el.removeEventListener('touchstart', onTouchStart);
  el.addEventListener('touchstart', onTouchStart, { passive: false });
}

// registra assim que der (antes ou depois do DOM pronto)
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', setupMobileTouch);
  } else {
    setupMobileTouch();
  }
}
