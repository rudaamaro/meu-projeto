// main.js
import './utils.js';
import { SIZES } from './constants.js';
import './date-utils.js';
import './storage.js';
import './srs.js';
import './state.js';
import './quiz.js';
import './speech.js';
import './layout.js';
import { render } from './render.js';
import { keydownHandler, mousemoveHandler, mousedownHandler, mouseupHandler } from './input-handlers.js';

export let cvs, ctx;

function fitCanvas() {
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.floor(window.innerWidth), h = Math.floor(window.innerHeight);
  cvs.width = w * dpr; cvs.height = h * dpr;
  cvs.style.width = w + 'px'; cvs.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const scale = Math.min(w / 800, h / 600);
  SIZES.hiraganaQuizPx = Math.max(20, Math.floor(24 * scale));
  SIZES.hiraganaQuizOffset = Math.floor(40 * scale);
  SIZES.hiraganaManagePx = Math.max(10, Math.floor(12 * scale));
}

window.addEventListener('DOMContentLoaded', () => {
  cvs = document.getElementById('app');
  ctx = cvs.getContext('2d');

  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  window.addEventListener('keydown', keydownHandler);
  cvs.addEventListener('mousemove', mousemoveHandler);
  cvs.addEventListener('mousedown', mousedownHandler);
  window.addEventListener('mouseup', mouseupHandler);

  cvs.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    mousemoveHandler(t);
    mousedownHandler();
    e.preventDefault();
  }, { passive: false });
  cvs.addEventListener('touchmove', (e) => {
    const t = e.changedTouches[0];
    mousemoveHandler(t);
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', (e) => {
    mouseupHandler();
    e.preventDefault();
  }, { passive: false });

  requestAnimationFrame(render);

  // ✅ Só carregue os testes DEPOIS de cvs/ctx existirem, e apenas se ?test estiver na URL
  const params = new URLSearchParams(location.search);
  if (params.has('test')) {
    import('./tests-smoke.js').catch(console.error);
  }
});
