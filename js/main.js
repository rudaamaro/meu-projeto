// main.js
import './utils.js';
import './constants.js';
import './date-utils.js';
import './storage.js';
import './srs.js';
import './state.js';
import './quiz.js';
import './speech.js';
import './canvas-helpers.js';
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

  requestAnimationFrame(render);

  // ✅ Só carregue os testes DEPOIS de cvs/ctx existirem, e apenas se ?test estiver na URL
  const params = new URLSearchParams(location.search);
  if (params.has('test')) {
    import('./tests-smoke.js').catch(console.error);
  }
});
