export let cvs, ctx, mobileInput;
export const IS_MOBILE =
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

import { State } from './state.js';
import { render } from './render.js';
import { keydownHandler, mousemoveHandler, mousedownHandler, mouseupHandler } from './input-handlers.js';

function fitCanvas(){
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.floor(window.innerWidth), h = Math.floor(window.innerHeight);
  cvs.width = w * dpr; cvs.height = h * dpr;
  cvs.style.width = w + 'px'; cvs.style.height = h + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function placeMobileInputOverRect(rect){
  if(!mobileInput) return;
  const r = cvs.getBoundingClientRect();
  mobileInput.style.left = Math.round(r.left + rect.x) + 'px';
  mobileInput.style.top  = Math.round(r.top  + rect.y) + 'px';
  mobileInput.style.width  = Math.max(40, Math.floor(rect.w)) + 'px';
  mobileInput.style.height = Math.max(28, Math.floor(rect.h)) + 'px';
}

export function hideMobileInput(){
  if(!mobileInput) return;
  mobileInput.blur();
  mobileInput.style.left = '-9999px';
  mobileInput.style.top  = '-9999px';
}

export function syncMobileInput(rectOrNull){
  if (!IS_MOBILE || !mobileInput) return;
  if (rectOrNull) placeMobileInputOverRect(rectOrNull);
  else hideMobileInput();
}

window.addEventListener('DOMContentLoaded', () => {
  cvs = document.getElementById('app');
  ctx = cvs.getContext('2d');
  mobileInput = document.getElementById('mobileInput');

  window.addEventListener('resize', fitCanvas); fitCanvas();
  window.addEventListener('keydown', keydownHandler);
  cvs.addEventListener('mousemove', mousemoveHandler);
  cvs.addEventListener('mousedown', mousedownHandler);
  window.addEventListener('mouseup', mouseupHandler);

  if (IS_MOBILE && mobileInput) {
    mobileInput.value = State.input || '';
    mobileInput.addEventListener('input', () => {
      State.input = mobileInput.value;
      if (State.mode === 'add' && State.focusField) {
        State.addForm[State.focusField] = mobileInput.value;
      }
    });
    mobileInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); }
    }, { passive:false });
  }

  requestAnimationFrame(render);

  const params = new URLSearchParams(location.search);
  if (params.has('test')) {
    import('./tests-smoke.js').catch(console.error);
  }
});
