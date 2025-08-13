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

export let cvs = document.getElementById('app'), ctx = cvs.getContext('2d');

/* --------- canvas DPR --------- */
function fitCanvas(){
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.floor(window.innerWidth), h = Math.floor(window.innerHeight);
  cvs.width = w * dpr; cvs.height = h * dpr;
  cvs.style.width = w+'px'; cvs.style.height = h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

/* --------- MOBILE INPUT --------- */
const mobileInput = document.getElementById('mobileInput');
let currentInputRect = null;  // {x,y,w,h} em CSS pixels

function applyMobileInputRect(rect){
  currentInputRect = rect;
  if(!rect){
    mobileInput.blur();
    mobileInput.style.left = '-9999px';
    return;
  }
  mobileInput.style.left = rect.x + 'px';
  mobileInput.style.top  = rect.y + 'px';
  mobileInput.style.width  = Math.max(1, rect.w) + 'px';
  mobileInput.style.height = Math.max(34, rect.h) + 'px'; // touch target amigável
}

// usado pelo render.js para informar o retângulo do campo
export function setMobileInputRect(rect){
  applyMobileInputRect(rect);
}

// (Opcional) sincronizar texto “ao vivo” com o state:
// -> Se decidir, importe State e faça: State.input = mobileInput.value;
// Mantemos vazio para não interferir na sua lógica atual.
mobileInput.addEventListener('input', () => {});

/* --------- TOUCH → MOUSE MAP --------- */
function firstTouch(e){ return e.touches?.[0] ?? e.changedTouches?.[0]; }
function toCanvasPoint(t){
  const rect = cvs.getBoundingClientRect();
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

function maybeFocusMobileInput(clientX, clientY){
  if(!currentInputRect) return;
  const r = currentInputRect;
  if (clientX >= r.x && clientX <= r.x + r.w &&
      clientY >= r.y && clientY <= r.y + r.h) {
    setTimeout(()=> mobileInput?.focus(), 0);
  }
}

cvs.addEventListener('touchstart', (e)=>{
  const t = firstTouch(e); if(!t) return;
  maybeFocusMobileInput(t.clientX, t.clientY);
  const p = toCanvasPoint(t);
  e.preventDefault();
  mousedownHandler({ clientX:p.x, clientY:p.y, preventDefault(){}, stopPropagation(){} });
},{passive:false});

cvs.addEventListener('touchmove', (e)=>{
  const t = firstTouch(e); if(!t) return;
  const p = toCanvasPoint(t);
  e.preventDefault();
  mousemoveHandler({ clientX:p.x, clientY:p.y, preventDefault(){}, stopPropagation(){} });
},{passive:false});

cvs.addEventListener('touchend', (e)=>{
  const t = firstTouch(e); if(!t) return;
  const p = toCanvasPoint(t);
  e.preventDefault();
  mouseupHandler({ clientX:p.x, clientY:p.y, preventDefault(){}, stopPropagation(){} });
},{passive:false});

/* --------- STARTUP --------- */
window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('resize', fitCanvas); fitCanvas();

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
